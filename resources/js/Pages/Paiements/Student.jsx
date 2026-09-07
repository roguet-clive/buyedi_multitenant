import React from 'react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import { 
    CreditCard, 
    Wallet, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Download, 
    Receipt, 
    User, 
    GraduationCap, 
    ArrowUpRight, 
    Calendar,
    Building2,
    ShieldCheck,
    Coins
} from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

export default function Student({ 
    isParent = false, 
    children = [], 
    selectedEleve = null, 
    paiements = [], 
    balance = [], 
    totals = { due: 0, paid: 0, remaining: 0, percent: 0 } 
}) {
    const { t } = useTranslation();

    const formatAmount = (amount) => {
        const val = Number(amount) || 0;
        return val.toLocaleString('fr-FR') + ' FCFA';
    };

    const handleChildChange = (eleveId) => {
        router.get(route('paiements.index'), { eleve_id: eleveId }, { preserveState: true });
    };

    const isFullyPaid = totals.remaining === 0 && totals.due > 0;

    return (
        <DashboardLayout title={isParent ? "Scolarité & Paiements des Enfants" : "Ma Scolarité & Mes Paiements"}>
            <Head title="Scolarité & Paiements" />

            {/* HERO BANNER */}
            <div className="bg-[#0B1A2D] rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden shadow-2xl border border-slate-800 text-white">
                {/* Effets lumineux de fond */}
                <div className="absolute top-0 right-0 -m-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -m-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-emerald-400 text-xs font-bold border border-white/10 tracking-wide uppercase">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            <span>Espace Financier & Caisse</span>
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                                {isParent ? "État de Scolarité de vos Enfants" : "Situation Financière & Scolarité"}
                            </h1>
                            <p className="text-slate-400 text-base font-normal leading-relaxed">
                                {isParent 
                                    ? "Consultez le relevé des versements, les échéances et téléchargez les reçus officiels de caisse." 
                                    : "Suivez vos versements scolaires en temps réel et téléchargez vos justificatifs de paiement certifiés."}
                            </p>
                        </div>

                        {/* SELECTEUR D'ENFANT POUR LES PARENTS */}
                        {isParent && children.length > 0 && (
                            <div className="pt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                                    Sélectionner l'enfant :
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {children.map((child) => (
                                        <button
                                            key={child.id}
                                            onClick={() => handleChildChange(child.id)}
                                            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                                                selectedEleve?.id === child.id
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40 scale-105'
                                                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/10'
                                            }`}
                                        >
                                            <GraduationCap className="w-4 h-4" />
                                            <span>{child.nom_complet}</span>
                                            <span className="opacity-75 font-normal">({child.classe})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BADGE ELEVE SELECTIONNE & PROGRESSION */}
                    {selectedEleve && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full lg:w-80 flex flex-col gap-4 shrink-0 shadow-inner">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-black text-base shadow-sm">
                                    {(selectedEleve.nom_complet?.[0] || 'E')}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-black text-white text-base truncate" title={selectedEleve.nom_complet}>
                                        {selectedEleve.nom_complet}
                                    </h3>
                                    <p className="text-xs text-slate-300 font-medium truncate">
                                        Classe : <strong className="text-white">{selectedEleve.classe}</strong>
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-mono">
                                        Matr. {selectedEleve.matricule}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-white/10">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-300">Progression Scolarité</span>
                                    <span className={isFullyPaid ? "text-emerald-400" : "text-amber-300"}>
                                        {totals.percent}% Réglé
                                    </span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${
                                            isFullyPaid 
                                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400' 
                                                : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                                        }`}
                                        style={{ width: `${Math.max(4, totals.percent)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3 KPI STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Frais Dus */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Wallet className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Montant Total Annuel
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatAmount(totals.due)}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Frais scolaires exigibles
                        </p>
                    </div>
                </div>

                {/* Total Versé */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Total Déjà Encaissé
                        </p>
                        <h2 className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {formatAmount(totals.paid)}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {paiements.length} versement(s) enregistré(s)
                        </p>
                    </div>
                </div>

                {/* Reste à Payer */}
                <div className={`rounded-3xl p-6 shadow-xl border flex items-center gap-5 sm:col-span-2 lg:col-span-1 ${
                    isFullyPaid 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' 
                        : totals.remaining > 0 
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        isFullyPaid 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                    }`}>
                        {isFullyPaid ? <ShieldCheck className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Reste à Régler
                        </p>
                        <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${
                            isFullyPaid 
                                ? 'text-emerald-700 dark:text-emerald-300' 
                                : 'text-amber-600 dark:text-amber-400'
                        }`}>
                            {formatAmount(totals.remaining)}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {isFullyPaid ? "✅ Scolarité entièrement soldée" : "Solde restant pour l'année"}
                        </p>
                    </div>
                </div>
            </div>

            {/* GRILLES DE DETAILS & HISTORIQUE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                
                {/* 1. TABLEAU DES FRAIS DE CLASSE (7 Cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 md:p-7 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-indigo-500" />
                                    Détail des Frais & Scolarité
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Ventilation par type de rubrique pour l'année scolaire en cours
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 uppercase text-[11px] font-black tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Rubrique</th>
                                        <th className="px-6 py-4 text-right">Montant Exigible</th>
                                        <th className="px-6 py-4 text-right">Déjà Réglé</th>
                                        <th className="px-6 py-4 text-right">Reste</th>
                                        <th className="px-6 py-4 text-center">État</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {balance.length > 0 ? (
                                        balance.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4.5">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {item.type}
                                                    </div>
                                                    {item.is_scolarite && (
                                                        <span className="inline-block mt-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                                                            Scolarité Principale
                                                        </span>
                                                    )}
                                                    {item.is_scolarite && item.echeances && item.echeances.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-md">
                                                            {item.echeances.map((ech) => (
                                                                <span
                                                                    key={ech.id}
                                                                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                                                >
                                                                    {ech.nom}: <strong>{Number(ech.montant).toLocaleString('fr-FR')} F</strong>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4.5 text-right font-semibold text-slate-600 dark:text-slate-300">
                                                    {formatAmount(item.du)}
                                                </td>
                                                <td className="px-6 py-4.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatAmount(item.paye)}
                                                </td>
                                                <td className="px-6 py-4.5 text-right font-black text-slate-900 dark:text-white">
                                                    {formatAmount(item.reste)}
                                                </td>
                                                <td className="px-6 py-4.5 text-center">
                                                    {item.status === 'paye' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1 rounded-full">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Soldé
                                                        </span>
                                                    ) : item.status === 'partiel' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/70 dark:bg-amber-900/40 dark:text-amber-300 px-3 py-1 rounded-full">
                                                            <Clock className="w-3.5 h-3.5" /> Partiel ({item.percent}%)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100/70 dark:bg-red-900/40 dark:text-red-300 px-3 py-1 rounded-full">
                                                            <AlertCircle className="w-3.5 h-3.5" /> En attente
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                                Aucune grille de frais assignée pour cette classe.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Récapitulatif */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Total Scolarité & Frais
                        </span>
                        <div className="text-right">
                            <span className="text-lg font-black text-slate-900 dark:text-white">
                                {formatAmount(totals.due)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. HISTORIQUE DES VERSEMENTS & REÇUS (5 Cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 md:p-7 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-emerald-500" />
                                    Versements & Reçus
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Historique certifié des règlements effectués
                                </p>
                            </div>
                            <span className="text-xs font-extrabold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                {paiements.length} Reçu(s)
                            </span>
                        </div>

                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-[480px] overflow-y-auto">
                            {paiements.length > 0 ? (
                                paiements.map((paiement) => (
                                    <div key={paiement.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                                    {paiement.frais_type?.nom || 'Paiement Scolarité'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(paiement.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span>&bull;</span>
                                                <span className="capitalize font-medium text-slate-500 dark:text-slate-400">
                                                    {paiement.mode_paiement}
                                                </span>
                                            </div>

                                            {paiement.mois && (
                                                <p className="text-[11px] text-slate-400">
                                                    Période : {paiement.mois}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                                    {formatAmount(paiement.montant)}
                                                </p>
                                                <p className="text-[10px] font-mono text-slate-400">
                                                    REC-{String(paiement.id).padStart(6, '0')}
                                                </p>
                                            </div>

                                            <a
                                                href={route('paiements.recu', paiement.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm group active:scale-95"
                                                title="Télécharger le Reçu Officiel"
                                            >
                                                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400 italic space-y-2">
                                    <Coins className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                    <p className="font-bold text-slate-700 dark:text-slate-300">Aucun versement enregistré</p>
                                    <p className="text-xs text-slate-500">Les reçus de caisse apparaîtront ici dès que les règlements seront effectués.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bloc Informations de Caisse */}
                    <div className="p-6 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-indigo-500 shrink-0" />
                        <span>Tous les reçus téléchargés sont certifiés par la signature numérique et le QR code officiel de l'établissement.</span>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
