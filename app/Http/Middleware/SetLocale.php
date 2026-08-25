<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use App\Models\AnneeScolaire;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        // 🔹 Définir la langue
        $locale = session('locale', config('app.locale'));
        App::setLocale($locale);

        // 🔹 Partage Inertia : utilisateur, rôles, permissions, flash, locale
        if ($request->user()) {
            $user = $request->user();
            Inertia::share([
                'auth' => [
                    'user' => [
                        'id' => $user->id,
                        'nom' => $user->nom,
                        'prenom' => $user->prenom,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'roles' => $user->getRoleNames()->toArray(),
                    ],
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ],
                'flash' => [
                    'success' => session('success'),
                    'error' => session('error'),
                ],
                'locale' => App::getLocale(),

                // 🔹 Ajout de l'année scolaire en cours
                // 'currentSchoolYear' => AnneeScolaire::where('en_cours', true)->value('nom'),
                'currentSchoolYear' => AnneeScolaire::where('en_cours', true)->first(),
                'etablissement' => \App\Models\Etablissement::first(),
            ]);
        }

        return $next($request);
    }
}
