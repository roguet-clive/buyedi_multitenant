@extends('errors.layout')

@section('title', 'Session Expirée (419)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Erreur 419 • Session Expirée
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Session Inactive
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        Votre session a expiré après une période d'inactivité pour des raisons de sécurité. Veuillez rafraîchir la page ou vous reconnecter.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button onclick="window.location.reload()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/30 transition-all active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Recharger la page
        </button>
        <a href="{{ route('login') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95">
            Se reconnecter
        </a>
    </div>
@endsection
