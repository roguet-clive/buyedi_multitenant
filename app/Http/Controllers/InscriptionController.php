<?php

namespace App\Http\Controllers;

use App\Models\Inscription;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\FraisType;
use App\Models\FraisClasse;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InscriptionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_inscriptions')->only(['index', 'show', 'recu', 'verify']);
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
                'montant_forfait' => 70000,
                'frais_inscription' => 10000,
                'frais_reinscription' => 5000,
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
                'montant_forfait' => 70000,
                'frais_inscription' => 10000,
                'frais_reinscription' => 5000,
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
            // La remise de 50% est applicable STRICTEMENT sur les nouvelles inscriptions (10 000 F -> 5 000 F), jamais sur les réinscriptions
            $hasRemise = !$isReinscription && (bool) $request->input('has_remise', false);
            $remisePourcentage = $hasRemise ? (float) $request->input('remise_pourcentage', 50.0) : 0.00;
            $remiseMontant = $hasRemise ? (float) $request->input('remise_montant', 0.0) : 0.00;

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
            $isSecondaire = $classe && $classe->isSecondaire();

            // ─────────────────────────────────────────────────────────────────
            // 🎓 SECONDAIRE — Forfait Tranche 1 : 70 000 FCFA global
            //    Les frais d'admission (inscription 10 000 / réinscription 5 000)
            //    sont inclus dans ce forfait et déduits de la scolarité annuelle.
            //    Ce bloc remplace totalement les paiements admission + scolarité T1.
            // ─────────────────────────────────────────────────────────────────
            if ($isSecondaire && $statut === 'validee') {
                $MONTANT_FORFAIT      = 70000;
                $FRAIS_INSCRIPTION    = 10000;
                $FRAIS_REINSCRIPTION  = 5000;

                // La remise de 50% s'applique sur la part admission → réduit le forfait
                $fraisAdmissionBase   = $isReinscription ? $FRAIS_REINSCRIPTION : $FRAIS_INSCRIPTION;
                $fraisAdmissionEffectif = $hasRemise ? (int) round($fraisAdmissionBase * 0.5) : $fraisAdmissionBase;
                $montantForfait       = $MONTANT_FORFAIT - ($fraisAdmissionBase - $fraisAdmissionEffectif); // 70 000 ou 65 000
                $avanceScolarite      = $montantForfait - $fraisAdmissionEffectif;

                // 1. Enregistrement de la part admission (Inscription 10 000 F ou Réinscription 5 000 F)
                $fraisAdmissionType = FraisType::where('code', $isReinscription ? 'reinscription' : 'inscription')->first();
                if (!$fraisAdmissionType) {
                    $fraisAdmissionType = FraisType::where('nom', 'LIKE', '%' . ($isReinscription ? 'réinscription' : 'inscription') . '%')->first();
                }
                if ($fraisAdmissionType && $fraisAdmissionEffectif > 0) {
                    Paiement::create([
                        'inscription_id' => $inscription->id,
                        'frais_type_id'  => $fraisAdmissionType->id,
                        'user_id'        => auth()->id(),
                        'montant'        => $fraisAdmissionEffectif,
                        'date_paiement'  => $validated['date_inscription'] ?? now(),
                        'mode_paiement'  => 'especes',
                        'reference_recu' => $inscription->numero_recu,
                        'commentaire'    => sprintf(
                            'Frais de %s (inclus dans Forfait Tranche 1 de %s F)',
                            $isReinscription ? 'réinscription' : 'inscription',
                            number_format($montantForfait, 0, ',', ' ')
                        ),
                    ]);
                }

                // 2. Enregistrement de la part Scolarité 1ère Tranche (60 000 F ou 65 000 F)
                $fraisScolarite = FraisType::where('is_scolarite', true)->first();
                if ($fraisScolarite && $avanceScolarite > 0) {
                    Paiement::create([
                        'inscription_id' => $inscription->id,
                        'frais_type_id'  => $fraisScolarite->id,
                        'user_id'        => auth()->id(),
                        'montant'        => $avanceScolarite,
                        'date_paiement'  => $validated['date_inscription'] ?? now(),
                        'mode_paiement'  => 'especes',
                        'mois'           => '1ère Tranche',
                        'reference_recu' => $inscription->numero_recu,
                        'commentaire'    => sprintf(
                            '1ère Tranche de scolarité (Forfait Tranche 1 — Dont %s F %s inclus + %s F avance scolarité)',
                            number_format($fraisAdmissionEffectif, 0, ',', ' '),
                            $isReinscription ? 'réinscription' : 'inscription',
                            number_format($avanceScolarite, 0, ',', ' ')
                        ),
                    ]);
                }
                $totalPaye += $montantForfait;

                // Frais annexes secondaire (tenue secondaire, carte, APE, assurance…)
                foreach ($fraisInput as $fraisTypeId => $data) {
                    $fraisType = FraisType::find($fraisTypeId);
                    if (!$fraisType || $fraisType->is_scolarite) continue;
                    // Les frais d'inscription et réinscription sont déjà inclus dans les 70 000 F -> JAMAIS dans les annexes
                    if (in_array($fraisType->code, ['inscription', 'reinscription'])) continue;
                    if (stripos($fraisType->nom, 'inscription') !== false) continue;
                    // Exclure la tenue primaire pour le secondaire
                    if (stripos($fraisType->nom, 'primaire') !== false) continue;

                    $isBulletin = $fraisType->code === 'bulletin' || stripos($fraisType->nom, 'bulletin') !== false;
                    if ($isBulletin) continue; // secondaire : bulletin gratuit

                    if (!empty($data['selected']) && $data['selected'] == true) {
                        $isApe = $fraisType->code === 'ape' || stripos($fraisType->nom, 'ape') !== false;
                        if ($isApe) {
                            $montant = 2000.0;
                        } else {
                            $montant = (isset($data['montant']) && $data['montant'] !== '') ? (float) $data['montant'] : null;
                            if ($montant === null || $montant <= 0) {
                                $isTenue = $fraisType->code === 'tenue' || stripos($fraisType->nom, 'tenue') !== false;
                                $montant = $isTenue ? (float) $classe->montant_tenue : (float) ($fraisType->montant ?? 0);
                            }
                        }
                        if ($montant > 0) {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisTypeId,
                                'user_id'        => auth()->id(),
                                'montant'        => $montant,
                                'date_paiement'  => $validated['date_inscription'] ?? now(),
                                'mode_paiement'  => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                            ]);
                            $totalPaye += $montant;
                        }
                    }
                }

                $inscription->update(['total_frais' => $totalPaye]);

                $message = 'Inscription secondaire validée avec succès ✅ (Forfait Tranche 1 : ' . number_format($montantForfait, 0, ',', ' ') . ' F)';
                return redirect()->route('inscriptions.index')->with('success', $message);
            }

            // ─────────────────────────────────────────────────────────────────
            // 📚 MATERNELLE / PRIMAIRE — comportement original inchangé
            // ─────────────────────────────────────────────────────────────────
            foreach ($fraisInput as $fraisTypeId => $data) {
                // Exclusion mutuelle absolue : l'un ou l'autre, pas les deux
                if ($typeAExclureId && (int)$fraisTypeId === (int)$typeAExclureId) {
                    continue;
                }

                $fraisType = FraisType::find($fraisTypeId);
                if (!$fraisType || $fraisType->is_scolarite) continue;
                if (stripos($fraisType->nom, 'secondaire') !== false) continue;

                $isBulletin = $fraisType && ($fraisType->code === 'bulletin' || stripos($fraisType->nom, 'bulletin') !== false);

                if (!empty($data['selected']) && $data['selected'] == true) {
                    $isApe = $fraisType && ($fraisType->code === 'ape' || stripos($fraisType->nom, 'ape') !== false);
                    if ($isApe) {
                        $montant = 2000.0;
                    } else {
                        $montant = (isset($data['montant']) && $data['montant'] !== '') ? (float) $data['montant'] : null;
                        if ($montant === null || $montant <= 0) {
                            if ($fraisType && $fraisType->code === 'tenue') {
                                $montant = $classe ? (float) $classe->montant_tenue : 10000.0;
                            } elseif ($isBulletin) {
                                $montant = $classe ? (float) $classe->montant_bulletin : (float) ($fraisType?->montant ?? 1000.0);
                            } else {
                                $montant = (float) ($fraisType?->montant ?? 0);
                            }
                        }
                    }

                    if ($montant > 0) {
                        Paiement::create([
                            'inscription_id' => $inscription->id,
                            'frais_type_id'  => $fraisTypeId,
                            'user_id'        => auth()->id(),
                            'montant'        => $montant,
                            'date_paiement'  => $validated['date_inscription'] ?? now(),
                            'mode_paiement'  => 'especes',
                            'reference_recu' => $inscription->numero_recu,
                        ]);
                        $totalPaye += $montant;
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
                'montant_forfait'       => 70000,
                'frais_inscription'     => 10000,
                'frais_reinscription'   => 5000,
            ],
        ]);
    }

    // Mise à jour d'une inscription
    public function update(Request $request, Inscription $inscription)
    {
        $validated = $request->validate([
            'eleve_id'          => 'required|exists:eleves,id',
            'classe_id'         => 'required|exists:classes,id',
            'date_inscription'  => 'nullable|date',
            'admission_type'    => 'nullable|in:inscription,reinscription',
            'statut'            => 'required|in:brouillon,en_attente,validee,rejete',
            'frais'             => 'nullable|array',
            'frais.*.selected'  => 'boolean',
            'frais.*.montant'   => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $inscription, $request) {
            $isReinscription = $request->has('admission_type')
                ? ($request->admission_type === 'reinscription')
                : $inscription->reinscription;

            $inscription->update([
                'eleve_id'          => $validated['eleve_id'],
                'classe_id'         => $validated['classe_id'],
                'date_inscription'  => $validated['date_inscription'] ?? $inscription->date_inscription,
                'statut'            => $validated['statut'],
                'reinscription'     => $isReinscription,
                'has_remise'        => false,
                'remise_pourcentage'=> 0,
                'remise_montant'    => 0,
            ]);

            // AJOUT DE FRAIS ANNEXES SUPPLÉMENTAIRES (lors de la validation d'une préinscription)
            if ($validated['statut'] === 'validee') {
                $MONTANT_FORFAIT     = 70000;
                $FRAIS_INSCRIPTION   = 10000;
                $FRAIS_REINSCRIPTION = 5000;

                $fraisInput  = $request->input('frais', []);
                $user        = auth()->user();
                $classe      = Classe::find($validated['classe_id']);
                $isSecondaire = $classe && $classe->isSecondaire();
                $dateOp      = $validated['date_inscription'] ?? now();
                $totalAjoute = 0;

                $fraisScolarite = FraisType::where('is_scolarite', true)->first();

                // ─────────────────────────────────────────────────────────────
                // 🎓 SECONDAIRE — Forfait Tranche 1 : 70 000 FCFA global
                //    La remise de 50% sur l'admission réduit le forfait si active.
                // ─────────────────────────────────────────────────────────────
                if ($isSecondaire) {
                    $fraisAdmissionBase     = $isReinscription ? $FRAIS_REINSCRIPTION : $FRAIS_INSCRIPTION;
                    // Récupère la remise éventuelle stockée dans l'inscription
                    $hasRemiseEffective     = $inscription->has_remise && !$isReinscription;
                    $fraisAdmissionEffectif = $hasRemiseEffective ? (int) round($fraisAdmissionBase * 0.5) : $fraisAdmissionBase;
                    $montantForfait         = $MONTANT_FORFAIT - ($fraisAdmissionBase - $fraisAdmissionEffectif);
                    $avanceScolarite        = $montantForfait - $fraisAdmissionEffectif;

                    // 1. Part admission
                    $fraisAdmissionType = FraisType::where('code', $isReinscription ? 'reinscription' : 'inscription')->first();
                    if (!$fraisAdmissionType) {
                        $fraisAdmissionType = FraisType::where('nom', 'LIKE', '%' . ($isReinscription ? 'réinscription' : 'inscription') . '%')->first();
                    }
                    if ($fraisAdmissionType && $fraisAdmissionEffectif > 0) {
                        $admissionDejaEnregistre = Paiement::where('inscription_id', $inscription->id)
                            ->where('frais_type_id', $fraisAdmissionType->id)
                            ->exists();
                        if (!$admissionDejaEnregistre) {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisAdmissionType->id,
                                'user_id'        => $user?->id,
                                'montant'        => $fraisAdmissionEffectif,
                                'date_paiement'  => $dateOp,
                                'mode_paiement'  => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                                'commentaire'    => sprintf(
                                    'Frais de %s (inclus dans Forfait Tranche 1 de %s F)',
                                    $isReinscription ? 'réinscription' : 'inscription',
                                    number_format($montantForfait, 0, ',', ' ')
                                ),
                            ]);
                            $totalAjoute += $fraisAdmissionEffectif;
                        }
                    }

                    // 2. Part Scolarité 1ère Tranche
                    if ($fraisScolarite && $avanceScolarite > 0) {
                        $scolariteDejaEnregistre = Paiement::where('inscription_id', $inscription->id)
                            ->where('frais_type_id', $fraisScolarite->id)
                            ->exists();
                        if (!$scolariteDejaEnregistre) {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisScolarite->id,
                                'user_id'        => $user?->id,
                                'montant'        => $avanceScolarite,
                                'date_paiement'  => $dateOp,
                                'mode_paiement'  => 'especes',
                                'mois'           => '1ère Tranche',
                                'reference_recu' => $inscription->numero_recu,
                                'commentaire'    => sprintf(
                                    '1ère Tranche de scolarité (Forfait Tranche 1 — Dont %s F %s inclus + %s F avance scolarité)',
                                    number_format($fraisAdmissionEffectif, 0, ',', ' '),
                                    $isReinscription ? 'réinscription' : 'inscription',
                                    number_format($avanceScolarite, 0, ',', ' ')
                                ),
                            ]);
                            $totalAjoute += $avanceScolarite;
                        }
                    }

                    // Frais annexes secondaire (tenue secondaire, carte, APE, assurance…) non encore payés
                    foreach ($fraisInput as $fraisTypeId => $data) {
                        if (!empty($data['selected']) && $data['selected'] == true) {
                            $fraisType = FraisType::find($fraisTypeId);
                            if (!$fraisType || $fraisType->is_scolarite) continue;
                            if (in_array($fraisType->code, ['inscription', 'reinscription'])) continue;
                            if (stripos($fraisType->nom, 'inscription') !== false) continue;
                            if (stripos($fraisType->nom, 'primaire') !== false) continue;

                            $isBulletin = $fraisType->code === 'bulletin' || stripos($fraisType->nom, 'bulletin') !== false;
                            if ($isBulletin) continue; // secondaire : bulletin 0F

                            $alreadyPaid = Paiement::where('inscription_id', $inscription->id)
                                ->where('frais_type_id', $fraisTypeId)
                                ->exists();
                            if ($alreadyPaid) continue;

                            $isApe = $fraisType->code === 'ape' || stripos($fraisType->nom, 'ape') !== false;
                            if ($isApe) {
                                $montant = 2000.0;
                            } else {
                                $isTenue = $fraisType->code === 'tenue' || stripos($fraisType->nom, 'tenue') !== false;
                                $montant = (isset($data['montant']) && $data['montant'] !== '') ? (float)$data['montant'] : null;
                                if (!$montant || $montant <= 0) {
                                    $montant = $isTenue ? (float)$classe->montant_tenue : (float)($fraisType->montant ?? 0);
                                }
                            }
                            if ($montant <= 0) continue;

                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisTypeId,
                                'user_id'        => $user?->id,
                                'montant'        => $montant,
                                'date_paiement'  => $dateOp,
                                'mode_paiement'  => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                            ]);
                            $totalAjoute += $montant;
                        }
                    }

                } else {
                    // ─────────────────────────────────────────────────────────
                    // 📚 MATERNELLE / PRIMAIRE — comportement original inchangé
                    // ─────────────────────────────────────────────────────────
                    foreach ($fraisInput as $fraisTypeId => $data) {
                        if ($typeAExclureId && (int)$fraisTypeId === (int)$typeAExclureId) {
                            continue;
                        }
                        if (!empty($data['selected']) && $data['selected'] == true) {
                            $fraisType = FraisType::find($fraisTypeId);
                            if (!$fraisType || $fraisType->is_scolarite) continue;
                            if (stripos($fraisType->nom, 'secondaire') !== false) continue;

                            $alreadyPaid = Paiement::where('inscription_id', $inscription->id)
                                ->where('frais_type_id', $fraisTypeId)
                                ->exists();
                            if ($alreadyPaid) continue;

                            $isApe = $fraisType && ($fraisType->code === 'ape' || stripos($fraisType->nom, 'ape') !== false);
                            if ($isApe) {
                                $montant = 2000.0;
                            } else {
                                $montant = (isset($data['montant']) && $data['montant'] !== '') ? (float)$data['montant'] : (float)($fraisType->montant ?? 0);
                            }
                            if ($montant <= 0) continue;

                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id'  => $fraisTypeId,
                                'user_id'        => $user?->id,
                                'montant'        => $montant,
                                'date_paiement'  => $dateOp,
                                'mode_paiement'  => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                            ]);
                            $totalAjoute += $montant;
                        }
                    }
                }

                if ($totalAjoute > 0) {
                    $inscription->increment('total_frais', $totalAjoute);
                }
            }
        });

        return redirect()->route('inscriptions.index')
            ->with('success', 'Inscription mise à jour avec succès ✅');
    }

    // Supprimer une inscription
    public function destroy(Inscription $inscription)
    {
        $inscription->delete();

        return redirect()->route('inscriptions.index')
            ->with('success', 'Inscription supprimée ✅');
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

    // Vérifier l'authenticité d'un reçu
    public function verify($code)
    {
        $inscription = Inscription::where('code_securite', $code)
            ->with('eleve.user', 'classe', 'anneeScolaire')
            ->first();

        return Inertia::render('Inscriptions/Verify', [
            'inscription' => $inscription,
            'code' => $code
        ]);
    }
}
