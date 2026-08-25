<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnneeScolaireController extends Controller
{
    // Afficher toutes les années
    public function index()
    {
        $annees = AnneeScolaire::orderByDesc('en_cours')->orderBy('nom')->get();

        return Inertia::render('AnneeScolaires/Index', [
            'annees' => $annees,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    // Formulaire création
    public function create()
    {
        return Inertia::render('AnneeScolaires/Create');
    }

    // Enregistrer une nouvelle année
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|unique:annee_scolaires,nom',
        ]);

        AnneeScolaire::create([
            'nom' => $data['nom'],
            'en_cours' => false, // Toujours false à la création
        ]);

        return redirect()->route('annee_scolaires.index')
                         ->with('success', __('Année scolaire créée avec succès ✅'));
    }

    // Formulaire édition
    public function edit(AnneeScolaire $anneeScolaire)
    {
        return Inertia::render('AnneeScolaires/Edit', [
            'annee' => $anneeScolaire,
        ]);
    }

    // Mise à jour
    public function update(Request $request, AnneeScolaire $anneeScolaire)
    {
        $data = $request->validate([
            'nom' => 'required|unique:annee_scolaires,nom,'.$anneeScolaire->id,
        ]);

        $anneeScolaire->update([
            'nom' => $data['nom'],
        ]);

        return redirect()->route('annee_scolaires.index')
                         ->with('success', __('Année scolaire mise à jour ✅'));
    }

    // Supprimer
    public function destroy(AnneeScolaire $anneeScolaire)
    {
        $anneeScolaire->delete();

        return redirect()->route('annee_scolaires.index')
                         ->with('success', __('Année scolaire supprimée ✅'));
    }

    // Définir l'année en cours
    public function setCurrent(AnneeScolaire $annee_scolaire)
    {
        // Désactive toutes les années
        AnneeScolaire::query()->update(['en_cours' => false]);

        // Active l'année sélectionnée
        $annee_scolaire->update(['en_cours' => true]);

        return back()->with('success', "✅ {$annee_scolaire->nom} est maintenant l'année en cours");
    }
}
