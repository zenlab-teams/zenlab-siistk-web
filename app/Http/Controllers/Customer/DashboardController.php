<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Customer/Dashboard', [
            'stats' => [
                'orders' => Order::query()->where('user_id', Auth::id())->count(),
            ],
        ]);
    }
}
