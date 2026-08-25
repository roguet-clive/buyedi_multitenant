@component('mail::message')
# Bonjour {{ $name }},

Votre compte a été créé par l'administrateur.

Voici vos identifiants de connexion :

**Email :** {{ $email }}  
**Mot de passe temporaire :** {{ $password }}

Merci de vous connecter et de **changer votre mot de passe immédiatement**.

@component('mail::button', ['url' => route('login')])
Se connecter
@endcomponent

Merci,<br>
{{ config('app.name') }}
@endcomponent
