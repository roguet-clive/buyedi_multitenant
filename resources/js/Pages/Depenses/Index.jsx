import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import { CreditCard, Plus, Trash2, Calendar, FileText, User as UserIcon, Tag, CheckCircle2, Search, Filter, Sparkles, X } from 'lucide-react';

export default function Index({ depenses, categories = [], filters = {}, stats = {} }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(filters.categorie || 'all');

    const isSuperAdmin = auth?.roles?.includes('super-admin');
    const can = (perm) => isSuperAdmin || (auth?.permissions && auth.permissions.includes(perm));

    const handleDelete = (id) => {
        if (confirm(t('confirm_delete', "Êtes-vous sûr de vouloir supprimer cette dépense de la comptabilité ?"))) {
            router.delete(route('depenses.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (cat, q) => {
        router.get(route('depenses.index'), {
            categorie: cat !== 'all' ? cat : undefined,
            search: q ? q : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount || 0);
    };

    const getCategoryBadge = (cat) => {
        const c = (cat || '').toLowerCase();
        let bg = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
        let icon = <Tag className="w-3.5 h-3.5 opacity-70" />;

        if (c.includes('salaire')) {
            bg = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30';
            icon = <span>👔</span>;
        } else if (c.includes('loyer')) {
            bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30';
            icon = <span>🏠</span>;
        } else if (c.includes('transport') || c.includes('carburant')) {
            bg = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30';
            icon = <span>⛽</span>;
        } else if (c.includes('electr') || c.includes('eau')) {
            bg = 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30';
            icon = <span>💡</span>;
        } else if (c.includes('fourniture') || c.includes('pédagogie') || c.includes('pedagogie')) {
            bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30';
            icon = <span>📚</span>;
        } else if (c.includes('entretien')) {
            bg = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30';
            icon = <span>🧹</span>;
        } else if (c.includes('pharmacie') || c.includes('soin')) {
            bg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30';
            icon = <span>🏥</span>;
        } else if (c.includes('communication') || c.includes('internet')) {
            bg = 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30';
            icon = <span>📡</span>;
        }

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${bg}`}>
                {icon}
                <span>{cat}</span>
            </span>
        );
    };

    return (
        <DashboardLayout title={t('expenses_management', "Gestion des Dépenses")}>
            <Head title="Journal des Dépenses" />

            {/* HEROBANNER & STATS */}
            <div className="bg-[#0B1A2D] rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                            <CreditCard className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
                                {t('expenses', "Journal des Dépenses")}
                            </h1>
                            <p className="text-red-100/80 font-medium flex items-center gap-2 text-sm">
                                Suivi des décaissements et charges d'exploitation
                            </p>
                        </div>
                    </div>

                    {/* STATS RAPIDES */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-5 text-right">
                            <span className="text-[11px] uppercase tracking-wider text-red-200 block font-bold">
                                Dépenses ce mois
                            </span>
                            <span className="text-xl md:text-2xl font-black text-white">
                                {formatCurrency(stats?.total_mois || 0)}
                            </span>
                        </div>
                        <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-3 px-5 text-right">
                            <span className="text-[11px] uppercase tracking-wider text-red-200 block font-bold">
                                Total Cumulé
                            </span>
                            <span className="text-xl md:text-2xl font-black text-red-300">
                                {formatCurrency(stats?.total_global || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION & FILTER BAR */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    {/* Recherche */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder={t('search_expenses', "Rechercher une dépense...")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilterChange(selectedCategoryFilter, search);
                                }
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>

                    {/* Filtre Catégorie */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => {
                                setSelectedCategoryFilter(e.target.value);
                                handleFilterChange(e.target.value, search);
                            }}
                            className="w-full sm:w-auto py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="all">Toutes les catégories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(selectedCategoryFilter !== 'all' || search) && (
                        <button
                            onClick={() => {
                                setSelectedCategoryFilter('all');
                                setSearch('');
                                handleFilterChange('all', '');
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 underline"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* Bouton d'ajout */}
                {can('ajouter_depenses') && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-red-500/25 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('new_expense', "Enregistrer une Dépense")}</span>
                    </button>
                )}
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
                                            {getCategoryBadge(depense.categorie)}
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
                                                    {depense.user?.full_name || `${depense.user?.nom || ''} ${depense.user?.prenom || ''}`.trim() || "Caisse / Système"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right whitespace-nowrap">
                                            <div className="font-black text-red-600 dark:text-red-400 tracking-tight text-lg">
                                                - {formatCurrency(depense.montant)}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            {can('supprimer_depenses') && (
                                                <div className="flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(depense.id)}
                                                        className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                                                        title={t('delete', "Supprimer")}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
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

            {/* MODALE HORIZONTALE PLEINE LARGEUR (5XL) */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="5xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
                    {/* EN-TÊTE HORIZONTAL */}
                    <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                        <div className="flex items-center gap-3.5">
                            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/60">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {t('new_expense', "Enregistrer une Dépense")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Décaissement de caisse, charge d'exploitation ou règlement fournisseur
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* CORPS DU FORMULAIRE */}
                    <div className="p-5 md:p-6 lg:p-8">
                        <ExpenseForm
                            categories={categories}
                            currentUser={auth?.user}
                            onSuccess={() => setModalOpen(false)}
                            onCancel={() => setModalOpen(false)}
                        />
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

function ExpenseForm({ categories, currentUser, onSuccess, onCancel }) {
    const { t } = useTranslation();
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const form = useForm({
        categorie: categories && categories.length > 0 ? categories[0] : "Autre",
        custom_categorie: "",
        montant: "",
        description: "",
        date_depense: new Date().toISOString().split('T')[0],
    });

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        if (val === '__custom__') {
            setIsCustomCategory(true);
            form.setData({
                ...form.data,
                categorie: '__custom__',
                custom_categorie: '',
            });
        } else {
            setIsCustomCategory(false);
            form.setData({
                ...form.data,
                categorie: val,
                custom_categorie: '',
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('depenses.store'), {
            onSuccess: () => {
                form.reset();
                setIsCustomCategory(false);
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* BLOC GAUCHE (5/12) : MONTANT & DATE */}
                <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                            {t('amount', 'Montant du Décaissement')}
                        </label>
                        <div className="relative border-2 border-red-300 dark:border-red-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all">
                            <input
                                type="number"
                                className="w-full border-none bg-transparent p-3.5 pr-16 rounded-2xl text-2xl md:text-3xl font-black text-red-600 dark:text-red-400 focus:ring-0 text-right placeholder:text-slate-300"
                                value={form.data.montant}
                                onChange={e => form.setData('montant', e.target.value)}
                                placeholder="0"
                                min="1"
                                required
                                autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                FCFA
                            </span>
                        </div>
                        {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1 text-right">{form.errors.montant}</p>}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {t('date', 'Date de Décaissement')}
                        </label>
                        <input
                            type="date"
                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
                            value={form.data.date_depense}
                            onChange={e => form.setData('date_depense', e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Agent émetteur :</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            {currentUser?.full_name || `${currentUser?.nom || ''} ${currentUser?.prenom || ''}`.trim() || 'Comptable'}
                        </span>
                    </div>
                </div>

                {/* BLOC DROIT (7/12) : CATÉGORIE & MOTIF */}
                <div className="lg:col-span-7 space-y-4">
                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Tag className="w-4 h-4 text-slate-400" />
                            {t('category', 'Catégorie de Dépense')}
                        </label>
                        <select
                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold text-slate-800 dark:text-slate-200 text-sm"
                            value={isCustomCategory ? '__custom__' : form.data.categorie}
                            onChange={handleCategoryChange}
                        >
                            {categories && categories.length > 0 ? (
                                categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))
                            ) : (
                                <option value="Autre">Autre dépense</option>
                            )}
                            <option value="__custom__" className="font-bold text-red-600 dark:text-red-400">
                                ✨ + Saisir une nouvelle catégorie...
                            </option>
                        </select>

                        {/* Saisie personnalisée */}
                        {isCustomCategory && (
                            <div className="mt-2.5 p-3 bg-red-50/70 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800/60">
                                <label className="block text-xs font-bold text-red-800 dark:text-red-300 mb-1 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {t('custom_category_label', "Nom de la nouvelle catégorie :")}
                                </label>
                                <input
                                    type="text"
                                    className="w-full border-red-300 dark:border-red-700 p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-red-500/30"
                                    placeholder="Ex: Carburant groupe, Frais d'examen, Événement..."
                                    value={form.data.custom_categorie}
                                    onChange={e => form.setData('custom_categorie', e.target.value)}
                                    required={isCustomCategory}
                                    autoFocus
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    💡 Cette catégorie sera automatiquement enregistrée dans la liste pour les prochaines fois.
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <FileText className="w-4 h-4 text-slate-400" />
                            {t('description', 'Motif / Description détaillée')}
                        </label>
                        <textarea
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm min-h-[110px] text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                            value={form.data.description}
                            onChange={e => form.setData('description', e.target.value)}
                            placeholder="Détails du motif, numéro de facture fournisseur ou justificatif..."
                            rows="3"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* PIED DE PAGE : BOUTONS D'ACTION */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Enregistrement instantané dans le journal de caisse
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm cursor-pointer"
                    >
                        {t('cancel', 'Annuler')}
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 transition-all active:scale-95 disabled:opacity-70 text-sm cursor-pointer"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {t('save', 'Valider la Dépense')}
                    </button>
                </div>
            </div>
        </form>
    );
}
