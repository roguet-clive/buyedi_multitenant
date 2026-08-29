import DashboardLayout from "@/Layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    GraduationCap,
    School,
    Calendar,
    ArrowUpRight,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    BookOpen,
    CheckCircle2,
    FileText,
    Sparkles,
    CalendarCheck,
    FolderKanban,
    Award,
    AlertCircle,
    ChevronRight,
    Download
} from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function Teacher({
    schedule = [],
    myClasses = [],
    kpis = { total_classes: 0, total_students: 0, weekly_hours: 0, evaluations_count: 0 },
    todayDate,
    teacherProfile,
    teacherCourses = []
}) {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('home'); // 'home' | 'profile'
    const [activeProfileTab, setActiveProfileTab] = useState('infos'); // 'infos' | 'cours'

    const teacherName = teacherProfile?.user?.prenom
        ? `${teacherProfile.user.prenom} ${teacherProfile.user.nom}`
        : `${teacherProfile?.prenom || ''} ${teacherProfile?.nom || ''}`.trim() || 'Enseignant';

    return (
        <DashboardLayout title={t("dashboard")}>
            {/* HERO BANNER & NAVIGATION */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-indigo-950 to-blue-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-xs font-semibold mb-3 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Espace Pédagogique Enseignant</span>
                            {teacherProfile?.specialite && (
                                <span className="bg-blue-500/30 px-2 py-0.5 rounded-full text-[11px] text-blue-100 border border-blue-400/20 font-bold">
                                    {teacherProfile.specialite}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            Bonjour, {teacherName} 👋
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base max-w-xl font-light">
                            Bienvenue sur votre tableau de bord. Suivez votre emploi du temps, vos classes, la saisie des notes et l'assiduité de vos élèves.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                        {/* Sélecteur d'onglets */}
                        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setActiveTab('home')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'home'
                                        ? 'bg-white text-indigo-950 shadow-md'
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                Tableau de Bord
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    activeTab === 'profile'
                                        ? 'bg-white text-indigo-950 shadow-md'
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                Mon Profil & Affectations
                            </button>
                        </div>

                        {/* Date badge */}
                        <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-semibold text-blue-100 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-300" />
                            <span>{todayDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'home' ? (
                <div className="space-y-8">
                    {/* CARTES KPIS (4 INDICATEURS CLÉS) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Classes */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <School className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mes Classes</p>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-0.5">
                                    {kpis.total_classes}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">classes actives</p>
                            </div>
                        </div>

                        {/* Élèves */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Élèves</p>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-0.5">
                                    {kpis.total_students}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">élèves suivis</p>
                            </div>
                        </div>

                        {/* Volume Horaire */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Horaire</p>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-0.5">
                                    {kpis.weekly_hours}h
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">cours / semaine</p>
                            </div>
                        </div>

                        {/* Évaluations */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Évaluations</p>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-0.5">
                                    {kpis.evaluations_count}
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">devoirs / contrôles</p>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT: 2 COLONNES */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* COLONNE GAUCHE (2/3) : PLANNING DU JOUR & MES CLASSES */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* PLANNING DU JOUR */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        <span>Planning du Jour (Aujourd'hui)</span>
                                    </h2>
                                    <Link
                                        href={route('emploi_du_temps.index')}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                                    >
                                        <span>Voir la semaine complète</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                                    {schedule.length > 0 ? (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {schedule.map((cours) => (
                                                <div key={cours.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                                    <div className="flex items-start sm:items-center gap-4">
                                                        <div className="w-24 text-center py-2 px-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                                                            <span className="block text-xs font-black text-indigo-700 dark:text-indigo-300 font-mono">{cours.heure_debut}</span>
                                                            <span className="block text-[10px] text-slate-400 font-mono">à {cours.heure_fin}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 dark:text-white text-base">
                                                                {cours.matiere}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                                                                    <School className="w-3 h-3 text-blue-500" />
                                                                    <span>Classe {cours.classe}</span>
                                                                </span>
                                                                {cours.salle && (
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="w-3 h-3 text-rose-500" />
                                                                        <span>Salle {cours.salle}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Statut Appel / Action */}
                                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                                        {cours.is_attendance_done ? (
                                                            <Link
                                                                href={route('absences.saisie', cours.classe_id)}
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-200 transition"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                <span>Appel Validé</span>
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={route('absences.saisie', cours.classe_id)}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md shadow-red-500/20 transition-all active:scale-95"
                                                            >
                                                                <Users className="w-3.5 h-3.5" />
                                                                <span>Faire l'appel</span>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center text-slate-400 dark:text-slate-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
                                            <p className="font-bold text-slate-700 dark:text-slate-300 text-base mb-1">Aucun cours programmé aujourd'hui</p>
                                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                                Profitez de cette journée pour préparer vos supports de cours, saisir des notes ou consulter l'emploi du temps complet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* MES CLASSES & GESTION RAPIDE */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <span>Mes Classes ({myClasses.length})</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myClasses.map((classe) => (
                                        <div key={classe.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-black text-lg text-slate-800 dark:text-white">{classe.nom}</h3>
                                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{classe.type || 'Général'}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                                                    {classe.students_count} élèves
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <Link
                                                    href={route('absences.saisie', classe.id)}
                                                    className="py-2 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                                                >
                                                    Appel
                                                </Link>
                                                <Link
                                                    href={route('notes.classe', classe.id)}
                                                    className="py-2 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                                                >
                                                    Notes
                                                </Link>
                                                <Link
                                                    href={route('emploi_du_temps.index', { classe_id: classe.id })}
                                                    className="py-2 text-center text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition"
                                                >
                                                    Planning
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* COLONNE DROITE (1/3) : OUTILS MÉTIER & ACTIONS RAPIDES */}
                        <div className="space-y-6">
                            {/* BANDEAU OUTILS PÉDAGOGIQUES */}
                            <div className="bg-gradient-to-br from-[#0B1A2D] via-indigo-950 to-blue-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <FolderKanban className="w-5 h-5 text-blue-300" />
                                    <span>Outils Enseignant</span>
                                </h3>

                                <div className="space-y-2.5">
                                    <Link
                                        href={route('emploi_du_temps.index')}
                                        className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition border border-white/10 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Mon Emploi du Temps</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </Link>

                                    <Link
                                        href={route('notes.index')}
                                        className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition border border-white/10 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                                                <Award className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Gestion des Notes & Évaluations</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </Link>

                                    <Link
                                        href={route('absences.index')}
                                        className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition border border-white/10 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-500/20 rounded-xl text-red-300">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Feuilles d'Appel & Absences</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </Link>

                                    <Link
                                        href={route('documents.index')}
                                        className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition border border-white/10 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Documents Pédagogiques</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </Link>

                                    <Link
                                        href={route('bulletins.index')}
                                        className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition border border-white/10 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-300">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm">Consultation des Bulletins</span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // --- ONGLETS PROFIL & AFFECTATIONS ---
                <div className="space-y-6">
                    {/* EN-TÊTE PROFIL */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-900 relative"></div>
                        <div className="px-8 pb-8 pt-0 relative">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
                                <div className="flex items-end gap-5">
                                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg shrink-0">
                                        {teacherProfile?.photo ? (
                                            <img src={`/storage/${teacherProfile.photo}`} alt="Photo" className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                                            {teacherName}
                                        </h2>
                                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                            {teacherProfile?.specialite || 'Enseignant titulaire'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SOUS-ONGLETS */}
                            <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <button
                                    onClick={() => setActiveProfileTab('infos')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        activeProfileTab === 'infos'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Informations Personnelles</span>
                                </button>
                                <button
                                    onClick={() => setActiveProfileTab('cours')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        activeProfileTab === 'cours'
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span>Cours & Affectations ({teacherCourses.length})</span>
                                </button>
                            </div>

                            {/* CONTENU SOUS-ONGLETS */}
                            <div className="mt-6">
                                {activeProfileTab === 'infos' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" />
                                                <span>Coordonnées</span>
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="text-xs text-slate-400 block font-bold">Email :</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{teacherProfile?.user?.email || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-400 block font-bold">Téléphone :</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{teacherProfile?.telephone || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-400 block font-bold">Adresse :</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{teacherProfile?.adresse || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" />
                                                <span>Statut Administratif</span>
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="text-xs text-slate-400 block font-bold">Spécialité principale :</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{teacherProfile?.specialite || 'Enseignement général'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-400 block font-bold">Genre :</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{teacherProfile?.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeProfileTab === 'cours' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {teacherCourses.length > 0 ? (
                                            teacherCourses.map((c) => (
                                                <div key={c.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg">
                                                            {c.classe?.nom}
                                                        </span>
                                                        {c.is_titulaire == 1 && (
                                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-full">
                                                                Titulaire
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">
                                                        {c.matiere?.nom}
                                                    </h4>
                                                    <p className="text-xs text-slate-400">
                                                        Année scolaire : {c.annee_scolaire?.nom || 'En cours'}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 text-center text-slate-400">
                                                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p className="font-bold">Aucune affectation de cours enregistrée</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
