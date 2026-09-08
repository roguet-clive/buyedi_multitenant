<?php

namespace App\Http\Controllers;

use App\Mail\NewUserCredentials;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_users')->only('index');
        $this->middleware('permission:ajouter_users')->only(['create', 'store']);
        $this->middleware('permission:modifier_users')->only(['edit', 'update']);
        $this->middleware('permission:supprimer_users')->only('destroy');
    }

    public function index(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $role = trim((string) $request->input('role', ''));

        $users = User::with('roles')
            ->when(!empty($search), function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('telephone', 'like', "%{$search}%");
                });
            })
            ->when(!empty($role), function ($query) use ($role) {
                $query->whereHas('roles', fn($q) => $q->where('name', $role));
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        // Transformer les rôles en tableau simple pour React
        $roles = Role::all()->map(fn($r) => [
            'id' => $r->id,
            'name' => $r->name,
        ])->toArray();

        $users->getCollection()->transform(function ($user) {
            $user->roles = $user->roles->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
            ])->toArray();
            return $user;
        });

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'nullable|string|max:25',
            'password' => 'nullable|string|min:6',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $plainPassword = !empty($validated['password']) ? $validated['password'] : Str::random(10);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
            'telephone' => $validated['telephone'] ?? null,
            'password' => Hash::make($plainPassword),
        ]);

        if (!empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        // Envoyer l'email avec mot de passe généré/défini
        try {
            Mail::to($user->email)->send(new NewUserCredentials($user, $plainPassword));
        } catch (\Throwable $e) {
            Log::warning("Échec de l'envoi de l'email des identifiants à {$user->email}: " . $e->getMessage());
        }

        return redirect()
            ->route('users.index')
            ->with('success', __('Utilisateur créé avec succès ✅'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'telephone' => 'nullable|string|max:25',
            'password' => 'nullable|string|min:6',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $data = [
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
            'telephone' => $validated['telephone'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        // Protection: ne pas retirer le rôle super-admin au dernier super-admin
        $newRoles = $validated['roles'] ?? [];
        if ($user->hasRole('super-admin') && !in_array('super-admin', $newRoles) && User::role('super-admin')->count() <= 1) {
            $newRoles[] = 'super-admin';
        }

        $user->syncRoles($newRoles);

        return redirect()
            ->route('users.index')
            ->with('success', __('Utilisateur mis à jour ✅'));
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', __('Vous ne pouvez pas supprimer votre propre compte.'));
        }

        if ($user->hasRole('super-admin') && User::role('super-admin')->count() <= 1) {
            return back()->with('error', __('Impossible de supprimer le dernier compte Super Administrateur.'));
        }

        try {
            $user->delete();

            return redirect()
                ->route('users.index')
                ->with('success', __('Utilisateur supprimé ✅'));
        } catch (\Throwable $e) {
            return back()->with('error', __('Impossible de supprimer cet utilisateur car il est rattaché à d\'autres enregistrements.'));
        }
    }
}
