<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Eleve;
use App\Models\Inscription;
use App\Models\Note;
use App\Models\Paiement;
use App\Models\Depense;
use App\Models\Cours;
use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        
        $filters = [
            'annee_id' => $request->input('annee_id', $currentYear?->id),
            'classe_id' => $request->input('classe_id'),
            'category' => $request->input('category', 'eleves'), // eleves, notes, finances, pedagogie
            'search' => $request->input('search'),
        ];

        $data = [];
        $anneeId = $filters['annee_id'];
        $classeId = $filters['classe_id'];
        $search = $filters['search'];

        // Reprendre les données selon la catégorie
        switch ($filters['category']) {
            case 'eleves':
                $data = Inscription::with(['eleve.user', 'classe'])
                    ->where('annee_scolaire_id', $anneeId)
                    ->when($classeId, fn($q) => $q->where('classe_id', $classeId))
                    ->when($search, function($q) use ($search) {
                        $q->whereHas('eleve.user', function($qu) use ($search) {
                            $qu->where('nom', 'like', "%{$search}%")
                               ->orWhere('prenom', 'like', "%{$search}%");
                        });
                    })
                    ->latest()
                    ->paginate(20)
                    ->withQueryString();
                break;

            case 'notes':
                $data = Note::with(['evaluation.cours.matiere', 'evaluation.periode', 'inscription.eleve.user', 'inscription.classe'])
                    ->whereHas('inscription', function($q) use ($anneeId, $classeId) {
                        $q->where('annee_scolaire_id', $anneeId)
                          ->when($classeId, fn($q2) => $q2->where('classe_id', $classeId));
                    })
                    ->when($search, function($q) use ($search) {
                        $q->whereHas('inscription.eleve.user', function($qu) use ($search) {
                            $qu->where('nom', 'like', "%{$search}%")
                               ->orWhere('prenom', 'like', "%{$search}%");
                        });
                    })
                    ->paginate(20)
                    ->withQueryString();
                break;

            case 'finances':
                $paiements = Paiement::with(['inscription.eleve.user', 'fraisType'])
                    ->whereHas('inscription', fn($q) => $q->where('annee_scolaire_id', $anneeId))
                    ->when($search, function($q) use ($search) {
                        $q->whereHas('inscription.eleve.user', function($qu) use ($search) {
                            $qu->where('nom', 'like', "%{$search}%")
                               ->orWhere('prenom', 'like', "%{$search}%");
                        });
                    })
                    ->get();
                
                $depenses = Depense::whereYear('date_depense', AnneeScolaire::find($anneeId)?->nom ?? date('Y')) // Simplified
                    ->get();

                $data = [
                    'paiements' => $paiements,
                    'depenses' => $depenses,
                    'total_recettes' => $paiements->sum('montant'),
                    'total_depenses' => $depenses->sum('montant'),
                ];
                break;

            case 'pedagogie':
                $data = [
                    'cours' => Cours::with(['matiere', 'classe', 'enseignant.user'])
                        ->where('annee_scolaire_id', $anneeId)
                        ->when($classeId, fn($q) => $q->where('classe_id', $classeId))
                        ->get(),
                    'emplois' => EmploiDuTemps::with(['matiere', 'classe', 'enseignant.user'])
                        ->where('annee_scolaire_id', $anneeId)
                        ->when($classeId, fn($q) => $q->where('classe_id', $classeId))
                        ->get(),
                ];
                break;

            case 'base_de_donnees':
                $data = Eleve::with(['user', 'inscriptions.classe'])
                    ->when($search, function($q) use ($search) {
                        $q->whereHas('user', function($qu) use ($search) {
                            $qu->where('nom', 'like', "%{$search}%")
                               ->orWhere('prenom', 'like', "%{$search}%");
                        })->orWhere('matricule', 'like', "%{$search}%");
                    })
                    ->latest()
                    ->paginate(30)
                    ->withQueryString();
                break;
        }

        return Inertia::render('Archive/Index', [
            'annees' => AnneeScolaire::orderBy('nom', 'desc')->get(),
            'classes' => Classe::orderBy('nom')->get(),
            'filters' => $filters,
            'archiveData' => $data,
        ]);
    }
}
