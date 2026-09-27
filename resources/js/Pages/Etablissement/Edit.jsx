import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import {
    Building2, Save, MapPin, Mail, Phone, Settings, Image as ImageIcon,
    FileText, CheckCircle2, Database, ShieldAlert, Sparkles, Key, Check,
    X, Shield, Lock, Layers, Zap, Info, CalendarDays, UploadCloud,
    CreditCard, Clock, Brain, Users, CheckCircle
} from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Edit({ etablissement, modulesCatalogue = {}, formulesLicence = {} }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.isSuperAdmin ?? (auth?.roles?.some(role => role.toLowerCase() === 'super-admin' || role.toLowerCase() === 'superadmin') || auth?.permissions?.includes('voir_sauvegardes'));

    // Formulaire 1 : Identité & Paramètres Généraux de l'Établissement
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nom: etablissement.nom || '',
        sigle: etablissement.sigle || '',
        adresse: etablissement.adresse || '',
        ville: etablissement.ville || 'Libreville',
        telephone: etablissement.telephone || '',
        email: etablissement.email || '',
        logo: null,
        _method: 'POST',
    });

    // Formulaire 2 : Gestion des Licences & Modules (Exclusivité Super-Admin)
    const allModuleKeys = Object.keys(modulesCatalogue);
    const initialModules = Array.isArray(etablissement.modules_actifs)
        ? etablissement.modules_actifs
        : allModuleKeys;

    const {
        data: moduleData,
        setData: setModuleData,
        post: postModules,
        processing: moduleProcessing,
        recentlySuccessful: moduleRecentlySuccessful,
    } = useForm({
        formule_licence: etablissement.formule_licence || 'elite',
        modules_actifs: initialModules,
    });

    const [logoPreview, setLogoPreview] = useState(etablissement.logo ? `/storage/${etablissement.logo}` : null);

    const submit = (e) => {
        e.preventDefault();
        post(route('etablissement.update'));
    };

    const submitModules = (e) => {
        e.preventDefault();
        postModules(route('etablissement.update-modules'), {
            preserveScroll: true,
        });
    };

    const handleFormuleSelect = (formuleKey) => {
        const selectedFormule = formulesLicence[formuleKey];
        if (selectedFormule && Array.isArray(selectedFormule.modules)) {
            setModuleData({
                formule_licence: formuleKey,
                modules_actifs: [...selectedFormule.modules],
            });
        } else {
            setModuleData(prev => ({
                ...prev,
                formule_licence: formuleKey,
            }));
        }
    };

    const handleToggleModule = (moduleId) => {
        const currentList = moduleData.modules_actifs || [];
        const isCurrentlyActive = currentList.includes(moduleId);
        const updatedList = isCurrentlyActive
            ? currentList.filter(id => id !== moduleId)
            : [...currentList, moduleId];

        setModuleData({
            formule_licence: 'personnalise',
            modules_actifs: updatedList,
        });
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

    const renderModuleIcon = (iconName) => {
        const props = { className: "w-5 h-5" };
        switch (iconName) {
            case 'FileText': return <FileText {...props} />;
            case 'Mail': return <Mail {...props} />;
            case 'Users': return <Users {...props} />;
            case 'CalendarDays': return <CalendarDays {...props} />;
            case 'UploadCloud': return <UploadCloud {...props} />;
            case 'CreditCard': return <CreditCard {...props} />;
            case 'Clock': return <Clock {...props} />;
            case 'Brain': return <Brain {...props} />;
            default: return <Layers {...props} />;
        }
    };

    const getCategoryBadgeClass = (category) => {
        switch (category) {
            case 'Pédagogie':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'Finances':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'Administration':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            case 'Communication':
                return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
            case 'Performance':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const modulesEntries = Object.entries(modulesCatalogue);
    const activeCount = moduleData.modules_actifs?.length || 0;
    const totalCount = modulesEntries.length;

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

            {/* 👑 SECTION 1 : GESTION DES LICENCES ET MODULES SOUSCRITS (SUPER-ADMIN ONLY) */}
            {isSuperAdmin ? (
                <div className="mb-10 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* En-tête Super-Admin */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-indigo-500/20">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/30 text-white shrink-0">
                                <Key className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Réservé au Super-Administrateur Buyedi</span>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                                    Formule d'Abonnement & Modules Souscrits
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                                        {activeCount} / {totalCount} Actifs
                                    </span>
                                </h2>
                                <p className="text-sm text-slate-300 mt-1 max-w-2xl font-light leading-relaxed">
                                    Activez ou restreignez les fonctionnalités selon le contrat de licence de cet établissement. 
                                    Les modules désactivés sont <strong className="text-white font-semibold">immédiatement masqués du menu et interdits d'accès</strong> pour l'ensemble des utilisateurs de l'école.
                                </p>
                            </div>
                        </div>

                        {/* Bouton de sauvegarde dédié pour la licence */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 self-end lg:self-center">
                            <Transition
                                show={moduleRecentlySuccessful}
                                enter="transition ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="transition ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                                    <CheckCircle className="w-4 h-4" /> Licence appliquée !
                                </span>
                            </Transition>

                            <button
                                type="button"
                                onClick={submitModules}
                                disabled={moduleProcessing}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                {moduleProcessing ? "Application..." : "Appliquer la Licence"}
                            </button>
                        </div>
                    </div>

                    {/* 1. Sélecteur de formules pré-configurées */}
                    <div className="mt-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            1. Choisissez un package prédéfini ou personnalisez sur mesure :
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            {Object.entries(formulesLicence).map(([fKey, formule]) => {
                                const isSelected = moduleData.formule_licence === fKey;
                                return (
                                    <button
                                        key={fKey}
                                        type="button"
                                        onClick={() => handleFormuleSelect(fKey)}
                                        className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                                            isSelected
                                                ? 'bg-indigo-600/20 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-black text-white flex items-center gap-2">
                                                {fKey === 'starter' && '🚀'}
                                                {fKey === 'pro' && '🎓'}
                                                {fKey === 'elite' && '👑'}
                                                {fKey === 'personnalise' && '⚙️'}
                                                {formule.nom.split('(')[0].trim()}
                                            </span>
                                            {isSelected && (
                                                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            {formule.description}
                                        </p>
                                        <div className="mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-medium text-indigo-300">
                                            {fKey === 'starter' && '0 module optionnel'}
                                            {fKey === 'pro' && '3 modules inclus'}
                                            {fKey === 'elite' && 'Tous les 8 modules'}
                                            {fKey === 'personnalise' && `${activeCount} module(s) sélectionné(s)`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Grille des modules applicatifs avec interrupteurs individuels */}
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                2. Contrôle détaillé des modules ({activeCount} actifs sur {totalCount}) :
                            </label>
                            <span className="text-xs text-slate-400">
                                Cliquez sur un module pour l'activer ou le désactiver
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {modulesEntries.map(([mKey, module]) => {
                                const isActive = moduleData.modules_actifs?.includes(mKey);
                                return (
                                    <div
                                        key={mKey}
                                        onClick={() => handleToggleModule(mKey)}
                                        className={`group p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                                            isActive
                                                ? 'bg-slate-800/80 border-emerald-500/40 shadow-md shadow-emerald-500/5 hover:border-emerald-400'
                                                : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                                        }`}
                                    >
                                        <div>
                                            {/* Haut de carte */}
                                            <div className="flex items-start justify-between gap-3 mb-2.5">
                                                <div className={`p-2.5 rounded-xl border ${
                                                    isActive
                                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                        : 'bg-slate-800 border-slate-700 text-slate-500'
                                                }`}>
                                                    {renderModuleIcon(module.icon)}
                                                </div>

                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(module.categorie)}`}>
                                                    {module.categorie}
                                                </span>
                                            </div>

                                            {/* Titre & Description */}
                                            <h4 className={`text-sm font-bold leading-snug mb-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                {module.nom}
                                            </h4>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                                                {module.description}
                                            </p>
                                        </div>

                                        {/* Interrupteur Switch */}
                                        <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between">
                                            <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                                                isActive ? 'text-emerald-400' : 'text-slate-500'
                                            }`}>
                                                {isActive ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>Module Activé</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-3.5 h-3.5" />
                                                        <span>Désactivé</span>
                                                    </>
                                                )}
                                            </span>

                                            {/* Switch toggle visual */}
                                            <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${
                                                isActive ? 'bg-emerald-500' : 'bg-slate-700'
                                            }`}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                                                    isActive ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                /* Vue informative épurée pour les administrateurs d'établissement réguliers */
                <div className="mb-8 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Licence d'utilisation active
                                </span>
                                <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                    {etablissement.formule_licence ? etablissement.formule_licence.toUpperCase() : 'STANDARD'}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                                {activeCount} modules déverrouillés pour votre établissement
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Pour souscrire à des modules complémentaires (ex: Paie RH, Alertes SMS, etc.), contactez le support technique Buyedi.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-w-md">
                        {moduleData.modules_actifs?.map(modKey => {
                            const mod = modulesCatalogue[modKey];
                            if (!mod) return null;
                            return (
                                <span key={modKey} className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                                    {mod.nom}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* FORMULAIRE PRINCIPAL : PARAMÈTRES GÉNÉRAUX & COORDONNÉES */}
            <form onSubmit={submit} className="relative z-10">
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
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none h-24"
                                        placeholder="Boulevard Triomphal, Quartier..."
                                    ></textarea>
                                    {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {t("city", "Ville / Localité")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ville}
                                        onChange={(e) => setData('ville', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Ex: Libreville"
                                        required
                                    />
                                    {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville}</p>}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {t("city_help", "Utilisée pour la mention « Fait à [Ville], le ... » sur les certificats et attestations.")}
                                    </p>
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
