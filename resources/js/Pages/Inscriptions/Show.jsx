import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    PencilIcon, 
    TrashIcon, 
    PrinterIcon, 
    ArrowLeftIcon, 
    UserCircleIcon, 
    AcademicCapIcon, 
    BanknotesIcon, 
    CalendarDaysIcon, 
    CheckBadgeIcon, 
    ExclamationTriangleIcon, 
    ClockIcon, 
    XCircleIcon,
    CheckCircleIcon,
    XMarkIcon,
    DocumentTextIcon,
    IdentificationIcon
} from '@heroicons/react/24/solid';
import useTranslation from '@/Hooks/useTranslation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Show({ inscription, fraisAnnexes = [], tenueFraisType }) {
    const { t } = useTranslation();
    const { delete: destroy } = useForm();
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    const eleveUser = inscription.eleve?.user || {};
    const eleveProfile = inscription.eleve || {};
    const eleve = eleveUser; // Conserver la rétrocompatibilité
    const classe = inscription.classe;
    const annee = inscription.annee_scolaire;
    const paiements = inscription.paiements || [];

    // Résolution complète de la photo d'identité de l'élève
    const rawPhoto = eleveProfile?.photo || eleveUser?.photo || eleveUser?.avatar;
    const studentPhoto = rawPhoto 
        ? (rawPhoto.startsWith('http') || rawPhoto.startsWith('/storage') ? rawPhoto : `/storage/${rawPhoto}`)
        : null;

    const isSecondaire = classe?.type === 'secondaire' || 
        (classe?.nom && !['maternelle', 'primaire', 'creche'].includes(classe?.type?.toLowerCase()));

    const montantTenueAttendu = inscription.montant_tenue_exigible || tenueFraisType?.montant || 0;

    const [isTenueModalOpen, setIsTenueModalOpen] = useState(false);

    // Formulaire d'encaissement rapide de la Tenue Scolaire
    const tenueForm = useForm({
        inscription_id: inscription.id,
        frais_type_id: tenueFraisType?.id || 2,
        montant: montantTenueAttendu,
        mode_paiement: 'especes',
        date_paiement: new Date().toISOString().split('T')[0],
        commentaire: 'Règlement Tenue Scolaire',
    });

    const handlePayTenue = (e) => {
        e.preventDefault();
        tenueForm.post(route('paiements.store'), {
            onSuccess: () => {
                toast.success('Paiement de la tenue scolaire enregistré avec succès ! 🎉');
                setIsTenueModalOpen(false);
            },
            onError: () => {
                toast.error('Erreur lors de l\'enregistrement du paiement');
            }
        });
    };

    const handleDelete = () => {
        if (!confirm(t('confirm_delete', 'Voulez-vous vraiment supprimer cette inscription ? Cette action est irréversible.'))) return;
        destroy(route('inscriptions.destroy', inscription.id));
    };

    const formatPrice = (amount) => parseFloat(amount || 0).toLocaleString('fr-FR') + ' FCFA';
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : '-';

    // Détection Tenue Scolaire
    const paiementTenue = paiements.find(p => 
        p.frais_type?.code === 'tenue' || 
        p.frais_type?.nom?.toLowerCase().includes('tenue')
    );
    const isTenuePayee = !!paiementTenue;

    // Paiement d'admission (Inscription ou Réinscription)
    const paiementAdmission = paiements.find(p => 
        p.frais_type?.code === 'inscription' || 
        p.frais_type?.code === 'reinscription'
    );

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
                            {t('details_inscription', 'Dossier d\'inscription & Suivi')}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            Suivi complet de l'admission, de la tenue scolaire et des paiements de l'élève.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
                    <a
                        href={route('inscriptions.recu', inscription.id)}
                        target="_blank"
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0B1A2D] dark:hover:text-white border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl font-semibold shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm"
                    >
                        <PrinterIcon className="w-4 h-4 text-slate-400" />
                        <span>{t('recu', 'Bordereau Inscription')}</span>
                    </a>

                    <a
                        href={`${route('eleves.certificat', inscription.eleve_id)}.pdf`}
                        target="_blank"
                        className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 px-3.5 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-xs sm:text-sm"
                        title="Consulter et imprimer le certificat officiel de scolarité (PDF)"
                    >
                        <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                        <span>Certificat Scolarité (PDF)</span>
                    </a>

                    <a
                        href={`${route('eleves.carte', inscription.eleve_id)}.pdf`}
                        target="_blank"
                        className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 px-3.5 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-xs sm:text-sm"
                        title="Consulter et imprimer la carte scolaire au format badge CR80 (PDF)"
                    >
                        <IdentificationIcon className="w-4 h-4 text-indigo-500" />
                        <span>Carte Scolaire (PDF)</span>
                    </a>

                    <Link
                        href={`${route('eleves.show', inscription.eleve_id)}?tab=documents`}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 px-3.5 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-xs sm:text-sm"
                        title="Voir tous les documents et pièces justificatives de l'élève"
                    >
                        <AcademicCapIcon className="w-4 h-4 text-slate-500" />
                        <span>Tous les Documents</span>
                    </Link>

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
                        <div className="h-24 bg-gradient-to-br from-[#0B1A2D] to-blue-900 w-full absolute top-0 left-0"></div>

                        <div className="p-6 pt-12 relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg mb-4 ring-2 ring-slate-100 dark:ring-slate-700">
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 dark:text-slate-500 overflow-hidden">
                                    {studentPhoto ? (
                                        <img 
                                            src={studentPhoto} 
                                            alt={`${eleve?.prenom || ''} ${eleve?.nom || ''}`} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.innerHTML = `<span class="text-2xl font-bold text-slate-400">${(eleve?.prenom?.[0] || '') + (eleve?.nom?.[0] || '')}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <UserCircleIcon className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-xl font-extrabold text-[#0B1A2D] dark:text-white text-center">
                                {eleve?.prenom} {eleve?.nom}
                            </h2>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-4 flex items-center gap-1.5">
                                Matricule : <span className="font-mono text-blue-600 dark:text-blue-400">{inscription.eleve?.matricule || 'Sans matricule'}</span>
                            </p>

                            <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-2 space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Sexe</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {(eleveProfile?.sexe || eleve?.sexe) === 'M' ? 'Masculin' : ((eleveProfile?.sexe || eleve?.sexe) === 'F' ? 'Féminin' : '-')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Naissance</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {eleveProfile?.date_naissance || eleve?.date_naissance 
                                            ? new Date(eleveProfile?.date_naissance || eleve?.date_naissance).toLocaleDateString('fr-FR') 
                                            : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Contact</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{eleve?.telephone || eleve?.phone || eleve?.email || '-'}</span>
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
                            <CalendarDaysIcon className="w-5 h-5 text-blue-500" /> Administration du Dossier
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Statut du Dossier</p>
                                {renderStatusBadge(inscription.statut)}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Type d'Admission</p>
                                {inscription.reinscription ? (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Réinscription (5 000 FCFA)</p>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-0.5">Élève reconduit d'une année précédente.</p>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Nouvelle Inscription (10 000 FCFA)</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">Nouvel élève arrivant dans l'établissement.</p>
                                    </div>
                                )}
                            </div>

                            {inscription.has_remise && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Remise Accordée</p>
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">🏷️</span>
                                            <div>
                                                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                                    Remise Commerciale ({Number(inscription.remise_pourcentage || 50)}%)
                                                </p>
                                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                    Appliquée exclusivement sur les frais d'inscription.
                                                </p>
                                            </div>
                                        </div>
                                        {Number(inscription.remise_montant) > 0 && (
                                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                                                - {formatPrice(Number(inscription.remise_montant))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Date d'inscription</p>
                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {new Date(inscription.date_inscription).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* COLONNE DROITE : SCOLARITÉ & SUIVI DES FRAIS (2/3) */}
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

                    {/* BLOC SPÉCIAL : SUIVI TENUE SCOLAIRE (CENTRE D'ATTENTION) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-3xl p-6 sm:p-7 border-2 shadow-xl transition-all
                            ${isTenuePayee
                                ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                                : (isSecondaire
                                    ? 'bg-purple-50/80 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700'
                                    : 'bg-amber-50/80 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700'
                                )
                            }
                        `}
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className="text-3xl p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60">
                                    👕
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                            Tenue Scolaire ({formatPrice(montantTenueAttendu)})
                                        </h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border
                                            ${isSecondaire
                                                ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800'
                                                : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800'
                                            }
                                        `}>
                                            {isSecondaire ? 'Secondaire (15 000 FCFA)' : 'Maternelle & Primaire (10 000 FCFA)'}
                                        </span>
                                        {isTenuePayee ? (
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                                                ✓ Réglée
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-300 px-2.5 py-0.5 rounded-full animate-pulse">
                                                ⏳ Impayée / En attente
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                        {isTenuePayee
                                            ? `Règlement effectué : ${formatPrice(paiementTenue?.montant)} le ${formatDate(paiementTenue?.date_paiement)} (${paiementTenue?.mode_paiement?.toUpperCase() || 'ESPÈCES'}).`
                                            : `Le parent n'a pas réglé la tenue scolaire à l'inscription. Montant exigible pour sa classe (${classe?.nom}) : ${formatPrice(montantTenueAttendu)}.`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                {isTenuePayee ? (
                                    <a
                                        href={route('paiements.recu', paiementTenue.id)}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                                    >
                                        <PrinterIcon className="w-4 h-4" />
                                        <span>Reçu Tenue ({formatPrice(paiementTenue.montant)})</span>
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => setIsTenueModalOpen(true)}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-black rounded-xl shadow-lg transition-all active:scale-95
                                            ${isSecondaire
                                                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                                                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                                            }
                                        `}
                                    >
                                        <BanknotesIcon className="w-5 h-5" />
                                        <span>Encaisser la Tenue ({formatPrice(montantTenueAttendu)})</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* DÉTAILS FINANCIERS DE L'INSCRIPTION */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                    >
                        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <BanknotesIcon className="w-6 h-6 text-green-500" /> Versements d'Inscription Encaissés
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Reçus de paiements déjà perçus pour ce dossier.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total Encaissé</p>
                                <p className="text-xl font-black text-green-600">{formatPrice(inscription.total_frais)}</p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50">
                            {paiements.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-[#0B1A2D] text-slate-300">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Frais / Fourniture</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Date & Mode</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Agent Encaissier</th>
                                                <th className="px-6 py-4 text-xs font-bold text-right uppercase tracking-wider">Montant</th>
                                                <th className="px-6 py-4 text-xs font-bold text-center uppercase tracking-wider">Reçu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                            {paiements.map((p) => {
                                                const isForfaitLegacy = (p.frais_type?.is_scolarite || p.frais_type?.nom === 'Scolarité') && 
                                                    (isSecondaire && Number(p.montant) === 70000 && p.commentaire && p.commentaire.includes("Forfait d'entrée"));

                                                const isTranche1Scolarite = (p.frais_type?.is_scolarite || p.frais_type?.nom === 'Scolarité') && 
                                                    (p.mois === '1ère Tranche' || (isSecondaire && [60000, 65000].includes(Number(p.montant))));

                                                const designation = isForfaitLegacy
                                                    ? `Forfait Tranche 1 : ${inscription.reinscription ? 'Réinscription' : 'Inscription'} + 1ère tranche de la scolarité`
                                                    : isTranche1Scolarite
                                                    ? '1ère Tranche de Scolarité'
                                                    : (p.frais_type?.nom || 'Frais');

                                                return (
                                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-800 dark:text-slate-200">
                                                                {designation}
                                                            </div>
                                                            {p.commentaire ? (
                                                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-0.5">
                                                                    {p.commentaire}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                                                    {p.frais_type?.code || 'N/A'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                            <div>{formatDate(p.date_paiement)}</div>
                                                            <span className="text-[10px] font-bold uppercase text-slate-400">
                                                                {p.mode_paiement}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-500">
                                                            {p.user ? `${p.user.nom} ${p.user.prenom}` : 'Caisse'}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                            {formatPrice(p.montant)}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <a
                                                                href={route('paiements.recu', p.id)}
                                                                target="_blank"
                                                                className="p-1.5 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Imprimer ce reçu spécifique"
                                                            >
                                                                <PrinterIcon className="w-4 h-4" />
                                                                <span>Reçu #{p.id}</span>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-green-50 dark:bg-green-900/10 border-t-2 border-green-200 dark:border-green-800/50">
                                                <td colSpan="3" className="px-6 py-4 text-right font-bold text-green-800 dark:text-green-500 uppercase tracking-wider text-sm">
                                                    Total Droits d'Inscription Perçus
                                                </td>
                                                <td className="px-6 py-4 text-right text-lg font-black text-green-600">
                                                    {formatPrice(inscription.total_frais)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                                    <BanknotesIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">Aucun paiement initial enregistré pour cette inscription.</p>
                                </div>
                            )}

                            {/* LIEN JOURNAL DE CAISSE */}
                            <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                                <p className="text-xs text-slate-500">
                                    💡 Pour les versements de la scolarité annuelle (par mois ou tranches), rendez-vous au Journal de Caisse.
                                </p>
                                <Link
                                    href={route('paiements.index', { search: eleve?.matricule || eleve?.nom })}
                                    className="inline-flex items-center gap-2 bg-[#0B1A2D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
                                >
                                    <BanknotesIcon className="w-4 h-4 text-emerald-400" />
                                    <span>Accéder au Journal de Caisse</span>
                                </Link>
                            </div>

                        </div>
                    </motion.div>

                </div>
            </div>

            {/* MODALE D'ENCAISSEMENT DE LA TENUE SCOLAIRE */}
            <AnimatePresence>
                {isTenueModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl p-2 bg-white/20 rounded-xl">👕</span>
                                    <div>
                                        <h3 className="font-extrabold text-lg">Encaisser la Tenue Scolaire</h3>
                                        <p className="text-xs text-amber-100">Élève : {eleve?.prenom} {eleve?.nom}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsTenueModalOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handlePayTenue} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Montant à Encaisser (FCFA)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tenueForm.data.montant}
                                            onChange={(e) => tenueForm.setData('montant', e.target.value)}
                                            className="w-full font-black text-xl px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            FCFA
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Mode de Règlement
                                    </label>
                                    <select
                                        value={tenueForm.data.mode_paiement}
                                        onChange={(e) => tenueForm.setData('mode_paiement', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                        <option value="especes">💵 Espèces (Guichet)</option>
                                        <option value="mobile">📱 Mobile Money (Airtel / Moov)</option>
                                        <option value="virement">🏦 Virement Bancaire</option>
                                        <option value="cheque">📝 Chèque</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Date de Règlement
                                    </label>
                                    <input
                                        type="date"
                                        value={tenueForm.data.date_paiement}
                                        onChange={(e) => tenueForm.setData('date_paiement', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Libellé sur le Reçu
                                    </label>
                                    <input
                                        type="text"
                                        value={tenueForm.data.commentaire}
                                        onChange={(e) => tenueForm.setData('commentaire', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsTenueModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 text-sm hover:bg-slate-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={tenueForm.processing}
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/30 text-sm flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                        <span>{tenueForm.processing ? 'Enregistrement...' : 'Valider le Paiement'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </DashboardLayout>
    );
}
