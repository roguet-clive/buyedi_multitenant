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
        // Vérifier que l'utilisateur a le droit de voir ce paiement
        if ($this->isStudent()) {
             if ($paiement->inscription->eleve->user_id !== auth()->id()) {
                abort(403);
             }
        } else {
            if (!auth()->user()->can('voir_paiements')) {
                abort(403);
            }
        }

        $paiement->load(['inscription.eleve.user', 'inscription.anneeScolaire', 'inscription.classe', 'fraisType', 'user']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('paiements.recu', compact('paiement'));
        return $pdf->stream('Recu_Paiement_' . $paiement->reference . '.pdf');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return redirect()->back()->with('error', 'Aucune année scolaire en cours définie.');
        }

        // 🎓 VUE ÉLÈVE
        if ($this->isStudent()) {
            $inscription = $this->getStudentInscription();

            if (!$inscription) {
                return back()->with('error', 'Non inscrit pour cette année.');
            }

            // Historique des paiements
            $paiements = Paiement::with('fraisType')
                ->where('inscription_id', $inscription->id)
                ->latest()
                ->get();

            // Calcul du Reste à Payer (Estimation basée sur Frais de Classe)
            $fraisClasse = FraisClasse::where('classe_id', $inscription->classe_id)
                ->where('annee_scolaire_id', $inscription->annee_scolaire_id)
                ->with('fraisType')
                ->get();

            $balanceData = [];
            $totalDue = 0;
            $totalPaid = 0;

            foreach ($fraisClasse as $fc) {
                $typeId = $fc->frais_type_id;
                $montantDu = $fc->montant;
                // Combien payé pour ce type ?
                $payePourCeType = $paiements->where('frais_type_id', $typeId)->sum('montant');
                
                $reste = max(0, $montantDu - $payePourCeType);
                
                $balanceData[] = [
                    'type' => $fc->fraisType->nom,
                    'du' => $montantDu,
                    'paye' => $payePourCeType,
                    'reste' => $reste,
                    'status' => $reste == 0 ? 'paye' : ($payePourCeType > 0 ? 'partiel' : 'impaye')
                ];

                $totalDue += $montantDu;
                $totalPaid += $payePourCeType;
            }

            // On ajoute aussi les paiements "Hors Frais Classe" (ex: Frais Inscription pure si pas dans FraisClasse, ou transport...)
            // Pour simplifier, on liste juste l'historique et ce tableau récapitulatif des frais scolaires.

            return Inertia::render('Paiements/Student', [
                'paiements' => $paiements,
                'balance' => $balanceData,
                'totals' => [
                    'due' => $totalDue,
                    'paid' => $totalPaid,
                    'remaining' => max(0, $totalDue - $totalPaid)
                ]
            ]);
        }

        // 🛡️ VUE ADMIN
        $search = $request->input('search');
        $anneeId = $request->input('annee_scolaire_id', $currentYear->id);

        $paiements = Paiement::query()
            ->with(['inscription.eleve.user', 'inscription.classe', 'fraisType', 'user'])
            ->whereHas('inscription', function ($query) use ($anneeId) {
                $query->where('annee_scolaire_id', $anneeId);
            })
            ->when($search, function ($query, $search) {
                $query->where('reference', 'like', "%{$search}%")
                    ->orWhereHas('inscription.eleve.user', function ($q) use ($search) {
                        $q->where('nom', 'like', "%{$search}%")
                          ->orWhere('prenom', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $annees = AnneeScolaire::orderBy('nom', 'desc')->get();
        
        // Charger les inscriptions de l'année en cours pour le formulaire (simple liste pour select)
        $inscriptions = Inscription::with('eleve.user', 'classe')
            ->where('annee_scolaire_id', $anneeId)
            ->get()
            ->map(function ($i) {
                return [
                    'id' => $i->id,
                    'label' => $i->eleve->user->nom . ' ' . $i->eleve->user->prenom . ' (' . $i->classe->nom . ')',
                    'classe_id' => $i->classe_id, // Needed for tuition calculation
                ];
            });

        $fraisTypes = \App\Models\FraisType::where('annee_scolaire_id', $anneeId)->get();
        $fraisClasses = \App\Models\FraisClasse::where('annee_scolaire_id', $anneeId)->get();

        return Inertia::render('Paiements/Index', [
            'paiements' => $paiements,
            'annees' => $annees,
            'currentAnneeId' => (int) $anneeId,
            'inscriptions' => $inscriptions,
            'classes' => \App\Models\Classe::orderBy('nom')->get(),
            'fraisTypes' => $fraisTypes,
            'fraisClasses' => $fraisClasses,
            'filters' => $request->only(['search', 'annee_scolaire_id']),
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
            'date_paiement' => 'required|date',
            'mode_paiement' => 'required|in:especes,virement,mobile,cheque',
            'mois' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // 1. Créer le paiement
            $paiement = Paiement::create([
                'inscription_id' => $request->inscription_id,
                'frais_type_id' => $request->frais_type_id,
                'user_id' => auth()->id(),
                'montant' => $request->montant,
                'date_paiement' => $request->date_paiement,
                'mode_paiement' => $request->mode_paiement,
                'reference' => $request->reference,
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
