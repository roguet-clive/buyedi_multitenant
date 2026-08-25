import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Show({ communication }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout title={`${t("communications_message", "Message")} : ${communication.subject}`}>
            <Head title={communication.subject} />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('communications.inbox')}
                        className="group flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold">{t("back", "Retour à la boîte de réception")}</span>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            {t("sent_at", "Reçu le")} <strong className="text-slate-900 dark:text-white">{new Date(communication.created_at).toLocaleDateString()}</strong> à {new Date(communication.created_at).toLocaleTimeString().slice(0, 5)}
                        </span>
                    </div>
                </div>

                {/* Message Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                                    {communication.subject}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 px-4 py-1.5 rounded-full font-bold shadow-sm">
                                        {communication.target_type === 'all' ? t('communications_target_all', '📢 Communication Globale') :
                                            communication.target_type === 'classe' ? t('communications_target_classe', '🏫 Message de Classe') :
                                                communication.target_type === 'role' ? t('communications_target_role', '👥 Message de Groupe/Rôle') : t('communications_target_user', '👤 Message Privé')}
                                    </span>
                                    <span className="bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-sm">
                                        <Users className="w-4 h-4" />
                                        {communication.recipients.length} {t("communications_recipients", "Destinataires concernés")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 min-h-[300px]">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {communication.message}
                        </div>
                    </div>
                </div>

                {/* Recipients List (If Sender or Admin - Optional but good to have styled) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden mb-12">
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 text-lg">
                            <Users className="w-5 h-5 text-slate-400" />
                            {t("communications_recipients_list", "État de lecture des destinataires")}
                        </h3>
                        <span className="text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            Total : {communication.recipients.length}
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4">
                        <table className="w-full text-left">
                            <thead className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 pb-4">{t("name", "Destinataire")}</th>
                                    <th className="px-4 py-3 pb-4">{t("email", "Contact")}</th>
                                    <th className="px-4 py-3 pb-4 text-right">{t("status", "Statut de Lecture")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {communication.recipients.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group rounded-xl">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {(user.nom?.[0] || '') + (user.prenom?.[0] || '')}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {user.nom} {user.prenom}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-500 dark:text-slate-400">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {user.pivot.read_at ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {t("read_at", "Lu le")} {new Date(user.pivot.read_at).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <Clock className="w-4 h-4" />
                                                    {t("communications_unread", "Non lu")}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
