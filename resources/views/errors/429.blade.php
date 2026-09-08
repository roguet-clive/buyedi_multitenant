@extends('errors.layout')

@section('title', 'Trop de Requêtes (429)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Erreur 429 • Ralentissement
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Trop de Requêtes
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        Un nombre trop élevé de requêtes a été émis en un court laps de temps. Veuillez patienter quelques secondes avant de réessayer.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button onclick="setTimeout(() => window.location.reload(), 1000)" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-500/30 transition-all active:scale-95">
            Réessayer maintenant
        </button>
        <a href="{{ url('/') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95">
            Retour à l'accueil
        </a>
    </div>
@endsection
