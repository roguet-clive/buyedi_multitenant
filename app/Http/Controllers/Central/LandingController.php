<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Inertia\Inertia;

class LandingController extends Controller
{
    /**
     * Affiche la page d'accueil de la plateforme Buyedi SaaS
     */
    public function index()
    {
        $tenants = Tenant::with('domains')
            ->select('id', 'nom', 'statut', 'formule', 'created_at')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'nom' => $tenant->nom,
                    'statut' => $tenant->statut,
                    'formule' => $tenant->formule,
                    'domain' => $tenant->domains->first()?->domain ?? "{$tenant->id}.localhost",
                ];
            });

        return Inertia::render('Central/Landing', [
            'tenants' => $tenants,
            'pricing' => [
                'starter' => [
                    'name' => 'Starter',
                    'price' => '25 000 FCFA / mois',
                    'tagline' => 'Idéal pour petites écoles ou maternelles',
                    'features' => [
                        'Jusqu\'à 150 élèves',
                        'Inscriptions & Dossiers élèves',
                        'Gestion des frais & reçus de paiement',
                        'Reçus certifiés avec QR Code sécurisé',
                        '1 Année scolaire active',
                        'Support par email standard',
                    ],
                ],
                'pro' => [
                    'name' => 'Professionnel',
                    'price' => '60 000 FCFA / mois',
                    'popular' => true,
                    'tagline' => 'Pour écoles primaires & secondaires établies',
                    'features' => [
                        'Jusqu\'à 800 élèves',
                        'Tous les modules Starter inclus',
                        'Bulletins de notes officiels conformes MEN',
                        'Gestion des arriérés & relances financières',
                        'Gestion RH & fiches de paie enseignants',
                        'Tableau de bord financier & analytique en direct',
                        'Support prioritaire WhatsApp & Téléphone 6j/7',
                    ],
                ],
                'enterprise' => [
                    'name' => 'Entreprise / Groupe Scolaire',
                    'price' => 'Sur devis personnalisé',
                    'tagline' => 'Pour grands complexes & multi-sites',
                    'features' => [
                        'Élèves & classes illimités',
                        'Tous les modules actuels et futurs',
                        'Portail parents dédié avec accès mobile',
                        'Notifications SMS & WhatsApp automatisées',
                        'Nom de domaine personnalisé dédié (ex: mon-ecole.ga)',
                        'Sauvegardes automatiques quotidiennes sur cloud privé',
                        'Chef de projet dédié & formation sur site de vos équipes',
                    ],
                ],
            ],
        ]);
    }
}
