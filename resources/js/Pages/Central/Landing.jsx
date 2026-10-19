import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    School,
    ShieldCheck,
    CreditCard,
    FileText,
    Users,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    ExternalLink,
    Zap,
    TrendingUp,
    BarChart3,
    GraduationCap,
    Clock,
    Lock,
    Globe2,
    PhoneCall,
    Check
} from 'lucide-react';

export default function Landing({ tenants = [], pricing = {} }) {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [billingCycle, setBillingCycle] = useState('annuel'); // 'mensuel' | 'annuel'

    const handleSchoolRedirect = (domain) => {
        if (!domain) return;
        const port = window.location.port ? `:${window.location.port}` : '';
        window.location.href = `http://${domain}${port}/login`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            <Head title="Buyedi SaaS - Plateforme de Gestion Scolaire & Financière d'Entreprise" />

            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
                <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/15 blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[130px]" />
            </div>

            {/* 🧭 Header / Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <School className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-black tracking-tight text-white">Buyedi</span>
                            <span className="ml-1.5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                SaaS Pro
                            </span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <a href="#features" className="hover:text-white transition">Fonctionnalités</a>
                        <a href="#schools" className="hover:text-white transition">Écoles Partenaires</a>
                        <a href="#pricing" className="hover:text-white transition">Tarifs</a>
                        <Link href="/super-admin" className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 font-semibold">
                            <Lock className="w-3.5 h-3.5" /> Super Admin
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sélecteur d'école démo rapide */}
                        {tenants.length > 0 && (
                            <div className="hidden sm:block">
                                <select
                                    value={selectedSchool}
                                    onChange={(e) => {
                                        setSelectedSchool(e.target.value);
                                        handleSchoolRedirect(e.target.value);
                                    }}
                                    className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="">Accéder à une école...</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.domain}>
                                            🏫 {t.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Créer mon école</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 🚀 Hero Section */}
            <header className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>L'ERP Scolaire & Financier Multi-Établissements Nouvelle Génération</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
                    Pilotez votre établissement avec la puissance d'un <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">SaaS d'élite</span>.
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Chaque école bénéficie de son propre sous-domaine dédié et d'une base de données totalement isolée. Inscriptions en 1 clic, reçus QR-Code, bulletins officiels et trésorerie infaillible.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/onboarding"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <span>Démarrer 14 jours d'essai gratuit</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    
                    <a
                        href="#schools"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base px-7 py-4 rounded-2xl transition"
                    >
                        <span>Voir les écoles en direct</span>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                </div>

                {/* 🛡️ Badges de réassurance */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Base de données 100% isolée par école</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sous-domaine personnalisé</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Déploiement automatique en 60s</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sans carte bancaire au démarrage</span>
                    </div>
                </div>
            </header>

            {/* 🏫 Showcase des Écoles Multi-Tenants */}
            <section id="schools" className="py-20 border-t border-slate-900 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Multi-Tenancy En Direct</h2>
                        <h3 className="text-3xl font-extrabold text-white">Établissements Propulsés par Buyedi</h3>
                        <p className="mt-3 text-slate-400 text-sm">
                            Chaque école possède son espace sous son propre sous-domaine. Cliquez pour ouvrir la session dédiée de l'école.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tenants.map((tenant) => {
                            const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
                            const schoolUrl = `http://${tenant.domain}${port}/login`;

                            return (
                                <div
                                    key={tenant.id}
                                    className="group relative bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                                                {tenant.nom.charAt(0)}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                tenant.statut === 'actif'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {tenant.statut}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                                            {tenant.nom}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>{tenant.domain}</span>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                            <span>Formule : <strong className="text-slate-200 capitalize">{tenant.formule}</strong></span>
                                            <span className="text-[11px] text-slate-500">Tenant #{tenant.id}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={schoolUrl}
                                        className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-indigo-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all"
                                    >
                                        <span>Accéder à l'espace école</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            );
                        })}

                        {/* Carte invitant à créer une nouvelle école */}
                        <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition group">
                            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition mb-4">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h4 className="text-base font-bold text-white">Votre établissement ici ?</h4>
                            <p className="mt-1 text-xs text-slate-400 max-w-xs mb-4">
                                Créez votre espace en 60 secondes et bénéficiez de 14 jours d'essai gratuit.
                            </p>
                            <Link
                                href="/onboarding"
                                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                            >
                                <span>Créer un établissement</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ✨ Piliers & Fonctionnalités Clés */}
            <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Conçu pour l'Excellence</h2>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Une suite logicielle complète pour chaque aspect de l'école</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Finances & Reçus Sécurisés</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Paiements en tranches ou mensualités, gestion des arriérés, caisse journalière et génération instantanée de reçus infalsifiables avec QR Code de vérification.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Bulletins & Notes Conformes</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Calcul automatique des moyennes, coefficients par matière, rangs, appréciations des enseignants et génération PDF de masse des bulletins officiels.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Architecture Multi-Tenant Dédiée</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Une base de données MySQL étanche par école. Aucune contamination de données, sauvegardes indépendantes et respect absolu de la vie privée scolaire.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-5">
                            <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Portail Parents & SMS</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Les parents consultent les notes, les retards, les états de paiement et reçoivent des alertes en direct pour un suivi pédagogique irréprochable.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Ressources Humaines & Paie</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Gestion des contrats des enseignants et du personnel administratif, calcul des heures de vacation, génération des bulletins de paie et fiches d'impôt.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Documents Scolaires Officiels</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Certificats de scolarité, attestations de bonne conduite, billets de sortie, fiches de renseignements élève générées automatiquement aux normes ministérielles.
                        </p>
                    </div>
                </div>
            </section>

            {/* 💎 Tarifs / Formules */}
            <section id="pricing" className="py-24 border-t border-slate-900 bg-slate-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Tarifs Clairs & Sans Surprise</h2>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Des formules adaptées à chaque taille d'école</h3>
                        <p className="mt-3 text-slate-400 text-sm">
                            Commencez sans risque avec 14 jours d'essai gratuit complet. Changez de formule à tout moment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        {/* Starter */}
                        {pricing.starter && (
                            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-white">{pricing.starter.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{pricing.starter.tagline}</p>
                                    
                                    <div className="mt-6 mb-8">
                                        <div className="text-2xl font-black text-white">{pricing.starter.price}</div>
                                    </div>

                                    <ul className="space-y-3.5 text-xs text-slate-300">
                                        {pricing.starter.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5">
                                                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href="/onboarding?formule=starter"
                                    className="mt-8 w-full py-3 px-4 rounded-xl text-center text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
                                >
                                    Choisir la formule Starter
                                </Link>
                            </div>
                        )}

                        {/* Professionnel (Populaire) */}
                        {pricing.pro && (
                            <div className="relative bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-indigo-500/20">
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[11px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md">
                                    Recommandé pour les écoles
                                </div>

                                <div>
                                    <h4 className="text-xl font-bold text-white">{pricing.pro.name}</h4>
                                    <p className="text-xs text-indigo-300 mt-1">{pricing.pro.tagline}</p>
                                    
                                    <div className="mt-6 mb-8">
                                        <div className="text-2xl font-black text-white">{pricing.pro.price}</div>
                                    </div>

                                    <ul className="space-y-3.5 text-xs text-slate-200">
                                        {pricing.pro.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5">
                                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span className="font-medium">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href="/onboarding?formule=pro"
                                    className="mt-8 w-full py-3.5 px-4 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                                >
                                    Démarrer l'essai gratuit Pro
                                </Link>
                            </div>
                        )}

                        {/* Entreprise */}
                        {pricing.enterprise && (
                            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xl font-bold text-white">{pricing.enterprise.name}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{pricing.enterprise.tagline}</p>
                                    
                                    <div className="mt-6 mb-8">
                                        <div className="text-2xl font-black text-white">{pricing.enterprise.price}</div>
                                    </div>

                                    <ul className="space-y-3.5 text-xs text-slate-300">
                                        {pricing.enterprise.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-2.5">
                                                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href="/onboarding?formule=enterprise"
                                    className="mt-8 w-full py-3 px-4 rounded-xl text-center text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
                                >
                                    Contacter pour Groupe Scolaire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 💬 Footer */}
            <footer className="border-t border-slate-900 py-12 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300 text-sm">Buyedi SaaS</span>
                        <span>— Solution d'Entreprise pour la Gestion Scolaire</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/super-admin" className="hover:text-slate-300 transition">Administration Plateforme</Link>
                        <Link href="/onboarding" className="hover:text-slate-300 transition">Créer une école</Link>
                        <a href="mailto:contact@buyedi.com" className="hover:text-slate-300 transition">Support</a>
                    </div>
                </div>
                <div className="mt-6 text-slate-600">
                    &copy; {new Date().getFullYear()} Buyedi Multi-Tenant. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
