<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Depense;

class DepenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_depenses')->only('index');
        $this->middleware('permission:ajouter_depenses')->only(['create', 'store']);
        $this->middleware('permission:modifier_depenses')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_depenses')->only('destroy');
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $depenses = \App\Models\Depense::with('user')
            ->latest()
            ->paginate(15);
            
        return Inertia::render('Depenses/Index', [
            'depenses' => $depenses,
            'categories' => ['Loyer', 'Fourniture', 'Electricité/Eau', 'Transport', 'Entretien', 'Autre'],
        ]);
    }

    public function create()
    {
        // Not used, modal in index
    }

    public function store(Request $request)
    {
        $request->validate([
            'categorie' => 'required|string',
            'montant' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'date_depense' => 'required|date',
        ]);

        \App\Models\Depense::create([
            'user_id' => auth()->id(),
            'categorie' => $request->categorie,
            'montant' => $request->montant,
            'description' => $request->description,
            'date_depense' => $request->date_depense,
        ]);

        return redirect()->back()->with('success', 'Dépense enregistrée ✅');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        $depense = \App\Models\Depense::findOrFail($id);
        $depense->delete();
        return redirect()->back()->with('success', 'Dépense supprimée 🗑️');
    }
}
