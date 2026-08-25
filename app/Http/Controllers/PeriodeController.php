<?php

namespace App\Http\Controllers;

use App\Models\Periode;
use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodeController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_periodes')->only('index');
        $this->middleware('permission:ajouter_periodes')->only(['create', 'store']);
        $this->middleware('permission:modifier_periodes')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_periodes')->only('destroy');
    }

    public function index()
    {
        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        $periodes = [];
        
        if ($currentYear) {
            $periodes = Periode::where('annee_scolaire_id', $currentYear->id)
                ->orderBy('date_debut')
                ->get();
        }

        return Inertia::render('Periodes/Index', [
            'periodes' => $periodes,
            'anneeScolaire' => $currentYear,
            'can' => [
                'create_periodes' => auth()->user() ? auth()->user()->can('ajouter_periodes') : false,
                'edit_periodes' => auth()->user() ? auth()->user()->can('modifier_periodes') : false,
                'delete_periodes' => auth()->user() ? auth()->user()->can('supprimer_periodes') : false,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'type' => 'required|in:global,primaire,secondaire',
        ]);

        $currentYear = AnneeScolaire::where('en_cours', true)->first();
        if (!$currentYear) {
            return back()->with('error', 'Aucune année scolaire active.');
        }

        Periode::create([
            'nom' => $request->nom,
            'code' => $request->code,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'annee_scolaire_id' => $currentYear->id,
            'actif' => $request->boolean('actif', false),
            'type' => $request->type
        ]);

        return back()->with('success', 'Période ajoutée.');
    }

    public function update(Request $request, Periode $periode)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'type' => 'required|in:global,primaire,secondaire',
        ]);

        $periode->update([
            'nom' => $request->nom,
            'code' => $request->code,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'actif' => $request->boolean('actif'),
            'type' => $request->type
        ]);

        return back()->with('success', 'Période mise à jour.');
    }

    public function destroy(Periode $periode)
    {
        $periode->delete();
        return back()->with('success', 'Période supprimée.');
    }
}
