import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { Building2, Save, MapPin, Mail, Phone, Settings, Image as ImageIcon, FileText, CheckCircle2, Database } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Edit({ etablissement }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.roles?.some(role => role.toLowerCase() === 'super-admin' || role.toLowerCase() === 'superadmin');
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nom: etablissement.nom || '',
        sigle: etablissement.sigle || '',
        adresse: etablissement.adresse || '',
        telephone: etablissement.telephone || '',
        email: etablissement.email || '',
        modele_bulletin: etablissement.modele_bulletin || '',
        modele_fiche_etudiant: etablissement.modele_fiche_etudiant || '',
        logo: null,
        _method: 'POST',
    });

    const [logoPreview, setLogoPreview] = useState(etablissement.logo ? `/storage/${etablissement.logo}` : null);

    const submit = (e) => {
        e.preventDefault();
        post(route('etablissement.update'));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        setData('logo', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(etablissement.logo ? `/storage/${etablissement.logo}` : null);
        }
    };

    return (
        <DashboardLayout title={t('settings_school', "Configuration de l'Établissement")}>
            <Head title={t('settings_school', "Établissement")} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-indigo-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block">
                            <Building2 className="w-10 h-10 text-blue-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-sm font-medium mb-3 border border-white/10 shadow-sm">
                                <Settings className="w-4 h-4" />
                                <span>{t("global_settings", "Paramètres Globaux")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight drop-shadow-sm">
                                {t("school_identity", "Identité de l'École")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {t("school_identity_desc", "Configurez les informations fondamentales de votre établissement. Ces données apparaîtront sur les formulaires, bulletins et documents officiels.")}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={submit}
                        disabled={processing}
                        className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group w-full md:w-auto mt-4 md:mt-0"
                    >
                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {processing ? t("saving", "Enregistrement...") : t("save_changes", "Enregistrer les modifications")}
                    </button>
                </div>
            </div>

            <form onSubmit={submit} className="relative z-10 -mt-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                    {/* COLONNE GAUCHE = Infos Principales & Logo */}
                    <div className="xl:col-span-7 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                        {t("general_informations", "Informations Générales")}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            {t("school_name", "Nom de l'établissement")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nom}
                                            onChange={(e) => setData('nom', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Ex: Complexe Scolaire d'Excellence"
                                            required
                                        />
                                        {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            {t("acronym", "Sigle")}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sigle}
                                            onChange={(e) => setData('sigle', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                                            placeholder="Ex: CSE"
                                        />
                                        {errors.sigle && <p className="text-red-500 text-sm mt-1">{errors.sigle}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                        {t("school_logo", "Logo Officiel")}
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group">
                                        <div className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo de l'école" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 w-full relative">
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                {t("choose_image", "Choisir une image")}
                                            </label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                                                {t("logo_help_text", "Formats recommandés: PNG, JPG ou SVG. Transparence conseillée. Taille maximale: 2MB. Dimensions idéales: 500x500px.")}
                                            </p>
                                        </div>
                                    </div>
                                    {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Modèles de Documents */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                        {t("documents_templates", "Modèles de Documents")}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        {t("report_card_template", "Modèle de Bulletin")}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.modele_bulletin}
                                        onChange={(e) => setData('modele_bulletin', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        placeholder="Ex: classique, moderne"
                                    />
                                    {errors.modele_bulletin && <p className="text-red-500 text-sm mt-1">{errors.modele_bulletin}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        {t("student_card_template", "Modèle Fiche Étudiant")}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.modele_fiche_etudiant}
                                        onChange={(e) => setData('modele_fiche_etudiant', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                                        placeholder="Ex: standard"
                                    />
                                    {errors.modele_fiche_etudiant && <p className="text-red-500 text-sm mt-1">{errors.modele_fiche_etudiant}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Module Sauvegarde Base de Données (Super-Admin uniquement) */}
                        {isSuperAdmin && (
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl border border-slate-800 p-8">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                                {t("superadmin_privilege", "Privilège Super-Admin")}
                                            </span>
                                            <h3 className="text-xl font-bold text-white">
                                                {t("database_backup_title", "Sauvegarde de la Base de Données")}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                                    {t("database_backup_card_desc", "Créez et gérez des instantanés complets de la base de données SQL pour sécuriser les données scolaires, élèves, notes et écritures financières.")}
                                </p>
                                <Link
                                    href={route('backups.index')}
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 text-sm"
                                >
                                    <Database className="w-4 h-4" />
                                    <span>{t("manage_backups_btn", "Accéder au Centre de Sauvegardes BD")}</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* COLONNE DROITE = Coordonnées */}
                    <div className="xl:col-span-5 space-y-8">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden sticky top-8">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                        {t("school_contacts", "Coordonnées")}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {t("email", "Adresse Email")}
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="contact@ecole.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {t("phone", "Téléphone Officiel")}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.telephone}
                                        onChange={(e) => setData('telephone', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="+241 XX XX XX XX"
                                    />
                                    {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {t("address", "Adresse Physique")}
                                    </label>
                                    <textarea
                                        value={data.adresse}
                                        onChange={(e) => setData('adresse', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none h-32"
                                        placeholder="Avenue Libreville, Quartier..."
                                    ></textarea>
                                    {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>}
                                </div>

                                {/* Sucess Message */}
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-2"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 !mt-8">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <p className="font-semibold text-sm">{t("settings_saved_successfully", "Paramètres enregistrés avec succès !")}</p>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
