import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { PrinterIcon, ArrowLeftIcon, ScissorsIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

function PaymentReceiptVoucher({ paiement, etablissement, url_verification, copyLabel, copyBadgeColor }) {
    const isScolarite = paiement.is_scolarite;
    const finCtx = paiement.financial_context || {};

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-300 print:border-slate-400 print:p-4 text-slate-800 flex flex-col justify-between h-[138mm] box-border relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-black text-6xl tracking-widest uppercase">
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
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                                    {etablissement.sigle} {etablissement.devise ? `• ${etablissement.devise}` : ''}
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
                        <h1 className="text-xs font-black uppercase tracking-wider text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {isScolarite ? "REÇU DE SCOLARITÉ" : "QUITTANCE DE PAIEMENT"}
                        </h1>
                        <span className="text-[10px] font-mono font-bold text-slate-700 mt-0.5">
                            N° {paiement.numero_recu}
                        </span>
                    </div>
                </div>

                {/* INFOS ÉLÈVE & CLASSE (Grille compacte optimisée) */}
                <div className="flex items-start gap-3 bg-slate-50 print:bg-slate-100/60 p-2 rounded-lg border border-slate-200 text-[11px] mb-2">
                    <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Élève</span>
                        <span className="font-extrabold text-slate-900 uppercase truncate block" title={paiement.eleve_nom_complet}>
                            {paiement.eleve_nom_complet}
                        </span>
                    </div>
                    <div className="shrink-0">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Matricule</span>
                        <span className="font-mono font-bold text-slate-800 block">
                            {paiement.eleve_matricule}
                        </span>
                    </div>
                    <div className="shrink-0 max-w-[210px]">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Classe & Année</span>
                        <span className="font-bold text-slate-900 block truncate">
                            {paiement.classe_nom} <span className="text-slate-500 font-normal">({paiement.annee_scolaire_nom})</span>
                        </span>
                    </div>
                    <div className="shrink-0 text-right">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Date d'encaissement</span>
                        <span className="font-medium text-slate-800 block whitespace-nowrap">
                            {paiement.date_paiement}
                        </span>
                    </div>
                </div>

                {/* TABLEAU DU VERSEMENT */}
                <div className="border border-slate-300 rounded-lg overflow-hidden mb-2">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase">
                                <th className="py-1.5 px-2.5">Désignation / Motif</th>
                                <th className="py-1.5 px-2.5">Période / Note</th>
                                <th className="py-1.5 px-2.5">Règlement</th>
                                <th className="py-1.5 px-2.5 text-center">Statut</th>
                                <th className="py-1.5 px-2.5 text-right">Montant Versé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr className="hover:bg-slate-50">
                                <td className="py-1.5 px-2.5 font-bold text-slate-900">
                                    {paiement.frais_type_nom}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-600 text-[10px]">
                                    {paiement.mois ? (
                                        <div>
                                            <span className="font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
                                                {paiement.mois}
                                            </span>
                                            {paiement.commentaire && (
                                                <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                                                    {paiement.commentaire}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span>{paiement.commentaire || '-'}</span>
                                    )}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-700 text-[10px] font-medium">
                                    <span className="capitalize">
                                        {paiement.mode_paiement === 'especes' && '💵 Espèces'}
                                        {paiement.mode_paiement === 'mobile' && '📱 Mobile Money'}
                                        {paiement.mode_paiement === 'virement' && '🏦 Virement'}
                                        {paiement.mode_paiement === 'cheque' && '📝 Chèque'}
                                        {!['especes', 'mobile', 'virement', 'cheque'].includes(paiement.mode_paiement) && paiement.mode_paiement}
                                    </span>
                                </td>
                                <td className="py-1.5 px-2.5 text-center">
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                        <CheckCircleIcon className="w-3 h-3 text-emerald-600 inline" /> Encaissé
                                    </span>
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-mono font-black text-slate-900 text-xs">
                                    {Number(paiement.montant).toLocaleString('fr-FR')} FCFA
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* SITUATION FINANCIÈRE SCOLARITÉ RÉCAPITULATIVE (Si scolarité) */}
                {isScolarite && finCtx.montant_annuel > 0 && (
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg text-[10px] font-medium mb-1">
                        <div>
                            <span className="text-slate-500 block">Scolarité Annuelle Totale :</span>
                            <span className="font-mono font-bold text-slate-800">
                                {Number(finCtx.montant_annuel).toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                        <div className="text-center border-x border-slate-200 px-1">
                            <span className="text-slate-500 block">Cumul Réglé à ce jour :</span>
                            <span className="font-mono font-bold text-emerald-700">
                                {Number(finCtx.total_deja_paye).toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 block">Nouveau Reste à Solder :</span>
                            <span className="font-mono font-extrabold text-rose-600">
                                {Number(finCtx.reste_du).toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER : TOTAL, SIGNATURES & QR CODE */}
            <div className="border-t border-slate-300 pt-2">
                <div className="flex items-end justify-between gap-4">
                    {/* QR Code & Sécurité */}
                    <div className="flex items-center gap-2">
                        {url_verification && (
                            <div className="p-1 bg-white border border-slate-300 rounded shadow-sm shrink-0">
                                <QRCodeSVG value={url_verification} size={44} level="M" />
                            </div>
                        )}
                        <div className="text-[8px] text-slate-500 leading-tight">
                            <p className="font-bold text-slate-700 uppercase">Quittance officielle certifiée</p>
                            <p>Vérifiable par scan QR Code</p>
                            <p className="font-mono text-[7px] text-slate-400 mt-0.5">Réf: {paiement.numero_recu}</p>
                        </div>
                    </div>

                    {/* Bloc Montant Total */}
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-baseline gap-2 border border-slate-900">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Montant Encaissé :</span>
                        <span className="text-sm font-black font-mono text-amber-300">
                            {Number(paiement.montant).toLocaleString('fr-FR')} FCFA
                        </span>
                    </div>

                    {/* Zones Signatures */}
                    <div className="flex gap-6 text-center text-[9px]">
                        <div className="w-28">
                            <span className="text-slate-500 font-bold block mb-5">Le Responsable / Déposant</span>
                            <div className="border-b border-dotted border-slate-400"></div>
                        </div>
                        <div className="w-28">
                            <span className="text-slate-500 font-bold block mb-4">Le Caissier / Comptable</span>
                            <span className="text-[8px] text-slate-400 block font-semibold truncate">{paiement.caissier}</span>
                            <div className="border-b border-dotted border-slate-400"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Recu({ paiement, url_verification }) {
    const { etablissement } = usePage().props;

    const handlePrint = () => {
        window.print();
    };

    if (!paiement) return <div className="p-8 text-center">Chargement du reçu...</div>;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
            <Head title={`Reçu N° ${paiement.numero_recu} - ${paiement.eleve_nom_complet}`} />

            {/* STYLES SPÉCIFIQUES POUR IMPRESSION A4 PARFAITE */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 6mm 8mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* BARRE D'ACTIONS (CACHÉE À L'IMPRESSION) */}
            <div className="w-full max-w-[210mm] mb-5 flex items-center justify-between no-print">
                <Link
                    href={route('paiements.index')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Retour au journal de caisse
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                >
                    <PrinterIcon className="w-5 h-5" />
                    Imprimer le reçu (Format A4 - 2 Volets)
                </button>
            </div>

            {/* CONTENEUR FEUILLE A4 (2 REÇUS SÉPARÉS PAR UNE LIGNE DE DÉCOUPE) */}
            <div className="w-full max-w-[210mm] bg-white shadow-2xl print:shadow-none rounded-2xl print:rounded-none p-5 print:p-0 flex flex-col justify-between">
                
                {/* 1ER VOLET : EXEMPLAIRE PARENT */}
                <PaymentReceiptVoucher
                    paiement={paiement}
                    etablissement={etablissement}
                    url_verification={url_verification}
                    copyLabel="EXEMPLAIRE PARENT / DÉPOSANT"
                    copyBadgeColor="bg-blue-50 text-blue-800 border-blue-200"
                />

                {/* LIGNE HORIZONTALE DE DÉCOUPE / SÉPARATION */}
                <div className="my-3 py-1 flex items-center justify-center relative select-none">
                    <div className="w-full border-t-2 border-dashed border-slate-400"></div>
                    <div className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border border-slate-200 rounded-full py-0.5 shadow-sm">
                        <ScissorsIcon className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                        <span>Ligne de découpe • À détacher</span>
                    </div>
                </div>

                {/* 2ÈME VOLET : EXEMPLAIRE ADMINISTRATION / ARCHIVES */}
                <PaymentReceiptVoucher
                    paiement={paiement}
                    etablissement={etablissement}
                    url_verification={url_verification}
                    copyLabel="EXEMPLAIRE ÉTABLISSEMENT / CAISSE"
                    copyBadgeColor="bg-emerald-50 text-emerald-800 border-emerald-200"
                />

            </div>
        </div>
    );
}
