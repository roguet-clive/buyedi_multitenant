<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;
use App\Models\User;

class LogController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:voir_logs')->only(['index']);
    }

    public function index(Request $request)
    {
        $currentUser = auth()->user();
        $isSuperAdmin = (bool) $currentUser?->hasRole('super-admin');

        // Seul un super-admin a le droit d'afficher les logs super-admin.
        // Pour le super-admin, visible par défaut sauf s'il active le mode incognito (show_superadmin=0).
        // Pour tout autre utilisateur, STRICTEMENT false (activité super-admin toujours invisible).
        $showSuperAdminParam = $request->has('show_superadmin')
            ? $request->boolean('show_superadmin')
            : true;

        $canShowSuperAdmin = $isSuperAdmin && $showSuperAdminParam;

        $superAdminIds = User::role('super-admin')->pluck('id')->toArray();
        $superAdminEmails = User::role('super-admin')->pluck('email')->filter()->values()->toArray();

        // Nettoyer causer_id si un non-superadmin tente de cibler un compte super-admin
        $causerId = $request->input('causer_id');
        if (!$canShowSuperAdmin && $causerId && in_array((int) $causerId, $superAdminIds, true)) {
            $causerId = null;
        }

        $query = Activity::with([
            'causer' => function (\Illuminate\Database\Eloquent\Relations\MorphTo $morphTo) {
                $morphTo->morphWith([
                    User::class => ['roles'],
                ]);
            }
        ])->orderBy('created_at', 'desc');

        // 🔒 MASQUER L'ACTIVITÉ DU SUPER-ADMIN (POUR LES AUTRES OU EN MODE INCOGNITO)
        if (!$canShowSuperAdmin && !empty($superAdminIds)) {
            // 1. Masquer les logs dont l'auteur (causer) est un super-admin
            $query->where(function ($q) use ($superAdminIds) {
                $q->whereNull('causer_id')
                  ->orWhere(function ($sub) use ($superAdminIds) {
                      $sub->whereIn('causer_type', [User::class, 'User'])
                          ->whereNotIn('causer_id', $superAdminIds);
                  })
                  ->orWhereNotIn('causer_type', [User::class, 'User']);
            });

            // 2. Masquer les logs dont le sujet (subject) est un utilisateur super-admin
            $query->where(function ($q) use ($superAdminIds) {
                $q->whereNull('subject_id')
                  ->orWhereNotIn('subject_type', [User::class, 'User'])
                  ->orWhereNotIn('subject_id', $superAdminIds);
            });

            // 3. Masquer les tentatives échouées ciblant les emails du super-admin
            foreach ($superAdminEmails as $email) {
                $query->where('properties', 'not like', "%\"{$email}\"%");
            }
        }

        $logs = $query
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhere('properties', 'like', "%{$search}%")
                      ->orWhere('log_name', 'like', "%{$search}%");
                });
            })
            ->when($request->date, function ($query, $date) {
                $query->whereDate('created_at', $date);
            })
            ->when($causerId, function ($query, $id) {
                $query->where('causer_id', $id);
            })
            ->when($request->categorie, function ($query, $cat) {
                if ($cat === 'auth') {
                    $query->whereIn('log_name', ['authentification', 'securite']);
                } elseif ($cat === 'data') {
                    $query->whereNotIn('log_name', ['authentification', 'securite']);
                }
            })
            ->when($request->subject_type, function ($query, $type) {
                if ($type === 'authentification' || $type === 'securite') {
                    $query->where('log_name', $type);
                } else {
                    $query->where('subject_type', 'like', "%{$type}%");
                }
            })
            ->paginate(20)
            ->withQueryString();

        // Filtrer la liste des utilisateurs pour la sélection déroulante
        $usersQuery = User::orderBy('nom');
        if (!$canShowSuperAdmin && !empty($superAdminIds)) {
            $usersQuery->whereNotIn('id', $superAdminIds);
        }
        $users = $usersQuery->get(['id', 'nom', 'prenom']);

        $filters = array_merge(
            $request->only(['search', 'date', 'subject_type', 'categorie']),
            [
                'causer_id' => $causerId,
                'show_superadmin' => $canShowSuperAdmin,
            ]
        );

        return Inertia::render('Logs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'users' => $users,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }
}
