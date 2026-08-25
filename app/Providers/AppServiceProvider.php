<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // 🔹 Partages globaux Inertia (exemple : traduction)
        Inertia::share([
            'locale' => fn () => app()->getLocale(),
        ]);
    }
}
