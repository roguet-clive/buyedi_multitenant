import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Send, ArrowLeft, Users, School, User, Shield, BookOpen, UserCheck, AlertCircle } from 'lucide-react';
import Select from 'react-select';
import useTranslation from "@/Hooks/useTranslation";

export default function Create({ roleType = 'admin', roles = [], classes = [], adminRoles = [], teachers = [], parents = [] }) {
    const { t } = useTranslation();

    // Configuration par défaut selon le rôle
    const defaultTargetType = roleType === 'parent' ? 'role' : (roleType === 'teacher' ? 'classe' : 'all');

    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        message: '',
        target_type: defaultTargetType,
        target_id: null
    });

    // Options de ciblage adaptées selon le rôle
    let targetOptions = [];

    if (roleType === 'parent') {
        targetOptions = [
            { value: 'role', label: '🏛️ Administration & Direction', desc: 'Contacter la direction, le secrétariat ou la vie scolaire' },
            { value: 'user', label: '👨‍🏫 Professeur de mon enfant', desc: 'Envoyer un message direct à un enseignant de votre enfant' },
        ];
    } else if (roleType === 'teacher') {
        targetOptions = [
            { value: 'classe', label: '🏫 Mes Classes assignées', desc: 'Diffuser un message aux élèves et parents d\'une de vos classes' },
            { value: 'user', label: '👨‍👩‍👧 Parent d\'un élève', desc: 'Écrire en privé au parent d\'un élève de vos classes' },
            { value: 'role', label: '🏛️ Direction & Administration', desc: 'Contacter la direction ou le secrétariat' },
        ];
    } else {
        // Admin / Direction
        targetOptions = [
            { value: 'all', label: '📢 Tout le monde (Global)', desc: 'Diffuser une annonce à tout l\'établissement' },
            { value: 'role', label: '👥 Par Rôle d\'utilisateurs', desc: 'Tous les profs, tous les parents ou tous les élèves' },
            { value: 'classe', label: '🏫 Par Classe', desc: 'Tous les élèves et parents d\'une classe' },
        ];
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('communications.store'));
    };

    return (
        <DashboardLayout title={t("communications_create", "Rédiger un message")}>
            <Head title={t("communications_create", "Rédiger un message")} />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('communications.index')} className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 text-sm font-semibold mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> {t("back", "Retour aux communications")}
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {t("communications_create", "Rédiger un nouveau message")}
                        </h1>
                    </div>

                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {roleType === 'parent' ? '👨‍👩‍👧 Espace Parent' : roleType === 'teacher' ? '👨‍🏫 Espace Enseignant' : '👑 Espace Direction'}
                    </span>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. CIBLAGE */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                                {t("communications_target_question", "1. À qui s'adresse ce message ?")}
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    {targetOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex flex-col p-4 border rounded-2xl cursor-pointer transition-all ${
                                                data.target_type === option.value
                                                    ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm dark:bg-indigo-950/40 dark:border-indigo-500'
                                                    : 'hover:bg-slate-50 border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="target_type"
                                                    value={option.value}
                                                    checked={data.target_type === option.value}
                                                    onChange={(e) => {
                                                        setData(d => ({ ...d, target_type: e.target.value, target_id: null }));
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-white text-sm">{option.label}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-7 leading-relaxed">
                                                {option.desc}
                                            </p>
                                        </label>
                                    ))}
                                </div>

                                {/* Sélecteurs Conditionnels */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 flex flex-col justify-center border border-slate-100 dark:border-slate-800">
                                    {data.target_type === 'all' && (
                                        <div className="text-center space-y-2">
                                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Diffusion Globale</h4>
                                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                                {t("communications_target_all_desc", "Ce message sera envoyé à tous les utilisateurs du système (élèves, parents, profs et personnel).")}
                                            </p>
                                        </div>
                                    )}

                                    {data.target_type === 'role' && (
                                        <div className="w-full space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                {t("communications_select_role", "Choisir le destinataire")}
                                            </label>
                                            <Select
                                                options={(roleType === 'parent' || roleType === 'teacher' ? adminRoles : roles).map(r => ({
                                                    value: r.id,
                                                    label: r.name === 'super-admin' ? 'Direction Générale (Super-Admin)' :
                                                           r.name === 'directeur' ? 'Direction de l\'Établissement' :
                                                           r.name === 'personnel' ? 'Secrétariat & Vie Scolaire' :
                                                           r.name === 'enseignant' ? 'Tous les Enseignants' :
                                                           r.name === 'parent' ? 'Tous les Parents' :
                                                           r.name === 'eleve' ? 'Tous les Élèves' : r.name
                                                }))}
                                                onChange={(opt) => setData('target_id', opt ? opt.value : null)}
                                                placeholder={t("select", "Sélectionner le service / rôle...")}
                                                className="w-full text-sm text-slate-800"
                                            />
                                            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id}</p>}
                                        </div>
                                    )}

                                    {data.target_type === 'classe' && (
                                        <div className="w-full space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                {t("communications_select_class", "Choisir la classe")}
                                            </label>
                                            <Select
                                                options={classes.map(c => ({ value: c.id, label: c.nom }))}
                                                onChange={(opt) => setData('target_id', opt ? opt.value : null)}
                                                placeholder={t("select", "Sélectionner la classe...")}
                                                className="w-full text-sm text-slate-800"
                                            />
                                            <p className="text-xs text-slate-400 mt-2">
                                                {t("communications_target_class_desc", "Le message sera notifié à tous les élèves et parents de cette classe.")}
                                            </p>
                                            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id}</p>}
                                        </div>
                                    )}

                                    {data.target_type === 'user' && roleType === 'parent' && (
                                        <div className="w-full space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                Choisir le professeur de votre enfant
                                            </label>
                                            <Select
                                                options={teachers}
                                                onChange={(opt) => setData('target_id', opt ? opt.value : null)}
                                                placeholder="Sélectionner le professeur..."
                                                className="w-full text-sm text-slate-800"
                                            />
                                            {teachers.length === 0 && (
                                                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                                                    Aucun enseignant trouvé pour les cours de vos enfants actuellement.
                                                </p>
                                            )}
                                            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id}</p>}
                                        </div>
                                    )}

                                    {data.target_type === 'user' && roleType === 'teacher' && (
                                        <div className="w-full space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                Choisir le parent d'élève
                                            </label>
                                            <Select
                                                options={parents}
                                                onChange={(opt) => setData('target_id', opt ? opt.value : null)}
                                                placeholder="Rechercher un parent d'élève..."
                                                className="w-full text-sm text-slate-800"
                                            />
                                            {parents.length === 0 && (
                                                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                                                    Aucun parent inscrit pour vos classes actuelles.
                                                </p>
                                            )}
                                            {errors.target_id && <p className="text-red-500 text-xs mt-1">{errors.target_id}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. SUJET */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                                {t("communications_subject", "2. Objet du message")}
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base font-semibold px-4 py-3 shadow-inner"
                                placeholder="Ex: Informations sur la sortie scolaire / Demande de rendez-vous"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1.5">{errors.subject}</p>}
                        </div>

                        {/* 3. MESSAGE */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                                {t("communications_message", "3. Corps du message")}
                            </label>
                            <textarea
                                rows="7"
                                className="w-full rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base px-4 py-3 leading-relaxed shadow-inner"
                                placeholder="Rédigez votre message ici avec politesse et clarté..."
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                            ></textarea>
                            {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message}</p>}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Link
                                href={route('communications.index')}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                {t("cancel", "Annuler")}
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
                            >
                                <Send className="w-5 h-5" />
                                {processing ? t("sending", "Envoi en cours...") : t("communications_send", "Envoyer la communication")}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
