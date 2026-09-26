<?php

namespace App\Http\Controllers;

use App\Models\Arriere;
use App\Models\ArrierePaiement;
use App\Models\Eleve;
use App\Models\FraisType;
use App\Models\Paiement;
use App\Models\Etablissement;
use App\Http\Requests\StoreArriereRequest;
use App\Http\Requests\UpdateArriereRequest;
use App\Http\Requests\PayerArriereRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Exception;

class ArriereController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['verify']);
        $this->middleware('permission:voir_arrieres')->only(['index']);
        $this->middleware('permission:ajouter_arrieres')->only(['store']);
        $this->middleware('permission:modifier_arrieres')->only(['update']);
        $this->middleware('permission:supprimer_arrieres')->only(['destroy']);
        $this->middleware('permission:encaisser_arrieres')->only(['payer']);
        $this->middleware('permission:voir_arrieres|ajouter_arrieres')->only(['searchEleves']);
        $this->middleware('permission:voir_arrieres|encaisser_arrieres')->only(['recu']);
    }

    /**
     * Recherche asynchrone d'élèves pour la création d'arriérés (optimisation performances)
     */
    public function searchEleves(Request $request)
    {
        $q = trim($request->input('q', ''));
        if (strlen($q) < 1) {
            return response()->json([]);
        }

        $eleves = Eleve::with(['user:id,nom,prenom', 'inscriptions.classe'])
            ->where(function ($query) use ($q) {
                $query->where('matricule', 'like', "%{$q}%")
                      ->orWhereHas('user', function ($uq) use ($q) {
                          $uq->where('nom', 'like', "%{$q}%")
                             ->orWhere('prenom', 'like', "%{$q}%");
                      });
            })
            ->limit(15)
            ->get()
            ->map(function ($e) {
                $nom = $e->user->nom ?? '';
                $prenom = $e->user->prenom ?? '';
                $derniereClasse = $e->inscriptions->last()?->classe?->nom ?? '';
                return [
                    'id' => $e->id,
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'nom_complet' => trim("{$nom} {$prenom}"),
                    'matricule' => $e->matricule ?? '',
                    'classe' => $derniereClasse,
                ];
            });

        return response()->json($eleves);
    }

    /**
     * Liste des arriérés scolaires antérieurs
     */
    public function index(Request $request)
    {
        $query = Arriere::with(['eleve.user', 'fraisType', 'createur', 'paiements.user'])
            ->orderBy('created_at', 'desc');

        // Filtre Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom_eleve', 'like', "%{$search}%")
                  ->orWhere('prenom_eleve', 'like', "%{$search}%")
                  ->orWhere('classe_origine', 'like', "%{$search}%");
            });
        }

        // Filtre Année scolaire de la dette
        if ($request->filled('annee')) {
            $query->where('annee_scolaire_dette', $request->annee);
        }

        // Filtre Statut
        if ($request->filled('statut') && in_array($request->statut, ['non_solde', 'partiellement_solde', 'solde'])) {
            $query->where('statut', $request->statut);
        }

        // Statistiques globales de recouvrement (sans pagination)
        $allStats = Arriere::selectRaw('
            COUNT(*) as total_count,
            COALESCE(SUM(montant_total), 0) as total_dettes,
            COALESCE(SUM(montant_paye), 0) as total_recouvre,
            COALESCE(SUM(montant_restant), 0) as total_restant,
            SUM(CASE WHEN statut = "non_solde" THEN 1 ELSE 0 END) as count_non_solde,
            SUM(CASE WHEN statut = "partiellement_solde" THEN 1 ELSE 0 END) as count_partiel,
            SUM(CASE WHEN statut = "solde" THEN 1 ELSE 0 END) as count_solde
        ')->first();

        $totalDettes = (float) $allStats->total_dettes;
        $totalRecouvre = (float) $allStats->total_recouvre;
        $tauxRecouvrement = $totalDettes > 0 ? round(($totalRecouvre / $totalDettes) * 100, 1) : 0;

        // Liste distincte des années scolaires enregistrées
        $existingYears = Arriere::distinct()->pluck('annee_scolaire_dette')->toArray();
        $defaultYears = ['2025-2026', '2024-2025', '2023-2024', '2022-2023'];
        $allYears = array_values(array_unique(array_merge($defaultYears, $existingYears)));
        rsort($allYears);

        $arrieres = $query->paginate(15)->withQueryString();

        return Inertia::render('Arrieres/Index', [
            'arrieres' => $arrieres,
            'filters' => $request->only(['search', 'annee', 'statut']),
            'stats' => [
                'total_count' => (int) $allStats->total_count,
                'total_dettes' => $totalDettes,
                'total_recouvre' => $totalRecouvre,
                'total_restant' => (float) $allStats->total_restant,
                'taux_recouvrement' => $tauxRecouvrement,
                'count_non_solde' => (int) $allStats->count_non_solde,
                'count_partiel' => (int) $allStats->count_partiel,
                'count_solde' => (int) $allStats->count_solde,
            ],
            'anneesDisponibles' => $allYears,
        ]);
    }

    /**
     * Enregistrer un arriéré pour un élève
     */
    public function store(StoreArriereRequest $request)
    {
        $validated = $request->validated();
        $anneeDette = trim($validated['annee_scolaire_dette']);

        // Créer ou récupérer le type de frais correspondant à l'arriéré de cette année
        $nomFrais = "Arriéré de l'année {$anneeDette}";
        $codeFrais = "arriere_" . Str::slug($anneeDette);

        $fraisType = FraisType::firstOrCreate(
            ['nom' => $nomFrais],
            [
                'code' => $codeFrais,
                'montant' => 0,
                'globale' => true,
                'is_scolarite' => false,
            ]
        );

        $arriere = Arriere::create([
            'eleve_id' => $validated['eleve_id'] ?? null,
            'nom_eleve' => $validated['nom_eleve'],
            'prenom_eleve' => $validated['prenom_eleve'] ?? null,
            'classe_origine' => $validated['classe_origine'] ?? null,
            'annee_scolaire_dette' => $anneeDette,
            'montant_total' => $validated['montant_total'],
            'montant_paye' => 0,
            'montant_restant' => $validated['montant_total'],
            'statut' => 'non_solde',
            'frais_type_id' => $fraisType->id,
            'observations' => $validated['observations'] ?? null,
            'created_by' => auth()->id(),
        ]);

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($arriere)
                ->log("A enregistré un arriéré de scolarité de " . number_format($arriere->montant_total, 0, ',', ' ') . " FCFA pour {$arriere->nom_complet} (Année {$anneeDette})");
        }

        return redirect()->back()->with('success', "Arriéré de {$arriere->nom_complet} ({$anneeDette}) enregistré avec succès.");
    }

    /**
     * Mettre à jour un arriéré
     */
    public function update(UpdateArriereRequest $request, Arriere $arriere)
    {
        $validated = $request->validated();
        $anneeDette = trim($validated['annee_scolaire_dette']);

        // Créer ou récupérer le type de frais correspondant si l'année change
        $nomFrais = "Arriéré de l'année {$anneeDette}";
        $codeFrais = "arriere_" . Str::slug($anneeDette);
        $fraisType = FraisType::firstOrCreate(
            ['nom' => $nomFrais],
            ['code' => $codeFrais, 'montant' => 0, 'globale' => true, 'is_scolarite' => false]
        );

        $nouveauTotal = (float) $validated['montant_total'];
        $nouveauRestant = max(0, $nouveauTotal - (float) $arriere->montant_paye);
        
        $statut = 'non_solde';
        if ($nouveauRestant <= 0) {
            $statut = 'solde';
        } elseif ($arriere->montant_paye > 0) {
            $statut = 'partiellement_solde';
        }

        $arriere->update([
            'nom_eleve' => $validated['nom_eleve'],
            'prenom_eleve' => $validated['prenom_eleve'] ?? null,
            'classe_origine' => $validated['classe_origine'] ?? null,
            'annee_scolaire_dette' => $anneeDette,
            'montant_total' => $nouveauTotal,
            'montant_restant' => $nouveauRestant,
            'statut' => $statut,
            'frais_type_id' => $fraisType->id,
            'observations' => $validated['observations'] ?? null,
        ]);

        return redirect()->back()->with('success', "Arriéré de {$arriere->nom_complet} mis à jour avec succès.");
    }

    /**
     * Supprimer un arriéré
     */
    public function destroy(Arriere $arriere)
    {
        if ($arriere->montant_paye > 0 && !auth()->user()->hasRole('super-admin')) {
            return redirect()->back()->with('error', "Cet arriéré contient déjà des versements encaissés. Seul un Super-Admin peut le supprimer.");
        }

        $nom = $arriere->nom_complet;
        $arriere->delete();

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->log("A supprimé l'arriéré de scolarité de {$nom}");
        }

        return redirect()->back()->with('success', "L'arriéré de {$nom} a été supprimé.");
    }

    /**
     * Encaisser un versement sur un arriéré (Thread-safe & Concurrency proof)
     */
    public function payer(PayerArriereRequest $request, Arriere $arriere)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $montantVerse = (float) $validated['montant'];

            // 1. Créer l'enregistrement avec un jeton temporaire unique pour acquérir l'ID MySQL garanti unique
            $tempToken = 'REC-ARR-PENDING-' . Str::uuid();
            $arrierePaiement = ArrierePaiement::create([
                'arriere_id' => $arriere->id,
                'user_id' => auth()->id(),
                'numero_recu' => $tempToken,
                'montant' => $montantVerse,
                'date_paiement' => $validated['date_paiement'],
                'mode_paiement' => $validated['mode_paiement'],
                'reference_paiement' => $validated['reference_paiement'] ?? null,
                'commentaire' => $validated['commentaire'] ?? null,
            ]);

            // 2. Générer le numéro de reçu officiel séquentiel basé sur l'ID réel unique
            $numeroRecu = 'REC-ARR-' . str_pad($arrierePaiement->id, 6, '0', STR_PAD_LEFT);
            $arrierePaiement->update(['numero_recu' => $numeroRecu]);

            // 3. Mettre à jour l'arriéré
            $nouveauPaye = (float) $arriere->montant_paye + $montantVerse;
            $nouveauRestant = max(0, (float) $arriere->montant_total - $nouveauPaye);
            $statut = ($nouveauRestant <= 0) ? 'solde' : 'partiellement_solde';

            $arriere->update([
                'montant_paye' => $nouveauPaye,
                'montant_restant' => $nouveauRestant,
                'statut' => $statut,
            ]);

            // 4. Intégrer dans la comptabilité globale (Paiement caisse) avec mention explicite
            $activeInscription = $arriere->eleve?->inscriptionEnCours()->first() ?? $arriere->eleve?->inscriptionActuelle()->first();

            Paiement::create([
                'inscription_id' => $activeInscription?->id,
                'frais_type_id' => $arriere->frais_type_id,
                'user_id' => auth()->id(),
                'montant' => $montantVerse,
                'date_paiement' => $validated['date_paiement'],
                'mode_paiement' => $validated['mode_paiement'],
                'mois' => "Arriéré {$arriere->annee_scolaire_dette}",
                'commentaire' => "Règlement arriéré de l'année {$arriere->annee_scolaire_dette} - Élève : {$arriere->nom_complet} (Reçu N° {$numeroRecu})" . ($validated['reference_paiement'] ?? '' ? " - Réf: {$validated['reference_paiement']}" : ""),
                'arriere_paiement_id' => $arrierePaiement->id,
            ]);

            if (function_exists('activity')) {
                activity()
                    ->causedBy(auth()->user())
                    ->performedOn($arriere)
                    ->log("A encaissé un règlement d'arriéré de " . number_format($montantVerse, 0, ',', ' ') . " FCFA pour {$arriere->nom_complet} (Année {$arriere->annee_scolaire_dette}) - Reçu : {$numeroRecu}");
            }

            DB::commit();

            return redirect()->back()->with([
                'success' => "Versement de " . number_format($montantVerse, 0, ',', ' ') . " FCFA encaissé avec succès (Reçu : {$numeroRecu}).",
                'dernier_recu_arriere_id' => $arrierePaiement->id,
                'dernier_recu_arriere_numero' => $numeroRecu,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', "Erreur lors de l'encaissement : " . $e->getMessage());
        }
    }

    /**
     * Afficher le reçu officiel de versement d'arriéré
     */
    public function recu(ArrierePaiement $arrierePaiement)
    {
        $arrierePaiement->load(['arriere.eleve.user', 'arriere.fraisType', 'user']);
        $arriere = $arrierePaiement->arriere;
        $etablissement = Etablissement::first();

        // Calcul du cumul payé jusqu'à ce versement précis
        $totalPayeJusquici = (float) ArrierePaiement::where('arriere_id', $arriere->id)
            ->where('id', '<=', $arrierePaiement->id)
            ->sum('montant');

        $resteApresVersement = max(0, (float) $arriere->montant_total - $totalPayeJusquici);

        return Inertia::render('Arrieres/Recu', [
            'recu' => [
                'id' => $arrierePaiement->id,
                'numero_recu' => $arrierePaiement->numero_recu,
                'montant' => (float) $arrierePaiement->montant,
                'date_paiement' => $arrierePaiement->date_paiement ? $arrierePaiement->date_paiement->format('d/m/Y') : now()->format('d/m/Y'),
                'created_at' => $arrierePaiement->created_at ? $arrierePaiement->created_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i'),
                'mode_paiement' => $arrierePaiement->mode_paiement,
                'reference_paiement' => $arrierePaiement->reference_paiement,
                'commentaire' => $arrierePaiement->commentaire,
                'mention_officielle' => "Arriéré de l'année " . $arriere->annee_scolaire_dette,
                'annee_dette' => $arriere->annee_scolaire_dette,
                'caissier' => $arrierePaiement->user ? ($arrierePaiement->user->nom . ' ' . $arrierePaiement->user->prenom) : 'Caisse Principale',
                'eleve_nom_complet' => $arriere->nom_complet,
                'classe_origine' => $arriere->classe_origine ?? 'N/A',
                'financial_context' => [
                    'montant_total_dette' => (float) $arriere->montant_total,
                    'total_deja_paye' => $totalPayeJusquici,
                    'reste_du' => $resteApresVersement,
                    'statut' => ($resteApresVersement <= 0) ? 'Soldé' : 'Partiellement Soldé',
                ],
            ],
            'etablissement' => $etablissement,
            'url_verification' => route('arrieres.verify', $arrierePaiement->numero_recu ?: $arrierePaiement->id),
        ]);
    }

    /**
     * Vérification publique d'un reçu de versement d'arriéré scanné par QR code.
     */
    public function verify($numero_recu)
    {
        $arrierePaiement = ArrierePaiement::where('numero_recu', $numero_recu)
            ->orWhere('id', $numero_recu)
            ->with(['arriere.eleve.user', 'user'])
            ->first();

        $etablissement = Etablissement::first();

        return Inertia::render('Paiements/Verify', [
            'paiement' => $arrierePaiement ? [
                'id' => $arrierePaiement->id,
                'reference_recu' => $arrierePaiement->numero_recu,
                'montant' => (float) $arrierePaiement->montant,
                'date_paiement' => $arrierePaiement->date_paiement ? $arrierePaiement->date_paiement->format('Y-m-d') : null,
                'mode_paiement' => $arrierePaiement->mode_paiement,
                'mois' => 'Arriérés Antérieurs',
                'commentaire' => $arrierePaiement->commentaire,
                'frais_type_nom' => 'Règlement Arriéré de Scolarité',
                'is_scolarite' => false,
                'caissier' => $arrierePaiement->user ? ($arrierePaiement->user->nom . ' ' . $arrierePaiement->user->prenom) : 'Caisse Principale',
                'eleve_nom_complet' => $arrierePaiement->arriere->nom_complet ?? ($arrierePaiement->arriere->eleve?->user ? ($arrierePaiement->arriere->eleve->user->nom . ' ' . $arrierePaiement->arriere->eleve->user->prenom) : 'N/A'),
                'eleve_matricule' => $arrierePaiement->arriere->matricule ?? ($arrierePaiement->arriere->eleve?->matricule ?? 'N/A'),
                'classe_nom' => $arrierePaiement->arriere->classe_origine ?? 'N/A',
                'annee_scolaire_nom' => $arrierePaiement->arriere->annee_scolaire_dette ?? 'Antérieure',
                'created_at' => $arrierePaiement->created_at ? $arrierePaiement->created_at->toISOString() : null,
            ] : null,
            'reference' => $numero_recu,
            'type_recu' => 'arriere',
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
}
