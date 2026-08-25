import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';
import {
  UserIcon, CalendarIcon, MapPinIcon, EnvelopeIcon, ExclamationTriangleIcon, DocumentTextIcon,
  CreditCardIcon, AcademicCapIcon, ArrowLeftIcon, ArrowDownTrayIcon,
  ClockIcon, CheckBadgeIcon, XCircleIcon, CheckCircleIcon, IdentificationIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShowEleve({ eleve, inscriptions, paiements, documents, absences }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('infos');
  const { auth } = usePage().props;
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  const tabs = [
    { id: 'infos', label: 'Profil Complet', icon: UserIcon },
    { id: 'inscriptions', label: 'Scolarité', icon: AcademicCapIcon },
    { id: 'absences', label: 'Assiduité', icon: ClockIcon },
    { id: 'paiements', label: 'Finances', icon: CreditCardIcon },
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

          <div className="flex gap-2">
            {can('ajouter_inscriptions') && (
              <Link href={route("inscriptions.create.eleve", eleve.id)} className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg shadow-sm shadow-green-500/20 transition hidden sm:block">
                + Nouvelle Inscription
              </Link>
            )}
            {can('modifier_eleves') && (
              <Link href={route('eleves.edit', eleve.id)} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg shadow-sm shadow-amber-500/20 transition">
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
                  MAT- <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{eleve.matricule}</span>
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

              {/* TAB : PAIEMENTS */}
              {activeTab === 'paiements' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#0B1A2D] text-slate-300">
                        <tr>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider rounded-tl-3xl">Date Comptable</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Libellé Frais</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Référence Transaction</th>
                          <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider text-right rounded-tr-3xl">Montant Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {paiements.length > 0 ? paiements.map((paiement) => (
                          <tr key={paiement.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-5 text-slate-600 dark:text-slate-400 font-medium">{paiement.date}</td>
                            <td className="px-6 py-5">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">{paiement.type}</span>
                              <span className="text-xs text-slate-400 font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">{paiement.annee}</span>
                            </td>
                            <td className="px-6 py-5 text-sm font-mono text-slate-500">{paiement.reference || '#N/A'}</td>
                            <td className="px-6 py-5 text-right font-extrabold text-blue-600 dark:text-blue-400 text-lg">
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(paiement.montant || 0).replace('XAF', 'FCFA')}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">Aucun historique comptable n'existe pour cet élève.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB : DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* PIÈCES ADMINISTRATOIVES AUTO-GÉNÉRÉES */}
                  <DocumentCard title="Carte Étudiant" subtitle="Format ID" icon={IdentificationIcon} color="bg-indigo-500" highlight="Légal" href={route('eleves.carte', eleve.id)} />
                  <DocumentCard title="Certificat Scolarité" subtitle={`Année ${eleve.annee_actuelle}`} icon={DocumentTextIcon} color="bg-blue-500" highlight="Vérifié" href={route('eleves.certificat', eleve.id)} />
                  <DocumentCard title="Bonne Conduite" subtitle="Attestation" icon={CheckBadgeIcon} color="bg-green-500" highlight="Diplôme" href={route('eleves.attestation', eleve.id)} />
                  <DocumentCard title="Fiche Synthèse" subtitle="Archive Étudiant" icon={UserIcon} color="bg-amber-500" href={route('eleves.fiche', eleve.id)} />
                  <DocumentCard title="Billet de Sortie" subtitle="Vierge - Autorisation" icon={ClockIcon} color="bg-slate-600" href={route('eleves.sortie', eleve.id)} />

                  {/* FICHIERS UPLOADÉS */}
                  {documents.length > 0 && documents.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-500">
                            <DocumentTextIcon className="w-6 h-6" />
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight mb-2">{doc.nom}</h4>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{doc.date}</p>
                      </div>
                      <a href={doc.url} target="_blank" className="mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition">
                        <ArrowDownTrayIcon className="w-4 h-4" strokeWidth={2.5} /> Obtenir
                      </a>
                    </div>
                  ))}
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
