<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Inscription;
use App\Models\AnneeScolaire;
use App\Models\FraisClasse;
use App\Models\Classe;
use App\Models\FraisType;
use App\Models\Etablissement;
use App\Models\Arriere;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

use App\Traits\HandlesStudentAccess;

class PaiementController extends Controller
{
    use HandlesStudentAccess;

    public function __construct()
    {
        $this->middleware('permission:voir_paiements')->only(['index', 'show', 'journal', 'impayes']);
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

        $isForfaitScolarite = ($paiement->fraisType?->is_scolarite || $paiement->fraisType?->nom === 'Scolarité') && (
            str_contains(strtolower($paiement->commentaire ?? ''), 'forfait') ||
            ($inscription->classe?->isSecondaire() && in_array((int)$paiement->montant, [60000, 65000, 70000]))
        );

        $fraisTypeNom = $paiement->fraisType->nom ?? 'Frais Scolaires';
        if ($isForfaitScolarite) {
            $fraisTypeNom = '1ère Tranche de Scolarité';
        }

        return Inertia::render('Paiements/Recu', [
            'paiement' => [
                'id' => $paiement->id,
                'numero_recu' => $paiement->reference_recu ?: ('REC-' . str_pad($paiement->id, 6, '0', STR_PAD_LEFT)),
                'montant' => (float) $paiement->montant,
                'date_paiement' => $paiement->date_paiement ? \Carbon\Carbon::parse($paiement->date_paiement)->format('d/m/Y') : now()->format('d/m/Y'),
                'created_at' => $paiement->created_at ? $paiement->created_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i'),
                'mode_paiement' => $paiement->mode_paiement,
                'mois' => $paiement->mois,
                'commentaire' => $paiement->commentaire,
                'frais_type_nom' => $fraisTypeNom,
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
            'url_verification' => route('paiements.verify', $paiement->reference_recu ?: $paiement->id),
        ]);
    }
 
    /**
     * Bordereau et Journal de Caisse officiel imprimable.
     */
    public function journal(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first() ?? AnneeScolaire::latest()->first();
        if (!$currentYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire configurée.');
        }

        $search = $request->input('search');
        $anneeId = $request->input('annee_scolaire_id', $currentYear->id);
        $modePaiement = $request->input('mode_paiement');
        $classeId = $request->input('classe_id');
        $dateDebut = $request->input('date_debut');
        $dateFin = $request->input('date_fin');

        $query = Paiement::query()
            ->whereHas('inscription', function ($q) use ($anneeId) {
                if ($anneeId) {
                    $q->where('annee_scolaire_id', $anneeId);
                }
            })
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
                             ->orWhere('prenom', 'like', "%{$search}%");
                      })
                      ->orWhereHas('inscription.eleve', function ($qe) use ($search) {
                          $qe->where('matricule', 'like', "%{$search}%");
                      });
                });
            });

        $paiements = (clone $query)->orderBy('date_paiement', 'asc')->orderBy('id', 'asc')->get();

        $totalGeneral = (float) $paiements->sum('montant');
        $totalEspeces = (float) $paiements->where('mode_paiement', 'especes')->sum('montant');
        $totalMobile = (float) $paiements->where('mode_paiement', 'mobile')->sum('montant');
        $totalBanque = (float) $paiements->whereIn('mode_paiement', ['virement', 'cheque'])->sum('montant');

        // Synthèse analytique par classe
        $parClasse = $paiements->groupBy(function ($p) {
            return $p->inscription?->classe_id ?? 0;
        })->map(function ($items, $cid) use ($totalGeneral) {
            $first = $items->first();
            $classe = $first->inscription?->classe;
            $classeNom = $classe ? $classe->nom : 'Classe non assignée';
            $classeType = $classe ? $classe->type : 'autre';

            $totalClasse = (float) $items->sum('montant');
            $scolarite = (float) $items->filter(function ($p) {
                return ($p->fraisType?->is_scolarite || strtolower($p->fraisType?->nom ?? '') === 'scolarité');
            })->sum('montant');
            $annexes = (float) ($totalClasse - $scolarite);

            $nbOperations = $items->pluck('reference_recu')->filter()->unique()->count() ?: $items->count();
            $nbFlux = $items->count();
            $nbEleves = $items->pluck('inscription.eleve_id')->filter()->unique()->count();
            $pourcentage = $totalGeneral > 0 ? round(($totalClasse / $totalGeneral) * 100, 1) : 0;

            return [
                'classe_id' => $cid ?: null,
                'classe_nom' => $classeNom,
                'classe_type' => $classeType,
                'nb_operations' => $nbOperations,
                'nb_flux' => $nbFlux,
                'nb_eleves' => $nbEleves,
                'scolarite' => $scolarite,
                'annexes' => $annexes,
                'total' => $totalClasse,
                'pourcentage' => $pourcentage,
            ];
        })->sortByDesc('total')->values();

        $annee = $anneeId ? AnneeScolaire::find($anneeId) : $currentYear;
        $classe = $classeId ? \App\Models\Classe::find($classeId) : null;
        $user = auth()->user();

        return Inertia::render('Paiements/Journal', [
            'paiements' => $paiements->map(function ($p) {
                $isForfaitScolarite = ($p->fraisType?->is_scolarite || $p->fraisType?->nom === 'Scolarité') && (
                    str_contains(strtolower($p->commentaire ?? ''), 'forfait') ||
                    ($p->inscription?->classe?->isSecondaire() && in_array((int)$p->montant, [60000, 65000, 70000]))
                );

                $motif = $p->fraisType?->nom ?? 'Frais Scolaires';
                if ($isForfaitScolarite) {
                    $motif = '1ère Tranche Scolarité';
                } elseif ($p->mois) {
                    $motif .= ' (' . $p->mois . ')';
                }

                return [
                    'id' => $p->id,
                    'reference_recu' => $p->reference_recu ?: ('REC-' . str_pad($p->id, 6, '0', STR_PAD_LEFT)),
                    'date_paiement' => $p->date_paiement ? \Carbon\Carbon::parse($p->date_paiement)->format('d/m/Y') : '',
                    'created_at' => $p->created_at ? $p->created_at->format('d/m/Y H:i') : '',
                    'montant' => (float) $p->montant,
                    'mode_paiement' => $p->mode_paiement,
                    'reference' => $p->reference,
                    'motif' => $motif,
                    'commentaire' => $p->commentaire,
                    'eleve_nom' => ($p->inscription?->eleve?->user?->nom ?? '') . ' ' . ($p->inscription?->eleve?->user?->prenom ?? ''),
                    'eleve_matricule' => $p->inscription?->eleve?->matricule ?? '-',
                    'classe_nom' => $p->inscription?->classe?->nom ?? '-',
                    'caissier' => $p->user ? ($p->user->nom . ' ' . ($p->user->prenom ? $p->user->prenom[0] . '.' : '')) : 'Caisse',
                ];
            }),
            'par_classe' => $parClasse,
            'stats' => [
                'total' => $totalGeneral,
                'especes' => $totalEspeces,
                'mobile' => $totalMobile,
                'banque' => $totalBanque,
                'nb_operations' => $paiements->count(),
                'nb_classes' => $parClasse->count(),
                'total_scolarite' => (float) $parClasse->sum('scolarite'),
                'total_annexes' => (float) $parClasse->sum('annexes'),
            ],
            'meta' => [
                'annee' => $annee?->nom ?? 'N/A',
                'classe' => $classe?->nom ?? 'Toutes les classes',
                'mode' => $modePaiement ? strtoupper($modePaiement) : 'Tous les modes',
                'date_debut' => $dateDebut ? \Carbon\Carbon::parse($dateDebut)->format('d/m/Y') : null,
                'date_fin' => $dateFin ? \Carbon\Carbon::parse($dateFin)->format('d/m/Y') : null,
                'search' => $search ?: null,
                'vue_initiale' => $request->input('vue', 'details'),
                'editeur' => ($user->nom ?? '') . ' ' . ($user->prenom ?? ''),
                'date_edition' => now()->format('d/m/Y à H:i'),
            ]
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
                ->with(['fraisType', 'echeances'])
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
                    'status' => $reste == 0 ? 'paye' : ($payePourCeType > 0 ? 'partiel' : 'impaye'),
                    'echeances' => $fc->echeances,
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

        $statsData = (clone $baseQuery)->selectRaw('
            COALESCE(SUM(montant), 0) as total_annee,
            COALESCE(SUM(CASE WHEN DATE(date_paiement) = ? THEN montant ELSE 0 END), 0) as total_today,
            COALESCE(SUM(CASE WHEN date_paiement LIKE ? THEN montant ELSE 0 END), 0) as total_month,
            COALESCE(SUM(CASE WHEN mode_paiement = "especes" THEN montant ELSE 0 END), 0) as total_especes,
            COALESCE(SUM(CASE WHEN mode_paiement = "mobile" THEN montant ELSE 0 END), 0) as total_mobile,
            COALESCE(SUM(CASE WHEN mode_paiement IN ("virement", "cheque") THEN montant ELSE 0 END), 0) as total_banque,
            COUNT(*) as nb_flux,
            COUNT(DISTINCT COALESCE(reference_recu, id)) as nb_operations
        ', [$today, "{$currentMonth}%"])->first();

        $stats = [
            'total_annee' => (float) ($statsData->total_annee ?? 0),
            'total_today' => (float) ($statsData->total_today ?? 0),
            'total_month' => (float) ($statsData->total_month ?? 0),
            'total_especes' => (float) ($statsData->total_especes ?? 0),
            'total_mobile' => (float) ($statsData->total_mobile ?? 0),
            'total_banque' => (float) ($statsData->total_banque ?? 0),
            'nb_transactions' => (int) ($statsData->nb_operations ?? 0),
            'nb_operations' => (int) ($statsData->nb_operations ?? 0),
            'nb_flux' => (int) ($statsData->nb_flux ?? 0),
        ];

        // Requête filtrée pour le tableau
        $query = (clone $baseQuery)
            ->with(['inscription.eleve.user', 'inscription.classe', 'fraisType', 'user'])
            ->when($modePaiement, fn($q) => $q->where('paiements.mode_paiement', $modePaiement))
            ->when($classeId, fn($q) => $q->whereHas('inscription', fn($sq) => $sq->where('classe_id', $classeId)))
            ->when($dateDebut, fn($q) => $q->whereDate('paiements.date_paiement', '>=', $dateDebut))
            ->when($dateFin, fn($q) => $q->whereDate('paiements.date_paiement', '<=', $dateFin))
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

        $filteredData = (clone $query)->selectRaw('
            COALESCE(SUM(montant), 0) as total_filtre,
            COUNT(*) as count_flux,
            COUNT(DISTINCT COALESCE(reference_recu, id)) as count_operations
        ')->first();

        $stats['total_filtre'] = (float) ($filteredData->total_filtre ?? 0);
        $stats['count_filtre'] = (int) ($filteredData->count_operations ?? 0);
        $stats['count_operations'] = (int) ($filteredData->count_operations ?? 0);
        $stats['count_flux'] = (int) ($filteredData->count_flux ?? 0);

        $paiements = (clone $query)->latest('paiements.date_paiement')
            ->latest('paiements.id')
            ->paginate(30)
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
                    'classe_type' => $i->classe->type ?? '',
                    'is_secondaire' => $i->classe ? $i->classe->isSecondaire() : false,
                    'montant_tenue_exigible' => (float) $i->montant_tenue_exigible,
                    'total_scolarite_payee' => (float) $totalScolaritePayee,
                    'mois_regles' => $moisRegles,
                    'tenue_payee' => (bool) $i->tenue_payee,
                    'has_remise' => (bool) $i->has_remise,
                    'remise_pourcentage' => (float) $i->remise_pourcentage,
                    'remise_montant' => (float) $i->remise_montant,
                ];
            });

        $fraisTypes = \App\Models\FraisType::where(function($q) use ($anneeId) {
            $q->where('annee_scolaire_id', $anneeId)->orWhereNull('annee_scolaire_id');
        })->get();
        $fraisClasses = \App\Models\FraisClasse::where('annee_scolaire_id', $anneeId)
            ->with(['echeances', 'classe'])
            ->get();

        // Synthèse analytique par classe sur les critères de recherche actifs
        $recapClasses = (clone $query)
            ->reorder()
            ->join('inscriptions', 'paiements.inscription_id', '=', 'inscriptions.id')
            ->join('classes', 'inscriptions.classe_id', '=', 'classes.id')
            ->leftJoin('frais_types', 'paiements.frais_type_id', '=', 'frais_types.id')
            ->selectRaw('
                classes.id as classe_id,
                classes.nom as classe_nom,
                classes.type as classe_type,
                COUNT(paiements.id) as nb_flux,
                COUNT(DISTINCT COALESCE(paiements.reference_recu, paiements.id)) as nb_operations,
                COUNT(DISTINCT inscriptions.eleve_id) as nb_eleves,
                COALESCE(SUM(CASE WHEN frais_types.is_scolarite = 1 OR LOWER(frais_types.nom) = "scolarité" THEN paiements.montant ELSE 0 END), 0) as scolarite,
                COALESCE(SUM(CASE WHEN (frais_types.is_scolarite = 0 OR frais_types.is_scolarite IS NULL) AND LOWER(COALESCE(frais_types.nom, "")) != "scolarité" THEN paiements.montant ELSE 0 END), 0) as annexes,
                COALESCE(SUM(paiements.montant), 0) as total
            ')
            ->groupBy('classes.id', 'classes.nom', 'classes.type')
            ->orderByDesc('total')
            ->get()
            ->map(function ($row) use ($filteredData) {
                $totalGeneral = (float) ($filteredData->total_filtre ?? 0);
                $totalClasse = (float) $row->total;
                return [
                    'classe_id' => $row->classe_id,
                    'classe_nom' => $row->classe_nom,
                    'classe_type' => $row->classe_type,
                    'nb_flux' => (int) $row->nb_flux,
                    'nb_operations' => (int) $row->nb_operations,
                    'nb_eleves' => (int) $row->nb_eleves,
                    'scolarite' => (float) $row->scolarite,
                    'annexes' => (float) $row->annexes,
                    'total' => $totalClasse,
                    'pourcentage' => $totalGeneral > 0 ? round(($totalClasse / $totalGeneral) * 100, 1) : 0,
                ];
            });

        $stats['nb_classes_filtre'] = $recapClasses->count();
        $stats['total_scolarite_filtre'] = (float) $recapClasses->sum('scolarite');
        $stats['total_annexes_filtre'] = (float) $recapClasses->sum('annexes');

        return Inertia::render('Paiements/Index', [
            'paiements' => $paiements,
            'recapClasses' => $recapClasses,
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
            $refRecu = 'REC-' . now()->format('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4));

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
                'reference_recu' => $refRecu,
            ]);

            // 2. Logique de solde supprimée car FraisInscription est retiré
            // Le solde sera calculé dynamiquement à la volée si nécessaire

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Paiement enregistré avec succès ✅',
                'dernier_paiement_id' => $paiement->id,
                'dernier_paiement_recu' => $refRecu,
            ]);

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

    /**
     * Vérification publique d'un reçu de paiement scanné par QR code.
     */
    public function verify($reference)
    {
        $paiement = Paiement::where('reference_recu', $reference)
            ->orWhere('id', $reference)
            ->with(['inscription.eleve.user', 'inscription.classe', 'inscription.anneeScolaire', 'fraisType', 'user'])
            ->first();

        $etablissement = \App\Models\Etablissement::first();

        return Inertia::render('Paiements/Verify', [
            'paiement' => $paiement ? [
                'id' => $paiement->id,
                'reference_recu' => $paiement->reference_recu ?: ('REC-' . str_pad($paiement->id, 6, '0', STR_PAD_LEFT)),
                'montant' => (float) $paiement->montant,
                'date_paiement' => $paiement->date_paiement ? $paiement->date_paiement->format('Y-m-d') : null,
                'mode_paiement' => $paiement->mode_paiement,
                'mois' => $paiement->mois,
                'commentaire' => $paiement->commentaire,
                'frais_type_nom' => $paiement->fraisType->nom ?? 'Frais Divers',
                'is_scolarite' => (bool) ($paiement->fraisType->is_scolarite ?? false),
                'caissier' => $paiement->user ? ($paiement->user->nom . ' ' . $paiement->user->prenom) : 'Caisse Principale',
                'eleve_nom_complet' => ($paiement->inscription->eleve->user->nom ?? '') . ' ' . ($paiement->inscription->eleve->user->prenom ?? ''),
                'eleve_matricule' => $paiement->inscription->eleve->matricule ?? 'N/A',
                'classe_nom' => $paiement->inscription->classe->nom ?? 'N/A',
                'annee_scolaire_nom' => $paiement->inscription->anneeScolaire->nom ?? 'N/A',
                'created_at' => $paiement->created_at ? $paiement->created_at->toISOString() : null,
            ] : null,
            'reference' => $reference,
            'type_recu' => 'paiement',
            'etablissement' => $etablissement ? [
                'nom' => $etablissement->nom,
                'telephone' => $etablissement->telephone,
                'email' => $etablissement->email,
                'adresse' => $etablissement->adresse,
                'ville' => $etablissement->ville,
                'devise' => $etablissement->devise ?? 'Discipline - Travail - Succès',
                'logo_url' => $etablissement->logo_path ? asset('storage/' . $etablissement->logo_path) : null,
            ] : null,
        ]);
    }

    /**
     * État global des impayés et recouvrement (Scolarité, Tenues, Arriérés).
     */
    public function impayes(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first() ?? AnneeScolaire::latest()->first();
        if (!$currentYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire active configurée.');
        }

        $anneeId = $request->input('annee_scolaire_id', $currentYear->id);
        $classeId = $request->input('classe_id');
        $search = $request->input('search');
        $nature = $request->input('nature', 'all'); // 'all', 'scolarite', 'tenue', 'arriere'
        $statutRetard = $request->input('retard', 'all'); // 'all', 'echu_only'

        $annees = AnneeScolaire::orderBy('nom', 'desc')->get();
        $classes = Classe::orderBy('nom')->get();

        // Arriérés antérieurs non soldés groupés par eleve_id
        $arrieresGrouped = \App\Models\Arriere::where('statut', '!=', 'solde')
            ->get()
            ->groupBy('eleve_id');

        // Frais types et frais classes pour l'année
        $fraisTypes = FraisType::where(function($q) use ($anneeId) {
            $q->where('annee_scolaire_id', $anneeId)->orWhereNull('annee_scolaire_id');
        })->get();

        $fraisClasses = FraisClasse::where('annee_scolaire_id', $anneeId)
            ->whereHas('fraisType', fn($q) => $q->where('is_scolarite', true))
            ->with(['echeances', 'classe'])
            ->get()
            ->keyBy('classe_id');

        $fraisTypeScolarite = $fraisTypes->firstWhere('is_scolarite', true);

        // Inscriptions de l'année scolaire sélectionnée
        $inscriptionsQuery = Inscription::where('annee_scolaire_id', $anneeId)
            ->with([
                'eleve.user',
                'eleve.parents.user',
                'classe',
                'paiements.fraisType'
            ]);

        if ($classeId) {
            $inscriptionsQuery->where('classe_id', $classeId);
        }

        if ($search) {
            $inscriptionsQuery->whereHas('eleve', function($q) use ($search) {
                $q->where('matricule', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('nom', 'like', "%{$search}%")
                         ->orWhere('prenom', 'like', "%{$search}%");
                  });
            });
        }

        $inscriptions = $inscriptionsQuery->get();

        // Mois scolaire actuel (1 = Sept, ..., 9 = Mai)
        $curMonthReal = (int) date('n');
        $moisScolaireActuel = match ($curMonthReal) {
            9 => 1,
            10 => 2,
            11 => 3,
            12 => 4,
            1 => 5,
            2 => 6,
            3 => 7,
            4 => 8,
            5 => 9,
            default => (in_array($curMonthReal, [6, 7, 8]) ? 9 : 1),
        };

        $schoolMonths = [
            'Septembre', 'Octobre', 'Novembre', 'Décembre',
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai'
        ];

        $debiteursList = [];

        foreach ($inscriptions as $insc) {
            $eleve = $insc->eleve;
            $user = $eleve?->user;
            $classe = $insc->classe;
            if (!$eleve || !$classe) continue;

            $classeNom = $classe->nom;
            $isSecondaire = $classe->isSecondaire();
            $isCreche = $classe->isCreche();
            $isMaternelle = $classe->isMaternelle() && !$isCreche;
            $isPrimaire = $classe->isPrimaire();
            $isExamen = $classe->is_examen || in_array(mb_strtolower(trim($classeNom)), ['3e', 'tle', 'terminale', 'cm2']);

            // Montant annuel théorique
            $fraisClasse = $fraisClasses->get($insc->classe_id);
            $mensuelOfficiel = $classe->montant_mensuel_officiel ?? 20000;
            $defaultMontant = $isSecondaire ? ($isExamen ? 200000 : 180000) : ($mensuelOfficiel * 9);
            $montantAnnuel = $fraisClasse ? (float)$fraisClasse->montant : ($fraisTypeScolarite ? (float)$fraisTypeScolarite->montant : $defaultMontant);

            // Remise
            if ($insc->has_remise) {
                if ($insc->remise_pourcentage > 0) {
                    $montantAnnuel = round($montantAnnuel * (1 - $insc->remise_pourcentage / 100));
                } elseif ($insc->remise_montant > 0) {
                    $montantAnnuel = max(0, $montantAnnuel - $insc->remise_montant);
                }
            }

            // Scolarité payée
            $paiementsScolarite = $insc->paiements->filter(fn($p) => $p->fraisType && $p->fraisType->is_scolarite);
            $totalScolaritePayee = (float)$paiementsScolarite->sum('montant');
            $resteScolarite = max(0, $montantAnnuel - $totalScolaritePayee);

            // Mois / Tranches payés
            $moisPayesMap = [];
            foreach ($paiementsScolarite as $p) {
                if (!empty($p->mois)) {
                    foreach (array_map('trim', explode(',', $p->mois)) as $m) {
                        $moisPayesMap[mb_strtolower($m)] = true;
                    }
                }
            }

            // Calcul des éléments en retard de scolarité
            $montantScolariteEnRetard = 0;
            $elementsEnRetard = [];

            if ($isSecondaire) {
                $isReinscription = (bool)($insc->reinscription ?? false);
                $t1Montant = $isReinscription ? 65000 : 60000;
                $resteScol = max(0, $montantAnnuel - $t1Montant);
                $t2Montant = round($resteScol / 2);
                $t3Montant = $resteScol - $t2Montant;

                $tranchesConfig = [
                    ['nom' => '1ère Tranche', 'montant' => $t1Montant],
                    ['nom' => '2ème Tranche', 'montant' => $t2Montant],
                    ['nom' => '3ème Tranche', 'montant' => $t3Montant],
                ];

                $cumulAttendu = 0;
                foreach ($tranchesConfig as $idx => $tr) {
                    $cumulAttendu += $tr['montant'];
                    $cleNom = mb_strtolower($tr['nom']);
                    $cleCourt = 'tranche ' . ($idx + 1);
                    $isPaid = isset($moisPayesMap[$cleNom]) || isset($moisPayesMap[$cleCourt]) || ($totalScolaritePayee >= $cumulAttendu);
                    $isDue = match($idx) {
                        0 => true,
                        1 => in_array($curMonthReal, [12, 1, 2, 3, 4, 5, 6, 7, 8]),
                        2 => in_array($curMonthReal, [2, 3, 4, 5, 6, 7, 8]),
                        default => true
                    };

                    if (!$isPaid && $isDue) {
                        $elementsEnRetard[] = $tr['nom'];
                        $montantScolariteEnRetard += $tr['montant'];
                    }
                }
            } else {
                $montantMensuel = $montantAnnuel > 0 ? (int)round($montantAnnuel / 9) : $mensuelOfficiel;
                $curDayReal = (int) date('j');
                foreach ($schoolMonths as $idx => $nomMois) {
                    $seuilCumule = ($idx + 1) * $montantMensuel;
                    $isPaid = isset($moisPayesMap[mb_strtolower($nomMois)]) || ($totalScolaritePayee >= $seuilCumule && $montantMensuel > 0);
                    // Observation 3 : Les paiements se font chaque 5 ou 10 du mois. 
                    // Le mois en cours n'est donc échu qu'après le 10.
                    $isDue = ($idx + 1) < $moisScolaireActuel || (($idx + 1) === $moisScolaireActuel && $curDayReal > 10);

                    if (!$isPaid && $isDue) {
                        $elementsEnRetard[] = $nomMois;
                        $montantScolariteEnRetard += $montantMensuel;
                    }
                }
            }

            // Tenue scolaire
            $tenuePayee = (bool)$insc->tenue_payee;
            $montantTenueExigible = (float)($insc->montant_tenue_exigible ?: ($isSecondaire ? 15000 : 10000));
            $resteTenue = $tenuePayee ? 0 : $montantTenueExigible;

            // Arriérés antérieurs
            $detteArrieres = 0;
            $arrieresEleve = $arrieresGrouped->get($eleve->id);
            if ($arrieresEleve) {
                $detteArrieres = (float)$arrieresEleve->sum('montant_restant');
            }

            // Total général restant dû
            $totalDu = $resteScolarite + $resteTenue + $detteArrieres;

            // Filtres de nature ou de retard
            if ($nature === 'scolarite' && $resteScolarite <= 0) continue;
            if ($nature === 'tenue' && $resteTenue <= 0) continue;
            if ($nature === 'arriere' && $detteArrieres <= 0) continue;
            if ($statutRetard === 'echu_only' && count($elementsEnRetard) === 0 && $resteTenue <= 0 && $detteArrieres <= 0) continue;

            // Ne conserver que les débiteurs (total dû > 0)
            if ($totalDu > 0) {
                $debiteursList[] = [
                    'inscription_id' => $insc->id,
                    'eleve_id' => $eleve->id,
                    'matricule' => $eleve->matricule ?? 'N/A',
                    'nom_complet' => ($user->nom ?? '') . ' ' . ($user->prenom ?? ''),
                    'classe_id' => $classe->id,
                    'classe_nom' => $classe->nom,
                    'classe_type' => $classe->type,
                    'is_secondaire' => $isSecondaire,
                    'parent_contact' => $eleve->parents->first()?->telephone ?: ($eleve->parents->first()?->user?->telephone ?: 'N/A'),
                    'parent_nom' => $eleve->parents->first()?->user ? ($eleve->parents->first()->user->nom . ' ' . $eleve->parents->first()->user->prenom) : 'N/A',
                    'scolarite_annuelle' => $montantAnnuel,
                    'scolarite_payee' => $totalScolaritePayee,
                    'scolarite_reste' => $resteScolarite,
                    'scolarite_retard_montant' => $montantScolariteEnRetard,
                    'elements_en_retard' => $elementsEnRetard,
                    'tenue_payee' => $tenuePayee,
                    'tenue_montant' => $resteTenue,
                    'arrieres_dette' => $detteArrieres,
                    'total_du' => $totalDu,
                ];
            }
        }

        // Tri par total dû décroissant
        usort($debiteursList, fn($a, $b) => $b['total_du'] <=> $a['total_du']);

        // KPIs globaux
        $statsGlobales = [
            'total_creances' => array_sum(array_column($debiteursList, 'total_du')),
            'total_scolarite_reste' => array_sum(array_column($debiteursList, 'scolarite_reste')),
            'total_scolarite_echue' => array_sum(array_column($debiteursList, 'scolarite_retard_montant')),
            'total_tenue_impayee' => array_sum(array_column($debiteursList, 'tenue_montant')),
            'total_arrieres' => array_sum(array_column($debiteursList, 'arrieres_dette')),
            'nb_eleves_debiteurs' => count($debiteursList),
            'nb_eleves_echus' => count(array_filter($debiteursList, fn($d) => count($d['elements_en_retard']) > 0 || $d['tenue_montant'] > 0 || $d['arrieres_dette'] > 0)),
        ];

        $etablissement = \App\Models\Etablissement::first();

        return Inertia::render('Paiements/Impayes', [
            'debiteurs' => $debiteursList,
            'stats' => $statsGlobales,
            'classes' => $classes,
            'annees' => $annees,
            'selectedAnnee' => (int) $anneeId,
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses->values(),
            'filters' => [
                'classe_id' => $classeId,
                'search' => $search,
                'nature' => $nature,
                'retard' => $statutRetard,
            ],
            'etablissement' => $etablissement ? [
                'nom' => $etablissement->nom,
                'telephone' => $etablissement->telephone,
                'email' => $etablissement->email,
                'adresse' => $etablissement->adresse,
                'ville' => $etablissement->ville,
            ] : null,
        ]);
    }
}

