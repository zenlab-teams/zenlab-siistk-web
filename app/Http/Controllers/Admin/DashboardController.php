<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = today();
        $lowStockProductsQuery = Product::query()
            ->select(['id', 'name', 'thumbnail'])
            ->withSum('stocks', 'quantity')
            ->havingRaw('COALESCE(stocks_sum_quantity, 0) <= 5');

        $stats = [
            'revenue_today' => Payment::query()
                ->whereDate('created_at', $today)
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
                    '(SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = invoices.id) < invoices.total_amount'
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
                'invoice.payments:id,invoice_id,amount',
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
}
