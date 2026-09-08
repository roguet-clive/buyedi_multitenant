@extends('errors.layout')

@section('title', 'Maintenance en cours (503)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.703.127 1.5.876 2.199 3.303 1.639 5.86M12 4a3.973 3.973 0 00-4 4 .244.244 0 01-.019.091 10.375 10.375 0 01-3.13 6.948 10.38 10.38 0 0011.666-5.717 10.37 10.37 0 01-1.282-4.008A2.43 2.43 0 0112 4z" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Mode Maintenance • 503
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Mise à Jour en Cours
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        Nous effectuons une intervention technique d'amélioration sur la plateforme. Le service sera de nouveau opérationnel dans un instant.
    </p>
    
    <div class="flex justify-center">
        <button onclick="window.location.reload()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Vérifier la disponibilité
        </button>
    </div>
@endsection
