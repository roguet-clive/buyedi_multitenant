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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user() ? $request->user()->getRoleNames()->values()->all() : [],
                'isSuperAdmin' => $request->user() ? ($request->user()->hasRole('super-admin') || $request->user()->hasRole('superadmin')) : false,
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name')->values()->all() : [],
                'unreadCount' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
            ],
            'unreadNotificationsCount' => $request->user() ? $request->user()->unreadNotifications()->where('type', '!=', 'App\Notifications\MessageNotification')->count() : 0,
            'unreadMessagesCount' => $request->user() ? $request->user()->unreadNotifications()->where('type', 'App\Notifications\MessageNotification')->count() : 0,
            'etablissement' => fn () => \App\Models\Etablissement::first(),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'credentialsModal' => fn () => $request->session()->get('credentialsModal'),
            ],
        ];
    }
}
