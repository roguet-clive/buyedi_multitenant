import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import useTranslation from '@/Hooks/useTranslation';
import { 
    AlertTriangle, 
    Download, 
    Printer, 
    Search, 
    Filter, 
    ArrowUpDown, 
    Phone, 
    User, 
    CreditCard, 
    Building2, 
    Clock, 
    ShieldAlert, 
    CheckCircle, 
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import ImpayePaymentModal from './Partials/ImpayePaymentModal';

export default function Impayes({ 
    debiteurs = [], 
    stats = {}, 
    classes = [], 
    annees = [], 
    selectedAnnee, 
    fraisTypes = [],
    filters = {}, 
    etablissement 
}) {
    const { t } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedClasse, setSelectedClasse] = useState(filters.classe_id || '');
    const [selectedNature, setSelectedNature] = useState(filters.nature || 'all');
    const [selectedRetard, setSelectedRetard] = useState(filters.retard || 'all');
    const [payingDebiteur, setPayingDebiteur] = useState(null);

    const formatFCFA = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';

    // Appliquer les filtres
    const handleFilterChange = (newFilters) => {
        router.get(route('paiements.impayes'), {
            annee_scolaire_id: selectedAnnee,
            classe_id: newFilters.classe_id !== undefined ? newFilters.classe_id : selectedClasse,
            search: newFilters.search !== undefined ? newFilters.search : search,
            nature: newFilters.nature !== undefined ? newFilters.nature : selectedNature,
            retard: newFilters.retard !== undefined ? newFilters.retard : selectedRetard,
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Export CSV pour Excel
    const handleExportCSV = () => {
        const headers = [
            "Matricule",
            "Nom et Prénom",
            "Classe",
            "Cycle",
            "Parent / Contact",
            "Scolarité Annuelle",
            "Scolarité Payée",
            "Scolarité Reste à Payer",
            "Mois/Tranches en Retard",
            "Tenue Scolaire",
            "Montant Tenue Impayé",
            "Arriérés Antérieurs",
            "TOTAL RESTANT DÛ"
        ];

        const rows = debiteurs.map(d => [
            `"${d.matricule || ''}"`,
            `"${(d.nom_complet || '').replace(/"/g, '""')}"`,
            `"${d.classe_nom || ''}"`,
            `"${d.is_secondaire ? 'Secondaire' : 'Maternelle/Primaire'}"`,
            `"${d.parent_contact || ''} (${d.parent_nom || ''})"`,
            d.scolarite_annuelle,
            d.scolarite_payee,
            d.scolarite_reste,
            `"${(d.elements_en_retard || []).join(', ')}"`,
            d.tenue_payee ? "Réglée" : "Impayée",
            d.tenue_montant,
            d.arrieres_dette,
            d.total_du
        ]);

        const csvContent = "\uFEFF" + [
            `"ÉTAT GÉNÉRAL DES IMPAYÉS ET RECOUVREMENT - ${etablissement?.nom || 'Établissement Scolaire'}"`,
            `"Date d'export : ${new Date().toLocaleDateString('fr-FR')} - Année : ${annees.find(a => a.id === selectedAnnee)?.nom || 'Active'}"`,
            `"Total Créances : ${stats.total_creances} FCFA - Élèves Débiteurs : ${stats.nb_eleves_debiteurs}"`,
            "",
            headers.join(";"),
            ...rows.map(r => r.join(";"))
        ].join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `etat_impayes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout title={t("unpaid_fees_report", "État des Impayés & Recouvrement")}>
            <Head title="État des Impayés & Recouvrement • Buyedi" />

            {/* EN-TÊTE OFFICIEL POUR IMPRESSION A4 UNIQUEMENT */}
            <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-black uppercase text-black">{etablissement?.nom || 'Établissement Scolaire'}</h1>
                        <p className="text-xs text-slate-700">{[etablissement?.adresse, etablissement?.ville, etablissement?.telephone].filter(Boolean).join(' • ')}</p>
                        <p className="text-xs italic mt-0.5 text-slate-600">Devise : {etablissement?.devise || 'Discipline - Travail - Succès'}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-black uppercase border border-slate-900 px-3 py-1 bg-slate-100 inline-block">
                            ÉTAT DE RECOUVREMENT DES IMPAYÉS
                        </span>
                        <p className="text-xs text-slate-700 mt-1">
                            Date d'édition : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex gap-6 text-xs bg-slate-50 p-2 border border-slate-300">
                    <span><strong>Année scolaire :</strong> {annees.find(a => a.id === selectedAnnee)?.nom || 'En cours'}</span>
                    <span><strong>Nombre de Débiteurs :</strong> {debiteurs.length} élève(s)</span>
                    <span><strong>Total Global Restant Dû :</strong> {formatFCFA(stats.total_creances)}</span>
                </div>
            </div>

            {/* TOP HEADER & ACTIONS (ÉCRAN SEULEMENT) */}
            <div className="no-print flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20 shadow-sm">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    État des Impayés & Recouvrement
                                </h1>
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    {stats.nb_eleves_debiteurs || 0} Débiteur(s)
                                </span>
                                {stats.nb_eleves_echus > 0 && (
                                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                                        🚨 {stats.nb_eleves_echus} en retard échu
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Vue consolidée de la scolarité restant due, tenues impayées et arriérés pour relances des familles.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions groupées */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    {/* Sélecteur Année */}
                    <div className="relative">
                        <select
                            value={selectedAnnee}
                            onChange={(e) => {
                                router.get(route('paiements.impayes'), { annee_scolaire_id: e.target.value }, { preserveState: true });
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 pl-3 pr-8 rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                        >
                            {annees.map(a => (
                                <option key={a.id} value={a.id}>
                                    Année {a.nom} {a.en_cours ? "⭐️" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export Excel / CSV */}
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Exporter CSV / Excel</span>
                    </button>

                    {/* Imprimer A4 */}
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-emerald-400" />
                        <span>Imprimer Rapport A4</span>
                    </button>
                </div>
            </div>

            {/* 4 CARTES KPI STATISTIQUES (ÉCRAN SEULEMENT) */}
            <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* 1. Total Créances Globales */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100/50 dark:from-rose-950/30 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Total Restant Dû</p>
                        <h3 className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-200 mt-1 font-mono">
                            {formatFCFA(stats.total_creances)}
                        </h3>
                        <p className="text-[10px] text-rose-600/80 dark:text-rose-400 mt-1">
                            Cumul scolarité + tenues + arriérés
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                        <CreditCard className="w-6 h-6" />
                    </div>
                </div>

                {/* 2. Scolarité en retard échu */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Scolarité Échue (Retard)</p>
                        <h3 className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 mt-1 font-mono">
                            {formatFCFA(stats.total_scolarite_echue)}
                        </h3>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-400 mt-1">
                            Tranches ou mois dépassés
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* 3. Tenues Scolaires Impayées */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-100/50 dark:from-purple-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-900/40 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">Tenues Non Réglées</p>
                        <h3 className="text-xl sm:text-2xl font-black text-purple-900 dark:text-purple-200 mt-1 font-mono">
                            {formatFCFA(stats.total_tenue_impayee)}
                        </h3>
                        <p className="text-[10px] text-purple-600/80 dark:text-purple-400 mt-1">
                            10 000 F (Mat/Prim) • 15 000 F (Sec)
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0 text-xl font-bold">
                        👕
                    </div>
                </div>

                {/* 4. Arriérés Antérieurs */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">Arriérés Antérieurs</p>
                        <h3 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-200 mt-1 font-mono">
                            {formatFCFA(stats.total_arrieres)}
                        </h3>
                        <p className="text-[10px] text-blue-600/80 dark:text-blue-400 mt-1">
                            Dettes des années passées
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* FILTRES DYNAMIQUES (ÉCRAN SEULEMENT) */}
            <div className="no-print bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Barre de recherche */}
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher élève, matricule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFilterChange({ search });
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                    />
                </div>

                {/* Filtres dropdown */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {/* Filtre Classe */}
                    <div className="relative">
                        <select
                            value={selectedClasse}
                            onChange={(e) => {
                                setSelectedClasse(e.target.value);
                                handleFilterChange({ classe_id: e.target.value });
                            }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl font-bold text-xs cursor-pointer"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre Nature d'impayé */}
                    <div className="relative">
                        <select
                            value={selectedNature}
                            onChange={(e) => {
                                setSelectedNature(e.target.value);
                                handleFilterChange({ nature: e.target.value });
                            }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl font-bold text-xs cursor-pointer"
                        >
                            <option value="all">Tout type d'impayé</option>
                            <option value="scolarite">Scolarité uniquement</option>
                            <option value="tenue">Tenue scolaire uniquement</option>
                            <option value="arriere">Arriérés antérieurs uniquement</option>
                        </select>
                    </div>

                    {/* Filtre Retard échu */}
                    <div className="relative">
                        <select
                            value={selectedRetard}
                            onChange={(e) => {
                                setSelectedRetard(e.target.value);
                                handleFilterChange({ retard: e.target.value });
                            }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 rounded-xl font-bold text-xs cursor-pointer"
                        >
                            <option value="all">Tous les débiteurs</option>
                            <option value="echu_only">🚨 Retard échu uniquement</option>
                        </select>
                    </div>

                    {(search || selectedClasse || selectedNature !== 'all' || selectedRetard !== 'all') && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setSelectedClasse('');
                                setSelectedNature('all');
                                setSelectedRetard('all');
                                router.get(route('paiements.impayes'), { annee_scolaire_id: selectedAnnee });
                            }}
                            className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* TABLEAU DES ÉLÈVES DÉBITEURS */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                <th className="p-3.5 sm:p-4">Élève & Contact</th>
                                <th className="p-3.5 sm:p-4">Classe</th>
                                <th className="p-3.5 sm:p-4">Scolarité (Versé / Total)</th>
                                <th className="p-3.5 sm:p-4">Mois / Tranches en Retard</th>
                                <th className="p-3.5 sm:p-4">Tenue</th>
                                <th className="p-3.5 sm:p-4">Arriérés</th>
                                <th className="p-3.5 sm:p-4 text-right">Total Restant Dû</th>
                                <th className="p-3.5 sm:p-4 text-center no-print">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                            {debiteurs.length > 0 ? (
                                debiteurs.map((d, index) => {
                                    const hasRetardEchu = (d.elements_en_retard || []).length > 0;
                                    return (
                                        <tr 
                                            key={d.inscription_id || index}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            {/* Élève */}
                                            <td className="p-3.5 sm:p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center text-xs shrink-0">
                                                        {d.nom_complet?.charAt(0) || 'E'}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={route('eleves.show', d.eleve_id)}
                                                            className="font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                                                        >
                                                            <span>{d.nom_complet}</span>
                                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 no-print" />
                                                        </Link>
                                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                                                            <span>Mat: {d.matricule}</span>
                                                            {d.parent_contact && d.parent_contact !== 'N/A' && (
                                                                <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-sans">
                                                                    <Phone className="w-3 h-3" />
                                                                    <span>{d.parent_contact}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Classe */}
                                            <td className="p-3.5 sm:p-4 font-bold text-slate-800 dark:text-slate-200">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{d.classe_nom}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 capitalize block">
                                                    {d.is_secondaire ? 'Secondaire' : 'Mat/Prim'}
                                                </span>
                                            </td>

                                            {/* Scolarité */}
                                            <td className="p-3.5 sm:p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {formatFCFA(d.scolarite_reste)}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    Payé : {formatFCFA(d.scolarite_payee)} / {formatFCFA(d.scolarite_annuelle)}
                                                </div>
                                            </td>

                                            {/* Retards échus */}
                                            <td className="p-3.5 sm:p-4">
                                                {hasRetardEchu ? (
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap gap-1">
                                                            {d.elements_en_retard.map((el, i) => (
                                                                <span 
                                                                    key={i}
                                                                    className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                                                >
                                                                    {el}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                                                            Montant échu : {formatFCFA(d.scolarite_retard_montant)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5" /> À jour d'échéance
                                                    </span>
                                                )}
                                            </td>

                                            {/* Tenue */}
                                            <td className="p-3.5 sm:p-4">
                                                {d.tenue_payee ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                        ✓ Réglée
                                                    </span>
                                                ) : (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                                            ⏳ Non Réglée
                                                        </span>
                                                        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold block">
                                                            {formatFCFA(d.tenue_montant)}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Arriérés */}
                                            <td className="p-3.5 sm:p-4">
                                                {d.arrieres_dette > 0 ? (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                                                            Dette passée
                                                        </span>
                                                        <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-bold block">
                                                            {formatFCFA(d.arrieres_dette)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs font-mono">-</span>
                                                )}
                                            </td>

                                            {/* Total restant dû */}
                                            <td className="p-3.5 sm:p-4 text-right">
                                                <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                                                    {formatFCFA(d.total_du)}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-3.5 sm:p-4 text-center no-print">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={route('eleves.show', d.eleve_id)}
                                                        title="Voir la fiche financière de l'élève"
                                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                                                    >
                                                        <User className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => setPayingDebiteur(d)}
                                                        title="Encaisser un versement direct pour cet élève"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        <span>Encaisser</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-12 text-center text-slate-400">
                                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                                            Aucun impayé trouvé pour les critères sélectionnés !
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Tous les élèves sont à jour ou aucune donnée ne correspond aux filtres.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {debiteurs.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 font-black text-xs text-slate-900 dark:text-white">
                                    <td colSpan="2" className="p-4 uppercase">
                                        TOTAL GÉNÉRAL ({debiteurs.length} élèves débiteurs)
                                    </td>
                                    <td className="p-4 font-mono">
                                        {formatFCFA(stats.total_scolarite_reste)}
                                    </td>
                                    <td className="p-4 font-mono text-rose-600">
                                        {formatFCFA(stats.total_scolarite_echue)} échu
                                    </td>
                                    <td className="p-4 font-mono text-amber-600">
                                        {formatFCFA(stats.total_tenue_impayee)}
                                    </td>
                                    <td className="p-4 font-mono text-purple-600">
                                        {formatFCFA(stats.total_arrieres)}
                                    </td>
                                    <td className="p-4 text-right font-mono text-rose-600 text-sm">
                                        {formatFCFA(stats.total_creances)}
                                    </td>
                                    <td className="no-print"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* SIGNATURE SECTION POUR IMPRESSION A4 UNIQUEMENT */}
            <div className="hidden print:block mt-8 pt-6 text-xs">
                <div className="text-right text-[11px] font-medium text-slate-700 mb-6">
                    Fait à {etablissement?.ville || 'Libreville'}, le {new Date().toLocaleDateString('fr-FR')}
                </div>
                <div className="flex justify-between items-start">
                    <div className="w-48 text-center border-t border-slate-800 pt-2">
                        <p className="font-bold">Le Chef Comptable / Économe</p>
                        <p className="text-[10px] text-slate-500 mt-10">(Signature & Date)</p>
                    </div>
                    <div className="w-48 text-center border-t border-slate-800 pt-2">
                        <p className="font-bold">La Direction de l'Établissement</p>
                        <p className="text-[10px] text-slate-500 mt-10">(Sceau & Visa)</p>
                    </div>
                </div>
            </div>

            {/* MODAL LARGE DIRECT DE RÈGLEMENT D'IMPAYÉ */}
            <ImpayePaymentModal
                debiteur={payingDebiteur}
                fraisTypes={fraisTypes}
                onClose={() => setPayingDebiteur(null)}
                formatFCFA={formatFCFA}
            />
        </DashboardLayout>
    );
}
