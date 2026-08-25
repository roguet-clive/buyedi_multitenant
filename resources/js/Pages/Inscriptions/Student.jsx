import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { UserIcon, CheckBadgeIcon, ClockIcon, XCircleIcon, PrinterIcon } from "@heroicons/react/24/solid";
import useTranslation from "@/Hooks/useTranslation";

export default function Student({ inscriptions }) {
    const { t } = useTranslation();

    const formatAmount = (amount) => amount ? parseInt(amount).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA';

    return (
        <DashboardLayout>
            <Head title="Mes Inscriptions" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                    Mes Inscriptions
                </h1>
                <p className="text-gray-500">Historique de vos inscriptions scolaires.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(inscriptions?.data || inscriptions).length > 0 ? (inscriptions?.data || inscriptions).map((insc) => (
                    <div key={insc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            {insc.statut === 'validee' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    <CheckBadgeIcon className="w-4 h-4" /> Validée
                                </span>
                            )}
                            {insc.statut === 'en_attente' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                    <ClockIcon className="w-4 h-4" /> En attente
                                </span>
                            )}
                            {(insc.statut === 'rejete') && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                    <XCircleIcon className="w-4 h-4" /> Rejetée
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Année Scolaire {insc.annee_scolaire?.nom}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Inscrit le {new Date(insc.created_at).toLocaleDateString()}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                {insc.eleve?.user && (
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Élève</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{insc.eleve.user.nom} {insc.eleve.user.prenom}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Classe</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{insc.classe?.nom}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Montant Scolarité</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatAmount(insc.total_frais)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <a
                                href={route('inscriptions.recu', insc.id)}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                            >
                                <PrinterIcon className="w-4 h-4" />
                                Télécharger le reçu
                            </a>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                        <UserIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-500">Aucune inscription</h2>
                        <p className="text-gray-400">Vous n'avez pas encore d'inscription enregistrée.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
