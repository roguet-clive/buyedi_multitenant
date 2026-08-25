<?php

namespace App\Http\Controllers;

use App\Mail\NewUserCredentials;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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
        $search = $request->input('search');
        $role = $request->input('role');

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                $query->whereHas('roles', fn($q) => $q->where('name', $role));
            })
            ->paginate(3)
            ->withQueryString();

        // 🔹 Transformer les rôles en tableau simple pour React
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
            'password' => 'required|string|min:6',
            'roles' => 'array|exists:roles,name',
        ]);

        $defaultPassword = $validated['password'] ?? \Str::random(10);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
            'password' => bcrypt($defaultPassword),
        ]);

        if (!empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }

        // 🔹 Envoyer l'email avec mot de passe par défaut
        Mail::to($user->email)->send(new NewUserCredentials($user, $defaultPassword));

        return redirect()
            ->route('users.index')
            ->with('success', __('Utilisateur créé avec succès ✅'));

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
            'password' => 'nullable|string|min:6',
            'roles' => 'array|exists:roles,name',
        ]);

        $data = [
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'] ?? null,
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = bcrypt($validated['password']);
        }

        $user->update($data);

        $user->syncRoles($validated['roles'] ?? []);

        return redirect()
            ->route('users.index')
            ->with('success', __('Utilisateur mis à jour ✅'));
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', __('Utilisateur supprimé ✅'));
    }
}
