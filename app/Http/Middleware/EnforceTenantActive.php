<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceTenantActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (tenancy()->initialized) {
            $tenant = tenant();

            // Si le tenant est explicitement suspendu
            if ($tenant->statut === 'suspendu') {
                return response()->view('tenancy.suspended', [
                    'tenant' => $tenant,
                    'raison' => 'Cet établissement a été temporairement suspendu par l\'administration de la plateforme Buyedi.'
                ], 403);
            }

            // Si la période d'essai est échue
            if ($tenant->statut === 'essai' && $tenant->trial_ends_at && $tenant->trial_ends_at->isPast()) {
                return response()->view('tenancy.expired', [
                    'tenant' => $tenant,
                    'raison' => 'La période d\'essai de votre établissement est arrivée à expiration. Veuillez souscrire à une formule pour réactiver vos accès.'
                ], 402);
            }

            // Si l'abonnement actif est échu
            if ($tenant->statut === 'actif' && $tenant->actif_jusqu_a && $tenant->actif_jusqu_a->isPast()) {
                return response()->view('tenancy.expired', [
                    'tenant' => $tenant,
                    'raison' => 'L\'abonnement de votre établissement a expiré. Veuillez renouveler votre formule pour continuer à utiliser Buyedi.'
                ], 402);
            }
        }

        return $next($request);
    }
}
