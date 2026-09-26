import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckBadgeIcon, 
    XCircleIcon, 
    PrinterIcon, 
    BuildingLibraryIcon, 
    UserIcon, 
    CalendarIcon, 
    BanknotesIcon, 
    ShieldCheckIcon 
} from '@heroicons/react/24/solid';

export default function Verify({ paiement, reference, type_recu = 'paiement', etablissement }) {
    const formatFCFA = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
            <Head title={`Vérification Reçu • ${reference}`} />

            <div className="w-full max-w-lg">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-3 shadow-inner">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                        <span>Système de Certification Buyedi</span>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">
                        {etablissement?.nom || 'Complexe Scolaire Sagesse Divine'}
                    </h2>
                    {etablissement?.devise && (
                        <p className="text-xs text-slate-400 italic mt-0.5 font-serif">
                            « {etablissement.devise} »
                        </p>
                    )}
                </div>

                {/* Main Card */}
                {paiement ? (
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                        {/* Top decorative gradient glow */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>

                        {/* Status Stamp */}
                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-700/60">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
                                <CheckBadgeIcon className="w-10 h-10 text-emerald-400" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                ✓ Quittance Authentique Certifiée
                            </span>
                            <h3 className="text-2xl font-black text-white mt-2 font-mono tracking-tight">
                                #{paiement.reference_recu}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Enregistré le {formatDate(paiement.date_paiement)} dans les registres officiels.
                            </p>
                        </div>

                        {/* Financial Amount Highlight */}
                        <div className="my-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/20 text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                                Montant Encaissé
                            </span>
                            <span className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight font-mono">
                                {formatFCFA(paiement.montant)}
                            </span>
                            <div className="mt-2 text-xs font-bold text-slate-300 capitalize">
                                Règlement : <span className="text-white font-mono uppercase">{paiement.mode_paiement || 'Espèces'}</span>
                            </div>
                        </div>

                        {/* Receipt details */}
                        <div className="space-y-3.5 text-xs sm:text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <UserIcon className="w-4 h-4 text-slate-500" /> Élève :
                                </span>
                                <span className="font-extrabold text-white text-right">
                                    {paiement.eleve_nom_complet}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400">Matricule :</span>
                                <span className="font-mono font-bold text-slate-200">
                                    {paiement.eleve_matricule}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <BuildingLibraryIcon className="w-4 h-4 text-slate-500" /> Classe :
                                </span>
                                <span className="font-bold text-slate-200">
                                    {paiement.classe_nom}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <BanknotesIcon className="w-4 h-4 text-slate-500" /> Motif / Frais :
                                </span>
                                <div className="text-right">
                                    <span className="font-bold text-emerald-400">
                                        {paiement.frais_type_nom}
                                    </span>
                                    {paiement.mois && (
                                        <span className="block text-[11px] text-slate-400 font-mono">
                                            ({paiement.mois})
                                        </span>
                                    )}
                                </div>
                            </div>

                            {paiement.commentaire && (
                                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs text-slate-300">
                                    <span className="font-bold text-slate-400 block mb-0.5">Observations :</span>
                                    {paiement.commentaire}
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <CalendarIcon className="w-4 h-4 text-slate-500" /> Année Scolaire :
                                </span>
                                <span className="font-bold text-slate-200">
                                    {paiement.annee_scolaire_nom}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-400">Agent Encaissier :</span>
                                <span className="font-bold text-slate-300">
                                    {paiement.caissier}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => window.print()}
                                className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                            >
                                <PrinterIcon className="w-4 h-4 text-slate-300" />
                                <span>Imprimer la Fiche de Vérification</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Error / Invalid Receipt Card */
                    <div className="bg-slate-800/90 border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                            <XCircleIcon className="w-10 h-10 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-black text-rose-400">
                            Reçu Non Trouvé ou Invalide
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                            Aucun encaissement ne correspond à la référence ou au code numérique scanné :
                        </p>
                        <div className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 font-mono text-sm font-bold text-rose-300">
                            {reference || 'Code non spécifié'}
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            Veuillez contacter le service de comptabilité de l'établissement pour faire certifier ce document.
                        </p>
                    </div>
                )}

                {/* Footer contacts */}
                <div className="mt-8 text-center text-[11px] text-slate-500 space-y-1">
                    <p>{[etablissement?.adresse, etablissement?.ville, etablissement?.telephone].filter(Boolean).join(' • ')}</p>
                    <p className="text-slate-600 font-mono">Buyedi School ERP • Sécurité & Intégrité des données</p>
                </div>
            </div>
        </div>
    );
}
