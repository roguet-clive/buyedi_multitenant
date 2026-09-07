import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { PencilIcon, TrashIcon, EyeIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { PlusCircleIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function Index() {
  const { t } = useTranslation();
  const { 
    inscriptions: serverInscriptions, 
    filters: serverFilters, 
    statsTenue = { total: 0, payee: 0, impayee: 0 },
    flash, 
    auth 
  } = usePage().props;

  // Permission Helper
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  const inscriptions = serverInscriptions || { data: [], links: [] };
  const filters = serverFilters || {};

  const { delete: destroy } = useForm();
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route('inscriptions.index'),
        { 
          search,
          statut: filters.statut || undefined,
          statut_tenue: filters.statut_tenue || undefined,
        },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = (id) => {
    if (!confirm(t('confirm_delete', '⚠️ Supprimer cette inscription ? Cela pourrait supprimer d\'autres données liées.'))) return;
    destroy(route('inscriptions.destroy', id), {
      onSuccess: () => { },
    });
  };

  const formatAmount = (amount) => amount ? parseFloat(amount).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA';

  // Utiliser directement total_frais de l'inscription
  const grandTotal = (inscriptions.data || []).reduce((sum, insc) => sum + parseFloat(insc.total_frais || 0), 0);

  return (
    <DashboardLayout title={t('inscriptions', 'Inscriptions')}>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            {t('inscriptions', 'Inscriptions & Réinscriptions')}
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-sm font-bold shadow-sm border border-blue-200 dark:border-blue-800/50">
              {inscriptions.total} {t('inscriptions_count', 'élèves')}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gérez les admissions, réinscriptions et le suivi des frais d'inscription et tenues scolaires.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {can('ajouter_inscriptions') && (
            <Link
              href={route('inscriptions.create')}
              className="group flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-green-500/30 transition-all active:scale-95"
            >
              <PlusCircleIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>{t('create_inscription', 'Nouvelle Inscription')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* SYNTHÈSE SUIVI DES TENUES & ADMISSIONS (KPIs RAPIDES) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Dossiers Inscrits</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{statsTenue.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-lg">
            🎓
          </div>
        </div>

        <div 
          onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: 'payee' }, { preserveState: true })}
          className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between
            ${filters.statut_tenue === 'payee'
              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700 ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
            }
          `}
        >
          <div>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">👕 Tenues Scolaires Payées</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{statsTenue.payee}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div 
          onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: 'impayee' }, { preserveState: true })}
          className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between
            ${filters.statut_tenue === 'impayee'
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300'
            }
          `}
        >
          <div>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">⏳ Tenues Non Réglées (À payer)</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{statsTenue.impayee}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* FILTERS TBT & SEARCH SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t('search_student', 'Rechercher un élève, matricule...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* FILTRE STATUT DOSSIER */}
          <div className="relative w-full sm:w-44">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
            </div>
            <select
              className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium"
              value={filters.statut || ''}
              onChange={(e) => router.get(route('inscriptions.index'), { search, statut: e.target.value, statut_tenue: filters.statut_tenue }, { preserveState: true })}
            >
              <option value="">{t('all_statuses', 'Tous les statuts')}</option>
              <option value="validee">{t('statut_validee', 'Validées')}</option>
              <option value="en_attente">{t('statut_en_attente', 'En attente')}</option>
              <option value="brouillon">{t('statut_brouillon', 'Brouillons')}</option>
              <option value="rejete">{t('statut_rejete', 'Rejetées')}</option>
            </select>
          </div>

          {/* FILTRE SUIVI TENUE SCOLAIRE */}
          <div className="relative w-full sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs">
              👕
            </div>
            <select
              className="block w-full pl-8 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium"
              value={filters.statut_tenue || ''}
              onChange={(e) => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: e.target.value }, { preserveState: true })}
            >
              <option value="">👕 Tenues : Toutes</option>
              <option value="payee">✅ Tenue Réglée ({statsTenue.payee})</option>
              <option value="impayee">⏳ Tenue Non Réglée ({statsTenue.impayee})</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* TABLE SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 rounded-3xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead className="bg-[#0B1A2D] text-slate-300">
              <tr className="text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-5 rounded-tl-3xl">{t('eleve', 'Élève')}</th>
                <th className="px-6 py-5">{t('classe', 'Classe')}</th>
                <th className="px-6 py-5">Type Admission</th>
                <th className="px-6 py-5">👕 Tenue Scolaire</th>
                <th className="px-6 py-5">{t('statut', 'Statut')}</th>
                <th className="px-6 py-5 text-right">{t('montant_total', 'Frais Encaissés')}</th>
                <th className="px-6 py-5 text-center rounded-tr-3xl">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {inscriptions.data.length > 0 ? inscriptions.data.map((insc) => {
                const isTenuePayee = insc.tenue_payee || (insc.paiements || []).some(p => p.frais_type?.code === 'tenue' || p.frais_type?.nom?.toLowerCase().includes('tenue'));

                return (
                  <tr key={insc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    {/* ÉLÈVE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1A2D] to-blue-800 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
                          {insc.eleve?.user?.prenom?.charAt(0)}{insc.eleve?.user?.nom?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                            {insc.eleve?.user?.prenom} {insc.eleve?.user?.nom}
                          </div>
                          <span className="text-xs text-slate-500 font-medium font-mono">{insc.eleve?.matricule || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* CLASSE */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200/60 dark:border-slate-600">
                        {insc.classe?.nom}
                      </span>
                    </td>

                    {/* TYPE D'ADMISSION (INSCRIPTION 10000 VS REINSCRIPTION 5000) */}
                    <td className="px-6 py-4">
                      {insc.reinscription ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          Réinscription (5 000 F)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Inscription (10 000 F)
                        </span>
                      )}
                    </td>

                    {/* SUIVI DE LA TENUE SCOLAIRE */}
                    <td className="px-6 py-4">
                      {(() => {
                        const isSecondaire = insc.classe?.type === 'secondaire';
                        const montantTenue = insc.montant_tenue_exigible || (isSecondaire ? 15000 : 10000);
                        const montantPaye = insc.paiement_tenue?.montant || (isTenuePayee ? montantTenue : 0);

                        return isTenuePayee ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            ✓ Payée ({formatAmount(montantPaye)})
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                            ${isSecondaire
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            }
                          `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isSecondaire ? 'bg-purple-500' : 'bg-amber-500'}`}></span>
                            ⏳ En attente ({formatAmount(montantTenue)})
                          </span>
                        );
                      })()}
                    </td>

                    {/* STATUT DU DOSSIER */}
                    <td className="px-6 py-4">
                      {insc.statut === 'validee' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-500/10 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Validée
                        </span>
                      )}
                      {insc.statut === 'en_attente' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> En attente
                        </span>
                      )}
                      {(insc.statut === 'brouillon' || !insc.statut) && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Brouillon
                        </span>
                      )}
                      {insc.statut === 'rejete' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/10 px-3 py-1 text-xs font-bold text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Rejetée
                        </span>
                      )}
                    </td>

                    {/* MONTANT TOTAL ENCAISSÉ */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-extrabold text-[#0B1A2D] dark:text-white bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                          {formatAmount(insc.total_frais)}
                        </span>
                        {insc.has_remise && (
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            🏷️ Remise -{Number(insc.remise_pourcentage || 50)}%
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          href={route('inscriptions.show', insc.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors"
                          title={t('view', 'Voir le dossier & suivi tenue')}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <a
                          href={route('inscriptions.recu', insc.id)}
                          target="_blank"
                          title={t('recu', 'Imprimer le Reçu d\'inscription')}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                          <PrinterIcon className="w-5 h-5" />
                        </a>

                        {can('modifier_inscriptions') && (
                          <Link
                            href={route('inscriptions.edit', insc.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
                            title={t('edit', 'Éditer')}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </Link>
                        )}

                        {can('supprimer_inscriptions') && (
                          <button
                            onClick={() => handleDelete(insc.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            title={t('delete', 'Supprimer')}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <span>{t('no_inscriptions_found', 'Aucune inscription ne correspond à votre filtre')}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {/* FOOTER TOTAL */}
            {inscriptions.data.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-900/50 font-bold border-t border-slate-200 dark:border-slate-700">
                  <td colSpan="5" className="px-6 py-5 text-right text-slate-600 dark:text-slate-400 uppercase tracking-widest text-xs">
                    {t('total_general', 'Total Frais Inscription Encaissés (Page courante)')}
                  </td>
                  <td className="px-6 py-5 text-right text-lg text-green-600">
                    {formatAmount(grandTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        {inscriptions.links.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap justify-center sm:justify-end gap-2">
            {inscriptions.links.map((link, i) => (
              <Link
                key={i}
                href={link.url || "#"}
                preserveScroll
                preserveState
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${link.active
                    ? "bg-[#0B1A2D] text-white shadow-md"
                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                  } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
