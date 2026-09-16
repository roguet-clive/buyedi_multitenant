import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, Link } from '@inertiajs/react';
import useTranslation from "@/Hooks/useTranslation";
import { useState, useEffect } from 'react';
import { 
    ScrollText, Search, Filter, User, Clock, CheckCircle2, 
    PenLine, Trash2, Plus, ChevronLeft, ChevronRight,
    LogIn, LogOut, ShieldAlert, KeyRound, Globe, ShieldCheck,
    Eye, EyeOff
} from 'lucide-react';

// Config des badges par type d'action
const getActionConfig = (description) => {
    const d = (description || '').toLowerCase();
    if (d.includes('connexion réussie') || d.includes('login')) {
        return { label: 'Connexion', icon: LogIn, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' };
    }
    if (d.includes('déconnexion') || d.includes('logout')) {
        return { label: 'Déconnexion', icon: LogOut, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' };
    }
    if (d.includes('échec') || d.includes('echec') || d.includes('failed')) {
        return { label: 'Échec Connexion', icon: ShieldAlert, color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' };
    }
    if (d.includes('mot de passe') || d.includes('password')) {
        return { label: 'Sécurité MDP', icon: KeyRound, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' };
    }
    if (d.includes('created') || d.includes('créé') || d.includes('ajout')) {
        return { label: 'Création', icon: Plus, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-500' };
    }
    if (d.includes('updated') || d.includes('modif') || d.includes('mis à jour')) {
        return { label: 'Modification', icon: PenLine, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', dot: 'bg-blue-500' };
    }
    if (d.includes('deleted') || d.includes('supprim')) {
        return { label: 'Suppression', icon: Trash2, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', dot: 'bg-red-500' };
    }
    return { label: description, icon: CheckCircle2, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-slate-400' };
};

const AVATAR_COLORS = [
    'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600',
    'from-indigo-500 to-indigo-600', 'from-red-500 to-blue-600',
    'from-amber-500 to-orange-500',
];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function Index({ logs, filters, users, isSuperAdmin }) {
    const { t } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [causer, setCauser] = useState(filters.causer_id || '');
    const [categorie, setCategorie] = useState(filters.categorie || '');
    const [showSuperAdmin, setShowSuperAdmin] = useState(filters.show_superadmin !== undefined ? Boolean(filters.show_superadmin) : true);

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = { search, date, causer_id: causer, categorie };
            if (isSuperAdmin) {
                params.show_superadmin = showSuperAdmin ? '1' : '0';
            }
            router.get(route('logs.index'), params, {
                preserveState: true, preserveScroll: true, replace: true
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, date, causer, categorie, showSuperAdmin]);

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getModelName = (subjectType) => {
        if (!subjectType) return null;
        return subjectType.split('\\').pop();
    };

    return (
        <DashboardLayout title={t('activity_logs', 'Journal d\'Activité')}>
            <Head title={t('activity_logs', 'Journal')} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-slate-800 to-slate-700 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <ScrollText className="w-10 h-10 text-slate-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-slate-200 text-sm font-medium mb-3 border border-white/10">
                                <Clock className="w-4 h-4" />
                                <span>{t("audit_trail", "Piste d'Audit & Sécurité")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("journal_title", "Journal d'Activité")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {t("journal_desc", "Consultez l'historique complet des actions : connexions, déconnexions, alertes de sécurité, créations, modifications et suppressions.")}
                            </p>
                        </div>
                    </div>

                    {/* Compteur */}
                    <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-6 py-4 text-center">
                        <p className="text-3xl font-black text-white">{logs.total}</p>
                        <p className="text-sm text-slate-300 mt-1">{t("total_events", "événements enregistrés")}</p>
                    </div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10 -mt-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("search_log", "Rechercher une action, adresse IP, email...")}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
                </div>

                <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
                        className="pl-12 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer min-w-[190px]">
                        <option value="">Toutes les catégories</option>
                        <option value="auth">🔐 Connexions & Sécurité</option>
                        <option value="data">📦 Données & Métiers</option>
                    </select>
                </div>

                <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer" />
                </div>

                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={causer} onChange={(e) => setCauser(e.target.value)}
                        className="pl-12 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer min-w-[200px]">
                        <option value="">{t("all_users", "Tous les utilisateurs")}</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                        ))}
                    </select>
                </div>

                {isSuperAdmin && (
                    <button
                        type="button"
                        onClick={() => setShowSuperAdmin(!showSuperAdmin)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border transition-all shadow-sm whitespace-nowrap cursor-pointer ${
                            showSuperAdmin
                                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 hover:bg-purple-100"
                                : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-100 ring-2 ring-amber-400/30"
                        }`}
                        title={showSuperAdmin ? "Activer le mode incognito (masquer l'activité Super-Admin)" : "Désactiver le mode incognito (afficher l'activité Super-Admin)"}
                    >
                        {showSuperAdmin ? (
                            <>
                                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                <span>Super-Admin visibles</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>Mode Incognito (Super-Admin masqué)</span>
                            </>
                        )}
                    </button>
                )}

                {(search || date || causer || categorie || (isSuperAdmin && !showSuperAdmin)) && (
                    <button onClick={() => { setSearch(''); setDate(''); setCauser(''); setCategorie(''); if (isSuperAdmin) setShowSuperAdmin(true); }}
                        className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold hover:bg-red-100 transition-colors whitespace-nowrap cursor-pointer">
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            {/* TABLEAU PREMIUM */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#0B1A2D] text-white">
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Horodatage</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Utilisateur</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Action</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Entité / Domaine</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tr-3xl">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => {
                                    const actionCfg = getActionConfig(log.description);
                                    const ActionIcon = actionCfg.icon;
                                    const modelName = getModelName(log.subject_type);
                                    const isAuth = log.log_name === 'authentification';
                                    const isSecurite = log.log_name === 'securite';
                                    const causerName = log.causer 
                                        ? `${log.causer.prenom || ''} ${log.causer.nom || ''}`.trim() 
                                        : (isSecurite ? 'Visiteur / Anonyme' : 'Système');
                                    const isCauserSuperAdmin = log.causer?.roles?.some(r => r.name === 'super-admin' || r.name === 'superadmin');
                                    const props = log.properties ?? {};

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors align-top">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(log.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2.5">
                                                    {log.causer ? (
                                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColor(log.causer.prenom)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                                            {(log.causer.prenom?.charAt(0) || '?').toUpperCase()}
                                                        </div>
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSecurite ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                            {isSecurite ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{causerName}</span>
                                                            {isSuperAdmin && isCauserSuperAdmin && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                                    Super-Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        {log.causer?.email && (
                                                            <span className="text-[11px] text-slate-400 font-mono block">{log.causer.email}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${actionCfg.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${actionCfg.dot}`}></span>
                                                    <ActionIcon className="w-3.5 h-3.5" />
                                                    {actionCfg.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {isAuth ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold">
                                                        🛡️ Session Auth
                                                    </span>
                                                ) : isSecurite ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold">
                                                        🚨 Sécurité
                                                    </span>
                                                ) : modelName ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                                                        {modelName}
                                                        {log.subject_id && <span className="text-slate-400">#{log.subject_id}</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 max-w-sm">
                                                {props.ip || props.email_tente || props.navigateur ? (
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        {props.ip && (
                                                            <span className="inline-flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                                                                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                                IP: {props.ip}
                                                            </span>
                                                        )}
                                                        {props.email_tente && (
                                                            <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded border border-rose-200/60 w-fit">
                                                                Tentative : {props.email_tente}
                                                            </span>
                                                        )}
                                                        {props.navigateur && (
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[240px] block" title={props.navigateur}>
                                                                {props.navigateur}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : typeof log.properties === 'object' && Object.keys(log.properties || {}).length > 0 ? (
                                                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[220px]" title={JSON.stringify(log.properties, null, 2)}>
                                                        {JSON.stringify(log.properties).substring(0, 80) + (JSON.stringify(log.properties).length > 80 ? '...' : '')}
                                                    </div>
                                                ) : (
                                                    <span className="italic text-slate-300 dark:text-slate-600 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <ScrollText className="w-16 h-16 mb-4 opacity-40" />
                                            <p className="text-lg font-medium">{t("no_logs_found", "Aucun événement trouvé")}</p>
                                            <p className="text-sm mt-1">Essayez de modifier vos filtres de recherche.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {logs.links && logs.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Page <span className="font-bold text-slate-700 dark:text-white">{logs.current_page}</span> sur <span className="font-bold">{logs.last_page}</span>
                            <span className="ml-2 text-slate-400">({logs.total} évènements)</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {logs.links.map((link, i) => (
                                <Link key={i} href={link.url || "#"} preserveScroll preserveState
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${link.active ? "bg-slate-800 text-white" : link.url ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-default"}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
