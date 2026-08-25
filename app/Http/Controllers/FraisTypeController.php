<?php

namespace App\Http\Controllers;

use App\Models\FraisType;
use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FraisTypeController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_frais_types')->only('index');
        $this->middleware('permission:ajouter_frais_types')->only(['create', 'store']);
        $this->middleware('permission:modifier_frais_types')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_frais_types')->only('destroy');
    }

    /**
     * Liste des types de frais avec filtre et pagination
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $query = FraisType::with('anneeScolaire');

        if ($search) {
            $query->where('nom', 'like', "%{$search}%");
        }

        $fraisTypes = $query->paginate(10)->withQueryString();

        return Inertia::render('FraisTypes/Index', [
            'fraisTypes' => $fraisTypes,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        $annees = AnneeScolaire::all(); // pour choisir l'année du frais
        $currentAnneeId = AnneeScolaire::where('en_cours', true)->value('id');
        return Inertia::render('FraisTypes/Create', compact('annees', 'currentAnneeId'));
    }

    /**
     * Stocker un type de frais
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:frais_types,nom',
            'code' => 'nullable|string|in:inscription,tenue,carte,divers',
            'montant' => 'required|numeric|min:0',
            'annee_scolaire_id' => 'nullable|exists:annee_scolaires,id',
            'globale' => 'required|boolean',
            'is_scolarite' => 'boolean',
        ]);

        FraisType::create($validated);

        return redirect()->route('frais_types.index')
                         ->with('success', 'Type de frais créé avec succès ✅');
    }

    /**
     * Formulaire d'édition
     */
    public function edit(FraisType $fraisType)
    {
        $annees = AnneeScolaire::all();
        return Inertia::render('FraisTypes/Edit', [
            'fraisType' => $fraisType,
            'annees' => $annees,
        ]);
    }

    /**
     * Mettre à jour un type de frais
     */
    public function update(Request $request, FraisType $fraisType)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:frais_types,nom,' . $fraisType->id,
            'code' => 'nullable|string|in:inscription,tenue,carte,divers',
            'montant' => 'required|numeric|min:0',
            'annee_scolaire_id' => 'nullable|exists:annee_scolaires,id',
            'globale' => 'required|boolean',
            'is_scolarite' => 'boolean',
        ]);

        $fraisType->update($validated);

        return redirect()->route('frais_types.index')
                         ->with('success', 'Type de frais mis à jour ✅');
    }

    /**
     * Supprimer un type de frais
     */
    public function destroy(FraisType $fraisType)
    {
        $fraisType->delete();

        return redirect()->route('frais_types.index')
                         ->with('success', 'Type de frais supprimé ✅');
    }
}
