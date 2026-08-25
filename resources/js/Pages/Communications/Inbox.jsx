import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, Send, Inbox as InboxIcon, Star, Trash2, Search } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Inbox({ messages }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout title={t("communications_inbox", "Boîte de réception")}>
            <Head title={t("communications_inbox", "Messagerie")} />

            {/* HERO BANNER */}
            <div className="bg-[#0B1A2D] rounded-3xl p-8 mb-6 relative overflow-hidden flex justify-between items-center shadow-2xl">
                {/* Effets de fond */}
                <div className="absolute top-0 right-0 -m-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -m-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                        <InboxIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                            {t("communications_reception", "Messagerie")}
                        </h1>
                        <p className="text-slate-400 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {messages.data.filter(m => !m.read_at).length} message(s) non lu(s)
                        </p>
                    </div>
                </div>

                {/* Search Bar in Banner for Premium Feel */}
                <div className="relative hidden md:block z-10">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t("search", "Rechercher un message...")}
                        className="pl-12 pr-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-80 shadow-inner transition-all"
                    />
                </div>
            </div>

            <div className="flex bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[calc(100vh-14rem)]">

                {/* Sidebar locale Messagerie */}
                <div className="w-72 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-6 hidden md:block bg-slate-50/50 dark:bg-slate-900/50">
                    <Link
                        href={route('communications.create')}
                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white w-full py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all mb-8 active:scale-95 group"
                    >
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        {t("communications_create", "Nouveau Message")}
                    </Link>

                    <nav className="space-y-2">
                        <Link href={route('communications.inbox')} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <InboxIcon className="w-5 h-5" />
                                </div>
                                {t("communications_inbox", "Boîte de réception")}
                            </div>
                            {messages.data.filter(m => !m.read_at).length > 0 && (
                                <span className="bg-emerald-500 text-white text-xs py-1 px-2.5 rounded-full font-bold">
                                    {messages.data.filter(m => !m.read_at).length}
                                </span>
                            )}
                        </Link>

                        <Link href={route('communications.index')} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl font-semibold transition-all group">
                            <div className="p-2 rounded-xl text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                <Send className="w-5 h-5" />
                            </div>
                            {t("communications_sent", "Messages envoyés")}
                        </Link>
                    </nav>
                </div>

                {/* Main Content - Messages List */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {messages.data.length > 0 ? (
                                    messages.data.map((notification) => (
                                        <tr
                                            key={notification.id}
                                            onClick={() => {
                                                if (notification.data.communication_id) {
                                                    router.get(route('communications.show', notification.data.communication_id));
                                                }
                                            }}
                                            className={`cursor-pointer group transition-all duration-200 ${!notification.read_at
                                                    ? 'bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <td className="px-6 py-5 w-16">
                                                <div className="flex items-center justify-center">
                                                    {!notification.read_at ? (
                                                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse"></div>
                                                    ) : (
                                                        <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-5 w-1/4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm shadow-sm">
                                                        AD {/* Initiales statiques pour l'instant, à dynamiser si l'expéditeur est connu */}
                                                    </div>
                                                    <span className={`font-bold ${!notification.read_at ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        Administration
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className={`text-base ${!notification.read_at ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                                                        {notification.data.title}
                                                    </span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-xl pr-8 mt-0.5">
                                                        {notification.data.message}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-400 text-right whitespace-nowrap">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                    <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                                    {t("communications_empty", "Votre boîte de réception est vide")}
                                                </h3>
                                                <p className="text-slate-500 max-w-sm">
                                                    {t("communications_empty_desc", "Les nouveaux messages apparaîtront ici. Profitez du calme !")}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
