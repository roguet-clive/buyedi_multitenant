<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title', 'Erreur') - {{ config('app.name', 'Buyedi') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/images/favicon.png">
        <link rel="shortcut icon" href="/favicon.ico">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800&display=swap" rel="stylesheet" />

        <!-- Scripts & Styles -->
        @vite(['resources/js/app.jsx'])

        <style>
            [v-cloak] { display: none; }
            @keyframes floatSlow {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-15px) scale(1.03); }
            }
            .animate-float {
                animation: floatSlow 6s ease-in-out infinite;
            }
        </style>
    </head>
    <body class="h-full font-sans antialiased bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
        <!-- Background Glow Orbs -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float"></div>
            <div class="absolute top-1/3 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
            <div class="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl animate-float" style="animation-delay: 4s;"></div>
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-900/90 to-slate-950"></div>
        </div>

        <!-- Top Branding -->
        <header class="relative z-10 w-full py-6 px-6 sm:px-10 flex items-center justify-between">
            <a href="{{ url('/') }}" class="flex items-center gap-3 group">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-lg text-white">
                        B
                    </div>
                </div>
                <div>
                    <span class="font-extrabold text-lg text-white tracking-tight">{{ config('app.name', 'Buyedi') }}</span>
                    <span class="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Système Scolaire</span>
                </div>
            </a>
            
            <a href="{{ url('/') }}" class="text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                Portail d'accueil &rarr;
            </a>
        </header>

        <!-- Main Card Container -->
        <main class="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
            <div class="w-full max-w-lg bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-7 sm:p-10 border border-slate-700/60 text-center relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-blue-500"></div>
                @yield('content')
            </div>
        </main>

        <!-- Footer -->
        <footer class="relative z-10 py-6 text-center text-xs text-slate-500">
            <p>&copy; {{ date('Y') }} {{ config('app.name', 'Buyedi') }}. Tous droits réservés.</p>
        </footer>
    </body>
</html>
