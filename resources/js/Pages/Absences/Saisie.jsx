import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { ChevronLeft, Save, Calendar, ClipboardCheck, CheckCircle2, XCircle, Clock, History, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function Saisie({ classe, inscriptions, absences: existingAbsences, date }) {

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

    const updateEntry = (id, field, value) => {
        setEntries(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const toggleAbsent = (id) => {
        setEntries(prev => ({ ...prev, [id]: { ...prev[id], marked: !prev[id].marked } }));
    };

    const markAllPresent = () => {
        const next = {};
        Object.keys(entries).forEach(k => { next[k] = { ...entries[k], marked: false }; });
        setEntries(next);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('absences.storeBulk', classe.id), {
            onSuccess: () => toast.success('✅ Absences enregistrées avec succès !')
        });
    };

    const absentCount = Object.values(entries).filter(e => e.marked && e.type === 'absence').length;
    const retardCount = Object.values(entries).filter(e => e.marked && e.type === 'retard').length;
    const presentCount = inscriptions.length - absentCount - retardCount;

    return (
        <DashboardLayout title={`Appel — ${classe.nom}`}>
            <Head title={`Absences - ${classe.nom}`} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-red-950 to-red-900 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href={route('absences.index')}
                            className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white/20 transition-colors group shrink-0">
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hidden sm:block shrink-0">
                            <ClipboardCheck className="w-8 h-8 text-red-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-red-200 text-xs font-medium mb-2 border border-white/10">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Appel du jour</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1">Classe : {classe.nom}</h1>
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

            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10 -mt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)}
                            className="border-none bg-transparent focus:ring-0 text-slate-700 dark:text-slate-200 font-semibold text-sm" />
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button type="button" onClick={markAllPresent}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
                        <CheckCircle2 className="w-4 h-4" />
                        Tous Présents
                    </button>
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
                                    inscriptions.map((insc, i) => {
                                        const entry = entries[insc.id] || { marked: false, type: 'absence', justifiee: false, motif: '' };
                                        const isMarked = entry.marked;
                                        const isRetard = isMarked && entry.type === 'retard';

                                        return (
                                            <tr key={insc.id} className={`transition-colors ${isMarked ? (isRetard ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-red-50/50 dark:bg-red-900/10') : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {(insc.eleve.user.prenom?.charAt(0) || '?').toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-white">{insc.eleve.user.prenom} {insc.eleve.user.nom}</p>
                                                            {insc.eleve.matricule && <p className="text-xs text-slate-400 font-mono">{insc.eleve.matricule}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <button type="button" onClick={() => toggleAbsent(insc.id)}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-95 ${isMarked
                                                            ? (isRetard ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 hover:bg-amber-200' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-200')
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200'
                                                            }`}>
                                                        {isMarked ? (isRetard ? <Clock className="w-4 h-4" /> : <XCircle className="w-4 h-4" />) : <CheckCircle2 className="w-4 h-4" />}
                                                        {isMarked ? (isRetard ? 'RETARD' : 'ABSENT') : 'PRÉSENT'}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {isMarked && (
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
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4 sticky bottom-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {Object.values(entries).filter(e => e.marked).length} absence(s)/retard(s) marqué(s) sur {inscriptions.length} élèves
                        </p>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70">
                            <Save className="w-5 h-5" />
                            {processing ? 'Enregistrement...' : 'Enregistrer l\'appel'}
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
