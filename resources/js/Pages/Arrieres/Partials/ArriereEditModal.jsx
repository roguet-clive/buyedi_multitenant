import React, { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Edit3, X, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereEditModal({ target, onClose, anneesDisponibles }) {
    const { t } = useTranslation();

    const { data, setData, put, processing, errors } = useForm({
        nom_eleve: '',
        prenom_eleve: '',
        classe_origine: '',
        annee_scolaire_dette: '',
        montant_total: '',
        observations: '',
    });

    useEffect(() => {
        if (target) {
            setData({
                nom_eleve: target.nom_eleve || '',
                prenom_eleve: target.prenom_eleve || '',
                classe_origine: target.classe_origine || '',
                annee_scolaire_dette: target.annee_scolaire_dette || (anneesDisponibles[0] || '2025-2026'),
                montant_total: target.montant_total || '',
                observations: target.observations || '',
            });
        }
    }, [target]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!target) return;

        put(route('arrieres.update', target.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Transition show={!!target} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
                        <Dialog.Panel className="w-full max-w-5xl xl:max-w-6xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/80 dark:border-slate-800">
                            {/* HEADER */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm shadow-blue-500/10">
                                        <Edit3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-xl font-black text-slate-900 dark:text-white">
                                            {t("edit_arrear", "Modifier le Dossier Débiteur")}
                                        </Dialog.Title>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Modification des informations pour {target?.nom_complet || `${target?.nom_eleve} ${target?.prenom_eleve || ''}`}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                    {/* IDENTITÉ */}
                                    <div className="lg:col-span-6 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                                        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-1">
                                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span>Identité de l'Élève</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("last_name", "Nom de famille")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nom_eleve}
                                                    onChange={(e) => setData('nom_eleve', e.target.value)}
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-semibold"
                                                    required
                                                />
                                                {errors.nom_eleve && <p className="text-red-500 text-xs mt-1">{errors.nom_eleve}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("first_name", "Prénom")}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.prenom_eleve}
                                                    onChange={(e) => setData('prenom_eleve', e.target.value)}
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                {t("former_class", "Classe d'origine")}
                                            </label>
                                            <input
                                                type="text"
                                                value={data.classe_origine}
                                                onChange={(e) => setData('classe_origine', e.target.value)}
                                                className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* DETTE */}
                                    <div className="lg:col-span-6 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-1">
                                                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>Dette & Année</span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("debt_year", "Année scolaire de la dette")} <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.annee_scolaire_dette}
                                                    onChange={(e) => setData('annee_scolaire_dette', e.target.value)}
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                                    required
                                                >
                                                    {anneesDisponibles.map((yr) => (
                                                        <option key={yr} value={yr}>
                                                            Année scolaire {yr}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.annee_scolaire_dette && <p className="text-red-500 text-xs mt-1">{errors.annee_scolaire_dette}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                                    {t("total_debt_amount", "Montant total de l'arriéré (FCFA)")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min={target?.montant_paye || 0}
                                                    value={data.montant_total}
                                                    onChange={(e) => setData('montant_total', e.target.value)}
                                                    className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-black"
                                                    required
                                                />
                                                {errors.montant_total && <p className="text-red-500 text-xs mt-1">{errors.montant_total}</p>}
                                                {target?.montant_paye > 0 && (
                                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                                                        ⚠️ Un montant de {target.montant_paye} FCFA a déjà été encaissé sur cette créance.
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("observations", "Observations")}
                                                </label>
                                                <textarea
                                                    value={data.observations}
                                                    onChange={(e) => setData('observations', e.target.value)}
                                                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white h-20 resize-none"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {t("cancel", "Annuler")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{processing ? t("saving", "Mise à jour...") : t("save_changes", "Enregistrer les modifications")}</span>
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
