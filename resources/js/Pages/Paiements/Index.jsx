import React, { useState, useEffect, useMemo, Fragment } from "react";
import { useForm, usePage, router, Link, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Select from "react-select";
import Modal from "@/Components/Modal";
import { Wallet, Search, Filter, Plus, Printer, Trash2, Calendar, User, BookOpen, Layers, CheckCircle2, Calculator, CalendarRange, Check, DollarSign, Clock, Sparkles, AlertCircle, ArrowRight, ChevronDown, ChevronUp, FileText, Building2 } from "lucide-react";

// --- CUSTOM STYLES FOR REACT-SELECT ---
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '46px',
        backgroundColor: state.isDisabled ? '#f8fafc' : '#ffffff',
        borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
        borderRadius: '0.75rem',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
        },
        padding: '2px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : null,
        color: state.isSelected ? 'white' : '#334155',
        cursor: 'pointer',
        fontWeight: state.isSelected ? '600' : '400',
        padding: '10px 14px',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#0f172a',
        fontWeight: '500'
    }),
    placeholder: (base) => ({
        ...base,
        color: '#94a3b8'
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        zIndex: 9999
    })
};

import StandardPaymentForm from "./Partials/StandardPaymentForm";
import ScolaritePaymentForm from "./Partials/ScolaritePaymentForm";

