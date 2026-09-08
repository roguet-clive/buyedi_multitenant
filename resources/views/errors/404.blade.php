@extends('errors.layout')

@section('title', 'Page Introuvable (404)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Erreur 404 • Introuvable
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Page Introuvable
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        L'adresse demandée n'existe pas ou a été déplacée vers un nouvel emplacement.
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
