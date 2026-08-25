import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Send, ArrowLeft, Users, School, User } from 'lucide-react';
import Select from 'react-select';
import useTranslation from "@/Hooks/useTranslation";

export default function Create({ roles, classes, isParent }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        message: '',
        target_type: isParent ? 'role' : 'all', // Default to role for parents
        target_id: null
    });

    const targetOptions = [
        !isParent && { value: 'all', label: `📢 ${t('communications_target_all', 'Tout le monde (Global)')}` },
        { value: 'role', label: `👥 ${t('communications_target_role', isParent ? 'Administration / Secrétariat' : 'Par Rôle')}` },
        !isParent && { value: 'classe', label: `🏫 ${t('communications_target_classe', 'Par Classe')}` },
    ].filter(Boolean);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('communications.store'));
    };

    return (
        <DashboardLayout title={t("communications_create", "Nouveau Message")}>
            <Head title={t("communications_create", "Rédiger un message")} />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href={route('communications.index')} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
                        <ArrowLeft className="w-4 h-4" /> {t("back", "Retour")}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t("communications_create", "Rédiger un nouveau message")}</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. CIBLAGE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("communications_target_question", "À qui s'adresse ce message ?")}</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    {targetOptions.map((option) => (
                                        <label key={option.value} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${data.target_type === option.value ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="target_type"
                                                value={option.value}
                                                checked={data.target_type === option.value}
                                                onChange={(e) => setData('target_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-gray-700 font-medium">{option.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Sélecteurs Conditionnels */}
                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 flex items-center justify-center">
                                    {data.target_type === 'all' && (
                                        <p className="text-sm text-gray-500 text-center">{t("communications_target_all_desc", "Ce message sera envoyé à tous les utilisateurs du système.")}</p>
                                    )}

                                    {data.target_type === 'role' && (
                                        <div className="w-full">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("communications_select_role", "Choisir le rôle")}</label>
                                            <Select
                                                options={roles.map(r => ({ value: r.id, label: r.name }))}
                                                onChange={(opt) => setData('target_id', opt.value)}
                                                placeholder={t("select", "Sélectionner...")}
                                                className="w-full"
                                            />
                                            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id}</p>}
                                        </div>
                                    )}

                                    {data.target_type === 'classe' && (
                                        <div className="w-full">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("communications_select_class", "Choisir la classe")}</label>
                                            <Select
                                                options={classes.map(c => ({ value: c.id, label: c.nom }))}
                                                onChange={(opt) => setData('target_id', opt.value)}
                                                placeholder={t("select", "Sélectionner...")}
                                                className="w-full"
                                            />
                                            <p className="text-xs text-gray-400 mt-2">{t("communications_target_class_desc", "Le message sera envoyé aux parents des élèves de cette classe.")}</p>
                                            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. SUJET */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("communications_subject", "Objet du message")}</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ex: Réunion Parents-Profs"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                        </div>

                        {/* 3. MESSAGE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("communications_message", "Contenu")}</label>
                            <textarea
                                rows="6"
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="..."
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                            ></textarea>
                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                {processing ? t("sending", "Envoi...") : t("communications_send", "Envoyer le message")}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
