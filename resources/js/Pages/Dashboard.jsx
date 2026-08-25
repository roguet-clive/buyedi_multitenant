// resources/js/Pages/Dashboard.jsx
import DashboardLayout from "@/Layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Users, GraduationCap, School, Calendar, ArrowUpRight, Clock, User, Mail, Phone, MapPin, Briefcase, BookOpen, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import { Link } from "@inertiajs/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";


export default function Dashboard({ counts, recentRegistrations, financialStats, financialChart }) {
  const { t } = useTranslation();

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {t("dashboard")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Aperçu général de votre établissement pour l'année scolaire en cours.
        </p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-extrabold text-[#0B1A2D] dark:text-white group-hover:text-green-500 transition-colors">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} bg-opacity-50 ring-4 ring-white dark:ring-slate-800`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
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
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">(Mois en cours)</span>
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
            {/* Solde */}
            <div className="relative overflow-hidden bg-[#0B1A2D] dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-900/20 border border-[#1e293b] group text-white">
              <div className={`absolute top-0 right-0 p-4 opacity-10 bg-gradient-to-br from-white to-white/50 rounded-bl-3xl`}>
                <Wallet className="w-16 h-16 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">Solde Net</p>
                <p className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${financialStats.balance >= 0 ? 'text-green-400' : 'text-orange-400'}`}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(financialStats.balance)}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/80 bg-white/10 w-max px-3 py-1 rounded-full border border-white/5">
                  <span className={`w-1.5 h-1.5 rounded-full ${financialStats.balance >= 0 ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                  Cash flow mensuel
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

          <div className="space-y-4 relative z-10">
            <Link href={route('inscriptions.create')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-green-500/20 rounded-2xl transition-all border border-white/10 hover:border-green-400/30 group">
              <span className="font-semibold text-sm group-hover:text-green-300 transition-colors">Nouvelle Inscription</span>
              <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-green-400/20 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-green-400" />
              </div>
            </Link>
            <Link href={route('paiements.index')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-green-500/20 rounded-2xl transition-all border border-white/10 hover:border-green-400/30 group">
              <span className="font-semibold text-sm group-hover:text-green-300 transition-colors">Encaisser un Paiement</span>
              <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-green-400/20 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-green-400" />
              </div>
            </Link>
            <Link href={route('cours.index')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-green-500/20 rounded-2xl transition-all border border-white/10 hover:border-green-400/30 group">
              <span className="font-semibold text-sm group-hover:text-green-300 transition-colors">Saisir des Notes</span>
              <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-green-400/20 transition-colors">
                <ArrowUpRight className="w-4 h-4 text-blue-200 group-hover:text-green-400" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}