import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "@inertiajs/react";
import useTranslation from "@/Hooks/useTranslation";
import Select from "react-select";
import { CalendarRange, Layers, Wallet, Calculator, Check, CheckCircle2, User, BookOpen } from "lucide-react";

// --- CUSTOM STYLES FOR REACT-SELECT ---
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '46px',
        backgroundColor: state.isDisabled ? '#f8fafc' : '#ffffff',
        borderColor: state.isFocused ? '#10b981' : '#e2e8f0',
        borderRadius: '0.75rem',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#10b981' : '#cbd5e1'
        },
        padding: '2px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : null,
        color: state.isSelected ? 'white' : '#334155',
        cursor: 'pointer',
        fontWeight: state.isSelected ? '600' : '400',
        padding: '10px 14px',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#0f172a',
        fontWeight: '500'
    }),
    placeholder: (base) => ({
        ...base,
        color: '#94a3b8'
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        zIndex: 9999
    })
};

export default function ScolaritePaymentForm({ 
    paiement, 
    inscriptions = [], 
    classes = [], 
    fraisTypes = [], 
    fraisClasses = [], 
    onClose,
    preselectedInscriptionId = null,
    onSuccessCallback = null
}) {
    const { t } = useTranslation();
    const [selectedClasse, setSelectedClasse] = useState(() => {
        if (preselectedInscriptionId) {
            const found = inscriptions.find(i => String(i.id) === String(preselectedInscriptionId));
            return found ? String(found.classe_id) : "";
        }
        return "";
    });

    const [paymentPlanMode, setPaymentPlanMode] = useState("mensuel"); // "mensuel", "tranche", "total", "libre"
    const [selectedMonths, setSelectedMonths] = useState([]);

    const form = useForm({
        inscription_id: preselectedInscriptionId || paiement?.inscription_id || "",
        frais_type_id: paiement?.frais_type_id || (fraisTypes.find(ft => ft.is_scolarite)?.id || ""),
        montant: paiement?.montant || "",
        date_paiement: paiement?.date_paiement || new Date().toISOString().split("T")[0],
        mode_paiement: paiement?.mode_paiement || "especes",
        reference: paiement?.reference || "",
        mois: paiement?.mois || "",
        commentaire: paiement?.commentaire || "",
    });

    const tuitionFees = fraisTypes.filter(ft => ft.is_scolarite);

    // 9 mois scolaires officiels (Maternelle & Primaire)
    const schoolMonths = [
        "Septembre", "Octobre", "Novembre", "Décembre",
        "Janvier", "Février", "Mars", "Avril", "Mai"
    ];

    // Trouver l'inscription active et sa classe
    const selectedStudent = inscriptions.find(i => String(i.id) === String(form.data.inscription_id));
    const studentClasse = selectedStudent ? classes.find(c => String(c.id) === String(selectedStudent.classe_id)) : null;
    const isMaternelle = studentClasse ? (studentClasse.type === 'maternelle') : (selectedStudent?.classe_type === 'maternelle');
    const isPrimaire = studentClasse ? (studentClasse.type === 'primaire') : (selectedStudent?.classe_type === 'primaire');
    const isCinquiemePrimaire = isPrimaire && (
        studentClasse?.isCinquiemeAnneePrimaire ||
        ['5', 'cinquieme', 'cinquième', 'cm2'].some(k => (studentClasse?.nom || selectedStudent?.classe_nom)?.toLowerCase()?.includes(k))
    );
    const isMaternelleOrPrimaire = isMaternelle || isPrimaire;
    const isSecondaire = studentClasse ? (studentClasse.type === 'secondaire') : (selectedStudent?.is_secondaire || selectedStudent?.classe_type === 'secondaire');
    const isExamen = studentClasse ? (studentClasse.is_examen || ['3e', 'tle'].includes((studentClasse?.nom || selectedStudent?.classe_nom)?.toLowerCase()?.trim())) : false;

    // 3 Trimestres (3 mois chacun)
    const trimestres = useMemo(() => [
        { id: 'T1', num: 1, nom: '1er Trimestre', mois: ['Septembre', 'Octobre', 'Novembre'], label: 'Sept - Nov (3 mois)' },
        { id: 'T2', num: 2, nom: '2ème Trimestre', mois: ['Décembre', 'Janvier', 'Février'], label: 'Déc - Fév (3 mois)' },
        { id: 'T3', num: 3, nom: '3ème Trimestre', mois: ['Mars', 'Avril', 'Mai'], label: 'Mar - Mai (3 mois)' },
    ], []);

    // 2 Semestres (Observations 1 & 6)
    const semestres = useMemo(() => [
        { id: 'S1', num: 1, nom: '1er Semestre', mois: ['Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier'], label: 'Sept - Janv (5 mois)' },
        { id: 'S2', num: 2, nom: '2ème Semestre', mois: ['Février', 'Mars', 'Avril', 'Mai'], label: 'Fév - Mai (4 mois)' },
    ], []);

    // Calculs financiers de scolarité
    const studentFinancials = useMemo(() => {
        if (!selectedStudent) return null;

        const classeId = selectedStudent.classe_id;
        const override = fraisClasses?.find(fc => String(fc.classe_id) === String(classeId));
        
        let officialMonthly = 20000;
        if (studentClasse?.montant_mensuel_officiel) {
            officialMonthly = Number(studentClasse.montant_mensuel_officiel);
        } else if (override?.montant) {
            officialMonthly = Math.round(Number(override.montant) / 9);
        } else if (isPrimaire) {
            const nom = (studentClasse?.nom || selectedStudent?.classe_nom || '').toLowerCase();
            if (nom.includes('5') || nom.includes('cinquieme') || nom.includes('cm2')) {
                officialMonthly = 30000;
            } else if (nom.includes('4') || nom.includes('quatrieme')) {
                officialMonthly = 25000;
            } else {
                officialMonthly = 20000;
            }
        }

        const hasRemise = Boolean(selectedStudent?.has_remise);
        const remisePct = Number(selectedStudent?.remise_pourcentage || 0);
        const montantMensuel = (hasRemise && remisePct > 0)
            ? Math.round(officialMonthly * (1 - remisePct / 100))
            : officialMonthly;

        const montantAnnuel = override ? parseFloat(override.montant) : (montantMensuel * 9);
        const totalDejaPaye = parseFloat(selectedStudent.total_scolarite_payee) || 0;
        const resteAPayer = Math.max(0, montantAnnuel - totalDejaPaye);

        // Tranches officielles (Secondaire)
        const echeancesFromDb = override?.echeances || [];
        let tranches = [];
        if (echeancesFromDb.length === 3 && echeancesFromDb[0].type === 'tranche') {
            tranches = echeancesFromDb.map((e, idx) => ({
                id: e.id,
                num: idx + 1,
                nom: e.nom,
                montant: parseFloat(e.montant),
                date_limite: e.date_limite ? new Date(e.date_limite).toLocaleDateString('fr-FR') : (idx === 0 ? "Septembre" : idx === 1 ? "Fin Novembre" : "Fin Janvier")
            }));
        } else {
            const isReinscription = selectedStudent?.reinscription || selectedStudent?.is_reinscription;
            const t1Amount = isReinscription ? 65000 : 60000;
            const resteScolarite = Math.max(0, montantAnnuel - t1Amount);
            const t2Amount = Math.round(resteScolarite / 2);
            const t3Amount = resteScolarite - t2Amount;
            tranches = [
                { num: 1, nom: "1ère Tranche", montant: t1Amount, date_limite: "Septembre" },
                { num: 2, nom: "2ème Tranche", montant: t2Amount, date_limite: "Fin Novembre" },
                { num: 3, nom: "3ème Tranche", montant: t3Amount, date_limite: "Fin Janvier" },
            ];
        }

        const montantTrimestriel = montantMensuel * 3;
        const pourcentage = montantAnnuel > 0 ? Math.min(100, Math.round((totalDejaPaye / montantAnnuel) * 100)) : 0;

        return {
            montantAnnuel,
            totalDejaPaye,
            resteAPayer,
            officialMonthly,
            hasRemise,
            remisePct,
            montantMensuel,
            montantTrimestriel,
            tranches,
            pourcentage,
            moisRegles: selectedStudent.mois_regles || []
        };
    }, [selectedStudent, studentClasse, fraisClasses, isPrimaire]);

    // Helper : vérifier si un mois spécifique est déjà réglé
    const isMonthPaid = useCallback((monthName) => {
        if (!studentFinancials?.moisRegles || !Array.isArray(studentFinancials.moisRegles)) return false;
        const target = monthName.toLowerCase().trim();
        return studentFinancials.moisRegles.some(mr => {
            if (!mr) return false;
            const clean = String(mr).toLowerCase().trim();
            return clean === target || clean.includes(target);
        });
    }, [studentFinancials?.moisRegles]);

    // Action 1 : Sélectionner le mode MENSUEL (auto-coche le 1er mois impayé)
    const handleSelectMensuel = useCallback((customMonths = null) => {
        if (!studentFinancials) return;

        let targetMonths = [];
        if (customMonths && Array.isArray(customMonths)) {
            // Filtrer strictement pour ne jamais sélectionner de mois déjà payé
            targetMonths = customMonths.filter(m => !isMonthPaid(m));
        } else {
            // Sélectionner automatiquement le premier mois impayé
            const nextUnpaid = schoolMonths.find(m => !isMonthPaid(m));
            targetMonths = nextUnpaid ? [nextUnpaid] : [];
        }

        targetMonths.sort((a, b) => schoolMonths.indexOf(a) - schoolMonths.indexOf(b));
        setSelectedMonths(targetMonths);

        const calculatedAmount = targetMonths.length * studentFinancials.montantMensuel;
        const labelMois = targetMonths.join(", ");
        const comm = targetMonths.length > 0
            ? (targetMonths.length === 1 ? `Scolarité ${targetMonths[0]}` : `Scolarité (${labelMois})`)
            : "";

        form.setData(data => ({
            ...data,
            montant: calculatedAmount > 0 ? calculatedAmount : "",
            mois: labelMois,
            commentaire: comm
        }));
    }, [studentFinancials, isMonthPaid, schoolMonths]);

    // Action 2 : Clic/Bascule manuelle sur un mois dans la grille
    const handleSelectMonth = (month) => {
        if (!studentFinancials || isMonthPaid(month)) return; // Interdit de cocher un mois déjà soldé

        let newMonths;
        if (selectedMonths.includes(month)) {
            newMonths = selectedMonths.filter(m => m !== month);
        } else {
            newMonths = [...selectedMonths, month];
        }

        // Nettoyage strict anti-mois déjà payé
        newMonths = newMonths.filter(m => !isMonthPaid(m));
        newMonths.sort((a, b) => schoolMonths.indexOf(a) - schoolMonths.indexOf(b));

        setSelectedMonths(newMonths);

        const calculatedAmount = newMonths.length * studentFinancials.montantMensuel;
        const labelMois = newMonths.join(", ");
        const comm = newMonths.length > 0
            ? (newMonths.length === 1 ? `Scolarité ${newMonths[0]}` : `Scolarité (${labelMois})`)
            : "";

        form.setData(data => ({
            ...data,
            montant: calculatedAmount > 0 ? calculatedAmount : "",
            mois: labelMois,
            commentaire: comm
        }));
    };

    // Action 3 : Sélection d'un trimestre
    const handleSelectTrimestre = useCallback((t) => {
        if (!studentFinancials) return;
        const payableMonths = t.mois.filter(m => !isMonthPaid(m));
        setSelectedMonths(payableMonths);

        const calculatedAmount = payableMonths.length * studentFinancials.montantMensuel;
        const isFull = payableMonths.length === t.mois.length;
        const moisLabel = payableMonths.length === 0
            ? `${t.nom} (Soldé)`
            : isFull
            ? `${t.nom} (${t.mois.join(', ')})`
            : `${t.nom} (${payableMonths.join(', ')})`;

        const comm = payableMonths.length === 0
            ? `${t.nom} entièrement soldé`
            : isFull
            ? `Règlement ${t.nom} Scolarité (${t.mois.join(', ')})`
            : `Règlement ${t.nom} Scolarité (Reste : ${payableMonths.join(', ')})`;

        form.setData(data => ({
            ...data,
            montant: calculatedAmount > 0 ? calculatedAmount : "",
            mois: moisLabel,
            commentaire: comm,
        }));
    }, [studentFinancials, isMonthPaid]);

    // Action 4 : Sélection d'un semestre
    const handleSelectSemestre = useCallback((s) => {
        if (!studentFinancials) return;
        const payableMonths = s.mois.filter(m => !isMonthPaid(m));
        setSelectedMonths(payableMonths);

        const calculatedAmount = payableMonths.length * studentFinancials.montantMensuel;
        const isFull = payableMonths.length === s.mois.length;
        const moisLabel = payableMonths.length === 0
            ? `${s.nom} (Soldé)`
            : isFull
            ? `${s.nom} (${s.mois.join(', ')})`
            : `${s.nom} (${payableMonths.join(', ')})`;

        const comm = payableMonths.length === 0
            ? `${s.nom} entièrement soldé`
            : isFull
            ? `Règlement ${s.nom} Scolarité (${s.mois.join(', ')})`
            : `Règlement ${s.nom} Scolarité (Reste : ${payableMonths.join(', ')})`;

        form.setData(data => ({
            ...data,
            montant: calculatedAmount > 0 ? calculatedAmount : "",
            mois: moisLabel,
            commentaire: comm,
        }));
    }, [studentFinancials, isMonthPaid]);

    // Action 5 : Sélection d'une tranche (Secondaire)
    const handleSelectTranche = useCallback((tranche) => {
        form.setData(data => ({
            ...data,
            montant: tranche.montant,
            mois: tranche.nom,
            commentaire: `Règlement ${tranche.nom} Scolarité (Échéance ${tranche.date_limite})`
        }));
    }, []);

    // Action 6 : Solde Annuel
    const handleSelectTotal = useCallback(() => {
        if (!studentFinancials) return;
        const remainingUnpaid = schoolMonths.filter(m => !isMonthPaid(m));
        setSelectedMonths(remainingUnpaid);
        form.setData(data => ({
            ...data,
            montant: studentFinancials.resteAPayer,
            mois: "Année Complète (Solde)",
            commentaire: "Solde tout compte Scolarité Annuelle"
        }));
    }, [studentFinancials, schoolMonths, isMonthPaid]);

    // Action 7 : Acompte Libre
    const handleSelectLibre = useCallback(() => {
        setSelectedMonths([]);
        form.setData(data => ({
            ...data,
            montant: "",
            mois: "Acompte Libre",
            commentaire: "Acompte sur scolarité"
        }));
    }, []);

    // Action 8 : Basculer entre les modes de règlement globaux
    const handleSelectMode = (mode) => {
        setPaymentPlanMode(mode);
        if (mode === "mensuel") {
            handleSelectMensuel();
        } else if (mode === "trimestre") {
            const activeTrimestre = trimestres.find(t => t.mois.some(m => !isMonthPaid(m))) || trimestres[0];
            handleSelectTrimestre(activeTrimestre);
        } else if (mode === "semestre") {
            const activeSemestre = semestres.find(s => s.mois.some(m => !isMonthPaid(m))) || semestres[0];
            handleSelectSemestre(activeSemestre);
        } else if (mode === "total") {
            handleSelectTotal();
        } else if (mode === "tranche" && studentFinancials?.tranches?.length > 0) {
            const firstUnpaidTranche = studentFinancials.tranches.find(t => 
                !studentFinancials.moisRegles.some(mr => mr.toLowerCase().includes(t.nom.toLowerCase()))
            ) || studentFinancials.tranches[0];
            handleSelectTranche(firstUnpaidTranche);
        } else if (mode === "libre") {
            handleSelectLibre();
        }
    };

    // Initialisation et synchronisation automatique lors du chargement ou changement d'élève
    useEffect(() => {
        if (selectedStudent && studentFinancials) {
            if (isSecondaire) {
                setPaymentPlanMode("tranche");
                setSelectedMonths([]);
                const firstUnpaidTranche = studentFinancials.tranches.find(t => 
                    !studentFinancials.moisRegles.some(mr => mr.toLowerCase().includes(t.nom.toLowerCase()))
                ) || studentFinancials.tranches[0];
                if (firstUnpaidTranche) {
                    handleSelectTranche(firstUnpaidTranche);
                }
            } else {
                setPaymentPlanMode("mensuel");
                handleSelectMensuel();
            }
        }
    }, [form.data.inscription_id, selectedStudent?.id, Boolean(studentFinancials), isSecondaire]);

    const submit = (e) => {
        e.preventDefault();
        form.post(route("paiements.store"), {
            onSuccess: () => {
                onClose();
                form.reset();
                setSelectedMonths([]);
                if (onSuccessCallback) onSuccessCallback();
            },
            onError: () => { },
        });
    };

    const filteredInscriptions = selectedClasse
        ? inscriptions.filter(i => String(i.classe_id) === String(selectedClasse))
        : inscriptions;

    const inscriptionOptions = filteredInscriptions.map((i) => ({ 
        value: i.id, 
        label: `${i.eleve_nom_complet || i.label} ${i.matricule ? `(${i.matricule})` : ''} - ${i.classe_nom || ''}` 
    }));

    return (
        <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-8 border-emerald-500">
            {/* EN-TÊTE MODALE */}
            <div className="p-6 md:p-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            {t("tuition_payment_form", "Encaisser la Scolarité")}
                        </h2>
                        <p className="text-slate-500 font-medium text-xs">Paiement flexible : par mensualité, par tranche trimestrielle ou solde total.</p>
                    </div>
                </div>
            </div>

            {/* Formulaire complet */}
            <div className="p-6 md:p-8 form-scrollpane overflow-y-auto max-h-[75vh] space-y-6">
                
                {/* 1. SELECTION CLASSE & ELEVE (Si non pré-sélectionné) */}
                {preselectedInscriptionId && selectedStudent ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                                        Élève Sélectionné
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                                        {selectedStudent?.matricule}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                    {selectedStudent?.eleve_nom_complet}
                                </h4>
                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                    Classe : {selectedStudent?.classe_nom}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800/40 shadow-sm hidden sm:inline-block">
                            Dossier en direct
                        </span>
                    </div>
                ) : (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-slate-800 border border-emerald-100 dark:border-emerald-800/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">1</span>
                                    Filtrer par Classe
                                </label>
                                <select
                                    value={selectedClasse}
                                    onChange={(e) => {
                                        setSelectedClasse(e.target.value);
                                        form.setData("inscription_id", "");
                                    }}
                                    className="w-full border-white dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-sm"
                                >
                                    <option value="">-- Toutes les classes --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">2</span>
                                    Sélectionner l'Élève
                                </label>
                                <Select
                                    styles={{
                                        ...customSelectStyles,
                                        control: (base, state) => ({
                                            ...customSelectStyles.control(base, state),
                                            borderColor: state.isFocused ? '#10b981' : 'white',
                                            boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                        })
                                    }}
                                    options={inscriptionOptions}
                                    value={inscriptionOptions.find(opt => String(opt.value) === String(form.data.inscription_id))}
                                    onChange={(opt) => {
                                        form.setData("inscription_id", opt?.value || "");
                                        setSelectedMonths([]);
                                    }}
                                    placeholder="Rechercher par nom, prénom ou matricule..."
                                    isClearable
                                    classNamePrefix="react-select"
                                />
                                {form.errors.inscription_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.inscription_id}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. RECAPITULATIF FINANCIER EN TEMPS REEL DE L'ELEVE */}
                {studentFinancials && (
                    <div className="bg-[#0B1A2D] text-white p-5 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden shrink-0 min-h-fit">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        Dossier Scolarité En Direct
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white mt-1">{selectedStudent?.eleve_nom_complet}</h3>
                                <p className="text-xs text-slate-400">{selectedStudent?.classe_nom} • Matricule: {selectedStudent?.matricule || 'N/A'}</p>
                            </div>
                            <div className="text-left sm:text-right bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Reste à Solder</span>
                                <span className="text-2xl font-black text-rose-400 font-mono">
                                    {studentFinancials.resteAPayer.toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        </div>

                        {/* 4 KPIs Clés */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Dû</span>
                                <span className="text-sm font-black font-mono text-white">{studentFinancials.montantAnnuel.toLocaleString('fr-FR')} F</span>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Déjà Réglé</span>
                                <span className="text-sm font-black font-mono text-emerald-400">{studentFinancials.totalDejaPaye.toLocaleString('fr-FR')} F</span>
                            </div>
                            {isMaternelleOrPrimaire ? (
                                <>
                                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-[10px] uppercase font-bold text-blue-400 block">Tarif Mensuel</span>
                                        <span className="text-sm font-black font-mono text-blue-300">
                                            {studentFinancials.montantMensuel.toLocaleString('fr-FR')} F / mois
                                        </span>
                                    </div>
                                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-[10px] uppercase font-bold text-teal-400 block">Période</span>
                                        <span className="text-sm font-black text-teal-300">9 mois (Sept-Mai)</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-[10px] uppercase font-bold text-purple-400 block">Tranche 1 (Sept.)</span>
                                        <span className="text-sm font-black font-mono text-purple-300">70 000 F</span>
                                    </div>
                                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-[10px] uppercase font-bold text-purple-400 block">Tranches 2 & 3</span>
                                        <span className="text-sm font-black font-mono text-purple-300">
                                            {isExamen ? "37 500 F" : "32 500 F"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* JAUGE DE PROGRESSION VISUELLE */}
                        <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-300">Progression du règlement :</span>
                                <span className="font-black text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono shadow-sm">
                                    {studentFinancials.pourcentage}% Réglé
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700/80 p-0.5">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50"
                                    style={{ width: `${Math.max(studentFinancials.pourcentage > 0 ? 3 : 0, studentFinancials.pourcentage)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SELECTION DU MODE DE PAIEMENT SOUHAITE PAR LE PARENT */}
                {studentFinancials && (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Choisir l'Option de Règlement du Parent :
                            </label>
                            {studentFinancials.hasRemise && studentFinancials.remisePct > 0 && (
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-full">
                                    🏷️ Remise active : -{studentFinancials.remisePct}% ({studentFinancials.montantMensuel.toLocaleString('fr-FR')} F/mois au lieu de {studentFinancials.officialMonthly.toLocaleString('fr-FR')} F)
                                </span>
                            )}
                        </div>

                        {isMaternelleOrPrimaire ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                {/* Option 1: Mensuel */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("mensuel")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "mensuel"
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><CalendarRange className="w-3.5 h-3.5" /> Par Mois</span>
                                    <span className="font-mono text-[11px] opacity-90">{studentFinancials.montantMensuel.toLocaleString('fr-FR')} F / mois</span>
                                </button>

                                {/* Option 2: Trimestriel */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("trimestre")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "trimestre"
                                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 ring-2 ring-teal-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Trimestre</span>
                                    <span className="font-mono text-[11px] opacity-90">{(studentFinancials.montantMensuel * 3).toLocaleString('fr-FR')} F (3 mois)</span>
                                </button>

                                {/* Option 3: Semestriel */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("semestre")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "semestre"
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Semestre</span>
                                    <span className="font-mono text-[11px] opacity-90">S1 (5m) / S2 (4m)</span>
                                </button>

                                {/* Option 4: Solde Total */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("total")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "total"
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Solde Annuel</span>
                                    <span className="font-mono text-[11px] opacity-90">{studentFinancials.resteAPayer.toLocaleString('fr-FR')} F</span>
                                </button>

                                {/* Option 5: Montant Libre */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("libre")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "libre"
                                            ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 ring-2 ring-amber-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> Acompte Libre</span>
                                    <span className="font-mono text-[11px] opacity-90">Saisie échelon</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("tranche")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "tranche"
                                            ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 ring-2 ring-purple-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> Par Tranche</span>
                                    <span className="font-mono text-[11px] opacity-90">3 Tranches Officielles</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("total")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "total"
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> Solde Tout Compte</span>
                                    <span className="font-mono text-[11px] opacity-90">{studentFinancials.resteAPayer.toLocaleString('fr-FR')} FCFA</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("libre")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "libre"
                                            ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 ring-2 ring-amber-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><Calculator className="w-4 h-4" /> Acompte Libre</span>
                                    <span className="font-mono text-[11px] opacity-90">Saisie personnalisée</span>
                                </button>
                            </div>
                        )}

                        {/* DETAIL DU MODE MENSUALITES (9 MOIS : SEPTEMBRE A MAI) */}
                        {paymentPlanMode === "mensuel" && isMaternelleOrPrimaire && (
                            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <CalendarRange className="w-4 h-4 text-emerald-600" />
                                        Mois Scolaires (9 mois : Septembre à Mai • Règlements réguliers Octobre à Mai)
                                    </span>
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                                        {studentFinancials.montantMensuel.toLocaleString('fr-FR')} FCFA / mois (Échéance le 10)
                                    </span>
                                </div>

                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2.5">
                                    Cochez le ou les mois réglés aujourd'hui :
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {schoolMonths.map((m) => {
                                        const isAlreadyPaid = isMonthPaid(m);
                                        const isSelected = selectedMonths.includes(m);

                                        return (
                                            <button
                                                key={m}
                                                type="button"
                                                disabled={isAlreadyPaid}
                                                onClick={() => handleSelectMonth(m)}
                                                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                                                    isAlreadyPaid
                                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 opacity-80 cursor-not-allowed"
                                                        : isSelected
                                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                                }`}
                                            >
                                                <span>{m}</span>
                                                {isAlreadyPaid ? (
                                                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded-md">Payé</span>
                                                ) : isSelected ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* DETAIL DU MODE TRANCHES (SECONDAIRE : 3 TRANCHES OFFICIELLES) */}
                        {paymentPlanMode === "tranche" && isSecondaire && (
                            <div className="mt-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-purple-200/60 dark:border-purple-800/40">
                                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-purple-600" />
                                        Secondaire : Sélectionnez la tranche à encaisser
                                    </span>
                                    <span className="text-xs font-black text-purple-700 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1 rounded-lg">
                                        {isExamen ? "Barème Examen (145 000 F)" : "Barème Général (135 000 F)"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {studentFinancials.tranches.map((tranche) => {
                                        const isSelected = form.data.mois === tranche.nom;
                                        const isAlreadyPaid = studentFinancials.moisRegles.some(mr => mr.toLowerCase().includes(tranche.nom.toLowerCase()));

                                        return (
                                            <button
                                                key={tranche.nom}
                                                type="button"
                                                onClick={() => handleSelectTranche(tranche)}
                                                className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col gap-1.5 text-left transition-all ${
                                                    isSelected
                                                        ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/30 ring-2 ring-purple-400"
                                                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-purple-200 dark:border-purple-800 hover:border-purple-400"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black">{tranche.nom}</span>
                                                    {isAlreadyPaid && (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Soldée</span>
                                                    )}
                                                </div>
                                                <span className={`font-mono text-base font-black ${isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`}>
                                                    {tranche.montant.toLocaleString('fr-FR')} FCFA
                                                </span>
                                                <span className={`text-[11px] ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                                                    Échéance : {tranche.date_limite}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* DETAIL DU MODE TRIMESTRE */}
                        {paymentPlanMode === "trimestre" && isMaternelleOrPrimaire && (
                            <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-teal-200/60 dark:border-teal-800/40">
                                    <span className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-teal-600" />
                                        Règlement par Trimestre (3 mois par trimestre)
                                    </span>
                                    <span className="text-xs font-black text-teal-700 bg-teal-100 dark:bg-teal-900/40 px-2.5 py-1 rounded-lg">
                                        {(studentFinancials.montantMensuel * 3).toLocaleString('fr-FR')} FCFA / trimestre
                                    </span>
                                </div>
                                <p className="text-xs text-teal-800/80 dark:text-teal-300/80 mb-3">
                                    💡 <strong>Système de Relance :</strong> Pour un règlement trimestriel, le parent est couvert pour les 3 mois souscrits. La relance ne s'activera qu'à l'issue de cette période.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {trimestres.map((t) => {
                                        const isSelected = form.data.mois.includes(t.nom);
                                        const unpaidInTrimestre = t.mois.filter(m => !isMonthPaid(m));
                                        const allPaid = unpaidInTrimestre.length === 0;
                                        const amount = unpaidInTrimestre.length * studentFinancials.montantMensuel;

                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                disabled={allPaid}
                                                onClick={() => handleSelectTrimestre(t)}
                                                className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col gap-1.5 text-left transition-all ${
                                                    allPaid
                                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
                                                        : isSelected
                                                        ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/30 ring-2 ring-teal-400"
                                                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-teal-200 dark:border-teal-800 hover:border-teal-400"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black">{t.nom}</span>
                                                    {allPaid ? (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Soldé</span>
                                                    ) : unpaidInTrimestre.length < t.mois.length ? (
                                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Reste {unpaidInTrimestre.length} mois</span>
                                                    ) : null}
                                                </div>
                                                <span className={`font-mono text-base font-black ${isSelected ? 'text-white' : allPaid ? 'text-slate-400' : 'text-teal-700 dark:text-teal-300'}`}>
                                                    {amount.toLocaleString('fr-FR')} FCFA
                                                </span>
                                                <span className={`text-[11px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                                                    {allPaid ? "Tous les mois sont réglés" : `Mois : ${unpaidInTrimestre.join(', ')}`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* DETAIL DU MODE SEMESTRE (OBSERVATIONS 1 & 6) */}
                        {paymentPlanMode === "semestre" && isMaternelleOrPrimaire && (
                            <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-indigo-200/60 dark:border-indigo-800/40">
                                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-indigo-600" />
                                        Règlement par Semestre (S1 : 5 mois • S2 : 4 mois)
                                    </span>
                                    <span className="text-xs font-black text-indigo-700 bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 rounded-lg">
                                        Couverture semestrielle
                                    </span>
                                </div>
                                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mb-3">
                                    💡 <strong>Système de Relance :</strong> Le parent qui règle par semestre est couvert pour l'ensemble des mois du semestre. La relance ne s'activera qu'à l'issue des mois souscrits.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {semestres.map((s) => {
                                        const isSelected = form.data.mois.includes(s.nom);
                                        const unpaidInSemestre = s.mois.filter(m => !isMonthPaid(m));
                                        const allPaid = unpaidInSemestre.length === 0;
                                        const amount = unpaidInSemestre.length * studentFinancials.montantMensuel;

                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                disabled={allPaid}
                                                onClick={() => handleSelectSemestre(s)}
                                                className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col gap-1.5 text-left transition-all ${
                                                    allPaid
                                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed"
                                                        : isSelected
                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400"
                                                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black">{s.nom} ({s.label})</span>
                                                    {allPaid ? (
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Soldé</span>
                                                    ) : unpaidInSemestre.length < s.mois.length ? (
                                                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Reste {unpaidInSemestre.length} mois</span>
                                                    ) : null}
                                                </div>
                                                <span className={`font-mono text-base font-black ${isSelected ? 'text-white' : allPaid ? 'text-slate-400' : 'text-indigo-700 dark:text-indigo-300'}`}>
                                                    {amount.toLocaleString('fr-FR')} FCFA
                                                </span>
                                                <span className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                    {allPaid ? "Tous les mois sont réglés" : `Mois couverts : ${unpaidInSemestre.join(', ')}`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        </div>
                    )}

                {/* 4. MONTANT FINAL & MODE DE REGLEMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Montant à Encaisser (FCFA)
                        </label>
                        <div className="relative border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-1 bg-emerald-50/50 dark:bg-emerald-900/10">
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-full border-none bg-transparent p-3 pl-14 rounded-xl text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 focus:ring-0 text-right font-mono"
                                value={form.data.montant}
                                onChange={(e) => form.setData("montant", e.target.value)}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                FCFA
                            </span>
                        </div>
                        {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.montant}</p>}
                    </div>

                    <div className="md:col-span-1">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Mode de Paiement
                        </label>
                        <select
                            value={form.data.mode_paiement}
                            onChange={(e) => form.setData("mode_paiement", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm text-sm font-bold"
                        >
                            <option value="especes">💵 Espèces (Au Guichet)</option>
                            <option value="mobile">📱 Mobile Money (Airtel / Moov)</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Libellé ou Observation
                        </label>
                        <input
                            type="text"
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm text-sm"
                            value={form.data.commentaire}
                            onChange={(e) => form.setData("commentaire", e.target.value)}
                            placeholder="Libellé imprimé sur le reçu (ex: Scolarité Octobre 2026)..."
                        />
                    </div>
                </div>

                <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                        {t("cancel", "Annuler")}
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.inscription_id || !form.data.montant}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 text-sm"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {t("save_tuition", "Valider et Générer le Reçu")}
                    </button>
                </div>
            </div>
        </form>
    );
}
