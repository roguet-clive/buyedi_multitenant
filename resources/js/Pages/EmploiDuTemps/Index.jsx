import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import useTranslation from "@/Hooks/useTranslation";
import { Calendar, Plus, Trash2, MapPin, User, BookOpen, Clock, ChevronDown, GraduationCap, Save, X } from "lucide-react";
import Modal from "@/Components/Modal";
import toast from "react-hot-toast";

// Couleurs cycle par matière (déterministe par index de matière)
const COURSE_COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-900/50', border: 'border-l-blue-500', text: 'text-blue-800 dark:text-blue-200', time: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/50', border: 'border-l-emerald-500', text: 'text-emerald-800 dark:text-emerald-200', time: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/50', border: 'border-l-purple-500', text: 'text-indigo-800 dark:text-indigo-200', time: 'text-indigo-600 dark:text-indigo-400' },
    { bg: 'bg-amber-100 dark:bg-amber-900/50', border: 'border-l-amber-500', text: 'text-amber-800 dark:text-amber-200', time: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-l-rose-500', text: 'text-red-800 dark:text-red-200', time: 'text-red-600 dark:text-red-400' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/50', border: 'border-l-cyan-500', text: 'text-cyan-800 dark:text-cyan-200', time: 'text-cyan-600 dark:text-cyan-400' },
    { bg: 'bg-orange-100 dark:bg-orange-900/50', border: 'border-l-orange-500', text: 'text-orange-800 dark:text-orange-200', time: 'text-orange-600 dark:text-orange-400' },
    { bg: 'bg-teal-100 dark:bg-teal-900/50', border: 'border-l-teal-500', text: 'text-teal-800 dark:text-teal-200', time: 'text-teal-600 dark:text-teal-400' },
];

