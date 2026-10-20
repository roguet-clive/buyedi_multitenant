import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    KeyRound,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    ExternalLink,
    Building2,
    Server
} from 'lucide-react';

export default function SuperAdminLogin({ status, flash }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'admin@buyedi.com',
        password: '',
        remember: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/super-admin/login', {
            onFinish: () => reset('password'),
        });
    };

    const fillCredentials = () => {
        setData((prev) => ({
            ...prev,
            email: 'admin@buyedi.com',
            password: 'password',
        }));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between relative overflow-hidden">
            <Head title="Connexion Sécurisée - Super-Admin SaaS | Buyedi" />

            {/* Glowing Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-[15%] left-[25%] w-[650px] h-[650px] rounded-full bg-indigo-600/15 blur-[160px]" />
                <div className="absolute -bottom-[15%] right-[20%] w-[650px] h-[650px] rounded-full bg-cyan-600/10 blur-[160px]" />
                <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[140px]" />
            </div>

            {/* Header minimaliste */}
            <header className="px-6 py-6 flex items-center justify-between max-w-6xl w-full mx-auto">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-black text-lg text-white tracking-tight flex items-center gap-1.5">
                            <span>BUYEDI</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                SaaS HQ
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Plateforme d'administration centrale</div>
                    </div>
                </Link>

                <Link
                    href="/"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                    <span>Retour au site</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </header>

            {/* Zone de connexion centrale */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-md w-full mx-auto">
                    {/* Carte de connexion */}
                    <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-8 sm:p-9 shadow-2xl backdrop-blur-xl relative">
                        {/* Badge de sécurité au sommet */}
                        <div className="flex items-center justify-center -mt-14 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 border-2 border-indigo-400/40">
                                <Lock className="w-7 h-7" />
                            </div>
                        </div>

                        <div className="text-center mb-7">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold mb-2">
                                <KeyRound className="w-3 h-3" />
                                <span>Zone Réservée aux Opérateurs SaaS</span>
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                Console Super-Admin
                            </h1>
                            <p className="text-xs text-slate-400 mt-1">
                                Authentifiez-vous pour administrer les établissements et la trésorerie.
                            </p>
                        </div>

                        {/* Flash Messages */}
                        {flash?.error && (
                            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span>{flash.error}</span>
                            </div>
                        )}

                        {flash?.success && (
                            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                                <span>{flash.success}</span>
                            </div>
                        )}

                        {errors.email && (
                            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                                <span>{errors.email}</span>
                            </div>
                        )}

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Email Administrateur
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@buyedi.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Mot de passe
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-400">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                                    />
                                    <span className="text-xs text-slate-400">Maintenir ma session active</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm py-3 px-5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                            >
                                {processing ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Déverrouiller la Console</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Aide Rapide Démo / Initiale */}
                        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                            <button
                                type="button"
                                onClick={fillCredentials}
                                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Remplir les identifiants Super-Admin par défaut</span>
                            </button>
                            <p className="text-[11px] text-slate-500 mt-2">
                                Identifiant : <code className="text-slate-400 font-mono">admin@buyedi.com</code> • Mot de passe : <code className="text-slate-400 font-mono">password</code>
                            </p>
                        </div>
                    </div>

                    {/* Badge de conformité et sécurité */}
                    <div className="mt-6 text-center space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Chiffrement SSL 256-bit • Protection Anti-Bruteforce • IP Traçabilité</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-slate-900 text-center text-xs text-slate-600">
                &copy; {new Date().getFullYear()} Buyedi Solutions SaaS. Tous droits réservés.
            </footer>
        </div>
    );
}
