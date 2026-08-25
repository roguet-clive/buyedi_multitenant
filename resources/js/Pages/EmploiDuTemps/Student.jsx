import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Calendar, MapPin, User, Clock } from "lucide-react";

const COURSE_COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-900/50', border: 'border-l-blue-500', text: 'text-blue-800 dark:text-blue-200', badge: 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/50', border: 'border-l-emerald-500', text: 'text-emerald-800 dark:text-emerald-200', badge: 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/50', border: 'border-l-purple-500', text: 'text-indigo-800 dark:text-indigo-200', badge: 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' },
    { bg: 'bg-amber-100 dark:bg-amber-900/50', border: 'border-l-amber-500', text: 'text-amber-800 dark:text-amber-200', badge: 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' },
    { bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-l-rose-500', text: 'text-red-800 dark:text-red-200', badge: 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/50', border: 'border-l-cyan-500', text: 'text-cyan-800 dark:text-cyan-200', badge: 'bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200' },
    { bg: 'bg-orange-100 dark:bg-orange-900/50', border: 'border-l-orange-500', text: 'text-orange-800 dark:text-orange-200', badge: 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' },
    { bg: 'bg-teal-100 dark:bg-teal-900/50', border: 'border-l-teal-500', text: 'text-teal-800 dark:text-teal-200', badge: 'bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200' },
];

export default function Student({ emplois }) {
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const scheduleByDay = days.map(day => ({
        name: day.charAt(0).toUpperCase() + day.slice(1),
        courses: emplois.filter(e => e.jour?.toLowerCase() === day).sort((a, b) => a.heure_debut?.localeCompare(b.heure_debut))
    })).filter(d => d.courses.length > 0);

    // Map matière → couleur
    const uniqueMatieres = [...new Map(emplois.map(e => [e.matiere?.id, e.matiere])).values()].filter(Boolean);
    const matiereColorMap = {};
    uniqueMatieres.forEach((m, i) => { matiereColorMap[m.id] = COURSE_COLORS[i % COURSE_COLORS.length]; });

    const totalCours = emplois.length;
    const totalJours = scheduleByDay.length;

    return (
        <DashboardLayout title="Mon Emploi du Temps">
            <Head title="Mon Emploi du Temps" />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-indigo-950 to-indigo-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <Calendar className="w-10 h-10 text-indigo-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-sm font-medium mb-3 border border-white/10">
                                <Clock className="w-4 h-4" />
                                <span>Planning Hebdomadaire</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Mon Emploi du Temps</h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                Consultez votre programme hebdomadaire de cours, les horaires, salles et enseignants.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 shrink-0">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-4 text-center">
                            <p className="text-2xl font-black text-white">{totalCours}</p>
                            <p className="text-xs text-slate-300 mt-1">cours/semaine</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-4 text-center">
                            <p className="text-2xl font-black text-white">{totalJours}</p>
                            <p className="text-xs text-slate-300 mt-1">jours actifs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLE PAR JOUR */}
            {scheduleByDay.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                    {scheduleByDay.map((day, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                            {/* En-tête jour */}
                            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 text-center">
                                <p className="font-black text-white uppercase tracking-widest text-sm">{day.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{day.courses.length} cours</p>
                            </div>

                            {/* Cours */}
                            <div className="p-3 space-y-2">
                                {day.courses.map(course => {
                                    const colors = matiereColorMap[course.matiere?.id] || COURSE_COLORS[0];
                                    return (
                                        <div key={course.id} className={`rounded-2xl border-l-4 p-3 ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}>
                                            {/* Heure */}
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${colors.badge}`}>
                                                <Clock className="w-3 h-3" />
                                                {course.heure_debut?.slice(0, 5)} – {course.heure_fin?.slice(0, 5)}
                                            </div>

                                            {/* Matière */}
                                            <h3 className={`font-black text-sm leading-tight mb-2 ${colors.text}`}>
                                                {course.matiere?.nom || '—'}
                                            </h3>

                                            {/* Infos */}
                                            <div className={`space-y-1 ${colors.text} opacity-80`}>
                                                {(course.enseignant?.user?.nom || course.enseignant?.nom) && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <User className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">
                                                            {course.enseignant?.user
                                                                ? `${course.enseignant.user.prenom} ${course.enseignant.user.nom}`
                                                                : `${course.enseignant?.prenom || ''} ${course.enseignant?.nom || ''}`.trim()
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Affichage de la classe (vue enseignant) */}
                                                {course.classe?.nom && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Calendar className="w-3 h-3 shrink-0" />
                                                        <span>{course.classe.nom}</span>
                                                    </div>
                                                )}
                                                {course.salle && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <MapPin className="w-3 h-3 shrink-0" />
                                                        <span>Salle {course.salle}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-6">
                            <Calendar className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Aucun cours planifié</h2>
                        <p className="text-slate-500 max-w-sm text-sm">L'emploi du temps n'a pas encore été configuré pour votre classe.</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
