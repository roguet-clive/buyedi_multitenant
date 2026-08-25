import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Calendar, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

export default function Student({ absences }) {
    const { t } = useTranslation();

    const isParentView = absences.some(a => a.inscription?.eleve?.user?.nom);
    const totalAbsences = absences.filter(a => a.type === 'absence').length;
    const totalRetards = absences.filter(a => a.type === 'retard').length;
    const totalJustified = absences.filter(a => a.justifiee).length;

    return (
        <DashboardLayout title={t("mes_absences", "Mes Absences")}>
            <Head title={t("mes_absences", "Mes Absences")} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-red-950 to-red-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <ShieldCheck className="w-10 h-10 text-red-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-red-200 text-sm font-medium mb-3 border border-white/10">
                                <Calendar className="w-4 h-4" />
                                <span>Suivi Personnel</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("mes_absences", "Mes Absences")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {isParentView
                                    ? "Consultez le suivi des absences et retards de vos enfants."
                                    : "Consultez l'historique de vos absences et retards enregistrés par l'établissement."}
                            </p>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="flex gap-3 flex-wrap">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[80px]">
                            <p className="text-2xl font-black text-red-300">{totalAbsences}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Absences</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[80px]">
                            <p className="text-2xl font-black text-amber-300">{totalRetards}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Retards</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[80px]">
                            <p className="text-2xl font-black text-emerald-300">{totalJustified}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Justifiés</p>
                        </div>
                    </div>
                </div>
            </div>

            {absences.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0B1A2D] text-white">
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Date</th>
                                    {isParentView && <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Élève</th>}
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Type</th>
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Statut</th>
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tr-3xl">Motif</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {absences.map((absence) => (
                                    <tr key={absence.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(absence.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                        {isParentView && (
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-slate-800 dark:text-white">
                                                    {absence.inscription?.eleve?.user
                                                        ? `${absence.inscription.eleve.user.prenom} ${absence.inscription.eleve.user.nom}`
                                                        : '—'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${absence.type === 'retard'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {absence.type === 'retard' ? <AlertCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {absence.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {absence.justifiee ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Justifiée
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold">
                                                    <XCircle className="w-3.5 h-3.5" /> Non justifiée
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {absence.motif
                                                ? <span className="text-sm text-slate-700 dark:text-slate-300">{absence.motif}</span>
                                                : <span className="text-slate-400 italic text-sm">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Aucune absence !</h2>
                        <p className="text-slate-500 max-w-sm">Bravo ! Aucune absence ni retard n'a été enregistré pour vous.</p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
