<?php

namespace App\Http\Controllers;

use App\Models\Etablissement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class EtablissementController extends Controller
{
    /**
     * Show the form for editing the specified resource.
     */
    public function edit()
    {
        // Singleton : on récupère le premier ou on en crée un par défaut
        $etablissement = Etablissement::firstOrCreate(
            ['id' => 1],
            ['nom' => 'Mon Etablissement', 'sigle' => 'ME']
        );

        return Inertia::render('Etablissement/Edit', [
            'etablissement' => $etablissement,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $etablissement = Etablissement::firstOrFail();

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'sigle' => 'nullable|string|max:50',
            'adresse' => 'nullable|string|max:500',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|image|max:2048', // 2MB Max
            // 'modele_bulletin' => 'nullable|string', // Pour plus tard
        ]);

        if ($request->hasFile('logo')) {
            // Supprimer l'ancien logo si existe
            if ($etablissement->logo) {
                Storage::disk('public')->delete($etablissement->logo);
            }
            $path = $request->file('logo')->store('etablissement', 'public');
            $validated['logo'] = $path;
        } else {
            unset($validated['logo']);
        }

        $etablissement->update($validated);

        return redirect()->back()->with('success', 'Paramètres de l\'établissement mis à jour avec succès.');
    }
}
