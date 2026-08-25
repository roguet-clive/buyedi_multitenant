<?php

namespace App\Http\Controllers;

use App\Models\Inscription;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\FraisType;
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
            $inscriptions = Inscription::with('eleve.user', 'classe', 'anneeScolaire')
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
            $inscriptions = Inscription::with('eleve.user', 'classe', 'anneeScolaire')
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

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        
        $query = Inscription::with('eleve.user', 'classe', 'anneeScolaire')
            ->when($currentYear, fn($q) => $q->where('annee_scolaire_id', $currentYear->id));

        // ADMIN FILTERS
        $query->when($statut, fn($q) => $q->where('statut', $statut))
                ->when($search, fn($q) =>
                $q->whereHas('eleve.user', fn($u) =>
                    $u->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                )
            );

        $inscriptions = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Inscriptions/Index', [
            'inscriptions' => $inscriptions,
            'filters' => ['search' => $search, 'statut' => $statut],
            'fraisTypes' => FraisType::all(), // Pass feesTypes for filters if needed later
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

        // Fetch ONLY fee types for the current year
        $fraisTypes = FraisType::where('annee_scolaire_id', $annee_en_cours->id)->get();

        // Obtenir les IDs des élèves déjà inscrits pour l'année en cours
        $elevesInscritsIds = Inscription::where('annee_scolaire_id', $annee_en_cours->id)
                                        ->pluck('eleve_id')
                                        ->toArray();

        // Ne sélectionner que les élèves non inscrits
        $eleves = $eleve 
            ? [] 
            : Eleve::with('user')->whereNotIn('id', $elevesInscritsIds)->get();

        return Inertia::render('Inscriptions/Create', [
            'eleve' => $eleve?->load('user'),
            'eleves' => $eleves,
            'classes' => Classe::all(),
            'annee_en_cours' => $annee_en_cours,
            'fraisTypes' => $fraisTypes,
        ]);
    }


    // Formulaire de création pour un élève précis
    public function createForEleve(Eleve $eleve)
    {
        $annee_en_cours = AnneeScolaire::enCours()->first();
        $classes = Classe::orderBy('nom')->get();
        
        // Fetch ONLY fee types for the current year
        $fraisTypes = FraisType::where('annee_scolaire_id', $annee_en_cours->id)->get();

        return Inertia::render('Inscriptions/Create', [
            'elevePreSelectionne' => $eleve->load('user'),
            'eleves' => [],
            'classes' => $classes,
            'annee_en_cours' => $annee_en_cours,
            'fraisTypes' => $fraisTypes,
        ]);
    }

    // Stocker une inscription avec frais sélectionnés
    public function store(Request $request)
    {
        $validated = $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'classe_id' => 'required|exists:classes,id',
            'date_inscription' => 'nullable|date',
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
            
            // 🔍 Détection automatique de Réinscription
            // Si l'élève a une inscription dans une année précédente (différente de celle en cours)
            $isReinscription = Inscription::where('eleve_id', $validated['eleve_id'])
                ->where('annee_scolaire_id', '!=', $anneeEnCours->id)
                ->exists();

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
                'statut' => $statut,
            ]);

            // 4. Enregistrement des Paiements (Seulement si Validée ou sur demande explicite)
            // Si c'est une 'en_attente' (préinscription), on peut ne pas exiger de paiement tout de suite.
            
            $totalPaye = 0;
            $fraisInput = $request->input('frais', []);

            foreach ($fraisInput as $fraisTypeId => $data) {
                // Check if this fee was selected for payment
                if (!empty($data['selected']) && $data['selected'] == true) {
                    
                    $montant = $data['montant'] ?? 0;
                    if ($montant > 0) {
                        Paiement::create([
                            'inscription_id' => $inscription->id,
                            'frais_type_id' => $fraisTypeId,
                            'user_id' => auth()->id(),
                            'montant' => $montant,
                            'date_paiement' => $validated['date_inscription'] ?? now(),
                            'mode_paiement' => 'especes', // Default for now
                            'reference' => 'INS-' . $inscription->id . '-' . $fraisTypeId,
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
        $inscription->load('eleve.user', 'classe', 'anneeScolaire');

        return Inertia::render('Inscriptions/Show', [
            'inscription' => $inscription,
        ]);
    }

    // Formulaire d'édition
    public function edit(Inscription $inscription)
    {
        $inscription->load('eleve.user', 'classe', 'anneeScolaire');
        $eleves = Eleve::with('user')->get();
        $classes = Classe::all();
        $annee_en_cours = AnneeScolaire::enCours()->first();

        // Fetch ALL fee types
        $fraisTypes = FraisType::all();

        $elevePreSelectionne = $inscription->eleve;

        return Inertia::render('Inscriptions/Create', compact(
            'inscription', 'eleves', 'classes', 'fraisTypes', 'annee_en_cours', 'elevePreSelectionne'
        ));
    }

    // Mise à jour d'une inscription (Validation de préinscription)
    public function update(Request $request, Inscription $inscription)
    {
        $validated = $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'classe_id' => 'required|exists:classes,id',
            'date_inscription' => 'nullable|date',
            'statut' => 'required|in:brouillon,en_attente,validee,rejete',
            'frais' => 'nullable|array', 
            'frais.*.selected' => 'boolean',
            'frais.*.montant' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $inscription, $request) {
            // Update inscription details
            $inscription->update([
                'eleve_id' => $validated['eleve_id'],
                'classe_id' => $validated['classe_id'],
                'date_inscription' => $validated['date_inscription'] ?? $inscription->date_inscription,
                'statut' => $validated['statut'],
            ]);

            // HANDLE PAYMENTS for Validation (only if now Validated)
            // Logic: we create payments for selected fees ONLY if they don't already exist or if we want to add more.
            // Simplified: If status became 'validee' from something else, or simply is 'validee', we process new payments.
            
            if ($validated['statut'] === 'validee') {
                $fraisInput = $request->input('frais', []);
                $user = auth()->user();
                $totalAjoute = 0;

                foreach ($fraisInput as $fraisTypeId => $data) {
                    if (!empty($data['selected']) && $data['selected'] == true) {
                        $montant = $data['montant'] ?? 0;
                        
                        // Check if payment already exists for this fee type on this inscription
                        // To allow partial payments or multiple payments for same fee, we might need more complex logic.
                        // But for "Initial Inscription Payment", we usually check if it's already paid.
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
                                'reference' => 'INS-' . $inscription->id . '-' . $fraisTypeId,
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
