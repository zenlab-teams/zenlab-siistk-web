<?php

namespace App\Http\Controllers;

use App\Http\Requests\Chat\SendMessageRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Stock;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatBotController extends Controller
{
    public function __invoke(SendMessageRequest $request): JsonResponse
    {
        set_time_limit(180);

        $validated = $request->validated();
        $message = $validated['message'];
        $history = collect($validated['history'] ?? [])
            ->filter(fn (array $item) => isset($item['role'], $item['text']))
            ->map(fn (array $item) => [
                'role' => $item['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => (string) $item['text'],
            ])
            ->values()
            ->all();

        $baseUrl = config('services.deepseek.base_url');
        $apiKey = config('services.deepseek.api_key');
        $model = config('services.deepseek.model');
        $analyticsReply = $this->handleAnalyticsIntent($message);

        if ($analyticsReply !== null) {
            return response()->json(['reply' => $analyticsReply]);
        }

        $crudReply = $this->handleCrudIntent($message);

        if ($crudReply !== null) {
            return response()->json(['reply' => $crudReply]);
        }

        $ragContext = $this->ragContext($message);
        $databaseContext = $this->databaseContext($message);
        $fallbackReply = $this->fallbackReply($message, $databaseContext, $ragContext);

        if (empty($baseUrl) || empty($apiKey) || empty($model)) {
            Log::error('ChatBot config missing', [
                'has_base_url' => filled($baseUrl),
                'has_api_key' => filled($apiKey),
                'has_model' => filled($model),
            ]);

            return response()->json(['reply' => $fallbackReply]);
        }

        $payload = [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Kamu adalah asisten ZENLAB SIISTK (TelatenKarya). Jawablah dengan ramah dan membantu dalam bahasa Indonesia. Gunakan konteks hasil retrieval di bawah ini sebagai sumber utama jika relevan. Jika data tidak cukup, bilang data belum tersedia.',
                ],
                [
                    'role' => 'system',
                    'content' => 'RAG CONTEXT: '.json_encode($ragContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ],
                [
                    'role' => 'system',
                    'content' => 'DATABASE SUMMARY: '.json_encode($databaseContext, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ],
                ...$history,
                [
                    'role' => 'user',
                    'content' => $message,
                ],
            ],
            'max_tokens' => 1024,
            'temperature' => 0.7,
        ];

        $start = microtime(true);

        try {
            $response = Http::acceptJson()
                ->withoutVerifying()
                ->withToken($apiKey)
                ->timeout(30)
                ->post(rtrim($baseUrl, '/').'/chat/completions', $payload);
            $elapsed = round(microtime(true) - $start, 2);

            if (! $response->successful()) {
                Log::error("ChatBot API error after {$elapsed}s", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json(['reply' => $fallbackReply]);
            }

            Log::info("ChatBot API response after {$elapsed}s");

            $data = $response->json();
            $reply = $data['choices'][0]['message']['content'] ?? $fallbackReply;

            return response()->json(['reply' => $reply]);
        } catch (\Throwable $e) {
            $elapsed = round(microtime(true) - $start, 2);
            Log::error("ChatBot API exception after {$elapsed}s", ['error' => $e->getMessage()]);

            return response()->json(['reply' => $fallbackReply]);
        }
    }

    private function databaseContext(string $message): array
    {
        $message = mb_strtolower($message);

        $context = [
            'summary' => [
                'products_count' => Product::query()->count(),
                'customers_count' => Customer::query()->count(),
                'orders_count' => Order::query()->count(),
                'stocks_count' => Stock::query()->count(),
            ],
        ];

        if (str_contains($message, 'produk') || str_contains($message, 'barang') || str_contains($message, 'stok')) {
            $context['products'] = Product::query()
                ->select(['id', 'name', 'price'])
                ->withSum('stocks', 'quantity')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'stock' => (int) ($product->stocks_sum_quantity ?? 0),
                ])
                ->values()
                ->all();
        }

        if (str_contains($message, 'customer') || str_contains($message, 'pelanggan')) {
            $context['customers'] = Customer::query()
                ->select(['id', 'name', 'phone', 'email'])
                ->latest()
                ->limit(5)
                ->get()
                ->toArray();
        }

        if (str_contains($message, 'order') || str_contains($message, 'pesanan') || str_contains($message, 'transaksi')) {
            $context['orders'] = Order::query()
                ->select(['id', 'uuid', 'customer_id', 'total_price', 'checked_out_at', 'cancelled_at', 'expired_at'])
                ->with('customer:id,name')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'uuid' => $order->uuid,
                    'customer' => $order->customer?->name,
                    'total_price' => $order->total_price,
                    'status' => $order->status,
                ])
                ->values()
                ->all();
        }

        return $context;
    }

    private function fallbackReply(string $message, array $context, array $ragContext = []): string
    {
        $message = mb_strtolower($message);

        if (
            str_contains($message, 'hai') ||
            str_contains($message, 'halo') ||
            str_contains($message, 'hello') ||
            str_contains($message, 'pagi') ||
            str_contains($message, 'siang') ||
            str_contains($message, 'sore') ||
            str_contains($message, 'malam')
        ) {
            $summary = $context['summary'] ?? [];

            return sprintf(
                'Halo. DB isi Produk: %d, customer: %d, order: %d, stock: %d. Tanya produk, customer, order, atau stok spesifik.',
                $summary['products_count'] ?? 0,
                $summary['customers_count'] ?? 0,
                $summary['orders_count'] ?? 0,
                $summary['stocks_count'] ?? 0,
            );
        }

        if (str_contains($message, 'produk') || str_contains($message, 'barang') || str_contains($message, 'stok')) {
            $ragLines = collect($ragContext['items'] ?? [])
                ->map(fn (array $item) => '- '.$item['title'].' | '.$item['snippet'])
                ->implode("\n");

            if ($ragLines !== '') {
                return "Data relevan:\n{$ragLines}";
            }

            $lines = collect($context['products'] ?? [])
                ->map(fn (array $product) => '- '.$product['name'].' | stok: '.$product['stock'].' | Rp'.number_format($product['price'], 0, ',', '.'))
                ->implode("\n");

            return $lines !== ''
                ? "Data produk:\n{$lines}"
                : 'Data produk belum tersedia.';
        }

        if (str_contains($message, 'customer') || str_contains($message, 'pelanggan')) {
            $ragLines = collect($ragContext['items'] ?? [])
                ->map(fn (array $item) => '- '.$item['title'].' | '.$item['snippet'])
                ->implode("\n");

            if ($ragLines !== '') {
                return "Data relevan:\n{$ragLines}";
            }

            $lines = collect($context['customers'] ?? [])
                ->map(fn (array $customer) => '- '.$customer['name'].' | '.$customer['phone'].' | '.$customer['email'])
                ->implode("\n");

            return $lines !== ''
                ? "Data customer:\n{$lines}"
                : 'Data customer belum tersedia.';
        }

        if (str_contains($message, 'order') || str_contains($message, 'pesanan') || str_contains($message, 'transaksi')) {
            $ragLines = collect($ragContext['items'] ?? [])
                ->map(fn (array $item) => '- '.$item['title'].' | '.$item['snippet'])
                ->implode("\n");

            if ($ragLines !== '') {
                return "Data relevan:\n{$ragLines}";
            }

            $lines = collect($context['orders'] ?? [])
                ->map(fn (array $order) => '- '.$order['uuid'].' | '.$order['customer'].' | Rp'.number_format($order['total_price'], 0, ',', '.').' | '.$order['status'])
                ->implode("\n");

            return $lines !== ''
                ? "Data order:\n{$lines}"
                : 'Data order belum tersedia.';
        }

        $summary = $context['summary'] ?? [];
        $templates = [
            'Saya bisa cek data DB. Coba tanya produk, customer, order, atau stok.',
            'Butuh data? Saya siap bantu cari di DB. Contoh: "produk", "stok", "order terbaru".',
            'Saya lihat ringkasan DB dulu: produk %d, customer %d, order %d, stock %d. Tanya detailnya saja.',
        ];

        $template = $templates[abs(crc32($message)) % count($templates)];

        if (str_contains($template, '%d')) {
            return sprintf(
                $template,
                $summary['products_count'] ?? 0,
                $summary['customers_count'] ?? 0,
                $summary['orders_count'] ?? 0,
                $summary['stocks_count'] ?? 0,
            );
        }

        return $template;
    }

    private function ragContext(string $message): array
    {
        $query = mb_strtolower(trim($message));
        $terms = $this->ragTerms($query);

        $items = [];

        try {
            foreach ($this->retrieveProductSnippets($terms) as $item) {
                $items[] = $item;
            }

            foreach ($this->retrieveCustomerSnippets($terms) as $item) {
                $items[] = $item;
            }

            foreach ($this->retrieveOrderSnippets($terms) as $item) {
                $items[] = $item;
            }
        } catch (
            \Throwable $e
        ) {
            Log::error('ChatBot RAG retrieval failed', [
                'error' => $e->getMessage(),
                'query' => $query,
            ]);
        }

        if ($items === []) {
            $items = array_merge(
                $this->retrieveProductSnippets([]),
                $this->retrieveCustomerSnippets([]),
                $this->retrieveOrderSnippets([]),
            );
        }

        return [
            'query' => $query,
            'terms' => $terms,
            'items' => array_slice($items, 0, 8),
        ];
    }

    private function ragTerms(string $message): array
    {
        $parts = preg_split('/[^\pL\pN]+/u', $message) ?: [];
        $stopwords = ['yang', 'dan', 'atau', 'dengan', 'untuk', 'di', 'ke', 'dari', 'apa', 'siapa', 'kapan', 'berapa', 'tolong', 'bisa', 'yang'];

        $terms = array_values(array_unique(array_filter(array_map(function (string $part) use ($stopwords): ?string {
            $part = trim($part);

            if (mb_strlen($part) < 3 || in_array($part, $stopwords, true)) {
                return null;
            }

            return $part;
        }, $parts))));

        return array_slice($terms, 0, 8);
    }

    private function retrieveProductSnippets(array $terms): array
    {
        $query = Product::query()->select(['id', 'name', 'description', 'price', 'minimum'])->withSum('stocks', 'quantity');

        if ($terms !== []) {
            $query->where(function ($builder) use ($terms): void {
                foreach ($terms as $term) {
                    $builder->orWhere('name', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                }
            });
        }

        return $query->latest()
            ->limit(3)
            ->get()
            ->map(fn (Product $product) => [
                'title' => 'Produk #'.$product->id.' '.$product->name,
                'snippet' => 'harga Rp'.number_format((int) $product->price, 0, ',', '.').', stok '.(int) ($product->stocks_sum_quantity ?? 0).', minimum '.(int) $product->minimum,
            ])
            ->values()
            ->all();
    }

    private function retrieveCustomerSnippets(array $terms): array
    {
        $query = Customer::query()->select(['id', 'name', 'phone', 'email', 'address']);

        if ($terms !== []) {
            $query->where(function ($builder) use ($terms): void {
                foreach ($terms as $term) {
                    $builder->orWhere('name', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('address', 'like', "%{$term}%");
                }
            });
        }

        return $query->latest()
            ->limit(3)
            ->get()
            ->map(fn (Customer $customer) => [
                'title' => 'Customer #'.$customer->id.' '.$customer->name,
                'snippet' => collect([$customer->phone, $customer->email, $customer->address])
                    ->filter()
                    ->implode(' | '),
            ])
            ->values()
            ->all();
    }

    private function retrieveOrderSnippets(array $terms): array
    {
        $query = Order::query()->select(['id', 'uuid', 'customer_id', 'total_price', 'checked_out_at', 'cancelled_at', 'expired_at', 'created_at'])
            ->with(['customer:id,name']);

        $hasTerms = $terms !== [];

        if ($hasTerms) {
            $query->where(function ($builder) use ($terms): void {
                foreach ($terms as $term) {
                    $builder->orWhere('uuid', 'like', "%{$term}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery->where('name', 'like', "%{$term}%"));
                }
            });
        }

        if ($hasTerms && $query->count() === 0) {
            $query = Order::query()->select(['id', 'uuid', 'customer_id', 'total_price', 'checked_out_at', 'cancelled_at', 'expired_at', 'created_at'])
                ->with(['customer:id,name']);
        }

        return $query->latest()
            ->limit(3)
            ->get()
            ->map(fn (Order $order) => [
                'title' => 'Order #'.$order->id.' '.$order->uuid,
                'snippet' => ($order->customer?->name ?? '-').' | Rp'.number_format((int) $order->total_price, 0, ',', '.').' | '.$order->status,
            ])
            ->values()
            ->all();
    }

    private function handleCrudIntent(string $message): ?string
    {
        $normalized = mb_strtolower(trim($message));

        if ($normalized === '') {
            return null;
        }

        if ($this->isCreateProductIntent($normalized)) {
            return $this->createProduct($normalized);
        }

        if ($this->isUpdateProductIntent($normalized)) {
            return $this->updateProduct($normalized);
        }

        if ($this->isDeleteProductIntent($normalized)) {
            return $this->deleteProduct($normalized);
        }

        if ($this->isCreateCustomerIntent($normalized)) {
            return $this->createCustomer($normalized);
        }

        if ($this->isUpdateCustomerIntent($normalized)) {
            return $this->updateCustomer($normalized);
        }

        if ($this->isDeleteCustomerIntent($normalized)) {
            return $this->deleteCustomer($normalized);
        }

        if ($this->isAddStockIntent($normalized)) {
            return $this->addStock($normalized, 'in');
        }

        if ($this->isReduceStockIntent($normalized)) {
            return $this->addStock($normalized, 'out');
        }

        return null;
    }

    private function handleAnalyticsIntent(string $message): ?string
    {
        $normalized = mb_strtolower(trim($message));

        if ($normalized === '') {
            return null;
        }

        if (
            str_contains($normalized, 'penjualan') ||
            str_contains($normalized, 'omzet') ||
            str_contains($normalized, 'revenue') ||
            str_contains($normalized, 'sales')
        ) {
            if (
                str_contains($normalized, 'tiap bulan') ||
                str_contains($normalized, 'per bulan') ||
                str_contains($normalized, 'bulanan') ||
                str_contains($normalized, 'tiap minggu') ||
                str_contains($normalized, 'per minggu') ||
                str_contains($normalized, 'mingguan')
            ) {
                return $this->salesTrendReply($normalized);
            }

            return $this->salesAnalyticsReply($normalized);
        }

        if (
            str_contains($normalized, 'keuntungan') ||
            str_contains($normalized, 'laba') ||
            str_contains($normalized, 'profit')
        ) {
            return $this->profitAnalyticsReply($normalized);
        }

        return null;
    }

    private function salesAnalyticsReply(string $message): string
    {
        [$startDate, $endDate, $label] = $this->resolveDateRange($message);

        $query = Order::query()
            ->select(['id', 'total_price', 'checked_out_at', 'cancelled_at', 'expired_at'])
            ->whereNotNull('checked_out_at')
            ->whereNull('cancelled_at')
            ->whereNull('expired_at')
            ->whereBetween('checked_out_at', [$startDate->startOfDay(), $endDate->endOfDay()]);

        $orders = $query->get();
        $orderIds = $orders->pluck('id');

        $items = OrderItem::query()
            ->select(['order_id', 'product_id', 'quantity', 'price', 'subtotal'])
            ->whereIn('order_id', $orderIds)
            ->get();

        $revenue = (int) $items->sum('subtotal');
        $orderCount = $orders->count();
        $itemCount = (int) $items->sum('quantity');

        $topProducts = $items
            ->groupBy('product_id')
            ->map(function ($group) {
                $first = $group->first();

                return [
                    'product_id' => $first->product_id,
                    'quantity' => (int) $group->sum('quantity'),
                    'revenue' => (int) $group->sum('subtotal'),
                ];
            })
            ->sortByDesc('revenue')
            ->take(5)
            ->values();

        $topProductNames = $topProducts->isEmpty()
            ? 'Belum ada data.'
            : $topProducts
                ->map(function (array $item) {
                    $product = Product::query()->select(['id', 'name'])->find($item['product_id']);

                    return '- '.($product?->name ?? 'Produk #'.$item['product_id']).' | qty '.$item['quantity'].' | Rp'.number_format($item['revenue'], 0, ',', '.');
                })
                ->implode("\n");

        return implode("\n", [
            "Penjualan {$label}:",
            'Omzet: Rp'.number_format($revenue, 0, ',', '.'),
            'Order: '.$orderCount,
            'Item terjual: '.$itemCount,
            'Top produk:',
            $topProductNames,
        ]);
    }

    private function profitAnalyticsReply(string $message): string
    {
        [$startDate, $endDate, $label] = $this->resolveDateRange($message);

        $orders = Order::query()
            ->select(['id', 'checked_out_at', 'cancelled_at', 'expired_at'])
            ->whereNotNull('checked_out_at')
            ->whereNull('cancelled_at')
            ->whereNull('expired_at')
            ->whereBetween('checked_out_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->get();

        $orderIds = $orders->pluck('id');
        $items = OrderItem::query()
            ->select(['order_id', 'product_id', 'quantity', 'subtotal'])
            ->whereIn('order_id', $orderIds)
            ->get();

        $revenue = (int) $items->sum('subtotal');
        $soldQuantities = $items->groupBy('product_id')->map(fn ($group) => (int) $group->sum('quantity'));
        $costByProduct = $this->estimatedProductCosts($soldQuantities->keys()->all());

        $estimatedCost = 0;
        $missingCostProducts = [];

        foreach ($soldQuantities as $productId => $quantity) {
            if (! isset($costByProduct[$productId])) {
                $missingCostProducts[] = $productId;

                continue;
            }

            $estimatedCost += $quantity * $costByProduct[$productId];
        }

        $profit = $revenue - $estimatedCost;

        $reply = [
            "Keuntungan {$label}:",
            'Omzet: Rp'.number_format($revenue, 0, ',', '.'),
            'Estimasi biaya pokok: Rp'.number_format($estimatedCost, 0, ',', '.'),
            'Estimasi laba kotor: Rp'.number_format($profit, 0, ',', '.'),
        ];

        if ($missingCostProducts !== []) {
            $reply[] = 'Catatan: beberapa produk belum punya `unit_cost`, jadi hasil belum akurat penuh.';
        }

        return implode("\n", $reply);
    }

    private function salesTrendReply(string $message): string
    {
        $isMonthly = str_contains($message, 'bulan');
        $periods = $isMonthly ? 6 : 8;
        $startDate = $isMonthly ? now()->subMonthsNoOverflow($periods - 1)->startOfMonth() : now()->subWeeks($periods - 1)->startOfWeek();
        $endDate = now()->endOfDay();
        $dateFormat = $isMonthly ? '%Y-%m' : '%x-%v';

        $rows = DB::table('orders_items')
            ->join('orders', 'orders_items.order_id', '=', 'orders.id')
            ->whereNotNull('orders.checked_out_at')
            ->whereNull('orders.cancelled_at')
            ->whereNull('orders.expired_at')
            ->whereBetween('orders.checked_out_at', [$startDate, $endDate])
            ->select([
                DB::raw("DATE_FORMAT(orders.checked_out_at, '{$dateFormat}') as period"),
                DB::raw('SUM(orders_items.subtotal) as revenue'),
                DB::raw('SUM(orders_items.quantity) as quantity'),
            ])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $label = $isMonthly ? 'bulanan' : 'mingguan';

        if ($rows->isEmpty()) {
            return 'Belum ada data penjualan '.$label.'.';
        }

        $lines = $rows->map(function ($row) use ($isMonthly) {
            $periodLabel = $isMonthly
                ? Carbon::createFromFormat('Y-m', $row->period)->translatedFormat('F Y')
                : 'Minggu '.$row->period;

            return '- '.$periodLabel.' | Rp'.number_format((int) $row->revenue, 0, ',', '.').' | qty '.(int) $row->quantity;
        })->implode("\n");

        return implode("\n", [
            'Penjualan '.$label.':',
            $lines,
        ]);
    }

    private function estimatedProductCosts(array $productIds): array
    {
        if ($productIds === []) {
            return [];
        }

        $stocks = Stock::query()
            ->select(['product_id', 'quantity', 'unit_cost', 'created_at'])
            ->whereIn('product_id', $productIds)
            ->where('type', 'in')
            ->whereNotNull('unit_cost')
            ->orderBy('created_at')
            ->get()
            ->groupBy('product_id');

        $costs = [];

        foreach ($stocks as $productId => $rows) {
            $totalQty = 0;
            $totalCost = 0;

            foreach ($rows as $row) {
                $quantity = abs((int) $row->quantity);
                $unitCost = (int) $row->unit_cost;
                $totalQty += $quantity;
                $totalCost += $quantity * $unitCost;
            }

            if ($totalQty > 0) {
                $costs[$productId] = (int) round($totalCost / $totalQty);
            }
        }

        return $costs;
    }

    private function resolveDateRange(string $message): array
    {
        $today = now();

        if (str_contains($message, 'hari ini')) {
            return [$today->copy()->startOfDay(), $today->copy()->endOfDay(), 'hari ini'];
        }

        if (str_contains($message, 'minggu lalu')) {
            return [$today->copy()->subWeek()->startOfWeek(), $today->copy()->subWeek()->endOfWeek(), 'minggu lalu'];
        }

        if (str_contains($message, 'minggu ini')) {
            return [$today->copy()->startOfWeek(), $today->copy()->endOfWeek(), 'minggu ini'];
        }

        if (str_contains($message, 'bulan lalu')) {
            return [$today->copy()->subMonthNoOverflow()->startOfMonth(), $today->copy()->subMonthNoOverflow()->endOfMonth(), 'bulan lalu'];
        }

        if (str_contains($message, 'bulan ini')) {
            return [$today->copy()->startOfMonth(), $today->copy()->endOfMonth(), 'bulan ini'];
        }

        if (preg_match('/(\d+)\s+hari\s+terakhir/', $message, $matches)) {
            $days = max(1, (int) $matches[1]);

            return [$today->copy()->subDays($days - 1)->startOfDay(), $today->copy()->endOfDay(), $days.' hari terakhir'];
        }

        return [$today->copy()->startOfMonth(), $today->copy()->endOfDay(), 'bulan ini'];
    }

    private function isCreateProductIntent(string $message): bool
    {
        return str_contains($message, 'buat produk') || str_contains($message, 'tambah produk') || str_contains($message, 'create produk');
    }

    private function isUpdateProductIntent(string $message): bool
    {
        return str_contains($message, 'ubah produk') || str_contains($message, 'update produk') || str_contains($message, 'edit produk');
    }

    private function isDeleteProductIntent(string $message): bool
    {
        return str_contains($message, 'hapus produk') || str_contains($message, 'delete produk') || str_contains($message, 'remove produk');
    }

    private function isCreateCustomerIntent(string $message): bool
    {
        return str_contains($message, 'buat customer') || str_contains($message, 'tambah customer') || str_contains($message, 'create customer') || str_contains($message, 'buat pelanggan') || str_contains($message, 'tambah pelanggan');
    }

    private function isUpdateCustomerIntent(string $message): bool
    {
        return str_contains($message, 'ubah customer') || str_contains($message, 'update customer') || str_contains($message, 'edit customer') || str_contains($message, 'ubah pelanggan') || str_contains($message, 'update pelanggan');
    }

    private function isDeleteCustomerIntent(string $message): bool
    {
        return str_contains($message, 'hapus customer') || str_contains($message, 'delete customer') || str_contains($message, 'hapus pelanggan') || str_contains($message, 'delete pelanggan');
    }

    private function isAddStockIntent(string $message): bool
    {
        return str_contains($message, 'tambah stok') || str_contains($message, 'add stock') || str_contains($message, 'stok masuk') || str_contains($message, 'stock masuk');
    }

    private function isReduceStockIntent(string $message): bool
    {
        return str_contains($message, 'kurangi stok') || str_contains($message, 'reduce stock') || str_contains($message, 'stok keluar') || str_contains($message, 'stock keluar');
    }

    private function createProduct(string $message): string
    {
        $data = $this->extractFields($message, ['name', 'harga', 'stok', 'deskripsi', 'minimum']);

        if (empty($data['name']) || ! isset($data['harga'])) {
            return 'Format: buat produk name=Nama harga=10000 stok=5 deskripsi=... minimum=1';
        }

        $product = DB::transaction(function () use ($data) {
            $product = Product::query()->create([
                'name' => $data['name'],
                'description' => $data['deskripsi'] ?? null,
                'price' => (int) $data['harga'],
                'minimum' => (int) ($data['minimum'] ?? 0),
                'created_by' => auth()->id(),
            ]);

            if (isset($data['stok'])) {
                Stock::query()->create([
                    'product_id' => $product->id,
                    'quantity' => (int) $data['stok'],
                    'type' => 'in',
                    'note' => 'ChatBot create product stock',
                    'created_by' => auth()->id(),
                ]);
            }

            return $product;
        });

        return 'Produk dibuat: '.$product->name.' ID '.$product->id;
    }

    private function updateProduct(string $message): string
    {
        $id = $this->extractId($message);

        if ($id === null) {
            return 'Format: ubah produk id=1 name=Nama harga=10000 stok=5 minimum=1 deskripsi=...';
        }

        $product = Product::query()->find($id);

        if ($product === null) {
            return 'Produk tidak ditemukan.';
        }

        $data = $this->extractFields($message, ['name', 'harga', 'deskripsi', 'minimum']);

        if ($data === []) {
            return 'Field kosong. Isi minimal satu: name, harga, deskripsi, minimum.';
        }

        if (isset($data['name'])) {
            $product->name = $data['name'];
        }

        if (isset($data['deskripsi'])) {
            $product->description = $data['deskripsi'];
        }

        if (isset($data['harga'])) {
            $product->price = (int) $data['harga'];
        }

        if (isset($data['minimum'])) {
            $product->minimum = (int) $data['minimum'];
        }

        $product->save();

        return 'Produk diupdate: '.$product->name.' ID '.$product->id;
    }

    private function deleteProduct(string $message): string
    {
        $id = $this->extractId($message);

        if ($id === null) {
            return 'Format: hapus produk id=1';
        }

        $product = Product::query()->find($id);

        if ($product === null) {
            return 'Produk tidak ditemukan.';
        }

        $product->delete();

        return 'Produk dihapus: '.$product->name.' ID '.$product->id;
    }

    private function createCustomer(string $message): string
    {
        $data = $this->extractFields($message, ['name', 'phone', 'email', 'address']);

        if (empty($data['name'])) {
            return 'Format: buat customer name=Nama phone=08xxx email=... address=...';
        }

        $customer = Customer::query()->create([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'created_by' => auth()->id(),
        ]);

        return 'Customer dibuat: '.$customer->name.' ID '.$customer->id;
    }

    private function updateCustomer(string $message): string
    {
        $id = $this->extractId($message);

        if ($id === null) {
            return 'Format: ubah customer id=1 name=Nama phone=08xxx email=... address=...';
        }

        $customer = Customer::query()->find($id);

        if ($customer === null) {
            return 'Customer tidak ditemukan.';
        }

        $data = $this->extractFields($message, ['name', 'phone', 'email', 'address']);

        if ($data === []) {
            return 'Field kosong. Isi minimal satu: name, phone, email, address.';
        }

        foreach (['name', 'phone', 'email', 'address'] as $field) {
            if (isset($data[$field])) {
                $customer->{$field} = $data[$field];
            }
        }

        $customer->save();

        return 'Customer diupdate: '.$customer->name.' ID '.$customer->id;
    }

    private function deleteCustomer(string $message): string
    {
        $id = $this->extractId($message);

        if ($id === null) {
            return 'Format: hapus customer id=1';
        }

        $customer = Customer::query()->find($id);

        if ($customer === null) {
            return 'Customer tidak ditemukan.';
        }

        $customer->delete();

        return 'Customer dihapus: '.$customer->name.' ID '.$customer->id;
    }

    private function addStock(string $message, string $type): string
    {
        $data = $this->extractFields($message, ['id', 'product_id', 'name', 'produk', 'stok', 'quantity', 'qty', 'unit_cost', 'note']);
        $quantity = $this->extractQuantity($data, $message);

        if ($quantity === null || $quantity < 1) {
            return 'Format: tambah stok id=1 qty=5 note=Restock';
        }

        $product = $this->findProductForChat($data, $message);

        if ($product === null) {
            return 'Produk tidak ditemukan.';
        }

        if ($type === 'out' && $product->currentStock() < $quantity) {
            return 'Stok tidak cukup. Stok sekarang: '.$product->currentStock();
        }

        $signedQuantity = $type === 'out' ? -$quantity : $quantity;

        $product->stocks()->create([
            'quantity' => $signedQuantity,
            'unit_cost' => isset($data['unit_cost']) ? (int) $data['unit_cost'] : null,
            'type' => $type,
            'note' => $data['note'] ?? ($type === 'out' ? 'ChatBot stock reduction' : 'ChatBot stock addition'),
            'created_by' => auth()->id(),
        ]);

        return 'Stok berhasil diperbarui: '.$product->name.' sekarang '.$product->currentStock().' ('.($type === 'out' ? '-' : '+').$quantity.')';
    }

    private function extractId(string $message): ?int
    {
        if (preg_match('/\bid\s*=\s*(\d+)/i', $message, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/\b(\d+)\b/', $message, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    private function extractQuantity(array $data, string $message): ?int
    {
        foreach (['quantity', 'qty', 'stok'] as $field) {
            if (isset($data[$field]) && is_numeric($data[$field])) {
                return abs((int) $data[$field]);
            }
        }

        if (preg_match('/\b(?:qty|quantity|stok)\s*=\s*(\d+)/i', $message, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    private function findProductForChat(array $data, string $message): ?Product
    {
        $id = null;

        foreach (['product_id', 'id'] as $field) {
            if (isset($data[$field]) && is_numeric($data[$field])) {
                $id = (int) $data[$field];
                break;
            }
        }

        if ($id !== null) {
            return Product::query()->find($id);
        }

        foreach (['name', 'produk'] as $field) {
            if (! empty($data[$field])) {
                $product = Product::query()->where('name', 'like', '%'.$data[$field].'%')->first();

                if ($product !== null) {
                    return $product;
                }
            }
        }

        if (preg_match('/\bproduk\s+(.+?)(?:\s+(?:qty|quantity|stok|note|unit_cost)\s*=|$)/i', $message, $matches)) {
            $product = Product::query()->where('name', 'like', '%'.trim($matches[1]).'%')->first();

            if ($product !== null) {
                return $product;
            }
        }

        return null;
    }

    private function extractFields(string $message, array $fields): array
    {
        $result = [];

        foreach ($fields as $field) {
            if (preg_match('/\b'.preg_quote($field, '/').'\s*=\s*("[^"]+"|[^\s]+(?:\s(?!\b(?:'.implode('|', array_map('preg_quote', $fields)).')\s*=\s*)[^\s]+)*)/i', $message, $matches)) {
                $value = trim($matches[1], '"');
                $result[$field] = $value;
            }
        }

        return $result;
    }
}
