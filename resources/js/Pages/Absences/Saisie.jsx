import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { ChevronLeft, Save, Calendar, ClipboardCheck, CheckCircle2, XCircle, Clock, History, Users, Lock, Unlock, ShieldAlert, AlertCircle, Sparkles, BookOpen, AlertTriangle, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function Saisie({
    classe,
    inscriptions,
    absences: existingAbsences,
    date,
    isLocked = false,
    lockedBy = null,
    lockedAt = null,
    canUnlock = false,
    scheduleStatus = {}
}) {
    const {
        hasScheduleConfigured = false,
        hasCoursesToday = false,
        dayName = '',
        coursesToday = [],
        canTakeAttendance = true,
        warningMessage = null,
        blockReason = null,
        isTeacher = false,
        isAdmin = false
    } = scheduleStatus || {};

    const [entries, setEntries] = useState({});

    useEffect(() => {
        const initialEntries = {};
        inscriptions.forEach(insc => {
            const existing = existingAbsences[insc.id];
            initialEntries[insc.id] = {
                marked: !!existing,
                type: existing?.type || 'absence',
                justifiee: existing?.justifiee == 1,
                motif: existing?.motif || ''
            };
        });
        setEntries(initialEntries);
    }, [inscriptions, existingAbsences]);

    const { data, setData, post, processing } = useForm({ date, absences: {} });

    useEffect(() => { setData('absences', entries); }, [entries]);

    const handleDateChange = (newDate) => {
        router.visit(route('absences.saisie', { classe: classe.id, date: newDate }));
    };

    const isReadOnly = (isLocked && !canUnlock) || !canTakeAttendance;

    const updateEntry = (id, field, value) => {
        if (isReadOnly) return;
        setEntries(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const toggleAbsent = (id) => {
        if (isReadOnly) return;
        setEntries(prev => ({ ...prev, [id]: { ...prev[id], marked: !prev[id].marked } }));
    };

    const markAllPresent = () => {
        if (isReadOnly) return;
        const next = {};
        Object.keys(entries).forEach(k => { next[k] = { ...entries[k], marked: false }; });
        setEntries(next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canTakeAttendance && !canUnlock) {
            toast.error("La saisie de l'appel n'est pas autorisée pour ce jour.");
            return;
        }
        post(route('absences.storeBulk', classe.id), {
            preserveScroll: true,
        });
    };

    const handleToggleLock = () => {
        router.post(route('absences.toggleLock', classe.id), { date }, {
            preserveScroll: true,
        });
    };

    const absentCount = Object.values(entries).filter(e => e.marked && e.type === 'absence').length;
    const retardCount = Object.values(entries).filter(e => e.marked && e.type === 'retard').length;
    const presentCount = inscriptions.length - absentCount - retardCount;

    return (
        <DashboardLayout title={`Appel — ${classe.nom}`}>
            <Head title={`Absences - ${classe.nom}`} />

            {/* HERO BANNER */}
            <div className={`bg-gradient-to-br ${isLocked ? 'from-[#0B1A2D] via-slate-900 to-indigo-950 border-indigo-900/50' : 'from-[#0B1A2D] via-red-950 to-red-900 border-slate-800'} rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-white border`}>
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href={route('absences.index')}
                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/20 transition-colors group shrink-0">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hidden sm:block shrink-0">
                            {isLocked ? (
                                <Lock className="w-8 h-8 text-amber-300" />
                            ) : (
                                <ClipboardCheck className="w-8 h-8 text-red-200" />
                            )}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-red-200 text-xs font-medium mb-2 border border-white/10">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{isLocked ? 'Appel Clôturé' : `Appel du ${dayName || 'jour'}`}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1 flex items-center gap-3">
                                Classe : {classe.nom}
                                {isLocked && (
                                    <span className="text-xs px-3 py-1 bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Lock className="w-3 h-3" />
                                        Verrouillé
                                    </span>
                                )}
                            </h1>
                            <p className="text-slate-300 text-sm">{inscriptions.length} élèves inscrits</p>
                        </div>
                    </div>

                    {/* STATS KPI */}
                    <div className="flex gap-3 flex-wrap">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[80px]">
                            <p className="text-2xl font-black text-emerald-300">{presentCount}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Présents</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[80px]">
                            <p className="text-2xl font-black text-red-300">{absentCount}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Absents</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center min-w-[80px]">
                            <p className="text-2xl font-black text-amber-300">{retardCount}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Retards</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📅 BANDEAU PROGRAMME DU JOUR (EMPLOI DU TEMPS) */}
            {hasScheduleConfigured && hasCoursesToday && (
                <div className="mb-6 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-bold text-sm">
                            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Programme du jour ({dayName})</span>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 rounded-full">
                            {coursesToday.length} cours prévu(s)
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {coursesToday.map(c => (
                            <div key={c.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-xl text-xs shadow-sm">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                    {c.heure_debut?.slice(0, 5)} - {c.heure_fin?.slice(0, 5)}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-white">{c.matiere?.nom}</span>
                                {(c.enseignant?.user?.nom || c.enseignant?.nom) && (
                                    <span className="text-slate-500 dark:text-slate-400">
                                        • {c.enseignant.user ? `${c.enseignant.user.prenom} ${c.enseignant.user.nom}` : `${c.enseignant.prenom} ${c.enseignant.nom}`}
                                    </span>
                                )}
                                {c.salle && <span className="text-slate-400 font-medium">({c.salle})</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ⛔ ALERTE BLOCAGE (ENSEIGNANT SANS COURS CE JOUR) */}
            {blockReason && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-3 text-rose-900 dark:text-rose-200 shadow-sm">
                    <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                    <div>
                        <p className="text-sm font-bold">⛔ Saisie non autorisée</p>
                        <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{blockReason}</p>
                    </div>
                </div>
            )}

            {/* ⚠️ AVERTISSEMENT ADMIN OU INFO EMPLOI DU TEMPS */}
            {warningMessage && !blockReason && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-sm ${
                    hasScheduleConfigured
                        ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                        : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
                }`}>
                    {hasScheduleConfigured ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : (
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                    <p className="text-xs sm:text-sm font-medium">{warningMessage}</p>
                </div>
            )}

            {/* BANNIÈRE DE VERROUILLAGE / SÉCURITÉ */}
            {isLocked ? (
                <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                <span>🔒 Registre d'appel validé et verrouillé</span>
                                {lockedAt && <span className="text-xs font-normal text-amber-700 dark:text-amber-300">({lockedAt} {lockedBy ? `par ${lockedBy}` : ''})</span>}
                            </p>
                            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                                {canUnlock
                                    ? "En tant qu'administrateur, vous pouvez modifier les données d'assiduité ou déverrouiller l'appel pour les enseignants."
                                    : "L'appel a été clôturé pour cette date afin de garantir l'intégrité du registre. Pour toute rectification ou justification, veuillez vous adresser à la Direction."
                                }
                            </p>
                        </div>
                    </div>

                    {canUnlock && (
                        <button
                            type="button"
                            onClick={handleToggleLock}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                        >
                            <Unlock className="w-4 h-4" />
                            <span>Déverrouiller l'appel</span>
                        </button>
                    )}
                </div>
            ) : (
                !blockReason && (
                    <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-3 text-blue-900 dark:text-blue-200">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <p className="text-xs sm:text-sm font-medium">
                                <span className="font-bold">Saisie de l'appel :</span> Une fois l'appel enregistré, la feuille sera automatiquement <span className="font-bold underline">verrouillée</span> pour éviter toute modification ultérieure.
                            </p>
                        </div>
                    </div>
                )
            )}

            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10 -mt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)}
                            className="border-none bg-transparent focus:ring-0 text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer" />
                    </div>
                    {dayName && (
                        <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700">
                            {dayName}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {!isReadOnly && (
                        <button type="button" onClick={markAllPresent}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
                            <CheckCircle2 className="w-4 h-4" />
                            Tous Présents
                        </button>
                    )}
                    <Link href={route('absences.history', classe.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-2xl text-sm font-semibold hover:bg-blue-100 transition-colors">
                        <History className="w-4 h-4" />
                        Historique
                    </Link>
                </div>
            </div>

            {/* TABLEAU APPEL */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0B1A2D] text-white">
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Élève</th>
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase text-center w-48">Statut</th>
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tr-3xl">Détails (si absent/retard)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {inscriptions.length > 0 ? (
                                    inscriptions.map((insc) => {
                                        const entry = entries[insc.id] || { marked: false, type: 'absence', justifiee: false, motif: '' };
                                        const isMarked = entry.marked;
                                        const isRetard = isMarked && entry.type === 'retard';

                                        return (
                                            <tr key={insc.id} className={`transition-colors ${isMarked ? (isRetard ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-red-50/50 dark:bg-red-900/10') : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {(insc.eleve.user?.prenom?.charAt(0) || '?').toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-white">{insc.eleve.user?.prenom} {insc.eleve.user?.nom}</p>
                                                            {insc.eleve.matricule && <p className="text-xs text-slate-400 font-mono">{insc.eleve.matricule}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {isReadOnly ? (
                                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm select-none ${isMarked
                                                            ? (isRetard ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400')
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                            }`}>
                                                            {isMarked ? (isRetard ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />) : <CheckCircle2 className="w-4 h-4" />}
                                                            {isMarked ? (isRetard ? 'RETARD' : 'ABSENT') : 'PRÉSENT'}
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => toggleAbsent(insc.id)}
                                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-95 ${isMarked
                                                                ? (isRetard ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 hover:bg-amber-200' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-200')
                                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200'
                                                                }`}>
                                                            {isMarked ? (isRetard ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />) : <CheckCircle2 className="w-4 h-4" />}
                                                            {isMarked ? (isRetard ? 'RETARD' : 'ABSENT') : 'PRÉSENT'}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {isMarked ? (
                                                        isReadOnly ? (
                                                            <div className="flex items-center gap-3 text-xs">
                                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                                                    {entry.type}
                                                                </span>
                                                                <span className={`px-2.5 py-1 rounded-lg font-bold ${entry.justifiee ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {entry.justifiee ? '✓ Justifié' : 'Non justifié'}
                                                                </span>
                                                                {entry.motif && (
                                                                    <span className="text-slate-600 dark:text-slate-400 italic">
                                                                        « {entry.motif} »
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-3 items-center">
                                                                <select value={entry.type} onChange={(e) => updateEntry(insc.id, 'type', e.target.value)}
                                                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                                                                    <option value="absence">Absence</option>
                                                                    <option value="retard">Retard</option>
                                                                </select>

                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <div className="relative">
                                                                        <input type="checkbox" checked={entry.justifiee}
                                                                            onChange={(e) => updateEntry(insc.id, 'justifiee', e.target.checked)}
                                                                            className="sr-only peer" />
                                                                        <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                                                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4"></div>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Justifié</span>
                                                                </label>

                                                                <input type="text" placeholder="Motif (ex: Maladie)"
                                                                    value={entry.motif} onChange={(e) => updateEntry(insc.id, 'motif', e.target.value)}
                                                                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all w-40" />
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">Élève présent en classe</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                <Users className="w-12 h-12 mb-3 opacity-40" />
                                                <p className="font-medium">Aucun élève inscrit dans cette classe</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* FOOTER STICKY */}
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {Object.values(entries).filter(e => e.marked).length} absence(s)/retard(s) sur {inscriptions.length} élèves
                        </p>

                        {isLocked ? (
                            <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-sm border border-amber-200 dark:border-amber-800/50">
                                <Lock className="w-4 h-4" />
                                <span>Appel validé & verrouillé (Lecture seule)</span>
                            </div>
                        ) : (
                            !canTakeAttendance ? (
                                <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm border border-slate-300 dark:border-slate-700 select-none">
                                    <Lock className="w-4 h-4" />
                                    <span>Saisie non autorisée (Jour/Horaire hors créneau)</span>
                                </div>
                            ) : (
                                <button type="submit" disabled={processing}
                                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70">
                                    <Save className="w-5 h-5" />
                                    <span>{processing ? 'Validation en cours...' : (isLocked ? 'Mettre à jour l\'appel (Admin)' : 'Valider & Clôturer l\'Appel')}</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
