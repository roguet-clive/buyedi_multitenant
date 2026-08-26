<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Inscription;
use App\Models\AnneeScolaire;
use App\Models\FraisClasse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

use App\Traits\HandlesStudentAccess;

class PaiementController extends Controller
{
    use HandlesStudentAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_paiements')->only(['index', 'show']);
        $this->middleware('permission:ajouter_paiements')->only(['create', 'store']);
        // $this->middleware('permission:modifier_paiements')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_paiements')->only(['destroy']);
    }

    public function recu(Paiement $paiement)
    {
        $user = auth()->user();

        // Vérifier que l'utilisateur a le droit de voir ce paiement
        if ($this->isStudent()) {
             if ($paiement->inscription->eleve->user_id !== $user->id) {
                abort(403, 'Accès non autorisé.');
             }
        } elseif ($user->hasRole('parent')) {
             $hasChild = $user->parent?->eleves()->where('eleves.id', $paiement->inscription->eleve_id)->exists();
             if (!$hasChild) {
                 abort(403, 'Accès non autorisé au reçu de cet élève.');
             }
        } else {
            if (!$user->can('voir_paiements')) {
                abort(403, 'Accès réservé.');
            }
        }

        $paiement->load(['inscription.eleve.user', 'inscription.anneeScolaire', 'inscription.classe', 'fraisType', 'user']);
        $inscription = $paiement->inscription;

        // Calcul du contexte financier pour ce type de frais
        $fraisClasse = FraisClasse::where('classe_id', $inscription->classe_id)
            ->where('annee_scolaire_id', $inscription->annee_scolaire_id)
            ->where('frais_type_id', $paiement->frais_type_id)
            ->first();

        $montantAnnuel = $fraisClasse ? (float) $fraisClasse->montant : (float) $paiement->montant;

        $totalPayeJusquici = (float) Paiement::where('inscription_id', $inscription->id)
            ->where('frais_type_id', $paiement->frais_type_id)
            ->where('id', '<=', $paiement->id)
            ->sum('montant');

        $resteApresPaiement = max(0, $montantAnnuel - $totalPayeJusquici);

        return Inertia::render('Paiements/Recu', [
            'paiement' => [
                'id' => $paiement->id,
                'numero_recu' => 'REC-' . str_pad($paiement->id, 6, '0', STR_PAD_LEFT),
                'montant' => (float) $paiement->montant,
                'date_paiement' => $paiement->date_paiement ? \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') : now()->format('d/m/Y'),
                'created_at' => $paiement->created_at ? $paiement->created_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i'),
                'mode_paiement' => $paiement->mode_paiement,
                'mois' => $paiement->mois,
                'commentaire' => $paiement->commentaire,
                'frais_type_nom' => $paiement->fraisType->nom ?? 'Frais Scolaires',
                'is_scolarite' => (bool) ($paiement->fraisType->is_scolarite ?? false),
                'caissier' => $paiement->user ? ($paiement->user->nom . ' ' . $paiement->user->prenom) : 'Caisse Principale',
                'eleve_nom_complet' => ($paiement->inscription->eleve->user->nom ?? '') . ' ' . ($paiement->inscription->eleve->user->prenom ?? ''),
                'eleve_matricule' => $paiement->inscription->eleve->matricule ?? 'N/A',
                'classe_nom' => $paiement->inscription->classe->nom ?? 'N/A',
                'annee_scolaire_nom' => $paiement->inscription->anneeScolaire->nom ?? 'N/A',
                'financial_context' => [
                    'montant_annuel' => $montantAnnuel,
                    'total_deja_paye' => $totalPayeJusquici,
                    'reste_du' => $resteApresPaiement,
                ]
            ],
            'url_verification' => url('/paiements/' . $paiement->id . '/recu'),
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first() ?? AnneeScolaire::latest()->first();
        if (!$currentYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire configurée.');
        }

        $user = auth()->user();

        // 🎓 VUE ÉLÈVE & PARENT
        if ($this->isStudent() || $user->hasRole('parent')) {
            $isParent = $user->hasRole('parent');
            $children = collect();
            $selectedEleveId = $request->input('eleve_id');

            if ($isParent) {
                $parent = $user->parent;
                $children = $parent ? $parent->eleves()->with(['inscriptions' => function($q) use ($currentYear) {
                    $q->where('annee_scolaire_id', $currentYear->id)->with('classe');
                }])->get() : collect();

                if ($children->isEmpty()) {
                    return back()->with('error', 'Aucun enfant inscrit pour l\'année scolaire en cours.');
                }

                $selectedEleve = $selectedEleveId 
                    ? $children->firstWhere('id', $selectedEleveId) 
                    : $children->first();

                if (!$selectedEleve) $selectedEleve = $children->first();
                $inscription = $selectedEleve->inscriptions->first();
            } else {
                $inscription = $this->getStudentInscription();
                $selectedEleve = $inscription?->eleve;
            }

            if (!$inscription || !$selectedEleve) {
                return back()->with('error', 'Aucune inscription active trouvée pour l\'année en cours.');
            }

            // Historique des paiements de l'élève sélectionné
            $paiements = Paiement::with(['fraisType', 'user'])
                ->where('inscription_id', $inscription->id)
                ->latest('date_paiement')
                ->latest('id')
                ->get();

            // Frais de classe pour cette inscription
            $fraisClasse = FraisClasse::where('classe_id', $inscription->classe_id)
                ->where('annee_scolaire_id', $inscription->annee_scolaire_id)
                ->with('fraisType')
                ->get();

            $balanceData = [];
            $totalDue = 0;
            $totalPaid = 0;

            foreach ($fraisClasse as $fc) {
                $typeId = $fc->frais_type_id;
                $montantDu = (float) $fc->montant;
                $payePourCeType = (float) $paiements->where('frais_type_id', $typeId)->sum('montant');
                $reste = max(0, $montantDu - $payePourCeType);
                $percent = $montantDu > 0 ? min(100, round(($payePourCeType / $montantDu) * 100)) : 100;

                $balanceData[] = [
                    'id' => $fc->id,
                    'type' => $fc->fraisType->nom,
                    'is_scolarite' => (bool) ($fc->fraisType->is_scolarite ?? false),
                    'du' => $montantDu,
                    'paye' => $payePourCeType,
                    'reste' => $reste,
                    'percent' => $percent,
                    'status' => $reste == 0 ? 'paye' : ($payePourCeType > 0 ? 'partiel' : 'impaye')
                ];

                $totalDue += $montantDu;
                $totalPaid += $payePourCeType;
            }

            $overallPercent = $totalDue > 0 ? min(100, round(($totalPaid / $totalDue) * 100)) : 100;

            return Inertia::render('Paiements/Student', [
                'isParent' => $isParent,
                'children' => $children->map(fn($c) => [
                    'id' => $c->id,
                    'nom_complet' => "{$c->nom} {$c->prenom}",
                    'matricule' => $c->matricule,
                    'classe' => $c->inscriptions->first()?->classe?->nom ?? 'N/A'
                ]),
                'selectedEleve' => [
                    'id' => $selectedEleve->id,
                    'nom_complet' => "{$selectedEleve->nom} {$selectedEleve->prenom}",
                    'matricule' => $selectedEleve->matricule,
                    'classe' => $inscription->classe?->nom ?? 'N/A',
                ],
                'paiements' => $paiements,
                'balance' => $balanceData,
                'totals' => [
                    'due' => $totalDue,
                    'paid' => $totalPaid,
                    'remaining' => max(0, $totalDue - $totalPaid),
                    'percent' => $overallPercent,
                ]
            ]);
        }

        // 🛡️ VUE ADMIN
        $search = $request->input('search');
        $anneeId = $request->input('annee_scolaire_id', $currentYear->id);
        $modePaiement = $request->input('mode_paiement');
        $classeId = $request->input('classe_id');
        $dateDebut = $request->input('date_debut');
        $dateFin = $request->input('date_fin');

        $baseQuery = Paiement::query()
            ->whereHas('inscription', function ($query) use ($anneeId) {
                $query->where('annee_scolaire_id', $anneeId);
            });

        // Calcul des statistiques globales pour l'année scolaire
        $today = now()->format('Y-m-d');
        $currentMonth = now()->format('Y-m');

        $stats = [
            'total_annee' => (float) (clone $baseQuery)->sum('montant'),
            'total_today' => (float) (clone $baseQuery)->whereDate('date_paiement', $today)->sum('montant'),
            'total_month' => (float) (clone $baseQuery)->where('date_paiement', 'like', "{$currentMonth}%")->sum('montant'),
            'total_especes' => (float) (clone $baseQuery)->where('mode_paiement', 'especes')->sum('montant'),
            'total_mobile' => (float) (clone $baseQuery)->where('mode_paiement', 'mobile')->sum('montant'),
            'total_banque' => (float) (clone $baseQuery)->whereIn('mode_paiement', ['virement', 'cheque'])->sum('montant'),
            'nb_transactions' => (int) (clone $baseQuery)->count(),
        ];

        // Requête filtrée pour le tableau
        $query = (clone $baseQuery)
            ->with(['inscription.eleve.user', 'inscription.classe', 'fraisType', 'user'])
            ->when($modePaiement, fn($q) => $q->where('mode_paiement', $modePaiement))
            ->when($classeId, fn($q) => $q->whereHas('inscription', fn($sq) => $sq->where('classe_id', $classeId)))
            ->when($dateDebut, fn($q) => $q->whereDate('date_paiement', '>=', $dateDebut))
            ->when($dateFin, fn($q) => $q->whereDate('date_paiement', '<=', $dateFin))
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('commentaire', 'like', "%{$search}%")
                      ->orWhere('mois', 'like', "%{$search}%")
                      ->orWhereHas('inscription.eleve.user', function ($qu) use ($search) {
                          $qu->where('nom', 'like', "%{$search}%")
                             ->orWhere('prenom', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('inscription.eleve', function ($qe) use ($search) {
                          $qe->where('matricule', 'like', "%{$search}%");
                      });
                });
            });

        $stats['total_filtre'] = (float) (clone $query)->sum('montant');
        $stats['count_filtre'] = (int) (clone $query)->count();

        $paiements = $query->latest('date_paiement')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $annees = AnneeScolaire::orderBy('nom', 'desc')->get();
        
        // Charger les inscriptions de l'année pour le formulaire de saisie
        $inscriptions = Inscription::with(['eleve.user', 'classe', 'paiements.fraisType'])
            ->where('annee_scolaire_id', $anneeId)
            ->get()
            ->map(function ($i) {
                // Somme des paiements déjà effectués pour la scolarité
                $totalScolaritePayee = $i->paiements
                    ->filter(fn($p) => $p->fraisType && $p->fraisType->is_scolarite)
                    ->sum('montant');

                // Liste des mois déjà réglés
                $moisRegles = $i->paiements
                    ->filter(fn($p) => $p->fraisType && $p->fraisType->is_scolarite && !empty($p->mois))
                    ->pluck('mois')
                    ->map(function($m) {
                        return array_map('trim', explode(',', $m));
                    })
                    ->flatten()
                    ->unique()
                    ->values();

                return [
                    'id' => $i->id,
                    'label' => ($i->eleve->user->nom ?? '') . ' ' . ($i->eleve->user->prenom ?? '') . ' (' . ($i->classe->nom ?? '') . ')',
                    'eleve_nom_complet' => ($i->eleve->user->nom ?? '') . ' ' . ($i->eleve->user->prenom ?? ''),
                    'matricule' => $i->eleve->matricule ?? '',
                    'classe_id' => $i->classe_id,
                    'classe_nom' => $i->classe->nom ?? '',
                    'total_scolarite_payee' => (float) $totalScolaritePayee,
                    'mois_regles' => $moisRegles,
                ];
            });

        $fraisTypes = \App\Models\FraisType::where('annee_scolaire_id', $anneeId)->get();
        $fraisClasses = \App\Models\FraisClasse::where('annee_scolaire_id', $anneeId)->get();

        return Inertia::render('Paiements/Index', [
            'paiements' => $paiements,
            'stats' => $stats,
            'annees' => $annees,
            'currentAnneeId' => (int) $anneeId,
            'inscriptions' => $inscriptions,
            'classes' => \App\Models\Classe::orderBy('nom')->get(),
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses,
            'filters' => [
                'search' => $search,
                'annee_scolaire_id' => (int) $anneeId,
                'mode_paiement' => $modePaiement,
                'classe_id' => $classeId,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'inscription_id' => 'required|exists:inscriptions,id',
            'frais_type_id' => 'required|exists:frais_types,id',
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:especes,virement,mobile,cheque',
            'mois' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Date de paiement automatique = aujourd'hui
            $datePaiement = $request->date_paiement ?: now()->toDateString();

            // 1. Créer le paiement
            $paiement = Paiement::create([
                'inscription_id' => $request->inscription_id,
                'frais_type_id' => $request->frais_type_id,
                'user_id' => auth()->id(),
                'montant' => $request->montant,
                'date_paiement' => $datePaiement,
                'mode_paiement' => $request->mode_paiement,
                'mois' => $request->mois,
                'commentaire' => $request->commentaire,
            ]);

            // 2. Logique de solde supprimée car FraisInscription est retiré
            // Le solde sera calculé dynamiquement à la volée si nécessaire

            DB::commit();

            return redirect()->back()->with('success', 'Paiement enregistré avec succès ✅');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de l\'enregistrement du paiement: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Paiement $paiement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Paiement $paiement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Paiement $paiement)
    {
        // Pour modifier un paiement, attention aux montants déjà cumulés.
        // À implémenter avec précaution (annulation + re-création souvent mieux).
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paiement $paiement)
    {
        DB::beginTransaction();
        try {
            $paiement->delete();
            DB::commit();
            return redirect()->back()->with('success', 'Paiement supprimé 🗑️');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Erreur lors de la suppression');
        }
    }
}
