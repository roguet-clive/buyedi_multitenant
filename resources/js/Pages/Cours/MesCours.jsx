import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { 
    BookOpen, 
    GraduationCap, 
    Users, 
    Calendar, 
    ClipboardCheck, 
    FileText, 
    ArrowRight, 
    Sparkles, 
    School,
    Clock,
    PhoneCall
} from "lucide-react";
import { motion } from "framer-motion";

export default function MesCours({ cours = [], anneeScolaire = "" }) {
    const totalEleves = cours.reduce((sum, c) => sum + (c.eleves_count || 0), 0);
    const uniqueClasses = [...new Set(cours.map(c => c.classe_nom))].length;

    return (
        <DashboardLayout title="Mes Cours & Attributions Pédagogiques">
            <Head title="Mes Cours" />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-slate-900 to-indigo-950 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Année Scolaire : {anneeScolaire}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black mb-2 flex items-center gap-3">
                            <span>Mes Cours & Classes</span>
                            <BookOpen className="w-8 h-8 text-indigo-400" />
                        </h1>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Consultez vos matières assignées, suivez vos effectifs d'élèves et accédez rapidement à la saisie de vos notes et absences.
                        </p>
                    </div>

                    {/* STATS KPI */}
                    <div className="flex gap-3 flex-wrap">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[90px]">
                            <p className="text-2xl font-black text-indigo-300">{cours.length}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Cours dispensés</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[90px]">
                            <p className="text-2xl font-black text-emerald-300">{uniqueClasses}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Classes</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[90px]">
                            <p className="text-2xl font-black text-amber-300">{totalEleves}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Élèves suivis</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* COURS GRID */}
            {cours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cours.map((c, index) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                        >
                            <div>
                                {/* CARD HEADER */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                            {c.matiere_code || c.matiere_nom.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {c.matiere_nom}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                    <School className="w-3.5 h-3.5 text-slate-400" />
                                                    {c.classe_nom}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                                        Coef. {c.coefficient}
                                    </span>
                                </div>

                                {/* META DETAILS */}
                                <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400 shrink-0" />
                                        <div>
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Effectif</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{c.eleves_count} Élèves</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                        <div>
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Période</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{c.periode_nom}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS RAPIDES */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <Link
                                    href={route('notes.classe', c.classe_id)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all group/btn"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                        <span>Évaluations & Notes</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>

                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={route('absences.saisie', c.classe_id)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
                                    >
                                        <ClipboardCheck className="w-3.5 h-3.5 text-red-500" />
                                        <span>Faire l'appel</span>
                                    </Link>
                                    <Link
                                        href={route('parents.index')}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
                                    >
                                        <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Parents</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Aucun cours attribué pour le moment</h2>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        La direction de l'établissement n'a pas encore assigné de matières ou de classes à votre profil pour l'année scolaire en cours.
                    </p>
                </div>
            )}
        </DashboardLayout>
    );
}
