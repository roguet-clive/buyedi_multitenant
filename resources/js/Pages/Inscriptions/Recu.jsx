import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { PrinterIcon, ArrowLeftIcon, CheckBadgeIcon, ScissorsIcon } from '@heroicons/react/24/solid';

function ReceiptVoucher({ inscription, etablissement, url_verification, copyLabel, copyBadgeColor }) {
    const eleve = inscription.eleve?.user || {};
    const classe = inscription.classe || {};
    const annee = inscription.annee_scolaire || {};
    const paiements = inscription.paiements || [];

    const totalPaye = paiements.length > 0 
        ? paiements.reduce((sum, p) => sum + parseFloat(p.montant || 0), 0)
        : parseFloat(inscription.total_frais || 0);

    const dateRecu = inscription.created_at 
        ? new Date(inscription.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleDateString('fr-FR');

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
                            REÇU D'INSCRIPTION
                        </h1>
                        <span className="text-[10px] font-mono font-bold text-slate-700 mt-0.5">
                            N° {inscription.numero_recu || `REC-${inscription.id}`}
                        </span>
                    </div>
                </div>

                {/* INFOS ÉLÈVE & INSCRIPTION (Grille compacte) */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 print:bg-slate-100/60 p-2 rounded-lg border border-slate-200 text-[11px] mb-2">
                    <div>
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Élève</span>
                        <span className="font-extrabold text-slate-900 uppercase truncate block">
                            {eleve.nom} {eleve.prenom}
                        </span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Matricule</span>
                        <span className="font-mono font-bold text-slate-800 block">
                            {inscription.eleve?.matricule || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Classe & Année</span>
                        <span className="font-bold text-slate-900 block truncate">
                            {classe.nom || '-'} <span className="text-slate-500 font-normal">({annee.nom || '-'})</span>
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block">Date d'émission</span>
                        <span className="font-medium text-slate-800 block">
                            {dateRecu}
                        </span>
                    </div>
                </div>

                {/* TABLEAU DES VERSEMENTS / FRAIS */}
                <div className="border border-slate-300 rounded-lg overflow-hidden mb-2">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase">
                                <th className="py-1 px-2.5">Désignation</th>
                                <th className="py-1 px-2.5">Mode / Réf.</th>
                                <th className="py-1 px-2.5 text-center">Statut</th>
                                <th className="py-1 px-2.5 text-right">Montant Encaissé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paiements.length > 0 ? (
                                paiements.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-1 px-2.5 font-medium text-slate-800">
                                            {p.frais_type?.nom || "Frais d'inscription"}
                                        </td>
                                        <td className="py-1 px-2.5 text-slate-500 text-[10px]">
                                            <span className="capitalize">{p.mode_paiement || 'Espèces'}</span> {p.reference ? `(${p.reference})` : ''}
                                        </td>
                                        <td className="py-1 px-2.5 text-center">
                                            <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                Réglé
                                            </span>
                                        </td>
                                        <td className="py-1 px-2.5 text-right font-mono font-bold text-slate-900">
                                            {parseFloat(p.montant).toLocaleString('fr-FR')} FCFA
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="py-1 px-2.5 font-medium text-slate-800">Frais d'inscription académique</td>
                                    <td className="py-1 px-2.5 text-slate-500 text-[10px]">Espèces</td>
                                    <td className="py-1 px-2.5 text-center">
                                        <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            Validé
                                        </span>
                                    </td>
                                    <td className="py-1 px-2.5 text-right font-mono font-bold text-slate-900">
                                        {totalPaye.toLocaleString('fr-FR')} FCFA
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
                            <p className="font-bold text-slate-700 uppercase">Document officiel certifié</p>
                            <p>Vérifiable par scan QR Code</p>
                            <p className="font-mono text-[7px] text-slate-400 mt-0.5">UID: {inscription.code_securite?.substring(0, 18)}...</p>
                        </div>
                    </div>

                    {/* Bloc Montant Total */}
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg flex flex-col items-end border border-slate-900">
                        {inscription.has_remise && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                                Remise {Number(inscription.remise_pourcentage || 50)}% incluse (-{Number(inscription.remise_montant || 0).toLocaleString('fr-FR')} F)
                            </span>
                        )}
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Versé :</span>
                            <span className="text-sm font-black font-mono text-amber-300">
                                {totalPaye.toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                    </div>

                    {/* Zones Signatures */}
                    <div className="flex gap-6 text-center text-[9px]">
                        <div className="w-28">
                            <span className="text-slate-500 font-bold block mb-5">Le Responsable / Parent</span>
                            <div className="border-b border-dotted border-slate-400"></div>
                        </div>
                        <div className="w-28">
                            <span className="text-slate-500 font-bold block mb-5">La Caisse / Direction</span>
                            <div className="border-b border-dotted border-slate-400"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Recu({ inscription, url_verification }) {
    const { etablissement } = usePage().props;

    const handlePrint = () => {
        window.print();
    };

    if (!inscription) return <div className="p-8 text-center">Chargement du reçu...</div>;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
            <Head title={`Reçu N° ${inscription.numero_recu || inscription.id} - ${inscription.eleve?.user?.nom || 'Élève'}`} />

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
                    href={route('inscriptions.index')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Retour aux inscriptions
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                >
                    <PrinterIcon className="w-5 h-5" />
                    Imprimer le reçu (Format A4 - 2 Volets)
                </button>
            </div>

            {/* CONTENEUR FEUILLE A4 (2 REÇUS SÉPARÉS PAR UNE LIGNE DE DÉCOUPE) */}
            <div className="w-full max-w-[210mm] bg-white shadow-2xl print:shadow-none rounded-2xl print:rounded-none p-5 print:p-0 flex flex-col justify-between">
                
                {/* 1ER VOLET : EXEMPLAIRE PARENT */}
                <ReceiptVoucher
                    inscription={inscription}
                    etablissement={etablissement}
                    url_verification={url_verification}
                    copyLabel="EXEMPLAIRE PARENT / TUTEUR"
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
                <ReceiptVoucher
                    inscription={inscription}
                    etablissement={etablissement}
                    url_verification={url_verification}
                    copyLabel="EXEMPLAIRE ÉTABLISSEMENT / ARCHIVES"
                    copyBadgeColor="bg-amber-50 text-amber-800 border-amber-200"
                />

            </div>
        </div>
    );
}
