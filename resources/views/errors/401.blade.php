@extends('errors.layout')

@section('title', 'Authentification Requise (401)')

@section('content')
    <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        </div>
    </div>
    
    <div class="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
        Erreur 401
    </div>

    <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
        Authentification Requise
    </h1>
    
    <p class="text-slate-400 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
        Vous devez vous connecter à votre compte pour accéder à cette section du système.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="{{ route('login') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
            Se connecter
        </a>
        <a href="{{ url('/') }}" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-600 transition-all active:scale-95">
            Page d'accueil
        </a>
    </div>
@endsection
