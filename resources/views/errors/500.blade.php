@extends('errors.layout')

@section('title', 'Erreur Serveur')

@section('content')
    <div class="mb-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <svg class="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
        </div>
    </div>
    
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">500</h1>
    <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Erreur Serveur</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
        Oups ! Quelque chose s'est mal passé de notre côté. Nos équipes techniques ont été notifiées.
    </p>
    
    <div class="flex flex-col gap-3">
        <a href="{{ url('/') }}" class="w-full rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200">
            Retour à l'accueil
        </a>
    </div>
@endsection
