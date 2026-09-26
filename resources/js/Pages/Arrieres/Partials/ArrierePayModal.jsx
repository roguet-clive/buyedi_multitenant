import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { CreditCard, X, Wallet, CheckCircle2, User, Sparkles, Check, ArrowRight, Printer } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArrierePayModal({ target, onClose, formatFCFA }) {
    const { t } = useTranslation();
    const [quickChoice, setQuickChoice] = useState('total');
    const [receiptUrl, setReceiptUrl] = useState(null);
    const [receiptNumero, setReceiptNumero] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        montant: '',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: 'especes',
        reference_paiement: '',
        commentaire: '',
    });

    useEffect(() => {
        if (target) {
            setReceiptUrl(null);
            setReceiptNumero(null);
            const solde = target.montant_restant || 0;
            setData({
                montant: solde,
                date_paiement: new Date().toISOString().split('T')[0],
                mode_paiement: 'especes',
                reference_paiement: '',
                commentaire: `Règlement arriéré ${target.annee_scolaire_dette}`,
            });
            setQuickChoice('total');
        }
    }, [target]);

    const handleQuickAmount = (type) => {
        if (!target) return;
        setQuickChoice(type);
        const solde = parseFloat(target.montant_restant || 0);

        if (type === 'total') {
            setData(prev => ({
                ...prev,
                montant: solde,
                commentaire: `Solde complet arriéré ${target.annee_scolaire_dette}`,
            }));
        } else if (type === '50') {
            setData(prev => ({
                ...prev,
                montant: Math.round(solde * 0.5),
                commentaire: `Acompte 50% arriéré ${target.annee_scolaire_dette}`,
            }));
        } else if (type === '25') {
            setData(prev => ({
                ...prev,
                montant: Math.round(solde * 0.25),
                commentaire: `Acompte 25% arriéré ${target.annee_scolaire_dette}`,
            }));
        }
    };

    const handleClose = () => {
        setReceiptUrl(null);
        setReceiptNumero(null);
        reset();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!target) return;

        post(route('arrieres.payer', target.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const dernierRecuId = page.props?.flash?.dernier_recu_arriere_id;
                const dernierRecuNumero = page.props?.flash?.dernier_recu_arriere_numero;
                if (dernierRecuId) {
                    setReceiptUrl(route('arrieres.recu', dernierRecuId));
                    setReceiptNumero(dernierRecuNumero);
                    try {
                        window.open(route('arrieres.recu', dernierRecuId), '_blank');
                    } catch (err) {
                        console.error("Popup blocked:", err);
                    }
                } else {
                    handleClose();
                }
            },
        });
    };

    const montantVerse = parseFloat(data.montant || 0);
    const resteActuel = parseFloat(target?.montant_restant || 0);
    const nouveauReste = Math.max(0, resteActuel - montantVerse);
    const estSolde = nouveauReste <= 0;
    const progressionActuelle = target?.montant_total > 0 
        ? Math.round((target.montant_paye / target.montant_total) * 100) 
        : 0;
    const nouvelleProgression = target?.montant_total > 0
        ? Math.min(100, Math.round(((target.montant_paye + montantVerse) / target.montant_total) * 100))
        : 100;

    return (
        <Transition show={!!target} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
                        <Dialog.Panel className="w-full max-w-5xl xl:max-w-6xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/80 dark:border-slate-800">
                            
                            {/* HEADER HORIZONTAL */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Dialog.Title as="h3" className="text-xl font-black text-slate-900 dark:text-white">
                                                {t("cash_in_arrear", "Encaisser un Versement d'Arriéré")}
                                            </Dialog.Title>
                                            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                                                Dette {target?.annee_scolaire_dette}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Guichet de recouvrement officiel • Émission instantanée de la quittance comptable
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* BANDEAU SUCCÈS SI PAIEMENT ENREGISTRÉ AVEC BOUTON IMPRESSION */}
                            {receiptUrl && (
                                <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                                                <span>Versement enregistré avec succès !</span>
                                                <span className="font-mono text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded font-bold">
                                                    {receiptNumero}
                                                </span>
                                            </h4>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                                L'arriéré a été mis à jour dans la comptabilité. Vous pouvez imprimer la quittance dès maintenant.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span>Imprimer la Quittance</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CORPS HORIZONTAL (2 COLONNES EQUILIBREES) */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                    
                                    {/* COLONNE GAUCHE (5/12) : CARTE DOSSIER DEBITEUR */}
                                    <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                        <div className="relative z-10 space-y-4">
                                            {/* Badge Élève */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-block mb-1.5">
                                                        Dossier Élève
                                                    </span>
                                                    <h4 className="text-xl font-black text-white leading-tight">
                                                        {target?.nom_complet}
                                                    </h4>
                                                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                                                        <span>Classe d'origine :</span>
                                                        <strong className="text-white font-bold">{target?.classe_origine || 'Non spécifiée'}</strong>
                                                    </p>
                                                </div>
                                                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 border border-white/10">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            </div>

                                            {/* Chiffres clés de la dette */}
                                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                                <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dette Initiale</span>
                                                    <span className="text-base font-black text-white block mt-0.5 font-mono">
                                                        {formatFCFA(target?.montant_total)}
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Déjà Réglé</span>
                                                    <span className="text-base font-black text-emerald-400 block mt-0.5 font-mono">
                                                        {formatFCFA(target?.montant_paye)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bloc Reste à solder */}
                                            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 p-4 rounded-2xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] uppercase font-extrabold text-amber-300 tracking-wider">
                                                        Reste Dû Actuel
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200">
                                                        {progressionActuelle}% soldé
                                                    </span>
                                                </div>
                                                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono tracking-tight">
                                                    {formatFCFA(target?.montant_restant)}
                                                </div>
                                            </div>

                                            {/* Progression dynamique après saisie */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                                                    <span>Progression après versement</span>
                                                    <span className="font-bold text-emerald-300">{nouvelleProgression}%</span>
                                                </div>
                                                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                                                    <div 
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${nouvelleProgression}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pied gauche : mention légale */}
                                        <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-slate-300 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Imputation Caisse :</span>
                                                <strong className="text-white">Arriéré {target?.annee_scolaire_dette}</strong>
                                            </div>
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/30 font-semibold">
                                                Comptabilité liée
                                            </span>
                                        </div>
                                    </div>

                                    {/* COLONNE DROITE (7/12) : FORMULAIRE LARGE DE REGLEMENT */}
                                    <div className="lg:col-span-7 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            
                                            {/* Raccourcis rapides de règlement (1-clic) */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                    1. Choix Rapide du Versement
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickAmount('total')}
                                                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            quickChoice === 'total'
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/30'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                        }`}
                                                    >
                                                        <span className="block font-black">100% Soldé</span>
                                                        <span className="text-[10px] opacity-80 block font-mono">Totalité</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickAmount('50')}
                                                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            quickChoice === '50'
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                                        }`}
                                                    >
                                                        <span className="block font-black">50% Acompte</span>
                                                        <span className="text-[10px] opacity-80 block font-mono">Moitié</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickAmount('25')}
                                                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            quickChoice === '25'
                                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 ring-2 ring-purple-400/30'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                                                        }`}
                                                    >
                                                        <span className="block font-black">25% Acompte</span>
                                                        <span className="text-[10px] opacity-80 block font-mono">Quart</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickChoice('libre')}
                                                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            quickChoice === 'libre'
                                                                ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 ring-2 ring-amber-400/30'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                                                        }`}
                                                    >
                                                        <span className="block font-black">Montant Libre</span>
                                                        <span className="text-[10px] opacity-80 block font-mono">Personnalisé</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Saisie du Montant avec affichage du solde résultant */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                        2. Montant Versé Maintenant (FCFA) <span className="text-red-500">*</span>
                                                    </label>
                                                    {estSolde ? (
                                                        <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                                            <Check className="w-3.5 h-3.5" /> Dette Intégralement Soldée
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                                            Nouveau reliquat : {formatFCFA(nouveauReste)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="relative border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="1"
                                                        max={target?.montant_restant}
                                                        value={data.montant}
                                                        onChange={(e) => {
                                                            setData('montant', e.target.value);
                                                            setQuickChoice('libre');
                                                        }}
                                                        className="w-full border-none bg-transparent py-3 pl-16 pr-4 rounded-2xl text-2xl font-black text-emerald-700 dark:text-emerald-400 focus:ring-0 text-right font-mono"
                                                        placeholder="0"
                                                        required
                                                    />
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                                        FCFA
                                                    </span>
                                                </div>
                                                {errors.montant && <p className="text-red-500 text-xs font-bold mt-1">{errors.montant}</p>}
                                            </div>

                                            {/* Grille 2 colonnes : Mode de paiement & Date */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        {t("payment_mode", "Mode de Règlement")} <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={data.mode_paiement}
                                                        onChange={(e) => setData('mode_paiement', e.target.value)}
                                                        className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        required
                                                    >
                                                        <option value="especes">💵 Espèces (Guichet)</option>
                                                        <option value="mobile">📱 Mobile Money (Airtel / Moov)</option>
                                                        <option value="virement">🏦 Virement Bancaire</option>
                                                        <option value="cheque">📝 Chèque</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        {t("payment_date", "Date d'encaissement")} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={data.date_paiement}
                                                        onChange={(e) => setData('date_paiement', e.target.value)}
                                                        className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Grille 2 colonnes : Référence & Commentaire */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        {t("ref_number", "Référence / N° de reçu externe")}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.reference_paiement}
                                                        onChange={(e) => setData('reference_paiement', e.target.value)}
                                                        className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        placeholder="Ex: BORD-00912 ou TXN..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        {t("comment", "Commentaire sur la quittance")}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.commentaire}
                                                        onChange={(e) => setData('commentaire', e.target.value)}
                                                        className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        placeholder="Ex: Versement effectué par le parent..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions horizontales */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/60 mt-4">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                {receiptUrl ? t("close", "Fermer") : t("cancel", "Annuler")}
                                            </button>
                                            {receiptUrl ? (
                                                <button
                                                    type="button"
                                                    onClick={handleClose}
                                                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Terminer</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    disabled={processing || !data.montant || parseFloat(data.montant) <= 0}
                                                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span>{processing ? t("processing", "Encaissement...") : t("confirm_payment", "Valider et Émettre la Quittance")}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
