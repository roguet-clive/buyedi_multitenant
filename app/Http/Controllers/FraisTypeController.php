<?php

namespace App\Http\Controllers;

use App\Models\FraisType;
use App\Models\Classe;
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
     * Liste des types de frais avec filtre, pagination et couverture par classe
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $totalClassesCount = Classe::count();

        $query = FraisType::with('anneeScolaire')
            ->withCount(['fraisClasses' => function ($q) use ($currentYear) {
                if ($currentYear) {
                    $q->where('annee_scolaire_id', $currentYear->id);
                }
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $fraisTypes = $query->orderBy('is_scolarite', 'desc')
            ->orderBy('nom', 'asc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('FraisTypes/Index', [
            'fraisTypes' => $fraisTypes,
            'filters' => ['search' => $search],
            'totalClassesCount' => $totalClassesCount,
            'currentYear' => $currentYear,
        ]);
    }

    /**
     * Formulaire de création
     */
    public function create()
    {
        $annees = AnneeScolaire::all();
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
            'code' => 'nullable|string|max:50',
            'montant' => 'required|numeric|min:0',
            'annee_scolaire_id' => 'nullable|exists:annee_scolaires,id',
            'globale' => 'nullable|boolean',
            'is_scolarite' => 'nullable|boolean',
        ]);

        $validated['globale'] = $validated['globale'] ?? true;
        $validated['is_scolarite'] = $validated['is_scolarite'] ?? false;

        FraisType::create($validated);

        return redirect()->route('frais_types.index')
                         ->with('success', 'Rubrique comptable créée avec succès ✅');
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
            'code' => 'nullable|string|max:50',
            'montant' => 'required|numeric|min:0',
            'annee_scolaire_id' => 'nullable|exists:annee_scolaires,id',
            'globale' => 'nullable|boolean',
            'is_scolarite' => 'nullable|boolean',
        ]);

        $validated['globale'] = $validated['globale'] ?? true;
        $validated['is_scolarite'] = $validated['is_scolarite'] ?? false;

        $fraisType->update($validated);

        return redirect()->route('frais_types.index')
                         ->with('success', 'Rubrique comptable mise à jour ✅');
    }

    /**
     * Supprimer un type de frais
     */
    public function destroy(FraisType $fraisType)
    {
        if ($fraisType->paiements()->count() > 0) {
            return redirect()->back()->with('error', "Impossible de supprimer la rubrique '{$fraisType->nom}' car {$fraisType->paiements()->count()} règlement(s) y sont rattachés.");
        }

        $fraisType->delete();

        return redirect()->route('frais_types.index')
                         ->with('success', 'Rubrique comptable supprimée ✅');
    }
}
