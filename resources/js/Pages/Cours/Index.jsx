import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import { BookOpen, User, School, CheckCircle, AlertCircle, Trash2, GraduationCap, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import useTranslation from "@/Hooks/useTranslation";

export default function Index({ cours = [], classes = [], enseignants = [], matieres = [], periodes = [], classeActuelle = null, filters }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const [selectedPeriode, setSelectedPeriode] = useState('');
    const [localCoefficients, setLocalCoefficients] = useState({});

    // Initialize local coefficients from existing assignments
    useEffect(() => {
        const initialCoeffs = {};
        cours.forEach(c => {
            initialCoeffs[c.matiere_id || 'titulaire'] = c.coefficient;
        });
        setLocalCoefficients(initialCoeffs);
    }, [cours]);

    // --- Options Helper ---
    const classOptions = useMemo(() => classes.map(c => ({
        value: c.id,
        label: (
            <div className="flex justify-between items-center w-full">
                <span className="font-bold text-gray-800">{c.nom}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${['maternelle', 'primaire'].includes(c.type)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-indigo-100 text-indigo-700'
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
        { value: '', label: t("whole_year", "Toute l'année") },
        ...filteredPeriodes.map(p => ({ value: p.id, label: p.nom }))
    ], [filteredPeriodes, t]);

    const teacherOptions = useMemo(() => enseignants.map(t => ({
        value: t.id,
        label: t.nom_complet,
        specialite: t.specialite,
        data: t // Keep full object for custom filtering
    })), [enseignants]);

    // --- Logic Helpers ---
    const isMaternelleOrPrimaire = ['maternelle', 'primaire'].includes(classeActuelle?.type);
    const isSecondaire = classeActuelle?.type === 'secondaire';

    const getAssignment = (matiereId = null) => {
        const targetPeriodeId = selectedPeriode ? parseInt(selectedPeriode) : null;
        return cours.find(c => c.matiere_id === matiereId && c.periode_id === targetPeriodeId);
    };

    const getAssignedTeacherId = (matiereId = null) => {
        const assignment = getAssignment(matiereId);
        return assignment ? assignment.enseignant_id : null;
    };

    const getAssignmentId = (matiereId = null) => {
        const assignment = getAssignment(matiereId);
        return assignment ? assignment.id : null;
    };

    // Helper pour savoir s'il existe une affectation conflictuelle "Toute l'année" quand on est sur une période !
    const hasFullYearConflict = (matiereId = null) => {
        if (!selectedPeriode) return false;
        return cours.some(c => c.matiere_id === matiereId && c.periode_id === null);
    };

    // --- Handlers ---
    const handleClassChange = (option) => {
        router.get(route('cours.index'), { classe_id: option.value }, { preserveState: true });
    };

    const handleAssign = (enseignantId, matiereId = null) => {
        const coeffKey = matiereId || 'titulaire';
        router.post(route('cours.store'), {
            classe_id: classeActuelle.id,
            enseignant_id: enseignantId,
            matiere_id: matiereId,
            periode_id: isMaternelleOrPrimaire ? null : (selectedPeriode || null),
            coefficient: localCoefficients[coeffKey] || 1
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Affectation enregistrée !')
        });
    };

    const handleRemove = (id) => {
        if (confirm('Voulez-vous vraiment retirer cet enseignant ?')) {
            router.delete(route('cours.destroy', id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Affectation retirée.')
            });
        }
    };

    // --- Component: TeacherSelect (Select2 Style) ---
    const TeacherSelect = ({ value, onChange, placeholder = t('select_placeholder', "Sélectionner...") }) => (
        <Select
            options={teacherOptions}
            value={teacherOptions.find(t => t.value === value)}
            onChange={onChange}
            placeholder={placeholder}
            className="text-sm"
            menuPortalTarget={document.body}
            styles={{
                control: (base) => ({ ...base, borderColor: '#e5e7eb', borderRadius: '0.5rem', minHeight: '38px', cursor: 'pointer' }),
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 100 }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f3f4f6' : 'white',
                    color: '#1f2937',
                    cursor: 'pointer'
                })
            }}
            filterOption={(option, inputValue) => {
                const { label } = option.data; // Access label directly from the option object
                const { specialite } = option.data;
                const search = inputValue.toLowerCase();
                return (
                    (label && label.toLowerCase().includes(search)) ||
                    (specialite && specialite.toLowerCase().includes(search))
                );
            }}
            getOptionLabel={(e) => e.label}
            formatOptionLabel={(e, { context }) => {
                // VALUE VIEW (Closed Select)
                if (context === 'value') {
                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold border border-blue-200">
                                {e.label.charAt(0)}
                            </div>
                            <span className="text-gray-900 font-medium">{e.label}</span>
                        </div>
                    );
                }

                // MENU VIEW (Open Dropdown)
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs text-blue-600 font-bold border border-blue-100">
                            {e.label.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 leading-tight">{e.label}</span>
                            {e.specialite && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full w-fit mt-0.5 font-medium border border-emerald-100">
                                    {e.specialite}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );

    return (
        <DashboardLayout title={t("cours_management", "Gestion des Cours")}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <School className="w-8 h-8 text-blue-600" />
                        {t("cours_assignments", "Gestion des Affectations")}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {t("cours_assignments_desc", "Attribuez les enseignants aux classes selon le cycle scolaire.")}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {classeActuelle && isSecondaire && (
                        <div className="w-full md:w-56">
                            <Select
                                options={periodeOptions}
                                value={periodeOptions.find(p => p.value == selectedPeriode)}
                                onChange={(opt) => setSelectedPeriode(opt.value)}
                                placeholder={t("select_period_placeholder", "📅 Période...")}
                                getOptionLabel={opt => opt.label}
                                styles={{
                                    control: (base) => ({ ...base, borderRadius: '0.75rem', padding: '4px', borderColor: '#e5e7eb', borderWidth: '2px' })
                                }}
                            />
                        </div>
                    )}
                    <div className="w-full md:w-80">
                        <Select
                            options={classOptions}
                            value={classOptions.find(c => c.value == filters.classe_id)}
                            onChange={handleClassChange}
                            placeholder={t("select_class_placeholder", "🔍 Choisir une classe...")}
                            getOptionLabel={opt => opt.label}
                            styles={{
                                control: (base) => ({ ...base, borderRadius: '0.75rem', padding: '4px', borderColor: '#3b82f6', borderWidth: '2px' })
                            }}
                        />
                    </div>
                </div>
            </div>

            {!classeActuelle ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-dashed border-gray-300">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                        <Users className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">{t("no_class_selected", "Aucune classe sélectionnée")}</h3>
                    <p className="text-gray-500 text-center max-w-md mt-2">
                        {t("please_select_class", "Veuillez sélectionner une classe en haut à droite.")}
                    </p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Header Info */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 border-l-4 ${isMaternelleOrPrimaire ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-indigo-50 border-indigo-500 text-indigo-900'}`}>
                        <div className="p-2 bg-white rounded-full shadow-sm">
                            {isMaternelleOrPrimaire ? <GraduationCap className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">{isMaternelleOrPrimaire ? t("cycle_primary", "Cycle Maternelle & Primaire") : t("cycle_secondary", "Cycle Secondaire")}</h2>
                            <p className="text-sm opacity-80">
                                {isMaternelleOrPrimaire
                                    ? t("cycle_primary_desc", "Assignez un enseignant titulaire unique pour cette classe.")
                                    : t("cycle_secondary_desc", "Assignez un enseignant distinct pour chaque matière.")
                                }
                            </p>
                        </div>
                    </div>

                    {/* VIEW: MATERNELLE / PRIMAIRE */}
                    {isMaternelleOrPrimaire && (() => {
                        const assignedTeacherId = getAssignedTeacherId(null);
                        const assignedTeacher = enseignants.find(e => e.id === assignedTeacherId);

                        return (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <School className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        {t("titular_teacher", "Enseignant Titulaire")}
                                    </h3>
                                    <div className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                                        {t("titular_role", "Responsable de classe")}
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col items-center">
                                    {assignedTeacher ? (
                                        <div className="w-full flex flex-col items-center text-center animate-fade-in">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4 border-4 border-white shadow-md relative z-10">
                                                    <User className="w-10 h-10 text-green-600" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white z-20 shadow-sm">
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </div>
                                            </div>

                                            <h4 className="text-2xl font-bold border-b-2 border-green-200 pb-2 mb-2 dark:text-white">
                                                {assignedTeacher.nom_complet || `${assignedTeacher.prenom} ${assignedTeacher.nom}`}
                                            </h4>

                                            {assignedTeacher.specialite && (
                                                <p className="text-gray-500 mb-6 font-medium bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded-full text-sm">
                                                    {assignedTeacher.specialite}
                                                </p>
                                            )}

                                            <div className="w-full max-w-sm mt-4 grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-left">
                                                        {t("change_titular", "Enseignant")}
                                                    </label>
                                                    <TeacherSelect
                                                        value={assignedTeacherId}
                                                        onChange={(opt) => handleAssign(opt.value, null)}
                                                        placeholder={t("search_teacher", "🔍...")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-left">
                                                        Coeff.
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={localCoefficients['titulaire'] || 1}
                                                        onChange={(e) => setLocalCoefficients({...localCoefficients, titulaire: e.target.value})}
                                                        onBlur={() => assignedTeacherId && handleAssign(assignedTeacherId, null)}
                                                        className="w-full border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(getAssignmentId(null))}
                                                className="mt-6 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 font-medium transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" /> {t("remove_assignment", "Retirer de ce poste")}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full flex flex-col items-center text-center">
                                            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all hover:bg-gray-100 hover:border-gray-400">
                                                <User className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                {t("no_titular_assigned", "Aucun titulaire assigné")}
                                            </h4>
                                            <p className="text-gray-500 text-sm mb-6 max-w-sm">
                                                {t("select_titular_desc", "Veuillez sélectionner un enseignant pour prendre la responsabilité de cette classe pour toute l'année.")}
                                            </p>

                                            <div className="w-full max-w-sm bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2 border border-blue-100 dark:border-blue-800/50">
                                                <TeacherSelect
                                                    value={null}
                                                    onChange={(opt) => handleAssign(opt.value, null)}
                                                    placeholder={t("search_teacher_assign", "✨ Affecter un enseignant...")}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* VIEW: SECONDAIRE */}
                    {isSecondaire && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {matieres.map(matiere => {
                                const assignedId = getAssignedTeacherId(matiere.id);
                                const assignmentId = getAssignmentId(matiere.id);
                                const isAssigned = !!assignedId;

                                return (
                                    <div key={matiere.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all hover:shadow-md ${isAssigned ? 'border-green-200' : 'border-gray-200'}`}>
                                        <div className={`h-1.5 w-full rounded-t-xl ${isAssigned ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-lg font-bold text-gray-800 dark:text-white truncate" title={matiere.nom}>
                                                    {matiere.nom}
                                                </h4>
                                                {isAssigned ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-gray-300" />}
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <div className="flex-1">
                                                    {hasFullYearConflict(matiere.id) && !isAssigned ? (
                                                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 text-center">
                                                            {t("assigned_whole_year", "Affecté toute l'année.")}
                                                        </div>
                                                    ) : (
                                                        <TeacherSelect
                                                            value={assignedId}
                                                            onChange={(opt) => handleAssign(opt.value, matiere.id)}
                                                            placeholder={t("assign", "Enseignant...")}
                                                        />
                                                    )}
                                                </div>
                                                <div className="w-16">
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        step="0.5"
                                                        placeholder="Coeff"
                                                        title="Coefficient"
                                                        className="w-full border-gray-200 rounded-lg text-xs py-2 pr-1 focus:ring-blue-500 focus:border-blue-500"
                                                        value={localCoefficients[matiere.id] || 1}
                                                        onChange={(e) => setLocalCoefficients({...localCoefficients, [matiere.id]: e.target.value})}
                                                        onBlur={() => assignedId && handleAssign(assignedId, matiere.id)}
                                                    />
                                                </div>
                                            </div>

                                            {isAssigned && (
                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        onClick={() => handleRemove(assignmentId)}
                                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> {t("remove", "Retirer")}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
