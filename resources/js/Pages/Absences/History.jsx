import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronLeft, ChevronLeftCircle, ChevronRightCircle, History as HistoryIcon, Calendar, BarChart2, XCircle, Clock, CheckCircle2 } from "lucide-react";

export default function History({ classe, students, dates, filters }) {

    const handlePeriodChange = (direction) => {
        const targetDate = direction === 'prev' ? filters.prevDate : filters.nextDate;
        if (targetDate) {
            router.get(route('absences.history', classe.id), { type: filters.type, date: targetDate });
        }
    };

    const handleTypeChange = (e) => {
        router.get(route('absences.history', classe.id), { type: e.target.value, date: filters.date });
    };

    return (
        <DashboardLayout title={`Historique — ${classe.nom}`}>
            <Head title={`Historique - ${classe.nom}`} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-indigo-950 to-blue-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href={route('absences.saisie', classe.id)}
                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/20 transition-colors group shrink-0">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hidden sm:block shrink-0">
                            <HistoryIcon className="w-8 h-8 text-blue-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-blue-200 text-xs font-medium mb-2 border border-white/10">
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>Suivi des Présences</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1">Historique — {classe.nom}</h1>
                            <p className="text-slate-300 text-sm">{students.length} élèves • {filters.periodLabel}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10 -mt-2">
                <div className="flex items-center gap-3">
                    {/* Type Selector */}
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                        {[
                            { val: 'week', label: 'Semaine' },
                            { val: 'month', label: 'Mois' },
                            { val: 'year', label: 'Année' },
                        ].map(opt => (
                            <button key={opt.val} onClick={() => handleTypeChange({ target: { value: opt.val } })}
                                className={`px-4 py-2.5 text-sm font-semibold transition-all ${filters.type === opt.val ? 'bg-[#0B1A2D] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation période */}
                {filters.type !== 'year' && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm">
                        <button onClick={() => handlePeriodChange('prev')} disabled={!filters.prevDate}
                            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors">
                            <ChevronLeftCircle className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 min-w-[200px] text-center">{filters.periodLabel}</span>
                        <button onClick={() => handlePeriodChange('next')} disabled={!filters.nextDate}
                            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors">
                            <ChevronRightCircle className="w-5 h-5" />
                        </button>
                    </div>
                )}
                {filters.type === 'year' && (
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-2.5 shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{filters.periodLabel}</span>
                    </div>
                )}
            </div>

            {/* TABLEAU HISTORIQUE */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B1A2D] text-white">
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide rounded-tl-3xl sticky left-0 bg-[#0B1A2D] z-10 min-w-[200px]">Élève</th>
                                {filters.type === 'year' ? (
                                    <>
                                        <th className="py-5 px-6 font-semibold text-sm tracking-wide text-center">Total Absences</th>
                                        <th className="py-5 px-6 font-semibold text-sm tracking-wide text-center">Total Retards</th>
                                        <th className="py-5 px-6 font-semibold text-sm tracking-wide text-center rounded-tr-3xl">Justifiés</th>
                                    </>
                                ) : (
                                    dates.map((d, i) => (
                                        <th key={i} className={`py-5 px-3 font-semibold text-sm tracking-wide text-center min-w-[70px] ${i === dates.length - 1 ? 'rounded-tr-3xl' : ''}`}>
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-slate-400 uppercase">{d.day_name}</span>
                                                <span className="text-lg font-black">{d.day_num}</span>
                                            </div>
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6 sticky left-0 bg-white dark:bg-slate-900 z-10">
                                            <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                                            {student.matricule && <p className="text-xs text-slate-400 font-mono mt-0.5">{student.matricule}</p>}
                                            {filters.type !== 'year' && (
                                                <div className="flex gap-2 mt-1">
                                                    {student.stats.absences > 0 && <span className="text-xs text-red-500 font-semibold">{student.stats.absences} abs</span>}
                                                    {student.stats.retards > 0 && <span className="text-xs text-amber-500 font-semibold">{student.stats.retards} ret</span>}
                                                </div>
                                            )}
                                        </td>

                                        {filters.type === 'year' ? (
                                            <>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full text-sm font-bold">
                                                        <XCircle className="w-4 h-4" /> {student.stats.absences}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-sm font-bold">
                                                        <Clock className="w-4 h-4" /> {student.stats.retards}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold">
                                                        <CheckCircle2 className="w-4 h-4" /> {student.stats.justified}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            dates.map((d, i) => {
                                                const rec = student.attendance?.[d.date];
                                                return (
                                                    <td key={i} className="py-4 px-3 text-center">
                                                        <div className="flex justify-center">
                                                            {rec ? (
                                                                rec.type === 'absence' ? (
                                                                    <div title={rec.justifiee ? `Justifié: ${rec.motif || 'oui'}` : 'Injustifié'}
                                                                        className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-sm shadow-sm ${rec.justifiee ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                                                                        A
                                                                    </div>
                                                                ) : (
                                                                    <div title="Retard"
                                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-black text-sm shadow-sm">
                                                                        R
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-600 rounded-full mx-auto shadow-sm" title="Présent" />
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={filters.type === 'year' ? 4 : dates.length + 1} className="py-16 text-center text-slate-400">
                                        Aucun élève dans cette classe.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* LÉGENDE */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-300 rounded-full"></div> Présent</div>
                    <div className="flex items-center gap-2"><div className="w-7 h-5 bg-red-100 rounded flex items-center justify-center text-red-700 font-black text-xs">A</div> Absence injustifiée</div>
                    <div className="flex items-center gap-2"><div className="w-7 h-5 bg-blue-100 rounded flex items-center justify-center text-blue-700 font-black text-xs">A</div> Absence justifiée</div>
                    <div className="flex items-center gap-2"><div className="w-7 h-5 bg-amber-100 rounded flex items-center justify-center text-amber-700 font-black text-xs">R</div> Retard</div>
                </div>
            </div>
        </DashboardLayout>
    );
}
