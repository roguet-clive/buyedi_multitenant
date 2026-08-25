@component('mail::message')
# Bonjour,

Ceci est une notification concernant votre enfant **{{ $eleveName }}**.

Un(e) nouveau(elle) **{{ $type }}** a été relevé(e) le **{{ $date }}**.

@if($motif)
**Motif :** {{ $motif }}
@endif

Pour plus de détails, veuillez consulter votre espace parent sur l'application.

@component('mail::button', ['url' => config('app.url')])
Accéder à mon espace
@endcomponent

Cordialement,<br>
L'administration de {{ config('app.name') }}
@endcomponent
