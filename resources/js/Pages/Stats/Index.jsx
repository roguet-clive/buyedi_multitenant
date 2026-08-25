import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import { BarChart3, TrendingUp, Users, GraduationCap, Calendar, Medal, Award, Star } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Index({ annexes, filters, annees, demographie, finances, performance }) {
    const { t } = useTranslation();

    // --- COLORS ---
    const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#14B8A6'];

    // --- FILTERS HANDLERS ---
    const handleYearChange = (option) => {
        router.get(route('stats.index'), { ...filters, annee_id: option.value }, { preserveState: true });
    };

    // --- DATA PREPARATION ---
    const genreData = demographie.genre.map(g => ({ name: g.sexe === 'M' ? t('boys', 'Garçons') : t('girls', 'Filles'), value: g.total }));
    const sectionData = demographie.sections.map(s => ({ name: t(s.section) || s.section.charAt(0).toUpperCase() + s.section.slice(1), value: s.total }));
    const revenueData = finances.byType.map(f => ({ name: f.nom, value: parseInt(f.total) }));

    // --- TABS ---
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: t('stats_general', 'Général'), icon: Users },
        { id: 'finances', label: t('stats_finances', 'Finances'), icon: TrendingUp },
        { id: 'performance', label: t('stats_performance', 'Performance'), icon: GraduationCap },
        { id: 'pedagogie', label: t('stats_pedagogy', 'Pédagogie'), icon: BarChart3 },
    ];

    // Select Custom Styles
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: state.isFocused ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(255, 255, 255, 0.5)' : null,
            borderRadius: '1rem',
            padding: '2px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }),
        singleValue: (base) => ({
            ...base,
            color: 'white',
            fontWeight: '600'
        }),
        placeholder: (base) => ({
            ...base,
            color: 'rgba(255,255,255,0.7)'
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white' // Ensure menu is white (or dark in dark mode, but we keep it light for now to match default select)
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
            color: state.isSelected ? 'white' : '#1e293b',
            cursor: 'pointer',
            padding: '10px 15px',
        })
    };

    return (
        <DashboardLayout title={t("stats_title", "Statistiques & Rapports")}>
            <Head title={t("stats_title", "Statistiques Avancées")} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-teal-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-300 text-sm font-medium mb-4 border border-white/10 shadow-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>{t("stats_dashboard", "Tableau de Bord Analytique")}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-white drop-shadow-sm">
                            {t("stats_title", "Statistiques & Rapports")}
                        </h1>
                        <p className="text-slate-300 text-base max-w-2xl font-light">
                            {t("stats_subtitle", "Visualisez l'évolution démographique, financière et pédagogique de votre établissement pour prendre les meilleures décisions.")}
                        </p>
                    </div>

                    <div className="w-full md:w-80 flex-shrink-0 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            {t("select_academic_year", "Année Scolaire")}
                        </div>
                        <Select
                            options={annees.map(a => ({ value: a.id, label: a.nom }))}
                            defaultValue={annees.map(a => ({ value: a.id, label: a.nom })).find(opt => opt.value == filters.annee_id)}
                            onChange={handleYearChange}
                            placeholder={t("select_year", "Année scolaire...")}
                            styles={selectStyles}
                            isSearchable={false}
                        />
                    </div>
                </div>
            </div>

            {/* TABS HEADER - PILL STYLE */}
            <div className="mb-8 flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
                <nav className="flex space-x-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-300 ${isActive
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'opacity-70'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* CONTENT */}
            <div className="space-y-6">

                {/* --- TAB: GENERAL (DEMOGRAPHIE) --- */}
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Carte: Répartition Garçons / Filles */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <PieChart className="w-5 h-5" />
                                </div>
                                {t("stats_repartition_sexe", "Répartition par Sexe")}
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genreData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {genreData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Carte: Élèves par Cycle */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                {t("stats_students_by_cycle", "Effectifs par Cycle")}
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sectionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                            {sectionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: FINANCES --- */}
                {activeTab === 'finances' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                        <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-white flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400 shadow-inner">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            {t("stats_revenue_source", "Répartition des Revenus par Type")}
                        </h3>

                        <div className="h-96 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value) => [new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(value), t('revenue', 'Revenu')]}
                                        cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#64748b', marginBottom: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={32}>
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* --- TAB: PERFORMANCE --- */}
                {activeTab === 'performance' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Class Ranking Chart */}
                        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl duration-300 flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {t("stats_class_success", "Taux de Réussite par Classe (%)")}
                                </h3>
                            </div>
                            <div className="flex-1 min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performance?.classRanking} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="classe" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === 'success_rate' ? `${value}%` : `${value}/20`,
                                                name === 'success_rate' ? t("success_rate", "Taux de Réussite") : t("class_average", "Moyenne")
                                            ]}
                                            cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                        <Bar dataKey="success_rate" name="success_rate" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="average_global" name="average_global" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Students Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg text-yellow-600 dark:text-yellow-400 shadow-inner">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                                        {t("stats_top_students", "Tableau d'Honneur")}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-500 mt-2">Top 5 des meilleures moyennes générales.</p>
                            </div>

                            <div className="flex-1 overflow-x-auto p-2">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-transparent text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-xl">{t("student", "Élève")}</th>
                                            <th className="px-6 py-4">{t("class", "Classe")}</th>
                                            <th className="px-6 py-4 text-right rounded-tr-xl">{t("average", "Moyenne")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {performance?.topStudents && performance.topStudents.length > 0 ? (
                                            performance.topStudents.map((student, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner
                                                            ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900' :
                                                                idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' :
                                                                    idx === 2 ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' :
                                                                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                            {idx < 3 ? <Medal className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                                        </div>
                                                        <span className="truncate max-w-[120px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{student.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{student.classe}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                            ${idx === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                            {student.average} / 20
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <Star className="w-8 h-8 mb-3 opacity-20" />
                                                        <p>{t("stats_empty", "Aucune donnée de performance disponible")}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* --- TAB: PEDAGOGIE (Placeholder) --- */}
                {activeTab === 'pedagogie' && (
                    <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700 backdrop-blur-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {t("stats_pedagogy_title", "Statistiques Pédagogiques")}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {t("work_in_progress", "Ce module est en cours de développement. Il inclura bientôt le suivi des absences, les statistiques de ponctualité temporelle, et le rapport des conseils de discipline.")}
                        </p>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