export default function Index({ paiements, recapClasses = [], stats, annees, currentAnneeId, inscriptions, classes, fraisTypes, fraisClasses, filters, auth }) {
    const { t } = useTranslation();
    const { etablissement } = usePage().props;

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialInscriptionId = urlParams.get('inscription_id') || filters.inscription_id || null;

    const [search, setSearch] = useState(filters.search || "");
    const [selectedAnnee, setSelectedAnnee] = useState(filters.annee_scolaire_id || currentAnneeId);
    const [selectedMode, setSelectedMode] = useState(filters.mode_paiement || "");
    const [filterClasse, setFilterClasse] = useState(filters.classe_id || "");
    const [dateDebut, setDateDebut] = useState(filters.date_debut || "");
    const [dateFin, setDateFin] = useState(filters.date_fin || "");
    const [activeTab, setActiveTab] = useState("all"); // 'all' | 'scolarite' | 'general'

    const [generalModalOpen, setGeneralModalOpen] = useState(false);
    const [scolariteModalOpen, setScolariteModalOpen] = useState(
        filters.open_scolarite === '1' || urlParams.get('open_scolarite') === '1'
    );
    const [preselectedInscriptionId, setPreselectedInscriptionId] = useState(initialInscriptionId);

    const permissions = auth?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    // Synchronisation des filtres avec Inertia
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route("paiements.index"),
                {
                    search,
                    annee_scolaire_id: selectedAnnee,
                    mode_paiement: selectedMode || undefined,
                    classe_id: filterClasse || undefined,
                    date_debut: dateDebut || undefined,
                    date_fin: dateFin || undefined,
                },
                { preserveState: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, selectedAnnee, selectedMode, filterClasse, dateDebut, dateFin]);

    const handleQuickDate = (type) => {
        const today = new Date().toISOString().split("T")[0];
        if (type === "today") {
            setDateDebut(today);
            setDateFin(today);
        } else if (type === "month") {
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
            setDateDebut(firstDay);
            setDateFin(today);
        } else if (type === "reset") {
            setDateDebut("");
            setDateFin("");
            setSelectedMode("");
            setFilterClasse("");
            setSearch("");
        }
    };

    const destroy = (id) => {
        if (!confirm(t("confirm_delete_paiement", "⚠️ Supprimer cet encaissement ? Cela mettra à jour le solde comptable de l'élève."))) return;
        router.delete(route("paiements.destroy", id), {
            onError: () => toast.error(t("delete_failed", "Échec de suppression")),
        });
    };

    const handlePrintJournal = () => {
        window.print();
    };

    const formatFCFA = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';

    // Mode d'affichage : 'operations' (par quittance/facture globale) ou 'details' (par flux ventilé)
    const [viewMode, setViewMode] = useState("operations");
    const [expandedGroups, setExpandedGroups] = useState({});

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Filtrage local pour les onglets
    const displayedPaiements = (paiements.data || []).filter(p => {
        if (activeTab === 'all') return true;
        const isSco = fraisTypes.find(ft => ft.id === p.frais_type_id)?.is_scolarite;
        return activeTab === 'general' ? !isSco : isSco;
    });

    // Regroupement professionnel par reçu / opération financière
    const groupedOperations = useMemo(() => {
        const map = new Map();
        displayedPaiements.forEach(p => {
            const groupKey = p.reference_recu || (p.inscription_id ? `INSC-${p.inscription_id}-${p.date_paiement}` : `PAY-${p.id}`);
            if (!map.has(groupKey)) {
                map.set(groupKey, {
                    key: groupKey,
                    reference_recu: p.reference_recu || (p.inscription?.numero_recu || `REC-${String(p.id).padStart(6, '0')}`),
                    date_paiement: p.date_paiement,
                    created_at: p.created_at,
                    inscription_id: p.inscription_id,
                    inscription: p.inscription,
                    mode_paiement: p.mode_paiement,
                    user: p.user,
                    total_montant: 0,
                    is_inscription_pack: false,
                    items: []
                });
            }
            const group = map.get(groupKey);
            group.total_montant += Number(p.montant || 0);
            group.items.push(p);

            const isAdmission = p.frais_type?.code === 'inscription' || p.frais_type?.code === 'reinscription';
            if (isAdmission || group.items.length > 1) {
                group.is_inscription_pack = true;
            }
        });
        return Array.from(map.values());
    }, [displayedPaiements]);

    const isFiltered = Boolean(selectedMode || filterClasse || dateDebut || dateFin || search);

    return (
        <DashboardLayout title={t("caisse_management", "Journal de Caisse")}>
            <Head title="Journal de Caisse & Encaissements" />

            {/* STYLES D'IMPRESSION DU JOURNAL DE CAISSE */}
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { background: white !important; font-size: 11px; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #cbd5e1 !important; padding: 6px 8px !important; }
                }
                .print-only { display: none; }
            `}</style>

            {/* EN-TÊTE D'IMPRESSION (VISIBLE SEULEMENT SUR PAPIER / PDF) */}
            <div className="print-only mb-6 border-b-2 border-slate-800 pb-4 text-black">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-black uppercase">{etablissement?.nom || 'Établissement Scolaire'}</h1>
                        <p className="text-xs text-slate-600">{[etablissement?.adresse, etablissement?.telephone, etablissement?.email].filter(Boolean).join(' • ')}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 border border-slate-300 inline-block">
                            JOURNAL DES ENCAISSEMENTS
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">Édité le : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-6 text-xs bg-slate-50 p-2 border border-slate-200">
                    <span><strong>Année :</strong> {annees.find(a => a.id === selectedAnnee)?.nom || 'En cours'}</span>
                    {dateDebut && <span><strong>Période du :</strong> {dateDebut} {dateFin ? `au ${dateFin}` : ''}</span>}
                    {selectedMode && <span><strong>Mode :</strong> {selectedMode.toUpperCase()}</span>}
                    <span><strong>Total Encaissé Sélection :</strong> {formatFCFA(stats?.total_filtre || stats?.total_annee)}</span>
                </div>
            </div>

            {/* 1. EN-TÊTE COMPACT & ACTIONS DE CAISSE (STYLE FINTECH / ERP MODERNE) */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 no-print bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {t("journal_caisse", "Journal de Caisse")}
                            </h1>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                {stats?.nb_operations || stats?.nb_transactions || 0} quittance(s) {stats?.nb_flux && stats.nb_flux !== (stats.nb_operations || stats.nb_transactions) ? `(${stats.nb_flux} flux)` : ''}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Suivi financier en direct, clôtures de caisse et audit des encaissements.
                        </p>
                    </div>
                </div>

                {/* Actions groupées à droite */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    {/* Sélecteur Année Scolaire compact */}
                    <div className="relative">
                        <select
                            value={selectedAnnee}
                            onChange={(e) => setSelectedAnnee(e.target.value)}
                            className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl font-bold text-xs focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
                        >
                            {annees.map((a) => (
                                <option key={a.id} value={a.id}>
                                    Année {a.nom} {a.en_cours ? "⭐️" : ""}
                                </option>
                            ))}
                        </select>
                        <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Bouton Impression contextuel */}
                    <a
                        href={route('paiements.journal', {
                            annee_scolaire_id: selectedAnnee,
                            mode_paiement: selectedMode || undefined,
                            classe_id: filterClasse || undefined,
                            date_debut: dateDebut || undefined,
                            date_fin: dateFin || undefined,
                            search: search || undefined,
                            vue: viewMode === 'classes' ? 'classe' : 'details',
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all border border-slate-200 dark:border-slate-600 shadow-sm active:scale-95"
                        title="Ouvrir et imprimer le bordereau officiel A4"
                    >
                        <Printer className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="hidden sm:inline">{viewMode === 'classes' ? "Imprimer par Classe" : "Imprimer Journal"}</span>
                        <span className="sm:hidden">Imprimer</span>
                    </a>

                    {/* Bouton Accès État des Impayés */}
                    <Link
                        href={route('paiements.impayes', { annee_scolaire_id: selectedAnnee })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 transition-all shadow-sm active:scale-95"
                        title="Consulter l'état général des impayés et recouvrement"
                    >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="hidden sm:inline">État des Impayés</span>
                        <span className="sm:hidden">Impayés</span>
                    </Link>

                    {/* Bouton Autre Paiement / Frais Général */}
                    <button
                        onClick={() => setGeneralModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 text-blue-500" />
                        <span>Autre Frais</span>
                    </button>

                    {/* Bouton Encaisser Scolarité (Action Principale) */}
                    <button
                        onClick={() => setScolariteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Encaisser Scolarité</span>
                    </button>
                </div>
            </div>

            {/* 2. RUBAN DES MÉTRIQUES FINANCIÈRES (CONDENSÉ SUR 1 LIGNE) */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-2.5 sm:p-3 mb-4 shadow-sm no-print">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
                    {/* 1. Recettes Année */}
                    <div className="px-2 sm:px-3 py-1 flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Recettes Année</div>
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                                {formatFCFA(stats?.total_annee)}
                            </div>
                        </div>
                    </div>

                    {/* 2. Caisse Aujourd'hui */}
                    <div className="px-2 sm:px-3 py-1 flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0 relative">
                            <Calendar className="w-4 h-4" />
                            {stats?.total_today > 0 && (
                                <span className="absolute top-1 right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                                <span>Aujourd'hui</span>
                                {stats?.total_today > 0 && (
                                    <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1 rounded">
                                        Actif
                                    </span>
                                )}
                            </div>
                            <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
                                {formatFCFA(stats?.total_today)}
                            </div>
                        </div>
                    </div>

                    {/* 3. Espèces en Coffre */}
                    <div className="px-2 sm:px-3 py-1 flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0 text-sm">
                            💵
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Espèces (Coffre)</div>
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                                {formatFCFA(stats?.total_especes)}
                            </div>
                        </div>
                    </div>

                    {/* 4. Mobile Money & Banque */}
                    <div className="px-2 sm:px-3 py-1 flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 shrink-0 text-sm">
                            📱
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Mobile & Banque</div>
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                                {formatFCFA((stats?.total_mobile || 0) + (stats?.total_banque || 0))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. BARRE DE COMMANDE UNIQUE (VUES + FILTRES INTELLIGENTS) */}
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 mb-4 no-print space-y-3">
                {/* Ligne 1 : Navigation des Vues et Catégories de flux */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    {/* Sélecteur de Vue Principale */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setViewMode('operations')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                                viewMode === 'operations'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                            title="Regrouper par quittance / reçu global"
                        >
                            <span>📑 Par Quittance</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                viewMode === 'operations' 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                                {groupedOperations.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('details')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                                viewMode === 'details'
                                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                            title="Afficher chaque ligne de paiement ventilée"
                        >
                            <span>🔍 Vue Ventilée</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                viewMode === 'details' 
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                                {displayedPaiements.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('classes')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                                viewMode === 'classes'
                                    ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                            title="Synthèse analytique des recettes par classe"
                        >
                            <span>🏛️ Synthèse par Classe</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                viewMode === 'classes' 
                                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                                {recapClasses.length}
                            </span>
                        </button>
                    </div>

                    {/* Filtre Catégorie de flux (Tous / Scolarités / Autres) */}
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Type :</span>
                        <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                                    activeTab === 'all'
                                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                Tous ({paiements.total || 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('scolarite')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                                    activeTab === 'scolarite'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                Scolarités
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('general')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                                    activeTab === 'general'
                                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                Autres Frais
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ligne 2 : Filtres de Recherche et Périodes */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    {/* Champ de recherche */}
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("search_paiement", "Rechercher un élève, matricule, quittance...")}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-1.5 pl-8 pr-3 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Filtre Classe */}
                    <div className="w-auto min-w-[140px]">
                        <select
                            value={filterClasse}
                            onChange={(e) => setFilterClasse(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-1.5 px-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre Mode de Règlement */}
                    <div className="w-auto min-w-[130px]">
                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-1.5 px-2.5 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                        >
                            <option value="">Tous les modes</option>
                            <option value="especes">💵 Espèces</option>
                            <option value="mobile">📱 Mobile Money</option>
                            <option value="virement">🏦 Virement</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    {/* Raccourcis de dates rapides */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => handleQuickDate("today")}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                dateDebut === new Date().toISOString().split("T")[0] && dateFin === new Date().toISOString().split("T")[0]
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                    : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            Aujourd'hui
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickDate("month")}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
                        >
                            Ce mois
                        </button>
                    </div>

                    {/* Sélecteur de date précise */}
                    <div className="flex items-center gap-1">
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-1 px-2 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                            title="Date début"
                        />
                        <span className="text-slate-400 text-xs">à</span>
                        <input
                            type="date"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-1 px-2 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                            title="Date fin"
                        />
                    </div>

                    {/* Badge de réinitialisation si filtre actif */}
                    {isFiltered && (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                {stats?.count_filtre || displayedPaiements.length} flux • {formatFCFA(stats?.total_filtre)}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleQuickDate("reset")}
                                className="px-2 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                                title="Réinitialiser tous les filtres"
                            >
                                ✕ Effacer
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* TABLEAU PRINCIPAL DU JOURNAL DE CAISSE */}
            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                {viewMode === 'classes' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0B1A2D] text-slate-300 uppercase text-[10px] font-black tracking-wider">
                                <tr>
                                    <th className="p-4 sm:p-5 font-semibold rounded-tl-3xl w-12 text-center">Rang</th>
                                    <th className="p-4 sm:p-5 font-semibold text-white">Classe</th>
                                    <th className="p-4 sm:p-5 font-semibold">Cycle / Niveau</th>
                                    <th className="p-4 sm:p-5 font-semibold text-center">Élèves Cotisants</th>
                                    <th className="p-4 sm:p-5 font-semibold text-center">Nbre Quittances</th>
                                    <th className="p-4 sm:p-5 font-semibold text-right">Scolarité (FCFA)</th>
                                    <th className="p-4 sm:p-5 font-semibold text-right">Frais Annexes (FCFA)</th>
                                    <th className="p-4 sm:p-5 font-semibold text-right text-white">Total Encaissé</th>
                                    <th className="p-4 sm:p-5 font-semibold text-center w-36">Part / Poids</th>
                                    <th className="p-4 sm:p-5 font-semibold text-center rounded-tr-3xl no-print">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {recapClasses && recapClasses.length > 0 ? (
                                    recapClasses.map((c, idx) => (
                                        <tr key={c.classe_id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors text-xs sm:text-sm">
                                            <td className="p-4 sm:p-5 text-center font-black text-slate-400">
                                                #{idx + 1}
                                            </td>
                                            <td className="p-4 sm:p-5 font-extrabold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-purple-500 shrink-0" />
                                                    <span>{c.classe_nom}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5 capitalize">
                                                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                                                    {c.classe_type}
                                                </span>
                                            </td>
                                            <td className="p-4 sm:p-5 text-center font-bold text-slate-700 dark:text-slate-300">
                                                {c.nb_eleves}
                                            </td>
                                            <td className="p-4 sm:p-5 text-center font-bold text-slate-700 dark:text-slate-300">
                                                {c.nb_operations} ({c.nb_flux} flux)
                                            </td>
                                            <td className="p-4 sm:p-5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {Number(c.scolarite).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="p-4 sm:p-5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                                                {Number(c.annexes).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="p-4 sm:p-5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base whitespace-nowrap">
                                                {formatFCFA(c.total)}
                                            </td>
                                            <td className="p-4 sm:p-5 text-center">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                        <span>{c.pourcentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                                                            style={{ width: `${Math.min(100, Math.max(3, c.pourcentage))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 sm:p-5 text-center no-print whitespace-nowrap">
                                                <button
                                                    onClick={() => {
                                                        setFilterClasse(String(c.classe_id));
                                                        setViewMode('operations');
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                                                    title="Filtrer et afficher tous les flux de cette classe"
                                                >
                                                    <Filter className="w-3.5 h-3.5" />
                                                    <span>Détails flux</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="p-8 text-center text-slate-400 italic">
                                            Aucun encaissement trouvé par classe pour ces critères de recherche.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {recapClasses && recapClasses.length > 0 && (
                                <tfoot className="bg-slate-50 dark:bg-slate-900/80 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                                    <tr>
                                        <td colSpan="3" className="p-4 sm:p-5 uppercase text-xs tracking-wider">
                                            Totaux Généraux :
                                        </td>
                                        <td className="p-4 sm:p-5 text-center font-mono font-black text-slate-900 dark:text-white">
                                            {recapClasses.reduce((acc, c) => acc + (c.nb_eleves || 0), 0)} élève(s)
                                        </td>
                                        <td className="p-4 sm:p-5 text-center font-mono font-black text-slate-900 dark:text-white">
                                            {recapClasses.reduce((acc, c) => acc + (c.nb_operations || 0), 0)} quittance(s)
                                        </td>
                                        <td className="p-4 sm:p-5 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                                            {formatFCFA(recapClasses.reduce((acc, c) => acc + (c.scolarite || 0), 0))}
                                        </td>
                                        <td className="p-4 sm:p-5 text-right font-mono font-black text-purple-600 dark:text-purple-400">
                                            {formatFCFA(recapClasses.reduce((acc, c) => acc + (c.annexes || 0), 0))}
                                        </td>
                                        <td className="p-4 sm:p-5 text-right font-mono text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                            {formatFCFA(recapClasses.reduce((acc, c) => acc + (c.total || 0), 0))}
                                        </td>
                                        <td className="p-4 sm:p-5 text-center font-black text-emerald-600 dark:text-emerald-400">
                                            100%
                                        </td>
                                        <td className="p-4 sm:p-5 text-center no-print">
                                            <a
                                                href={route('paiements.journal', {
                                                    annee_scolaire_id: selectedAnnee,
                                                    mode_paiement: selectedMode || undefined,
                                                    date_debut: dateDebut || undefined,
                                                    date_fin: dateFin || undefined,
                                                    search: search || undefined,
                                                    vue: 'classe',
                                                })}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                <span>Imprimer A4</span>
                                            </a>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0B1A2D] text-slate-300 uppercase text-[10px] font-black tracking-wider">
                                <tr>
                                    <th className="p-4 sm:p-5 font-semibold rounded-tl-3xl">{t("date", "Date & Heure")}</th>
                                    <th className="p-4 sm:p-5 font-semibold text-white">{t("student", "Élève (Débiteur)")}</th>
                                    <th className="p-4 sm:p-5 font-semibold">{t("frais_type", "Motif / Période")}</th>
                                    <th className="p-4 sm:p-5 font-semibold">{t("mode", "Règlement")}</th>
                                    <th className="p-4 sm:p-5 font-semibold">{t("cashier", "Encaissé par")}</th>
                                    <th className="p-4 sm:p-5 font-semibold text-right text-white">{t("amount", "Montant")}</th>
                                    <th className="p-4 sm:p-5 font-semibold text-center rounded-tr-3xl no-print">{t("actions", "Actions")}</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {viewMode === 'operations' ? (
                                groupedOperations.length > 0 ? (
                                    groupedOperations.map((group) => (
                                        <React.Fragment key={group.key}>
                                            <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group text-xs sm:text-sm">
                                                
                                                {/* Date & Reçu */}
                                                <td className="p-4 sm:p-5 whitespace-nowrap">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">
                                                        {new Date(group.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[10px] font-medium text-slate-400">
                                                        {group.created_at ? new Date(group.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 inline-block">
                                                            {group.reference_recu}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Élève & Classe */}
                                                <td className="p-4 sm:p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 shrink-0 text-xs border border-slate-200 dark:border-slate-600">
                                                            {(group.inscription?.eleve?.user?.nom || "?")[0]}
                                                            {(group.inscription?.eleve?.user?.prenom || "?")[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-slate-900 dark:text-white uppercase truncate">
                                                                {group.inscription?.eleve?.user?.nom} {group.inscription?.eleve?.user?.prenom}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                                                                    {group.inscription?.classe?.nom || 'N/A'}
                                                                </span>
                                                                {group.inscription?.eleve?.matricule && (
                                                                    <span className="text-[10px] font-mono text-slate-400">
                                                                        {group.inscription.eleve.matricule}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Motif & Ventilation */}
                                                <td className="p-4 sm:p-5">
                                                    {group.items.length === 1 ? (
                                                        <div>
                                                            <span className={`font-bold inline-block text-xs px-2.5 py-1 rounded-lg border ${group.items[0].frais_type?.is_scolarite
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                            }`}>
                                                                {group.items[0].frais_type?.nom || "Frais"}
                                                            </span>
                                                            {group.items[0].mois && (
                                                                <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                                    <span>Mois : {group.items[0].mois}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="font-bold inline-block text-xs px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                                                    {group.is_inscription_pack ? "📦 Pack Inscription & Fournitures" : "📑 Règlement Groupé"}
                                                                </span>
                                                                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                                                                    {group.items.length} rubriques
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleGroup(group.key)}
                                                                className="mt-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors no-print"
                                                            >
                                                                {expandedGroups[group.key] ? (
                                                                    <>
                                                                        <ChevronUp className="w-3.5 h-3.5" />
                                                                        <span>Masquer le détail</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="w-3.5 h-3.5" />
                                                                        <span>Voir le détail ({group.items.length} rubriques)</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                            <div className="print-only text-[10px] text-slate-600 mt-1">
                                                                {group.items.map(it => `${it.frais_type?.nom || 'Frais'}: ${Number(it.montant).toLocaleString('fr-FR')} F`).join(' • ')}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Mode de règlement */}
                                                <td className="p-4 sm:p-5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border
                                                        ${group.mode_paiement === 'especes' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                                                            group.mode_paiement === 'mobile' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' :
                                                                'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'}`}>
                                                        {group.mode_paiement === 'especes' && '💵'}
                                                        {group.mode_paiement === 'mobile' && '📱'}
                                                        {(group.mode_paiement === 'virement' || group.mode_paiement === 'cheque') && '🏦'}
                                                        <span>{group.mode_paiement}</span>
                                                    </span>
                                                </td>

                                                {/* Encaissé par */}
                                                <td className="p-4 sm:p-5">
                                                    {group.user ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                                {(group.user.nom || 'A')[0]}
                                                            </span>
                                                            <span>{group.user.nom} {group.user.prenom ? group.user.prenom[0] + '.' : ''}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Caisse Principale</span>
                                                    )}
                                                </td>

                                                {/* Montant Total */}
                                                <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                                                    <div className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                                                        {Number(group.total_montant).toLocaleString('fr-FR')} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 sm:p-5 text-center no-print">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {group.is_inscription_pack && group.inscription_id ? (
                                                            <a
                                                                href={route('inscriptions.recu', group.inscription_id)}
                                                                target="_blank"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 rounded-xl transition-all shadow-sm font-bold text-xs border border-emerald-200 dark:border-emerald-800"
                                                                title="Imprimer le Reçu d'Inscription Officiel complet"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                                <span className="hidden sm:inline">Reçu Global</span>
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={route('paiements.recu', group.items[0].id)}
                                                                target="_blank"
                                                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition-all shadow-sm"
                                                                title="Imprimer le Reçu Officiel"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </a>
                                                        )}

                                                        {can('supprimer_paiements') && group.items.length === 1 && (
                                                            <button
                                                                onClick={() => destroy(group.items[0].id)}
                                                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl transition-all shadow-sm"
                                                                title={t("delete", "Supprimer")}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* SOUS-LIGNE DÉPLIABLE : VENTILATION DÉTAILLÉE DU PACK */}
                                            {expandedGroups[group.key] && (
                                                <tr className="bg-slate-50/90 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700">
                                                    <td colSpan="7" className="p-3 sm:px-6">
                                                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                                                                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                                                    <span>📋 Ventilation des {group.items.length} rubriques</span>
                                                                    <span className="font-mono text-slate-500">#{group.reference_recu}</span>
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                                    Total Quittance : {Number(group.total_montant).toLocaleString('fr-FR')} FCFA
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                                                {group.items.map((it) => (
                                                                    <div key={it.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center text-xs">
                                                                        <div>
                                                                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                                                                {it.frais_type?.nom || "Rubrique"}
                                                                            </span>
                                                                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                                                                                {it.frais_type?.code || 'ANNEXE'} • ID #{it.id}
                                                                            </span>
                                                                        </div>
                                                                        <span className="font-mono font-black text-slate-900 dark:text-white shrink-0 ml-2">
                                                                            {Number(it.montant).toLocaleString('fr-FR')} F
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                                    <Wallet className="w-8 h-8 opacity-50" />
                                                </div>
                                                <p className="font-bold text-base text-slate-700 dark:text-slate-300">
                                                    {t("no_payments", "Aucun encaissement trouvé.")}
                                                </p>
                                                <p className="text-xs mt-1 text-slate-400">
                                                    Modifiez vos filtres ou enregistrez un nouveau paiement.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ) : (
                                /* VUE DÉTAILLÉE FLUX PAR FLUX */
                                displayedPaiements.length > 0 ? (
                                    displayedPaiements.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group text-xs sm:text-sm">
                                            
                                            {/* Date */}
                                            <td className="p-4 sm:p-5 whitespace-nowrap">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                                    {new Date(p.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </div>
                                                <div className="text-[10px] font-medium text-slate-400">
                                                    {p.created_at ? new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                                {p.reference_recu && (
                                                    <div className="mt-1">
                                                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                            {p.reference_recu}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Élève & Classe */}
                                            <td className="p-4 sm:p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 shrink-0 text-xs border border-slate-200 dark:border-slate-600">
                                                        {(p.inscription?.eleve?.user?.nom || "?")[0]}
                                                        {(p.inscription?.eleve?.user?.prenom || "?")[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 dark:text-white uppercase truncate">
                                                            {p.inscription?.eleve?.user?.nom} {p.inscription?.eleve?.user?.prenom}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                                                                {p.inscription?.classe?.nom || 'N/A'}
                                                            </span>
                                                            {p.inscription?.eleve?.matricule && (
                                                                <span className="text-[10px] font-mono text-slate-400">
                                                                    {p.inscription.eleve.matricule}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Motif & Période */}
                                            <td className="p-4 sm:p-5">
                                                <div>
                                                    <span className={`font-bold inline-block text-xs px-2.5 py-1 rounded-lg border ${p.frais_type?.is_scolarite
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                    }`}>
                                                        {p.frais_type?.nom || "Frais"}
                                                    </span>
                                                    {p.mois && (
                                                        <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-slate-400" />
                                                            <span>Mois : {p.mois}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Mode de règlement */}
                                            <td className="p-4 sm:p-5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border
                                                    ${p.mode_paiement === 'especes' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                                                        p.mode_paiement === 'mobile' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' :
                                                            'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'}`}>
                                                    {p.mode_paiement === 'especes' && '💵'}
                                                    {p.mode_paiement === 'mobile' && '📱'}
                                                    {(p.mode_paiement === 'virement' || p.mode_paiement === 'cheque') && '🏦'}
                                                    <span>{p.mode_paiement}</span>
                                                </span>
                                            </td>

                                            {/* Encaissé par */}
                                            <td className="p-4 sm:p-5">
                                                {p.user ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                            {(p.user.nom || 'A')[0]}
                                                        </span>
                                                        <span>{p.user.nom} {p.user.prenom ? p.user.prenom[0] + '.' : ''}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Caisse Principale</span>
                                                )}
                                            </td>

                                            {/* Montant */}
                                            <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                                                <div className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                                                    {Number(p.montant).toLocaleString('fr-FR')} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 sm:p-5 text-center no-print">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <a
                                                        href={route('paiements.recu', p.id)}
                                                        target="_blank"
                                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition-all shadow-sm"
                                                        title="Imprimer le Reçu Officiel"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </a>

                                                    {can('supprimer_paiements') && (
                                                        <button
                                                            onClick={() => destroy(p.id)}
                                                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl transition-all shadow-sm"
                                                            title={t("delete", "Supprimer")}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                                    <Wallet className="w-8 h-8 opacity-50" />
                                                </div>
                                                <p className="font-bold text-base text-slate-700 dark:text-slate-300">
                                                    {t("no_payments", "Aucun encaissement trouvé.")}
                                                </p>
                                                <p className="text-xs mt-1 text-slate-400">
                                                    Modifiez vos filtres ou enregistrez un nouveau paiement.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}

                {/* PIED DU TABLEAU : TOTAL ENCAISSÉ DE LA SÉLECTION */}
                {viewMode !== 'classes' && displayedPaiements.length > 0 && (
                    <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-semibold text-slate-300">
                            Page {paiements.current_page || 1} sur {paiements.last_page || 1} • {viewMode === 'operations' ? `${groupedOperations.length} quittance(s) (${displayedPaiements.length} flux ventilés)` : `${displayedPaiements.length} flux au total`}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Encaissé (Sélection) :</span>
                            <span className="text-xl font-black font-mono text-emerald-400">
                                {formatFCFA(stats?.total_filtre || stats?.total_annee)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {viewMode !== 'classes' && paiements.links && paiements.links.length > 3 && (
                <div className="mt-8 flex flex-wrap gap-2 justify-center no-print">
                    {paiements.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            preserveScroll
                            preserveState
                            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${link.active
                                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* ZONE DE SIGNATURE POUR IMPRESSION DU BORDEREAU */}
            <div className="print-only mt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                    <p className="font-bold mb-12">Le Caissier / L'Opérateur</p>
                    <div className="border-b border-dotted border-slate-500 w-3/4 mx-auto"></div>
                </div>
                <div>
                    <p className="font-bold mb-12">Le Chef Comptable</p>
                    <div className="border-b border-dotted border-slate-500 w-3/4 mx-auto"></div>
                </div>
                <div>
                    <p className="font-bold mb-12">Le Chef d'Établissement</p>
                    <div className="border-b border-dotted border-slate-500 w-3/4 mx-auto"></div>
                </div>
            </div>

            {/* MODAL PAIEMENT GENERAL / FRAIS ANNEXES */}
            <Modal show={generalModalOpen} onClose={() => { setGeneralModalOpen(false); setPreselectedInscriptionId(null); }} maxWidth="3xl">
                <StandardPaymentForm
                    inscriptions={inscriptions}
                    fraisTypes={fraisTypes}
                    fraisClasses={fraisClasses}
                    preselectedInscriptionId={preselectedInscriptionId}
                    onClose={() => { setGeneralModalOpen(false); setPreselectedInscriptionId(null); }}
                />
            </Modal>

            {/* MODAL ENCAISSER SCOLARITE */}
            <Modal show={scolariteModalOpen} onClose={() => { setScolariteModalOpen(false); setPreselectedInscriptionId(null); }} maxWidth="6xl">
                <ScolaritePaymentForm
                    inscriptions={inscriptions}
                    classes={classes}
                    fraisTypes={fraisTypes}
                    fraisClasses={fraisClasses}
                    preselectedInscriptionId={preselectedInscriptionId}
                    onClose={() => { setScolariteModalOpen(false); setPreselectedInscriptionId(null); }}
                />
            </Modal>

        </DashboardLayout>
    );
}
