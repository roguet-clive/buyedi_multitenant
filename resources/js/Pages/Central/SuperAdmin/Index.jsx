import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    School,
    Users,
    ShieldAlert,
    CheckCircle,
    Clock,
    Search,
    ExternalLink,
    LogIn,
    MoreVertical,
    Calendar,
    Phone,
    Mail,
    ArrowUpRight,
    Sparkles,
    AlertTriangle,
    X,
    Filter,
    PlusCircle,
    ArrowLeft
} from 'lucide-react';

export default function SuperAdminIndex({ tenants = [], stats = {} }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTenantForEdit, setSelectedTenantForEdit] = useState(null);

    // Modal Form pour modifier statut et abonnement
    const { data, setData, patch, processing, reset } = useForm({
        statut: 'actif',
        formule: 'pro',
        mois_supplementaires: 12,
    });

    const openEditModal = (tenant) => {
        setSelectedTenantForEdit(tenant);
        setData({
            statut: tenant.statut || 'actif',
            formule: tenant.formule || 'pro',
            mois_supplementaires: 12,
        });
    };

    const handleSaveStatus = (e) => {
        e.preventDefault();
        if (!selectedTenantForEdit) return;

        patch(`/super-admin/tenants/${selectedTenantForEdit.id}/status`, {
            onSuccess: () => {
                setSelectedTenantForEdit(null);
                reset();
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
            <Head title="Super Admin SaaS - Buyedi Multi-Tenant" />

            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
                <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[130px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Topbar */}
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
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-white tracking-tight">Super-Admin SaaS</h1>
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                    Control Plane
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Gestion centrale des établissements, des abonnements et support en direct.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>Déployer une école</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Total Écoles</span>
                            <School className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-2xl font-black text-white">{stats.total_schools || 0}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Établissements enregistrés</div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Écoles Actives</span>
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-black text-emerald-400">{stats.active_schools || 0}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Abonnements valides</div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Période d'Essai</span>
                            <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-black text-amber-400">{stats.trial_schools || 0}</div>
                        <div className="text-[11px] text-slate-500 mt-1">En phase de test (14j)</div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Suspendues</span>
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                        </div>
                        <div className="text-2xl font-black text-rose-400">{stats.suspended_schools || 0}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Accès restreint</div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                            <span>Total Élèves</span>
                            <Users className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="text-2xl font-black text-violet-400">{stats.total_eleves || 0}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Sur l'ensemble des bases</div>
                    </div>
                </div>

                {/* Table & Filtres */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                    {/* Filtres de recherche */}
                    <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, sous-domaine, email..."
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
                                <option value="actif">Actif</option>
                                <option value="essai">En essai</option>
                                <option value="suspendu">Suspendu</option>
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
                                    <th className="py-3.5 px-6">Formule</th>
                                    <th className="py-3.5 px-6">Élèves</th>
                                    <th className="py-3.5 px-6">Statut</th>
                                    <th className="py-3.5 px-6">Validité</th>
                                    <th className="py-3.5 px-6 text-right">Actions Support</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 text-slate-300">
                                {filteredTenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-500">
                                            Aucun établissement correspondant aux critères.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTenants.map((t) => {
                                        const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
                                        const schoolUrl = `http://${t.domain}${port}/login`;

                                        return (
                                            <tr key={t.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
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
                                                    <span className="capitalize font-medium text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                                        {t.formule}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-white bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full text-xs">
                                                        {t.eleves_count} élèves
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        t.statut === 'actif'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : t.statut === 'essai'
                                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    }`}>
                                                        {t.statut}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-6 text-slate-400 text-[11px]">
                                                    {t.statut === 'essai' ? (
                                                        <span>Essai jusqu'au : <strong>{t.trial_ends_at || 'N/A'}</strong></span>
                                                    ) : (
                                                        <span>Actif jusqu'au : <strong>{t.actif_jusqu_a || 'Permanent'}</strong></span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Bouton Impersonation Directe */}
                                                        <form method="POST" action={`/super-admin/tenants/${t.id}/impersonate`}>
                                                            <button
                                                                type="submit"
                                                                title="Se connecter dans l'école en tant qu'admin (Mode Support)"
                                                                className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition"
                                                            >
                                                                <LogIn className="w-3.5 h-3.5" />
                                                                <span>Connexion Directe</span>
                                                            </button>
                                                        </form>

                                                        {/* Bouton Modifier Statut */}
                                                        <button
                                                            onClick={() => openEditModal(t)}
                                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                                            title="Gérer l'abonnement & le statut"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
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
            </div>

            {/* Modal Modification Statut / Abonnement */}
            {selectedTenantForEdit && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedTenantForEdit(null)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-white mb-1">
                            Gérer l'établissement
                        </h3>
                        <p className="text-xs text-indigo-400 font-medium mb-6">
                            {selectedTenantForEdit.nom} ({selectedTenantForEdit.id})
                        </p>

                        <form onSubmit={handleSaveStatus} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Statut de l'établissement
                                </label>
                                <select
                                    value={data.statut}
                                    onChange={(e) => setData('statut', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="actif">Actif (Abonnement En Cours)</option>
                                    <option value="essai">En Période d'Essai</option>
                                    <option value="suspendu">Suspendu (Accès bloqué)</option>
                                    <option value="expire">Expiré (Abonnement échu)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Formule / Plan
                                </label>
                                <select
                                    value={data.formule}
                                    onChange={(e) => setData('formule', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="starter">Starter (Petites écoles)</option>
                                    <option value="pro">Professionnel (Standard)</option>
                                    <option value="enterprise">Entreprise (Multi-sites / Illimité)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Prolonger la validité (en mois)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={data.mois_supplementaires}
                                    onChange={(e) => setData('mois_supplementaires', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                                <span className="text-[11px] text-slate-500 mt-1 block">
                                    Ajoute ce nombre de mois à la date d'expiration actuelle.
                                </span>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedTenantForEdit(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
