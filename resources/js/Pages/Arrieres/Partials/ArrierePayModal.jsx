import React, { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { CreditCard, X, Wallet, CheckCircle2 } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArrierePayModal({ target, onClose, formatFCFA }) {
    const { t } = useTranslation();

    const { data, setData, post, processing, reset, errors } = useForm({
        montant: '',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: 'especes',
        reference_paiement: '',
        commentaire: '',
    });

    useEffect(() => {
        if (target) {
            setData({
                montant: target.montant_restant || '',
                date_paiement: new Date().toISOString().split('T')[0],
                mode_paiement: 'especes',
                reference_paiement: '',
                commentaire: '',
            });
        }
    }, [target]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!target) return;

        post(route('arrieres.payer', target.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Transition show={!!target} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 md:p-6">
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
                            {/* HEADER */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                            {t("cash_in_arrear", "Encaisser un Versement d'Arriéré")}
                                        </Dialog.Title>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Règlement pour {target?.nom_complet} • Arriéré {target?.annee_scolaire_dette}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* SITUATION DÉBITRICE (5/12) */}
                                    <div className="lg:col-span-5 space-y-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md border border-slate-800 flex flex-col justify-between">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                                                Dossier Débiteur
                                            </span>
                                            <h4 className="text-xl font-black text-white">
                                                {target?.nom_complet}
                                            </h4>
                                            {target?.classe_origine && (
                                                <div className="text-xs text-slate-300 mt-1">
                                                    Classe : {target.classe_origine}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/10">
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Dette</span>
                                                    <span className="text-sm font-bold text-white block mt-0.5">
                                                        {formatFCFA(target?.montant_total)}
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Déjà Réglé</span>
                                                    <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                                                        {formatFCFA(target?.montant_paye)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mt-4">
                                                <span className="text-[10px] uppercase font-bold text-amber-300 block">Reste à Payer Actuel</span>
                                                <span className="text-2xl font-black text-amber-400 block mt-1">
                                                    {formatFCFA(target?.montant_restant)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 text-xs text-slate-300">
                                            <p className="font-medium text-amber-300">📌 Mention Officielle :</p>
                                            <p className="font-bold text-white mt-0.5">
                                                Arriéré de l'année {target?.annee_scolaire_dette}
                                            </p>
                                        </div>
                                    </div>

                                    {/* FORMULAIRE D'ENCAISSEMENT (7/12) */}
                                    <div className="lg:col-span-7 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200/70 dark:border-slate-700/60">
                                        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-1">
                                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>Paramètres du Versement</span>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                    {t("amount_to_pay", "Montant versé maintenant (FCFA)")} <span className="text-red-500">*</span>
                                                </label>
                                                {target?.montant_restant > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('montant', Math.round(target.montant_restant / 2))}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                                                        >
                                                            50%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('montant', target.montant_restant)}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                                                        >
                                                            Total (100%)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                step="any"
                                                max={target?.montant_restant}
                                                value={data.montant}
                                                onChange={(e) => setData('montant', e.target.value)}
                                                className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-black"
                                                placeholder="Ex: 50000"
                                                required
                                            />
                                            {errors.montant && <p className="text-red-500 text-xs mt-1">{errors.montant}</p>}
                                            {data.montant && target && (
                                                <div className="flex items-center justify-between text-xs font-semibold mt-2 px-1 text-slate-600 dark:text-slate-300">
                                                    <span>Nouveau solde restant :</span>
                                                    <strong className="text-amber-600 dark:text-amber-400 font-bold">
                                                        {formatFCFA(Math.max(0, target.montant_restant - parseFloat(data.montant || 0)))}
                                                    </strong>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    {t("payment_mode", "Mode de Règlement")} <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.mode_paiement}
                                                    onChange={(e) => setData('mode_paiement', e.target.value)}
                                                    className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                    required
                                                >
                                                    <option value="especes">Espèces (Caisse)</option>
                                                    <option value="mobile">Mobile Money (Airtel / Moov)</option>
                                                    <option value="virement">Virement Bancaire</option>
                                                    <option value="cheque">Chèque</option>
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
                                                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                {t("ref_number", "Référence de transaction / N° de bordereau")}
                                            </label>
                                            <input
                                                type="text"
                                                value={data.reference_paiement}
                                                onChange={(e) => setData('reference_paiement', e.target.value)}
                                                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                placeholder="Ex: TXN-89218 ou N° Chèque"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                {t("comment", "Commentaire sur le reçu")}
                                            </label>
                                            <textarea
                                                value={data.commentaire}
                                                onChange={(e) => setData('commentaire', e.target.value)}
                                                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white h-16 resize-none"
                                                placeholder="Ex: Règlement apporté par le tuteur légal."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {t("cancel", "Annuler")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{processing ? t("processing", "Encaissement...") : t("confirm_payment", "Valider l'Encaissement & Émettre le Reçu")}</span>
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
