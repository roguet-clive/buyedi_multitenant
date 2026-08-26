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
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'sexe' => 'nullable|in:M,F',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'specialite' => 'nullable|string|max:255',
            'cv' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:4096',
        ], [
            'nom.required' => 'Le nom de famille est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.email' => 'L\'adresse email saisie est invalide.',
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre compte.',
            'password.min' => 'Le mot de passe doit comporter au moins 6 caractères.',
            'cv.mimes' => 'Le CV doit être au format PDF, DOC, DOCX ou image.',
            'cv.max' => 'Le fichier CV ne doit pas dépasser 4 Mo.',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $validated) {
            // Auto-génération d'un email si non fourni
            $email = $validated['email'] ?? null;
            if (empty($email)) {
                $baseSlug = \Illuminate\Support\Str::slug($validated['prenom'] . '.' . $validated['nom']);
                if (empty($baseSlug)) {
                    $baseSlug = 'prof';
                }
                $email = strtolower($baseSlug . '.' . rand(100, 999) . '@buyedi.ga');
                while (User::where('email', $email)->exists()) {
                    $email = strtolower($baseSlug . '.' . rand(1000, 9999) . '@buyedi.ga');
                }
            }

            $plainPassword = !empty($validated['password']) ? $validated['password'] : '12345678';

            // 1. Create User
            $user = User::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $email,
                'password' => bcrypt($plainPassword),
            ]);
            
            $user->assignRole('enseignant');

            // 2. Prepare Enseignant Data
            $matricule = 'ENS-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(5));
            while (Enseignant::where('matricule', $matricule)->exists()) {
                $matricule = 'ENS-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(5));
            }

            $cvPath = null;
            if ($request->hasFile('cv')) {
                $cvPath = $request->file('cv')->store('cvs', 'public');
            }

            // 3. Create Enseignant
            Enseignant::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'sexe' => $validated['sexe'] ?? 'M',
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'specialite' => $validated['specialite'] ?? null,
                'matricule' => $matricule,
                'cv' => $cvPath,
                'user_id' => $user->id,
            ]);

            try {
                if (!empty($validated['email'])) {
                    \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\NewUserCredentials($user, $plainPassword));
                }
            } catch (\Exception $e) {
                // Ignorer si mailer non configuré
            }

            return Redirect::route('enseignants.index')->with('success', "L'enseignant {$validated['nom']} {$validated['prenom']} a été intégré avec succès (Mot de passe initial : {$plainPassword}) ✅");
        });
    }

    public function update(Request $request, Enseignant $enseignant)
    {
        $userId = $enseignant->user_id;

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => "nullable|email|unique:users,email,{$userId}",
            'password' => 'nullable|string|min:6',
            'sexe' => 'nullable|in:M,F',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'specialite' => 'nullable|string|max:255',
            'cv' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:4096',
        ], [
            'nom.required' => 'Le nom de famille est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.email' => 'L\'adresse email saisie est invalide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.min' => 'Le mot de passe doit comporter au moins 6 caractères.',
            'cv.mimes' => 'Le CV doit être au format PDF, DOC, DOCX ou image.',
            'cv.max' => 'Le fichier CV ne doit pas dépasser 4 Mo.',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $validated, $enseignant) {
            // Update associated User
            if ($enseignant->user) {
                $userUpdates = [
                    'nom' => $validated['nom'],
                    'prenom' => $validated['prenom'],
                ];
                if (!empty($validated['email'])) {
                    $userUpdates['email'] = $validated['email'];
                }
                if (!empty($validated['password'])) {
                    $userUpdates['password'] = bcrypt($validated['password']);
                }
                $enseignant->user->update($userUpdates);
            }

            // Update Enseignant
            $enseignantUpdates = [
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'sexe' => $validated['sexe'] ?? $enseignant->sexe,
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'specialite' => $validated['specialite'] ?? null,
            ];

            if ($request->hasFile('cv')) {
                if ($enseignant->cv) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($enseignant->cv);
                }
                $enseignantUpdates['cv'] = $request->file('cv')->store('cvs', 'public');
            }

            $enseignant->update($enseignantUpdates);

            return Redirect::route('enseignants.index')->with('success', "Le dossier de l'enseignant {$validated['nom']} {$validated['prenom']} a été mis à jour ✅");
        });
    }

    public function destroy(Enseignant $enseignant)
    {
        // Supprimer le CV si existant
        if ($enseignant->cv) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($enseignant->cv);
        }

        // Supprimer l'utilisateur associé
        if ($enseignant->user) {
            $enseignant->user->delete();
        }
        
        $enseignant->delete();

        return Redirect::route('enseignants.index')->with('success', 'Enseignant et compte utilisateur supprimés avec succès ✅');
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
