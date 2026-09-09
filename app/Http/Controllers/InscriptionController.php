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

        // Récupérer UNIQUEMENT les frais d'inscription / annexes (exclure la scolarité)
        $fraisTypes = FraisType::where('is_scolarite', false)
            ->where(function($q) use ($annee_en_cours) {
                $q->where('annee_scolaire_id', $annee_en_cours->id)
                  ->orWhereNull('annee_scolaire_id')
                  ->orWhere('globale', true);
            })->get();

        // Récupérer la grille de scolarité pour information
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
        
        // Récupérer UNIQUEMENT les frais d'inscription / annexes (exclure la scolarité)
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
            $fraisInscription = FraisType::where('code', 'inscription')->first();
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

            foreach ($fraisInput as $fraisTypeId => $data) {
                // Exclusion mutuelle absolue : l'un ou l'autre, pas les deux
                if ($typeAExclureId && (int)$fraisTypeId === (int)$typeAExclureId) {
                    continue;
                }

                $fraisType = FraisType::find($fraisTypeId);
                $isBulletin = $fraisType && ($fraisType->code === 'bulletin' || stripos($fraisType->nom, 'bulletin') !== false);

                // Au secondaire, le bulletin est gratuit (0 FCFA - aucun paiement exigible)
                if ($isBulletin && $isSecondaire) {
                    continue;
                }

                // Check if this fee was selected for payment
                if (!empty($data['selected']) && $data['selected'] == true) {
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

                    if ($montant > 0) {
                        Paiement::create([
                            'inscription_id' => $inscription->id,
                            'frais_type_id' => $fraisTypeId,
                            'user_id' => auth()->id(),
                            'montant' => $montant,
                            'date_paiement' => $validated['date_inscription'] ?? now(),
                            'mode_paiement' => 'especes',
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

        // Récupérer UNIQUEMENT les frais d'inscription / annexes (exclure la scolarité)
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
            'inscription' => $inscription,
            'elevePreSelectionne' => $elevePreSelectionne,
            'eleves' => $eleves,
            'classes' => $classes,
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses,
            'annee_en_cours' => $annee_en_cours,
        ]);
    }

    // Mise à jour d'une inscription (Validation de préinscription)
    public function update(Request $request, Inscription $inscription)
    {
        $validated = $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'classe_id' => 'required|exists:classes,id',
            'date_inscription' => 'nullable|date',
            'admission_type' => 'nullable|in:inscription,reinscription',
            'has_remise' => 'nullable|boolean',
            'remise_pourcentage' => 'nullable|numeric|min:0|max:100',
            'remise_montant' => 'nullable|numeric|min:0',
            'statut' => 'required|in:brouillon,en_attente,validee,rejete',
            'frais' => 'nullable|array', 
            'frais.*.selected' => 'boolean',
            'frais.*.montant' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $inscription, $request) {
            $isReinscription = $request->has('admission_type') 
                ? ($request->admission_type === 'reinscription')
                : $inscription->reinscription;

            $hasRemise = !$isReinscription && ($request->has('has_remise') 
                ? (bool) $request->input('has_remise')
                : $inscription->has_remise);
            $remisePourcentage = $hasRemise ? (float) $request->input('remise_pourcentage', 50.0) : 0.00;
            $remiseMontant = $hasRemise ? (float) $request->input('remise_montant', $inscription->remise_montant ?? 0.0) : 0.00;

            // Update inscription details
            $inscription->update([
                'eleve_id' => $validated['eleve_id'],
                'classe_id' => $validated['classe_id'],
                'date_inscription' => $validated['date_inscription'] ?? $inscription->date_inscription,
                'statut' => $validated['statut'],
                'reinscription' => $isReinscription,
                'has_remise' => $hasRemise,
                'remise_pourcentage' => $remisePourcentage,
                'remise_montant' => $remiseMontant,
            ]);

            // GESTION DES PAIEMENTS DES FRAIS D'INSCRIPTION
            if ($validated['statut'] === 'validee') {
                $fraisInput = $request->input('frais', []);
                $user = auth()->user();
                $totalAjoute = 0;

                $fraisInscription = FraisType::where('code', 'inscription')->first();
                $fraisReinscription = FraisType::where('code', 'reinscription')->first();

                $typeAExclureId = $isReinscription 
                    ? ($fraisInscription?->id) 
                    : ($fraisReinscription?->id);

                $classe = Classe::find($validated['classe_id']);
                $isSecondaire = $classe && $classe->isSecondaire();

                foreach ($fraisInput as $fraisTypeId => $data) {
                    if ($typeAExclureId && (int)$fraisTypeId === (int)$typeAExclureId) {
                        continue;
                    }

                    $fraisType = FraisType::find($fraisTypeId);
                    $isBulletin = $fraisType && ($fraisType->code === 'bulletin' || stripos($fraisType->nom, 'bulletin') !== false);

                    // Au secondaire, le bulletin est gratuit (0 FCFA - aucun paiement exigible)
                    if ($isBulletin && $isSecondaire) {
                        continue;
                    }

                    if (!empty($data['selected']) && $data['selected'] == true) {
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
                        
                        $alreadyPaid = Paiement::where('inscription_id', $inscription->id)
                            ->where('frais_type_id', $fraisTypeId)
                            ->exists();

                        if (!$alreadyPaid && $montant > 0) {
                            Paiement::create([
                                'inscription_id' => $inscription->id,
                                'frais_type_id' => $fraisTypeId,
                                'user_id' => $user ? $user->id : null,
                                'montant' => $montant,
                                'date_paiement' => $validated['date_inscription'] ?? now(),
                                'mode_paiement' => 'especes',
                                'reference_recu' => $inscription->numero_recu,
                            ]);
                            $totalAjoute += $montant;
                        }
                    }
                }
                
                // Update total
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
