import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import useTranslation from "@/Hooks/useTranslation";
import { ClipboardCheck, ChevronRight, History, BookOpen, Users } from "lucide-react";

const TYPE_COLORS = {
    primaire: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    secondaire: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    maternelle: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
};
const getTypeColor = (type) => TYPE_COLORS[type] || TYPE_COLORS.secondaire;

export default function Index({ classes }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout title={t('absences_management', 'Gestion des Absences')}>
            <Head title={t('absences', 'Absences')} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-red-950 to-red-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <ClipboardCheck className="w-10 h-10 text-red-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-red-200 text-sm font-medium mb-3 border border-white/10">
                                <Users className="w-4 h-4" />
                                <span>{t("attendance_tracking", "Suivi des Présences")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("absences_title", "Gestion des Absences")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {t("absences_desc", "Sélectionnez une classe pour effectuer l'appel du jour ou consulter l'historique des présences et absences des élèves.")}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-6 py-4 text-center">
                        <p className="text-3xl font-black text-white">{classes.length}</p>
                        <p className="text-sm text-slate-300 mt-1">{t("classes_count", "classes à gérer")}</p>
                    </div>
                </div>
            </div>

            {/* GRILLE DES CLASSES */}
            {classes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {classes.map(c => {
                        const tc = getTypeColor(c.type);
                        return (
                            <div key={c.id} className={`rounded-3xl border-2 ${tc.border} ${tc.bg} overflow-hidden shadow-sm hover:shadow-xl transition-all group`}>
                                <Link href={route('absences.saisie', c.id)} className="block p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-white/70 dark:bg-white/10 rounded-xl shadow-sm">
                                            <BookOpen className={`w-5 h-5 ${tc.text}`} />
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${tc.badge}`}>
                                            {c.type || 'secondaire'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-current transition-colors">{c.nom}</h3>
                                    <p className={`text-sm font-medium ${tc.text} mb-5`}>{c.niveau || 'Faire l\'appel'}</p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:gap-3 transition-all">
                                            <ClipboardCheck className="w-4 h-4" />
                                            Faire l'appel
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>

                                <div className={`px-6 py-3 border-t ${tc.border} bg-white/40 dark:bg-black/10`}>
                                    <Link
                                        href={route('absences.history', c.id)}
                                        className={`flex items-center gap-2 text-xs font-semibold ${tc.text} hover:underline`}
                                    >
                                        <History className="w-3.5 h-3.5" />
                                        Voir l'historique des présences
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
                    <ClipboardCheck className="w-16 h-16 mb-4 opacity-40" />
                    <p className="text-lg font-medium">{t("no_classes", "Aucune classe disponible")}</p>
                    <p className="text-sm mt-1">Veuillez d'abord créer des classes dans le module Classes.</p>
                </div>
            )}
        </DashboardLayout>
    );
}
