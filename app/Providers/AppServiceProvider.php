<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
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

        if (app()->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // 🛡️ Super-Admin : accès universel absolu à toutes les permissions
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });

        // 🔹 Partages globaux Inertia (exemple : traduction)
        Inertia::share([
            'locale' => fn () => app()->getLocale(),
        ]);

        // 📜 Traçabilité et Audit Sécurité : Connexions, Déconnexions & Échecs
        \Illuminate\Support\Facades\Event::subscribe(\App\Listeners\AuthenticationLogSubscriber::class);
    }
}
