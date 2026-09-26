import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, Wallet, Plus, CheckCircle2, Printer, X } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

import ArriereStatsCards from './Partials/ArriereStatsCards';
import ArriereFilters from './Partials/ArriereFilters';
import ArriereTable from './Partials/ArriereTable';
import ArriereCreateModal from './Partials/ArriereCreateModal';
import ArriereEditModal from './Partials/ArriereEditModal';
import ArrierePayModal from './Partials/ArrierePayModal';
import ArriereHistoryModal from './Partials/ArriereHistoryModal';
import ArriereDeleteModal from './Partials/ArriereDeleteModal';

export default function Index({ arrieres, filters, stats, anneesDisponibles }) {
    const { t } = useTranslation();
    const { auth, flash } = usePage().props;
    const [showFlashBanner, setShowFlashBanner] = useState(true);

    useEffect(() => {
        if (flash?.dernier_recu_arriere_id) {
            setShowFlashBanner(true);
        }
    }, [flash]);

    const permissions = auth?.permissions || [];
    const isSuperAdmin = auth?.roles?.some(role => role.toLowerCase() === 'super-admin' || role.toLowerCase() === 'superadmin');
    const can = (permission) => isSuperAdmin || permissions.includes(permission);

    // Filters state
    const [search, setSearch] = useState(filters.search || '');
    const [annee, setAnnee] = useState(filters.annee || '');
    const [statut, setStatut] = useState(filters.statut || '');

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [payTarget, setPayTarget] = useState(null);
    const [historyTarget, setHistoryTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Debounced filter dispatch
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('arrieres.index'),
                { search, annee, statut },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 400);
        return () => clearTimeout(timer);
    }, [search, annee, statut]);

    // Format numbers to FCFA
    const formatFCFA = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleResetFilters = () => {
        setSearch('');
        setAnnee('');
        setStatut('');
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        router.delete(route('arrieres.destroy', deleteTarget.id), {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    return (
        <DashboardLayout title={t('previous_arrears', 'Arriérés Scolaires Antérieurs')}>
            <Head title={t('previous_arrears_title', 'Gestion des Arriérés Antérieurs')} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-indigo-950 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <Clock className="w-10 h-10 text-amber-300" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-full text-amber-200 text-sm font-medium mb-3 border border-amber-500/30">
                                <Wallet className="w-4 h-4" />
                                <span>{t("financial_onboarding", "Recouvrement & Dettes Pré-Installation")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("arrears_management", "Arriérés Scolaires Antérieurs")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-2xl font-light leading-relaxed">
                                {t("arrears_desc", "Suivez les dettes de scolarité des élèves issues des années antérieures à l'installation du logiciel. Tout encaissement est automatiquement imputé dans la comptabilité sous la mention 'Arriéré de l'année concernée'.")}
                            </p>
                        </div>
                    </div>

                    {can('ajouter_arrieres') && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-7 py-4 rounded-2xl font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t("new_arrear_btn", "Ajouter un Arriéré")}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* BANDEAU NOTIFICATION QUITTANCE RÉCENTE */}
            {flash?.dernier_recu_arriere_id && showFlashBanner && (
                <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Versement encaissé avec succès</span>
                                <span className="font-mono text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                                    {flash.dernier_recu_arriere_numero}
                                </span>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                {flash.success || "La quittance officielle d'arriéré a été émise et est prête pour l'impression."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={route('arrieres.recu', flash.dernier_recu_arriere_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimer la Quittance</span>
                        </a>
                        <button
                            type="button"
                            onClick={() => setShowFlashBanner(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                            title="Masquer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* 1. STATS CARDS & FILTRES DE STATUT */}
            <ArriereStatsCards
                stats={stats}
                statut={statut}
                setStatut={setStatut}
                formatFCFA={formatFCFA}
            />

            {/* 2. RECHERCHE & FILTRE ANNÉE */}
            <ArriereFilters
                search={search}
                setSearch={setSearch}
                annee={annee}
                setAnnee={setAnnee}
                anneesDisponibles={anneesDisponibles}
                onReset={handleResetFilters}
            />

            {/* 3. TABLEAU DES ARRIÉRÉS */}
            <ArriereTable
                arrieres={arrieres}
                formatFCFA={formatFCFA}
                openPayModal={(item) => setPayTarget(item)}
                openEditModal={(item) => setEditTarget(item)}
                setHistoryTarget={(item) => setHistoryTarget(item)}
                setDeleteTarget={(item) => setDeleteTarget(item)}
                setIsCreateModalOpen={setIsCreateModalOpen}
                can={can}
            />

            {/* 4. MODALES DÉCOUPÉES */}
            <ArriereCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                anneesDisponibles={anneesDisponibles}
            />

            <ArriereEditModal
                target={editTarget}
                onClose={() => setEditTarget(null)}
                anneesDisponibles={anneesDisponibles}
            />

            <ArrierePayModal
                target={payTarget}
                onClose={() => setPayTarget(null)}
                formatFCFA={formatFCFA}
            />

            <ArriereHistoryModal
                target={historyTarget}
                onClose={() => setHistoryTarget(null)}
                formatFCFA={formatFCFA}
                formatDate={formatDate}
            />

            <ArriereDeleteModal
                target={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
            />
        </DashboardLayout>
    );
}
