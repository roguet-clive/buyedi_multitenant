import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, Link } from '@inertiajs/react';
import useTranslation from "@/Hooks/useTranslation";
import { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, User, Clock, CheckCircle2, PenLine, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

// Config des badges par type d'action
const getActionConfig = (description) => {
    const d = (description || '').toLowerCase();
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

export default function Index({ logs, filters, users }) {
    const { t } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [causer, setCauser] = useState(filters.causer_id || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('logs.index'), { search, date, causer_id: causer }, {
                preserveState: true, preserveScroll: true, replace: true
            });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, date, causer]);

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
                                <span>{t("audit_trail", "Piste d'Audit")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("journal_title", "Journal d'Activité")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {t("journal_desc", "Consultez l'historique complet des actions effectuées dans le système : créations, modifications, suppressions et plus encore.")}
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
                        placeholder={t("search_log", "Rechercher dans le journal...")}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all" />
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

                {(search || date || causer) && (
                    <button onClick={() => { setSearch(''); setDate(''); setCauser(''); }}
                        className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm font-semibold hover:bg-red-100 transition-colors whitespace-nowrap">
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
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Entité</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tr-3xl">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {logs.data.length > 0 ? (
                                logs.data.map((log) => {
                                    const actionCfg = getActionConfig(log.description);
                                    const ActionIcon = actionCfg.icon;
                                    const modelName = getModelName(log.subject_type);
                                    const causerName = log.causer ? `${log.causer.prenom || ''} ${log.causer.nom || ''}`.trim() : 'Système';
                                    const props = log.properties ?? {};
                                    const propKeys = Object.keys(props).filter(k => k !== 'attributes' && k !== 'old');
                                    const attributes = props.attributes || props;

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
                                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                            <User className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{causerName}</span>
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
                                                {modelName ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                                                        {modelName}
                                                        {log.subject_id && <span className="text-slate-400">#{log.subject_id}</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 max-w-xs">
                                                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={JSON.stringify(log.properties, null, 2)}>
                                                    {typeof log.properties === 'object' && Object.keys(log.properties || {}).length > 0
                                                        ? JSON.stringify(log.properties).substring(0, 80) + (JSON.stringify(log.properties).length > 80 ? '...' : '')
                                                        : <span className="italic text-slate-300 dark:text-slate-600">—</span>
                                                    }
                                                </div>
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
