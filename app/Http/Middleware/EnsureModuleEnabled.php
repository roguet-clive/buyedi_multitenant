<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Etablissement;

class EnsureModuleEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $user = $request->user();

        // 1. Le Super-Admin plateforme a un passe-droit total absolu
        if ($user && ($user->hasRole('super-admin') || $user->hasRole('superadmin'))) {
            return $next($request);
        }

        // 2. Vérification sur l'établissement
        $etablissement = Etablissement::first();
        $isModuleActive = $etablissement ? $etablissement->hasModule($module) : false;

        if (!$isModuleActive) {
            $moduleConfig = config("modules.modules.{$module}");
            $nomModule = $moduleConfig['nom'] ?? $module;

            $message = "Le module '{$nomModule}' n'est pas activé dans la formule de souscription de votre établissement. Veuillez contacter le support Buyedi pour mettre à niveau votre licence.";

            if ($request->expectsJson() && !$request->header('X-Inertia')) {
                return response()->json([
                    'error' => 'Module non souscrit',
                    'message' => $message,
                    'module' => $module,
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', $message);
        }

        return $next($request);
    }
}
