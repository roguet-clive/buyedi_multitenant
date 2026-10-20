<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Protège strictement l'accès au panneau Super-Admin central.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Vérification que l'utilisateur est authentifié sur la plateforme centrale
        if (!auth()->check()) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return redirect()->guest(route('central.super-admin.login'))
                    ->with('error', 'Authentification Super-Admin requise pour accéder à cette zone.');
            }

            return redirect()->guest(route('central.super-admin.login'))
                ->with('error', 'Authentification Super-Admin requise pour accéder à cette zone.');
        }

        $user = auth()->user();

        // 2. Vérification des droits Super-Administrateur SaaS
        if (!$user->isSuperAdmin()) {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('central.super-admin.login')
                ->with('error', 'Accès interdit : Ce compte ne possède pas les privilèges Super-Administrateur de Buyedi Solutions.');
        }

        return $next($request);
    }
}
