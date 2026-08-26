import { useState, useEffect } from "react";
import { useForm, usePage, router, Link, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Select from "react-select";
import Modal from "@/Components/Modal";
import { Wallet, Search, Filter, Plus, Printer, Trash2, Calendar, User, BookOpen, Layers, CheckCircle2, Calculator, CalendarRange, Check, DollarSign, Clock, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

// --- CUSTOM STYLES FOR REACT-SELECT ---
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '46px',
        backgroundColor: state.isDisabled ? '#f8fafc' : '#ffffff',
        borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
        borderRadius: '0.75rem',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
        },
        padding: '2px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : null,
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

function StandardPaymentForm({ paiement, inscriptions, fraisTypes, onClose }) {
    const { t } = useTranslation();
    const otherFees = fraisTypes.filter(ft => !ft.is_scolarite);

    const form = useForm({
        inscription_id: paiement?.inscription_id || "",
        frais_type_id: paiement?.frais_type_id || (otherFees[0]?.id || ""),
        montant: paiement?.montant || (otherFees[0]?.montant || ""),
        mode_paiement: paiement?.mode_paiement || "especes",
        commentaire: paiement?.commentaire || "",
    });

    useEffect(() => {
        if (form.data.frais_type_id) {
            const feeType = otherFees.find(ft => ft.id == form.data.frais_type_id);
            if (feeType) {
                form.setData("montant", feeType.montant);
            }
        }
    }, [form.data.frais_type_id]);

    const submit = (e) => {
        e.preventDefault();
        form.post(route("paiements.store"), {
            onSuccess: () => {
                onClose();
                form.reset();
            },
            onError: () => { },
        });
    };

    const inscriptionOptions = inscriptions.map((i) => ({ value: i.id, label: i.label }));

    return (
        <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-8 border-blue-600">
            {/* EN-TÊTE MODALE */}
            <div className="p-6 md:p-8 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800">
                        <Layers className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            {t("standard_payment_form", "Encaissement des Frais Annexes")}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">Frais ponctuels, inscription, examens, etc.</p>
                    </div>
                </div>
            </div>

            {/* Formulaire complet */}
            <div className="p-6 md:p-8 flex flex-col form-scrollpane overflow-y-auto max-h-[75vh] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            {t("student", "Élève concerné")}
                        </label>
                        <Select
                            styles={customSelectStyles}
                            options={inscriptionOptions}
                            value={inscriptionOptions.find(opt => opt.value === form.data.inscription_id)}
                            onChange={(opt) => form.setData("inscription_id", opt?.value || "")}
                            placeholder="Rechercher un élève par nom, prénom..."
                            isClearable
                            classNamePrefix="react-select"
                        />
                        {form.errors.inscription_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.inscription_id}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("fee_type", "Type de Frais")}</label>
                        <select
                            value={form.data.frais_type_id}
                            onChange={(e) => form.setData("frais_type_id", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm font-medium"
                        >
                            <option value="">-- Sélectionner un type de frais --</option>
                            {otherFees.map((ft) => (
                                <option key={ft.id} value={ft.id}>{ft.nom}</option>
                            ))}
                        </select>
                        {form.errors.frais_type_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.frais_type_id}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("amount", "Montant (FCFA)")}</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm font-black text-xl text-blue-600 font-mono"
                            value={form.data.montant}
                            onChange={(e) => form.setData("montant", e.target.value)}
                        />
                        {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.montant}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("mode_payment", "Mode de Règlement")}</label>
                        <select
                            value={form.data.mode_paiement}
                            onChange={(e) => form.setData("mode_paiement", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm font-medium"
                        >
                            <option value="especes">💵 Espèces (Au Guichet)</option>
                            <option value="mobile">📱 Mobile Money (Airtel / Moov)</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Commentaire / Observation</label>
                        <input
                            type="text"
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-sm"
                            value={form.data.commentaire}
                            onChange={(e) => form.setData("commentaire", e.target.value)}
                            placeholder="Observation ou précision sur le versement..."
                        />
                    </div>
                </div>

                <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {t("cancel", "Annuler")}
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.inscription_id || !form.data.montant}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {t("save_payment", "Valider l'Encaissement")}
                    </button>
                </div>
            </div>
        </form>
    );
}

function ScolaritePaymentForm({ paiement, inscriptions, classes, fraisTypes, fraisClasses, onClose }) {
    const { t } = useTranslation();
    const [selectedClasse, setSelectedClasse] = useState("");
    const [paymentPlanMode, setPaymentPlanMode] = useState("mensuel"); // "mensuel", "tranche", "total", "libre"
    const [monthlyPeriod, setMonthlyPeriod] = useState(10); // 8: Sept-Avril, 9: Sept-Mai, 10: Sept-Juin
    const [selectedMonths, setSelectedMonths] = useState([]);

    const form = useForm({
        inscription_id: paiement?.inscription_id || "",
        frais_type_id: paiement?.frais_type_id || (fraisTypes.find(ft => ft.is_scolarite)?.id || ""),
        montant: paiement?.montant || "",
        date_paiement: paiement?.date_paiement || new Date().toISOString().split("T")[0],
        mode_paiement: paiement?.mode_paiement || "especes",
        reference: paiement?.reference || "",
        mois: paiement?.mois || "",
        commentaire: paiement?.commentaire || "",
    });

    const tuitionFees = fraisTypes.filter(ft => ft.is_scolarite);
    
    // Mois de l'année scolaire gabonaise selon la base choisie (8, 9 ou 10 mois)
    const allSchoolMonths = [
        "Septembre", "Octobre", "Novembre", "Décembre",
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"
    ];
    const schoolMonths = allSchoolMonths.slice(0, monthlyPeriod);

    // Trouver l'inscription active
    const selectedStudent = inscriptions.find(i => String(i.id) === String(form.data.inscription_id));

    // Calculs financiers de scolarité
    const studentFinancials = (() => {
        if (!selectedStudent) return null;

        const classeId = selectedStudent.classe_id;
        const override = fraisClasses?.find(fc => String(fc.classe_id) === String(classeId));
        const feeType = tuitionFees.find(ft => String(ft.id) === String(form.data.frais_type_id)) || tuitionFees[0];
        
        const montantAnnuel = override ? parseFloat(override.montant) : (feeType ? parseFloat(feeType.montant) : 0);
        const totalDejaPaye = parseFloat(selectedStudent.total_scolarite_payee) || 0;
        const resteAPayer = Math.max(0, montantAnnuel - totalDejaPaye);
        const montantMensuel = montantAnnuel > 0 ? Math.round(montantAnnuel / monthlyPeriod) : 0;
        const montantTrimestriel = montantAnnuel > 0 ? Math.round(montantAnnuel / 3) : 0;
        const pourcentage = montantAnnuel > 0 ? Math.min(100, Math.round((totalDejaPaye / montantAnnuel) * 100)) : 0;

        return {
            montantAnnuel,
            totalDejaPaye,
            resteAPayer,
            montantMensuel,
            montantTrimestriel,
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

    const handleSelectTranche = (numTranche) => {
        if (!studentFinancials) return;
        const label = numTranche === 1 ? "1ère Tranche" : numTranche === 2 ? "2ème Tranche" : "3ème Tranche";
        form.setData({
            ...form.data,
            montant: studentFinancials.montantTrimestriel,
            mois: `Trimestre ${numTranche}`,
            commentaire: `Règlement ${label} Scolarité`
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
        } else if (mode === "tranche") {
            handleSelectTranche(1);
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
            <div className="p-6 md:p-8 flex flex-col form-scrollpane overflow-y-auto max-h-[75vh] space-y-6">
                
                {/* 1. SELECTION CLASSE & ELEVE */}
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

                {/* 2. RECAPITULATIF FINANCIER EN TEMPS REEL DE L'ELEVE */}
                {studentFinancials && (
                    <div className="bg-[#0B1A2D] text-white p-5 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
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
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-blue-400 block">Mensualité Ref.</span>
                                <span className="text-sm font-black font-mono text-blue-300">{studentFinancials.montantMensuel.toLocaleString('fr-FR')} F</span>
                            </div>
                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase font-bold text-purple-400 block">Tranche Ref.</span>
                                <span className="text-sm font-black font-mono text-purple-300">{studentFinancials.montantTrimestriel.toLocaleString('fr-FR')} F</span>
                            </div>
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleSelectMode("mensuel")}
                                className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col justify-between gap-1 text-xs ${
                                    paymentPlanMode === "mensuel"
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/30"
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                                }`}
                            >
                                <span className="flex items-center gap-1"><CalendarRange className="w-4 h-4" /> Par Mois</span>
                                <span className="font-mono text-[11px] opacity-90">{studentFinancials.montantMensuel.toLocaleString('fr-FR')} F/mois</span>
                            </button>

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
                                <span className="font-mono text-[11px] opacity-90">{studentFinancials.montantTrimestriel.toLocaleString('fr-FR')} F/trim</span>
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
                                <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> Solde Total</span>
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
                                <span className="flex items-center gap-1"><Calculator className="w-4 h-4" /> Montant Libre</span>
                                <span className="font-mono text-[11px] opacity-90">Acompte</span>
                            </button>
                        </div>

                        {/* DETAIL DU MODE MENSUALITES : GRILLE DES MOIS (8, 9 ou 10 mois) */}
                        {paymentPlanMode === "mensuel" && (
                            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                
                                {/* Sélecteur de période scolaire */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <CalendarRange className="w-4 h-4 text-emerald-600" />
                                        Base de l'année scolaire :
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 dark:bg-slate-900/60 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => { setMonthlyPeriod(8); setSelectedMonths([]); }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                monthlyPeriod === 8
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            Sept. à Avril (8 mois)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setMonthlyPeriod(9); setSelectedMonths([]); }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                monthlyPeriod === 9
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            Sept. à Mai (9 mois)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setMonthlyPeriod(10); setSelectedMonths([]); }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                monthlyPeriod === 10
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                            }`}
                                        >
                                            Sept. à Juin (10 mois)
                                        </button>
                                    </div>
                                </div>

                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2.5">
                                    Cochez le ou les mois réglés aujourd'hui ({studentFinancials.montantMensuel.toLocaleString('fr-FR')} FCFA / mois) :
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                                    {schoolMonths.map(m => {
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

                        {/* DETAIL DU MODE TRANCHES */}
                        {paymentPlanMode === "tranche" && (
                            <div className="mt-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block mb-2.5">
                                    Sélectionnez la tranche trimestrielle à encaisser ({studentFinancials.montantTrimestriel.toLocaleString('fr-FR')} FCFA) :
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[1, 2, 3].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => handleSelectTranche(num)}
                                            className={`p-3 rounded-xl border font-bold text-xs flex flex-col gap-1 text-center transition-all ${
                                                form.data.mois === `Trimestre ${num}`
                                                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/30"
                                                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-purple-200 dark:border-purple-800 hover:border-purple-400"
                                            }`}
                                        >
                                            <span className="text-sm font-black">{num === 1 ? "1ère Tranche" : num === 2 ? "2ème Tranche" : "3ème Tranche"}</span>
                                            <span className="font-mono text-xs opacity-90">{studentFinancials.montantTrimestriel.toLocaleString('fr-FR')} FCFA</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. MONTANT FINAL & MODE DE REGLEMENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Montant à Encaisser (FCFA)
                        </label>
                        <div className="relative border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-1 bg-emerald-50/50 dark:bg-emerald-900/10">
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="w-full border-none bg-transparent p-3.5 pl-14 rounded-xl text-3xl font-black text-emerald-700 dark:text-emerald-400 focus:ring-0 text-right font-mono"
                                value={form.data.montant}
                                onChange={(e) => form.setData("montant", e.target.value)}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-sm bg-emerald-100 dark:bg-emerald-800/40 px-2 py-1 rounded-lg">
                                FCFA
                            </span>
                        </div>
                        {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5 text-right">{form.errors.montant}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Mode de Règlement</label>
                        <select
                            value={form.data.mode_paiement}
                            onChange={(e) => form.setData("mode_paiement", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm text-sm font-bold"
                        >
                            <option value="especes">💵 Espèces (Au Guichet)</option>
                            <option value="mobile">📱 Mobile Money (Airtel / Moov)</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Libellé / Note sur le Reçu</label>
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

export default function Index({ paiements, stats, annees, currentAnneeId, inscriptions, classes, fraisTypes, fraisClasses, filters, auth }) {
    const { t } = useTranslation();
    const { etablissement } = usePage().props;

    const [search, setSearch] = useState(filters.search || "");
    const [selectedAnnee, setSelectedAnnee] = useState(filters.annee_scolaire_id || currentAnneeId);
    const [selectedMode, setSelectedMode] = useState(filters.mode_paiement || "");
    const [filterClasse, setFilterClasse] = useState(filters.classe_id || "");
    const [dateDebut, setDateDebut] = useState(filters.date_debut || "");
    const [dateFin, setDateFin] = useState(filters.date_fin || "");
    const [activeTab, setActiveTab] = useState("all"); // 'all' | 'scolarite' | 'general'

    const [generalModalOpen, setGeneralModalOpen] = useState(false);
    const [scolariteModalOpen, setScolariteModalOpen] = useState(false);

    const permissions = auth?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    // Synchronisation des filtres avec Inertia
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route("paiements.index"),
                {
                    search,
                    annee_scolaire_id: selectedAnnee,
                    mode_paiement: selectedMode || undefined,
                    classe_id: filterClasse || undefined,
                    date_debut: dateDebut || undefined,
                    date_fin: dateFin || undefined,
                },
                { preserveState: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, selectedAnnee, selectedMode, filterClasse, dateDebut, dateFin]);

    const handleQuickDate = (type) => {
        const today = new Date().toISOString().split("T")[0];
        if (type === "today") {
            setDateDebut(today);
            setDateFin(today);
        } else if (type === "month") {
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
            setDateDebut(firstDay);
            setDateFin(today);
        } else if (type === "reset") {
            setDateDebut("");
            setDateFin("");
            setSelectedMode("");
            setFilterClasse("");
            setSearch("");
        }
    };

    const destroy = (id) => {
        if (!confirm(t("confirm_delete_paiement", "⚠️ Supprimer cet encaissement ? Cela mettra à jour le solde comptable de l'élève."))) return;
        router.delete(route("paiements.destroy", id), {
            onError: () => toast.error(t("delete_failed", "Échec de suppression")),
        });
    };

    const handlePrintJournal = () => {
        window.print();
    };

    const formatFCFA = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';

    // Filtrage local pour les onglets
    const displayedPaiements = (paiements.data || []).filter(p => {
        if (activeTab === 'all') return true;
        const isSco = fraisTypes.find(ft => ft.id === p.frais_type_id)?.is_scolarite;
        return activeTab === 'general' ? !isSco : isSco;
    });

    const isFiltered = Boolean(selectedMode || filterClasse || dateDebut || dateFin || search);

    return (
        <DashboardLayout title={t("caisse_management", "Journal de Caisse")}>
            <Head title="Journal de Caisse & Encaissements" />

            {/* STYLES D'IMPRESSION DU JOURNAL DE CAISSE */}
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 10mm; }
                    body { background: white !important; font-size: 11px; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #cbd5e1 !important; padding: 6px 8px !important; }
                }
                .print-only { display: none; }
            `}</style>

            {/* EN-TÊTE D'IMPRESSION (VISIBLE SEULEMENT SUR PAPIER / PDF) */}
            <div className="print-only mb-6 border-b-2 border-slate-800 pb-4 text-black">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-black uppercase">{etablissement?.nom || 'Établissement Scolaire'}</h1>
                        <p className="text-xs text-slate-600">{[etablissement?.adresse, etablissement?.telephone, etablissement?.email].filter(Boolean).join(' • ')}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 border border-slate-300 inline-block">
                            JOURNAL DES ENCAISSEMENTS
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">Édité le : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-6 text-xs bg-slate-50 p-2 border border-slate-200">
                    <span><strong>Année :</strong> {annees.find(a => a.id === selectedAnnee)?.nom || 'En cours'}</span>
                    {dateDebut && <span><strong>Période du :</strong> {dateDebut} {dateFin ? `au ${dateFin}` : ''}</span>}
                    {selectedMode && <span><strong>Mode :</strong> {selectedMode.toUpperCase()}</span>}
                    <span><strong>Total Encaissé Sélection :</strong> {formatFCFA(stats?.total_filtre || stats?.total_annee)}</span>
                </div>
            </div>

            {/* HEROBANNER INTERACTIF */}
            <div className="bg-gradient-to-r from-[#0B1A2D] via-[#10233B] to-slate-900 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20 no-print border border-slate-800">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="p-4 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-inner">
                            <Wallet className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {t("journal_caisse", "Journal de Caisse")}
                                </h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {stats?.nb_transactions || 0} règlements
                                </span>
                            </div>
                            <p className="text-slate-300 font-medium text-sm mt-1">
                                Suivi financier en direct, clôtures de caisse et audit des règlements.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={handlePrintJournal}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold border border-white/20 shadow-sm transition-all active:scale-95 text-sm"
                            title="Imprimer le bordereau de caisse"
                        >
                            <Printer className="w-4 h-4 text-emerald-300" />
                            <span>Imprimer le Journal</span>
                        </button>

                        <button
                            onClick={() => setGeneralModalOpen(true)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Paiement Général</span>
                        </button>

                        <button
                            onClick={() => setScolariteModalOpen(true)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Encaisser Scolarité</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* CARTES DE SYNTHÈSE FINANCIÈRE (KPIs Caisse) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 no-print">
                {/* 1. Recettes Totales */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Recettes Année
                        </span>
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatFCFA(stats?.total_annee)}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {stats?.nb_transactions || 0} encaissements validés
                    </div>
                </div>

                {/* 2. Caisse du Jour */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Caisse Aujourd'hui
                            </span>
                            {stats?.total_today > 0 && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {formatFCFA(stats?.total_today)}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Total encaissé ce jour
                    </div>
                </div>

                {/* 3. Espèces Physiques en Coffre */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Espèces (Cash)
                        </span>
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-sm">
                            💵
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatFCFA(stats?.total_especes)}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {stats?.total_annee > 0 ? `${Math.round((stats.total_especes / stats.total_annee) * 100)}% des versements` : '0%'}
                    </div>
                </div>

                {/* 4. Mobile Money & Banque */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Mobile Money & Banque
                        </span>
                        <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-sm">
                            📱
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatFCFA((stats?.total_mobile || 0) + (stats?.total_banque || 0))}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Mobile: {formatFCFA(stats?.total_mobile)}
                    </div>
                </div>
            </div>

            {/* TOOLBAR DES ONGLETS & FILTRES AVANCÉS */}
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 no-print space-y-4">
                
                {/* Ligne 1 : Onglets et Année Scolaire */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-x-auto hide-scrollbar border border-slate-200/80 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'all'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <span>Tous les flux</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold">
                                {paiements.total || 0}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('scolarite')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'scolarite'
                                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <span>Scolarités & Échéances</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'general'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span>Frais Généraux / Divers</span>
                        </button>
                    </div>

                    {/* Sélecteur Année Scolaire & Raccourcis Dates */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <select
                                value={selectedAnnee}
                                onChange={(e) => setSelectedAnnee(e.target.value)}
                                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 pl-4 pr-10 rounded-xl font-bold text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                {annees.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        Année {a.nom} {a.en_cours ? "⭐️" : ""}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => handleQuickDate("today")}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${dateDebut === new Date().toISOString().split("T")[0] && dateFin === new Date().toISOString().split("T")[0]
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            Aujourd'hui
                        </button>

                        <button
                            onClick={() => handleQuickDate("month")}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
                        >
                            Ce mois
                        </button>

                        {isFiltered && (
                            <button
                                onClick={() => handleQuickDate("reset")}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                title="Réinitialiser tous les filtres"
                            >
                                ✕ Effacer
                            </button>
                        )}
                    </div>
                </div>

                {/* Ligne 2 : Filtres Détaillés (Recherche, Classe, Mode, Dates) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {/* Recherche */}
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("search_paiement", "Élève, Matricule, Réf...")}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 pl-9 pr-3 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    {/* Mode de règlement */}
                    <div>
                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-3 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                        >
                            <option value="">-- Tous les modes --</option>
                            <option value="especes">💵 Espèces</option>
                            <option value="mobile">📱 Mobile Money</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    {/* Classe */}
                    <div>
                        <select
                            value={filterClasse}
                            onChange={(e) => setFilterClasse(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-3 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                        >
                            <option value="">-- Toutes les classes --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date précise */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2 px-2.5 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                            title="Filtrer par date"
                        />
                    </div>
                </div>

                {/* Bannière récapitulative du filtre actif */}
                {isFiltered && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex flex-wrap items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                            <span>🔍 Résultat du filtre :</span>
                            <span className="font-extrabold">{stats?.count_filtre || displayedPaiements.length} transaction(s)</span>
                        </div>
                        <div>
                            <span>Total Encaissé : </span>
                            <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                                {formatFCFA(stats?.total_filtre)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS DE SAISIE */}
            <Modal show={generalModalOpen} onClose={() => setGeneralModalOpen(false)} maxWidth="4xl">
                <StandardPaymentForm
                    inscriptions={inscriptions}
                    fraisTypes={fraisTypes}
                    onClose={() => setGeneralModalOpen(false)}
                />
            </Modal>

            <Modal show={scolariteModalOpen} onClose={() => setScolariteModalOpen(false)} maxWidth="4xl">
                <ScolaritePaymentForm
                    inscriptions={inscriptions}
                    classes={classes}
                    fraisTypes={fraisTypes}
                    fraisClasses={fraisClasses}
                    onClose={() => setScolariteModalOpen(false)}
                />
            </Modal>

            {/* TABLEAU PRINCIPAL DU JOURNAL DE CAISSE */}
            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0B1A2D] text-slate-300 uppercase text-[10px] font-black tracking-wider">
                            <tr>
                                <th className="p-4 sm:p-5 font-semibold rounded-tl-3xl">{t("date", "Date & Heure")}</th>
                                <th className="p-4 sm:p-5 font-semibold text-white">{t("student", "Élève (Débiteur)")}</th>
                                <th className="p-4 sm:p-5 font-semibold">{t("frais_type", "Motif / Période")}</th>
                                <th className="p-4 sm:p-5 font-semibold">{t("mode", "Règlement")}</th>
                                <th className="p-4 sm:p-5 font-semibold">{t("cashier", "Encaissé par")}</th>
                                <th className="p-4 sm:p-5 font-semibold text-right text-white">{t("amount", "Montant")}</th>
                                <th className="p-4 sm:p-5 font-semibold text-center rounded-tr-3xl no-print">{t("actions", "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {displayedPaiements.length > 0 ? (
                                displayedPaiements.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group text-xs sm:text-sm">
                                        
                                        {/* Date */}
                                        <td className="p-4 sm:p-5 whitespace-nowrap">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">
                                                {new Date(p.date_paiement).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] font-medium text-slate-400">
                                                {p.created_at ? new Date(p.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </td>

                                        {/* Élève & Classe */}
                                        <td className="p-4 sm:p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 shrink-0 text-xs border border-slate-200 dark:border-slate-600">
                                                    {(p.inscription?.eleve?.user?.nom || "?")[0]}
                                                    {(p.inscription?.eleve?.user?.prenom || "?")[0]}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 dark:text-white uppercase truncate">
                                                        {p.inscription?.eleve?.user?.nom} {p.inscription?.eleve?.user?.prenom}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                                                            {p.inscription?.classe?.nom || 'N/A'}
                                                        </span>
                                                        {p.inscription?.eleve?.matricule && (
                                                            <span className="text-[10px] font-mono text-slate-400">
                                                                {p.inscription.eleve.matricule}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Motif & Période */}
                                        <td className="p-4 sm:p-5">
                                            <div>
                                                <span className={`font-bold inline-block text-xs px-2.5 py-1 rounded-lg border ${p.frais_type?.is_scolarite
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                }`}>
                                                    {p.frais_type?.nom || "Frais"}
                                                </span>
                                                {p.mois && (
                                                    <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span>Mois : {p.mois}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Mode de règlement */}
                                        <td className="p-4 sm:p-5 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border
                                                ${p.mode_paiement === 'especes' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                                                    p.mode_paiement === 'mobile' ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' :
                                                        'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'}`}>
                                                {p.mode_paiement === 'especes' && '💵'}
                                                {p.mode_paiement === 'mobile' && '📱'}
                                                {(p.mode_paiement === 'virement' || p.mode_paiement === 'cheque') && '🏦'}
                                                <span>{p.mode_paiement}</span>
                                            </span>
                                        </td>

                                        {/* Encaissé par (Caissier) */}
                                        <td className="p-4 sm:p-5">
                                            {p.user ? (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                        {(p.user.nom || 'A')[0]}
                                                    </span>
                                                    <span>{p.user.nom} {p.user.prenom ? p.user.prenom[0] + '.' : ''}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Caisse Principale</span>
                                            )}
                                        </td>

                                        {/* Montant */}
                                        <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                                            <div className="font-black text-base text-emerald-600 dark:text-emerald-400 font-mono">
                                                {Number(p.montant).toLocaleString('fr-FR')} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 sm:p-5 text-center no-print">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <a
                                                    href={route('paiements.recu', p.id)}
                                                    target="_blank"
                                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition-all shadow-sm"
                                                    title="Imprimer le Reçu Officiel"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </a>

                                                {can('supprimer_paiements') && (
                                                    <button
                                                        onClick={() => destroy(p.id)}
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-400 rounded-xl transition-all shadow-sm"
                                                        title={t("delete", "Supprimer")}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                                                <Wallet className="w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="font-bold text-base text-slate-700 dark:text-slate-300">
                                                {t("no_payments", "Aucun encaissement trouvé.")}
                                            </p>
                                            <p className="text-xs mt-1 text-slate-400">
                                                Modifiez vos filtres ou enregistrez un nouveau paiement.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PIED DU TABLEAU : TOTAL ENCAISSÉ DE LA SÉLECTION */}
                {displayedPaiements.length > 0 && (
                    <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs font-semibold text-slate-300">
                            Page {paiements.current_page || 1} sur {paiements.last_page || 1} • {paiements.total || displayedPaiements.length} transaction(s) au total
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Encaissé (Sélection) :</span>
                            <span className="text-xl font-black font-mono text-emerald-400">
                                {formatFCFA(stats?.total_filtre || stats?.total_annee)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {paiements.links && paiements.links.length > 3 && (
                <div className="mt-8 flex flex-wrap gap-2 justify-center no-print">
                    {paiements.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            preserveScroll
                            preserveState
                            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${link.active
                                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* ZONE DE SIGNATURE POUR IMPRESSION DU BORDEREAU */}
            <div className="print-only mt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                    <p className="font-bold mb-12">Le Caissier / L'Opérateur</p>
                    <div className="border-b border-dotted border-slate-500 w-3/4 mx-auto"></div>
                </div>
                <div>
                    <p className="font-bold mb-12">Le Chef Comptable</p>
                    <div className="border-b border-dotted border-slate-500 w-3/4 mx-auto"></div>
                </div>
                <div>
                    <p className="font-bold mb-12">Le Chef d'Établissement</p>
                    <div className="border-b border-dotted border-slate-500 w-3/4 mx-auto"></div>
                </div>
            </div>

        </DashboardLayout>
    );
}
