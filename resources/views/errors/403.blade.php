@extends('errors.layout')

@section('title', 'Accès Refusé (403)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Erreur 403 • Accès Interdit
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Zone Non Autorisée
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        Votre profil ne dispose pas des permissions nécessaires pour consulter cette page ou effectuer cette action.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="{{ url('/dashboard') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
            Tableau de bord
        </a>
        <button onclick="history.back()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95">
            Page précédente
        </button>
    </div>
@endsection
