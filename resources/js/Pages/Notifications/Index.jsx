import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Index({ notifications }) {
    const { t } = useTranslation();

    const markAllRead = () => {
        router.post(route('notifications.readAll'));
    };

    const markRead = (id) => {
        router.post(route('notifications.read', id), {}, { preserveScroll: true });
    };

    const handleNotificationClick = (notif) => {
        if (!notif.read_at) {
            router.post(route('notifications.read', notif.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (notif.data?.action_url) {
                        router.visit(notif.data.action_url);
                    }
                }
            });
        } else if (notif.data?.action_url) {
            router.visit(notif.data.action_url);
        }
    };

    // Helper icon based on notification type
    const getIcon = (type) => {
        if (type.includes('Alert')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
        if (type.includes('Success')) return <CheckCircle className="w-5 h-5 text-green-500" />;
        return <Info className="w-5 h-5 text-blue-500" />;
    };

    return (
        <DashboardLayout title={t("notifications_title", "Centre de Notifications")}>
            <Head title={t("notifications_title", "Notifications")} />

            <div className="max-w-5xl mx-auto">
                {/* HERO BANNER */}
                <div className="bg-[#0B1A2D] rounded-3xl p-8 mb-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl">
                    {/* Effets de fond */}
                    <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -m-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                            <Bell className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                                {t("notifications_title", "Notifications")}
                            </h1>
                            <p className="text-slate-400 font-medium">
                                Vous avez <strong className="text-white">{notifications.data.filter(n => !n.read_at).length}</strong> alerte(s) nécessitant votre attention
                            </p>
                        </div>
                    </div>

                    {notifications.total > 0 && (
                        <div className="relative z-10">
                            <button
                                onClick={markAllRead}
                                className="group flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                            >
                                <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {t("notifications_mark_all_read", "Tout marquer comme lu")}
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[500px]">
                    {notifications.data.length > 0 ? (
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {notifications.data.map((notif) => {
                                // Dynamic styling based on type
                                let iconBgColor = "bg-blue-100 dark:bg-blue-900/30";
                                let iconColor = "text-blue-600 dark:text-blue-400";

                                if (notif.type.includes('Alert')) {
                                    iconBgColor = "bg-red-100 dark:bg-red-900/30";
                                    iconColor = "text-red-600 dark:text-red-400";
                                } else if (notif.type.includes('Success')) {
                                    iconBgColor = "bg-emerald-100 dark:bg-emerald-900/30";
                                    iconColor = "text-emerald-600 dark:text-emerald-400";
                                }

                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-6 transition-all duration-300 flex items-start flex-col md:flex-row gap-6 group hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.read_at ? 'bg-indigo-50/30 dark:bg-indigo-900/10 relative overflow-hidden' : ''
                                            }`}
                                    >
                                        {/* Liseré indicateur non lu */}
                                        {!notif.read_at && (
                                            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        )}

                                        <div className="flex gap-4 w-full">
                                            <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${iconBgColor}`}>
                                                <div className={iconColor}>
                                                    {getIcon(notif.type)}
                                                </div>
                                            </div>

                                            <div
                                                className={`flex-1 ${notif.data?.action_url ? 'cursor-pointer' : ''}`}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                    <h4 className={`text-lg font-bold pr-8 sm:pr-0 ${!notif.read_at ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'} ${notif.data?.action_url ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors' : ''}`}>
                                                        {notif.data?.title || 'Notification système'}
                                                    </h4>
                                                    <span className="text-xs font-bold text-slate-400 flex-shrink-0 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                                                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>

                                                <p className="text-base text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-3xl">
                                                    {notif.data?.message || 'Contenu de la notification absent.'}
                                                </p>
                                            </div>

                                            <div className="flex items-start pl-2">
                                                {!notif.read_at ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markRead(notif.id);
                                                        }}
                                                        className="p-2 -mr-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                                                        title="Marquer comme lu"
                                                    >
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
                                                    </button>
                                                ) : (
                                                    <div className="p-2 -mr-2 text-slate-300 dark:text-slate-600">
                                                        {React.createElement(CheckCircle, { className: "w-5 h-5", "aria-hidden": "true" })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center relative z-10 shadow-inner border border-slate-100 dark:border-slate-700">
                                    <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                                {t("notifications_empty", "Aucune notification à afficher")}
                            </h3>
                            <p className="text-slate-500 font-medium max-w-sm">
                                {t("notifications_empty_sub", "Vous êtes parfaitement à jour dans vos suivis ! 🎉")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination personnalisée */}
                {notifications.links && notifications.links.length > 3 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            {notifications.links.map((link, k) => (
                                <Link
                                    key={k}
                                    href={link.url}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all ${link.active
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
