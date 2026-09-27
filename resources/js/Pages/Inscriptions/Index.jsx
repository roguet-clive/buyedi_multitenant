import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { 
  Users, GraduationCap, CheckCircle2, Clock, Shirt, 
  Printer, Plus, Search, X, Filter, RotateCcw, 
  ChevronDown, AlertCircle, Eye, Pencil, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InscriptionDeleteModal from './Partials/InscriptionDeleteModal';

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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    router.delete(route("inscriptions.destroy", deleteTarget.id), {
      preserveScroll: true,
      onFinish: () => {
        setIsDeleting(false);
        setDeleteTarget(null);
      },
    });
  };

  const formatAmount = (amount) => amount ? parseFloat(amount).toLocaleString('fr-FR') + ' FCFA' : '0 FCFA';

  // Utiliser directement total_frais de l'inscription
  const grandTotal = (inscriptions.data || []).reduce((sum, insc) => sum + parseFloat(insc.total_frais || 0), 0);

  // Ratios pour les tenues
  const pctPayee = statsTenue.total > 0 ? Math.round((statsTenue.payee / statsTenue.total) * 100) : 0;
  const pctImpayee = statsTenue.total > 0 ? Math.round((statsTenue.impayee / statsTenue.total) * 100) : 0;
  const hasActiveFilters = Boolean(search || filters.statut || filters.statut_tenue);

  const resetAllFilters = () => {
    setSearch('');
    router.get(route('inscriptions.index'), {}, { preserveState: false });
  };

  return (
    <DashboardLayout title={t('inscriptions', 'Inscriptions')}>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {t('inscriptions', 'Inscriptions & Réinscriptions')}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 text-xs font-bold border border-blue-200/80 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              {inscriptions.total} {t('inscriptions_count', 'élèves')}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Gérez les admissions, le suivi des frais d'inscription et la confection des tenues scolaires.
          </p>
        </div>

        {/* ACTIONS GROUPÉES ET HIERARCHISÉES */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
          {/* Actions secondaires : impressions & registres */}
          <Link
            href={route('inscriptions.tenues.fournisseur')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm transition-all active:scale-95 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            title="Consulter et imprimer la liste officielle pour le fournisseur de tenues"
          >
            <Shirt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Fournisseur Tenues</span>
          </Link>

          <Link
            href={route('inscriptions.registre')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm transition-all active:scale-95 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            title="Consulter et imprimer le registre global des inscrits"
          >
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Registre Global</span>
          </Link>

          {/* Action principale CTA */}
          {can('ajouter_inscriptions') && (
            <Link
              href={route('inscriptions.create')}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/25 transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('create_inscription', 'Nouvelle Inscription')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* SYNTHÈSE STATS & SUIVI DES TENUES (KPIs INTERACTIFS ET UNIFORMES) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* CARTE 1 : TOTAL DOSSIERS */}
        <div 
          onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: '' }, { preserveState: true })}
          className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 group relative overflow-hidden flex flex-col justify-between ${
            !filters.statut_tenue
              ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-600 shadow-md ring-2 ring-blue-500/15'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Dossiers Inscrits
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                  {statsTenue.total}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {statsTenue.total > 1 ? 'dossiers' : 'dossier'}
                </span>
              </div>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              !filters.statut_tenue
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600'
            }`}>
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Effectif global
            </span>
            {!filters.statut_tenue ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Affiché
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors font-medium">
                Voir tout →
              </span>
            )}
          </div>
        </div>

        {/* CARTE 2 : TENUES PAYÉES */}
        <div 
          onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: 'payee' }, { preserveState: true })}
          className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 group relative overflow-hidden flex flex-col justify-between ${
            filters.statut_tenue === 'payee'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5" /> Tenues Payées
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
                  {statsTenue.payee}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ({pctPayee}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {statsTenue.payee > 0 && (
                <a
                  href={route('inscriptions.tenues.fournisseur')}
                  onClick={(e) => e.stopPropagation()}
                  title="Imprimer directement le bon fournisseur"
                  className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-center transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </a>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                filters.statut_tenue === 'payee'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 group-hover:bg-emerald-200'
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-emerald-700/80 dark:text-emerald-400 text-xs font-medium">
              Prêtes pour confection
            </span>
            {filters.statut_tenue === 'payee' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                Filtre actif
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 transition-colors font-medium">
                Filtrer →
              </span>
            )}
          </div>
        </div>

        {/* CARTE 3 : TENUES NON RÉGLÉES */}
        <div 
          onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: 'impayee' }, { preserveState: true })}
          className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 group relative overflow-hidden flex flex-col justify-between ${
            filters.statut_tenue === 'impayee'
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Tenues En Attente
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300">
                  {statsTenue.impayee}
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  ({pctImpayee}%)
                </span>
              </div>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
              filters.statut_tenue === 'impayee'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 group-hover:bg-amber-200'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-amber-700/80 dark:text-amber-400 text-xs font-medium">
              Relances à prévoir
            </span>
            {filters.statut_tenue === 'impayee' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                Filtre actif
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 group-hover:text-amber-600 transition-colors font-medium">
                Filtrer →
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700/70 rounded-2xl p-3.5 sm:p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[260px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={t('search_student', 'Rechercher un élève par nom, prénom, matricule...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-9 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50/70 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FILTERS CONTROLS */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* FILTRE STATUT DOSSIER */}
            <div className="relative min-w-[170px] flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                className="block w-full pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm appearance-none font-medium cursor-pointer"
                value={filters.statut || ''}
                onChange={(e) => router.get(route('inscriptions.index'), { search, statut: e.target.value, statut_tenue: filters.statut_tenue }, { preserveState: true })}
              >
                <option value="">Tous les statuts</option>
                <option value="validee">Validées</option>
                <option value="en_attente">En attente</option>
                <option value="brouillon">Brouillons</option>
                <option value="rejete">Rejetées</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* FILTRE SUIVI TENUE SCOLAIRE */}
            <div className="relative min-w-[195px] flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shirt className="w-3.5 h-3.5" />
              </div>
              <select
                className="block w-full pl-9 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs sm:text-sm appearance-none font-medium cursor-pointer"
                value={filters.statut_tenue || ''}
                onChange={(e) => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: e.target.value }, { preserveState: true })}
              >
                <option value="">Tenues : Toutes</option>
                <option value="payee">Tenues : Payées ({statsTenue.payee})</option>
                <option value="impayee">Tenues : En attente ({statsTenue.impayee})</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* RESET BUTTON */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                title="Réinitialiser tous les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* BANNIÈRE CONTEXTUELLE QUAND FILTRE TENUES PAYÉES ACTIF */}
      {filters.statut_tenue === 'payee' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <span>Filtre Fournisseur : {statsTenue.payee} élève(s) ayant réglé leur tenue</span>
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Prêt pour la commande officielle. Générez la fiche récapitulative A4 avec totaux par genre et colonnes pour mensurations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <Link
              href={route('inscriptions.tenues.fournisseur')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Bon Fournisseur ({statsTenue.payee})</span>
            </Link>
            <button
              onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: '' }, { preserveState: true })}
              className="p-2 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-xl transition-colors"
              title="Fermer ce filtre"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* BANNIÈRE CONTEXTUELLE QUAND FILTRE TENUES EN ATTENTE ACTIF */}
      {filters.statut_tenue === 'impayee' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span>Relance Tenues : {statsTenue.impayee} élève(s) en attente de règlement</span>
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Dossiers inscrits dont la tenue scolaire doit encore être encaissée auprès des parents.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.get(route('inscriptions.index'), { search, statut: filters.statut, statut_tenue: '' }, { preserveState: true })}
            className="p-2 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded-xl transition-colors self-end md:self-center shrink-0"
            title="Effacer le filtre"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

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
                <th className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-slate-400" />
                    Tenue Scolaire
                  </span>
                </th>
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

                    {/* TYPE D'ADMISSION */}
                    <td className="px-6 py-4">
                      {insc.reinscription ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                          Réinscription
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Inscription
                        </span>
                      )}
                    </td>

                    {/* SUIVI DE LA TENUE SCOLAIRE */}
                    <td className="px-6 py-4">
                      {(() => {
                        const montantTenue = insc.montant_tenue_exigible || 0;
                        const montantPaye = insc.paiement_tenue?.montant || (isTenuePayee ? montantTenue : 0);

                        return isTenuePayee ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Payée ({formatAmount(montantPaye)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            En attente ({formatAmount(montantTenue)})
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
                            Remise -{Number(insc.remise_pourcentage || 50)}%
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
                          <Eye className="w-4 h-4" />
                        </Link>
                        <a
                          href={route('inscriptions.recu', insc.id)}
                          target="_blank"
                          title={t('recu', 'Imprimer le Reçu d\'inscription')}
                          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </a>

                        {can('modifier_inscriptions') && (
                          <Link
                            href={route('inscriptions.edit', insc.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
                            title={t('edit', 'Éditer')}
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                        )}

                        {can('supprimer_inscriptions') && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(insc)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            title={t('delete', 'Supprimer')}
                          >
                            <Trash2 className="w-4 h-4" />
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
                        <Search className="w-8 h-8 text-slate-300" />
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

      {/* MODALE DE SUPPRESSION SÉCURISÉE DE L'INSCRIPTION */}
      <InscriptionDeleteModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}
