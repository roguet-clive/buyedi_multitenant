@component('mail::message')
# Bonjour {{ $name }},

Votre mot de passe pour accéder à la plateforme **{{ config('app.name', 'Buyedi') }}** a été réinitialisé par le Super Administrateur.

Voici vos nouveaux identifiants de connexion :

**Identifiant / Email :** `{{ $email }}`  
**Nouveau mot de passe temporaire :** `{{ $password }}`

Merci de vous connecter et de **changer votre mot de passe dès votre première connexion**.

@component('mail::button', ['url' => route('login')])
Se connecter à la plateforme
@endcomponent

Si vous n'êtes pas à l'origine de cette demande ou si vous rencontrez des difficultés, veuillez contacter l'administration de votre établissement.

Cordialement,<br>
L'équipe {{ config('app.name', 'Buyedi') }}
@endcomponent
