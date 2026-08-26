import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import {
    BookOpen,
    User,
    School,
    CheckCircle2,
    AlertCircle,
    Trash2,
    GraduationCap,
    Users,
    Search,
    Layers,
    Sparkles,
    Check,
    ArrowRightLeft,
    Phone,
    Mail,
    SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import useTranslation from "@/Hooks/useTranslation";

export default function Index({
    cours = [],
    classes = [],
    enseignants = [],
    matieres = [],
    periodes = [],
    classeActuelle = null,
    filters = {}
}) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const [selectedPeriode, setSelectedPeriode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'assigned', 'unassigned'
    const [localCoefficients, setLocalCoefficients] = useState({});
    const [savingMatiereId, setSavingMatiereId] = useState(null);

    // Initialiser les coefficients
    useEffect(() => {
        const initialCoeffs = {};
        cours.forEach(c => {
            const key = c.matiere_id || 'titulaire';
            if (c.coefficient) {
                initialCoeffs[key] = c.coefficient;
            }
        });
        setLocalCoefficients(initialCoeffs);
    }, [cours]);

    // --- Options Helper ---
    const classOptions = useMemo(() => classes.map(c => ({
        value: c.id,
        label: (
            <div className="flex justify-between items-center w-full py-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-100">{c.nom}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${['maternelle', 'primaire'].includes(c.type)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
                    }`}>
                    {c.type}
                </span>
            </div>
        ),
        textLabel: c.nom,
        type: c.type
    })), [classes]);

    const filteredPeriodes = useMemo(() => {
        if (!classeActuelle) return periodes;
        return periodes.filter(p => {
            if (!p.type || p.type === 'global') return true;
            if (classeActuelle.type === 'secondaire' && p.type === 'secondaire') return true;
            if (['maternelle', 'primaire'].includes(classeActuelle.type) && p.type === 'primaire') return true;
            return false;
        });
    }, [periodes, classeActuelle]);

    const periodeOptions = useMemo(() => [
        { value: '', label: t("whole_year", "Toute l'année scolaire") },
        ...filteredPeriodes.map(p => ({ value: p.id, label: p.nom }))
    ], [filteredPeriodes, t]);

    const teacherOptions = useMemo(() => enseignants.map(t => ({
        value: t.id,
        label: t.nom_complet,
        specialite: t.specialite,
        telephone: t.telephone,
        email: t.email,
        data: t
    })), [enseignants]);

    // --- Logic Helpers ---
    const isMaternelleOrPrimaire = ['maternelle', 'primaire'].includes(classeActuelle?.type);
    const isSecondaire = classeActuelle?.type === 'secondaire';

    // Trouver le cours pour une matière
    const getAssignment = (matiereId = null) => {
        const targetPeriodeId = selectedPeriode ? parseInt(selectedPeriode) : null;
        if (targetPeriodeId) {
            return cours.find(c => c.matiere_id === matiereId && c.periode_id === targetPeriodeId);
        }
        return cours.find(c => c.matiere_id === matiereId);
    };

    // Calcul du nombre de matières qu'un enseignant enseigne dans cette classe
    const teacherSubjectsCount = useMemo(() => {
        const counts = {};
        const seen = new Set();
        cours.forEach(c => {
            if (c.enseignant_id && c.matiere_id) {
                const uniqueKey = `${c.enseignant_id}-${c.matiere_id}`;
                if (!seen.has(uniqueKey)) {
                    seen.add(uniqueKey);
                    counts[c.enseignant_id] = (counts[c.enseignant_id] || 0) + 1;
                }
            }
        });
        return counts;
    }, [cours]);

    // Stats pour la classe secondaire actuelle
    const stats = useMemo(() => {
        if (!isSecondaire) return { total: 0, assigned: 0, unassigned: 0, teachers: 0 };
        const total = matieres.length;
        let assigned = 0;
        const uniqueTeacherIds = new Set();

        matieres.forEach(m => {
            const assign = getAssignment(m.id);
            if (assign && assign.enseignant) {
                assigned++;
                uniqueTeacherIds.add(assign.enseignant_id);
            }
        });

        return {
            total,
            assigned,
            unassigned: Math.max(0, total - assigned),
            teachers: uniqueTeacherIds.size
        };
    }, [matieres, cours, selectedPeriode, isSecondaire]);

    // Filtrage des matières
    const filteredMatieres = useMemo(() => {
        return matieres.filter(m => {
            const matchesSearch = m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase()));

            const assign = getAssignment(m.id);
            const isAssigned = !!(assign && assign.enseignant);

            if (filterStatus === 'assigned' && !isAssigned) return false;
            if (filterStatus === 'unassigned' && isAssigned) return false;

            return matchesSearch;
        });
    }, [matieres, searchTerm, filterStatus, cours, selectedPeriode]);

    // --- Handlers ---
    const handleClassChange = (option) => {
        router.get(route('cours.index'), { classe_id: option.value }, { preserveState: false });
    };

    const handleAssign = (enseignantId, matiereId = null) => {
        if (!enseignantId || !classeActuelle) return;
        const coeffKey = matiereId || 'titulaire';
        const coeff = localCoefficients[coeffKey] || 1;

        setSavingMatiereId(coeffKey);

        router.post(route('cours.store'), {
            classe_id: classeActuelle.id,
            enseignant_id: enseignantId,
            matiere_id: matiereId,
            periode_id: isMaternelleOrPrimaire ? null : (selectedPeriode || null),
            coefficient: coeff
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingMatiereId(null);
            },
            onError: () => {
                setSavingMatiereId(null);
            }
        });
    };

    const handleSaveCoefficient = (matiereId = null) => {
        const assign = getAssignment(matiereId);
        if (!assign || !assign.enseignant_id) return;
        handleAssign(assign.enseignant_id, matiereId);
    };

    const handleRemove = (coursId) => {
        if (!coursId) return;
        if (confirm(t("confirm_remove_assignment", "Voulez-vous vraiment retirer l'affectation de cet enseignant pour cette matière ?"))) {
            router.delete(route('cours.destroy', coursId), {
                preserveScroll: true,
            });
        }
    };

    // --- Custom Teacher Select ---
    const TeacherSelect = ({ value, onChange, placeholder = "Sélectionner un enseignant..." }) => (
        <Select
            options={teacherOptions}
            value={teacherOptions.find(t => t.value === value) || null}
            onChange={onChange}
            placeholder={placeholder}
            className="text-sm"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={{
                control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? '#3B82F6' : '#E2E8F0',
                    borderRadius: '0.75rem',
                    minHeight: '42px',
                    backgroundColor: 'transparent',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                    cursor: 'pointer'
                }),
                menuPortal: base => ({ ...base, zIndex: 99999 }),
                menu: base => ({
                    ...base,
                    zIndex: 99999,
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#EFF6FF' : state.isFocused ? '#F8FAFC' : 'white',
                    color: '#1E293B',
                    cursor: 'pointer',
                    padding: '8px 12px'
                })
            }}
            filterOption={(option, inputValue) => {
                const label = option.data.label || '';
                const specialite = option.data.specialite || '';
                const search = inputValue.toLowerCase();
                return label.toLowerCase().includes(search) || specialite.toLowerCase().includes(search);
            }}
            getOptionLabel={(e) => e.label}
            formatOptionLabel={(e, { context }) => {
                if (context === 'value') {
                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {e.label.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">{e.label}</span>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-3 py-0.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-xs shrink-0 border border-blue-100">
                            {e.label.charAt(0)}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-slate-800 leading-tight truncate">{e.label}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                {e.specialite && (
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-100">
                                        {e.specialite}
                                    </span>
                                )}
                                {e.telephone && (
                                    <span className="text-[10px] text-slate-400">
                                        {e.telephone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );

    return (
        <DashboardLayout title={t("cours_management", "Affectation des Matières & Enseignants")}>
            <Head title="Affectations des Enseignants par Matière" />

            {/* HEADER HERO BANNER */}
            <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-6 md:p-8">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-32 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                            <GraduationCap className="w-4 h-4" />
                            Répartition Pédagogique
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Affectation des Matières par Classe
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                            Visualisez en temps réel les enseignants affectés à chaque matière, modifiez les assignations en 1 clic et gérez la pluridisciplinarité (un prof enseignant plusieurs matières dans la même classe).
                        </p>
                    </div>

                    {/* SELECTEUR DE CLASSE RAPIDE */}
                    <div className="w-full lg:w-96 flex flex-col gap-2.5 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <School className="w-4 h-4 text-blue-400" />
                            Classe active :
                        </label>
                        <Select
                            options={classOptions}
                            value={classOptions.find(c => c.value === classeActuelle?.id) || null}
                            onChange={handleClassChange}
                            placeholder="🔍 Choisir une classe..."
                            getOptionLabel={opt => opt.textLabel}
                            className="text-sm"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: '0.75rem',
                                    borderColor: '#3B82F6',
                                    borderWidth: '2px',
                                    backgroundColor: '#0F243E',
                                    color: '#FFFFFF',
                                    minHeight: '44px',
                                    cursor: 'pointer'
                                }),
                                singleValue: (base) => ({ ...base, color: '#FFFFFF', fontWeight: 'bold' }),
                                input: (base) => ({ ...base, color: '#FFFFFF' }),
                                menuPortal: base => ({ ...base, zIndex: 99999 }),
                                menu: base => ({ ...base, zIndex: 99999, borderRadius: '0.75rem' }),
                            }}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        />
                    </div>
                </div>
            </div>

            {!classeActuelle ? (
                /* EMPTY STATE: AUCUNE CLASSE */
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-dashed border-slate-200 dark:border-slate-800 text-center px-4">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 shadow-inner">
                        <School className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                        Veuillez sélectionner une classe
                    </h3>
                    <p className="text-slate-500 max-w-md text-sm mb-6">
                        Choisissez une classe dans le menu déroulant en haut pour visualiser l'ensemble des matières et configurer les affectations des professeurs.
                    </p>
                    <div className="w-full max-w-xs">
                        <Select
                            options={classOptions}
                            onChange={handleClassChange}
                            placeholder="👉 Sélectionner une classe..."
                            getOptionLabel={opt => opt.textLabel}
                            styles={{
                                control: (base) => ({ ...base, borderRadius: '0.75rem', padding: '4px', borderColor: '#3B82F6' })
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* INFO CLASSE SÉLECTIONNÉE */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3.5">
                            <div className={`p-3 rounded-2xl font-black text-lg ${isMaternelleOrPrimaire ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'}`}>
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                        Classe : {classeActuelle.nom}
                                    </h2>
                                    <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${isMaternelleOrPrimaire ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'}`}>
                                        Cycle {classeActuelle.type}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isMaternelleOrPrimaire
                                        ? "Enseignement global sous la responsabilité d'un enseignant titulaire."
                                        : "Enseignement par spécialité : un professeur par matière (la pluridisciplinarité est autorisée)."}
                                </p>
                            </div>
                        </div>

                        {/* FILTRE PAR PÉRIODE (SI SECONDAIRE) */}
                        {isSecondaire && filteredPeriodes.length > 0 && (
                            <div className="w-full md:w-64">
                                <Select
                                    options={periodeOptions}
                                    value={periodeOptions.find(p => p.value === selectedPeriode) || periodeOptions[0]}
                                    onChange={(opt) => setSelectedPeriode(opt.value)}
                                    placeholder="Période..."
                                    className="text-sm"
                                    styles={{
                                        control: (base) => ({ ...base, borderRadius: '0.75rem', borderColor: '#CBD5E1', minHeight: '40px' }),
                                        menuPortal: base => ({ ...base, zIndex: 99999 }),
                                    }}
                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                />
                            </div>
                        )}
                    </div>

                    {/* VUE MATERNELLE & PRIMAIRE */}
                    {isMaternelleOrPrimaire && (() => {
                        const assignedCourse = cours.find(c => c.is_titulaire || !c.matiere_id);
                        const assignedTeacher = assignedCourse?.enseignant;

                        return (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden max-w-3xl mx-auto">
                                <div className="p-6 md:p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-1">Responsabilité Pédagogique</div>
                                        <h3 className="text-2xl font-black">Maître / Maîtresse Titulaire</h3>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                        <School className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <div className="p-8">
                                    {assignedTeacher ? (
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-4">
                                                <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-black text-3xl border-2 border-emerald-200 shadow-lg">
                                                    {assignedTeacher.user?.nom?.charAt(0) || assignedTeacher.nom?.charAt(0)}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-full text-white border-2 border-white shadow">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            </div>

                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-200">
                                                <Check className="w-3.5 h-3.5" /> Enseignant en poste
                                            </span>

                                            <h4 className="text-2xl font-black text-slate-800 dark:text-white">
                                                {assignedTeacher.user ? `${assignedTeacher.user.nom} ${assignedTeacher.user.prenom}` : `${assignedTeacher.nom} ${assignedTeacher.prenom}`}
                                            </h4>

                                            {assignedTeacher.specialite && (
                                                <p className="text-sm font-bold text-slate-500 mt-1">
                                                    Spécialité : {assignedTeacher.specialite}
                                                </p>
                                            )}

                                            <div className="w-full max-w-md mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
                                                <div className="text-left">
                                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                                                        Changer d'enseignant titulaire :
                                                    </label>
                                                    <TeacherSelect
                                                        value={assignedTeacher.id}
                                                        onChange={(opt) => handleAssign(opt.value, null)}
                                                        placeholder="Choisir un autre enseignant..."
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(assignedCourse.id)}
                                                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-800/40"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Retirer le titulaire
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center py-6">
                                            <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mb-4 border-2 border-dashed border-amber-300">
                                                <User className="w-10 h-10" />
                                            </div>

                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2 border border-amber-200">
                                                <AlertCircle className="w-3.5 h-3.5" /> Poste Vacant
                                            </span>

                                            <h4 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                                                Aucun enseignant titulaire affecté
                                            </h4>
                                            <p className="text-slate-500 text-sm max-w-md mb-6">
                                                Assignez l'enseignant qui sera en charge de la classe pour toute l'année scolaire.
                                            </p>

                                            <div className="w-full max-w-md">
                                                <TeacherSelect
                                                    value={null}
                                                    onChange={(opt) => handleAssign(opt.value, null)}
                                                    placeholder="✨ Affecter un enseignant titulaire..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* VUE SECONDAIRE : MATIÈRES ET PROFS */}
                    {isSecondaire && (
                        <div className="space-y-6">
                            {/* KPI STATS CARDS */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">
                                            {stats.total}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Total Matières
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none mb-1">
                                            {stats.assigned} <span className="text-sm text-slate-400 font-normal">/ {stats.total}</span>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Matières Affectées
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-none mb-1">
                                            {stats.unassigned}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            En Attente de Prof
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400 leading-none mb-1">
                                            {stats.teachers}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Profs Mobilisés
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BARRE DE RECHERCHE ET FILTRES */}
                            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="relative flex-1">
                                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Filtrer une matière par nom..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFilterStatus('all')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filterStatus === 'all'
                                            ? 'bg-slate-800 text-white dark:bg-blue-600'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                    >
                                        Toutes ({matieres.length})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('assigned')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filterStatus === 'assigned'
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                    >
                                        Affectées ({stats.assigned})
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus('unassigned')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filterStatus === 'unassigned'
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            }`}
                                    >
                                        Vacantes ({stats.unassigned})
                                    </button>
                                </div>
                            </div>

                            {/* GRILLE DES MATIÈRES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredMatieres.map(matiere => {
                                    const assign = getAssignment(matiere.id);
                                    const assignedTeacher = assign?.enseignant;
                                    const isAssigned = !!assignedTeacher;
                                    const currentCoeff = localCoefficients[matiere.id] ?? assign?.coefficient ?? 1;
                                    const subjectsCountForTeacher = assignedTeacher ? (teacherSubjectsCount[assignedTeacher.id] || 0) : 0;

                                    return (
                                        <div
                                            key={matiere.id}
                                            className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all duration-200 shadow-sm flex flex-col justify-between ${isAssigned
                                                ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-emerald-500/5'
                                                : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400'
                                                }`}
                                        >
                                            <div>
                                                {/* ENTÊTE MATIÈRE */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 mr-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                                                                {matiere.nom}
                                                            </h3>
                                                        </div>
                                                        {matiere.code && (
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                                Code : {matiere.code}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* BADGE STATUT */}
                                                    {isAssigned ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 shrink-0">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            Affecté
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800 shrink-0 animate-pulse">
                                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                            Vacant
                                                        </span>
                                                    )}
                                                </div>

                                                {/* SECTION ENSEIGNANT ACTUEL OU ATTRIBUTION */}
                                                <div className="my-4">
                                                    {isAssigned ? (
                                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                                                                    {assignedTeacher.user?.nom?.charAt(0) || assignedTeacher.nom?.charAt(0)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-black text-slate-800 dark:text-slate-100 text-sm truncate">
                                                                        {assignedTeacher.user
                                                                            ? `${assignedTeacher.user.nom} ${assignedTeacher.user.prenom}`
                                                                            : `${assignedTeacher.nom} ${assignedTeacher.prenom}`}
                                                                    </p>
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                                        {assignedTeacher.specialite && (
                                                                            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                                                                                {assignedTeacher.specialite}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* INDICATION PLURIDISCIPLINARITÉ */}
                                                            {subjectsCountForTeacher > 1 && (
                                                                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                                                    <Layers className="w-3.5 h-3.5" />
                                                                    Enseigne {subjectsCountForTeacher} matières dans cette classe
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-dashed border-amber-200 dark:border-amber-800 text-center">
                                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
                                                                Sélectionnez le professeur responsable :
                                                            </p>
                                                            <TeacherSelect
                                                                value={null}
                                                                onChange={(opt) => handleAssign(opt.value, matiere.id)}
                                                                placeholder="✨ Affecter un enseignant..."
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ACTIONS & COEFFICIENT */}
                                            <div className="mt-3 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                                                {/* Ligne Coefficient & Changement rapide */}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                            Coeff :
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0.5"
                                                            step="0.5"
                                                            value={currentCoeff}
                                                            onChange={(e) => setLocalCoefficients({
                                                                ...localCoefficients,
                                                                [matiere.id]: e.target.value
                                                            })}
                                                            onBlur={() => isAssigned && handleSaveCoefficient(matiere.id)}
                                                            className="w-16 py-1 px-2 text-center font-black text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Si affecté : Bouton pour changer rapidement */}
                                                    {isAssigned && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleRemove(assign.id)}
                                                                title="Retirer cet enseignant de la matière"
                                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selecteur de remplacement si déjà affecté */}
                                                {isAssigned && (
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                                                            <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                                                            Remplacer / Changer :
                                                        </label>
                                                        <TeacherSelect
                                                            value={assignedTeacher.id}
                                                            onChange={(opt) => handleAssign(opt.value, matiere.id)}
                                                            placeholder="Changer d'enseignant..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredMatieres.length === 0 && (
                                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                        Aucune matière trouvée
                                    </h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Modifiez votre recherche ou les filtres pour afficher des matières.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
