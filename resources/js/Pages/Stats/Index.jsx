import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Select from 'react-select';
import { 
    BarChart3, TrendingUp, Users, GraduationCap, Calendar, Medal, Award, Star, 
    Printer, Download, Wallet, School, CheckCircle2, ArrowUpRight, ArrowDownRight, 
    BookOpen, ShieldCheck, UserCheck, Sparkles, Layers, DollarSign
} from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function Index({ annexes, filters, selectedAnnee, annees, kpis, demographie, finances, vieScolaire, performance }) {
    const { t } = useTranslation();

    // --- COLORS PALETTES ---
    const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#14B8A6', '#6366F1', '#F97316'];
    const GENDER_COLORS = ['#3B82F6', '#EC4899']; // Bleu (Garçons), Rose (Filles)

    // --- CURRENCY FORMATTER ---
    const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF', 
        maximumFractionDigits: 0 
    }).format(val || 0);

    // --- FILTERS HANDLERS ---
    const handleYearChange = (option) => {
        router.get(route('stats.index'), { ...filters, annee_id: option.value }, { preserveState: true });
    };

    // --- DATA PREPARATION ---
    const genreData = (demographie?.genre || []).map(g => ({ 
        name: g.sexe === 'M' ? t('boys', 'Garçons') : t('girls', 'Filles'), 
        value: Number(g.total) || 0 
    }));

    const sectionData = (demographie?.sections || []).map(s => ({ 
        name: s.section, 
        value: Number(s.total) || 0 
    }));

    const revenueData = (finances?.byType || []).map(f => ({ 
        name: f.nom, 
        value: parseInt(f.total) || 0 
    }));

    const modesPaiementData = (finances?.modesPaiement || []).map(m => ({
        name: m.label,
        value: Number(m.total) || 0,
        count: m.count
    }));

    const depensesData = (finances?.depensesByCat || []).map(d => ({
        name: d.label,
        value: Number(d.value) || 0
    }));

    const monthlyEvolutionData = (finances?.monthlyEvolution || []).filter(m => m.recettes > 0 || m.depenses > 0);

    // --- TABS ---
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: t('stats_general', 'Démographie & Classes'), icon: Users },
        { id: 'finances', label: t('stats_finances', 'Finances & Recouvrement'), icon: TrendingUp },
        { id: 'performance', label: t('stats_performance', 'Performance & Notes'), icon: GraduationCap },
        { id: 'viescolaire', label: t('stats_pedagogy', 'Vie Scolaire & Assiduité'), icon: BarChart3 },
    ];

    // --- PRINT HANDLER ---
    const handlePrint = () => {
        window.print();
    };

    // --- CSV EXPORT HANDLER ---
    const handleExportCSV = () => {
        const yearName = selectedAnnee?.nom || 'Annee';
        let csvContent = '\uFEFF'; // BOM pour UTF-8 dans Excel

        // Entête
        csvContent += `RAPPORT STATISTIQUE DE L'ETABLISSEMENT - ANNEE SCOLAIRE ${yearName}\n`;
        csvContent += `Date d'exportation : ${new Date().toLocaleDateString('fr-FR')}\n\n`;

        // 1. Indicateurs Globaux
        csvContent += `1. INDICATEURS GLOBAUX\n`;
        csvContent += `Indicateur;Valeur\n`;
        csvContent += `Total Eleves Inscrits;${kpis?.total_eleves || 0}\n`;
        csvContent += `Garcons;${kpis?.garcons || 0} (${kpis?.pct_garcons || 0}%)\n`;
        csvContent += `Filles;${kpis?.filles || 0} (${kpis?.pct_filles || 0}%)\n`;
        csvContent += `Nouveaux Eleves;${kpis?.nouveaux || 0}\n`;
        csvContent += `Reinscrits;${kpis?.reinscrits || 0}\n`;
        csvContent += `Total Classes;${kpis?.total_classes || 0}\n`;
        csvContent += `Moyenne par Classe;${kpis?.moyenne_par_classe || 0}\n`;
        csvContent += `Total Recettes (FCFA);${kpis?.total_revenus || 0}\n`;
        csvContent += `Total Depenses (FCFA);${kpis?.total_depenses || 0}\n`;
        csvContent += `Solde Net (FCFA);${kpis?.solde_net || 0}\n\n`;

        // 2. Effectifs par classe
        csvContent += `2. EFFECTIFS PAR CLASSE\n`;
        csvContent += `Classe;Cycle;Garcons;Filles;Total;Part (%)\n`;
        (demographie?.classes || []).forEach(c => {
            csvContent += `"${c.nom}";"${c.type}";${c.garcons};${c.filles};${c.total_eleves};${c.pourcentage}%\n`;
        });
        csvContent += `\n`;

        // 3. Recettes par type de frais
        csvContent += `3. RECETTES PAR TYPE DE FRAIS\n`;
        csvContent += `Type de Frais;Montant (FCFA)\n`;
        (finances?.byType || []).forEach(f => {
            csvContent += `"${f.nom}";${f.total}\n`;
        });

        // Téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `statistiques_buyedi_${yearName.replace('/', '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Select Custom Styles
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: state.isFocused ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(255, 255, 255, 0.5)' : null,
            borderRadius: '0.875rem',
            padding: '2px',
            color: 'white',
            cursor: 'pointer',
            minWidth: '180px',
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
            backgroundColor: 'white',
            zIndex: 50
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

            {/* PRINT CSS OVERRIDES */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    aside, nav, header, .no-print, button {
                        display: none !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .bg-gradient-to-br {
                        background: #0B1A2D !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .shadow-xl, .shadow-2xl {
                        box-shadow: none !important;
                    }
                }
            `}} />

            {/* HERO BANNER & ACTIONS */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-teal-950 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-300 text-xs md:text-sm font-medium mb-3 border border-white/10 shadow-sm">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{t("stats_dashboard", "Tableau de Bord Analytique & Décisionnel")}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black mb-2 tracking-tight text-white drop-shadow-sm flex items-center gap-3">
                            {t("stats_title", "Statistiques de l'Établissement")}
                            <span className="text-sm font-normal px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {selectedAnnee?.nom || '2026-2027'}
                            </span>
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base max-w-2xl font-light">
                            {t("stats_subtitle", "Indicateurs démographiques, ventilation des effectifs, flux financiers et assiduité en temps réel.")}
                        </p>
                    </div>

                    {/* ACTIONS: ANNEE + EXPORT + PRINT */}
                    <div className="w-full lg:w-auto flex flex-wrap items-center gap-3 no-print">
                        <div className="flex-1 sm:flex-initial bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-inner flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-300 ml-2" />
                            <Select
                                options={annees.map(a => ({ value: a.id, label: a.nom }))}
                                defaultValue={annees.map(a => ({ value: a.id, label: a.nom })).find(opt => opt.value == filters.annee_id)}
                                onChange={handleYearChange}
                                placeholder="Année..."
                                styles={selectStyles}
                                isSearchable={false}
                            />
                        </div>

                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-200 active:scale-95 shadow-sm"
                            title="Exporter les statistiques au format Excel (CSV)"
                        >
                            <Download className="w-4 h-4 text-emerald-300" />
                            <span className="hidden sm:inline">Exporter CSV</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-blue-600/30"
                            title="Imprimer le rapport ou générer un PDF"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Imprimer</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 CARTES KPI DE SYNTHÈSE AU SOMMET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* KPI 1 : Effectif Total */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Effectif Global
                        </span>
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpis?.total_eleves || 0}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">élèves inscrits</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {kpis?.garcons || 0} G ({kpis?.pct_garcons || 0}%)
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                            {kpis?.filles || 0} F ({kpis?.pct_filles || 0}%)
                        </span>
                        <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-600 dark:text-slate-300">
                            {kpis?.reinscrits || 0} Réinscrits
                        </span>
                    </div>
                </div>

                {/* KPI 2 : Classes & Ratio */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Classes & Groupes
                        </span>
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-inner">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpis?.total_classes || 0}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">classes pédagogiques</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            ~{kpis?.moyenne_par_classe || 0} élèves / classe
                        </span>
                        <span className="text-[11px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                            3 Cycles
                        </span>
                    </div>
                </div>

                {/* KPI 3 : Total Encaissé */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Recettes Encaissées
                        </span>
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(kpis?.total_revenus || 0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Dépenses :</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {formatCurrency(kpis?.total_depenses || 0)}
                        </span>
                    </div>
                </div>

                {/* KPI 4 : Solde Net & Marge */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Trésorerie Nette
                        </span>
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shadow-inner">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-2xl font-black tracking-tight ${kpis?.solde_net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatCurrency(kpis?.solde_net || 0)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Marge résiduelle :</span>
                        <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
                            kpis?.marge_pourcentage >= 0 
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                                : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                            {kpis?.marge_pourcentage || 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* TABS HEADER - PILL STYLE */}
            <div className="mb-8 flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar no-print">
                <nav className="flex space-x-2 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 whitespace-nowrap py-2.5 px-5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    isActive
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-slate-200/50 dark:ring-slate-700'
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

            {/* CONTENT AREA */}
            <div className="space-y-8">

                {/* ======================================================== */}
                {/* --- ONGLET 1 : DÉMOGRAPHIE & EFFECTIFS PAR CLASSE --- */}
                {/* ======================================================== */}
                {activeTab === 'general' && (
                    <div className="space-y-8">
                        {/* 2 Graphiques côte à côte */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Carte 1 : Répartition Garçons / Filles (DONUT PRO SANS SUPERPOSITION) */}
                            <div className="bg-white dark:bg-slate-900 p-7 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                                <PieChart className="w-5 h-5" />
                                            </div>
                                            {t("stats_repartition_sexe", "Répartition par Sexe")}
                                        </h3>
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                                            Total : {kpis?.total_eleves || 0}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                        Équilibre de parité garçons / filles sur l'ensemble des classes.
                                    </p>
                                </div>

                                {/* Graphique Donut avec Total au centre */}
                                <div className="h-64 relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={genreData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={4}
                                                dataKey="value"
                                                labelLine={false}
                                            >
                                                {genreData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} strokeWidth={2} stroke="#ffffff" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value} élève(s) (${((value / (kpis?.total_eleves || 1)) * 100).toFixed(1)}%)`,
                                                    name
                                                ]}
                                                contentStyle={{ 
                                                    borderRadius: '1rem', 
                                                    border: 'none', 
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: '#1E293B',
                                                    color: 'white'
                                                }}
                                                itemStyle={{ color: 'white', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Texte au centre du Donut */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-black text-slate-800 dark:text-white">
                                            {kpis?.total_eleves || 0}
                                        </span>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Élèves
                                        </span>
                                    </div>
                                </div>

                                {/* Badges informatifs sous le graphique */}
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/60 dark:border-blue-800/40">
                                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0"></div>
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Garçons</div>
                                            <div className="text-base font-bold text-slate-800 dark:text-white">
                                                {kpis?.garcons || 0} <span className="text-xs font-normal text-blue-600">({kpis?.pct_garcons || 0}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-pink-50/50 dark:bg-pink-900/20 rounded-2xl border border-pink-100/60 dark:border-pink-800/40">
                                        <div className="w-3.5 h-3.5 rounded-full bg-pink-500 shrink-0"></div>
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Filles</div>
                                            <div className="text-base font-bold text-slate-800 dark:text-white">
                                                {kpis?.filles || 0} <span className="text-xs font-normal text-pink-600">({kpis?.pct_filles || 0}%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Carte 2 : Élèves par Cycle (BAR CHART SOIGNÉ) */}
                            <div className="bg-white dark:bg-slate-900 p-7 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                                                <School className="w-5 h-5" />
                                            </div>
                                            {t("stats_students_by_cycle", "Effectifs par Cycle d'Enseignement")}
                                        </h3>
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                                            {sectionData.length} Cycles
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                        Répartition des apprenants entre Maternelle, Primaire et Secondaire.
                                    </p>
                                </div>

                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={sectionData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} 
                                                dy={8} 
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value) => [`${value} élève(s)`, 'Effectif']}
                                                cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                                contentStyle={{ 
                                                    borderRadius: '1rem', 
                                                    border: 'none', 
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: '#1E293B',
                                                    color: 'white'
                                                }}
                                            />
                                            <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={65}>
                                                {sectionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Résumé chiffré par cycle */}
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    {sectionData.map((s, idx) => (
                                        <div key={idx} className="flex-1 min-w-[100px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center border border-slate-100 dark:border-slate-800">
                                            <div className="text-xs text-slate-500 font-medium">{s.name}</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-white">
                                                {s.value} <span className="text-[10px] font-normal text-slate-400">({((s.value / (kpis?.total_eleves || 1)) * 100).toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* TABLEAU COMPLET DES EFFECTIFS PAR CLASSE */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 shadow-inner">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                            Ventilation Détaillée des Effectifs par Classe
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Suivi précis de chaque classe, ratio filles/garçons et part relative dans l'établissement.
                                        </p>
                                    </div>
                                </div>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    Total Inscrits : <span className="text-blue-600 font-bold">{kpis?.total_eleves || 0} élèves</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                                            <th className="px-6 py-4">Classe</th>
                                            <th className="px-6 py-4">Cycle</th>
                                            <th className="px-6 py-4 text-center">Garçons</th>
                                            <th className="px-6 py-4 text-center">Filles</th>
                                            <th className="px-6 py-4 text-center">Effectif Total</th>
                                            <th className="px-6 py-4">Part de l'Établissement</th>
                                            <th className="px-6 py-4 text-right">Modalité Scolarité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(demographie?.classes || []).map((classe, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    {classe.nom}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        classe.type === 'Maternelle' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        classe.type === 'Primaire' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                    }`}>
                                                        {classe.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-blue-600 dark:text-blue-400">
                                                    {classe.garcons}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium text-pink-600 dark:text-pink-400">
                                                    {classe.filles}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                                        {classe.total_eleves}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                                            <div 
                                                                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                                                style={{ width: `${classe.pourcentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[40px]">
                                                            {classe.pourcentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xs font-medium uppercase px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                                        {classe.mode_paiement === 'mensuel' ? '10 Mois' : '3 Tranches'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-black text-slate-800 dark:text-white text-sm">
                                            <td className="px-6 py-4" colSpan="2">TOTAL GÉNÉRAL</td>
                                            <td className="px-6 py-4 text-center text-blue-600">{kpis?.garcons || 0}</td>
                                            <td className="px-6 py-4 text-center text-pink-600">{kpis?.filles || 0}</td>
                                            <td className="px-6 py-4 text-center text-base font-black text-emerald-600">
                                                {kpis?.total_eleves || 0}
                                            </td>
                                            <td className="px-6 py-4" colSpan="2">
                                                100% de l'effectif
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* --- ONGLET 2 : FINANCES & RECOUVREMENT --- */}
                {/* ======================================================== */}
                {activeTab === 'finances' && (
                    <div className="space-y-8">
                        {/* 3 Cartes de synthèse financière */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-500/20">
                                <div className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-2">Total Recettes Scolaires</div>
                                <div className="text-2xl md:text-3xl font-black mb-1">{formatCurrency(finances?.totalRevenus)}</div>
                                <div className="text-xs opacity-90">Total des encaissements enregistrés</div>
                            </div>
                            <div className="bg-gradient-to-br from-rose-500 to-pink-700 text-white rounded-3xl p-6 shadow-lg shadow-rose-500/20">
                                <div className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-2">Total Charges & Dépenses</div>
                                <div className="text-2xl md:text-3xl font-black mb-1">{formatCurrency(finances?.totalDepenses)}</div>
                                <div className="text-xs opacity-90">Salaires, charges et dépenses opérationnelles</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-3xl p-6 shadow-lg shadow-blue-500/20">
                                <div className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-2">Résultat Net de Trésorerie</div>
                                <div className="text-2xl md:text-3xl font-black mb-1">{formatCurrency(finances?.soldeNet)}</div>
                                <div className="text-xs opacity-90">Solde disponible après décaissements</div>
                            </div>
                        </div>

                        {/* 2 Graphiques : Recettes par Type + Modes de Paiement */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Graphique 1 : Recettes par Type de Frais */}
                            <div className="bg-white dark:bg-slate-900 p-7 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        {t("stats_revenue_source", "Recettes par Rubrique de Frais")}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Ventilation des encaissements par scolarité, inscriptions, uniformes, etc.
                                    </p>
                                </div>

                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                type="category" 
                                                dataKey="name" 
                                                width={130} 
                                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                            />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(value), t('revenue', 'Montant')]}
                                                cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                                contentStyle={{ 
                                                    borderRadius: '1rem', 
                                                    border: 'none', 
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: '#1E293B',
                                                    color: 'white'
                                                }}
                                            />
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={26}>
                                                {revenueData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    {revenueData.slice(0, 3).map((r, i) => (
                                        <div key={i} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{r.name} :</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(r.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Graphique 2 : Répartition par Mode de Paiement */}
                            <div className="bg-white dark:bg-slate-900 p-7 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        Répartition par Mode de Paiement
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Répartition des règlements reçus (Espèces, Virement, Mobile Money...).
                                    </p>
                                </div>

                                <div className="h-64 relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={modesPaiementData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {modesPaiementData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(value), 'Montant Encaissé']}
                                                contentStyle={{ 
                                                    borderRadius: '1rem', 
                                                    border: 'none', 
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: '#1E293B',
                                                    color: 'white'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-lg font-black text-slate-800 dark:text-white">
                                            {modesPaiementData.reduce((acc, m) => acc + (m.count || 0), 0)}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                            Règlements
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    {modesPaiementData.map((m, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }}></span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{m.name}</span>
                                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                                    {m.count} reçus
                                                </span>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(m.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Graphique 3 : Évolution Mensuelle & Répartition des Dépenses */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Comparatif Mensuel Recettes vs Dépenses */}
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-7 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    Comparatif Mensuel : Recettes vs Dépenses
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                    Évolution des flux de trésorerie mois par mois sur l'année scolaire.
                                </p>

                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyEvolutionData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <Tooltip
                                                formatter={(value, name) => [formatCurrency(value), name === 'recettes' ? 'Recettes' : 'Dépenses']}
                                                contentStyle={{ 
                                                    borderRadius: '1rem', 
                                                    border: 'none', 
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    backgroundColor: '#1E293B',
                                                    color: 'white'
                                                }}
                                            />
                                            <Legend 
                                                formatter={(val) => val === 'recettes' ? 'Recettes (Encaissements)' : 'Dépenses (Décaissements)'}
                                                wrapperStyle={{ paddingTop: '15px' }}
                                            />
                                            <Bar dataKey="recettes" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                            <Bar dataKey="depenses" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Dépenses par Catégorie */}
                            <div className="bg-white dark:bg-slate-900 p-7 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                                        <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400">
                                            <ArrowDownRight className="w-5 h-5" />
                                        </div>
                                        Dépenses par Catégorie
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                        Postes de coûts principaux (Salaires, Loyer, Fournitures...).
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {depensesData.length > 0 ? (
                                        depensesData.map((d, idx) => {
                                            const totalDep = finances?.totalDepenses || 1;
                                            const pct = ((d.value / totalDep) * 100).toFixed(1);
                                            return (
                                                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.name}</span>
                                                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">{formatCurrency(d.value)}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                    <div className="text-[10px] text-right text-slate-400 mt-1">{pct}% du total</div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-10 text-slate-400 text-xs">
                                            Aucune dépense enregistrée sur cette période.
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                                    <span className="text-xs text-slate-500">Total des charges : </span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(finances?.totalDepenses)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* --- ONGLET 3 : PERFORMANCE & NOTES --- */}
                {/* ======================================================== */}
                {activeTab === 'performance' && (
                    <div className="space-y-8">
                        {/* État vide soigné ou données si saisies */}
                        {(!performance?.classRanking || performance.classRanking.length === 0) && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 mb-6 shadow-inner">
                                    <GraduationCap className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                    Module Examens & Performance Pédagogique
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed mb-8">
                                    Les indicateurs de moyennes générales, taux de réussite par classe et tableau d'honneur des élèves seront automatiquement calculés et projetés ici dès la validation des premières évaluations trimestrielles.
                                </p>

                                <div className="inline-flex flex-wrap items-center justify-center gap-4">
                                    <button 
                                        onClick={() => router.visit(route('notes.index') || '/notes')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Accéder à la Saisie des Notes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Si des données de performance existent, les voici avec labels traduits */}
                        {performance?.classRanking && performance.classRanking.length > 0 && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Class Ranking Chart */}
                                <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-600 dark:text-amber-400">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        Taux de Réussite & Moyenne par Classe
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={performance?.classRanking} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="classe" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        name.includes('Taux') || name === 'success_rate' ? `${value}%` : `${value}/20`,
                                                        name.includes('Taux') || name === 'success_rate' ? 'Taux de Réussite' : 'Moyenne Générale'
                                                    ]}
                                                    contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#1E293B', color: 'white' }}
                                                />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                                <Bar dataKey="success_rate" name="Taux de Réussite (%)" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                <Bar dataKey="average_global" name="Moyenne Générale (/20)" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Students Table */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                            <Award className="w-5 h-5 text-amber-500" />
                                            Tableau d'Honneur
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        {/* Table content */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ======================================================== */}
                {/* --- ONGLET 4 : VIE SCOLAIRE & ASSIDUITÉ --- */}
                {/* ======================================================== */}
                {activeTab === 'viescolaire' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Assiduité */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-4">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                                    Assiduité & Ponctualité
                                </div>
                                <div className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                                    {vieScolaire?.absences || 0}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Heures ou journées d'absences signalées sur l'année en cours.
                                </p>
                            </div>

                            {/* Discipline */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl w-fit mb-4">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                                    Climat & Sanctions
                                </div>
                                <div className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                                    {vieScolaire?.sanctions || 0}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Sanctions disciplinaires enregistrées par les surveillants généraux.
                                </p>
                            </div>

                            {/* Équipe pédagogique */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mb-4">
                                    <School className="w-6 h-6" />
                                </div>
                                <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                                    Corps Enseignant
                                </div>
                                <div className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                                    {vieScolaire?.enseignants || 0}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Professeurs et instituteurs affectés aux différentes classes.
                                </p>
                            </div>
                        </div>

                        {/* Guide & raccourcis */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    Gestionnaire de Vie Scolaire Intégré
                                </h4>
                                <p className="text-slate-300 text-sm max-w-xl font-light">
                                    Pour ajouter des fiches d'absences, enregistrer les retards ou convoquer un conseil de discipline, utilisez les modules dédiés de la barre latérale.
                                </p>
                            </div>
                            <button
                                onClick={() => router.visit(route('eleves.index'))}
                                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
                            >
                                Explorer les Dossiers Élèves
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
