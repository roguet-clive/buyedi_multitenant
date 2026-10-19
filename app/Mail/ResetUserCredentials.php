<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetUserCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $password;

    public function __construct(User $user, string $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function build()
    {
        $appName = config('app.name', 'Buyedi');

        return $this->subject("Réinitialisation de vos identifiants de connexion - {$appName}")
                    ->markdown('emails.reset-user-credentials')
                    ->with([
                        'name' => $this->user->full_name ?: ($this->user->prenom . ' ' . $this->user->nom),
                        'email' => $this->user->email,
                        'password' => $this->password,
                    ]);
    }
}
