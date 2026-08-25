<?php

namespace App\Http\Controllers;

use App\Models\Matiere;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatiereController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_matieres')->only('index');
        $this->middleware('permission:ajouter_matieres')->only(['create', 'store']);
        $this->middleware('permission:modifier_matieres')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_matieres')->only('destroy');
    }

    public function index()
    {
        $matieres = Matiere::latest()->paginate(10);
        return Inertia::render('Matieres/Index', [
            'matieres' => $matieres,
            'filters' => request()->all(['search']),
            'can' => [
                'create_matieres' => auth()->user() ? auth()->user()->can('ajouter_matieres') : false,
                'edit_matieres' => auth()->user() ? auth()->user()->can('modifier_matieres') : false,
                'delete_matieres' => auth()->user() ? auth()->user()->can('supprimer_matieres') : false,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:matieres',
            'description' => 'nullable|string',
        ]);

        Matiere::create($validated);

        return redirect()->back()->with('success', 'Matière créée avec succès.');
    }

    public function update(Request $request, Matiere $matiere)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:matieres,nom,' . $matiere->id,
            'description' => 'nullable|string',
        ]);

        $matiere->update($validated);

        return redirect()->back()->with('success', 'Matière mise à jour avec succès.');
    }

    public function destroy(Matiere $matiere)
    {
        $matiere->delete();
        return redirect()->back()->with('success', 'Matière supprimée avec succès.');
    }
}
