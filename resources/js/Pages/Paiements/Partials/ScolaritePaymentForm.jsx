import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import useTranslation from "@/Hooks/useTranslation";
import Select from "react-select";
import { BookOpen, CalendarRange, Layers, Wallet, Calculator, Check, CheckCircle2, User } from "lucide-react";

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

    // Basculer automatiquement le mode selon le cycle de l'élève
    useEffect(() => {
        if (selectedStudent) {
            if (isSecondaire) {
                setPaymentPlanMode("tranche");
                setSelectedMonths([]);
            } else {
                setPaymentPlanMode("mensuel");
            }
        }
    }, [form.data.inscription_id, isSecondaire]);

    // Calculs financiers de scolarité
    const studentFinancials = (() => {
        if (!selectedStudent) return null;

        const classeId = selectedStudent.classe_id;
        const override = fraisClasses?.find(fc => String(fc.classe_id) === String(classeId));
        const feeType = tuitionFees.find(ft => String(ft.id) === String(form.data.frais_type_id)) || tuitionFees[0];
        
        const defaultMontant = isMaternelle
            ? 117000
            : (isCinquiemePrimaire
                ? 135000
                : (isPrimaire
                    ? 121500
                    : (isExamen ? 145000 : 135000)));

        const montantAnnuel = override ? parseFloat(override.montant) : (feeType ? parseFloat(feeType.montant) : defaultMontant);
        const totalDejaPaye = parseFloat(selectedStudent.total_scolarite_payee) || 0;
        const resteAPayer = Math.max(0, montantAnnuel - totalDejaPaye);
        
        // Mensualité : 13 000 F (Maternelle), 13 500 F (Primaire 1-4), 15 000 F (Primaire 5)
        const defaultMensuel = isMaternelle ? 13000 : (isCinquiemePrimaire ? 15000 : 13500);
        const montantMensuel = isMaternelleOrPrimaire ? (montantAnnuel > 0 ? Math.round(montantAnnuel / 9) : defaultMensuel) : Math.round(montantAnnuel / 9);

        // Tranches officielles
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
            const t1Amount = 70000;
            const t2Amount = isExamen ? 37500 : 32500;
            const t3Amount = isExamen ? 37500 : 32500;
            tranches = [
                { num: 1, nom: "1ère Tranche", montant: t1Amount, date_limite: "Septembre" },
                { num: 2, nom: "2ème Tranche", montant: t2Amount, date_limite: "Fin Novembre" },
                { num: 3, nom: "3ème Tranche", montant: t3Amount, date_limite: "Fin Janvier" },
            ];
        }

        const montantTrimestriel = tranches[0]?.montant || 70000;
        const pourcentage = montantAnnuel > 0 ? Math.min(100, Math.round((totalDejaPaye / montantAnnuel) * 100)) : 0;

        return {
            montantAnnuel,
            totalDejaPaye,
            resteAPayer,
            montantMensuel,
            montantTrimestriel,
            tranches,
            pourcentage,
            moisRegles: selectedStudent.mois_regles || []
        };
    })();

    // Synchronisation automatique des modes de règlement
    const handleSelectMonth = (month) => {
        let newMonths;
        if (selectedMonths.includes(month)) {
            newMonths = selectedMonths.filter(m => m !== month);
        } else {
            newMonths = [...selectedMonths, month];
        }
        setSelectedMonths(newMonths);

        if (studentFinancials) {
            const calculatedAmount = newMonths.length * studentFinancials.montantMensuel;
            form.setData({
                ...form.data,
                montant: calculatedAmount > 0 ? calculatedAmount : "",
                mois: newMonths.join(", "),
                commentaire: newMonths.length > 0 ? `Scolarité (${newMonths.join(", ")})` : ""
            });
        }
    };

    const handleSelectTranche = (tranche) => {
        form.setData({
            ...form.data,
            montant: tranche.montant,
            mois: tranche.nom,
            commentaire: `Règlement ${tranche.nom} Scolarité (Échéance ${tranche.date_limite})`
        });
    };

    const handleSelectTotal = () => {
        if (!studentFinancials) return;
        form.setData({
            ...form.data,
            montant: studentFinancials.resteAPayer,
            mois: "Année Complète (Solde)",
            commentaire: "Solde tout compte Scolarité Annuelle"
        });
    };

    const handleSelectMode = (mode) => {
        setPaymentPlanMode(mode);
        if (mode === "total") {
            handleSelectTotal();
        } else if (mode === "tranche" && studentFinancials?.tranches?.length > 0) {
            handleSelectTranche(studentFinancials.tranches[0]);
        } else if (mode === "libre") {
            form.setData({
                ...form.data,
                mois: "Acompte Libre",
                commentaire: "Acompte sur scolarité"
            });
        }
    };

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
                        <label className="block mb-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            Choisir l'Option de Règlement du Parent :
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Option 1: Mensuel (pour Maternelle/Primaire) OU Tranche (pour Secondaire) */}
                            {isMaternelleOrPrimaire ? (
                                <button
                                    type="button"
                                    onClick={() => handleSelectMode("mensuel")}
                                    className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                        paymentPlanMode === "mensuel"
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/30"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                    }`}
                                >
                                    <span className="flex items-center gap-1"><CalendarRange className="w-4 h-4" /> Par Mensualité</span>
                                    <span className="font-mono text-[11px] opacity-90">{studentFinancials.montantMensuel.toLocaleString('fr-FR')} FCFA / mois (9 mois)</span>
                                </button>
                            ) : (
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
                            )}

                            {/* Option 2: Solde Total */}
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

                            {/* Option 3: Montant Libre */}
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

                        {/* DETAIL DU MODE MENSUALITES (MATERNELLE & PRIMAIRE : 9 MOIS) */}
                        {paymentPlanMode === "mensuel" && isMaternelleOrPrimaire && (
                            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <CalendarRange className="w-4 h-4 text-emerald-600" />
                                        Maternelle & Primaire : Calendrier des 9 Mensualités
                                    </span>
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                                        {studentFinancials.montantMensuel.toLocaleString('fr-FR')} FCFA / mois
                                    </span>
                                </div>

                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2.5">
                                    Cochez le ou les mois réglés aujourd'hui :
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {schoolMonths.map((m) => {
                                        const isAlreadyPaid = studentFinancials.moisRegles.some(mr => mr.toLowerCase().includes(m.toLowerCase()));
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
