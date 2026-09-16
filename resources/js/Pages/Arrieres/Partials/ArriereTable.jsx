import React from 'react';
import { CreditCard, History, Edit3, Trash2, CheckCircle2, Clock, AlertCircle, Plus, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereTable({
    arrieres,
    formatFCFA,
    openPayModal,
    openEditModal,
    setHistoryTarget,
    setDeleteTarget,
    setIsCreateModalOpen,
    can = () => true
}) {
    const { t } = useTranslation();

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 'solde':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Soldé (100%)
                    </span>
                );
            case 'partiellement_solde':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Partiel
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        Non Soldé
                    </span>
                );
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            {arrieres.data.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                        {t("no_arrears_found", "Aucun arriéré trouvé")}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                        {t("no_arrears_help", "Il n'y a pas d'arriéré correspondant aux critères sélectionnés. Ajoutez les créances antérieures lors de la configuration initiale.")}
                    </p>
                    {can('ajouter_arrieres') && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t("add_first_arrear", "Ajouter un premier dossier débiteur")}</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-semibold text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                                <th className="py-4 px-6">{t("student", "Élève Débiteur")}</th>
                                <th className="py-4 px-6">{t("concerned_year", "Année de la Dette")}</th>
                                <th className="py-4 px-6">{t("initial_amount", "Dette Initiale")}</th>
                                <th className="py-4 px-6">{t("paid_amount", "Déjà Payé")}</th>
                                <th className="py-4 px-6">{t("remaining_balance", "Reste Dû")}</th>
                                <th className="py-4 px-6">{t("status", "Statut")}</th>
                                <th className="py-4 px-6 text-right">{t("actions", "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {arrieres.data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white block">
                                                {item.nom_complet || `${item.nom_eleve} ${item.prenom_eleve || ''}`}
                                            </span>
                                            {item.classe_origine && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                                    Classe : {item.classe_origine}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                                            {item.annee_scolaire_dette}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                                        {formatFCFA(item.montant_total)}
                                    </td>
                                    <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                                        {formatFCFA(item.montant_paye)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`font-bold ${item.montant_restant > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                                            {formatFCFA(item.montant_restant)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(item.statut)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Bouton Encaisser */}
                                            {item.statut !== 'solde' && can('encaisser_arrieres') && (
                                                <button
                                                    onClick={() => openPayModal(item)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                                                    title={t("pay_btn", "Encaisser un versement")}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>{t("cash_in", "Encaisser")}</span>
                                                </button>
                                            )}

                                            {/* Historique des versements */}
                                            <button
                                                onClick={() => setHistoryTarget(item)}
                                                className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 rounded-xl transition-all"
                                                title={t("payment_history", "Historique des versements & Reçus")}
                                            >
                                                <History className="w-4 h-4" />
                                            </button>

                                            {/* Modifier */}
                                            {can('modifier_arrieres') && (
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 rounded-xl transition-all"
                                                    title={t("edit", "Modifier")}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Supprimer */}
                                            {can('supprimer_arrieres') && (
                                                <button
                                                    onClick={() => setDeleteTarget(item)}
                                                    className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 rounded-xl transition-all"
                                                    title={t("delete", "Supprimer")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* PAGINATION */}
            {arrieres.links && arrieres.links.length > 3 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Affichage de {arrieres.from || 0} à {arrieres.to || 0} sur {arrieres.total} dossiers
                    </span>
                    <div className="flex items-center gap-1">
                        {arrieres.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                    link.active
                                        ? 'bg-amber-600 text-white shadow-sm'
                                        : link.url
                                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
