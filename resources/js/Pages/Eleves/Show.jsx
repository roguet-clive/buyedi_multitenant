import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import {
  UserIcon, CalendarIcon, MapPinIcon, EnvelopeIcon, ExclamationTriangleIcon, DocumentTextIcon,
  CreditCardIcon, AcademicCapIcon, ArrowLeftIcon, ArrowDownTrayIcon,
  ClockIcon, CheckBadgeIcon, XCircleIcon, CheckCircleIcon, IdentificationIcon, PrinterIcon,
  TrashIcon, PlusCircleIcon, CloudArrowUpIcon, DocumentPlusIcon, FolderIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShowEleve({ eleve, financeStats, inscriptions, paiements, documents, absences }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('infos');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { auth } = usePage().props;
  const permissions = auth?.permissions || [];
  const roles = auth?.roles || [];
  const can = (permission) => permissions.includes(permission) || roles.includes('super-admin') || roles.includes('directeur');
  const canViewFinances = can('voir_paiements');

  // Formulaire d'upload de pièces justificatives
  const { data, setData, post, processing, errors, reset } = useForm({
    nom: '',
    type: "Acte de Naissance",
    description: '',
    fichier: null,
  });

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    post(route('eleves.documents.store', eleve.id), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowUploadModal(false);
      },
    });
  };

  const handleDeleteDocument = (docId, docNom) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le document "${docNom}" ?`)) {
      router.delete(route('eleves.documents.destroy', docId));
    }
  };

  const tabs = [
    { id: 'infos', label: 'Profil Complet', icon: UserIcon },
    { id: 'inscriptions', label: 'Scolarité', icon: AcademicCapIcon },
    { id: 'absences', label: 'Assiduité', icon: ClockIcon },
    ...(canViewFinances ? [{ id: 'paiements', label: 'Finances', icon: CreditCardIcon }] : []),
    { id: 'documents', label: 'Pièces Jointes', icon: DocumentTextIcon },
  ];

  return (
    <DashboardLayout title={`${eleve.prenom} ${eleve.nom}`}>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOP NAVIGATION */}
        <div className="flex justify-between items-center -mb-2">
          <Link
            href={route('eleves.index')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Dossiers Élèves
          </Link>

          <div className="flex gap-2 items-center">
            {can('ajouter_inscriptions') && !eleve.is_inscrit_annee_en_cours && (
              <Link href={route("inscriptions.create.eleve", eleve.id)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-600/20 transition hidden sm:block">
                + Inscrire pour l'année
              </Link>
            )}
            {eleve.is_inscrit_annee_en_cours && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs font-bold rounded-xl hidden sm:inline-flex">
                <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                Inscrit(e) en {eleve.classe}
              </span>
            )}
            {can('modifier_eleves') && (
              <Link href={route('eleves.edit', eleve.id)} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-sm shadow-amber-500/20 transition">
                Éditer Profil
              </Link>
            )}
          </div>
        </div>

        {/* HERO BANNER & PROFILE HEADER */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden relative border border-slate-100 dark:border-slate-700/50">

          {/* Banner cover */}
          <div className="h-40 bg-gradient-to-r from-[#0B1A2D] via-slate-800 md:via-[#0B1A2D] to-indigo-900 border-b border-white/10 relative overflow-hidden">
            {/* Decorative abstract circles */}
            <div className="absolute -top-24 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute top-12 left-24 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
          </div>

          {/* Main Info Box */}
          <div className="px-6 sm:px-10 pb-10 flex flex-col md:flex-row items-center md:items-end -mt-16 sm:-mt-20 gap-6 sm:gap-8 relative z-10">

            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105">
                {eleve.photo ? (
                  <img src={eleve.photo} alt={eleve.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-4xl font-extrabold text-slate-400">
                    {eleve.nom ? eleve.nom.charAt(0) : '?'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 tooltip-trigger" title="Dossier Actif">
                <span className="flex h-5 w-5 border-4 border-white dark:border-slate-800 rounded-full bg-green-500 shadow-md"></span>
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              </div>
            </div>

            {/* Typography */}
            <div className="flex-1 text-center md:text-left mb-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-4 mb-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1A2D] dark:text-white uppercase tracking-tight">
                  {eleve.nom} <span className="font-medium capitalize text-slate-600 dark:text-slate-300">{eleve.prenom}</span>
                </h1>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-semibold">
                  <IdentificationIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 font-medium text-xs">Matr.</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{eleve.matricule}</span>
                </div>

                {eleve.classe ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-bold border border-blue-200/50 dark:border-blue-800/50">
                    <AcademicCapIcon className="w-4 h-4" />
                    {eleve.classe}
                    <span className="text-blue-400 dark:text-blue-500 font-medium ml-1">({eleve.annee_actuelle})</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-bold border border-amber-200/50">
                    Classe non assignée
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* TABS (PILL DESIGN) */}
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-[1.5rem] overflow-x-auto hide-scrollbar sticky top-4 z-30 shadow-sm border border-slate-200/50 dark:border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap outline-none ${isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60 dark:hover:bg-slate-700'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="pill-bubble"
                    className="absolute inset-0 bg-[#0B1A2D] dark:bg-slate-700 rounded-xl shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25 }}
            >

              {/* TAB : INFORMATIONS */}
              {activeTab === 'infos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-lg">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      Données Civiles
                    </h3>
                    <div className="space-y-6">
                      <InfoCard label="Email / Contact" value={eleve.email} valueClass="font-medium font-mono" />
                      <InfoCard label="Sexe Apparaissant" value={eleve.sexe === 'M' ? '👔 Masculin' : '👗 Féminin'} />
                      <InfoCard label="Date de naissance" value={eleve.date_naissance} />
                      <InfoCard label="Lieu de naissance" value={eleve.lieu_naissance} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                      <div className="p-2 bg-red-50 dark:bg-red-900/40 text-red-600 rounded-lg">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                      </div>
                      Santé & Particularités
                    </h3>
                    {eleve.probleme_particulier ? (
                      <div className="p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl text-red-800 dark:text-red-200 font-medium">
                        {eleve.probleme_particulier}
                      </div>
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <span className="inline-block p-3 bg-green-50 text-green-500 rounded-full mb-3">
                          <CheckCircleIcon className="w-6 h-6" />
                        </span>
                        <p className="text-slate-500 font-medium text-sm">Aucun antécédent médical ou problème particulier signalé pour cet élève.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB : SCOLARITÉ */}
              {activeTab === 'inscriptions' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0B1A2D] text-slate-300">
                        <tr>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider rounded-tl-3xl">Cycle Annuel</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Classe Affectée</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Date Enregistrement</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider text-right rounded-tr-3xl">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {inscriptions.length > 0 ? inscriptions.map((insc) => (
                          <tr key={insc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-5 font-bold text-slate-800 dark:text-white">{insc.annee}</td>
                            <td className="px-6 py-5">
                              <span className="inline-flex border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm">
                                {insc.classe}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-slate-500 text-sm font-medium">{insc.date}</td>
                            <td className="px-6 py-5 text-right">
                              {insc.en_cours ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 rounded-lg text-xs font-bold border border-green-200/50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> EN COURS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                                  CLÔTURÉ
                                </span>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">Aucun historique d'inscription scolaire.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB : ABSENCES */}
              {activeTab === 'absences' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0B1A2D] text-slate-300">
                        <tr>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider rounded-tl-3xl">Date de Signalement</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Type Période</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Couverture Justif.</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider text-right rounded-tr-3xl">Motif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {absences && absences.length > 0 ? absences.map((abs) => (
                          <tr key={abs.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-5 font-semibold text-slate-800 dark:text-slate-200">{abs.date}</td>
                            <td className="px-6 py-5">
                              {abs.type === 'absence' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-md text-xs font-bold border border-red-100 dark:border-transparent">
                                  <XCircleIcon className="w-4 h-4" /> ABSENCE TOTALE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-md text-xs font-bold border border-amber-100 dark:border-transparent">
                                  <ClockIcon className="w-4 h-4" /> RETARD ENR.
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {abs.justifiee ? (
                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 text-sm font-bold"><CheckCircleIcon className="w-5 h-5" /> Approuvé</span>
                              ) : (
                                <span className="text-slate-400 font-semibold text-sm">Non Couvert / Irreg.</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right text-slate-500 italic text-sm">
                              {abs.motif || <span className="opacity-50">- Motif Inconnu -</span>}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4">
                                  <CheckBadgeIcon className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Assiduité Exemplaire</h4>
                                <p className="text-slate-500 mt-1 max-w-sm">Aucune absence ni retard n'ont été enregistrés pour cet élève cette année.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB : PAIEMENTS & SITUATION FINANCIÈRE */}
              {activeTab === 'paiements' && canViewFinances && (
                <div className="space-y-6">

                  {/* 1. BANNIÈRE D'ALERTE / STATUT D'ÉCHÉANCE SCOLARITÉ */}
                  {financeStats && (
                    <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                      financeStats.est_a_jour
                        ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                        : "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 ${
                          financeStats.est_a_jour
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                            : "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                        }`}>
                          {financeStats.est_a_jour ? (
                            <CheckBadgeIcon className="w-7 h-7" />
                          ) : (
                            <ExclamationTriangleIcon className="w-7 h-7" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold tracking-tight">
                              {financeStats.est_a_jour
                                ? "Situation Scolaire Régulière (À Jour)"
                                : `Retard de Paiement Détecté (${financeStats.nb_mois_en_retard} mois impayé${financeStats.nb_mois_en_retard > 1 ? 's' : ''})`
                              }
                            </h4>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              financeStats.est_a_jour
                                ? "bg-emerald-200/60 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                                : "bg-rose-200/60 dark:bg-rose-900 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200"
                            }`}>
                              Mois échu : {financeStats.mois_actuel_nom}
                            </span>
                          </div>
                          <p className="text-xs font-medium opacity-90 mt-0.5">
                            {financeStats.est_a_jour
                              ? `Toutes les mensualités échues jusqu'au mois de ${financeStats.mois_actuel_nom} ont été dûment encaissées.`
                              : `L'élève cumule un retard total de ${financeStats.montant_en_retard.toLocaleString('fr-FR')} FCFA pour les échéances passées.`
                            }
                          </p>
                        </div>
                      </div>

                      <Link
                        href={route('paiements.index', { search: eleve.matricule })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition active:scale-95 shrink-0"
                      >
                        <CreditCardIcon className="w-4 h-4 text-emerald-600" />
                        Encaisser au Guichet
                      </Link>
                    </div>
                  )}

                  {/* 2. SYNTHÈSE DES 4 CARTES FINANCIÈRES & JAUGE GLOBALE */}
                  {financeStats && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-6">
                      
                      {/* Titre */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <AcademicCapIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              Bilan de la Scolarité Annuelle
                            </h3>
                            <p className="text-xs font-medium text-slate-400">Année scolaire {eleve.annee_actuelle} • Classe : {eleve.classe}</p>
                          </div>
                        </div>
                      </div>

                      {/* 4 KPIs Clés */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                            1. Scolarité Annuelle Totale
                          </span>
                          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                            {financeStats.montant_annuel.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">FCFA</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">Tarif officiel pour sa classe</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                              2. Total Déjà Réglé
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono">
                              {financeStats.pourcentage}%
                            </span>
                          </div>
                          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {financeStats.total_paye.toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-700/60">FCFA</span>
                          </div>
                          <p className="text-[11px] text-emerald-600/80 mt-1 font-medium">Somme des règlements encaissés</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
                            3. Reste Global à Payer
                          </span>
                          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                            {financeStats.reste_a_payer.toLocaleString('fr-FR')} <span className="text-xs font-bold text-rose-700/60">FCFA</span>
                          </div>
                          <p className="text-[11px] text-rose-600/80 mt-1 font-medium">Solde pour achever l'année</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
                            4. Mensualité de Référence
                          </span>
                          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                            {financeStats.montant_mensuel.toLocaleString('fr-FR')} <span className="text-xs font-bold text-blue-700/60">FCFA</span>
                          </div>
                          <p className="text-[11px] text-blue-600/80 mt-1 font-medium">Sur 10 mois scolaires</p>
                        </div>
                      </div>

                      {/* JAUGE DE PROGRESSION VISUELLE */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">
                            Progression du règlement annuel :
                          </span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {financeStats.total_paye.toLocaleString('fr-FR')} / {financeStats.montant_annuel.toLocaleString('fr-FR')} FCFA ({financeStats.pourcentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${Math.max(financeStats.pourcentage > 0 ? 3 : 0, financeStats.pourcentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. CALENDRIER / DÉCOMPOSITION DES 10 MOIS SCOLAIRES */}
                  {financeStats && financeStats.mois_details && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-emerald-500" />
                            Échéancier Mensuel des Cotisations
                          </h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Suivi détaillé mois par mois de Septembre à Juin
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Réglé
                          </span>
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> En retard
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span> À échoir
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {financeStats.mois_details.map((m) => {
                          const isPaid = m.statut === 'paye';
                          const isLate = m.statut === 'en_retard';

                          return (
                            <div
                              key={m.mois}
                              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all relative ${
                                isPaid
                                  ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                                  : isLate
                                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 ring-2 ring-rose-400/20"
                                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider">{m.mois}</span>
                                {isPaid ? (
                                  <span className="p-1 rounded-lg bg-emerald-500 text-white">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                  </span>
                                ) : isLate ? (
                                  <span className="p-1 rounded-lg bg-rose-500 text-white">
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>

                              <div>
                                <div className="text-base font-black font-mono">
                                  {m.montant.toLocaleString('fr-FR')} <span className="text-[10px] font-bold opacity-75">FCFA</span>
                                </div>
                                <div className="text-[10px] font-extrabold uppercase mt-1">
                                  {isPaid ? (
                                    <span className="text-emerald-700 dark:text-emerald-400">
                                      Réglé {m.info_reglement?.date ? `le ${m.info_reglement.date}` : ''}
                                    </span>
                                  ) : isLate ? (
                                    <span className="text-rose-600 dark:text-rose-400 font-black">
                                      🚨 Impayé Échu
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">
                                      Échéance à venir
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. TABLEAU HISTORIQUE DES REÇUS & RÈGLEMENTS */}
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                    <div className="p-6 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                          Historique des Règlements & Reçus Officiels
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Tous les versements validés au guichet pour cet élève
                        </p>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {paiements.length} versement(s)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#0B1A2D] text-slate-300 text-[10px] uppercase font-black tracking-wider">
                          <tr>
                            <th className="px-6 py-4 rounded-tl-3xl">Date Enregistrée</th>
                            <th className="px-6 py-4">Motif & Période</th>
                            <th className="px-6 py-4">Mode de Règlement</th>
                            <th className="px-6 py-4">Encaissé Par</th>
                            <th className="px-6 py-4 text-right">Montant Encaissé</th>
                            <th className="px-6 py-4 text-center rounded-tr-3xl">Reçu Officiel</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs sm:text-sm">
                          {paiements.length > 0 ? paiements.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {p.date}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-bold inline-block text-xs px-2.5 py-1 rounded-lg border ${
                                  p.is_scolarite
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                }`}>
                                  {p.type}
                                </span>
                                {p.mois && (
                                  <div className="text-[11px] font-semibold text-slate-500 mt-1">
                                    Mois : <strong>{p.mois}</strong>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                                  p.mode === 'especes' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                                  p.mode === 'mobile' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' :
                                  'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'
                                }`}>
                                  {p.mode === 'especes' && '💵'}
                                  {p.mode === 'mobile' && '📱'}
                                  {(p.mode === 'virement' || p.mode === 'cheque') && '🏦'}
                                  <span>{p.mode}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {p.caissier}
                              </td>
                              <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono text-base whitespace-nowrap">
                                {p.montant.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">FCFA</span>
                              </td>
                              <td className="px-6 py-4 text-center whitespace-nowrap">
                                <a
                                  href={route('paiements.recu', p.id)}
                                  target="_blank"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold text-xs rounded-xl shadow-sm transition"
                                  title="Imprimer le Reçu Officiel 2 volets A4"
                                >
                                  <PrinterIcon className="w-4 h-4" />
                                  <span>Reçu</span>
                                </a>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                Aucun paiement n'a encore été enregistré pour cet élève.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB : DOCUMENTS & PIÈCES DU DOSSIER */}
              {activeTab === 'documents' && (
                <div className="space-y-10">

                  {/* EN-TÊTE DE LA SECTION DOCUMENTS */}
                  <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="space-y-1.5 z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-black uppercase tracking-wider">
                        <FolderIcon className="w-4 h-4" />
                        Gestion du Dossier & Pièces Justificatives
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        Documents Scolaires de {eleve.prenom} {eleve.nom}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                        Consultez et téléchargez vos attestations officielles, ou déposez vos pièces administratives (acte de naissance, certificat médical, photo).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="z-10 inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <span>Déposer un document</span>
                    </button>
                  </div>

                  {/* 1. PIÈCES ADMINISTRATIVES OFFICIELLES */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                          <IdentificationIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Documents Administratifs Officiels (PDF)
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">
                            Délivrance certifiée avec cachet numérique et QR Code de sécurité
                          </p>
                        </div>
                      </div>
                    </div>

                    {!roles.some(r => ['super-admin', 'directeur', 'personnel', 'comptable'].includes(r.toLowerCase())) ? (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-850 p-6 rounded-3xl border border-indigo-100 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        <div className="space-y-1 max-w-xl">
                          <h5 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
                            Guichet Numérique des Demandes
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Pour obtenir un <strong>Certificat de Scolarité</strong>, une <strong>Carte Scolaire</strong> ou une <strong>Fiche de Synthèse</strong>, transmettez votre demande en 1 clic. Dès validation par le secrétariat, votre document officiel certifié sera téléchargeable directement.
                          </p>
                        </div>
                        <Link
                          href={route('demandes-documents.index')}
                          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all shrink-0"
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                          <span>Faire / Suivre mes Demandes</span>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DocumentCard title="Carte Étudiant" subtitle="Format Badge ID CR80" icon={IdentificationIcon} color="bg-indigo-500" highlight="Légal" href={route('eleves.carte', eleve.id)} />
                        <DocumentCard title="Certificat Scolarité" subtitle={`Année ${eleve.annee_actuelle}`} icon={DocumentTextIcon} color="bg-blue-500" highlight="Vérifié" href={route('eleves.certificat', eleve.id)} />
                        <DocumentCard title="Bonne Conduite" subtitle="Attestation Officielle" icon={CheckBadgeIcon} color="bg-emerald-500" highlight="Diplôme" href={route('eleves.attestation', eleve.id)} />
                        <DocumentCard title="Fiche Synthèse" subtitle="Archive Complète de l'Élève" icon={UserIcon} color="bg-amber-500" href={route('eleves.fiche', eleve.id)} />
                        <DocumentCard title="Billet de Sortie" subtitle="Autorisation d'absence / Sortie" icon={ClockIcon} color="bg-slate-600" href={route('eleves.sortie', eleve.id)} />
                      </div>
                    )}
                  </div>

                  {/* 2. PIÈCES JUSTIFICATIVES TÉLÉVERSÉES PAR L'ÉLÈVE / PARENT */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                          <DocumentPlusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            Pièces Justificatives Déposées ({documents.length})
                          </h4>
                          <p className="text-xs text-slate-400 font-medium">
                            Actes de naissance, certificats médicaux, photos d'identité et justificatifs
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {documents.length} pièce{documents.length > 1 ? 's' : ''} au dossier
                      </span>
                    </div>

                    {documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                  doc.type?.toLowerCase().includes('naissance') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                                  doc.type?.toLowerCase().includes('médical') || doc.type?.toLowerCase().includes('medical') ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800' :
                                  doc.type?.toLowerCase().includes('photo') ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' :
                                  doc.type?.toLowerCase().includes('paiement') ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' :
                                  'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'
                                }`}>
                                  {doc.type || 'Pièce Justificative'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(doc.id, doc.nom)}
                                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                                  title="Supprimer cette pièce"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>

                              <div>
                                <h5 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                                  {doc.nom}
                                </h5>
                                {doc.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {doc.date}
                              </span>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white font-bold text-xs rounded-xl shadow-sm transition"
                              >
                                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                <span>Ouvrir / Télécharger</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl space-y-3">
                        <div className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl w-12 h-12 mx-auto shadow-sm flex items-center justify-center">
                          <CloudArrowUpIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            Aucune pièce justificative téléversée pour le moment
                          </p>
                          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                            Vous pouvez ajouter un extrait de naissance, un certificat médical ou une photo d'identité pour compléter ce dossier scolaire.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowUploadModal(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition"
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                          <span>Ajouter le premier document</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* MODAL DE TÉLÉVERSEMENT DE DOCUMENT (UX PRO 2 COLONNES) */}
                  {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* 1. HEADER FIXE */}
                        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50 shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/20">
                              <CloudArrowUpIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                                Déposer une Pièce Justificative
                              </h3>
                              <p className="text-xs text-indigo-200/80 font-medium">
                                Dossier de <span className="text-white font-bold">{eleve.prenom} {eleve.nom}</span> • Matr. <span className="font-mono text-indigo-300 font-bold">{eleve.matricule}</span>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
                            title="Fermer"
                          >
                            <XCircleIcon className="w-6 h-6" />
                          </button>
                        </div>

                        {/* 2. BODY SCROLLABLE & GRILLE 2 COLONNES */}
                        <form id="upload-doc-form" onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            {/* COLONNE GAUCHE : INFORMATIONS DU DOCUMENT */}
                            <div className="space-y-4">
                              {/* Type de Pièce */}
                              <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                  Type de document <span className="text-rose-500">*</span>
                                </label>
                                <select
                                  value={data.type}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setData(d => ({
                                      ...d,
                                      type: val,
                                      nom: d.nom === '' || d.nom === d.type ? val : d.nom
                                    }));
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer"
                                >
                                  <option value="Acte de Naissance">📜 Acte de Naissance / Jugement</option>
                                  <option value="Certificat Médical">🏥 Certificat Médical / Inaptitude EPS</option>
                                  <option value="Photo d'Identité">🖼️ Photo d'Identité récente</option>
                                  <option value="Bulletin Antérieur">📋 Dernier Bulletin (Transfert)</option>
                                  <option value="Bordereau de Paiement">💳 Preuve / Bordereau Paiement</option>
                                  <option value="Autre Justificatif">📁 Autre pièce justificative</option>
                                </select>
                              </div>

                              {/* Libellé / Titre */}
                              <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                  Libellé du document <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ex: Extrait d'acte de naissance certifié"
                                  value={data.nom}
                                  onChange={(e) => setData('nom', e.target.value)}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                />
                                {errors.nom && <p className="text-xs text-rose-500 font-bold mt-1">{errors.nom}</p>}
                              </div>

                              {/* Description / Note */}
                              <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                  Note / Observation <span className="text-slate-400 font-normal lowercase">(optionnel)</span>
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Ex: Délivré par la mairie du 1er arrondissement"
                                  value={data.description}
                                  onChange={(e) => setData('description', e.target.value)}
                                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition resize-none"
                                />
                              </div>
                            </div>

                            {/* COLONNE DROITE : ZONE DE FICHIER INTERACTIVE */}
                            <div className="flex flex-col justify-between space-y-2">
                              <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                  Fichier joint <span className="text-rose-500">*</span>
                                </label>
                                
                                <label
                                  htmlFor="modal-doc-file-input"
                                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center min-h-[140px] ${
                                    data.fichier
                                      ? 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20'
                                      : 'border-indigo-300 dark:border-slate-600 bg-indigo-50/30 dark:bg-slate-900/50 hover:border-indigo-500 hover:bg-indigo-50/60'
                                  }`}
                                >
                                  {data.fichier ? (
                                    <div className="space-y-2">
                                      <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <CheckCircleIcon className="w-6 h-6" />
                                      </div>
                                      <div className="text-xs font-black text-slate-800 dark:text-white max-w-[220px] truncate">
                                        {data.fichier.name}
                                      </div>
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                        <span>{(data.fichier.size / (1024 * 1024)).toFixed(2)} Mo</span>
                                        <span>&bull; Prêt</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 underline pt-1">Cliquer pour changer de fichier</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-1.5">
                                      <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                        <CloudArrowUpIcon className="w-6 h-6" />
                                      </div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Cliquez pour sélectionner un fichier
                                      </p>
                                      <p className="text-[11px] text-slate-400 font-medium">
                                        Formats : PDF, JPG, PNG, WEBP
                                      </p>
                                    </div>
                                  )}

                                  <input
                                    id="modal-doc-file-input"
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setData('fichier', e.target.files[0])}
                                    className="sr-only"
                                  />
                                </label>
                                {errors.fichier && <p className="text-xs text-rose-500 font-bold mt-1">{errors.fichier}</p>}
                              </div>

                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">ℹ️ Astuce :</span>
                                <span>Taille max conseillée : 5 Mo par document.</span>
                              </div>
                            </div>

                          </div>
                        </form>

                        {/* 3. FOOTER FIXE (TOUJOURS VISIBLE ET ACCESSIBLE) */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700/80 shrink-0 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className="px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                          >
                            Annuler
                          </button>
                          
                          <button
                            type="submit"
                            form="upload-doc-form"
                            disabled={processing || !data.fichier}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
                          >
                            {processing ? (
                              <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                <span>Enregistrement en cours...</span>
                              </>
                            ) : (
                              <>
                                <CloudArrowUpIcon className="w-4 h-4" />
                                <span>Valider et Enregistrer</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helpers Components
function InfoCard({ label, value, valueClass = "" }) {
  if (!value) return null;
  return (
    <div className="group">
      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">{label}</span>
      <span className={`block text-lg font-semibold text-slate-800 dark:text-slate-200 ${valueClass}`}>{value}</span>
    </div>
  )
}

function DocumentCard({ title, subtitle, icon: Icon, color, highlight, href }) {
  const { t } = useTranslation();
  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:border-transparent hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 relative group overflow-hidden`}>
      {highlight && (
        <div className={`absolute top-4 right-4 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase rounded text-center tracking-widest z-10`}>
          {highlight}
        </div>
      )}
      {/* Background shape */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${color} opacity-5 group-hover:scale-150 group-hover:opacity-10 transition-all duration-500`}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className={`p-3.5 ${color} rounded-[1rem] text-white shadow-sm inline-flex w-max mb-5`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-extrabold text-slate-800 dark:text-white leading-tight mb-1">{title}</h4>
          <p className="text-sm font-medium text-slate-500 mb-6">{subtitle}</p>
        </div>
        <a
          href={href}
          target="_blank"
          className={`inline-flex items-center justify-center gap-2 text-sm font-bold text-white ${color} hover:brightness-110 w-full px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95`}
        >
          <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={3} /> {t('download_pdf', 'Générer (PDF)')}
        </a>
      </div>
    </div>
  );
}
