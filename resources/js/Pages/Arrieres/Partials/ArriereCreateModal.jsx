import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Plus, X, Users, DollarSign, Search, Loader2, Check } from 'lucide-react';
import axios from 'axios';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereCreateModal({ isOpen, onClose, anneesDisponibles }) {
    const { t } = useTranslation();

    const { data, setData, post, processing, reset, errors } = useForm({
        eleve_id: '',
        nom_eleve: '',
        prenom_eleve: '',
        classe_origine: '',
        annee_scolaire_dette: anneesDisponibles[0] || '2025-2026',
        montant_total: '',
        observations: '',
    });

    // Async student search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setSearching(true);
            axios.get(route('arrieres.search-eleves'), { params: { q: searchQuery } })
                .then(res => {
                    setSearchResults(res.data || []);
                })
                .catch(() => setSearchResults([]))
                .finally(() => setSearching(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setData(prev => ({
            ...prev,
            eleve_id: student.id,
            nom_eleve: student.nom,
            prenom_eleve: student.prenom,
            classe_origine: student.classe || prev.classe_origine,
        }));
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleClearSelection = () => {
        setSelectedStudent(null);
        setData(prev => ({
            ...prev,
            eleve_id: '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('arrieres.store'), {
            onSuccess: () => {
                reset();
                setSelectedStudent(null);
                onClose();
            },
        });
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
                        <Dialog.Panel className="w-full max-w-5xl xl:max-w-6xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/80 dark:border-slate-800">
                            {/* HEADER */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/10">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-xl font-black text-slate-900 dark:text-white">
                                            {t("create_arrear_title", "Enregistrer un Arriéré Antérieur")}
                                        </Dialog.Title>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {t("create_arrear_subtitle", "Saisie des dettes scolaires issues des années antérieures à l'installation de Buyedi")}
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
                                    {/* COLONNE GAUCHE: IDENTITÉ ÉLÈVE (6/12) */}
                                    <div className="lg:col-span-6 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                                        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-1">
                                            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            <span>1. Identité de l'Élève Débiteur</span>
                                        </div>

                                        {/* RECHERCHE ASYNCHRONE D'ÉLÈVE EXISTANT */}
                                        <div className="relative">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Rechercher un élève existant dans la base (optionnel)
                                            </label>
                                            {selectedStudent ? (
                                                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="font-bold text-emerald-900 dark:text-emerald-200">
                                                            {selectedStudent.nom_complet} ({selectedStudent.matricule || 'N/A'})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSelection}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        placeholder="Tapez le nom ou matricule pour rechercher..."
                                                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                                                    />
                                                    {searching && (
                                                        <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                                                    )}

                                                    {/* LISTE DÉROULANTE RÉSULTATS */}
                                                    {searchResults.length > 0 && (
                                                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                                            {searchResults.map((s) => (
                                                                <button
                                                                    key={s.id}
                                                                    type="button"
                                                                    onClick={() => handleSelectStudent(s)}
                                                                    className="w-full text-left p-2.5 hover:bg-amber-50 dark:hover:bg-slate-800 text-xs flex items-center justify-between transition-colors"
                                                                >
                                                                    <span className="font-semibold text-slate-800 dark:text-white">
                                                                        {s.nom_complet}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                                        {s.matricule} {s.classe ? `• ${s.classe}` : ''}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-semibold"
                                                    placeholder="Ex: KOUMBA"
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
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                                                    placeholder="Ex: Jean Paul"
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
                                                className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                                                placeholder="Ex: 3ème A, Terminale S"
                                            />
                                        </div>

                                        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                                            💡 L'élève n'a pas besoin d'être actuellement inscrit pour enregistrer son dossier débiteur.
                                        </div>
                                    </div>

                                    {/* COLONNE DROITE: DETTE & IMPUTATION (6/12) */}
                                    <div className="lg:col-span-6 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-1">
                                                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                <span>2. Paramètres Financiers & Dette</span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("debt_year", "Année scolaire de la dette")} <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.annee_scolaire_dette}
                                                    onChange={(e) => setData('annee_scolaire_dette', e.target.value)}
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
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
                                                    value={data.montant_total}
                                                    onChange={(e) => setData('montant_total', e.target.value)}
                                                    className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-black"
                                                    placeholder="Ex: 150000"
                                                    required
                                                />
                                                {errors.montant_total && <p className="text-red-500 text-xs mt-1">{errors.montant_total}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("observations", "Observations ou motif de la dette")}
                                                </label>
                                                <textarea
                                                    value={data.observations}
                                                    onChange={(e) => setData('observations', e.target.value)}
                                                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white h-20 resize-none"
                                                    placeholder="Ex: Arriéré de scolarité non soldé lors du passage en classe supérieure."
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="text-[11px] text-slate-400 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                                🧾 Un type de frais officiel <strong>"Arriéré de l'année {data.annee_scolaire_dette}"</strong> sera automatiquement lié à chaque encaissement.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BOUTONS D'ACTION */}
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
                                        className="inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>{processing ? t("saving", "Enregistrement...") : t("save_arrear", "Enregistrer l'Arriéré")}</span>
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
