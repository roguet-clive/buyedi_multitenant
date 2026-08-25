import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PieChart as PieIcon } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";
import { useState, useMemo } from 'react';
import { motion } from "framer-motion";

export default function Index({ stats, totals, year, incomeBreakdown, expenseBreakdown }) {
    const { t } = useTranslation();

    // Curated Premium Color Palette aligned with brand
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const OTHER_COLOR = '#64748b'; // Slate 500

    const processChartData = (data, total) => {
        if (!data || data.length === 0) return [];
        const numericData = data.map(item => ({
            ...item,
            value: Number(item.value)
        }));

        const sorted = [...numericData].sort((a, b) => b.value - a.value);

        let processedData = [];
        if (sorted.length <= 5) {
            processedData = sorted;
        } else {
            const top = sorted.slice(0, 4);
            const others = sorted.slice(4);
            const othersValue = others.reduce((acc, curr) => acc + curr.value, 0);
            processedData = [
                ...top,
                { label: 'Autres', value: othersValue, isOther: true }
            ];
        }

        return processedData.map((item, index) => ({
            ...item,
            color: item.isOther ? OTHER_COLOR : COLORS[index % COLORS.length]
        }));
    };

    const chartIncomeData = useMemo(() => processChartData(incomeBreakdown, totals.revenus), [incomeBreakdown, totals.revenus]);
    const chartExpenseData = useMemo(() => processChartData(expenseBreakdown, totals.depenses), [expenseBreakdown, totals.depenses]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
    };

    const formatCompactCurrency = (amount) => {
        if (amount >= 1000000) {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                notation: "compact",
                maximumFractionDigits: 1
            }).format(amount);
        }
        return formatCurrency(amount);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700/50">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm mb-1.5 last:mb-0">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                            <span className="text-slate-500 dark:text-slate-400 font-medium capitalize flex-1">{entry.name}:</span>
                            <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // Card gradients
    const incomeGradient = "from-emerald-500 to-teal-400";
    const expenseGradient = "from-red-500 to-red-400";

    return (
        <DashboardLayout title={t("finance_overview", "Vue Globale des Finances")}>
            <Head title="Finances - Vue Globale" />

            <div className="pb-8">
                {/* HEADER BANNER PREMIUM */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0B1A2D] rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20"
                >
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                                <Wallet className="w-8 h-8 text-blue-300" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                                    {t("finance_overview", "Tableau de Bord Financier")}
                                </h1>
                                <p className="text-blue-200/80 font-medium flex items-center gap-2">
                                    Année Scolaire en cours
                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold shadow-sm">
                                        {year}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8"
                >
                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Revenus */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${incomeGradient} rounded-bl-[40px]`}>
                                <TrendingUp className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Revenus & Encaissements</h3>
                                </div>
                                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {formatCurrency(totals.revenus)}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Total Enregistré</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Dépenses */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${expenseGradient} rounded-bl-[40px]`}>
                                <TrendingDown className="w-24 h-24 text-red-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20 shadow-sm">
                                        <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dépenses & Sorties</h3>
                                </div>
                                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {formatCurrency(totals.depenses)}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400">Total Décaissé</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Solde Net - Premium Dark Card */}
                        <motion.div variants={itemVariants} className={`p-6 rounded-3xl shadow-2xl relative overflow-hidden group ${totals.solde >= 0 ? 'bg-[#0B1A2D] shadow-[#0B1A2D]/20' : 'bg-red-950 shadow-red-900/20'}`}>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2.5 rounded-xl shadow-inner ${totals.solde >= 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                        <DollarSign className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <h3 className={`text-sm font-bold uppercase tracking-widest ${totals.solde >= 0 ? 'text-blue-200' : 'text-red-200'}`}>Solde Net Actuel</h3>
                                </div>
                                <p className="text-4xl font-black text-white tracking-tight mt-1">
                                    {formatCurrency(totals.solde)}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${totals.solde >= 0 ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                                    <span className="text-xs font-bold text-white/90">Trésorerie Disponible</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* MAIN CHARTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar Chart */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50 gap-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-[#0B1A2D] dark:text-white">Flux Financiers Mensuels</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Comparatif Entrées / Sorties</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-default">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]"></span> Revenus
                                    </span>
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-default">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-[#f43f5e]"></span> Dépenses
                                    </span>
                                </div>
                            </div>
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#64748b" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.5 }} />
                                        <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[6, 6, 0, 0]} barSize={12} />
                                        <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Area Chart */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50">
                            <div className="mb-8 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-lg font-extrabold text-[#0B1A2D] dark:text-white">Évolution de la Trésorerie</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Courbe du solde net au fil des mois</p>
                            </div>
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#64748b" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}k`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="solde" name="Solde" stroke="#3b82f6" strokeWidth={4} fillUrl="url(#colorSolde)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* BREAKDOWN DONUT CHARTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Income */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
                            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                    <PieIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-[#0B1A2D] dark:text-white">Sources de Revenus</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Répartition</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-1">
                                <div className="h-64 w-64 relative shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartIncomeData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={75}
                                                outerRadius={95}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {chartIncomeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col px-4 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">Total</span>
                                        <span className="text-xl font-black text-[#0B1A2D] dark:text-white leading-none">
                                            {formatCompactCurrency(totals.revenus)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full space-y-2.5">
                                    {chartIncomeData.map((entry, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:shadow-md dark:hover:bg-slate-700 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]" title={entry.label}>
                                                    {entry.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                                    {formatCurrency(entry.value)}
                                                </span>
                                                <span className="text-[10px] font-black w-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-md py-1">
                                                    {((entry.value / totals.revenus) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Expenses */}
                        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 flex flex-col h-full">
                            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl border border-red-100 dark:border-red-500/20">
                                    <PieIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-[#0B1A2D] dark:text-white">Répartition des Dépenses</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Par catégories</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-1">
                                <div className="h-64 w-64 relative shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartExpenseData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={75}
                                                outerRadius={95}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {chartExpenseData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col px-4 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">Total</span>
                                        <span className="text-xl font-black text-[#0B1A2D] dark:text-white leading-none">
                                            {formatCompactCurrency(totals.depenses)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full space-y-2.5">
                                    {chartExpenseData.map((entry, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:shadow-md dark:hover:bg-slate-700 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]" title={entry.label}>
                                                    {entry.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-slate-900 dark:text-white text-sm">
                                                    {formatCurrency(entry.value)}
                                                </span>
                                                <span className="text-[10px] font-black w-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-md py-1">
                                                    {((entry.value / totals.depenses) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </motion.div>
            </div>
        </DashboardLayout>
    );
}
