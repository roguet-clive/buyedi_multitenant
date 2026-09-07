import React from 'react';
import { DollarSign, CheckCircle2, AlertCircle, TrendingUp, Layers, Clock } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereStatsCards({ stats, statut, setStatut, formatFCFA }) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4 mb-8">
            {/* 4 CARTES KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Dettes Antérieures */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                {t("total_arrears", "Total Dettes Saisies")}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatFCFA(stats.total_dettes)}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                {stats.total_count} {t("files_recorded", "dossiers créanciers")}
                            </span>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-600 dark:text-amber-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 2. Total Recouvré */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                {t("recovered_amount", "Total Encaissé")}
                            </span>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {formatFCFA(stats.total_recouvre)}
                            </h3>
                            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 block font-medium">
                                {stats.count_solde} {t("settled_debts", "dossiers soldés")}
                            </span>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 3. Reste à Recouvrer */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                {t("remaining_to_recover", "Reste Dû Global")}
                            </span>
                            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
                                {formatFCFA(stats.total_restant)}
                            </h3>
                            <span className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 block font-medium">
                                {stats.count_non_solde + stats.count_partiel} {t("unsettled_debts", "dossiers restants")}
                            </span>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600 dark:text-rose-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 4. Taux de Recouvrement */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                {t("recovery_rate", "Taux de Recouvrement")}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    {stats.taux_recouvrement}%
                                </h3>
                                <span className="text-xs text-slate-500">objectif 100%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, stats.taux_recouvrement)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl text-indigo-600 dark:text-indigo-400 ml-4 shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTRES RAPIDES PAR STATUT */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                    onClick={() => setStatut('')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        statut === ''
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Tous ({stats.total_count})</span>
                    </div>
                </button>

                <button
                    onClick={() => setStatut('non_solde')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        statut === 'non_solde'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <span>Non soldés ({stats.count_non_solde})</span>
                    </div>
                </button>

                <button
                    onClick={() => setStatut('partiellement_solde')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        statut === 'partiellement_solde'
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Partiellement soldés ({stats.count_partiel})</span>
                    </div>
                </button>

                <button
                    onClick={() => setStatut('solde')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        statut === 'solde'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Soldés ({stats.count_solde})</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
