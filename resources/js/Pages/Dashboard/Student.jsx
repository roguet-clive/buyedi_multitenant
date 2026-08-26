import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { BookOpen, Calendar, Clock, Trophy, TrendingUp, AlertCircle, FileText, IdCard, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function Student({ eleve, inscription, stats, recentGrades, schedule, periode }) {

    if (!inscription) {
        return (
            <DashboardLayout>
                <div className="p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Aucune inscription active</h2>
                    <p className="text-gray-500">Vous n'êtes pas inscrit pour l'année scolaire en cours.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Mon Espace Élève" />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-10 -mr-10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-3">
                            🎓 Année Scolaire en cours
                        </div>
                        <h1 className="text-3xl font-extrabold mb-1">Bonjour, {eleve.prenom} 👋</h1>
                        <p className="text-indigo-100 text-base">
                            Classe de <span className="font-bold bg-white/20 px-2.5 py-0.5 rounded-lg text-white">{inscription.classe?.nom}</span>
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="text-left sm:text-right bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-sm">
                            <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Période Active</p>
                            <p className="text-lg font-black">{periode}</p>
                        </div>
                        <Link
                            href={route('eleves.mon-dossier')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm rounded-2xl shadow-lg transition active:scale-95"
                        >
                            <IdCard className="w-5 h-5" />
                            <span>Mon Dossier & Documents</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Colonne Gauche : Stats & Notes */}
                <div className="md:col-span-2 space-y-8">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Moyenne */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <span className="text-gray-500 font-medium text-sm">Moyenne Génrale</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-white">
                                {stats.moyenne > 0 ? stats.moyenne : '--'} <span className="text-sm text-gray-400 font-normal">/ 20</span>
                            </div>
                        </motion.div>

                        {/* Absences */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <span className="text-gray-500 font-medium text-sm">Absences</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-white">
                                {stats.absences}
                            </div>
                        </motion.div>

                        {/* Rang (Placeholder) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-gray-500 font-medium text-sm">Rang</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-800 dark:text-white">
                                {stats.rang > 0 ? `${stats.rang}e` : '--'}
                            </div>
                        </motion.div>
                    </div>

                    {/* Dernières Notes */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Dernières Notes
                            </h3>
                            <span className="text-xs font-bold uppercase text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">5 Récentes</span>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentGrades.length > 0 ? recentGrades.map((note) => (
                                <div key={note.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                                            ${note.valeur >= 16 ? 'bg-green-500' : note.valeur >= 10 ? 'bg-blue-500' : 'bg-red-500'}
                                        `}>
                                            {note.valeur}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">{note.matiere}</p>
                                            <p className="text-xs text-gray-500">{new Date(note.date).toLocaleDateString()} - <span className="capitalize">{note.type}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-500">Sur {note.sur}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-500">Aucune note récente.</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Colonne Droite : Emploi du temps & Widget */}
                <div className="space-y-6">

                    {/* Widget Next Course / Today */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-t-4 border-indigo-500 p-6">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Aujourd'hui
                        </h3>

                        {schedule.length > 0 ? (
                            <div className="space-y-4 relative">
                                {/* Ligne de temps verticale */}
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                                {schedule.map((cours, idx) => (
                                    <div key={idx} className="relative pl-8">
                                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 z-10"></div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-bold text-indigo-600 mb-1">{cours.heure}</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">{cours.matiere}</p>
                                            <p className="text-xs text-gray-500">{cours.salle ? `Salle ${cours.salle}` : 'Pas de salle'} • {cours.prof}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p>Pas de cours aujourd'hui.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
