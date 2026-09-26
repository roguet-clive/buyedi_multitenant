import React, { useState, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import { 
    CreditCard, 
    Plus, 
    Trash2, 
    Calendar, 
    FileText, 
    User as UserIcon, 
    Tag, 
    CheckCircle2, 
    Search, 
    Filter, 
    Sparkles, 
    X,
    Paperclip,
    ExternalLink,
    Download,
    Eye,
    UploadCloud,
    AlertCircle,
    Banknote,
    Building2,
    Smartphone,
    Receipt,
    FileCheck2
} from 'lucide-react';

export default function Index({ depenses, categories = [], filters = {}, stats = {} }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [previewDepense, setPreviewDepense] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(filters.categorie || 'all');
    const [selectedModeFilter, setSelectedModeFilter] = useState(filters.mode_paiement || 'all');
    const [selectedJustificatifFilter, setSelectedJustificatifFilter] = useState(filters.justificatif || '');

    const isSuperAdmin = auth?.roles?.includes('super-admin');
    const can = (perm) => isSuperAdmin || (auth?.permissions && auth.permissions.includes(perm));

    const handleDelete = (id) => {
        if (confirm(t('confirm_delete', "Êtes-vous sûr de vouloir supprimer cette dépense et son justificatif de la comptabilité ?"))) {
            router.delete(route('depenses.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (cat, q, mode, justif) => {
        router.get(route('depenses.index'), {
            categorie: cat !== 'all' ? cat : undefined,
            search: q ? q : undefined,
            mode_paiement: mode !== 'all' ? mode : undefined,
            justificatif: justif ? justif : undefined,
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

    const getModePaiementBadge = (mode) => {
        const m = (mode || 'especes').toLowerCase();
        if (m === 'mobile_money') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Smartphone className="w-3 h-3 text-amber-600" />
                    <span>Mobile Money</span>
                </span>
            );
        } else if (m === 'virement') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span>Virement</span>
                </span>
            );
        } else if (m === 'cheque') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Receipt className="w-3 h-3 text-purple-600" />
                    <span>Chèque</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Banknote className="w-3 h-3 text-emerald-600" />
                <span>Espèces</span>
            </span>
        );
    };

    const isPdf = (url) => {
        if (!url) return false;
        return url.toLowerCase().includes('.pdf');
    };

    // Taux de justification
    const tauxJustifie = stats.nb_total > 0 ? Math.round((stats.nb_avec_facture / stats.nb_total) * 100) : 100;

    return (
        <DashboardLayout title={t('expenses_management', "Gestion des Dépenses")}>
            <Head title="Journal des Dépenses & Factures - Buyedi" />

            {/* HEROBANNER & STATS AUDIT COMPTABLE */}
            <div className="bg-[#0B1A2D] rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                            <CreditCard className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                    {t('expenses', "Journal des Dépenses")}
                                </h1>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Comptabilité & Audit
                                </span>
                            </div>
                            <p className="text-red-100/80 font-medium flex items-center gap-2 text-sm">
                                Décaissements, charges d'exploitation et pièces justificatives dématérialisées
                            </p>
                        </div>
                    </div>

                    {/* STATS RAPIDES & KPI JUSTIFICATIFS */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-5 text-right">
                            <span className="text-[10.5px] uppercase tracking-wider text-red-200 block font-bold">
                                Dépenses ce mois
                            </span>
                            <span className="text-xl md:text-2xl font-black text-white">
                                {formatCurrency(stats?.total_mois || 0)}
                            </span>
                        </div>

                        <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-3 px-5 text-right">
                            <span className="text-[10.5px] uppercase tracking-wider text-red-200 block font-bold">
                                Total Cumulé
                            </span>
                            <span className="text-xl md:text-2xl font-black text-red-300">
                                {formatCurrency(stats?.total_global || 0)}
                            </span>
                        </div>

                        {/* KPI Justificatifs */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 text-right">
                            <span className="text-[10.5px] uppercase tracking-wider text-slate-300 block font-bold">
                                Taux de Justification
                            </span>
                            <div className="flex items-center justify-end gap-2 mt-0.5">
                                <span className={`text-xl font-black ${tauxJustifie >= 80 ? 'text-emerald-300' : 'text-amber-300'}`}>
                                    {tauxJustifie}%
                                </span>
                                <span className="text-xs text-slate-300">
                                    ({stats?.nb_avec_facture || 0}/{stats?.nb_total || 0})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION & FILTER BAR */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Recherche multi-critères */}
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Rechercher motif, N° facture, tiers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilterChange(selectedCategoryFilter, search, selectedModeFilter, selectedJustificatifFilter);
                                }
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>

                    {/* Filtre Catégorie */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => {
                                setSelectedCategoryFilter(e.target.value);
                                handleFilterChange(e.target.value, search, selectedModeFilter, selectedJustificatifFilter);
                            }}
                            className="w-full sm:w-auto py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="all">📁 Toutes les catégories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre Mode de Paiement */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <select
                            value={selectedModeFilter}
                            onChange={(e) => {
                                setSelectedModeFilter(e.target.value);
                                handleFilterChange(selectedCategoryFilter, search, e.target.value, selectedJustificatifFilter);
                            }}
                            className="w-full sm:w-auto py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="all">💳 Tous modes de règlement</option>
                            <option value="especes">💵 Espèces (Caisse)</option>
                            <option value="mobile_money">📱 Mobile Money</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="cheque">🧾 Chèque</option>
                        </select>
                    </div>

                    {/* Filtre Présence Justificatif */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <select
                            value={selectedJustificatifFilter}
                            onChange={(e) => {
                                setSelectedJustificatifFilter(e.target.value);
                                handleFilterChange(selectedCategoryFilter, search, selectedModeFilter, e.target.value);
                            }}
                            className="w-full sm:w-auto py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="">📎 Tous justificatifs</option>
                            <option value="avec">✓ Avec facture jointe</option>
                            <option value="sans">⚠️ Sans pièce comptable</option>
                        </select>
                    </div>

                    {(selectedCategoryFilter !== 'all' || selectedModeFilter !== 'all' || selectedJustificatifFilter || search) && (
                        <button
                            onClick={() => {
                                setSelectedCategoryFilter('all');
                                setSelectedModeFilter('all');
                                setSelectedJustificatifFilter('');
                                setSearch('');
                                handleFilterChange('all', '', 'all', '');
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 underline cursor-pointer"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* Bouton d'ajout */}
                {can('ajouter_depenses') && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="w-full xl:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-red-500/25 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('new_expense', "Enregistrer une Dépense")}</span>
                    </button>
                )}
            </div>

            {/* TABLEAU COMPTABLE DES DÉPENSES */}
            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0B1A2D] text-slate-300 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-4 font-semibold rounded-tl-3xl">{t('date', "Date")}</th>
                                <th className="p-4 font-semibold text-white">{t('category', "Catégorie")}</th>
                                <th className="p-4 font-semibold">{t('description', "Motif & Tiers")}</th>
                                <th className="p-4 font-semibold text-center">Règlement</th>
                                <th className="p-4 font-semibold text-center">Justificatif / Facture</th>
                                <th className="p-4 font-semibold">{t('author', "Auteur")}</th>
                                <th className="p-4 font-semibold text-right text-white">{t('amount', "Montant")}</th>
                                <th className="p-4 font-semibold text-center rounded-tr-3xl">{t('actions', "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {depenses.data.length > 0 ? (
                                depenses.data.map((depense) => (
                                    <tr key={depense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        {/* Date */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {new Date(depense.date_depense).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>

                                        {/* Catégorie */}
                                        <td className="p-4">
                                            {getCategoryBadge(depense.categorie)}
                                        </td>

                                        {/* Motif, N° Facture & Bénéficiaire */}
                                        <td className="p-4">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate" title={depense.description}>
                                                    {depense.description || <span className="italic opacity-50">Aucun motif renseigné</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                    {depense.numero_facture && (
                                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                                                            Réf: {depense.numero_facture}
                                                        </span>
                                                    )}
                                                    {depense.beneficiaire && (
                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            Bénéficiaire : <strong>{depense.beneficiaire}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Mode de règlement */}
                                        <td className="p-4 text-center whitespace-nowrap">
                                            {getModePaiementBadge(depense.mode_paiement)}
                                        </td>

                                        {/* Pièce Justificative / Facture */}
                                        <td className="p-4 text-center whitespace-nowrap">
                                            {depense.facture_path ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewDepense(depense)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-sm active:scale-95"
                                                    title="Visualiser la facture / pièce justificative"
                                                >
                                                    <Paperclip className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                    <span>Voir Facture</span>
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                                                    <AlertCircle className="w-3 h-3 text-amber-500/80" />
                                                    <span>Sans pièce</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Auteur */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    {depense.user?.full_name || `${depense.user?.nom || ''} ${depense.user?.prenom || ''}`.trim() || "Caisse / Système"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Montant */}
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="font-black text-red-600 dark:text-red-400 tracking-tight text-base md:text-lg">
                                                - {formatCurrency(depense.montant)}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-center whitespace-nowrap">
                                            {can('supprimer_depenses') && (
                                                <div className="flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(depense.id)}
                                                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all shadow-sm cursor-pointer"
                                                        title={t('delete', "Supprimer cette dépense")}
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
                                    <td colSpan="8" className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                                <CreditCard className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="font-semibold text-lg">{t('no_expenses', "Aucune dépense trouvée.")}</p>
                                            <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou enregistrez un nouveau décaissement.</p>
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

            {/* MODALE D'ENREGISTREMENT DE DÉPENSE AVEC UPLOAD DE FACTURE (5XL) */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="5xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl">
                    {/* EN-TÊTE */}
                    <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                        <div className="flex items-center gap-3.5">
                            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/60">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {t('new_expense', "Enregistrer une Dépense & Facture")}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Décaissement de caisse, charge d'exploitation et pièces justificatives dématérialisées
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

                    {/* FORMULAIRE */}
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

            {/* MODALE DE PRÉVISUALISATION DE LA FACTURE / PIÈCE COMPTABLE */}
            <Modal show={!!previewDepense} onClose={() => setPreviewDepense(null)} maxWidth="4xl">
                {previewDepense && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
                        {/* En-tête de la visionneuse */}
                        <div className="flex flex-wrap items-center justify-between p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <FileCheck2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>Justificatif Comptable</span>
                                        {previewDepense.numero_facture && (
                                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                                N° {previewDepense.numero_facture}
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {previewDepense.categorie} • {formatCurrency(previewDepense.montant)} • {previewDepense.beneficiaire || 'Bénéficiaire non spécifié'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                <a
                                    href={previewDepense.facture_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Plein écran</span>
                                </a>

                                <a
                                    href={previewDepense.facture_url}
                                    download
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Télécharger</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setPreviewDepense(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Corps du document visualisé */}
                        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/50 min-h-[400px]">
                            {isPdf(previewDepense.facture_url) ? (
                                <iframe
                                    src={previewDepense.facture_url}
                                    title="Aperçu Facture PDF"
                                    className="w-full h-[65vh] rounded-xl border border-slate-300 dark:border-slate-700 bg-white"
                                />
                            ) : (
                                <img
                                    src={previewDepense.facture_url}
                                    alt="Facture justificative"
                                    className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-white"
                                />
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}

function ExpenseForm({ categories, currentUser, onSuccess, onCancel }) {
    const { t } = useTranslation();
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const form = useForm({
        categorie: categories && categories.length > 0 ? categories[0] : "Autre",
        custom_categorie: "",
        montant: "",
        description: "",
        date_depense: new Date().toISOString().split('T')[0],
        numero_facture: "",
        mode_paiement: "especes",
        beneficiaire: "",
        facture: null,
    });

    const handleCategoryChange = (e) => {
        const val = e.target.value;
        if (val === '__custom__') {
            setIsCustomCategory(true);
            form.setData('categorie', '__custom__');
        } else {
            setIsCustomCategory(false);
            form.setData('categorie', val);
        }
    };

    const handleFileSelected = (file) => {
        if (!file) return;

        form.setData('facture', file);

        // Prévisualisation si image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const handleRemoveFile = () => {
        form.setData('facture', null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('depenses.store'), {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                setFilePreview(null);
                setIsCustomCategory(false);
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* BLOC GAUCHE (5/12) : MONTANT, DATE & MODE DE PAIEMENT */}
                <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                    
                    {/* Montant principal */}
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                            {t('amount', 'Montant du Décaissement')} *
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

                    {/* Date de décaissement */}
                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {t('date', 'Date de Décaissement')} *
                        </label>
                        <input
                            type="date"
                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
                            value={form.data.date_depense}
                            onChange={e => form.setData('date_depense', e.target.value)}
                            required
                        />
                        {form.errors.date_depense && <p className="text-red-500 text-xs font-bold mt-1">{form.errors.date_depense}</p>}
                    </div>

                    {/* Mode de règlement */}
                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Banknote className="w-4 h-4 text-slate-400" />
                            Mode de Règlement *
                        </label>
                        <select
                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
                            value={form.data.mode_paiement}
                            onChange={e => form.setData('mode_paiement', e.target.value)}
                            required
                        >
                            <option value="especes">💵 Espèces (Sortie de Caisse)</option>
                            <option value="mobile_money">📱 Mobile Money (Airtel / Moov)</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="cheque">🧾 Chèque de Banque</option>
                        </select>
                    </div>

                    {/* Agent émetteur */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Agent émetteur :</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                            {currentUser?.full_name || `${currentUser?.nom || ''} ${currentUser?.prenom || ''}`.trim() || 'Comptable'}
                        </span>
                    </div>
                </div>

                {/* BLOC DROIT (7/12) : CATÉGORIE, TIERS, DESCRIPTION & TÉLÉVERSEMENT DE FACTURE */}
                <div className="lg:col-span-7 space-y-4">
                    
                    {/* Catégorie */}
                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <Tag className="w-4 h-4 text-slate-400" />
                            {t('category', 'Catégorie de Dépense')} *
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

                    {/* Grille : N° Facture & Bénéficiaire */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                N° Facture / Pièce (optionnel)
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: FACT-2026-042"
                                className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                value={form.data.numero_facture}
                                onChange={e => form.setData('numero_facture', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                Bénéficiaire / Fournisseur (optionnel)
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: SEEG, Librairie, Artisan..."
                                className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                value={form.data.beneficiaire}
                                onChange={e => form.setData('beneficiaire', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Motif / Description détaillée */}
                    <div>
                        <label className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <FileText className="w-4 h-4 text-slate-400" />
                            {t('description', 'Motif / Description du décaissement')}
                        </label>
                        <textarea
                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm min-h-[70px] text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                            value={form.data.description}
                            onChange={e => form.setData('description', e.target.value)}
                            placeholder="Détails du motif, désignation des articles ou prestation..."
                            rows="2"
                        ></textarea>
                    </div>

                    {/* ZONE DE TÉLÉVERSEMENT DE FACTURE / PIÈCE COMPTABLE */}
                    <div>
                        <label className="flex items-center justify-between gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5">
                                <Paperclip className="w-4 h-4 text-indigo-500" />
                                Pièce Justificative / Facture (PDF ou Image)
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">
                                Recommandé pour l'audit
                            </span>
                        </label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={(e) => handleFileSelected(e.target.files?.[0])}
                        />

                        {!form.data.facture ? (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    handleFileSelected(e.dataTransfer.files?.[0]);
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                                    isDragging
                                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40'
                                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 hover:border-slate-400'
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                    <div className="p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        Glissez-déposez la facture ici ou <span className="text-indigo-600 dark:text-indigo-400 underline">parcourez vos fichiers</span>
                                    </div>
                                    <p className="text-[10.5px] text-slate-400">
                                        Formats acceptés : PDF, PNG, JPG (jusqu'à 10 Mo)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Carte du fichier sélectionné */
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70">
                                <div className="flex items-center gap-3">
                                    {filePreview ? (
                                        <img
                                            src={filePreview}
                                            alt="Aperçu facture"
                                            className="w-12 h-12 object-cover rounded-xl border border-indigo-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                            PDF
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                                            {form.data.facture.name}
                                        </div>
                                        <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                                            {(form.data.facture.size / 1024).toFixed(1)} Ko • Prêt pour l'envoi
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                                    >
                                        Remplacer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
                                        title="Supprimer la facture"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {form.errors.facture && <p className="text-red-500 text-xs font-bold mt-1">{form.errors.facture}</p>}
                    </div>
                </div>
            </div>

            {/* PIED DE PAGE : BOUTONS D'ACTION */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Enregistrement automatique au journal de caisse et audit
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
                        {form.processing ? 'Enregistrement...' : t('save', 'Valider la Dépense')}
                    </button>
                </div>
            </div>
        </form>
    );
}
