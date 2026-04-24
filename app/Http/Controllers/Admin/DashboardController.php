<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Sale;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'orders' => Order::query()->count(),
                'sales' => Sale::query()->count(),
                'customers' => Customer::query()->count(),
            ],
        ]);
    }
}
