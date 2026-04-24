<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Sales/Dashboard', [
            'stats' => [
                'offers' => Offer::query()->count(),
                'orders' => Order::query()->count(),
            ],
        ]);
    }
}
