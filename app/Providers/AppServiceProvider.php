<?php

namespace App\Providers;

use App\Models\Offer;
use App\Models\Order;
use App\Observers\OfferObserver;
use App\Observers\OrderObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Offer::observe(OfferObserver::class);
        Order::observe(OrderObserver::class);
    }
}
