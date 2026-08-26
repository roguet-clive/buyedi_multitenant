import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Briefcase, ChevronLeft, BookOpen, Calendar, Clock, GraduationCap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import useTranslation from '@/Hooks/useTranslation';

export default function ShowEnseignant({ auth, enseignant, cours, emploisDuTemps = [] }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('infos');

    const tabs = [
        { id: 'infos', label: t('informations', 'Informations'), icon: User },
        { id: 'cours', label: t('courses_classes', 'Cours & Classes'), icon: BookOpen },
        { id: 'emploi', label: t('schedule', 'Emploi du Temps'), icon: Calendar },
    ];

    // Stats Calculées
    const uniqueClasses = useMemo(() => {
        return [...new Set(cours.map(c => c.classe?.id))].length;
    }, [cours]);

    const weeklyHours = useMemo(() => {
        // Simple estimation: difference between start and end time for each slot
        let totalMinutes = 0;
        emploisDuTemps.forEach(slot => {
            const start = new Date(`1970-01-01T${slot.heure_debut}`);
            const end = new Date(`1970-01-01T${slot.heure_fin}`);
            totalMinutes += (end - start) / 60000;
        });
        return Math.round(totalMinutes / 60);
    }, [emploisDuTemps]);

    // Timetable Grid Helper
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    const getSlot = (day, hour) => {
        return emploisDuTemps.find(slot =>
            slot.jour === day &&
            slot.heure_debut.startsWith(hour.substring(0, 2)) // Simple match for demo, better to rely on proper time ranges
        );
    };

    return (
        <DashboardLayout
            title={`Profil Enseignant - ${enseignant.prenom} ${enseignant.nom}`}
            header={false}
        >
            <Head title={`Profil Enseignant - ${enseignant.prenom} ${enseignant.nom}`} />

            <div className="w-full">

                {/* EN-TÊTE / NAVIGATION RAPIDE */}
                <div className="mb-6 flex justify-between items-center sm:hidden">
                    <Link href={route('enseignants.index')} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors font-semibold">
                        <ChevronLeft className="w-5 h-5" />
                        Retour
                    </Link>
                </div>

                <div className="space-y-6">

                    {/* HEADER CARD PREMIUM */}
                    <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl border border-slate-100 dark:border-slate-800 relative">
                        {/* Bannière de Couverture */}
                        <div className="relative h-48 bg-[#0B1A2D]">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>

                            <Link
                                href={route('enseignants.index')}
                                className="absolute top-6 left-6 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all shadow-sm border border-white/10"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>

                            {/* Avatar flottant */}
                            <div className="absolute -bottom-12 left-8 md:left-12">
                                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-3xl shadow-lg">
                                    {enseignant.photo ? (
                                        <img src={`/storage/${enseignant.photo}`} alt="Photo" className="w-28 h-28 rounded-2xl object-cover bg-slate-200" />
                                    ) : (
                                        <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800 rounded-2xl flex items-center justify-center text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-white/10">
                                            <span className="text-4xl font-black">{enseignant.prenom.charAt(0)}{enseignant.nom.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informations Principales */}
                        <div className="pt-16 pb-8 px-8 md:px-12 flex flex-col md:flex-row justify-between items-start gap-8 z-10 relative">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                        {enseignant.prenom} <span className="uppercase">{enseignant.nom}</span>
                                    </h1>
                                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                        Actif
                                    </span>
                                </div>
                                <div className="mt-3 text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" /> {enseignant.specialite || 'Enseignant Général'}
                                </div>

                                <div className="mt-5 flex flex-wrap gap-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {enseignant.telephone && (
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            <Phone className="w-4 h-4 text-slate-400" /> {enseignant.telephone}
                                        </div>
                                    )}
                                    {enseignant.user?.email && (
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            <Mail className="w-4 h-4 text-slate-400" /> {enseignant.user.email}
                                        </div>
                                    )}
                                    {enseignant.adresse && (
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            <MapPin className="w-4 h-4 text-slate-400" /> {enseignant.adresse}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QUICK STATS - KPI Cards */}
                            <div className="flex gap-4 shrink-0 px-4 md:px-0 scrollbar-hide py-2 md:py-0 w-full md:w-auto overflow-x-auto">
                                <div className="flex flex-col items-center justify-center min-w-24 px-5 py-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-800/50">
                                    <div className="text-blue-500 dark:text-blue-400 mb-1"><BookOpen className="w-6 h-6" /></div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">{cours.length}</div>
                                    <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-widest">Cours</div>
                                </div>
                                <div className="flex flex-col items-center justify-center min-w-24 px-5 py-4 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border-indigo-800/50">
                                    <div className="text-indigo-500 dark:text-indigo-400 mb-1"><Users className="w-6 h-6" /></div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">{uniqueClasses}</div>
                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-widest">Classes</div>
                                </div>
                                <div className="flex flex-col items-center justify-center min-w-24 px-5 py-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-800/50">
                                    <div className="text-emerald-500 dark:text-emerald-400 mb-1"><Clock className="w-6 h-6" /></div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">{weeklyHours}<span className="text-lg">h</span></div>
                                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest">Par sem.</div>
                                </div>
                            </div>
                        </div>

                        {/* TABS NAVIGATION STYLE PILL */}
                        <div className="px-8 pb-6 pt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-slate-800 text-white shadow-md dark:bg-blue-600 dark:shadow-blue-900/20'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'infos' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl"><User className="w-5 h-5" /></div>
                                            {t('personal_infos', 'Informations Personnelles')}
                                        </h3>
                                        <div className="space-y-5">
                                            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">{t('full_name', 'Nom Complet')}</label>
                                                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">{enseignant.prenom} <span className="uppercase">{enseignant.nom}</span></p>
                                            </div>
                                            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">{t('sex', 'Sexe')}</label>
                                                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">{enseignant.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                                            </div>
                                            <div className="pb-4">
                                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">{t('specialite', 'Spécialité Principale')}</label>
                                                <p className="inline-flex px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold">{enseignant.specialite || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-green-50 dark:bg-green-900/40 text-green-600 rounded-xl"><Briefcase className="w-5 h-5" /></div>
                                            {t('admin_file', 'Dossier Administratif')}
                                        </h3>
                                        <div className="space-y-4">
                                            {enseignant.cv ? (
                                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-red-500 border border-slate-100 dark:border-slate-600">
                                                            <BookOpen className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-bold text-slate-800 dark:text-white">Curriculum Vitae / Dossier</p>
                                                            <p className="text-xs font-medium text-slate-500 mt-0.5">{t('uploaded', 'Document en ligne')}</p>
                                                        </div>
                                                    </div>
                                                    <a href={`/storage/${enseignant.cv}`} target="_blank" className="px-4 py-2 bg-white text-slate-700 border border-slate-200 font-bold text-sm rounded-xl hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 transition-colors shadow-sm">
                                                        {t('view', 'Consulter')}
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl">
                                                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                                    <p className="text-slate-500 font-medium">{t('no_cv', "Aucun document n'a été fourni.")}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CARTE ACCÈS PORTAIL */}
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 md:col-span-2">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl"><Mail className="w-5 h-5" /></div>
                                            Compte & Accès au Portail Enseignant
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Identifiant / Email</label>
                                                <p className="text-slate-800 dark:text-white font-bold font-mono text-sm">{enseignant.user?.email || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Matricule</label>
                                                <p className="text-slate-800 dark:text-white font-bold font-mono text-sm">{enseignant.matricule || '-'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Mot de passe initial</label>
                                                <p className="text-slate-800 dark:text-white font-bold font-mono text-sm">12345678 <span className="text-xs text-slate-400 font-sans font-normal">(Par défaut)</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cours' && (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl"><GraduationCap className="w-5 h-5" /></div>
                                        {t('courses_taught', 'Cours Dispensés')}
                                    </h3>

                                    {cours.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                            {cours.map((c) => (
                                                <div key={c.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all group cursor-default">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="px-2.5 py-1 bg-white dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">{c.classe?.nom}</div>
                                                        {c.is_titulaire == 1 && (
                                                            <span className="px-2 py-1 bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-200/50 dark:border-amber-800/50">Titulaire</span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-black text-slate-800 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.matiere?.nom}</h4>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                                                        <Calendar className="w-3.5 h-3.5" /> {c.annee_scolaire?.nom}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 dark:border-slate-600">
                                                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                                            </div>
                                            <p className="text-slate-500 font-medium">{t('no_courses_assigned', "Cet enseignant n'a pas encore de cours assignés pour cette année.")}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'emploi' && (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-x-auto">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 dark:bg-orange-900/40 text-orange-600 rounded-xl"><Calendar className="w-5 h-5" /></div>
                                        {t('weekly_schedule', 'Emploi du Temps Hebdomadaire')}
                                    </h3>

                                    {emploisDuTemps.length > 0 ? (
                                        <div className="min-w-[800px]">
                                            <div className="grid grid-cols-7 gap-3 mb-3 sticky top-0 bg-white dark:bg-slate-900 z-10 py-2">
                                                <div className="text-center font-bold text-slate-400 text-xs uppercase tracking-widest pt-2">Heures</div>
                                                {days.map(day => (
                                                    <div key={day} className="text-center font-black text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 rounded-xl py-3 border border-slate-100 dark:border-slate-700/50">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-3">
                                                {hours.map(hour => (
                                                    <div key={hour} className="grid grid-cols-7 gap-3">
                                                        <div className="text-center text-xs font-bold text-slate-400 py-3 -mt-1.5">{hour}</div>
                                                        {days.map(day => {
                                                            const slot = getSlot(day, hour);
                                                            return (
                                                                <div key={`${day}-${hour}`} className={`rounded-xl p-3 min-h-[70px] relative transition-all cursor-default
                                                                    ${slot ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' : 'bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700/50'}
                                                                `}>
                                                                    {slot && (
                                                                        <div className="text-xs">
                                                                            <div className="font-black text-indigo-900 dark:text-indigo-200 truncate pr-4" title={slot.matiere?.nom}>{slot.matiere?.nom}</div>
                                                                            <div className="text-indigo-600 dark:text-indigo-400 font-bold mt-1 inline-block px-1.5 py-0.5 bg-white/60 dark:bg-indigo-950/50 rounded-md">{slot.classe?.nom}</div>
                                                                            <div className="text-[10px] font-bold text-indigo-400/80 dark:text-indigo-500 absolute top-2 right-2 px-1.5 bg-indigo-100 dark:bg-indigo-900 rounded">{slot.salle}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 dark:border-slate-600">
                                                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                                            </div>
                                            <p className="text-slate-500 font-medium">{t('no_schedule_data', "Aucun emploi du temps disponible pour cet enseignant.")}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>
        </DashboardLayout>
    );
}
