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

            // 1. Si l'établissement est explicitement suspendu
            if ($tenant->statut === 'suspendu') {
                return response()->view('tenancy.suspended', [
                    'tenant' => $tenant,
                    'raison' => 'Cet établissement a été suspendu par l\'administration de la plateforme Buyedi Solutions.'
                ], 403);
            }

            // 2. Si l'établissement est en période d'essai et que celle-ci a expiré
            if ($tenant->statut === 'essai') {
                if ($tenant->trial_ends_at && $tenant->trial_ends_at->isPast()) {
                    return response()->view('tenancy.expired', [
                        'tenant' => $tenant,
                        'raison' => 'La période d\'essai gratuite de votre établissement est arrivée à expiration. Veuillez souscrire à une formule pour réactiver vos accès.'
                    ], 402);
                }
            } elseif ($tenant->statut === 'actif') {
                // 3. Si l'abonnement actif est arrivé à échéance
                if ($tenant->actif_jusqu_a && $tenant->actif_jusqu_a->isPast()) {
                    return response()->view('tenancy.expired', [
                        'tenant' => $tenant,
                        'raison' => 'L\'abonnement de votre établissement a expiré. Veuillez renouveler votre formule pour continuer à utiliser la plateforme.'
                    ], 402);
                }
            } else {
                // 4. Tout autre statut non actif (inactif, expiré, résilié, etc.)
                return response()->view('tenancy.expired', [
                    'tenant' => $tenant,
                    'raison' => 'L\'accès à cet établissement n\'est actuellement pas actif. Veuillez contacter l\'administration de Buyedi Solutions.'
                ], 402);
            }
        }

        return $next($request);
    }
}
