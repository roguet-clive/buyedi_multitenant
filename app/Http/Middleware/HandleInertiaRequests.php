<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $isTenant = tenancy()->initialized;

        $roles = [];
        $permissions = [];
        $isSuperAdmin = false;

        if ($user) {
            if ($isTenant) {
                try {
                    $roles = $user->getRoleNames()->values()->all();
                    $permissions = $user->getAllPermissions()->pluck('name')->values()->all();
                    $isSuperAdmin = $user->hasRole('super-admin') || $user->hasRole('superadmin');
                } catch (\Throwable $e) {
                    $roles = [];
                    $permissions = [];
                    $isSuperAdmin = false;
                }
            } else {
                // Contexte Central (Plateforme SaaS Buyedi Solutions)
                $isSuperAdmin = $user->isSuperAdmin();
                $roles = $isSuperAdmin ? ['super-admin'] : [];
                $permissions = $isSuperAdmin ? ['*'] : [];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $roles,
                'isSuperAdmin' => $isSuperAdmin,
                'permissions' => $permissions,
                'unreadCount' => ($user && $isTenant) ? $user->unreadNotifications()->count() : 0,
            ],
            'unreadNotificationsCount' => ($user && $isTenant) ? $user->unreadNotifications()->where('type', '!=', 'App\Notifications\MessageNotification')->count() : 0,
            'unreadMessagesCount' => ($user && $isTenant) ? $user->unreadNotifications()->where('type', 'App\Notifications\MessageNotification')->count() : 0,
            'tenant' => tenancy()->initialized ? [
                'id' => tenant('id'),
                'nom' => tenant('nom'),
                'statut' => tenant('statut'),
                'formule' => tenant('formule'),
            ] : null,
            'etablissement' => fn () => tenancy()->initialized ? \App\Models\Etablissement::first() : null,
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'credentialsModal' => fn () => $request->session()->get('credentialsModal'),
            ],
        ];
    }
}
