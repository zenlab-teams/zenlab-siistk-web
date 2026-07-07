<?php

use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\OfferController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\ChatBotController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\PublicOrderController;
use App\Http\Controllers\Sales\DashboardController as SalesDashboard;
use App\Http\Controllers\Sales\OfferController as SalesOfferController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

Route::get('/order/v/{uuid}', [PublicOrderController::class, 'show'])->name('order.public.show');
Route::post('/order/v/{uuid}/payment', [PublicOrderController::class, 'storePayment'])->name('order.public.payment.store');

Route::middleware('auth')->post('/logout', [LogoutController::class, 'destroy'])->name('logout');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('admin.dashboard');
    Route::get('/dashboard/analytics', [AdminDashboard::class, 'analytics'])->name('admin.dashboard.analytics');

    Route::controller(ProductController::class)->prefix('/product')->name('product.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::get('/bulk-create', 'bulkCreate')->name('bulkCreate');
        Route::post('/', 'store')->name('store');
        Route::post('/bulk', 'bulkStore')->name('bulkStore');
        Route::get('/{product}', 'show')->name('show');
        Route::controller(StockController::class)->group(function () {
            Route::get('/{product}/stock/create', 'create')->name('stock.create');
            Route::post('/{product}/stock', 'store')->name('stock.store');
        });
        Route::get('/{product}/edit', 'edit')->name('edit');
        Route::match(['put', 'patch'], '/{product}', 'update')->name('update');
        Route::delete('/{product}', 'destroy')->name('destroy');
        Route::delete('/destroy-selected/{ids}', 'destroySelected')->name('destroySelected');
    });

    Route::controller(UserController::class)->prefix('/user')->name('user.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{user}/edit', 'edit')->name('edit');
        Route::match(['put', 'patch'], '/{user}', 'update')->name('update');
        Route::delete('/{user}', 'destroy')->name('destroy');
        Route::delete('/destroy-selected/{ids}', 'destroySelected')->name('destroySelected');
    });

    Route::controller(OrderController::class)->prefix('/order')->name('order.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::patch('/{order}/cancel', 'cancel')->name('cancel');
        Route::patch('/{order}/customer', 'updateCustomer')->name('updateCustomer');
    });

    Route::controller(InvoiceController::class)->prefix('/invoice')->name('invoice.')->group(function () {
        Route::post('/{invoice}/payment', 'storePayment')->name('payment.store');
        Route::patch('/payment/{payment}/approve', 'approvePayment')->name('payment.approve');
        Route::patch('/payment/{payment}/reject', 'rejectPayment')->name('payment.reject');
    });

    Route::controller(OfferController::class)->prefix('/offer')->name('offer.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{offer}', 'show')->name('show');
        Route::patch('/{offer}/complete', 'complete')->name('complete');
        Route::patch('/{offer}/reject', 'reject')->name('reject');
        Route::post('/{offer}/record', 'storeRecord')->name('record.store');
        Route::post('/{offer}/record/{record}/approve', 'approveRecord')->name('record.approve');
        Route::patch('/{offer}/record/{record}/reject', 'rejectRecord')->name('record.reject');
    });
    Route::controller(CustomerController::class)->prefix('/customer')->name('customer.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{customer}/edit', 'edit')->name('edit');
        Route::match(['put', 'patch'], '/{customer}', 'update')->name('update');
        Route::delete('/{customer}', 'destroy')->name('destroy');
        Route::delete('/destroy-selected/{ids}', 'destroySelected')->name('destroySelected');
    });
});

Route::middleware(['auth', 'role:admin,sales'])->group(function () {
    Route::post('/customer/quick', [CustomerController::class, 'storeQuick'])->name('customer.storeQuick');

    Route::controller(OrderController::class)->prefix('admin/order')->name('order.')->group(function () {
        Route::get('/{order}', 'show')->name('show');
        Route::get('/{order}/invoice/download', 'downloadInvoice')->name('invoice.download');
    });
});

Route::middleware(['auth', 'role:admin,sales'])->prefix('sales')->name('sales.')->group(function () {
    Route::get('/dashboard', [SalesDashboard::class, 'index'])->name('dashboard');

    Route::controller(SalesOfferController::class)->prefix('/offer')->name('offer.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{offer}', 'show')->name('show');
        Route::post('/{offer}/record', 'storeRecord')->name('record.store');
    });
});

Route::middleware(['auth', 'role:admin,sales,customer'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [CustomerDashboard::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->get('/', function () {
    return match (auth()->user()->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'sales' => redirect()->route('sales.dashboard'),
        'customer' => redirect()->route('customer.dashboard'),
        default => redirect()->route('login'),
    };
});

Route::middleware('auth')->post('/chat', ChatBotController::class)->name('chat.send');