export default function Index({ classes, enseignants, matieres, periodes = [], emplois = [], selectedClasse }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const [classeId, setClasseId] = useState(selectedClasse?.id || "");
    const [modalOpen, setModalOpen] = useState(false);

    const [matiereId, setMatiereId] = useState("");
    const [enseignantId, setEnseignantId] = useState("");
    const [periodeId, setPeriodeId] = useState("");
    const [jour, setJour] = useState("Lundi");
    const [heureDebut, setHeureDebut] = useState("08:00");
    const [heureFin, setHeureFin] = useState("09:00");
    const [salle, setSalle] = useState("");

    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const heures = Array.from({ length: 12 }, (_, i) => i + 7); // 7h à 18h

    // Map matière ID → couleur
    const matiereColorMap = {};
    matieres.forEach((m, i) => { matiereColorMap[m.id] = COURSE_COLORS[i % COURSE_COLORS.length]; });

    const handleClasseChange = (e) => {
        const id = e.target.value;
        setClasseId(id);
        if (id) router.get(route("emploi_du_temps.index"), { classe_id: id }, { preserveState: true });
    };

    const openAddModal = (day = "Lundi", hour = 8) => {
        if (!classeId) { toast.error("Veuillez d'abord sélectionner une classe."); return; }
        setJour(day);
        setHeureDebut(`${hour.toString().padStart(2, '0')}:00`);
        setHeureFin(`${(hour + 1).toString().padStart(2, '0')}:00`);
        setMatiereId(""); setEnseignantId(""); setPeriodeId(""); setSalle("");
        setModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        router.post(route("emploi_du_temps.store"), {
            classe_id: classeId, matiere_id: matiereId, enseignant_id: enseignantId,
            periode_id: periodeId || null, jour, heure_debut: heureDebut, heure_fin: heureFin, salle,
        }, { onSuccess: () => { setModalOpen(false); setMatiereId(""); }, preserveScroll: true });
    };

    const deleteSlot = (id) => {
        if (confirm("Supprimer ce cours ?")) {
            router.delete(route("emploi_du_temps.destroy", id), { preserveScroll: true });
        }
    };

    const getCoursesForCell = (day, hour) => emplois.filter(e => {
        const startHour = parseInt(e.heure_debut.split(':')[0]);
        return e.jour === day && startHour === hour;
    });

    const getCourseDuration = (debut, fin) => {
        const s = parseInt(debut.split(':')[0]) + parseInt(debut.split(':')[1]) / 60;
        const f = parseInt(fin.split(':')[0]) + parseInt(fin.split(':')[1]) / 60;
        return Math.max(1, f - s);
    };

    const totalCours = emplois.length;

    return (
        <DashboardLayout title={t("timetable", "Emploi du Temps")}>

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-indigo-950 to-indigo-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <Calendar className="w-10 h-10 text-indigo-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-sm font-medium mb-3 border border-white/10">
                                <GraduationCap className="w-4 h-4" />
                                <span>Planification Scolaire</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Emploi du Temps</h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                Gérez la grille horaire de chaque classe. Cliquez sur une cellule vide pour ajouter un cours.
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 flex gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-6 py-4 text-center">
                            <p className="text-3xl font-black text-white">{totalCours}</p>
                            <p className="text-sm text-slate-300 mt-1">cours planifiés</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SÉLECTEUR CLASSE */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select value={classeId} onChange={handleClasseChange}
                        className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
                        <option value="">— Sélectionner une classe —</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {classeId && (
                    <button onClick={() => openAddModal()}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        Ajouter un cours
                    </button>
                )}
            </div>

            {/* GRILLE */}
            {!classeId ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 py-20 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Sélectionnez une classe</p>
                    <p className="text-sm text-slate-400 mt-1">pour afficher et gérer son emploi du temps</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px] p-4">
                            {/* EN-TÊTE */}
                            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '70px repeat(6, 1fr)' }}>
                                <div className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Heure</div>
                                {jours.map(day => (
                                    <div key={day} className="py-3 text-center font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* LIGNES HORAIRES */}
                            {heures.map(hour => (
                                <div key={hour} className="grid gap-1 mb-1" style={{ gridTemplateColumns: '70px repeat(6, 1fr)' }}>
                                    <div className="text-xs font-bold text-slate-400 text-right pr-3 flex items-start justify-end pt-2">
                                        {hour}:00
                                    </div>
                                    {jours.map(day => {
                                        const courses = getCoursesForCell(day, hour);
                                        return (
                                            <div key={`${day}-${hour}`}
                                                className="min-h-[80px] border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors relative group cursor-pointer"
                                                onClick={() => { if (courses.length === 0) openAddModal(day, hour); }}>
                                                {courses.length === 0 && (
                                                    <button className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity">
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {courses.map(course => {
                                                    const duration = getCourseDuration(course.heure_debut, course.heure_fin);
                                                    const heightCalc = `calc(${duration * 100}% + ${(duration - 1) * 5}px)`;
                                                    const colors = matiereColorMap[course.matiere_id] || COURSE_COLORS[0];
                                                    return (
                                                        <div key={course.id}
                                                            className={`absolute inset-x-0 mx-0.5 p-2 rounded-xl border-l-4 shadow-sm z-20 flex flex-col group/card ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}
                                                            style={{ top: '2px', height: heightCalc, minHeight: 'calc(100% - 4px)' }}
                                                            onClick={(e) => e.stopPropagation()}>
                                                            <p className={`font-bold text-xs leading-tight line-clamp-2 ${colors.text}`} title={course.matiere?.nom}>
                                                                {course.matiere?.nom}
                                                            </p>
                                                            <p className={`text-[10px] font-semibold mt-0.5 ${colors.time}`}>
                                                                {course.heure_debut?.substring(0, 5)}–{course.heure_fin?.substring(0, 5)}
                                                            </p>
                                                            <div className={`mt-auto space-y-0.5 ${colors.text} opacity-80`}>
                                                                {course.enseignant && (
                                                                    <div className="flex items-center gap-1 text-[10px]">
                                                                        <User className="w-2.5 h-2.5 shrink-0" />
                                                                        <span className="truncate">{course.enseignant.prenom?.charAt(0)}. {course.enseignant.nom}</span>
                                                                    </div>
                                                                )}
                                                                {course.salle && (
                                                                    <div className="flex items-center gap-1 text-[10px]">
                                                                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                                                                        <span>{course.salle}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); deleteSlot(course.id); }}
                                                                className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 text-red-500 hover:text-red-700 bg-white/80 dark:bg-slate-900/80 rounded-full p-0.5 shadow-sm transition-all">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LÉGENDE */}
                    {emplois.length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                            {matieres.filter(m => emplois.some(e => e.matiere_id === m.id)).map((m, i) => {
                                const c = COURSE_COLORS[i % COURSE_COLORS.length];
                                return (
                                    <div key={m.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${c.bg}`}>
                                        <div className={`w-2 h-2 rounded-full border-l-4 ${c.border.replace('border-l-', 'bg-')}`}></div>
                                        <span className={`text-xs font-semibold ${c.text}`}>{m.nom}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MODALE AJOUT */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="p-0 overflow-hidden rounded-2xl">
                    {/* Header modale */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <Plus className="w-5 h-5" />
                            <h2 className="text-lg font-bold">Ajouter un cours</h2>
                        </div>
                        <button onClick={() => setModalOpen(false)}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Jour */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Jour</label>
                                <select value={jour} onChange={e => setJour(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all">
                                    {jours.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            {/* Salle */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Salle <span className="text-slate-400 font-normal">(optionnel)</span></label>
                                <input type="text" value={salle} onChange={e => setSalle(e.target.value)} placeholder="Ex: 101"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Heure début</label>
                                <input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Heure fin</label>
                                <input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Matière <span className="text-red-400">*</span></label>
                            <select value={matiereId} onChange={e => setMatiereId(e.target.value)} required
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all">
                                <option value="">— Choisir une matière —</option>
                                {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Enseignant <span className="text-slate-400 font-normal">(optionnel)</span></label>
                            <select value={enseignantId} onChange={e => setEnseignantId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all">
                                <option value="">— Choisir un enseignant —</option>
                                {enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                            </select>
                        </div>

                        {periodes.length > 0 && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Période <span className="text-slate-400 font-normal">(optionnel)</span></label>
                                <select value={periodeId} onChange={e => setPeriodeId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all">
                                    <option value="">— Toute l'année —</option>
                                    {periodes.filter(p => {
                                        if (!selectedClasse) return true;
                                        if (!p.type || p.type === 'global') return true;
                                        if (selectedClasse.type === 'secondaire' && p.type === 'secondaire') return true;
                                        if (['maternelle', 'primaire'].includes(selectedClasse.type) && p.type === 'primaire') return true;
                                        return false;
                                    }).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors text-sm">
                                Annuler
                            </button>
                            <button type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-indigo-500/30 transition-all active:scale-95 text-sm">
                                <Save className="w-4 h-4" />
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
