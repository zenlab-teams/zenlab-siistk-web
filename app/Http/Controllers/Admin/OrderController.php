<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $perPage = $request->query('per_page', 10);

        $allowedSorts = ['created_at', 'total_price'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $orders = Order::query()
            ->select([
                'id',
                'customer_id',
                'total_price',
                'created_at',
                'created_by',
                'checked_out_at',
                'cancelled_at',
                'expired_at',
            ])
            ->with([
                'customer:id,name',
                'creator:id,name',
                'invoice',
                'invoice.payments:id,invoice_id,amount',
            ])
            ->when($search, function ($query) use ($search) {
                $query->whereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Order/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'sort', 'direction', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Order/Create', [
            'customers' => Customer::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'products' => Product::query()
                ->select(['id', 'name', 'price', 'thumbnail'])
                ->withSum('stocks', 'quantity')
                ->get(),
        ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $validated = $request->validated();
            $items = $validated['items'];
            $productPrices = Product::query()
                ->whereIn('id', collect($items)->pluck('product_id')->unique()->values())
                ->pluck('price', 'id');
            $totalPrice = collect($items)->sum(
                fn ($item) => $item['quantity'] * ((int) ($productPrices[$item['product_id']] ?? 0))
            );

            $order = Order::query()->create([
                'customer_id' => $validated['customer_id'] ?? null,
                'total_price' => $totalPrice,
                'checked_out_at' => now(),
                'created_by' => auth()->id(),
            ]);

            foreach ($items as $item) {
                $unitPrice = (int) ($productPrices[$item['product_id']] ?? 0);
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $unitPrice,
                    'subtotal' => $item['quantity'] * $unitPrice,
                    'created_by' => auth()->id(),
                ]);
            }

            $invoice = $order->invoice()->create([
                'total_amount' => $totalPrice,
                'due_date' => $validated['due_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            if ($request->boolean('pay_now')) {
                $invoice->payments()->create([
                    'amount' => $validated['payment_amount'],
                    'type' => $validated['payment_type'],
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return redirect()->route('order.index')->with('success', 'Order created successfully.');
    }

    public function show(Order $order): Response
    {
        $order->load([
            'customer',
            'items.product:id,name,thumbnail',
            'invoice.payments.creator:id,name',
            'creator:id,name',
        ]);

        return Inertia::render('Order/Show', [
            'order' => $order,
            'customers' => Customer::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function cancel(Order $order): RedirectResponse
    {
        if ($order->checked_out_at || $order->cancelled_at) {
            return back()->with('error', 'Order cannot be cancelled.');
        }

        $order->update([
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Order cancelled.');
    }

    /**
     * Update customer for an order (completing walk-in info).
     */
    public function updateCustomer(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
        ]);

        $order->update([
            'customer_id' => $validated['customer_id'],
        ]);

        return back()->with('success', 'Customer information updated.');
    }
}
