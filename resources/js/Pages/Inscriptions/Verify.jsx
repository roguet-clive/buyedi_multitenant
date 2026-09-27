import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    CheckBadgeIcon, 
    XCircleIcon, 
    PrinterIcon, 
    BuildingLibraryIcon, 
    UserIcon, 
    CalendarIcon, 
    AcademicCapIcon, 
    ShieldCheckIcon,
    IdentificationIcon,
    DocumentCheckIcon
} from '@heroicons/react/24/solid';

export default function Verify({ inscription, code, etablissement }) {
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
            <Head title={`Vérification d'Authenticité • ${inscription?.eleve_nom_complet || code}`} />

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
                {inscription ? (
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                        {/* Top decorative gradient glow */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>

                        {/* Status Stamp */}
                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-700/60">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
                                <CheckBadgeIcon className="w-10 h-10 text-emerald-400" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                ✓ Document Scolaire Authentique & Certifié
                            </span>
                            <h3 className="text-2xl font-black text-white mt-2 font-mono tracking-tight">
                                #{inscription.eleve_matricule}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Enregistré(e) dans les registres académiques officiels • Statut : <span className="text-emerald-400 font-bold uppercase">{inscription.statut}</span>
                            </p>
                        </div>

                        {/* Identity & Academic Level Highlight */}
                        <div className="my-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/20 text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                                Élève Régulièrement Inscrit(e)
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase block">
                                {inscription.eleve_nom_complet}
                            </span>
                            <div className="mt-2 text-xs font-bold text-slate-300 flex items-center justify-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Classe : {inscription.classe_nom}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                    {inscription.reinscription ? 'Réinscription' : 'Nouvelle Inscription'}
                                </span>
                            </div>
                        </div>

                        {/* Inscription & Academic details */}
                        <div className="space-y-3.5 text-xs sm:text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <IdentificationIcon className="w-4 h-4 text-slate-500" /> Matricule Officiel :
                                </span>
                                <span className="font-mono font-black text-white">
                                    {inscription.eleve_matricule}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <AcademicCapIcon className="w-4 h-4 text-slate-500" /> Année Académique :
                                </span>
                                <span className="font-bold text-slate-200">
                                    {inscription.annee_scolaire_nom}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <BuildingLibraryIcon className="w-4 h-4 text-slate-500" /> Établissement :
                                </span>
                                <span className="font-bold text-slate-200 text-right">
                                    {etablissement?.nom || 'Buyedi'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <CalendarIcon className="w-4 h-4 text-slate-500" /> Date d'Inscription :
                                </span>
                                <span className="font-bold text-slate-200">
                                    {formatDate(inscription.date_inscription)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-700/40">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                    <DocumentCheckIcon className="w-4 h-4 text-slate-500" /> N° Quittance / Réf :
                                </span>
                                <span className="font-mono font-bold text-slate-300">
                                    {inscription.numero_recu}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-400">Empreinte Sécurisée (UID) :</span>
                                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[190px]">
                                    {inscription.code_securite}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => window.print()}
                                className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer"
                            >
                                <PrinterIcon className="w-4 h-4 text-slate-300" />
                                <span>Imprimer la Fiche de Vérification</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Error / Invalid Document Card */
                    <div className="bg-slate-800/90 border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                            <XCircleIcon className="w-10 h-10 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-black text-rose-400">
                            Document Non Reconnu ou Non Authentifié
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                            Aucune inscription ou document officiel ne correspond au code sécurisé scanné :
                        </p>
                        <div className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800/50 font-mono text-sm font-bold text-rose-300">
                            {code || 'Code non spécifié'}
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            Ce document peut avoir été falsifié ou ne provient pas de l'établissement scolaire.
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
