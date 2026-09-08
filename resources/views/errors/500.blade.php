@extends('errors.layout')

@section('title', 'Erreur Serveur (500)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Erreur 500 • Serveur
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Erreur Interne du Serveur
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        Une anomalie inattendue est survenue lors du traitement de votre demande. L'incident a été consigné pour analyse.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="{{ url('/') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-500/30 transition-all active:scale-95">
            Retourner à l'accueil
        </a>
        <button onclick="window.location.reload()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95">
            Recharger la page
        </button>
    </div>
@endsection
