<?php

namespace App\Http\Controllers;

use App\Models\Inscription;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\FraisType;
use App\Models\FraisClasse;
use App\Models\Paiement;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InscriptionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_inscriptions')->only(['index', 'show', 'recu', 'verify', 'registre', 'tenuesFournisseur']);
        $this->middleware('permission:ajouter_inscriptions')->only(['create', 'store', 'createForEleve']);
        $this->middleware('permission:modifier_inscriptions')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_inscriptions')->only(['destroy']);
    }

    // Liste des inscriptions avec filtre et pagination
    public function index(Request $request)
    {
        // 🎓 VUE ÉLÈVE
        if (auth()->user()->hasRole('eleve')) {
            $inscriptions = Inscription::with('eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType')
                ->where('eleve_id', \App\Models\Eleve::where('user_id', auth()->id())->firstOrFail()->id)
                ->orderByDesc('created_at')
                ->get(); // No pagination needed for a few inscriptions
            
            return Inertia::render('Inscriptions/Student', [
                'inscriptions' => $inscriptions
            ]);
        }

        // 👨‍👩‍👧 VUE PARENT
        if (auth()->user()->hasRole('parent')) {
            $parent = auth()->user()->parent;
            if (!$parent) {
                return back()->with('error', 'Profil parent introuvable.');
            }
            $eleveIds = $parent->eleves()->pluck('eleves.id');
            $inscriptions = Inscription::with('eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType')
                ->whereIn('eleve_id', $eleveIds)
                ->orderByDesc('created_at')
                ->get();
            
            return Inertia::render('Inscriptions/Student', [
                'inscriptions' => $inscriptions
            ]);
        }

        // 🛡️ VUE ADMIN
        $search = $request->input('search');
        $statut = $request->input('statut'); // Filtre statut
        $statutTenue = $request->input('statut_tenue'); // 'all', 'payee', 'impayee'

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        
        $baseQuery = Inscription::with('eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType')
            ->when($currentYear, fn($q) => $q->where('annee_scolaire_id', $currentYear->id));

        // ADMIN FILTERS
        $query = (clone $baseQuery)
            ->when($statut, fn($q) => $q->where('statut', $statut))
            ->when($statutTenue === 'payee', function($q) {
                $q->whereHas('paiements.fraisType', fn($ft) => $ft->where('code', 'tenue'));
            })
            ->when($statutTenue === 'impayee', function($q) {
                $q->whereDoesntHave('paiements.fraisType', fn($ft) => $ft->where('code', 'tenue'));
            })
            ->when($search, fn($q) =>
                $q->whereHas('eleve.user', fn($u) =>
                    $u->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                )
            );

        $statsTenue = [
            'total' => (clone $baseQuery)->count(),
            'payee' => Inscription::when($currentYear, fn($q) => $q->where('annee_scolaire_id', $currentYear->id))
                ->whereHas('paiements.fraisType', fn($ft) => $ft->where('code', 'tenue'))
                ->count(),
            'impayee' => Inscription::when($currentYear, fn($q) => $q->where('annee_scolaire_id', $currentYear->id))
                ->whereDoesntHave('paiements.fraisType', fn($ft) => $ft->where('code', 'tenue'))
                ->count(),
        ];

        $inscriptions = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inscriptions/Index', [
            'inscriptions' => $inscriptions,
            'filters' => [
                'search' => $search,
                'statut' => $statut,
                'statut_tenue' => $statutTenue
            ],
            'statsTenue' => $statsTenue,
            'fraisTypes' => FraisType::all(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    // Formulaire de création
    public function create(Eleve $eleve = null)
    {
        $annee_en_cours = AnneeScolaire::enCours()->first();
        if (!$annee_en_cours) {
            return redirect()->back()->with('error', 'Aucune année scolaire en cours.');
        }

        // Obtenir les IDs des élèves déjà inscrits pour l'année en cours
        $elevesInscritsIds = Inscription::where('annee_scolaire_id', $annee_en_cours->id)
                                        ->pluck('eleve_id')
                                        ->toArray();

        // Si un élève est spécifié et déjà inscrit, refuser avec redirection
        if ($eleve && in_array($eleve->id, $elevesInscritsIds)) {
            $inscriptionExistante = Inscription::where('eleve_id', $eleve->id)
                ->where('annee_scolaire_id', $annee_en_cours->id)
                ->with('classe')
                ->first();
            $nomClasse = $inscriptionExistante->classe->nom ?? 'sa classe';
            return redirect()->route('eleves.show', $eleve->id)
                ->with('error', "Cet élève est déjà inscrit(e) en {$nomClasse} pour l'année scolaire en cours ({$annee_en_cours->nom}).");
        }

        // Récupérer les frais d'inscription et annexes (exclure la scolarité)
        $fraisTypes = FraisType::where('is_scolarite', false)
            ->where(function($q) use ($annee_en_cours) {
                $q->where('annee_scolaire_id', $annee_en_cours->id)
                  ->orWhereNull('annee_scolaire_id')
                  ->orWhere('globale', true);
            })->get();

        // Récupérer la grille de scolarité pour le plan de paiement
        $fraisClasses = FraisClasse::where('annee_scolaire_id', $annee_en_cours->id)
            ->with('fraisType')
            ->get();

        // Ne sélectionner que les élèves non encore inscrits pour cette année, avec détection de réinscription
        $eleves = $eleve 
            ? [] 
            : Eleve::with('user')
                ->whereNotIn('id', $elevesInscritsIds)
                ->get()
                ->map(function($item) use ($annee_en_cours) {
                    $item->is_reinscription = Inscription::where('eleve_id', $item->id)
                        ->where('annee_scolaire_id', '!=', $annee_en_cours->id)
                        ->exists();
                    return $item;
                });

        if ($eleve) {
            $eleve->load('user');
            $eleve->is_reinscription = Inscription::where('eleve_id', $eleve->id)
                ->where('annee_scolaire_id', '!=', $annee_en_cours->id)
                ->exists();
        }

        return Inertia::render('Inscriptions/Create', [
            'eleve' => $eleve,
            'eleves' => $eleves,
            'classes' => Classe::orderBy('nom')->get(),
            'annee_en_cours' => $annee_en_cours,
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses,
            'forfait_config' => [
                'frais_inscription' => (float) ($fraisTypes->firstWhere('code', 'inscription')?->montant ?? 10000),
                'frais_reinscription' => (float) ($fraisTypes->firstWhere('code', 'reinscription')?->montant ?? 10000),
            ],
        ]);
    }

    // Formulaire de création pour un élève précis
    public function createForEleve(Eleve $eleve)
    {
        $annee_en_cours = AnneeScolaire::enCours()->first();
        if (!$annee_en_cours) {
            return redirect()->back()->with('error', 'Aucune année scolaire en cours.');
        }

        // Vérifier formellement si l'élève est déjà inscrit pour l'année scolaire en cours
        $inscriptionExistante = Inscription::where('eleve_id', $eleve->id)
            ->where('annee_scolaire_id', $annee_en_cours->id)
            ->with('classe')
            ->first();

        if ($inscriptionExistante) {
            $nomClasse = $inscriptionExistante->classe->nom ?? 'sa classe';
            $nomEleve = ($eleve->user->nom ?? '') . ' ' . ($eleve->user->prenom ?? '');
            return redirect()->route('eleves.show', $eleve->id)
                ->with('error', "Impossible d'inscrire : {$nomEleve} est déjà inscrit(e) en {$nomClasse} pour l'année scolaire en cours ({$annee_en_cours->nom}).");
        }

        $classes = Classe::orderBy('nom')->get();
        
        // Récupérer les frais d'inscription et annexes (exclure la scolarité)
        $fraisTypes = FraisType::where('is_scolarite', false)
            ->where(function($q) use ($annee_en_cours) {
                $q->where('annee_scolaire_id', $annee_en_cours->id)
                  ->orWhereNull('annee_scolaire_id')
                  ->orWhere('globale', true);
            })->get();

        $fraisClasses = FraisClasse::where('annee_scolaire_id', $annee_en_cours->id)
            ->with('fraisType')
            ->get();

        $eleve->load('user');
        $eleve->is_reinscription = Inscription::where('eleve_id', $eleve->id)
            ->where('annee_scolaire_id', '!=', $annee_en_cours->id)
            ->exists();

        return Inertia::render('Inscriptions/Create', [
            'elevePreSelectionne' => $eleve,
            'eleves' => [],
            'classes' => $classes,
            'annee_en_cours' => $annee_en_cours,
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses,
            'forfait_config' => [
                'frais_inscription' => (float) ($fraisTypes->firstWhere('code', 'inscription')?->montant ?? 10000),
                'frais_reinscription' => (float) ($fraisTypes->firstWhere('code', 'reinscription')?->montant ?? 10000),
            ],
        ]);
    }

    // Stocker une inscription avec frais sélectionnés
    public function store(Request $request)
    {
        $validated = $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'classe_id' => 'required|exists:classes,id',
            'date_inscription' => 'nullable|date',
            'admission_type' => 'nullable|in:inscription,reinscription',
            'has_remise' => 'nullable|boolean',
            'remise_pourcentage' => 'nullable|numeric|min:0|max:100',
            'remise_montant' => 'nullable|numeric|min:0',
            'scolarite_accorde' => 'nullable|numeric|min:0',
            'payer_scolarite_mois' => 'nullable|boolean',
            'montant_scolarite_mois' => 'nullable|numeric|min:0',
            'frais' => 'nullable|array', // Structure: [frais_type_id => ['selected' => bool, 'montant' => float]]
            'frais.*.selected' => 'boolean',
            'frais.*.montant' => 'nullable|numeric|min:0',
        ]);

        $anneeEnCours = AnneeScolaire::enCours()->first();
        if (!$anneeEnCours) {
            return redirect()->back()->with('error', 'Aucune année scolaire en cours trouvée.');
        }

        // ✅ Vérifier si l'élève est déjà inscrit pour l'année en cours
        $exists = Inscription::where('eleve_id', $validated['eleve_id'])
            ->where('annee_scolaire_id', $anneeEnCours->id)
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withErrors(['eleve_id' => 'Cet élève est déjà inscrit pour l’année en cours.'])
                ->withInput();
        }

        return DB::transaction(function () use ($validated, $anneeEnCours, $request) {
            
            // 🔍 Type d'admission : 'inscription' ou 'reinscription'
            $admissionType = $request->input('admission_type');
            if (!$admissionType) {
                // Détection automatique si non explicite
                $hasPastInscription = Inscription::where('eleve_id', $validated['eleve_id'])
                    ->where('annee_scolaire_id', '!=', $anneeEnCours->id)
                    ->exists();
                $admissionType = $hasPastInscription ? 'reinscription' : 'inscription';
            }

            $isReinscription = ($admissionType === 'reinscription');
            $hasRemise = $request->boolean('has_remise');
            $remisePourcentage = (float) $request->input('remise_pourcentage', 0);
            $remiseMontant = (float) $request->input('remise_montant', 0);
            $scolariteAccorde = (float) $request->input('scolarite_accorde', 0);
            $payerScolariteMois = $request->boolean('payer_scolarite_mois');

            // 🚦 Gestion du Statut
            $statut = $request->input('statut', 'validee'); // Par défaut 'validee' si admin

            // Création de l'inscription
            $inscription = Inscription::create([
                'eleve_id' => $validated['eleve_id'],
                'classe_id' => $validated['classe_id'],
                'annee_scolaire_id' => $anneeEnCours->id,
                'date_inscription' => $validated['date_inscription'] ?? now(),
                'total_frais' => 0, // sera calculé
                'numero_recu' => 'REC-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'code_securite' => (string) Str::uuid(),
                'reinscription' => $isReinscription,
                'has_remise' => $hasRemise,
                'remise_pourcentage' => $remisePourcentage,
                'remise_montant' => $remiseMontant,
                'statut' => $statut,
            ]);

            // Récupération des types Inscription et Réinscription pour exclusion mutuelle stricte
            $fraisInscription  = FraisType::where('code', 'inscription')->first();
            $fraisReinscription = FraisType::where('code', 'reinscription')->first();

            // L'autre type d'admission est exclu formellement
            $typeAExclureId = $isReinscription 
                ? ($fraisInscription?->id) 
                : ($fraisReinscription?->id);

            // Enregistrement des Paiements
            $totalPaye = 0;
            $fraisInput = $request->input('frais', []);
            $classe = Classe::find($validated['classe_id']);

            if ($statut === 'validee') {
                foreach ($fraisInput as $fraisTypeId => $data) {
                    // Exclusion mutuelle absolue : Inscription OU Réinscription
                    if ($typeAExclureId && (int)$fraisTypeId === (int)$typeAExclureId) {
                        continue;
                    }

                    $fraisType = FraisType::find($fraisTypeId);
                    if (!$fraisType || $fraisType->is_scolarite) continue;

                    if (!empty($data['selected']) && $data['selected'] == true) {
                        $montant = $this->resolveFraisMontant($fraisType, $classe, $data, $isReinscription, false);

                        if ($montant > 0) {
                            $code = strtolower($fraisType->code ?? '');
                            $nom = mb_strtolower($fraisType->nom ?? '');
                            $isReinscType = $code === 'reinscription' || str_contains($nom, 'réinscription');
                            $isInscType = $code === 'inscription' || (str_contains($nom, 'inscription') && !$isReinscType);

                            $comm = null;
                            if ($isInscType) {
                                $comm = "Frais d'inscription";
                            } elseif ($isReinscType) {
                                $comm = "Frais de réinscription";
                            }

                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisTypeId,
                                'user_id'        => auth()->id(),
                                'montant'        => $montant,
                                'date_paiement'  => $validated['date_inscription'] ?? now(),
                                'mode_paiement'  => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                                'commentaire'    => $comm,
                            ]);
                            $totalPaye += $montant;
                        }
                    }
                }

                // Encaissement facultatif de la scolarité du 1er mois (Septembre)
                if ($payerScolariteMois) {
                    $fraisScolarite = FraisType::where('is_scolarite', true)->first();
                    if ($fraisScolarite) {
                        $tarifBase = $classe?->montant_mensuel_officiel ?? 20000;
                        $montantScolariteInput = $request->input('montant_scolarite_mois');

                        if ($montantScolariteInput !== null && is_numeric($montantScolariteInput) && (float)$montantScolariteInput > 0) {
                            $montantScolarite = (float) $montantScolariteInput;
                        } elseif ($scolariteAccorde > 0) {
                            $montantScolarite = $scolariteAccorde;
                        } elseif ($hasRemise && $remisePourcentage > 0) {
                            $montantScolarite = round($tarifBase * (1 - $remisePourcentage / 100));
                        } else {
                            $montantScolarite = $tarifBase;
                        }

                        // Auto-calcul de la remise si le montant saisi à l'écran est inférieur au barème
                        if (!$hasRemise && $tarifBase > 0 && $montantScolarite < $tarifBase) {
                            $computedRemisePct = round((($tarifBase - $montantScolarite) / $tarifBase) * 100, 2);
                            $inscription->update([
                                'has_remise' => true,
                                'remise_pourcentage' => $computedRemisePct,
                                'remise_montant' => $tarifBase - $montantScolarite,
                            ]);
                        }

                        if ($montantScolarite > 0) {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisScolarite->id,
                                'user_id'        => auth()->id(),
                                'montant'        => $montantScolarite,
                                'date_paiement'  => $validated['date_inscription'] ?? now(),
                                'mode_paiement'  => 'especes',
                                'mois'           => 'Septembre',
                                'reference_recu' => $inscription->numero_recu,
                                'commentaire'    => "Scolarité 1er mois (Septembre) réglée à l'inscription",
                            ]);
                            $totalPaye += $montantScolarite;
                        }
                    }
                }
            }

            $inscription->update(['total_frais' => $totalPaye]);

            $message = ($statut === 'en_attente') 
                ? 'Préinscription enregistrée (En attente) ⏳' 
                : 'Inscription validée avec succès ✅';

            return redirect()->route('inscriptions.index')->with('success', $message);
        });
    }


    // Affichage d'une inscription
    public function show(Inscription $inscription)
    {
        $inscription->load('eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType', 'paiements.user');

        $anneeId = $inscription->annee_scolaire_id;
        $fraisAnnexes = FraisType::where('is_scolarite', false)
            ->where(function($q) use ($anneeId) {
                $q->where('annee_scolaire_id', $anneeId)
                  ->orWhereNull('annee_scolaire_id')
                  ->orWhere('globale', true);
            })->get();

        $tenueFraisType = FraisType::where('code', 'tenue')->first();

        return Inertia::render('Inscriptions/Show', [
            'inscription' => $inscription,
            'fraisAnnexes' => $fraisAnnexes,
            'tenueFraisType' => $tenueFraisType,
        ]);
    }

    // Formulaire d'édition
    public function edit(Inscription $inscription)
    {
        $inscription->load('eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType');
        $annee_en_cours = $inscription->anneeScolaire ?: AnneeScolaire::enCours()->first();
        
        $eleves = Eleve::with('user')->get()->map(function($item) use ($annee_en_cours) {
            $item->is_reinscription = Inscription::where('eleve_id', $item->id)
                ->where('annee_scolaire_id', '!=', $annee_en_cours->id)
                ->exists();
            return $item;
        });

        $classes = Classe::orderBy('nom')->get();

        // Frais d'inscription et annexes (hors scolarité)
        $fraisTypes = FraisType::where('is_scolarite', false)
            ->where(function($q) use ($annee_en_cours) {
                $q->where('annee_scolaire_id', $annee_en_cours->id)
                  ->orWhereNull('annee_scolaire_id')
                  ->orWhere('globale', true);
            })->get();

        $fraisClasses = FraisClasse::where('annee_scolaire_id', $annee_en_cours->id)
            ->with('fraisType')
            ->get();

        $elevePreSelectionne = $inscription->eleve;
        if ($elevePreSelectionne) {
            $elevePreSelectionne->load('user');
            $elevePreSelectionne->is_reinscription = $inscription->reinscription;
        }

        return Inertia::render('Inscriptions/Create', [
            'inscription'         => $inscription,
            'elevePreSelectionne' => $elevePreSelectionne,
            'eleves'              => $eleves,
            'classes'             => $classes,
            'fraisTypes'          => $fraisTypes,
            'fraisClasses'        => $fraisClasses,
            'annee_en_cours'      => $annee_en_cours,
            'forfait_config'      => [
                'frais_inscription'     => (float) ($fraisTypes->firstWhere('code', 'inscription')?->montant ?? 10000),
                'frais_reinscription'   => (float) ($fraisTypes->firstWhere('code', 'reinscription')?->montant ?? 10000),
            ],
        ]);
    }

    // Mise à jour d'une inscription
    public function update(Request $request, Inscription $inscription)
    {
        $validated = $request->validate([
            'eleve_id'              => 'required|exists:eleves,id',
            'classe_id'             => 'required|exists:classes,id',
            'date_inscription'      => 'nullable|date',
            'admission_type'        => 'nullable|in:inscription,reinscription',
            'statut'                => 'required|in:brouillon,en_attente,validee,rejete',
            'has_remise'            => 'nullable|boolean',
            'remise_pourcentage'    => 'nullable|numeric|min:0|max:100',
            'remise_montant'        => 'nullable|numeric|min:0',
            'scolarite_accorde'     => 'nullable|numeric|min:0',
            'payer_scolarite_mois'  => 'nullable|boolean',
            'montant_scolarite_mois'=> 'nullable|numeric|min:0',
            'frais'                 => 'nullable|array',
            'frais.*.selected'      => 'boolean',
            'frais.*.montant'       => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $inscription, $request) {
            $isReinscription = $request->has('admission_type')
                ? ($request->admission_type === 'reinscription')
                : $inscription->reinscription;

            $hasRemise = $request->boolean('has_remise');
            $remisePourcentage = (float) $request->input('remise_pourcentage', 0);
            $remiseMontant = (float) $request->input('remise_montant', 0);
            $scolariteAccorde = (float) $request->input('scolarite_accorde', 0);
            $payerScolariteMois = $request->boolean('payer_scolarite_mois');

            $inscription->update([
                'eleve_id'          => $validated['eleve_id'],
                'classe_id'         => $validated['classe_id'],
                'date_inscription'  => $validated['date_inscription'] ?? $inscription->date_inscription,
                'statut'            => $validated['statut'],
                'reinscription'     => $isReinscription,
                'has_remise'        => $hasRemise,
                'remise_pourcentage'=> $remisePourcentage,
                'remise_montant'    => $remiseMontant,
            ]);

            // AJOUT OU MISE À JOUR DES FRAIS (lors de la validation ou modification)
            if ($validated['statut'] === 'validee') {
                $fraisInput  = $request->input('frais', []);
                $user        = auth()->user();
                $classe      = Classe::find($validated['classe_id']);
                $dateOp      = $validated['date_inscription'] ?? now();

                $fraisInscription   = FraisType::where('code', 'inscription')->first();
                $fraisReinscription = FraisType::where('code', 'reinscription')->first();
                $typeAExclureId = $isReinscription ? ($fraisInscription?->id) : ($fraisReinscription?->id);

                foreach ($fraisInput as $fraisTypeId => $data) {
                    if ($typeAExclureId && (int)$fraisTypeId === (int)$typeAExclureId) {
                        continue;
                    }

                    $fraisType = FraisType::find($fraisTypeId);
                    if (!$fraisType || $fraisType->is_scolarite) continue;

                    $code = strtolower($fraisType->code ?? '');
                    $nom = mb_strtolower($fraisType->nom ?? '');
                    $isReinscType = $code === 'reinscription' || str_contains($nom, 'réinscription');
                    $isInscType = $code === 'inscription' || (str_contains($nom, 'inscription') && !$isReinscType);

                    $existingPaiement = Paiement::where('inscription_id', $inscription->id)
                        ->where('frais_type_id', $fraisTypeId)
                        ->first();

                    if (!empty($data['selected']) && $data['selected'] == true) {
                        $montant = $this->resolveFraisMontant($fraisType, $classe, $data, $isReinscription, false);
                        if ($montant <= 0) continue;

                        $comm = null;
                        if ($isInscType) {
                            $comm = "Frais d'inscription";
                        } elseif ($isReinscType) {
                            $comm = "Frais de réinscription";
                        }

                        if ($existingPaiement) {
                            if ((float)$existingPaiement->montant !== (float)$montant) {
                                $existingPaiement->update([
                                    'montant'       => $montant,
                                    'date_paiement' => $dateOp,
                                ]);
                            }
                        } else {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisTypeId,
                                'user_id'        => $user?->id ?? auth()->id(),
                                'montant'        => $montant,
                                'date_paiement'  => $dateOp,
                                'mode_paiement'  => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                                'commentaire'    => $comm,
                            ]);
                        }
                    } else {
                        // Si décoché et non droit d'admission principal
                        if ($existingPaiement && !$isInscType && !$isReinscType) {
                            $existingPaiement->delete();
                        }
                    }
                }

                // GESTION DE LA SCOLARITÉ DU 1ER MOIS (SEPTEMBRE)
                $fraisScolarite = FraisType::where('is_scolarite', true)->first();
                if ($fraisScolarite) {
                    $existingScolarite = Paiement::where('inscription_id', $inscription->id)
                        ->where('frais_type_id', $fraisScolarite->id)
                        ->first();

                    if ($payerScolariteMois) {
                        $tarifBase = $classe?->montant_mensuel_officiel ?? 20000;
                        $montantScolariteInput = $request->input('montant_scolarite_mois');

                        if ($montantScolariteInput !== null && is_numeric($montantScolariteInput) && (float)$montantScolariteInput > 0) {
                            $montantScolarite = (float) $montantScolariteInput;
                        } elseif ($scolariteAccorde > 0) {
                            $montantScolarite = $scolariteAccorde;
                        } elseif ($hasRemise && $remisePourcentage > 0) {
                            $montantScolarite = round($tarifBase * (1 - $remisePourcentage / 100));
                        } else {
                            $montantScolarite = $tarifBase;
                        }

                        // Auto-calcul de la remise si le montant saisi à l'écran est inférieur au barème
                        if (!$hasRemise && $tarifBase > 0 && $montantScolarite < $tarifBase) {
                            $computedRemisePct = round((($tarifBase - $montantScolarite) / $tarifBase) * 100, 2);
                            $inscription->update([
                                'has_remise' => true,
                                'remise_pourcentage' => $computedRemisePct,
                                'remise_montant' => $tarifBase - $montantScolarite,
                            ]);
                        }

                        if ($montantScolarite > 0) {
                            if ($existingScolarite) {
                                $existingScolarite->update([
                                    'montant'       => $montantScolarite,
                                    'date_paiement' => $dateOp,
                                ]);
                            } else {
                                Paiement::create([
                                    'inscription_id' => $inscription->id,
                                    'frais_type_id'  => $fraisScolarite->id,
                                    'user_id'        => $user?->id ?? auth()->id(),
                                    'montant'        => $montantScolarite,
                                    'date_paiement'  => $dateOp,
                                    'mode_paiement'  => 'especes',
                                    'mois'           => 'Septembre',
                                    'reference_recu' => $inscription->numero_recu,
                                    'commentaire'    => "Scolarité 1er mois (Septembre) réglée à l'inscription",
                                ]);
                            }
                        }
                    } elseif ($existingScolarite && $request->has('payer_scolarite_mois')) {
                        // Décoché lors de la modification
                        $existingScolarite->delete();
                    }
                }

                // Recalculer le total_frais exact de l'inscription à partir de tous les paiements réels
                $totalReel = Paiement::where('inscription_id', $inscription->id)->sum('montant');
                $inscription->update(['total_frais' => $totalReel]);
            }
        });

        return redirect()->route('inscriptions.index')
            ->with('success', 'Inscription mise à jour avec succès ✅');
    }

    /**
     * Résout le montant d'un type de frais (lu dynamiquement depuis frais_types)
     */
    private function resolveFraisMontant(FraisType $fraisType, ?Classe $classe, ?array $data, bool $isReinscription, bool $hasRemise = false): float
    {
        if (isset($data['montant']) && is_numeric($data['montant'])) {
            return (float) $data['montant'];
        }
        return (float) ($fraisType->montant ?? 0);
    }

    // Supprimer une inscription
    public function destroy($id)
    {
        $inscription = $id instanceof Inscription ? $id : Inscription::with('paiements')->find($id);

        if (!$inscription) {
            return redirect()->route('inscriptions.index')->with('error', 'Inscription introuvable.');
        }

        // 🛡️ Protection comptable : Empêcher la suppression si des versements financiers existent
        $nbPaiements = $inscription->paiements()->count();
        if ($nbPaiements > 0) {
            $totalPaye = number_format($inscription->paiements()->sum('montant'), 0, ',', ' ');
            return redirect()->back()->with(
                'error',
                "Impossible de supprimer cette inscription : {$nbPaiements} règlement(s) financier(s) ({$totalPaye} FCFA) y sont déjà rattachés. Pour garantir l'intégrité comptable de l'établissement, veuillez d'abord annuler ou supprimer ces paiements en caisse."
            );
        }

        DB::beginTransaction();
        try {
            // Supprimer l'inscription (cascade automatique vers notes, absences, bulletin_infos)
            $inscription->delete();

            DB::commit();

            return redirect()->route('inscriptions.index')
                ->with('success', 'Inscription supprimée avec succès ✅');
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Erreur lors de la suppression de l\'inscription ID ' . ($inscription->id ?? '?') . ': ' . $e->getMessage());
            return redirect()->route('inscriptions.index')->with('error', 'Impossible de supprimer cette inscription : ' . $e->getMessage());
        }
    }


    // Afficher le reçu (pour impression)
    public function recu(Inscription $inscription)
    {
        $inscription->load('eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType');
        
        // S'assurer qu'un code existe (pour les anciennes inscriptions)
        if (!$inscription->code_securite) {
            $inscription->update([
                'numero_recu' => 'REC-' . $inscription->created_at->format('Ymd') . '-' . strtoupper(Str::random(4)),
                'code_securite' => (string) Str::uuid(),
            ]);
        }
        
        return Inertia::render('Inscriptions/Recu', [
            'inscription' => $inscription,
            'url_verification' => route('inscriptions.verify', $inscription->code_securite),
        ]);
    }

    // Vérifier l'authenticité d'un document scolaire ou reçu d'inscription scanné par QR code
    public function verify($code)
    {
        $inscription = Inscription::where('code_securite', $code)
            ->orWhere('numero_recu', $code)
            ->with(['eleve.user', 'classe', 'anneeScolaire', 'paiements.fraisType'])
            ->first();

        $etablissement = \App\Models\Etablissement::first();

        return Inertia::render('Inscriptions/Verify', [
            'inscription' => $inscription ? [
                'id' => $inscription->id,
                'numero_recu' => $inscription->numero_recu ?: ('REC-INS-' . str_pad($inscription->id, 6, '0', STR_PAD_LEFT)),
                'code_securite' => $inscription->code_securite,
                'statut' => $inscription->statut ?? 'validee',
                'reinscription' => (bool) $inscription->reinscription,
                'total_frais' => (float) $inscription->total_frais,
                'total_paye' => (float) $inscription->paiements->sum('montant'),
                'date_inscription' => $inscription->date_inscription ? $inscription->date_inscription->format('Y-m-d') : ($inscription->created_at ? $inscription->created_at->format('Y-m-d') : null),
                'eleve_nom_complet' => trim(($inscription->eleve?->user?->nom ?? '') . ' ' . ($inscription->eleve?->user?->prenom ?? '')),
                'eleve_matricule' => $inscription->eleve?->matricule ?? 'N/A',
                'classe_nom' => $inscription->classe?->nom ?? 'N/A',
                'annee_scolaire_nom' => $inscription->anneeScolaire?->nom ?? 'N/A',
                'created_at' => $inscription->created_at ? $inscription->created_at->toISOString() : null,
            ] : null,
            'code' => $code,
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
     * Registre complet et imprimable des élèves inscrits pour l'année scolaire
     */
    public function registre(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            $currentYear = AnneeScolaire::latest()->first();
        }

        $anneeId = $request->input('annee_scolaire_id', $currentYear?->id);
        $classeId = $request->input('classe_id');
        $sexe = $request->input('sexe');
        $statut = $request->input('statut');
        $search = $request->input('search');

        $query = Inscription::with([
                'eleve.user', 
                'eleve.parents.user', 
                'classe', 
                'anneeScolaire',
                'paiements.fraisType'
            ])
            ->when($anneeId, fn($q) => $q->where('annee_scolaire_id', $anneeId))
            ->when($classeId, fn($q) => $q->where('classe_id', $classeId))
            ->when($statut, fn($q) => $q->where('statut', $statut))
            ->when($sexe, function($q) use ($sexe) {
                $q->whereHas('eleve', fn($el) => $el->where('sexe', $sexe));
            })
            ->when($search, function($q) use ($search) {
                $q->whereHas('eleve.user', function($u) use ($search) {
                    $u->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%");
                })->orWhereHas('eleve', function($e) use ($search) {
                    $e->where('matricule', 'like', "%{$search}%");
                });
            });

        // 🔒 Scoping de données par rôle
        $user = auth()->user();
        if (!$user->hasRole(['super-admin', 'directeur', 'comptable', 'secretaire'])) {
            if ($user->hasRole('parent')) {
                $eleveIds = $user->parent?->eleves()->pluck('eleves.id') ?? [];
                $query->whereIn('eleve_id', $eleveIds);
            }
        }

        $allInscriptions = $query->get();

        // Trier par classe puis par nom et prénom de l'élève
        $sortedInscriptions = $allInscriptions->sortBy([
            ['classe.nom', 'asc'],
            ['eleve.user.nom', 'asc'],
            ['eleve.user.prenom', 'asc'],
        ])->values();

        // Statistiques globales
        $totalEleves = $sortedInscriptions->count();
        $totalFilles = $sortedInscriptions->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'F')->count();
        $totalGarcons = $sortedInscriptions->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'M')->count();
        $totalValidees = $sortedInscriptions->filter(fn($i) => $i->statut === 'validee')->count();

        // Structuration groupée par classe
        $parClasse = $sortedInscriptions->groupBy('classe_id')->map(function($items) {
            $first = $items->first();
            $fillesCount = $items->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'F')->count();
            $garconsCount = $items->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'M')->count();
            
            return [
                'classe_id' => $first->classe_id,
                'classe_nom' => $first->classe?->nom ?? 'Non assignée',
                'classe_type' => $first->classe?->type ?? 'Général',
                'effectif' => $items->count(),
                'filles' => $fillesCount,
                'garcons' => $garconsCount,
                'eleves' => $items->values(),
            ];
        })->values()->sortBy('classe_nom')->values();

        $classes = Classe::select('id', 'nom', 'type')->orderBy('nom')->get();
        $annees = AnneeScolaire::select('id', 'nom', 'en_cours')->orderByDesc('id')->get();
        $etablissement = Etablissement::first();

        return Inertia::render('Inscriptions/Registre', [
            'inscriptions' => $sortedInscriptions,
            'parClasse' => $parClasse,
            'stats' => [
                'total' => $totalEleves,
                'filles' => $totalFilles,
                'garcons' => $totalGarcons,
                'validees' => $totalValidees,
                'nb_classes' => $parClasse->count(),
            ],
            'filters' => [
                'classe_id' => $classeId,
                'sexe' => $sexe,
                'statut' => $statut,
                'search' => $search,
                'annee_scolaire_id' => $anneeId,
            ],
            'classes' => $classes,
            'annees' => $annees,
            'anneeActive' => $currentYear,
            'etablissement' => $etablissement,
        ]);
    }

    /**
     * Liste imprimable et exportable des élèves ayant réglé leur tenue scolaire (Fiche Fournisseur / Tailleur)
     */
    public function tenuesFournisseur(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            $currentYear = AnneeScolaire::latest()->first();
        }

        $anneeId = $request->input('annee_scolaire_id', $currentYear?->id);
        $classeId = $request->input('classe_id');
        $sexe = $request->input('sexe');
        $search = $request->input('search');

        $query = Inscription::with([
                'eleve.user', 
                'eleve.parents.user', 
                'classe', 
                'anneeScolaire',
                'paiements.fraisType'
            ])
            ->when($anneeId, fn($q) => $q->where('annee_scolaire_id', $anneeId))
            ->when($classeId, fn($q) => $q->where('classe_id', $classeId))
            ->when($sexe, function($q) use ($sexe) {
                $q->whereHas('eleve', fn($el) => $el->where('sexe', $sexe));
            })
            ->when($search, function($q) use ($search) {
                $q->whereHas('eleve.user', function($u) use ($search) {
                    $u->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%");
                })->orWhereHas('eleve', function($e) use ($search) {
                    $e->where('matricule', 'like', "%{$search}%");
                });
            })
            ->where(function($q) {
                $q->whereHas('paiements.fraisType', function($ft) {
                    $ft->where('code', 'tenue')
                      ->orWhere('nom', 'like', '%tenue%');
                });
            });

        // 🔒 Scoping de données par rôle
        $user = auth()->user();
        if (!$user->hasRole(['super-admin', 'directeur', 'comptable', 'secretaire'])) {
            if ($user->hasRole('parent')) {
                $eleveIds = $user->parent?->eleves()->pluck('eleves.id') ?? [];
                $query->whereIn('eleve_id', $eleveIds);
            }
        }

        $allInscriptions = $query->get();

        // Trier par classe puis par nom et prénom de l'élève
        $sortedInscriptions = $allInscriptions->sortBy([
            ['classe.nom', 'asc'],
            ['eleve.user.nom', 'asc'],
            ['eleve.user.prenom', 'asc'],
        ])->values()->map(function($insc) {
            $paiementTenue = $insc->paiement_tenue;
            $insc->tenue_info = [
                'date_paiement' => $paiementTenue?->date_paiement ? \Carbon\Carbon::parse($paiementTenue->date_paiement)->format('d/m/Y') : ($insc->created_at ? $insc->created_at->format('d/m/Y') : '-'),
                'numero_recu' => $paiementTenue?->numero_recu ?: ($insc->numero_recu ?: '-'),
                'montant' => $paiementTenue?->montant ?: $insc->montant_tenue_exigible,
                'mode_paiement' => $paiementTenue?->mode_paiement ?: 'especes',
            ];
            return $insc;
        });

        // Statistiques globales pour la confection
        $totalEleves = $sortedInscriptions->count();
        $totalFilles = $sortedInscriptions->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'F')->count();
        $totalGarcons = $sortedInscriptions->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'M')->count();

        // Structuration groupée par classe
        $parClasse = $sortedInscriptions->groupBy('classe_id')->map(function($items) {
            $first = $items->first();
            $fillesCount = $items->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'F')->count();
            $garconsCount = $items->filter(fn($i) => strtoupper($i->eleve?->sexe ?? '') === 'M')->count();
            
            return [
                'classe_id' => $first->classe_id,
                'classe_nom' => $first->classe?->nom ?? 'Non assignée',
                'classe_type' => $first->classe?->type ?? 'Général',
                'effectif' => $items->count(),
                'filles' => $fillesCount,
                'garcons' => $garconsCount,
                'eleves' => $items->values(),
            ];
        })->values()->sortBy('classe_nom')->values();

        $classes = Classe::select('id', 'nom', 'type')->orderBy('nom')->get();
        $annees = AnneeScolaire::select('id', 'nom', 'en_cours')->orderByDesc('id')->get();
        $etablissement = Etablissement::first();

        return Inertia::render('Inscriptions/TenuesFournisseur', [
            'inscriptions' => $sortedInscriptions,
            'parClasse' => $parClasse,
            'stats' => [
                'total' => $totalEleves,
                'filles' => $totalFilles,
                'garcons' => $totalGarcons,
                'nb_classes' => $parClasse->count(),
            ],
            'filters' => [
                'classe_id' => $classeId,
                'sexe' => $sexe,
                'search' => $search,
                'annee_scolaire_id' => $anneeId,
            ],
            'classes' => $classes,
            'annees' => $annees,
            'anneeActive' => $currentYear,
            'etablissement' => $etablissement,
        ]);
    }
}
