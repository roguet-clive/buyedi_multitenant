<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\User;
use App\Models\Contrat;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

        $personnels = Personnel::with(['user.roles', 'user.contrat'])
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

        // Rôles assignables aux membres du personnel
        $roles = Role::whereNotIn('name', ['eleve', 'parent'])->get(['id', 'name']);

        return Inertia::render('Personnels/Index', [
            'personnels' => $personnels,
            'roles' => $roles,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|exists:roles,name',
            'poste' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'sexe' => 'required|in:M,F',
            'date_embauche' => 'nullable|date',
            'date_naissance' => 'nullable|date',
            'salaire_base' => 'nullable|numeric|min:0',
            'type_contrat' => 'nullable|string|in:CDI,CDD,Vacataire,Stage',
        ]);

        DB::transaction(function () use ($validated) {
            $plainPassword = !empty($validated['password']) ? $validated['password'] : '12345678';
            $roleName = !empty($validated['role']) ? $validated['role'] : 'personnel';

            // 1. Création du compte utilisateur
            $user = User::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'telephone' => $validated['telephone'] ?? null,
                'password' => Hash::make($plainPassword),
            ]);

            $user->assignRole($roleName);

            // 2. Création du profil Personnel
            Personnel::create([
                'user_id' => $user->id,
                'poste' => $validated['poste'],
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'sexe' => $validated['sexe'],
                'date_embauche' => $validated['date_embauche'] ?? null,
                'date_naissance' => $validated['date_naissance'] ?? null,
            ]);

            // 3. Création du Contrat
            Contrat::create([
                'user_id' => $user->id,
                'type' => $validated['type_contrat'] ?? 'CDI',
                'salaire_base' => $validated['salaire_base'] ?? 0,
                'date_debut' => $validated['date_embauche'] ?? now(),
                'actif' => true,
            ]);
        });

        return redirect()->route('personnels.index')->with('success', 'Employé, compte d\'accès utilisateur et contrat créés avec succès en 1 seule étape.');
    }

    public function update(Request $request, Personnel $personnel)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $personnel->user_id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|exists:roles,name',
            'poste' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'sexe' => 'required|in:M,F',
            'date_embauche' => 'nullable|date',
            'date_naissance' => 'nullable|date',
            'salaire_base' => 'nullable|numeric|min:0',
            'type_contrat' => 'nullable|string|in:CDI,CDD,Vacataire,Stage',
        ]);

        DB::transaction(function () use ($validated, $personnel) {
            $userUpdates = [
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
            ];

            if (!empty($validated['password'])) {
                $userUpdates['password'] = Hash::make($validated['password']);
            }

            $personnel->user->update($userUpdates);

            if (!empty($validated['role'])) {
                $personnel->user->syncRoles([$validated['role']]);
            }

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

        return redirect()->back()->with('success', 'Dossier et accès de l\'employé mis à jour avec succès.');
    }

    public function destroy(Personnel $personnel)
    {
        $personnel->user->delete();
        return redirect()->back()->with('success', 'Personnel supprimé.');
    }
}
