import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereFilters({ search, setSearch, annee, setAnnee, anneesDisponibles, onReset }) {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* BARRE DE RECHERCHE */}
            <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("search_arrear_placeholder", "Rechercher un élève, classe...")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
            </div>

            {/* SÉLECTEUR D'ANNÉE SCOLAIRE */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Année Dette :</span>
                </div>
                <select
                    value={annee}
                    onChange={(e) => setAnnee(e.target.value)}
                    className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                >
                    <option value="">Toutes les années</option>
                    {anneesDisponibles.map((yr) => (
                        <option key={yr} value={yr}>
                            Année {yr}
                        </option>
                    ))}
                </select>

                {(search || annee) && (
                    <button
                        onClick={onReset}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={t("reset_filters", "Réinitialiser les filtres")}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
