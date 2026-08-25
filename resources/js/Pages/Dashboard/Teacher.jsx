import DashboardLayout from "@/Layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Users, GraduationCap, School, Calendar, ArrowUpRight, Clock, User, Mail, Phone, MapPin, Briefcase, BookOpen, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function Teacher({ schedule, myClasses, todayDate, teacherProfile, teacherCourses }) {
    const { t } = useTranslation();

    // State for tabs in Teacher Dashboard
    const [activeTab, setActiveTab] = useState('home'); // 'home' | 'profile'
    const [activeProfileTab, setActiveProfileTab] = useState('infos'); // 'infos' | 'cours' | 'emploi'

    return (
        <DashboardLayout title={t("dashboard")}>
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {t('teacher_workspace', '🏫 Espace Enseignant')}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                            {t('dashboard', 'Tableau de Bord')}
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                            {t('my_profile', 'Mon Profil')}
                        </button>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        📅 {todayDate}
                    </p>
                </div>
            </div>

            {activeTab === 'home' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COL 1 & 2: PLANNING & CLASSES (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* PLANNING DU JOUR */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                {t('todays_schedule', 'Planning du jour')}
                            </h2>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {schedule.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {schedule.map((cours) => (
                                            <div key={cours.id} className="p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                <div className="w-24 text-center border-r border-gray-100 dark:border-gray-700 pr-4">
                                                    <span className="block text-sm font-bold text-gray-900 dark:text-white">{cours.heure.split(' - ')[0]}</span>
                                                    <span className="block text-xs text-gray-400">{cours.heure.split(' - ')[1]}</span>
                                                </div>
                                                <div className="pl-4 flex-1">
                                                    <h4 className="font-bold text-gray-800 dark:text-white text-lg">{cours.matiere}</h4>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                                                            <School className="w-3 h-3" /> {cours.classe}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            📍 Salle {cours.salle}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route('absences.saisie', cours.classe_id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title={t('take_attendance', "Faire l'appel")}
                                                    >
                                                        <Users className="w-5 h-5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 italic">
                                        {t('no_classes_today', "Aucun cours prévu aujourd'hui. Profitez-en pour préparer vos prochains cours ! ☕")}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* MES CLASSES */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                {t('my_classes', 'Mes Classes')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myClasses.map((classe) => (
                                    <div key={classe.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{classe.nom}</h3>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">{classe.type}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                {classe.students_count} {t('students_count_suffix', 'élèves')}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('absences.saisie', classe.id)} // Assuming route param structure
                                                className="flex-1 py-2 text-center text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                                            >
                                                {t('absences', 'Absences')}
                                            </Link>
                                            <Link
                                                href={route('notes.classe', classe.id)} // Assuming route
                                                className="flex-1 py-2 text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
                                            >
                                                {t('notes', 'Notes')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* COL 3: SIDEBAR ACTIONS (1/3) */}
                    <div className="space-y-6">

                        {/* ACTIONS RAPIDES */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 mix-blend-overlay blur-3xl"></div>

                            <h3 className="text-xl font-bold mb-4 relative z-10">{t('quick_actions', 'Actions Rapides')}</h3>
                            <div className="space-y-3 relative z-10">
                                <Link href={route('notes.index')} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 group">
                                    <span className="font-medium text-sm">{t('grades_management', 'Gestion des Notes')}</span>
                                    <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:text-white" />
                                </Link>
                                <Link href={route('absences.index')} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 group">
                                    <span className="font-medium text-sm">{t('absences_management', 'Gestion des Absences')}</span>
                                    <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:text-white" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                // --- PROFILE VIEW ---
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* HEADER CARD */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
                            <div className="absolute -bottom-10 left-8 p-1 bg-white dark:bg-gray-800 rounded-2xl">
                                {teacherProfile?.photo ? (
                                    <img src={`/storage/${teacherProfile.photo}`} alt="Photo" className="w-24 h-24 rounded-xl object-cover bg-gray-200" />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pt-12 pb-6 px-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {teacherProfile?.prenom} {teacherProfile?.nom}
                                    <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700">
                                        {teacherProfile?.specialite || 'Enseignant'}
                                    </span>
                                </h1>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    {teacherProfile?.telephone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" /> {teacherProfile.telephone}
                                        </div>
                                    )}
                                    {teacherProfile?.user?.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" /> {teacherProfile.user.email}
                                        </div>
                                    )}
                                    {teacherProfile?.adresse && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> {teacherProfile.adresse}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TABS NAVIGATION */}
                        <div className="px-8 border-t border-gray-200 dark:border-gray-700 flex gap-6 overflow-x-auto">
                            <button
                                onClick={() => setActiveProfileTab('infos')}
                                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeProfileTab === 'infos' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <User className="w-4 h-4" /> {t('informations', 'Informations')}
                            </button>
                            <button
                                onClick={() => setActiveProfileTab('cours')}
                                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeProfileTab === 'cours' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <BookOpen className="w-4 h-4" /> {t('courses_classes', 'Cours & Classes')}
                            </button>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProfileTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeProfileTab === 'infos' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-blue-500" /> {t('personal_infos', 'Informations Personnelles')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t('full_name', 'Nom Complet')}</label>
                                                <p className="text-gray-800 dark:text-gray-200 font-medium">{teacherProfile?.nom} {teacherProfile?.prenom}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t('sex', 'Sexe')}</label>
                                                <p className="text-gray-800 dark:text-gray-200 font-medium">{teacherProfile?.sexe === 'M' ? t('male', 'Masculin') : t('female', 'Féminin')}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">{t('specialite', 'Spécialité')}</label>
                                                <p className="text-gray-800 dark:text-gray-200 font-medium">{teacherProfile?.specialite || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-green-500" /> {t('admin_file', 'Dossier Administratif')}
                                        </h3>
                                        <div className="space-y-4">
                                            {teacherProfile?.cv ? (
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-red-500">
                                                            <BookOpen className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-white">{t('cv_folder', 'CV / Dossier')}</p>
                                                            <p className="text-xs text-gray-500">{t('uploaded', 'Téléchargé')}</p>
                                                        </div>
                                                    </div>
                                                    <a href={`/storage/${teacherProfile.cv}`} target="_blank" className="text-blue-600 text-sm font-bold hover:underline">
                                                        {t('view', 'Voir')}
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">{t('no_cv', 'Aucun CV téléchargé.')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeProfileTab === 'cours' && (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-indigo-500" /> {t('courses_taught', 'Cours Dispensés')}
                                    </h3>

                                    {teacherCourses && teacherCourses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {teacherCourses.map((c) => (
                                                <div key={c.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-400 transition">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="text-sm font-bold text-gray-500 uppercase">{c.classe?.nom}</div>
                                                        {c.is_titulaire == 1 && (
                                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">{t('titulaire', 'Titulaire')}</span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 dark:text-white text-lg mb-1">{c.matiere?.nom}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Calendar className="w-3 h-3" /> {c.annee_scolaire?.nom}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-gray-400">
                                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>{t('no_courses_assigned', "Cet enseignant n'a pas encore de cours assignés pour cette année.")}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

        </DashboardLayout>
    );
}
