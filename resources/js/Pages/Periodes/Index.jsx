import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import useTranslation from '@/Hooks/useTranslation';
import { CalendarRange, Plus, Pencil, Trash2, Clock, CheckCircle2, AlertTriangle, Globe } from 'lucide-react';

const TYPE_CONFIG = {
    global: { label: 'Tous les Cycles', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', dot: 'bg-indigo-500' },
    primaire: { label: 'Maternelle & Primaire', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
    secondaire: { label: 'Secondaire', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500' },
};

function PeriodeForm({ periode, onClose }) {
    const { t } = useTranslation();
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom: periode?.nom || '',
        code: periode?.code || '',
        date_debut: periode?.date_debut ? periode.date_debut.substring(0, 10) : '',
        date_fin: periode?.date_fin ? periode.date_fin.substring(0, 10) : '',
        actif: periode ? Boolean(periode.actif) : false,
        type: periode?.type || 'global',
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { onClose(); reset(); } };
        if (periode) {
            put(route('periodes.update', periode.id), opts);
        } else {
            post(route('periodes.store'), opts);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className={`p-3 rounded-2xl ${periode ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                    {periode ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {periode ? t('edit_periode', 'Modifier la Période') : t('add_periode', 'Nouvelle Période')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {periode ? "Modifiez les paramètres de cette période évaluative." : "Définissez une nouvelle période pour l'année scolaire active."}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t('period_name', 'Nom de la période')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.nom}
                            onChange={e => setData('nom', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder="Ex: 1er Trimestre"
                            required
                        />
                        {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t('period_code', 'Code')}
                        </label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={e => setData('code', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                            placeholder="Ex: T1"
                        />
                        {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Globe className="w-4 h-4 inline mr-1 text-slate-400" />
                        {t('applicable_cycle', 'Cycle Applicable')} <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.type}
                        onChange={e => setData('type', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                    >
                        <option value="global">🌐 Tous les cycles (Global)</option>
                        <option value="primaire">🌸 Maternelle &amp; Primaire</option>
                        <option value="secondaire">🎓 Secondaire</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t('start_date', 'Date de début')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.date_debut}
                            onChange={e => setData('date_debut', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                        {errors.date_debut && <p className="text-red-500 text-sm mt-1">{errors.date_debut}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {t('end_date', 'Date de fin')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.date_fin}
                            onChange={e => setData('date_fin', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            required
                        />
                        {errors.date_fin && <p className="text-red-500 text-sm mt-1">{errors.date_fin}</p>}
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={data.actif}
                                onChange={e => setData('actif', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{t('active_period', 'Période Active')}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Les notes et évaluations seront enregistrées dans cette période</p>
                        </div>
                    </label>
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" onClick={onClose} disabled={processing}
                        className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors">
                        {t('cancel', 'Annuler')}
                    </button>
                    <button type="submit" disabled={processing}
                        className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 ${periode ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'}`}>
                        {processing ? <Clock className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {periode ? t('update', 'Mettre à jour') : t('create', 'Créer la période')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ periodes, anneeScolaire, can }) {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [editingPeriode, setEditingPeriode] = useState(null);

    const openModal = (periode = null) => { setEditingPeriode(periode); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditingPeriode(null); };

    const handleDelete = (periode) => {
        if (confirm(t('confirm_delete_periode', 'Voulez-vous vraiment supprimer cette période ?'))) {
            router.delete(route('periodes.destroy', periode.id), { preserveScroll: true });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <DashboardLayout title={t('periodes_mgmt', 'Gestion des Périodes')}>
            <Head title={t('periodes', 'Périodes')} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-slate-800 to-blue-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <CalendarRange className="w-10 h-10 text-blue-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-sm font-medium mb-3 border border-white/10">
                                <Clock className="w-4 h-4" />
                                <span>{anneeScolaire ? `Année : ${anneeScolaire.nom}` : t('no_active_year', 'Aucune année active')}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t('periodes_title', 'Périodes Évaluatives')}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {t('periodes_desc', 'Définissez les trimestres, semestres ou séquences qui structurent l\'agenda pédagogique de votre établissement.')}
                            </p>
                        </div>
                    </div>

                    {can?.create_periodes && anneeScolaire && (
                        <button onClick={() => openModal()}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 group w-full md:w-auto mt-4 md:mt-0">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            {t('new_periode', 'Nouvelle Période')}
                        </button>
                    )}
                </div>
            </div>

            {/* ALERTE si pas d'année active */}
            {!anneeScolaire && (
                <div className="flex items-center gap-3 p-5 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <p className="font-medium">{t('no_active_year_warning', "Aucune année scolaire n'est active. Veuillez d'abord activer une année scolaire pour gérer les périodes.")}</p>
                </div>
            )}

            {/* TABLEAU PREMIUM */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative z-10 -mt-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B1A2D] text-white">
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Nom & Code</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Cycle</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Calendrier</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase text-center">Statut</th>
                                {(can?.edit_periodes || can?.delete_periodes) && (
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase text-center rounded-tr-3xl w-36">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {periodes.length > 0 ? (
                                periodes.map((periode) => {
                                    const typeInfo = TYPE_CONFIG[periode.type] || TYPE_CONFIG.global;
                                    return (
                                        <tr key={periode.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2.5 rounded-xl ${periode.actif ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                        <CalendarRange className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{periode.nom}</p>
                                                        {periode.code && (
                                                            <span className="inline-block mt-0.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{periode.code}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                                                    <span className={`w-2 h-2 rounded-full ${typeInfo.dot}`}></span>
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="font-medium">{formatDate(periode.date_debut)}</span>
                                                    <span className="text-slate-400 mx-2">→</span>
                                                    <span className="font-medium">{formatDate(periode.date_fin)}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                {periode.actif ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-xs font-bold">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-semibold">
                                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            {(can?.edit_periodes || can?.delete_periodes) && (
                                                <td className="py-5 px-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {can?.edit_periodes && (
                                                            <button onClick={() => openModal(periode)}
                                                                className="p-2.5 rounded-full text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                                                title={t('edit', 'Modifier')}>
                                                                <Pencil className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {can?.delete_periodes && (
                                                            <button onClick={() => handleDelete(periode)}
                                                                className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                title={t('delete', 'Supprimer')}>
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={(can?.edit_periodes || can?.delete_periodes) ? 5 : 4} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <CalendarRange className="w-16 h-16 mb-4 opacity-40" />
                                            <p className="text-lg font-medium">{t('no_periods', 'Aucune période définie')}</p>
                                            <p className="text-sm mt-1">{t('no_periods_hint', 'Commencez par définir le premier trimestre ou semestre.')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <PeriodeForm
                    key={editingPeriode ? `edit-${editingPeriode.id}` : 'new'}
                    periode={editingPeriode}
                    onClose={closeModal}
                />
            </Modal>
        </DashboardLayout>
    );
}
