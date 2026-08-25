import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import { FileText, Download, Filter, BookOpen, Calendar, FolderOpen, GraduationCap, Clock } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

const TYPE_CONFIG = {
    cours: { label: 'Cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', border: 'border-l-blue-500', icon: BookOpen, header: 'from-blue-600 to-indigo-700' },
    exercice: { label: 'Exercice', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', border: 'border-l-amber-500', icon: FileText, header: 'from-amber-500 to-orange-600' },
    devoir: { label: 'Devoir', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', border: 'border-l-rose-500', icon: Calendar, header: 'from-red-500 to-blue-600' },
};

export default function StudentIndex({ documents, matieres, filters }) {
    const { t } = useTranslation();

    const handleFilter = (key, value) => {
        router.get(route('documents.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    const totalByType = (type) => documents.filter(d => d.type === type).length;

    return (
        <DashboardLayout title="Mes Cours & Devoirs">
            <Head title="Mes Documents" />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-teal-950 to-cyan-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <GraduationCap className="w-10 h-10 text-cyan-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-cyan-200 text-sm font-medium mb-3 border border-white/10">
                                <FolderOpen className="w-4 h-4" />
                                <span>Mes Ressources</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Mes Cours & Devoirs</h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                Accédez à tous vos cours, exercices et devoirs publiés par vos enseignants.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center">
                            <p className="text-2xl font-black text-blue-300">{totalByType('cours')}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Cours</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center">
                            <p className="text-2xl font-black text-amber-300">{totalByType('exercice')}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Exercices</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center">
                            <p className="text-2xl font-black text-red-300">{totalByType('devoir')}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Devoirs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <Filter className="w-4 h-4" /> Filtres :
                </div>
                <select value={filters.matiere_id || ''} onChange={e => handleFilter('matiere_id', e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 shadow-sm appearance-none cursor-pointer">
                    <option value="">Toutes les matières</option>
                    {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                {/* Filtre type en pills */}
                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    {[{ val: '', label: 'Tous' }, { val: 'cours', label: 'Cours' }, { val: 'exercice', label: 'Exercices' }, { val: 'devoir', label: 'Devoirs' }].map(opt => (
                        <button key={opt.val} onClick={() => handleFilter('type', opt.val)}
                            className={`px-4 py-2.5 text-sm font-semibold transition-all ${(filters.type || '') === opt.val ? 'bg-[#0B1A2D] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRILLE */}
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {documents.map(doc => {
                        const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.cours;
                        const TypeIcon = cfg.icon;
                        return (
                            <div key={doc.id}
                                className={`bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden border-l-4 ${cfg.border} hover:shadow-xl transition-shadow group`}>
                                {/* Badge type */}
                                <div className="px-5 pt-5 flex items-start justify-between">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                                        <TypeIcon className="w-3.5 h-3.5" />
                                        {cfg.label}
                                    </span>
                                    <span className="text-xs text-slate-400">{doc.matiere?.nom}</span>
                                </div>

                                <div className="px-5 py-4">
                                    <h3 className="font-black text-slate-800 dark:text-white text-base mb-1 leading-snug" title={doc.titre}>
                                        {doc.titre}
                                    </h3>
                                    {doc.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{doc.description}</p>
                                    )}

                                    {doc.date_limite && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold mb-3">
                                            <Clock className="w-3.5 h-3.5" />
                                            À rendre le : {new Date(doc.date_limite).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-400">
                                        {doc.enseignant?.user?.prenom} {doc.enseignant?.user?.nom}
                                    </p>
                                    {doc.fichier_path && (
                                        <a href={route('documents.download', doc.id)}
                                            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${cfg.header} text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95`}>
                                            <Download className="w-3.5 h-3.5" />
                                            Télécharger
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center mb-6">
                            <FolderOpen className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Aucun document disponible</h2>
                        <p className="text-slate-500 max-w-sm text-sm">Vos enseignants n'ont pas encore publié de documents pour votre classe.</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
