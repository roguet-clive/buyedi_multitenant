import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PencilIcon, TrashIcon, PrinterIcon, ArrowLeftIcon, UserCircleIcon, AcademicCapIcon, BanknotesIcon, CalendarDaysIcon, CheckBadgeIcon, ExclamationTriangleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import useTranslation from '@/Hooks/useTranslation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Show({ inscription }) {
    const { t } = useTranslation();
    const { delete: destroy } = useForm();
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    const handleDelete = () => {
        if (!confirm(t('confirm_delete', 'Voulez-vous vraiment supprimer cette inscription ? Cette action est irréversible.'))) return;
        destroy(route('inscriptions.destroy', inscription.id));
    };

    const eleve = inscription.eleve?.user;
    const classe = inscription.classe;
    const annee = inscription.annee_scolaire;
    const frais = inscription.frais || [];

    const formatPrice = (amount) => parseFloat(amount).toLocaleString('fr-FR') + ' FCFA';

    // Helper Statut
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'validee':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                        <CheckBadgeIcon className="w-5 h-5 text-green-500" /> Validée
                    </span>
                );
            case 'en_attente':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        <ClockIcon className="w-5 h-5 text-amber-500" /> En attente
                    </span>
                );
            case 'brouillon':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <ExclamationTriangleIcon className="w-5 h-5 text-slate-500" /> Brouillon
                    </span>
                );
            case 'rejete':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        <XCircleIcon className="w-5 h-5 text-red-500" /> Rejetée
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <ExclamationTriangleIcon className="w-5 h-5 text-slate-500" /> Brouillon
                    </span>
                );
        }
    };

    return (
        <DashboardLayout title={`Dossier - ${eleve?.prenom} ${eleve?.nom}`}>

            {/* EN-TÊTE ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('inscriptions.index')}
                        className="p-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                        title={t('back_to_list', 'Retour à la liste')}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            {t('details_inscription', 'Dossier d\'inscription')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            Consultez les informations académiques et financières de l'élève.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <a
                        href={route('inscriptions.recu', inscription.id)}
                        target="_blank"
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0B1A2D] dark:hover:text-white border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        <PrinterIcon className="w-5 h-5 text-slate-400" />
                        <span>{t('recu', 'Imprimer Reçu')}</span>
                    </a>

                    {can('modifier_inscriptions') && (
                        <Link
                            href={route('inscriptions.edit', inscription.id)}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md shadow-amber-500/30 transition-all active:scale-95"
                        >
                            <PencilIcon className="w-5 h-5" />
                            <span>{t('edit', 'Modifier')}</span>
                        </Link>
                    )}

                    {can('supprimer_inscriptions') && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 px-4 py-2.5 rounded-xl font-semibold transition-all active:scale-95"
                        >
                            <TrashIcon className="w-5 h-5" />
                            <span>{t('delete', 'Supprimer')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* GRILLE DE PROFIL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLONNE GAUCHE : IDENTITÉ & STATUT (1/3) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* CARTE ÉLÈVE */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 overflow-hidden relative"
                    >
                        {/* Header bg design */}
                        <div className="h-24 bg-gradient-to-br from-[#0B1A2D] to-blue-900 w-full absolute top-0 left-0"></div>

                        <div className="p-6 pt-12 relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg mb-4">
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 dark:text-slate-500 overflow-hidden">
                                    {eleve?.avatar ? (
                                        <img src={`/storage/${eleve.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-xl font-extrabold text-[#0B1A2D] dark:text-white text-center">
                                {eleve?.prenom} {eleve?.nom}
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-4 flex items-center gap-1.5">
                                Matricule : <span className="font-mono text-blue-600 dark:text-blue-400">{inscription.eleve?.matricule || 'Généré à la validation'}</span>
                            </p>

                            <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-2 space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Sexe</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{eleve?.sexe === 'M' ? 'Masculin' : (eleve?.sexe === 'F' ? 'Féminin' : '-')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Naissance</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{eleve?.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR') : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Contact</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{eleve?.phone || eleve?.email || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARTE ADMINISTRATION */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6"
                    >
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                            <CalendarDaysIcon className="w-5 h-5 text-blue-500" /> Administration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Statut du Dossier</p>
                                {renderStatusBadge(inscription.statut)}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date de création</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {new Date(inscription.date_inscription).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            {inscription.reinscription && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
                                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Ceci est une Réinscription</p>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-1">L'élève était déjà présent l'année précédente.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* COLONNE DROITE : SCOLARITÉ & FINANCES (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* INFOS SCOLAIRES */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
                    >
                        <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-800/50 flex-shrink-0">
                            <AcademicCapIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Affectation Académique</p>
                            <h3 className="text-2xl font-extrabold text-[#0B1A2D] dark:text-white">Classe de {classe?.nom}</h3>
                            <p className="font-medium text-slate-600 dark:text-slate-400 mt-1">Année Scolaire : {annee?.nom}</p>
                        </div>
                    </motion.div>

                    {/* DÉTAILS FINANCIERS */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                    >
                        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <BanknotesIcon className="w-6 h-6 text-green-500" /> Engagement Financier
                            </h3>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total Scolarité</p>
                                <p className="text-xl font-black text-green-600">{formatPrice(inscription.total_frais)}</p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50">
                            {frais.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-[#0B1A2D] text-slate-300">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Désignation des frais</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Code</th>
                                                <th className="px-6 py-4 text-xs font-bold text-right uppercase tracking-wider">Montant Imputé</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {frais.map((f, index) => (
                                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                                        {f.frais_type?.nom}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-mono text-xs font-bold">
                                                            {f.frais_type?.code || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-[#0B1A2D] dark:text-white">
                                                        {formatPrice(f.frais_type?.montant)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-green-50 dark:bg-green-900/10 border-t-2 border-green-200 dark:border-green-800/50">
                                                <td colSpan="2" className="px-6 py-4 text-right font-bold text-green-800 dark:text-green-500 uppercase tracking-wider text-sm">
                                                    Total à régler par les parents
                                                </td>
                                                <td className="px-6 py-4 text-right text-lg font-black text-green-600">
                                                    {formatPrice(inscription.total_frais)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                                    <BanknotesIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">Aucun frais spécifié pour cette inscription.</p>
                                </div>
                            )}

                            {inscription.statut === 'validee' && (
                                <div className="mt-6 flex justify-end">
                                    <Link
                                        href={route('paiements.create', { inscription_id: inscription.id })}
                                        className="inline-flex items-center gap-2 bg-[#0B1A2D] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                                    >
                                        <BanknotesIcon className="w-5 h-5" />
                                        Encaisser un versement
                                    </Link>
                                </div>
                            )}

                        </div>
                    </motion.div>

                </div>
            </div>

        </DashboardLayout>
    );
}
