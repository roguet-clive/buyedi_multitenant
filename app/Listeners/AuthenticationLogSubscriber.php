<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Events\Dispatcher;

class AuthenticationLogSubscriber
{
    /**
     * Enregistrer une connexion réussie.
     */
    public function handleUserLogin(Login $event): void
    {
        activity('authentification')
            ->causedBy($event->user)
            ->withProperties([
                'ip' => request()->ip(),
                'navigateur' => request()->userAgent(),
                'guard' => $event->guard,
            ])
            ->log('Connexion réussie');
    }

    /**
     * Enregistrer une déconnexion.
     */
    public function handleUserLogout(Logout $event): void
    {
        if ($event->user) {
            activity('authentification')
                ->causedBy($event->user)
                ->withProperties([
                    'ip' => request()->ip(),
                    'guard' => $event->guard,
                ])
                ->log('Déconnexion');
        }
    }

    /**
     * Enregistrer une tentative de connexion échouée (sécurité / audit).
     */
    public function handleUserFailedLogin(Failed $event): void
    {
        $log = activity('securite');

        if ($event->user) {
            $log->causedBy($event->user);
        }

        $log->withProperties([
            'email_tente' => $event->credentials['email'] ?? 'inconnu',
            'ip' => request()->ip(),
            'navigateur' => request()->userAgent(),
        ])->log('Échec de connexion');
    }

    /**
     * Enregistrer une réinitialisation de mot de passe.
     */
    public function handlePasswordReset(PasswordReset $event): void
    {
        activity('securite')
            ->causedBy($event->user)
            ->withProperties([
                'ip' => request()->ip(),
            ])
            ->log('Réinitialisation du mot de passe');
    }

    /**
     * Enregistrer les écouteurs d'événements.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleUserLogin',
            Logout::class => 'handleUserLogout',
            Failed::class => 'handleUserFailedLogin',
            PasswordReset::class => 'handlePasswordReset',
        ];
    }
}
