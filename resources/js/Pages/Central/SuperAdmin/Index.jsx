import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    School,
    Users,
    ShieldAlert,
    CheckCircle,
    Clock,
    Search,
    ExternalLink,
    LogIn,
    Calendar,
    Phone,
    Mail,
    ArrowUpRight,
    Sparkles,
    AlertTriangle,
    X,
    Filter,
    PlusCircle,
    ArrowLeft,
    DollarSign,
    CreditCard,
    TrendingUp,
    Receipt,
    Wallet,
    Layers,
    BarChart3,
    Lock,
    Unlock,
    FileText,
    Check,
    AlertCircle,
    LogOut,
    ShieldCheck
} from 'lucide-react';

export default function SuperAdminIndex({ tenants = [], payments = [], stats = {} }) {
    const { auth } = usePage().props;
    const [activeView, setActiveView] = useState('ecoles'); // 'ecoles' | 'finances' | 'factures'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTenantForEdit, setSelectedTenantForEdit] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Formulaire de modification de statut / abonnement
    const {
        data: statusData,
        setData: setStatusData,
        patch: patchStatus,
        processing: statusProcessing,
        reset: resetStatus
    } = useForm({
        statut: 'actif',
        formule: 'pro',
        mois_supplementaires: 12,
    });

    // Formulaire d'enregistrement d'encaissement d'abonnement
    const {
        data: paymentData,
        setData: setPaymentData,
        post: postPayment,
        processing: paymentProcessing,
        reset: resetPayment
    } = useForm({
        tenant_id: tenants[0]?.id || '',
        montant: 850000,
        formule: 'pro',
        periode: 'annuel',
        mois: 12,
        methode_paiement: 'virement_bancaire',
        notes: '',
    });

    const openEditModal = (tenant) => {
        setSelectedTenantForEdit(tenant);
        setStatusData({
            statut: tenant.statut || 'actif',
            formule: tenant.formule || 'pro',
            mois_supplementaires: 12,
        });
    };

    const handleSaveStatus = (e) => {
        e.preventDefault();
        if (!selectedTenantForEdit) return;

        patchStatus(`/super-admin/tenants/${selectedTenantForEdit.id}/status`, {
            onSuccess: () => {
                setSelectedTenantForEdit(null);
                resetStatus();
            },
        });
    };

    const handleQuickPayment = (tenant) => {
        setPaymentData({
            tenant_id: tenant.id,
            montant: tenant.formule === 'enterprise' ? 1500000 : tenant.formule === 'starter' ? 450000 : 850000,
            formule: tenant.formule || 'pro',
            periode: 'annuel',
            mois: 12,
            methode_paiement: 'virement_bancaire',
            notes: `Renouvellement annuel pour ${tenant.nom}`,
        });
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = (e) => {
        e.preventDefault();
        postPayment('/super-admin/payments', {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                resetPayment();
            },
        });
    };

    const filteredTenants = tenants.filter((t) => {
        const matchesSearch =
            t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || t.statut === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const formatCFA = (val) => Number(val || 0).toLocaleString('fr-FR') + ' F CFA';

    // Données pour le graphique mensuel
    const monthlyTrend = stats.monthly_trend || [];
    const maxMonthRev = Math.max(...monthlyTrend.map((m) => m.revenu_saas || 0), 1000000);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
            <Head title="Super-Admin SaaS • Buyedi Solutions" />

            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
                <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[130px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* 🧭 Topbar Mission Control */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                            title="Retour au site public"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl font-black text-white tracking-tight">Super-Admin SaaS</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 shadow-xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Buyedi Solutions
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Tour de contrôle centrale : pilotage multi-tenant, gestion financière et verrouillage strict des accès.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span className="font-semibold text-slate-300 font-mono text-[11px]">{auth?.user?.email || 'admin@buyedi.com'}</span>
                        </div>

                        <button
                            onClick={() => {
                                setPaymentData({
                                    tenant_id: tenants[0]?.id || '',
                                    montant: 850000,
                                    formule: 'pro',
                                    periode: 'annuel',
                                    mois: 12,
                                    methode_paiement: 'virement_bancaire',
                                    notes: '',
                                });
                                setIsPaymentModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Encaisser Abonnement</span>
                        </button>

                        <Link
                            href="/onboarding"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Déployer une école</span>
                        </Link>

                        <Link
                            href="/super-admin/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 font-bold text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                            title="Fermer la session Super-Admin"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </Link>
                    </div>
                </div>

                {/* 💳 BANDEAU FINANCIER & KPIS SAAS (Temps Réel) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Total Entrées SaaS */}
                    <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all group">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Chiffre d'Affaires SaaS</span>
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-400">
                            {formatCFA(stats.total_revenue)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                            <Check className="w-3 h-3 text-emerald-400" /> Total abonnements perçus
                        </div>
                    </div>

                    {/* MRR */}
                    <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all group">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>MRR Récurrent</span>
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-indigo-400">
                            {formatCFA(stats.mrr)} <span className="text-xs font-bold text-slate-400">/ mois</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-medium">
                            ARR : {formatCFA(stats.arr)} / an
                        </div>
                    </div>

                    {/* Écoles Actives vs Suspendues */}
                    <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 transition-all group">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Parc d'Établissements</span>
                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                <School className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white">
                            {stats.active_schools} <span className="text-xs font-bold text-slate-400">/ {stats.total_schools} actifs</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                            <span className="text-amber-400 font-semibold">{stats.trial_schools} essai</span>
                            <span>•</span>
                            <span className="text-rose-400 font-semibold">{stats.suspended_schools} bloqué(s)</span>
                        </div>
                    </div>

                    {/* Volume Global des Scolarités Traitées */}
                    <div className="bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-4 transition-all group">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Flux Écoles (TPV)</span>
                            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-violet-400">
                            {formatCFA(stats.total_school_volume)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            Scolarités encaissées par les écoles
                        </div>
                    </div>

                    {/* Total Élèves gérés */}
                    <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all group col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Élèves sous Gestion</span>
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-400">
                            {Number(stats.total_eleves || 0).toLocaleString('fr-FR')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                            Sur l'ensemble des bases isolées
                        </div>
                    </div>
                </div>

                {/* 📊 GRAPHIQUES DE PILOTAGE FINANCIER & RÉPARTITION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Graphique 1 : Évolution des encaissements SaaS (6 derniers mois) */}
                    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <h3 className="font-extrabold text-sm text-white">Évolution des Encaissements SaaS</h3>
                                    <p className="text-[11px] text-slate-400">Historique des 6 derniers mois en F CFA</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                MRR Récurrent : {formatCFA(stats.mrr)}
                            </span>
                        </div>

                        {/* Bar chart interactif en CSS pur */}
                        <div className="py-6">
                            <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6">
                                {monthlyTrend.map((item, idx) => {
                                    const heightPct = Math.max(12, Math.round(((item.revenu_saas || item.mrr_estime) / maxMonthRev) * 100));
                                    const isCurrent = idx === monthlyTrend.length - 1;

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                            {/* Tooltip au hover */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-mono py-1 px-2 rounded-md shadow-lg border border-slate-700 whitespace-nowrap mb-1">
                                                {formatCFA(item.revenu_saas || item.mrr_estime)}
                                            </div>

                                            {/* Barre */}
                                            <div
                                                style={{ height: `${heightPct}%` }}
                                                className={`w-full max-w-[48px] rounded-xl transition-all duration-300 group-hover:scale-105 shadow-md ${
                                                    isCurrent
                                                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-emerald-500/20'
                                                        : 'bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400'
                                                }`}
                                            />

                                            {/* Mois Label */}
                                            <span className={`text-[11px] font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {item.mois}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                                    Mois Antérieurs
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                                    Mois en Cours
                                </span>
                            </div>
                            <span className="text-slate-400">ARPU Moyen : <strong>{formatCFA(stats.arpu)}</strong> / école</span>
                        </div>
                    </div>

                    {/* Graphique 2 : Répartition des Formules & Alertes de Verrouillage */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-indigo-400" />
                                    <div>
                                        <h3 className="font-extrabold text-sm text-white">Répartition des Formules</h3>
                                        <p className="text-[11px] text-slate-400">Distribution du parc client</p>
                                    </div>
                                </div>
                            </div>

                            <div className="my-6 space-y-4">
                                {/* Starter */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                                        <span className="text-blue-400">Starter (45 000 F / mois)</span>
                                        <span className="text-white font-mono">{stats.plan_distribution?.starter || 0} école(s)</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{
                                                width: `${stats.total_schools ? Math.round(((stats.plan_distribution?.starter || 0) / stats.total_schools) * 100) : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Pro */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                                        <span className="text-indigo-400">Établissement Pro (85 000 F / mois)</span>
                                        <span className="text-white font-mono">{stats.plan_distribution?.pro || 0} école(s)</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{
                                                width: `${stats.total_schools ? Math.round(((stats.plan_distribution?.pro || 0) / stats.total_schools) * 100) : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Entreprise */}
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-bold">
                                        <span className="text-amber-400">Réseau Entreprise (150 000 F / mois)</span>
                                        <span className="text-white font-mono">{stats.plan_distribution?.enterprise || 0} école(s)</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-amber-500 rounded-full"
                                            style={{
                                                width: `${stats.total_schools ? Math.round(((stats.plan_distribution?.enterprise || 0) / stats.total_schools) * 100) : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Encadré Sécurité / Blocage d'accès strict */}
                        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-xs">
                            <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                                <Lock className="w-4 h-4" />
                                <span>Verrouillage Strict des Accès Actif</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                                Les écoles expirées ou suspendues sont bloquées au niveau middleware avec écran d'expiration ou de suspension officiel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🎛️ NAVIGATION D'ONGLETS DU SUPER-ADMIN */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
                    <button
                        onClick={() => setActiveView('ecoles')}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeView === 'ecoles'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <School className="w-4 h-4" />
                        <span>Flotte des Écoles ({tenants.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveView('factures')}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeView === 'factures'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Journal des Factures SaaS ({payments.length})</span>
                    </button>
                </div>

                {/* 🏫 VUE 1 : TABLE DES ÉTABLISSEMENTS & CONTRÔLE D'ACCÈS */}
                {activeView === 'ecoles' && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                        {/* Barre de recherche et filtres */}
                        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom d'école, sous-domaine, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-xs text-slate-400">Statut :</span>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="all">Tous les statuts</option>
                                    <option value="actif">Actif (Accès Ouvert)</option>
                                    <option value="essai">En essai (14j)</option>
                                    <option value="suspendu">Suspendu (Accès Verrouillé)</option>
                                </select>
                            </div>
                        </div>

                        {/* Table des Établissements */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="py-3.5 px-6">Établissement</th>
                                        <th className="py-3.5 px-6">Sous-Domaine</th>
                                        <th className="py-3.5 px-6">Formule SaaS</th>
                                        <th className="py-3.5 px-6">Élèves</th>
                                        <th className="py-3.5 px-6">Volume Encaissé</th>
                                        <th className="py-3.5 px-6">Statut d'Accès</th>
                                        <th className="py-3.5 px-6">Échéance</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                                    {filteredTenants.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-500">
                                                Aucun établissement ne correspond aux critères de recherche.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTenants.map((t) => {
                                            const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
                                            const schoolUrl = `http://${t.domain}${port}/login`;
                                            const isAccessBlocked = t.statut === 'suspendu' || !t.is_active;

                                            return (
                                                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center shrink-0">
                                                                {t.nom.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{t.nom}</div>
                                                                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                                                    {t.telephone && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Phone className="w-3 h-3" /> {t.telephone}
                                                                        </span>
                                                                    )}
                                                                    {t.email && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Mail className="w-3 h-3" /> {t.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6 font-mono text-[11px]">
                                                        <a
                                                            href={schoolUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                                                        >
                                                            <span>{t.domain}</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                                                            {t.formule === 'enterprise' ? 'Réseau Entreprise' : t.formule === 'pro' ? 'Établissement Pro' : 'Starter'}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 px-6 font-bold text-white">
                                                        {t.eleves_count} élèves
                                                    </td>

                                                    <td className="py-4 px-6 font-mono text-emerald-400 font-bold">
                                                        {formatCFA(t.school_volume)}
                                                    </td>

                                                    {/* Badge Statut d'Accès avec indicateur clair */}
                                                    <td className="py-4 px-6">
                                                        {t.statut === 'actif' && t.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                <Unlock className="w-3 h-3" /> Accès Ouvert
                                                            </span>
                                                        ) : t.statut === 'essai' && t.is_active ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                <Clock className="w-3 h-3" /> Essai (14j)
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                                <Lock className="w-3 h-3" /> Accès Bloqué
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                                                        {t.statut === 'essai' ? t.trial_ends_at : t.actif_jusqu_a || 'Illimité'}
                                                    </td>

                                                    {/* Actions Support & Encaissement */}
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Bouton Encaissement Rapide */}
                                                            <button
                                                                onClick={() => handleQuickPayment(t)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                                                title="Encaisser un paiement d'abonnement"
                                                            >
                                                                <CreditCard className="w-3 h-3" />
                                                                <span>Encaisser</span>
                                                            </button>

                                                            {/* Bouton Gérer l'accès */}
                                                            <button
                                                                onClick={() => openEditModal(t)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-[11px] font-bold transition cursor-pointer"
                                                                title="Modifier statut ou prolonger"
                                                            >
                                                                Accès
                                                            </button>

                                                            {/* Bouton Connexion directe */}
                                                            <form
                                                                action={`/super-admin/tenants/${t.id}/impersonate`}
                                                                method="POST"
                                                                className="inline"
                                                            >
                                                                <input
                                                                    type="hidden"
                                                                    name="_token"
                                                                    value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''}
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                                                    title="Se connecter directement en tant qu'admin de l'école"
                                                                >
                                                                    <LogIn className="w-3 h-3" />
                                                                    <span>Entrer</span>
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 🧾 VUE 2 : JOURNAL DES FACTURES & PAIEMENTS SAAS */}
                {activeView === 'factures' && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-sm text-white">Journal des Encaissements d'Abonnements SaaS</h3>
                                <p className="text-[11px] text-slate-400">Toutes les transactions et factures générées pour la plateforme Buyedi Solutions</p>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                                Total Encaissé : {formatCFA(stats.total_revenue)}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                                    <tr>
                                        <th className="py-3.5 px-6">Réf Facture</th>
                                        <th className="py-3.5 px-6">Établissement</th>
                                        <th className="py-3.5 px-6">Formule</th>
                                        <th className="py-3.5 px-6">Montant Réglé</th>
                                        <th className="py-3.5 px-6">Période</th>
                                        <th className="py-3.5 px-6">Moyen de Paiement</th>
                                        <th className="py-3.5 px-6">Date de Règlement</th>
                                        <th className="py-3.5 px-6 text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-500">
                                                Aucun paiement d'abonnement enregistré pour le moment.
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                                                    {p.reference}
                                                </td>
                                                <td className="py-4 px-6 font-bold text-white">
                                                    {p.tenant_nom}
                                                </td>
                                                <td className="py-4 px-6 uppercase text-[11px] font-semibold text-slate-300">
                                                    {p.formule}
                                                </td>
                                                <td className="py-4 px-6 font-mono font-black text-emerald-400 text-sm">
                                                    {formatCFA(p.montant)}
                                                </td>
                                                <td className="py-4 px-6 font-medium text-slate-400">
                                                    {p.mois} mois ({p.periode})
                                                </td>
                                                <td className="py-4 px-6 capitalize">
                                                    <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">
                                                        {p.methode_paiement.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">
                                                    {p.paye_le}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <Check className="w-3 h-3" /> Validé & Actif
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* 💰 MODAL : ENCAISSER UN ABONNEMENT */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">Encaisser un Abonnement SaaS</h3>
                                <p className="text-xs text-slate-400">Enregistre la recette et prolonge automatiquement l'accès de l'école.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSavePayment} className="space-y-4">
                            {/* Choix de l'école */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Établissement Client</label>
                                <select
                                    value={paymentData.tenant_id}
                                    onChange={(e) => setPaymentData('tenant_id', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                >
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nom} ({t.domain})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Formule & Durée */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Formule SaaS</label>
                                    <select
                                        value={paymentData.formule}
                                        onChange={(e) => {
                                            const f = e.target.value;
                                            setPaymentData((prev) => ({
                                                ...prev,
                                                formule: f,
                                                montant: f === 'enterprise' ? 1500000 : f === 'starter' ? 450000 : 850000,
                                            }));
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="starter">Starter (45k/m)</option>
                                        <option value="pro">Établissement Pro (85k/m)</option>
                                        <option value="enterprise">Réseau Entreprise (150k/m)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Durée (Mois)</label>
                                    <select
                                        value={paymentData.mois}
                                        onChange={(e) => setPaymentData('mois', Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value={1}>1 mois (Mensuel)</option>
                                        <option value={3}>3 mois (Trimestriel)</option>
                                        <option value={6}>6 mois (Semestriel)</option>
                                        <option value={12}>12 mois (Annuel)</option>
                                        <option value={24}>24 mois (2 Ans)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Montant & Moyen de paiement */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Montant Réglé (F CFA)</label>
                                    <input
                                        type="number"
                                        min="1000"
                                        step="5000"
                                        value={paymentData.montant}
                                        onChange={(e) => setPaymentData('montant', Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Moyen de Paiement</label>
                                    <select
                                        value={paymentData.methode_paiement}
                                        onChange={(e) => setPaymentData('methode_paiement', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="airtel_money">Airtel Money</option>
                                        <option value="moov_money">Moov Money</option>
                                        <option value="virement_bancaire">Virement Bancaire (BGFI, UBA, etc.)</option>
                                        <option value="especes">Espèces / Caisse Directe</option>
                                        <option value="cheque">Chèque Certifié</option>
                                    </select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Référence Externe / Notes</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Réf virement BGFI-884920 ou Reçu #48"
                                    value={paymentData.notes}
                                    onChange={(e) => setPaymentData('notes', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg transition cursor-pointer"
                                >
                                    {paymentProcessing ? 'Enregistrement...' : 'Valider & Débloquer l\'Accès'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔒 MODAL : GÉRER LE STATUT & L'ACCÈS ÉCOLE */}
            {selectedTenantForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedTenantForEdit(null)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-lg">
                                {selectedTenantForEdit.nom.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white">{selectedTenantForEdit.nom}</h3>
                                <p className="text-xs text-slate-400 font-mono">{selectedTenantForEdit.domain}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveStatus} className="space-y-4">
                            {/* Choix du statut avec alerte de blocage */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Statut de l'Établissement</label>
                                <select
                                    value={statusData.statut}
                                    onChange={(e) => setStatusData('statut', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                                >
                                    <option value="actif">🟢 Actif (Accès Normal Ouvert)</option>
                                    <option value="essai">🟡 Période d'Essai (14 jours)</option>
                                    <option value="suspendu">🔴 Suspendu (Accès Verrouillé 403)</option>
                                    <option value="expire">⏳ Expiré (Accès Verrouillé 402)</option>
                                </select>
                            </div>

                            {/* Alerte contextuelle si blocage */}
                            {(statusData.statut === 'suspendu' || statusData.statut === 'expire') && (
                                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                    <span>
                                        Attention : En choisissant ce statut, aucun enseignant, parent ou administrateur ne pourra accéder à l'application de l'école. L'accès sera immédiatement bloqué.
                                    </span>
                                </div>
                            )}

                            {/* Formule */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Formule SaaS</label>
                                <select
                                    value={statusData.formule}
                                    onChange={(e) => setStatusData('formule', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="starter">Starter (Maternelle / Primaire)</option>
                                    <option value="pro">Établissement Pro (Tous Cycles)</option>
                                    <option value="enterprise">Réseau d'Établissements / Entreprise</option>
                                </select>
                            </div>

                            {/* Prolongation */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1.5">Prolonger la validité de</label>
                                <select
                                    value={statusData.mois_supplementaires}
                                    onChange={(e) => setStatusData('mois_supplementaires', Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value={1}>+1 Mois</option>
                                    <option value={3}>+3 Mois</option>
                                    <option value={6}>+6 Mois</option>
                                    <option value={12}>+12 Mois (1 An scolaire)</option>
                                    <option value={24}>+24 Mois (2 Ans)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTenantForEdit(null)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={statusProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg transition cursor-pointer"
                                >
                                    {statusProcessing ? 'Mise à jour...' : 'Appliquer les modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
