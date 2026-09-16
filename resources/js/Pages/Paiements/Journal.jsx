import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Printer, 
    ArrowLeft, 
    Wallet, 
    CreditCard, 
    Banknote, 
    ShieldCheck, 
    Building2, 
    FileText, 
    Users, 
    BookOpen, 
    Layers 
} from 'lucide-react';

export default function Journal({ paiements = [], par_classe = [], stats = {}, meta = {} }) {
    const { etablissement } = usePage().props;
    const [viewMode, setViewMode] = useState(meta.vue_initiale === 'classe' ? 'classe' : 'details');

    const handlePrint = () => {
        window.print();
    };

    const formatFCFA = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';

    // Totaux cumulés pour la vue par classe
    const totalElevesParClasse = (par_classe || []).reduce((acc, c) => acc + (c.nb_eleves || 0), 0);
    const totalOperationsParClasse = (par_classe || []).reduce((acc, c) => acc + (c.nb_operations || 0), 0);
    const totalScolarite = stats.total_scolarite ?? (par_classe || []).reduce((acc, c) => acc + (c.scolarite || 0), 0);
    const totalAnnexes = stats.total_annexes ?? (par_classe || []).reduce((acc, c) => acc + (c.annexes || 0), 0);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
            <Head title={`${viewMode === 'classe' ? 'État Caisse par Classe' : 'Bordereau de Caisse'} - ${meta.annee || 'Buyedi'}`} />

            {/* STYLES SPÉCIFIQUES POUR IMPRESSION A4 PAYSAGE */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 8mm 10mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-size: 11px;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* BARRE D'ACTIONS & SÉLECTEUR DE FORMAT (CACHÉE À L'IMPRESSION) */}
            <div className="w-full max-w-[280mm] mb-5 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('paiements.index', {
                            annee_scolaire_id: meta.annee_id,
                        })}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au journal de caisse
                    </Link>

                    {/* COMMUTATEUR DE VUE / ÉTAT OFFICIEL */}
                    <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setViewMode('details')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'details'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Listing Détaillé</span>
                            <span className="text-[10px] bg-slate-700/50 text-white px-1.5 py-0.5 rounded-full">
                                {paiements.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('classe')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                viewMode === 'classe'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>État Synthétique par Classe</span>
                            <span className="text-[10px] bg-emerald-700/60 text-white px-1.5 py-0.5 rounded-full">
                                {par_classe.length}
                            </span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                    <Printer className="w-5 h-5" />
                    {viewMode === 'classe' ? "Imprimer l'État par Classe (A4)" : "Imprimer le Journal Détaillé (A4)"}
                </button>
            </div>

            {/* FEUILLE OFFICIELLE DU BORDEREAU DE CAISSE */}
            <div className="w-full max-w-[280mm] bg-white shadow-2xl print:shadow-none rounded-2xl print:rounded-none p-8 print:p-0 text-slate-800 relative">
                
                {/* Filigrane en arrière-plan */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none font-black text-8xl tracking-widest uppercase">
                    {etablissement?.sigle || 'BUYEDI'}
                </div>

                {/* EN-TÊTE OFFICIEL DE L'ÉTABLISSEMENT */}
                <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {etablissement?.logo ? (
                            <img
                                src={`/storage/${etablissement.logo}`}
                                alt="Logo"
                                className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-1"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center">
                                {etablissement?.sigle?.substring(0, 2) || 'SC'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-base font-extrabold uppercase text-slate-900 tracking-tight leading-tight">
                                {etablissement?.nom || 'Établissement Scolaire'}
                            </h1>
                            {etablissement?.sigle && (
                                <p className="text-xs font-bold text-blue-800 tracking-wider mt-0.5">
                                    {etablissement.sigle} {etablissement.devise ? `• ${etablissement.devise}` : ''}
                                </p>
                            )}
                            <p className="text-xs text-slate-600 mt-0.5">
                                {[etablissement?.adresse, etablissement?.telephone, etablissement?.email].filter(Boolean).join(' • ')}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`inline-block text-white px-4 py-1.5 rounded-lg ${viewMode === 'classe' ? 'bg-emerald-800' : 'bg-slate-900'}`}>
                            <h2 className="text-sm font-black uppercase tracking-widest">
                                {viewMode === 'classe' ? 'État Récapitulatif des Recettes par Classe' : 'Journal de Caisse & Recettes'}
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Édité le {meta.date_edition} par <span className="font-semibold text-slate-700">{meta.editeur || 'Administration'}</span>
                        </p>
                    </div>
                </div>

                {/* FILTRES & CONTEXTE DE L'ÉDITION */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-slate-700">
                        <span><strong>Année scolaire :</strong> {meta.annee}</span>
                        <span>•</span>
                        <span>
                            <strong>Période :</strong> {meta.date_debut ? `Du ${meta.date_debut} ${meta.date_fin ? `au ${meta.date_fin}` : ''}` : "Toute l'année scolaire"}
                        </span>
                        {meta.classe && meta.classe !== 'Toutes les classes' && (
                            <>
                                <span>•</span>
                                <span><strong>Classe :</strong> {meta.classe}</span>
                            </>
                        )}
                        {meta.mode && meta.mode !== 'TOUS LES MODES' && (
                            <>
                                <span>•</span>
                                <span><strong>Mode :</strong> {meta.mode}</span>
                            </>
                        )}
                        {meta.search && (
                            <>
                                <span>•</span>
                                <span><strong>Recherche :</strong> « {meta.search} »</span>
                            </>
                        )}
                    </div>
                    <div className="font-bold text-slate-900 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                        {viewMode === 'classe' 
                            ? `${par_classe.length} classe(s) concernée(s)` 
                            : `${stats.nb_operations || paiements.length} enregistrement(s)`
                        }
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 1. VUE SYNTHÉTIQUE PAR CLASSE                             */}
                {/* ========================================================= */}
                {viewMode === 'classe' ? (
                    <div>
                        {/* KPIs Spécifiques Synthèse par classe */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Total Recettes Encaissées</span>
                                </div>
                                <div className="text-base font-black font-mono text-emerald-700 mt-0.5">
                                    {formatFCFA(stats.total)}
                                </div>
                            </div>

                            <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-blue-800 flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Scolarités Encaissées</span>
                                </div>
                                <div className="text-base font-black font-mono text-blue-800 mt-0.5">
                                    {formatFCFA(totalScolarite)}
                                </div>
                            </div>

                            <div className="bg-purple-50/70 border border-purple-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-purple-800 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Frais Annexes & Divers</span>
                                </div>
                                <div className="text-base font-black font-mono text-purple-800 mt-0.5">
                                    {formatFCFA(totalAnnexes)}
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Classes ayant généré</span>
                                </div>
                                <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                                    {par_classe.length} classe(s)
                                </div>
                            </div>
                        </div>

                        {/* TABLEAU RÉCAPITULATIF OFFICIEL PAR CLASSE */}
                        <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead className="bg-slate-900 text-white uppercase text-[9px] font-extrabold tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-3 border-r border-slate-700 w-10 text-center">N°</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Classe</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Cycle / Niveau</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700 text-center">Élèves Cotisants</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700 text-center">Nbre Quittances</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700 text-right">Scolarité (FCFA)</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700 text-right">Frais Annexes (FCFA)</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700 text-right bg-slate-800">Total Encaissé (FCFA)</th>
                                        <th className="py-2.5 px-3 text-center w-24">Part (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {par_classe.length > 0 ? (
                                        par_classe.map((c, idx) => (
                                            <tr key={c.classe_id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                                                <td className="py-2 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                                                    {c.classe_nom}
                                                </td>
                                                <td className="py-2 px-3 capitalize text-slate-600 border-r border-slate-200">
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                        {c.classe_type}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-center font-semibold text-slate-800 border-r border-slate-200">
                                                    {c.nb_eleves}
                                                </td>
                                                <td className="py-2 px-3 text-center font-semibold text-slate-800 border-r border-slate-200">
                                                    {c.nb_operations}
                                                </td>
                                                <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                                                    {Number(c.scolarite).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="py-2 px-3 text-right font-mono text-slate-700 border-r border-slate-200">
                                                    {Number(c.annexes).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-200 whitespace-nowrap">
                                                    {Number(c.total).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1 font-bold text-slate-800 text-[10px]">
                                                        <span>{c.pourcentage}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="py-8 text-center text-slate-400 italic">
                                                Aucune opération enregistrée pour les classes sur cette période.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-100 border-t-2 border-slate-800 font-bold text-slate-900">
                                    <tr>
                                        <td colSpan="3" className="py-2.5 px-3 uppercase text-xs tracking-wider">
                                            Totaux Généraux :
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900 border-r border-slate-300">
                                            {totalElevesParClasse} élève(s)
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900 border-r border-slate-300">
                                            {totalOperationsParClasse} quittance(s)
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 border-r border-slate-300">
                                            {Number(totalScolarite).toLocaleString('fr-FR')}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 border-r border-slate-300">
                                            {Number(totalAnnexes).toLocaleString('fr-FR')}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-sm font-black text-emerald-700 bg-emerald-100/50 border-r border-slate-300">
                                            {formatFCFA(stats.total)}
                                        </td>
                                        <td className="py-2.5 px-3 text-center font-bold text-emerald-800">
                                            100%
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* ========================================================= */
                    /* 2. VUE CHRONOLOGIQUE DÉTAILLÉE (PAR QUITTANCE)            */
                    /* ========================================================= */
                    <div>
                        {/* SYNTHÈSE DES ENCAISSEMENTS (KPIs de Caisse) */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1.5">
                                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Total Encaissé</span>
                                </div>
                                <div className="text-base font-black font-mono text-emerald-700 mt-0.5">
                                    {formatFCFA(stats.total)}
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Espèces (Coffre)</span>
                                </div>
                                <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                                    {formatFCFA(stats.especes)}
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Mobile Money</span>
                                </div>
                                <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                                    {formatFCFA(stats.mobile)}
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                                <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Virement / Chèque</span>
                                </div>
                                <div className="text-base font-black font-mono text-slate-900 mt-0.5">
                                    {formatFCFA(stats.banque)}
                                </div>
                            </div>
                        </div>

                        {/* TABLEAU DES MOUVEMENTS DE CAISSE */}
                        <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
                            <table className="w-full text-left border-collapse text-[11px]">
                                <thead className="bg-slate-900 text-white uppercase text-[9px] font-extrabold tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-3 border-r border-slate-700">N° Quittance</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Date</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Matricule</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Élève</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Classe</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Motif / Désignation</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Mode & Réf.</th>
                                        <th className="py-2.5 px-3 border-r border-slate-700">Caissier</th>
                                        <th className="py-2.5 px-3 text-right">Montant (FCFA)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {paiements.length > 0 ? (
                                        paiements.map((p, idx) => (
                                            <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                                                <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                                                    {p.reference_recu}
                                                </td>
                                                <td className="py-2 px-3 text-slate-700 whitespace-nowrap border-r border-slate-200">
                                                    {p.date_paiement}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-200">
                                                    {p.eleve_matricule}
                                                </td>
                                                <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                                                    {p.eleve_nom}
                                                </td>
                                                <td className="py-2 px-3 text-slate-700 font-semibold border-r border-slate-200">
                                                    {p.classe_nom}
                                                </td>
                                                <td className="py-2 px-3 text-slate-800 border-r border-slate-200">
                                                    <span className="font-semibold">{p.motif}</span>
                                                    {p.commentaire && (
                                                        <span className="block text-[9px] text-slate-500 italic mt-0.5">
                                                            {p.commentaire}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 capitalize text-slate-700 border-r border-slate-200 whitespace-nowrap">
                                                    {p.mode_paiement} {p.reference ? `(${p.reference})` : ''}
                                                </td>
                                                <td className="py-2 px-3 text-slate-600 text-[10px] border-r border-slate-200">
                                                    {p.caissier}
                                                </td>
                                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                    {Number(p.montant).toLocaleString('fr-FR')}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="py-8 text-center text-slate-400 italic">
                                                Aucun encaissement trouvé pour cette sélection.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-100 border-t-2 border-slate-800 font-bold text-slate-900">
                                    <tr>
                                        <td colSpan="8" className="py-2.5 px-3 text-right uppercase text-xs tracking-wider">
                                            Total Général Encaissé :
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-sm font-black text-emerald-700">
                                            {formatFCFA(stats.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* ZONE DE SIGNATURE OFFICIELLE POUR CLÔTURE DE BORDEREAU */}
                <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs">
                    <div>
                        <p className="font-bold text-slate-700 mb-14">Le Caissier / L'Opérateur</p>
                        <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto"></div>
                        <p className="text-[9px] text-slate-400 mt-1">Visa & Date</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-700 mb-14">Le Chef Comptable / L'Intendant</p>
                        <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto"></div>
                        <p className="text-[9px] text-slate-400 mt-1">Visa & Date</p>
                    </div>
                    <div>
                        <p className="font-bold text-slate-700 mb-14">Le Chef d'Établissement / La Direction</p>
                        <div className="border-b border-dotted border-slate-400 w-3/4 mx-auto"></div>
                        <p className="text-[9px] text-slate-400 mt-1">Signature & Cachet officiel</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
