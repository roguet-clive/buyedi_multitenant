import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Bell, Check, Trash2, AlertTriangle, Info, CheckCircle2, 
    BookOpen, FileText, Download, ExternalLink, ShieldCheck, 
    XCircle, Inbox, CheckCheck 
} from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Index({ notifications, unreadCount = 0, totalCount = 0, currentFilter = 'all' }) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);

    const normalizeUrl = (rawUrl) => {
        if (!rawUrl) return null;
        try {
            if (rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
                return rawUrl;
            }
            const parsed = new URL(rawUrl, window.location.origin);
            return parsed.pathname + parsed.search + parsed.hash;
        } catch (e) {
            return rawUrl;
        }
    };

    const markAllRead = () => {
        setIsProcessing(true);
        router.post(route('notifications.readAll'), {}, {
            preserveScroll: true,
            onFinish: () => setIsProcessing(false),
        });
    };

    const markRead = (id) => {
        router.post(route('notifications.read', id), {}, { preserveScroll: true });
    };

    const deleteNotification = (e, id) => {
        e.stopPropagation();
        if (confirm(t("notifications_confirm_delete", "Supprimer définitivement cette notification ?"))) {
            router.delete(route('notifications.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const deleteAllRead = () => {
        if (confirm(t("notifications_confirm_delete_all_read", "Supprimer toutes les notifications déjà lues de votre boîte ?"))) {
            setIsProcessing(true);
            router.delete(route('notifications.destroyAllRead'), {
                preserveScroll: true,
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handleNotificationClick = (notif) => {
        const rawUrl = notif.data?.action_url || notif.data?.url || notif.data?.download_url;
        const targetUrl = normalizeUrl(rawUrl);
        if (!notif.read_at) {
            router.post(route('notifications.read', notif.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (targetUrl) {
                        router.visit(targetUrl);
                    }
                }
            });
        } else if (targetUrl) {
            router.visit(targetUrl);
        }
    };

    const setFilter = (filter) => {
        router.get(route('notifications.index'), { filter }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Formatage en temps relatif intelligent
    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '-';
        const now = new Date();
        const date = new Date(dateStr);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return "À l'instant";
        }
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `Il y a ${diffInMinutes} min`;
        }
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `Il y a ${diffInHours} h`;
        }
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (diffInDays < 7) {
            return `Il y a ${diffInDays} j`;
        }
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper d'icône selon le type
    const getIcon = (type, notifData) => {
        const isDemandeDoc = type.includes('DemandeDocument') || notifData?.type === 'demande_document' || notifData?.type === 'demande_document_traitee';
        if (isDemandeDoc) {
            if (notifData?.statut === 'rejete') return <XCircle className="w-5 h-5 text-red-500" />;
            if (notifData?.statut === 'approuve') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            return <FileText className="w-5 h-5 text-indigo-500" />;
        }
        if (type.includes('DocumentPedagogique') || notifData?.type === 'document_pedagogique') {
            return <BookOpen className="w-5 h-5 text-indigo-500" />;
        }
        if (type.includes('Alert')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
        if (type.includes('Success')) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        return <Info className="w-5 h-5 text-blue-500" />;
    };

    return (
        <DashboardLayout title={t("notifications_title", "Centre de Notifications")}>
            <Head title={t("notifications_title", "Notifications")} />

            <div className="max-w-5xl mx-auto pb-12">
                {/* HERO BANNER */}
                <div className="bg-[#0B1A2D] rounded-3xl p-8 mb-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl border border-slate-800">
                    <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -m-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                            <Bell className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-slate-300 text-xs font-semibold mb-2 border border-white/10">
                                <span>{t("notifications_badge", "Centre de veille & alertes")}</span>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {t("notifications_title", "Notifications")}
                            </h1>
                            <p className="text-slate-300 text-sm mt-1 font-medium">
                                {unreadCount > 0 ? (
                                    <>
                                        Vous avez <strong className="text-emerald-400 font-bold">{unreadCount}</strong> alerte{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''} nécessitant votre attention
                                    </>
                                ) : (
                                    <>Toutes vos notifications sont à jour ! 🎉</>
                                )}
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <div className="relative z-10">
                            <button
                                onClick={markAllRead}
                                disabled={isProcessing}
                                className="group flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer"
                            >
                                <CheckCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>{t("notifications_mark_all_read", "Tout marquer comme lu")}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* BARRE D'ONGLETS ET ACTIONS */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Onglets Toutes / Non lues */}
                    <div className="inline-flex p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                currentFilter === 'all'
                                    ? 'bg-[#0B1A2D] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span>{t("notifications_all", "Toutes")}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                currentFilter === 'all'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {totalCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFilter('unread')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                currentFilter === 'unread'
                                    ? 'bg-[#0B1A2D] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <span>{t("notifications_unread", "Non lues")}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-colors ${
                                unreadCount > 0
                                    ? 'bg-emerald-500 text-white animate-pulse'
                                    : currentFilter === 'unread'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                {unreadCount}
                            </span>
                        </button>
                    </div>

                    {/* Vider les lues */}
                    {totalCount > unreadCount && (
                        <button
                            type="button"
                            onClick={deleteAllRead}
                            disabled={isProcessing}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-slate-200/60 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900 cursor-pointer disabled:opacity-50"
                            title="Supprimer toutes les notifications déjà lues"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t("notifications_clean_read", "Vider l'historique lu")}</span>
                        </button>
                    )}
                </div>

                {/* LISTE DES NOTIFICATIONS */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[450px]">
                    {notifications.data.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.data.map((notif) => {
                                const isDocPedago = notif.type.includes('DocumentPedagogique') || notif.data?.type === 'document_pedagogique';
                                const isDemandeDoc = notif.type.includes('DemandeDocument') || notif.data?.type === 'demande_document' || notif.data?.type === 'demande_document_traitee';

                                let iconBgColor = "bg-blue-100 dark:bg-blue-900/30";
                                let iconColor = "text-blue-600 dark:text-blue-400";

                                if (isDemandeDoc) {
                                    if (notif.data?.statut === 'rejete') {
                                        iconBgColor = "bg-red-100 dark:bg-red-900/30";
                                        iconColor = "text-red-600 dark:text-red-400";
                                    } else if (notif.data?.statut === 'approuve') {
                                        iconBgColor = "bg-emerald-100 dark:bg-emerald-900/30";
                                        iconColor = "text-emerald-600 dark:text-emerald-400";
                                    } else {
                                        iconBgColor = "bg-indigo-100 dark:bg-indigo-900/40";
                                        iconColor = "text-indigo-600 dark:text-indigo-400";
                                    }
                                } else if (isDocPedago) {
                                    iconBgColor = "bg-indigo-100 dark:bg-indigo-900/40";
                                    iconColor = "text-indigo-600 dark:text-indigo-400";
                                } else if (notif.type.includes('Alert')) {
                                    iconBgColor = "bg-red-100 dark:bg-red-900/30";
                                    iconColor = "text-red-600 dark:text-red-400";
                                } else if (notif.type.includes('Success')) {
                                    iconBgColor = "bg-emerald-100 dark:bg-emerald-900/30";
                                    iconColor = "text-emerald-600 dark:text-emerald-400";
                                }

                                const rawDownloadUrl = notif.data?.download_url || (notif.data?.document_id ? route('documents.download', notif.data.document_id) : null);
                                const downloadUrl = normalizeUrl(rawDownloadUrl);

                                const rawActionUrl = notif.data?.action_url || notif.data?.url || (isDocPedago ? route('documents.index') : isDemandeDoc ? route('demandes-documents.index') : null);
                                const actionUrl = normalizeUrl(rawActionUrl);

                                const actionLabel = notif.data?.action_label || (isDemandeDoc ? 'Gérer les demandes' : isDocPedago ? 'Consulter les cours' : 'Voir les détails');

                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-6 transition-all duration-200 flex items-start gap-4 sm:gap-5 group relative ${
                                            !notif.read_at
                                                ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-l-4 border-l-indigo-600'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                                        }`}
                                    >
                                        {/* Icône du type */}
                                        <div className={`mt-1 flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${iconBgColor}`}>
                                            <div className={iconColor}>
                                                {getIcon(notif.type, notif.data)}
                                            </div>
                                        </div>

                                        {/* Contenu principal */}
                                        <div
                                            className={`flex-1 min-w-0 ${actionUrl ? 'cursor-pointer' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                <div className="flex items-center gap-2">
                                                    {!notif.read_at && (
                                                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                                    )}
                                                    <h4 className={`text-base font-bold truncate ${
                                                        !notif.read_at
                                                            ? 'text-slate-900 dark:text-white font-extrabold'
                                                            : 'text-slate-700 dark:text-slate-300'
                                                    } ${actionUrl ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors' : ''}`}>
                                                        {notif.data?.title || t("notifications_system", "Notification système")}
                                                    </h4>
                                                </div>

                                                <span
                                                    className="text-xs font-semibold text-slate-400 shrink-0 self-start sm:self-auto"
                                                    title={formatFullDate(notif.created_at)}
                                                >
                                                    {formatTimeAgo(notif.created_at)}
                                                </span>
                                            </div>

                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                                                {notif.data?.message || t("notifications_empty_body", "Contenu de la notification absent.")}
                                            </p>

                                            {/* BOUTONS D'ACTION DIRECTS (Téléchargement / Navigation) */}
                                            {(downloadUrl || actionUrl) && (
                                                <div className="flex items-center gap-3 mt-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                                    {downloadUrl && (
                                                        <a
                                                            href={downloadUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={() => { if (!notif.read_at) markRead(notif.id); }}
                                                            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span>{notif.data?.download_label || t("download_document", "Télécharger")}</span>
                                                        </a>
                                                    )}

                                                    {actionUrl && (
                                                        <Link
                                                            href={actionUrl}
                                                            onClick={() => { if (!notif.read_at) markRead(notif.id); }}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            <span>{actionLabel}</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* BOUTONS D'ACTION UNITAIRE (Marquer comme lu + Supprimer) */}
                                        <div className="flex items-center gap-1.5 shrink-0 self-start mt-1" onClick={(e) => e.stopPropagation()}>
                                            {!notif.read_at ? (
                                                <button
                                                    type="button"
                                                    onClick={() => markRead(notif.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                                    title={t("mark_as_read", "Marquer comme lu")}
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span className="hidden md:inline">{t("mark_read", "Marquer lu")}</span>
                                                </button>
                                            ) : (
                                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    <span>Lu</span>
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => deleteNotification(e, notif.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all active:scale-95 cursor-pointer"
                                                title={t("delete", "Supprimer")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center relative z-10 shadow-inner border border-slate-100 dark:border-slate-700">
                                    {currentFilter === 'unread' ? (
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    ) : (
                                        <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                                {currentFilter === 'unread'
                                    ? t("notifications_empty_unread", "Aucune notification non lue")
                                    : t("notifications_empty", "Aucune notification à afficher")
                                }
                            </h3>
                            <p className="text-slate-500 text-sm font-medium max-w-sm">
                                {currentFilter === 'unread'
                                    ? t("notifications_empty_unread_sub", "Félicitations, vous êtes parfaitement à jour dans vos suivis ! 🎉")
                                    : t("notifications_empty_sub", "Votre boîte de notifications est actuellement vide.")
                                }
                            </p>

                            {currentFilter === 'unread' && totalCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFilter('all')}
                                    className="mt-5 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    {t("view_all_notifications", "Consulter toutes les notifications")}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {notifications.links && notifications.links.length > 3 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            {notifications.links.map((link, k) => (
                                <Link
                                    key={k}
                                    href={link.url}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${link.active
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                            : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
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
