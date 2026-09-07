import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Transition, Dialog } from '@headlessui/react';
import {
    Database,
    Download,
    Trash2,
    RotateCcw,
    UploadCloud,
    Plus,
    CheckCircle2,
    AlertTriangle,
    HardDrive,
    Layers,
    Clock,
    FileCode2,
    Archive,
    ShieldAlert,
    RefreshCw,
    X,
    FileText,
    Server,
    ShieldCheck
} from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Index({ databaseInfo, backups }) {
    const { t } = useTranslation();

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showTablesModal, setShowTablesModal] = useState(false);

    // Form for creating backup
    const { data: createData, setData: setCreateData, post: postCreate, processing: creatingBackup } = useForm({
        compress: true,
    });

    // Form for uploading backup
    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploadingBackup, errors: uploadErrors, reset: resetUpload } = useForm({
        backup_file: null,
    });

    const handleCreateBackup = (e) => {
        e.preventDefault();
        postCreate(route('backups.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleUploadBackup = (e) => {
        e.preventDefault();
        postUpload(route('backups.upload'), {
            onSuccess: () => {
                setIsUploadModalOpen(false);
                resetUpload();
            },
        });
    };

    const confirmRestore = () => {
        if (!restoreTarget) return;
        router.post(route('backups.restore', restoreTarget.filename), {}, {
            onFinish: () => setRestoreTarget(null),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('backups.destroy', deleteTarget.filename), {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <DashboardLayout title={t('database_backups', 'Sauvegardes de la Base de Données')}>
            <Head title={t('database_backups', 'Sauvegardes BD - Super-Admin')} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-[#0E243F] to-indigo-950 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <Database className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-emerald-300 text-sm font-medium mb-3 border border-emerald-500/30">
                                <ShieldCheck className="w-4 h-4" />
                                <span>{t("superadmin_module", "Module Super-Administrateur")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("database_backup_title", "Sauvegarde de la Base de Données")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-2xl font-light leading-relaxed">
                                {t("database_backup_desc", "Générez, téléchargez et restaurez les instantanés de sécurité complets de la base de données. Ces sauvegardes préservent l'ensemble des données scolaires, élèves, notes et finances.")}
                            </p>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold border border-white/15 backdrop-blur-md transition-all active:scale-95 text-sm"
                        >
                            <UploadCloud className="w-4 h-4 text-blue-300" />
                            <span>{t("upload_backup", "Importer un fichier")}</span>
                        </button>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95 text-sm"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t("create_backup_btn", "Créer une Sauvegarde")}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* DATABASE OVERVIEW STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Stat 1: Database Name & Engine */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            {t("active_database", "Base de Données")}
                        </p>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[170px]" title={databaseInfo.database}>
                            {databaseInfo.database || 'buyedi'}
                        </h4>
                        <span className="inline-block mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                            Moteur : {databaseInfo.driver}
                        </span>
                    </div>
                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <Server className="w-6 h-6" />
                    </div>
                </div>

                {/* Stat 2: Tables Count */}
                <div 
                    onClick={() => setShowTablesModal(true)}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                >
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            {t("total_tables", "Tables Système")}
                        </p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                            {databaseInfo.total_tables}
                        </h4>
                        <span className="inline-block mt-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                            {t("view_details", "Voir les détails →")}
                        </span>
                    </div>
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                        <Layers className="w-6 h-6" />
                    </div>
                </div>

                {/* Stat 3: Estimated Size */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            {t("estimated_size", "Taille Estimée")}
                        </p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                            {databaseInfo.total_size_mb} MB
                        </h4>
                        <span className="inline-block mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Données + Index
                        </span>
                    </div>
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 rounded-2xl text-amber-600 dark:text-amber-400">
                        <HardDrive className="w-6 h-6" />
                    </div>
                </div>

                {/* Stat 4: Last Backup Date */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                            {t("last_backup", "Dernière Sauvegarde")}
                        </p>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {databaseInfo.last_backup ? formatDate(databaseInfo.last_backup) : t("no_backup_yet", "Aucune")}
                        </h4>
                        <span className="inline-block mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {backups.length} archive(s) dispo.
                        </span>
                    </div>
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* BACKUPS LIST TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-8">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Archive className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {t("available_backups", "Archives de Sauvegarde Disponibles")}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t("backups_location_hint", "Fichiers stockés de manière sécurisée dans le stockage privé du serveur.")}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t("refresh", "Actualiser")}</span>
                    </button>
                </div>

                {backups.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Database className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                            {t("no_backups_found", "Aucune sauvegarde enregistrée")}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                            {t("create_first_backup_help", "Il n'y a pas encore d'archive de sauvegarde. Créez un premier instantané pour sécuriser les données de l'établissement.")}
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t("create_first_backup", "Lancer la première sauvegarde")}</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="py-4 px-6">{t("file_name", "Nom du fichier")}</th>
                                    <th className="py-4 px-6">{t("format", "Format")}</th>
                                    <th className="py-4 px-6">{t("size", "Taille")}</th>
                                    <th className="py-4 px-6">{t("created_at", "Date de Création")}</th>
                                    <th className="py-4 px-6 text-right">{t("actions", "Actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {backups.map((backup) => (
                                    <tr key={backup.filename} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                                                    {backup.is_compressed ? (
                                                        <Archive className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <FileCode2 className="w-4 h-4 text-blue-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-900 dark:text-white font-mono text-xs">
                                                        {backup.filename}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {backup.is_compressed ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                    SQL.GZ (Compressé)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                    SQL Brut
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                                            {backup.size}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                                            {formatDate(backup.created_at)}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Download Button */}
                                                <a
                                                    href={route('backups.download', backup.filename)}
                                                    className="p-2 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 rounded-xl transition-all"
                                                    title={t("download", "Télécharger")}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>

                                                {/* Restore Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setRestoreTarget(backup)}
                                                    className="p-2 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-100 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-amber-950/40 rounded-xl transition-all"
                                                    title={t("restore", "Restaurer cette sauvegarde")}
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(backup)}
                                                    className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 rounded-xl transition-all"
                                                    title={t("delete", "Supprimer")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL HORIZONTAL LARGE: CREATE BACKUP */}
            <Transition show={isCreateModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
                    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 md:p-6">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                                {t("create_backup_title", "Nouvelle Sauvegarde de la Base")}
                                            </Dialog.Title>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {t("create_backup_modal_desc", "Instantané complet de toutes les tables, structures et écritures comptables.")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateBackup} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Carte Option GZIP */}
                                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={createData.compress}
                                                    onChange={(e) => setCreateData('compress', e.target.checked)}
                                                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 dark:bg-slate-800"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                                                        {t("compress_gzip", "Compression GZIP (.sql.gz)")}
                                                    </span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                        {t("compress_gzip_help", "Recommandé : réduit la taille du fichier jusqu'à 85% pour économiser l'espace.")}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Carte Résumé Info */}
                                        <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                                            <span className="font-bold uppercase tracking-wider block">🛡️ Sécurité & Portabilité</span>
                                            <p className="leading-relaxed">
                                                Le fichier généré sera téléchargeable et stocké en toute sécurité dans l'espace réservé super-administrateur.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            {t("cancel", "Annuler")}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={creatingBackup}
                                            className="inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                                        >
                                            {creatingBackup ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span>{t("exporting", "Génération en cours...")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>{t("start_backup", "Lancer la Sauvegarde")}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* MODAL HORIZONTAL LARGE: UPLOAD BACKUP */}
            <Transition show={isUploadModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsUploadModalOpen(false)}>
                    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 md:p-6">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-2xl text-blue-600 dark:text-blue-400">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                                {t("upload_backup_title", "Importer un Fichier SQL")}
                                            </Dialog.Title>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Ajouter une archive existante (.sql ou .sql.gz) dans le répertoire des sauvegardes
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleUploadBackup} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            {t("select_backup_file", "Fichier de sauvegarde (.sql ou .sql.gz)")}
                                        </label>
                                        <input
                                            type="file"
                                            accept=".sql,.gz"
                                            onChange={(e) => setUploadData('backup_file', e.target.files[0])}
                                            className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950/50 dark:file:text-blue-300 hover:file:bg-blue-100 border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                                            required
                                        />
                                        {uploadErrors.backup_file && (
                                            <p className="text-red-500 text-xs mt-1">{uploadErrors.backup_file}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsUploadModalOpen(false)}
                                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            {t("cancel", "Annuler")}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploadingBackup || !uploadData.backup_file}
                                            className="inline-flex items-center gap-2 px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                                        >
                                            {uploadingBackup ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span>{t("uploading", "Envoi en cours...")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-4 h-4" />
                                                    <span>{t("import_btn", "Importer le fichier")}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* MODAL: CONFIRM RESTORE */}
            <Transition show={!!restoreTarget} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setRestoreTarget(null)}>
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-amber-200 dark:border-amber-900/50">
                                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl">
                                        <AlertTriangle className="w-7 h-7" />
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-black text-slate-900 dark:text-white">
                                        {t("confirm_restore_title", "Confirmer la Restauration")}
                                    </Dialog.Title>
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 mb-6 text-sm text-amber-800 dark:text-amber-300">
                                    <p className="font-bold mb-1">⚠️ {t("danger_warning", "Attention action irréversible :")}</p>
                                    <p className="leading-relaxed">
                                        {t("restore_warning_text", "La restauration de la sauvegarde va écraser les données actuelles de la base avec celles contenues dans l'archive sélectionnée :")}
                                    </p>
                                    <div className="mt-2 font-mono font-bold text-xs bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg break-all">
                                        {restoreTarget?.filename}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRestoreTarget(null)}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {t("cancel", "Annuler")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmRestore}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-600/20 transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>{t("confirm_restore_btn", "Oui, Restaurer la BD")}</span>
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* MODAL: CONFIRM DELETE */}
            <Transition show={!!deleteTarget} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setDeleteTarget(null)}>
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-red-200 dark:border-red-900/50">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                                    <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-2xl">
                                        <Trash2 className="w-6 h-6" />
                                    </div>
                                    <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                        {t("confirm_delete_title", "Supprimer la Sauvegarde")}
                                    </Dialog.Title>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    {t("confirm_delete_text", "Êtes-vous sûr de vouloir supprimer définitivement le fichier de sauvegarde")} <strong className="font-mono text-xs">{deleteTarget?.filename}</strong> ?
                                </p>

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(null)}
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {t("cancel", "Annuler")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-600/20 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{t("delete_btn", "Supprimer")}</span>
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* MODAL: TABLES EXPLORER */}
            <Transition show={showTablesModal} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowTablesModal(false)}>
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" />
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950 rounded-xl text-indigo-600 dark:text-indigo-400">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                                {t("tables_explorer", "Explorateur des Tables")}
                                            </Dialog.Title>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {databaseInfo.total_tables} {t("tables_in_db", "tables détectées dans la base")}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowTablesModal(false)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 sticky top-0">
                                            <tr>
                                                <th className="py-3 px-4">Table</th>
                                                <th className="py-3 px-4">Lignes (est.)</th>
                                                <th className="py-3 px-4">Taille</th>
                                                <th className="py-3 px-4">Moteur</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                                            {(databaseInfo.tables || []).map((t) => (
                                                <tr key={t.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                    <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{t.name}</td>
                                                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{t.rows.toLocaleString()}</td>
                                                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{t.size}</td>
                                                    <td className="py-2.5 px-4 text-slate-400">{t.engine}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setShowTablesModal(false)}
                                        className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors"
                                    >
                                        {t("close", "Fermer")}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </DashboardLayout>
    );
}
