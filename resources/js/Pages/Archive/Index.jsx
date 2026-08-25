import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { 
    CalendarDaysIcon, 
    UserGroupIcon, 
    AcademicCapIcon, 
    BanknotesIcon, 
    MagnifyingGlassIcon, 
    FunnelIcon, 
    PrinterIcon,
    ArrowDownTrayIcon,
    BookOpenIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from '@/Hooks/useTranslation';
import Pagination from '@/Components/Pagination';

export default function Index({ annees, classes, filters, archiveData }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(filters.category || 'eleves');
    const [loading, setLoading] = useState(false);

    const handleFilterChange = (newFilters) => {
        setLoading(true);
        router.get(route('archives.index'), { ...filters, ...newFilters }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false)
        });
    };

    const tabs = [
        { id: 'eleves', name: 'Inscriptions Annuelles', icon: UserGroupIcon },
        { id: 'base_de_donnees', name: 'Base d’Élèves (Tous)', icon: MagnifyingGlassIcon },
        { id: 'notes', name: 'Notes & Résultats', icon: AcademicCapIcon },
        { id: 'finances', name: 'Bilans Financiers', icon: BanknotesIcon },
        { id: 'pedagogie', name: 'Pédagogie (Cours/EDT)', icon: BookOpenIcon },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount).replace('XOF', 'FCFA');
    };

    const renderElevesTab = () => {
        const inscriptions = archiveData.data || [];
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-500 text-sm uppercase tracking-wider">
                            <th className="px-4 py-2">Élève</th>
                            <th className="px-4 py-2">Classe</th>
                            <th className="px-4 py-2">Date Inscription</th>
                            <th className="px-4 py-2">Statut</th>
                            <th className="px-4 py-2 text-right">Frais</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inscriptions.map((insc) => (
                            <tr key={insc.id} className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                                <td className="px-4 py-4 rounded-l-xl">
                                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {insc.eleve?.user?.nom} {insc.eleve?.user?.prenom}
                                    </div>
                                    <div className="text-xs text-slate-500">{insc.eleve?.matricule}</div>
                                </td>
                                <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                    {insc.classe?.nom}
                                </td>
                                <td className="px-4 py-4 text-slate-500 text-sm">
                                    {new Date(insc.date_inscription).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                        insc.statut === 'validee' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {insc.statut}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300 rounded-r-xl">
                                    {formatCurrency(insc.total_frais || 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {inscriptions.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-medium italic">
                        Aucun élève trouvé pour cette période.
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <Pagination links={archiveData.links || []} />
                </div>
            </div>
        );
    };

    const renderNotesTab = () => {
        const notes = archiveData.data || [];
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-500 text-sm uppercase tracking-wider">
                            <th className="px-4 py-2">Élève</th>
                            <th className="px-4 py-2">Matière</th>
                            <th className="px-4 py-2">Évaluation</th>
                            <th className="px-4 py-2">Période</th>
                            <th className="px-4 py-2 text-center">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notes.map((note) => (
                            <tr key={note.id} className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <td className="px-4 py-4 rounded-l-xl font-bold">
                                    {note.inscription?.eleve?.user?.nom} {note.inscription?.eleve?.user?.prenom}
                                </td>
                                <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                                    {note.evaluation?.cours?.matiere?.nom || 'N/A'}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-500">
                                    {note.evaluation?.titre}
                                </td>
                                <td className="px-4 py-4 text-xs font-bold text-slate-400">
                                    {note.evaluation?.periode?.nom}
                                </td>
                                <td className="px-4 py-4 text-center rounded-r-xl">
                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-black ${
                                        note.valeur >= ((note.evaluation?.note_max || 20) / 2) 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'bg-red-50 text-red-700'
                                    }`}>
                                        {note.valeur}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-1">/{note.evaluation?.note_max}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-6 flex justify-center">
                    <Pagination links={archiveData.links || []} />
                </div>
            </div>
        );
    };

    const renderFinancesTab = () => {
        const { paiements = [], depenses = [], total_recettes = 0, total_depenses = 0 } = archiveData;
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-lg">
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total Recettes</p>
                        <h3 className="text-3xl font-black">{formatCurrency(total_recettes)}</h3>
                    </div>
                    <div className="bg-rose-500 text-white p-6 rounded-3xl shadow-lg">
                        <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1">Total Dépenses</p>
                        <h3 className="text-3xl font-black">{formatCurrency(total_depenses)}</h3>
                    </div>
                    <div className="bg-[#0B1A2D] text-white p-6 rounded-3xl shadow-lg">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Solde Net</p>
                        <h3 className="text-3xl font-black">{formatCurrency(total_recettes - total_depenses)}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="font-bold mb-4 flex items-center gap-2"><ArrowDownTrayIcon className="w-5 h-5 text-emerald-500" /> Historique Recettes</h4>
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                            {paiements.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-sm font-bold">{p.inscription?.eleve?.user?.nom} {p.inscription?.eleve?.user?.prenom}</p>
                                        <p className="text-[10px] text-slate-500">{p.frais_type?.nom} • {new Date(p.date_paiement).toLocaleDateString()}</p>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-600">{formatCurrency(p.montant)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h4 className="font-bold mb-4 flex items-center gap-2 text-rose-600"><PrinterIcon className="w-5 h-5" /> Historique Dépenses</h4>
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                            {depenses.map(d => (
                                <div key={d.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-sm font-bold">{d.motif}</p>
                                        <p className="text-[10px] text-slate-500">{new Date(d.date_depense).toLocaleDateString()}</p>
                                    </div>
                                    <span className="font-mono font-bold text-rose-600">{formatCurrency(d.montant)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderGlobalDatabaseTab = () => {
        const eleves = archiveData.data || [];
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-slate-500 text-sm uppercase tracking-wider">
                            <th className="px-4 py-2">Matricule</th>
                            <th className="px-4 py-2">Élève</th>
                            <th className="px-4 py-2">Sexe</th>
                            <th className="px-4 py-2">Dernier Historique</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eleves.map((e) => (
                            <tr key={e.id} className="bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                                <td className="px-4 py-4 rounded-l-xl font-mono text-xs font-bold text-blue-600">
                                    {e.matricule}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="font-bold text-slate-800 dark:text-white">
                                        {e.user?.nom} {e.user?.prenom}
                                    </div>
                                    <div className="text-xs text-slate-500">{e.user?.email}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                                        {e.sexe ? 'Féminin' : 'Masculin'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    {e.inscriptions?.[0] ? (
                                        <div className="text-xs">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{e.inscriptions[0].classe?.nom}</span>
                                            <span className="text-slate-400 block italic">Dernièrement vu ici</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tight bg-amber-50 px-2 py-0.5 rounded">Jamais inscrit</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-right rounded-r-xl">
                                    <Link 
                                        href={route('eleves.show', e.id)}
                                        className="text-blue-500 hover:text-blue-700 font-bold text-xs underline decoration-2 underline-offset-4"
                                    >
                                        Voir Fiche
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {eleves.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-medium italic">
                        Aucun élève trouvé dans la base de données.
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <Pagination links={archiveData.links || []} />
                </div>
            </div>
        );
    };

    const renderPedagogieTab = () => {
        const { cours = [], emplois = [] } = archiveData;
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h4 className="font-bold mb-4 text-blue-600">Affectations des Professeurs</h4>
                    <div className="space-y-4">
                        {cours.map(c => (
                            <div key={c.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs shadow-inner">
                                    {(c.matiere?.nom || 'A')[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">{c.matiere?.nom || 'Titulaire'}</p>
                                    <p className="text-xs text-slate-500">{c.enseignant?.user?.nom} {c.enseignant?.user?.prenom} • Classe: {c.classe?.nom}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h4 className="font-bold mb-4 text-indigo-600">Extraits d'Emplois du Temps</h4>
                     <div className="space-y-4">
                        {emplois.map(e => (
                            <div key={e.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold uppercase">{e.jour} : {e.heure_debut?.substr(0,5)} - {e.heure_fin?.substr(0,5)}</p>
                                    <p className="text-xs text-slate-500">{e.matiere?.nom} • {e.enseignant?.user?.nom} ({e.classe?.nom})</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout title="Centre d'Archives & Rapports">
            <Head title="Archives & Rapports Globaux" />

            {/* HEADER & FILTRES */}
            <div className="bg-gradient-to-br from-[#0B1A2D] to-blue-900 p-8 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-3">
                                <CalendarDaysIcon className="w-10 h-10 text-emerald-400" />
                                Centre d'Archives
                            </h1>
                            <p className="text-blue-200 mt-2 font-medium">Consultez et filtrez n'importe quelle donnée historique de l'établissement.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
                            <div className="relative">
                                <select 
                                    className="bg-transparent border-none text-white text-sm font-bold py-2 pl-4 pr-10 focus:ring-0 cursor-pointer appearance-none min-w-[150px]"
                                    value={filters.annee_id}
                                    onChange={(e) => handleFilterChange({ annee_id: e.target.value })}
                                >
                                    {annees.map(a => (
                                        <option key={a.id} value={a.id} className="text-slate-800">{a.nom} {a.en_cours ? '(En cours)' : ''}</option>
                                    ))}
                                </select>
                                <FunnelIcon className="w-4 h-4 text-emerald-400 absolute right-3 top-2.5 pointer-events-none" />
                            </div>
                            <div className="w-px h-8 bg-white/20"></div>
                            <div className="relative">
                                <select 
                                    className="bg-transparent border-none text-white text-sm font-bold py-2 pl-4 pr-10 focus:ring-0 cursor-pointer appearance-none min-w-[150px]"
                                    value={filters.classe_id || ''}
                                    onChange={(e) => handleFilterChange({ classe_id: e.target.value })}
                                >
                                    <option value="" className="text-slate-800">Toutes les classes</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id} className="text-slate-800">{c.nom}</option>
                                    ))}
                                </select>
                                <FunnelIcon className="w-4 h-4 text-emerald-400 absolute right-3 top-2.5 pointer-events-none" />
                            </div>
                            <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-colors border border-white/10" title="Imprimer ce rapport">
                                <PrinterIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 relative max-w-2xl">
                        <MagnifyingGlassIcon className="w-5 h-5 text-blue-300 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un élève, une référence..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-blue-300/50 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all outline-none font-medium"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange({ search: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                handleFilterChange({ category: tab.id });
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                isActive 
                                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-blue-100 dark:border-blue-900/40 translate-y-[-2px]' 
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* CONTENT AREA */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-3xl">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-blue-600">Chargement des archives...</p>
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'eleves' && renderElevesTab()}
                        {activeTab === 'base_de_donnees' && renderGlobalDatabaseTab()}
                        {activeTab === 'notes' && renderNotesTab()}
                        {activeTab === 'finances' && renderFinancesTab()}
                        {activeTab === 'pedagogie' && renderPedagogieTab()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
