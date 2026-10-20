<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SuperAdminAuthController extends Controller
{
    /**
     * Affiche l'écran de connexion sécurisé du Super-Admin SaaS
     */
    public function showLoginForm()
    {
        if (Auth::check() && Auth::user()->isSuperAdmin()) {
            return redirect()->route('central.super-admin.index');
        }

        return Inertia::render('Central/SuperAdmin/Login');
    }

    /**
     * Traite la tentative d'authentification avec protection anti-bruteforce
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'L\'adresse email Super-Admin est requise.',
            'email.email' => 'Format d\'adresse email invalide.',
            'password.required' => 'Le mot de passe de sécurité est requis.',
        ]);

        $throttleKey = Str::transliterate(Str::lower($credentials['email']) . '|' . $request->ip());

        // Protection contre les attaques par force brute (5 tentatives max par minute)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Trop de tentatives infructueuses. Accès temporairement verrouillé pour des raisons de sécurité. Réessayez dans {$seconds} secondes.",
            ])->onlyInput('email');
        }

        $remember = $request->boolean('remember', false);

        if (Auth::attempt($credentials, $remember)) {
            $user = Auth::user();

            // Vérifier que le compte est bien habilité Super-Admin
            if (!$user->isSuperAdmin()) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                RateLimiter::hit($throttleKey, 60);

                return back()->withErrors([
                    'email' => 'Accès refusé : Ce compte ne dispose pas des prérogatives Super-Administrateur.',
                ])->onlyInput('email');
            }

            // Réinitialiser le compteur de tentatives et régénérer la session contre le Session Fixation
            RateLimiter::clear($throttleKey);
            $request->session()->regenerate();

            return redirect()->intended(route('central.super-admin.index'))
                ->with('success', "Connexion sécurisée établie. Bienvenue, {$user->full_name}.");
        }

        // En cas d'échec
        RateLimiter::hit($throttleKey, 60);

        return back()->withErrors([
            'email' => 'Identifiants Super-Admin non reconnus ou mot de passe incorrect.',
        ])->onlyInput('email');
    }

    /**
     * Déconnexion sécurisée du Super-Admin
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('central.super-admin.login')
            ->with('success', 'Votre session Super-Admin a été fermée en toute sécurité.');
    }
}
