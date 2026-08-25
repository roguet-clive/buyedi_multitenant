import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import { CreditCard, Plus, Trash2, Calendar, FileText, User as UserIcon, Tag, CheckCircle2 } from 'lucide-react';
import { motion } from "framer-motion";

export default function Index({ depenses, categories }) {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);

    const handleDelete = (id) => {
        if (confirm(t('confirm_delete', "Êtes-vous sûr de vouloir supprimer cette dépense de la comptabilité ?"))) {
            router.delete(route('depenses.destroy', id), {
                onSuccess: () => { },
                onError: () => alert('Erreur lors de la suppression'),
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <DashboardLayout title={t('expenses_management', "Gestion des Dépenses")}>
            <Head title="Journal des Dépenses" />

            {/* HEROBANNER */}
            <div className="bg-[#0B1A2D] rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                            <CreditCard className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                                {t('expenses', "Journal des Dépenses")}
                            </h1>
                            <p className="text-red-100/80 font-medium flex items-center gap-2">
                                Suivi des décaissements et charges d'exploitation
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex justify-end items-center mb-6">
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    <span>{t('new_expense', "Enregistrer une Dépense")}</span>
                </button>
            </div>

            {/* TABLE CONTENT */}
            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0B1A2D] text-slate-300 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-5 font-semibold rounded-tl-3xl">{t('date', "Date")}</th>
                                <th className="p-5 font-semibold text-white">{t('category', "Catégorie")}</th>
                                <th className="p-5 font-semibold">{t('description', "Description")}</th>
                                <th className="p-5 font-semibold">{t('author', "Auteur")}</th>
                                <th className="p-5 font-semibold text-right text-white">{t('amount', "Montant")}</th>
                                <th className="p-5 font-semibold text-center rounded-tr-3xl">{t('actions', "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {depenses.data.length > 0 ? (
                                depenses.data.map((depense) => (
                                    <tr key={depense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="p-5 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {new Date(depense.date_depense).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider
                                                ${depense.categorie === 'Salaire' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30' :
                                                    depense.categorie === 'Loyer' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30' :
                                                        'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
                                                {depense.categorie === 'Salaire' && <span>👔</span>}
                                                {depense.categorie === 'Loyer' && <span>🏠</span>}
                                                {depense.categorie !== 'Salaire' && depense.categorie !== 'Loyer' && <Tag className="w-3.5 h-3.5 opacity-70" />}
                                                {depense.categorie}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xs truncate" title={depense.description}>
                                                {depense.description || <span className="italic opacity-50">Aucune description</span>}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {depense.user?.name || "Système"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right whitespace-nowrap">
                                            <div className="font-black text-red-600 dark:text-red-400 tracking-tight text-lg">
                                                - {formatCurrency(depense.montant)}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(depense.id)}
                                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                                                    title={t('delete', "Supprimer")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                                <CreditCard className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="font-semibold text-lg">{t('no_expenses', "Aucune dépense enregistrée.")}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Component */}
            {depenses.links && depenses.links.length > 3 && (
                <div className="mt-8 flex justify-center gap-2 flex-wrap">
                    {depenses.links.map((link, i) => (
                        link.url ? (
                            <a
                                key={i}
                                href={link.url}
                                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${link.active
                                        ? 'bg-red-600 text-white shadow-red-500/30'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-4 py-2 rounded-xl text-sm font-bold bg-white/50 dark:bg-slate-800/50 text-slate-400 border border-slate-200/50 dark:border-slate-700/50 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="2xl">
                <div className="bg-white dark:bg-slate-900 border-t-8 border-red-500 rounded-t-2xl">
                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-2xl shadow-sm border border-red-100 dark:border-red-800">
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {t('new_expense', "Nouvelle Dépense")}
                                </h2>
                                <p className="text-slate-500 font-medium text-sm">Sortie de caisse ou paiement fournisseur</p>
                            </div>
                        </div>

                        <ExpenseForm
                            categories={categories}
                            onSuccess={() => setModalOpen(false)}
                            onCancel={() => setModalOpen(false)}
                        />
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

function ExpenseForm({ categories, onSuccess, onCancel }) {
    const { t } = useTranslation();
    const form = useForm({
        categorie: categories && categories.length > 0 ? categories[0] : "",
        montant: "",
        description: "",
        date_depense: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('depenses.store'), {
            onSuccess: () => {
                form.reset();
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Tag className="w-4 h-4 text-slate-400" />
                    {t('category', 'Catégorie de Dépense')}
                </label>
                <select
                    className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-shadow font-semibold text-slate-700 dark:text-slate-200"
                    value={form.data.categorie}
                    onChange={e => form.setData('categorie', e.target.value)}
                >
                    {categories && categories.length > 0 ? (
                        categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))
                    ) : (
                        <option value="Autre">Autre dépense</option>
                    )}
                </select>
            </div>

            <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {t('date', 'Date de Décaissement')}
                </label>
                <input
                    type="date"
                    className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
                    value={form.data.date_depense}
                    onChange={e => form.setData('date_depense', e.target.value)}
                    required
                />
            </div>

            <div className="md:col-span-2 relative mt-2">
                <label className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-2 text-sm font-black text-red-600 z-10">{t('amount', 'MONTANT À SORTIR')}</label>
                <div className="relative border-2 border-red-200 dark:border-red-800/50 rounded-2xl p-1 bg-red-50/50 dark:bg-red-900/10">
                    <input
                        type="number"
                        className="w-full border-none bg-transparent p-4 pl-12 rounded-xl text-3xl font-black text-red-700 dark:text-red-400 focus:ring-0 text-right placeholder:text-red-200"
                        value={form.data.montant}
                        onChange={e => form.setData('montant', e.target.value)}
                        placeholder="0"
                        required
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600/50 font-black text-2xl">XOF</span>
                </div>
                {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5 text-right">{form.errors.montant}</p>}
            </div>

            <div className="md:col-span-2">
                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {t('description', 'Motif / Description détaillée')}
                </label>
                <textarea
                    className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm min-h-[100px]"
                    value={form.data.description}
                    onChange={e => form.setData('description', e.target.value)}
                    placeholder="Justificatif de la dépense..."
                    rows="3"
                ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    {t('cancel', 'Annuler')}
                </button>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {t('save', 'Valider la Dépense')}
                </button>
            </div>
        </form>
    );
}
