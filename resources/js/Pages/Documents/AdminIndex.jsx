import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import { FileText, Download, Filter, BookOpen, Calendar, Trash2, FolderOpen, GraduationCap, User, ChevronLeft, ChevronRight } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import { Link } from "@inertiajs/react";

const TYPE_CONFIG = {
    cours: { label: 'Cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', dot: 'bg-blue-500', icon: BookOpen },
    exercice: { label: 'Exercice', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', dot: 'bg-amber-500', icon: FileText },
    devoir: { label: 'Devoir', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', dot: 'bg-red-500', icon: Calendar },
};

export default function AdminIndex({ documents, classes, matieres, filters }) {
    const { t } = useTranslation();
    const docList = documents.data || documents;

    const handleFilter = (key, value) => {
        router.get(route('documents.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    return (
        <DashboardLayout title="Documents Pédagogiques">
            <Head title="Documents Pédagogiques" />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-teal-950 to-cyan-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <FolderOpen className="w-10 h-10 text-cyan-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-cyan-200 text-sm font-medium mb-3 border border-white/10">
                                <GraduationCap className="w-4 h-4" />
                                <span>Ressources Pédagogiques</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Documents Pédagogiques</h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                Consultez tous les cours, exercices et devoirs publiés par les enseignants pour l'année en cours.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-6 py-4 text-center">
                        <p className="text-3xl font-black text-white">{documents.total ?? docList.length}</p>
                        <p className="text-sm text-slate-300 mt-1">documents au total</p>
                    </div>
                </div>
            </div>

            {/* FILTRES */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    <Filter className="w-4 h-4" /> Filtres :
                </div>
                <select value={filters.classe_id || ''} onChange={e => handleFilter('classe_id', e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 shadow-sm appearance-none cursor-pointer">
                    <option value="">Toutes les classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
                <select value={filters.matiere_id || ''} onChange={e => handleFilter('matiere_id', e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 shadow-sm appearance-none cursor-pointer">
                    <option value="">Toutes les matières</option>
                    {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
                <select value={filters.type || ''} onChange={e => handleFilter('type', e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-500 shadow-sm appearance-none cursor-pointer">
                    <option value="">Tous types</option>
                    <option value="cours">Cours</option>
                    <option value="exercice">Exercices</option>
                    <option value="devoir">Devoirs</option>
                </select>
                {(filters.classe_id || filters.matiere_id || filters.type) && (
                    <button onClick={() => router.get(route('documents.index'), {}, { preserveState: true })}
                        className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm font-semibold rounded-2xl hover:bg-red-100 transition-colors">
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            {/* TABLEAU */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B1A2D] text-white">
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Type</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Titre</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Classe / Matière</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Enseignant</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Publié le</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tr-3xl text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {docList.length > 0 ? docList.map(doc => {
                                const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.cours;
                                const TypeIcon = cfg.icon;
                                return (
                                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                <TypeIcon className="w-3.5 h-3.5" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">{doc.titre}</p>
                                            {doc.description && <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{doc.description}</p>}
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{doc.classe?.nom}</p>
                                            <p className="text-xs text-slate-400">{doc.matiere?.nom}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {doc.enseignant?.user?.prenom} {doc.enseignant?.user?.nom}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {doc.fichier_path && (
                                                <a href={route('documents.download', doc.id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 rounded-xl text-xs font-bold hover:bg-cyan-100 transition-colors">
                                                    <Download className="w-3.5 h-3.5" />
                                                    Télécharger
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <FolderOpen className="w-14 h-14 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                        <p className="text-slate-500 font-medium">Aucun document trouvé</p>
                                        <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos filtres</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {documents.links && documents.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Page <span className="font-bold">{documents.current_page}</span> / <span className="font-bold">{documents.last_page}</span>
                        </p>
                        <div className="flex gap-1.5">
                            {documents.links.map((link, i) => (
                                <Link key={i} href={link.url || "#"} preserveScroll preserveState
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${link.active ? "bg-slate-800 text-white" : link.url ? "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200" : "bg-slate-50 text-slate-400 cursor-default"}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
