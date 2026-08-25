import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { CreditCard, Wallet, CheckCircle, Clock, AlertTriangle, Download } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

export default function Student({ paiements, balance, totals }) {
    const { t } = useTranslation();

    const formatAmount = (amount) => amount ? parseInt(amount).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA';

    return (
        <DashboardLayout>
            <Head title="Mes Paiements" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    Mes Paiements & Scolarité
                </h1>
                <p className="text-gray-500">Suivi de votre situation financière scolaire.</p>
            </div>

            {/* SYNTHÈSE FINANCIÈRE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Dû */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">Total Scolarité</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatAmount(totals.due)}</p>
                </div>

                {/* Total Payé */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">Total Payé</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatAmount(totals.paid)}</p>
                </div>

                {/* Reste à Payer */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">Reste à Payer</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatAmount(totals.remaining)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DÉTAIL DES FRAIS (Balance) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Détails des Frais</h3>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-500 bg-gray-50/50 dark:bg-gray-800 border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Type de Frais</th>
                                    <th className="px-4 py-3 text-right font-medium">Montant</th>
                                    <th className="px-4 py-3 text-right font-medium">Payé</th>
                                    <th className="px-4 py-3 text-right font-medium">Reste</th>
                                    <th className="px-4 py-3 text-center font-medium">État</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {balance.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.type}</td>
                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{formatAmount(item.du)}</td>
                                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{formatAmount(item.paye)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatAmount(item.reste)}</td>
                                        <td className="px-4 py-3 text-center">
                                            {item.status === 'paye' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Payé</span>}
                                            {item.status === 'partiel' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Partiel</span>}
                                            {item.status === 'impaye' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Impayé</span>}
                                        </td>
                                    </tr>
                                ))}
                                {balance.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-6 text-gray-400 italic">Aucun frais assigné pour le moment.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* HISTORIQUE DES PAIEMENTS */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <h3 className="font-bold text-gray-800 dark:text-white">Historique des Versements</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {paiements.length > 0 ? paiements.map((paiement) => (
                            <div key={paiement.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{paiement.frais_type?.nom || 'Paiement'}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(paiement.date_paiement).toLocaleDateString()} &bull; {paiement.mode_paiement}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className="text-green-600 font-bold">{formatAmount(paiement.montant)}</p>
                                        <p className="text-xs text-gray-400 font-mono">{paiement.reference}</p>
                                    </div>
                                    <a
                                        href={route('paiements.recu', paiement.id)}
                                        target="_blank"
                                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-50 hover:text-blue-600 transition"
                                        title={t("download_receipt", "Télécharger le reçu")}
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-400 italic">
                                Aucun paiement enregistré.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
