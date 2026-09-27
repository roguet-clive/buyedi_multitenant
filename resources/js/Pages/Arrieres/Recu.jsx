import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { PrinterIcon, ArrowLeftIcon, ScissorsIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

function ArriereReceiptVoucher({ recu, etablissement, url_verification, copyLabel, copyBadgeColor }) {
    const finCtx = recu.financial_context || {};

    const formatFCFA = (val) => {
        return new Intl.NumberFormat('fr-FR').format(val || 0) + ' FCFA';
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-300 print:border-slate-400 print:p-4 text-slate-800 flex flex-col justify-between h-[138mm] box-border relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-black text-5xl tracking-widest uppercase text-center">
                {etablissement?.sigle || 'BUYEDI'}
            </div>

            {/* TOP BAR / EN-TÊTE ÉTABLISSEMENT */}
            <div>
                <div className="flex items-start justify-between border-b-2 border-slate-800 pb-2 mb-2">
                    {/* Logo & École */}
                    <div className="flex items-center gap-3">
                        {etablissement?.logo ? (
                            <img
                                src={`/storage/${etablissement.logo}`}
                                alt="Logo"
                                className="h-12 w-12 object-contain rounded-lg border border-slate-200 p-0.5"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-slate-900 text-white font-black text-xl flex items-center justify-center">
                                {etablissement?.sigle?.substring(0, 2) || 'SC'}
                            </div>
                        )}
                        <div>
                            <h2 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 leading-none">
                                {etablissement?.nom || 'Établissement Scolaire'}
                            </h2>
                            {etablissement?.sigle && (
                                <span className="text-[10px] font-bold text-blue-800 tracking-wider">
                                    {etablissement.sigle}
                                </span>
                            )}
                            <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                                {[etablissement?.adresse, etablissement?.ville, etablissement?.telephone, etablissement?.email].filter(Boolean).join(' • ')}
                            </p>
                        </div>
                    </div>

                    {/* Titre du document & Badge de copie */}
                    <div className="text-right flex flex-col items-end">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider mb-1 ${copyBadgeColor}`}>
                            {copyLabel}
                        </span>
                        <h1 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            QUITTANCE D'ARRIÉRÉ DE SCOLARITÉ
                        </h1>
                        <span className="text-[10px] font-mono font-bold text-slate-700 mt-0.5">
                            N° {recu.numero_recu}
                        </span>
                    </div>
                </div>

                {/* INFOS ÉLÈVE & CLASSE */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 print:bg-slate-100/60 p-2.5 rounded-lg border border-slate-200 text-[11px] mb-2">
                    <div>
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Élève Débiteur</span>
                        <span className="font-extrabold text-slate-900 uppercase truncate block">
                            {recu.eleve_nom_complet}
                        </span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Classe d'origine</span>
                        <span className="font-bold text-slate-900 block truncate">
                            {recu.classe_origine}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Date d'encaissement</span>
                        <span className="font-medium text-slate-800 block">
                            {recu.date_paiement}
                        </span>
                    </div>
                </div>

                {/* TABLEAU DU VERSEMENT */}
                <div className="border border-slate-300 rounded-lg overflow-hidden mb-2">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase">
                                <th className="py-1.5 px-2.5">Mention Officielle / Désignation</th>
                                <th className="py-1.5 px-2.5">Mode Règlement</th>
                                <th className="py-1.5 px-2.5">Référence / Notes</th>
                                <th className="py-1.5 px-2.5 text-right">Montant Encaissé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr className="bg-white font-medium">
                                <td className="py-2 px-2.5 font-bold text-slate-900">
                                    {recu.mention_officielle}
                                </td>
                                <td className="py-2 px-2.5 capitalize text-slate-700">
                                    {recu.mode_paiement}
                                </td>
                                <td className="py-2 px-2.5 text-slate-600 italic">
                                    {recu.reference_paiement || recu.commentaire || 'Règlement arriéré antérieur'}
                                </td>
                                <td className="py-2 px-2.5 text-right font-black text-slate-900 text-xs">
                                    {formatFCFA(recu.montant)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* CONTEXTE FINANCIER GLOBAL (Dette Initiale vs Déjà Payé vs Reste Dû) */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2 text-[10px] text-slate-700 mb-2">
                    <div className="grid grid-cols-3 gap-2 text-center font-bold">
                        <div>
                            <span className="text-slate-500 font-normal uppercase block">Total Dette ({recu.annee_dette})</span>
                            <span className="text-slate-900 font-bold">{formatFCFA(finCtx.montant_total_dette)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 font-normal uppercase block">Cumul Encaissé</span>
                            <span className="text-emerald-700 font-bold">{formatFCFA(finCtx.total_deja_paye)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 font-normal uppercase block">Reste à Devoir</span>
                            <span className={`font-black ${finCtx.reste_du > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                                {formatFCFA(finCtx.reste_du)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAS DU REÇU : SIGNATURES & QR CODE */}
            <div className="border-t border-slate-200 pt-2 flex items-end justify-between text-[10px]">
                {/* QR Code & Sécurité */}
                <div className="flex items-center gap-2">
                    <div className="p-0.5 bg-white border border-slate-200 rounded">
                        <QRCodeSVG value={url_verification} size={42} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Paiement Enregistré en Comptabilité</span>
                        </div>
                        <span className="text-[9px] text-slate-500 block">
                            Opérateur : {recu.caissier}
                        </span>
                        <span className="text-[8px] text-slate-400 block font-mono">
                            Émis le {recu.created_at}
                        </span>
                    </div>
                </div>

                {/* Cadre Signature & Cachet */}
                <div className="text-center w-36">
                    <span className="text-[9px] font-bold uppercase text-slate-600 block mb-3">
                        Cachet & Signature Caisse
                    </span>
                    <div className="border-b border-dashed border-slate-400 w-full mb-1"></div>
                    <span className="text-[8px] text-slate-400 italic">Caisse Centrale</span>
                </div>
            </div>
        </div>
    );
}

export default function Recu({ recu, etablissement, url_verification }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-slate-800">
            <Head title={`Reçu Arriéré ${recu.numero_recu} - ${recu.eleve_nom_complet}`} />

            {/* BARRE D'ACTIONS ÉCRAN */}
            <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between print:hidden">
                <Link
                    href={route('arrieres.index')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Retour aux arriérés</span>
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md text-sm font-bold transition-all active:scale-95"
                >
                    <PrinterIcon className="w-4 h-4" />
                    <span>Imprimer la Quittance (Format A4)</span>
                </button>
            </div>

            {/* CONTENEUR IMPRIMABLE FORMAT A4 (2 SOUCHES) */}
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl print:shadow-none print:p-0 print:w-full print:max-w-none flex flex-col gap-4">
                {/* 1. SOUCHE ÉLÈVE / PARENT */}
                <ArriereReceiptVoucher
                    recu={recu}
                    etablissement={etablissement}
                    url_verification={url_verification}
                    copyLabel="EXEMPLAIRE ÉLÈVE / PARENT"
                    copyBadgeColor="bg-amber-50 text-amber-800 border-amber-300"
                />

                {/* LIGNE DE DÉCOUPE */}
                <div className="relative flex items-center justify-center py-1">
                    <div className="border-t-2 border-dashed border-slate-300 w-full"></div>
                    <div className="absolute bg-white px-3 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <ScissorsIcon className="w-3.5 h-3.5" />
                        <span>Ligne de découpe</span>
                    </div>
                </div>

                {/* 2. SOUCHE ADMINISTRATION / CAISSE */}
                <ArriereReceiptVoucher
                    recu={recu}
                    etablissement={etablissement}
                    url_verification={url_verification}
                    copyLabel="EXEMPLAIRE COMPTABILITÉ / CAISSE"
                    copyBadgeColor="bg-slate-100 text-slate-800 border-slate-300"
                />
            </div>
        </div>
    );
}
