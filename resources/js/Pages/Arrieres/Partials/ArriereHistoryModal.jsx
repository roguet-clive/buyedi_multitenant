import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { History, X, Info, Printer } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereHistoryModal({ target, onClose, formatFCFA, formatDate }) {
    const { t } = useTranslation();

    return (
        <Transition show={!!target} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 md:p-6">
                        <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">
                            {/* HEADER */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-950 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                            {t("installments_history", "Historique des Versements & Reçus")}
                                        </Dialog.Title>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Dossier de {target?.nom_complet} • Arriéré {target?.annee_scolaire_dette}
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

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                                {/* SITUATION GAUCHE (4/12) */}
                                <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                        Situation de Recouvrement
                                    </span>
                                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                                        <span className="text-slate-500">Dette Initiale :</span>
                                        <strong className="text-slate-800 dark:text-white">{formatFCFA(target?.montant_total)}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                                        <span className="text-slate-500">Total Encaissé :</span>
                                        <strong className="text-emerald-600 dark:text-emerald-400">{formatFCFA(target?.montant_paye)}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-1">
                                        <span className="text-slate-500">Reste Dû :</span>
                                        <strong className="text-amber-600 dark:text-amber-400">{formatFCFA(target?.montant_restant)}</strong>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                                            <span>Progression</span>
                                            <span>
                                                {target?.montant_total > 0
                                                    ? Math.round((target.montant_paye / target.montant_total) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full rounded-full"
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        target?.montant_total > 0
                                                            ? (target.montant_paye / target.montant_total) * 100
                                                            : 0
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* TABLEAU DES VERSEMENTS DROITE (8/12) */}
                                <div className="lg:col-span-8">
                                    {!target?.paiements || target.paiements.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl h-full flex flex-col items-center justify-center">
                                            <Info className="w-8 h-8 text-slate-400 mb-2" />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {t("no_payments_yet", "Aucun versement n'a encore été enregistré pour cet arriéré.")}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 max-h-72 overflow-y-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 sticky top-0">
                                                    <tr>
                                                        <th className="py-3 px-4">Reçu N°</th>
                                                        <th className="py-3 px-4">Date</th>
                                                        <th className="py-3 px-4">Montant</th>
                                                        <th className="py-3 px-4">Mode</th>
                                                        <th className="py-3 px-4">Caissier</th>
                                                        <th className="py-3 px-4 text-right">Quittance</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                                    {target.paiements.map((p) => (
                                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                                                {p.numero_recu}
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                                {formatDate(p.date_paiement)}
                                                            </td>
                                                            <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                                                {formatFCFA(p.montant)}
                                                            </td>
                                                            <td className="py-3 px-4 capitalize text-slate-500 dark:text-slate-400">
                                                                {p.mode_paiement}
                                                            </td>
                                                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                                                                {p.user ? `${p.user.nom} ${p.user.prenom}` : 'Caisse'}
                                                            </td>
                                                            <td className="py-3 px-4 text-right">
                                                                <a
                                                                    href={route('arrieres.recu', p.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 rounded-xl font-bold transition-all shadow-sm"
                                                                >
                                                                    <Printer className="w-3.5 h-3.5" />
                                                                    <span>Imprimer</span>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors"
                                >
                                    {t("close", "Fermer")}
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
