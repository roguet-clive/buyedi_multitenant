<?php

namespace App\Http\Controllers;

use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class EnseignantController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_enseignants')->only('index', 'show');
        $this->middleware('permission:ajouter_enseignants')->only('create', 'store');
        $this->middleware('permission:modifier_enseignants')->only('edit', 'update');
        $this->middleware('permission:supprimer_enseignants')->only('destroy');
    }

    public function index(Request $request)
    {
        $search = $request->input('search');

        $enseignants = Enseignant::query()
            ->with('user')
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('specialite', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Enseignants/Index', [
            'enseignants' => $enseignants,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email', // Email required for user creation
            'sexe' => 'nullable|in:M,F',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'specialite' => 'nullable|string|max:255',
            'cv' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
        ]);

        // 1. Create User
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => bcrypt('password'), // Default password
        ]);
        
        $user->assignRole('enseignant');

        // 2. Prepare Enseignant Data
        $data = $request->except(['cv', 'email']); // Remove email from enseignant data
        $data['user_id'] = $user->id; // Link to new user

        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('cvs', 'public');
            $data['cv'] = $path;
        }

        // 3. Create Enseignant
        Enseignant::create($data);

        return Redirect::route('enseignants.index')->with('success', 'Enseignant et compte utilisateur créés avec succès.');
    }

    public function update(Request $request, Enseignant $enseignant)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'sexe' => 'nullable|in:M,F',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'specialite' => 'nullable|string|max:255',
            'cv' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:2048',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $data = $request->except('cv');

        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('cvs', 'public');
            $data['cv'] = $path;
        }

        $enseignant->update($data);

        return Redirect::route('enseignants.index')->with('success', 'Enseignant mis à jour avec succès.');
    }

    public function destroy(Enseignant $enseignant)
    {
        // Supprimer l'utilisateur associé
        if ($enseignant->user) {
            $enseignant->user->delete();
        }
        
        $enseignant->delete();

        return Redirect::route('enseignants.index')->with('success', 'Enseignant et compte utilisateur supprimés avec succès.');
    }

    public function show(Enseignant $enseignant)
    {
        // Charger les relations nécessaires : User, Cours (avec Matière et Classe), Emploi du temps
        $enseignant->load([
            'user', 
            'cours.matiere', 
            'cours.classe',
            'cours.anneeScolaire',
            'emploisDuTemps.classe',
            'emploisDuTemps.matiere'
        ]);

        return Inertia::render('Enseignants/Show', [
            'enseignant' => $enseignant,
            'cours' => $enseignant->cours,
            'emploisDuTemps' => $enseignant->emploisDuTemps,
        ]);
    }

}
