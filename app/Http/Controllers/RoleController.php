<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_roles')->only('index', 'show');
        $this->middleware('permission:ajouter_roles')->only('create', 'store');
        $this->middleware('permission:modifier_roles')->only('edit', 'update');
        $this->middleware('permission:supprimer_roles')->only('destroy');
    }

    /**
     * Affiche la liste des rôles
     */
    public function index()
    {
        $isSuperAdmin = (bool) auth()->user()?->hasRole('super-admin');

        $rolesQuery = Role::with('permissions');
        if (!$isSuperAdmin) {
            $rolesQuery->where('name', '!=', 'super-admin');
        }

        return Inertia::render('Roles/Index', [
            'roles' => $rolesQuery->get(),
            'permissions' => Permission::all(),
        ])->with([
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Affiche le formulaire de création d'un rôle
     */
    public function create()
    {
        return Inertia::render('Roles/CreateRole', [
            'permissions' => Permission::all(),
        ])->with([
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Sauvegarde un nouveau rôle
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|unique:roles',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $data['name']]);

        if (!empty($data['permissions'])) {
            $role->givePermissionTo($data['permissions']);
        }

        return redirect()->route('roles.index')
            ->with('success', __('Rôle créé avec succès ✅'));
    }

    /**
     * Affiche le formulaire d'édition d'un rôle
     */
    public function edit(Role $role)
    {
        if ($role->name === 'super-admin' && !auth()->user()?->hasRole('super-admin')) {
            abort(403, "Action non autorisée.");
        }

        return Inertia::render('Roles/EditRole', [
            'role' => $role->load('permissions'),
            'permissions' => Permission::all(),
        ])->with([
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Met à jour un rôle existant
     */
    public function update(Request $request, Role $role)
    {
        if ($role->name === 'super-admin' && !auth()->user()?->hasRole('super-admin')) {
            abort(403, "Action non autorisée.");
        }

        $data = $request->validate([
            'name' => 'required|unique:roles,name,'.$role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('roles.index')
            ->with('success', __('Rôle mis à jour ✅'));
    }

    /**
     * Supprime un rôle
     */
    public function destroy(Role $role)
    {
        if ($role->name === 'super-admin') {
            abort(403, "Le rôle Super-Admin est protégé et ne peut pas être supprimé.");
        }

        $role->delete();
        return redirect()->route('roles.index')
            ->with('success', __('Rôle supprimé ✅'));
    }
}
