<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\User;
use App\Models\Contrat; // Import Contrat
use Illuminate\Http\Request;
use Inertia\Inertia; // Import Inertia
use Illuminate\Support\Facades\DB; // Import DB
use Illuminate\Support\Facades\Hash; // Import Hash

class PersonnelController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_personnels')->only(['index', 'show']);
        $this->middleware('permission:ajouter_personnels')->only(['create', 'store']);
        $this->middleware('permission:modifier_personnels')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_personnels')->only('destroy');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $personnels = Personnel::with(['user', 'user.contrat'])
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('poste', 'like', "%{$search}%")
                ->orWhere('telephone', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Personnels/Index', [
            'personnels' => $personnels,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'poste' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'sexe' => 'required|in:M,F',
            'date_embauche' => 'nullable|date',
            'date_naissance' => 'nullable|date',
            'salaire_base' => 'required|numeric|min:0', // 💰 Contrat
            'type_contrat' => 'required|string|in:CDI,CDD,Vacataire,Stage',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'password' => Hash::make('password'),
            ]);

            $user->assignRole('personnel');

            Personnel::create([
                'user_id' => $user->id,
                'poste' => $validated['poste'],
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'sexe' => $validated['sexe'],
                'date_embauche' => $validated['date_embauche'] ?? null,
                'date_naissance' => $validated['date_naissance'] ?? null,
            ]);

            // 📜 Création du Contrat Automatique
            Contrat::create([
                'user_id' => $user->id,
                'type' => $validated['type_contrat'],
                'salaire_base' => $validated['salaire_base'],
                'date_debut' => $validated['date_embauche'] ?? now(),
                'actif' => true,
            ]);
        });

        return redirect()->route('personnels.index')->with('success', 'Personnel et contrat créés avec succès.');
    }

    public function update(Request $request, Personnel $personnel)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $personnel->user_id,
            'poste' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'sexe' => 'required|in:M,F',
            'date_embauche' => 'nullable|date',
            'date_naissance' => 'nullable|date',
            'salaire_base' => 'nullable|numeric|min:0', // Optionnel en update
            'type_contrat' => 'nullable|string|in:CDI,CDD,Vacataire,Stage',
        ]);

        DB::transaction(function () use ($validated, $personnel) {
            $personnel->user->update([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
            ]);

            $personnel->update([
                'poste' => $validated['poste'],
                'telephone' => $validated['telephone'] ?? $personnel->telephone,
                'adresse' => $validated['adresse'] ?? $personnel->adresse,
                'sexe' => $validated['sexe'],
                'date_embauche' => $validated['date_embauche'],
                'date_naissance' => $validated['date_naissance'],
            ]);

            // Mise à jour du contrat si fourni
            if (!empty($validated['salaire_base']) || !empty($validated['type_contrat'])) {
                Contrat::updateOrCreate(
                    ['user_id' => $personnel->user_id],
                    [
                        'salaire_base' => $validated['salaire_base'] ?? 0,
                        'type' => $validated['type_contrat'] ?? 'CDI',
                        'date_debut' => $validated['date_embauche'] ?? now(),
                        'actif' => true
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Personnel mis à jour.');
    }

    public function destroy(Personnel $personnel)
    {
        // Supprimer l'utilisateur lié (cascade delete du personnel)
        $personnel->user->delete();
        return redirect()->back()->with('success', 'Personnel supprimé.');
    }
}
