<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = today();
        $lowStockProductsQuery = Product::query()
            ->select(['id', 'name', 'thumbnail', 'minimum'])
            ->whereNotNull('minimum')
            ->withSum('stocks', 'quantity')
            ->whereRaw('(SELECT COALESCE(SUM(quantity), 0) FROM stocks WHERE stocks.product_id = products.id) < minimum');

        $stats = [
            'revenue_today' => Payment::query()
                ->whereDate('created_at', $today)
                ->where('status', 'approved')
                ->sum('amount'),

            'orders_today' => Order::query()
                ->whereDate('created_at', $today)
                ->count(),

            'completed_today' => Order::query()
                ->whereDate('checked_out_at', $today)
                ->count(),

            'pending_payment' => Order::query()
                ->whereNotNull('checked_out_at')
                ->whereNull('cancelled_at')
                ->whereHas('invoice', fn ($query) => $query->whereRaw(
                    '(SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = invoices.id AND status = \'approved\') < invoices.total_amount'
                ))
                ->count(),

            'low_stock_count' => (clone $lowStockProductsQuery)->get()->count(),
        ];

        $recentOrders = Order::query()
            ->select([
                'id',
                'customer_id',
                'total_price',
                'created_at',
                'checked_out_at',
                'cancelled_at',
                'expired_at',
            ])
            ->with([
                'customer:id,name',
                'invoice',
                'invoice.payments:id,invoice_id,amount,status',
            ])
            ->latest()
            ->limit(5)
            ->get();

        $lowStockProducts = (clone $lowStockProductsQuery)
            ->orderByRaw('COALESCE(stocks_sum_quantity, 0)')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $startDate = $request->query('start_date', now()->subDays(29)->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());
        $groupBy = $request->query('group_by', 'daily');
        $productIds = $request->query('product_ids', []);

        if (is_string($productIds)) {
            $productIds = array_filter(explode(',', $productIds));
        }

        $dateFormat = $groupBy === 'monthly' ? '%Y-%m' : '%Y-%m-%d';

        // --- Sales data from orders_items ---
        $salesQuery = DB::table('orders_items')
            ->join('orders', 'orders_items.order_id', '=', 'orders.id')
            ->whereNull('orders.cancelled_at')
            ->whereDate('orders.created_at', '>=', $startDate)
            ->whereDate('orders.created_at', '<=', $endDate)
            ->select([
                DB::raw("DATE_FORMAT(orders.created_at, '{$dateFormat}') as period"),
                DB::raw('SUM(orders_items.subtotal) as revenue'),
                DB::raw('SUM(orders_items.quantity) as quantity'),
            ])
            ->groupBy('period')
            ->orderBy('period');

        if (! empty($productIds)) {
            $salesQuery->whereIn('orders_items.product_id', $productIds);
        }

        $salesData = $salesQuery->get();

        $salesSummary = [
            'total_revenue' => $salesData->sum('revenue'),
            'avg_revenue' => $salesData->count() > 0 ? round($salesData->avg('revenue')) : 0,
            'total_quantity' => $salesData->sum('quantity'),
            'avg_quantity' => $salesData->count() > 0 ? round($salesData->avg('quantity')) : 0,
        ];

        // --- Stock data ---
        $stockQuery = DB::table('stocks')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->select([
                DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as period"),
                DB::raw("SUM(CASE WHEN type = 'in' THEN COALESCE(quantity * unit_cost, 0) ELSE 0 END) as stock_in_cost"),
                DB::raw("SUM(CASE WHEN type = 'out' THEN ABS(COALESCE(quantity * unit_cost, 0)) ELSE 0 END) as stock_out_cost"),
                DB::raw("SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) as stock_in_qty"),
                DB::raw("SUM(CASE WHEN type = 'out' THEN ABS(quantity) ELSE 0 END) as stock_out_qty"),
            ])
            ->groupBy('period')
            ->orderBy('period');

        if (! empty($productIds)) {
            $stockQuery->whereIn('product_id', $productIds);
        }

        $stockData = $stockQuery->get();

        $stockSummary = [
            'total_stock_in_cost' => $stockData->sum('stock_in_cost'),
            'total_stock_out_cost' => $stockData->sum('stock_out_cost'),
            'total_stock_in_qty' => $stockData->sum('stock_in_qty'),
            'total_stock_out_qty' => $stockData->sum('stock_out_qty'),
        ];

        // --- Products list ---
        $products = Product::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'sales' => [
                'labels' => $salesData->pluck('period'),
                'datasets' => [
                    'revenue' => $salesData->pluck('revenue'),
                    'quantity' => $salesData->pluck('quantity'),
                ],
                'summary' => $salesSummary,
            ],
            'stock' => [
                'labels' => $stockData->pluck('period'),
                'datasets' => [
                    'stock_in_cost' => $stockData->pluck('stock_in_cost'),
                    'stock_out_cost' => $stockData->pluck('stock_out_cost'),
                ],
                'summary' => $stockSummary,
            ],
            'products' => $products,
        ]);
    }
}
