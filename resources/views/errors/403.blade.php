@extends('errors.layout')

@section('title', 'Accès Interdit')

@section('content')
    <div class="mb-6">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
            <svg class="h-10 w-10 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        </div>
    </div>
    
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">403</h1>
    <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Accès Interdit</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
        Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
    </p>
    
    <div class="flex flex-col gap-3">
        <a href="{{ url('/') }}" class="w-full rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200">
            Retour à l'accueil
        </a>
        <button onclick="history.back()" class="w-full rounded-xl bg-white dark:bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200">
            Page précédente
        </button>
    </div>
@endsection
