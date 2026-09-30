// resources/js/Pages/Dashboard.jsx
import DashboardLayout from "@/Layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, GraduationCap, School, Calendar, ArrowUpRight, Clock, 
  User, Mail, Phone, MapPin, Briefcase, BookOpen, Wallet, 
  TrendingUp, TrendingDown, Coins, UserPlus, Receipt 
} from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import { Link, usePage } from "@inertiajs/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";


export default function Dashboard({ counts, recentRegistrations, financialStats, financialChart, todayStats, currentYear }) {
  const { t } = useTranslation();
  const { auth = {} } = usePage().props;
  const permissions = auth?.permissions || [];
  const roles = auth?.roles || [];
  const can = (permission) => permissions.includes(permission) || roles.includes('super-admin') || roles.includes('directeur') || roles.includes('admin') || roles.includes('comptable');

  // Données réelles venant du contrôleur
  const stats = [
    { title: t("total_students"), value: counts?.students || 0, icon: <GraduationCap className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-100" },
    { title: t("total_teachers"), value: counts?.teachers || 0, icon: <Users className="w-6 h-6" />, color: "text-green-600", bg: "bg-green-100" },
    { title: t("total_classes"), value: counts?.classes || 0, icon: <School className="w-6 h-6" />, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: t("total_parents"), value: counts?.parents || 0, icon: <Users className="w-6 h-6" />, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <DashboardLayout title={t("dashboard")}>
      {/* Bienvenue */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-0.5">
          {t("dashboard")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          Pilotage général de votre établissement en direct et pour l'année scolaire en cours.
        </p>
      </div>

      {/* ⚡ BANDEAU EXÉCUTIF DU JOUR EN DIRECT (LIVE COCKPIT) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 bg-gradient-to-br from-[#0B1A2D] via-slate-900 to-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-slate-900/25 border border-slate-700/60 relative overflow-hidden text-white"
      >
        {/* Glow de fond */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        {/* Mini barre d'action discrète */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08] relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">Activité en direct aujourd'hui</span>
          </div>

          {todayStats?.can_see_finances && (
            <Link
              href={route('paiements.index')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 hover:text-white transition border border-white/10"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Journal de Caisse &rarr;
            </Link>
          )}
        </div>

        {/* Cartes métriques du jour */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
          {/* 1. Recette du Jour */}
          {todayStats?.can_see_finances ? (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] transition-all group">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Recette du Jour</p>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                    Entrées
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                  {new Intl.NumberFormat('fr-FR').format(todayStats?.recettes || 0)} <span className="text-[11px] font-bold text-emerald-400">FCFA</span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-300">
                  <span className="font-semibold text-emerald-300">{todayStats?.nb_operations || 0} quittance{todayStats?.nb_operations > 1 ? 's' : ''}</span>
                  {todayStats?.recettes > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">{new Intl.NumberFormat('fr-FR').format(todayStats?.especes || 0)} F espèces</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] transition-all group">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Journée en cours</p>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                    Actif
                  </span>
                </div>
                <p className="text-base font-bold text-white mt-0.5 truncate">
                  {todayStats?.date_complete || 'Opérations Ouvertes'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Accueil et services scolaires opérationnels
                </p>
              </div>
            </div>
          )}

          {/* 2. Inscrits du Jour */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] transition-all group">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Inscrits du Jour</p>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 font-extrabold px-1.5 py-0.5 rounded-md border border-blue-500/30">
                  Élèves
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                {todayStats?.inscriptions_count || 0} <span className="text-[11px] font-bold text-blue-300">{todayStats?.inscriptions_count > 1 ? 'nouveaux' : 'nouveau'}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {todayStats?.inscriptions_count > 0 ? 'Dossier(s) validé(s) aujourd\'hui' : 'Aucune inscription enregistrée'}
              </p>
            </div>
          </div>

          {/* 3. Bilan du Jour (recettes - dépenses aujourd'hui) */}
          {todayStats?.can_see_finances ? (
            <div
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] transition-all group"
              title={`Bilan du jour = Recettes encaissées aujourd'hui (${new Intl.NumberFormat('fr-FR').format(todayStats?.recettes || 0)} F) moins les dépenses enregistrées aujourd'hui (${new Intl.NumberFormat('fr-FR').format(todayStats?.depenses || 0)} F). Ce montant ne représente PAS le solde total du mois.`}
            >
              <div className={`p-2 rounded-lg border shrink-0 group-hover:scale-105 transition-transform ${(todayStats?.solde || 0) >= 0 ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                <Wallet className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Bilan du Jour</p>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border bg-slate-500/30 text-slate-300 border-slate-500/30">
                    Aujourd'hui
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                  {(todayStats?.solde || 0) >= 0 ? '+' : ''}
                  {new Intl.NumberFormat('fr-FR').format(todayStats?.solde || 0)}{' '}
                  <span className={`text-[11px] font-bold ${(todayStats?.solde || 0) >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>FCFA</span>
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-300 truncate">
                  <span className="text-emerald-300 font-semibold">+{new Intl.NumberFormat('fr-FR').format(todayStats?.recettes || 0)} F entrées</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-rose-300 font-semibold">-{new Intl.NumberFormat('fr-FR').format(todayStats?.depenses || 0)} F sorties</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.09] transition-all group">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">Activité Guichet</p>
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md border border-amber-500/30">
                    Flux
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight">
                  {todayStats?.nb_flux || 0} <span className="text-[11px] font-bold text-amber-300">lignes</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Flux administratifs du jour
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cartes KPI Expressives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {/* KPI 1 : Effectif Global */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Effectif Global
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {counts?.students || 0}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">élèves inscrits</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {counts?.garcons || 0} G ({counts?.pct_garcons || 0}%)
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              {counts?.filles || 0} F ({counts?.pct_filles || 0}%)
            </span>
            <span className="text-[11px] bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md font-semibold text-slate-600 dark:text-slate-300">
              {counts?.reinscrits || 0} Réinscrits
            </span>
          </div>
        </motion.div>

        {/* KPI 2 : Classes & Groupes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Classes & Groupes
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-inner">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {counts?.classes || 0}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">classes pédagogiques</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              ~{counts?.moyenne_par_classe || 0} élèves / classe
            </span>
            <span className="text-[11px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
              {counts?.cycles_count || 3} Cycles
            </span>
          </div>
        </motion.div>

        {/* KPI 3 : Corps Enseignant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Corps Enseignant
            </span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {counts?.teachers || 0}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">professeurs actifs</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <span className="font-medium text-slate-600 dark:text-slate-400">Équipe pédagogique</span>
            <span className="text-[11px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold">
              En poste
            </span>
          </div>
        </motion.div>

        {/* KPI 4 : Parents & Responsables */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Parents & Tuteurs
            </span>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {counts?.parents || 0}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">familles suivies</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <span className="font-medium text-slate-600 dark:text-slate-400">Liaison familles</span>
            <span className="text-[11px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold">
              Comptes tuteurs
            </span>
          </div>
        </motion.div>
      </div>


      {/* SECTION FINANCES (Si autorisé) */}
      {financialStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              Aperçu Financier
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">
                — cumul du mois en cours
              </span>
            </h2>
            <Link href={route('finances.index')} className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Revenus */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 group">
              <div className={`absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-green-400 to-green-600 rounded-bl-3xl`}>
                <TrendingUp className="w-16 h-16 text-[#0B1A2D]" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recettes</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#0B1A2D] dark:text-white tracking-tight">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(financialStats.income)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 w-max px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Encaissé ce mois-ci
                </div>
              </div>
            </div>
            {/* Dépenses */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 group">
              <div className={`absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-br from-red-500 to-red-600 rounded-bl-3xl`}>
                <TrendingDown className="w-16 h-16 text-[#0B1A2D]" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Dépenses</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#0B1A2D] dark:text-white tracking-tight">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(financialStats.expense)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 w-max px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Salaires & Factures
                </div>
              </div>
            </div>
            {/* Solde du Mois */}
            <div
              className="relative overflow-hidden bg-[#0B1A2D] dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-900/20 border border-[#1e293b] group text-white"
              title={`Solde du mois = Total des recettes encaissées ce mois (${new Intl.NumberFormat('fr-FR').format(financialStats.income)} F) moins le total des dépenses de ce mois (${new Intl.NumberFormat('fr-FR').format(financialStats.expense)} F). Différent du bilan du jour visible dans le bandeau supérieur.`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 bg-gradient-to-br from-white to-white/50 rounded-bl-3xl`}>
                <Wallet className="w-16 h-16 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-1">Solde du Mois</p>
                <p className="text-xs text-blue-300/70 mb-2">Recettes − Dépenses (mois en cours)</p>
                <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${financialStats.balance >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(financialStats.balance)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/80 bg-white/10 w-max px-3 py-1 rounded-full border border-white/5">
                  <span className={`w-1.5 h-1.5 rounded-full ${financialStats.balance >= 0 ? 'bg-green-400' : 'bg-orange-400'} animate-pulse`}></span>
                  Cash flow — {new Date().toLocaleString('fr-FR', { month: 'long' })}
                </div>
              </div>
            </div>
          </div>

          {/* GRAPHIQUE */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8">Tendance Financière (6 mois)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} /> {/* Vert */}
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} /> {/* Bleu / Océan */}
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      padding: '12px 16px',
                      fontWeight: '600',
                      color: '#0f172a'
                    }}
                    itemStyle={{ fontWeight: '700' }}
                  />
                  <Area type="monotone" dataKey="Revenus" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenus)" />
                  <Area type="monotone" dataKey="Dépenses" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorDepenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tableau des dernières inscriptions (prend 2/3 largeur) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              {t("recent_registrations")}
            </h2>
            <Link href={route('users.index')} className="text-sm text-green-600 hover:text-green-700 font-bold hover:underline bg-green-50 px-4 py-2 rounded-full transition-colors">
              {t("view_all")}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/80">
                <tr className="text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 sm:px-8 py-5">{t("student")}</th>
                  <th className="px-6 py-5">{t("class")}</th>
                  <th className="px-6 py-5">{t("registration_date")}</th>
                  <th className="px-6 sm:px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {recentRegistrations.length > 0 ? recentRegistrations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B1A2D] to-blue-800 outline outline-2 outline-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                          {item.avatar}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-green-600 transition-colors">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200/60 dark:border-slate-600">
                        {item.classe}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.date}
                    </td>
                    <td className="px-6 sm:px-8 py-5">
                      {item.status === 'validee' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                          Validée
                        </span>
                      )}
                      {item.status === 'en_attente' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          En attente
                        </span>
                      )}
                      {item.status === 'brouillon' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          Brouillon
                        </span>
                      )}
                      {item.status === 'rejete' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          Rejetée
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Users className="w-10 h-10 text-slate-300" />
                        <span>Aucune inscription récente.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Carte info ou Actions rapides (1/3 largeur) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#0B1A2D] to-blue-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden h-fit"
        >
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-green-500 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>

          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 relative z-10 border border-white/10 backdrop-blur-sm">
            <Briefcase className="w-6 h-6 text-green-400" />
          </div>

          <h3 className="text-2xl font-extrabold mb-3 relative z-10 tracking-tight">Actions Rapides</h3>
          <p className="text-blue-200 mb-8 text-sm relative z-10 font-medium leading-relaxed">
            Accédez en un clic aux fonctions essentielles de gestion.
          </p>

          <div className="space-y-3.5 relative z-10">
            {counts?.pending_demandes > 0 && (
              <Link href={route('demandes-documents.index')} className="w-full flex items-center justify-between p-4 bg-amber-500/20 hover:bg-amber-500/30 rounded-2xl transition-all border border-amber-400/40 group shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="font-extrabold text-sm text-amber-200 group-hover:text-amber-100 transition-colors">
                    Demandes Documents ({counts.pending_demandes})
                  </span>
                </div>
                <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-amber-400/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-amber-300" />
                </div>
              </Link>
            )}

            {can('ajouter_inscriptions') && (
              <Link href={route('inscriptions.create')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-green-500/20 rounded-2xl transition-all border border-white/10 hover:border-green-400/30 group">
                <span className="font-semibold text-sm group-hover:text-green-300 transition-colors">Nouvelle Inscription</span>
                <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-green-400/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-green-400" />
                </div>
              </Link>
            )}
            {can('ajouter_paiements') && (
              <Link href={route('paiements.index')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-green-500/20 rounded-2xl transition-all border border-white/10 hover:border-green-400/30 group">
                <span className="font-semibold text-sm group-hover:text-green-300 transition-colors">Encaisser un Paiement</span>
                <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-green-400/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-green-400" />
                </div>
              </Link>
            )}
            {(can('voir_notes') || can('ajouter_notes')) && (
              <Link href={route('cours.index')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-green-500/20 rounded-2xl transition-all border border-white/10 hover:border-green-400/30 group">
                <span className="font-semibold text-sm group-hover:text-green-300 transition-colors">Saisir des Notes</span>
                <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-green-400/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-green-400" />
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}