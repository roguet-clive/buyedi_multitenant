import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Select from "react-select";
import Modal from "@/Components/Modal";
import { Wallet, Search, Filter, Plus, Printer, Trash2, Calendar, User, BookOpen, Layers, CheckCircle2 } from "lucide-react";

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
        border: '1px solid #e2e8f0'
    })
};


function PaiementForm({ paiement, inscriptions, classes, fraisTypes, onClose }) {
    const { t } = useTranslation();
    const [selectedClasse, setSelectedClasse] = useState("");

    const form = useForm({
        inscription_id: paiement?.inscription_id || "",
        frais_type_id: paiement?.frais_type_id || "",
        montant: paiement?.montant || "",
        date_paiement: paiement?.date_paiement || new Date().toISOString().split("T")[0],
        mode_paiement: paiement?.mode_paiement || "especes",
        reference: paiement?.reference || "",
        mois: paiement?.mois || "",
        commentaire: paiement?.commentaire || "",
    });

    const submit = (e) => {
        e.preventDefault();
        if (paiement) {
            toast.error(t("edit_not_supported", "Modification directe non supportée"));
        } else {
            form.post(route("paiements.store"), {
                onSuccess: () => {
                    onClose();
                    form.reset();
                },
                onError: () => { },
            });
        }
    };

    const filteredInscriptions = selectedClasse
        ? inscriptions.filter(i => i.classe_id == selectedClasse)
        : inscriptions;

    const inscriptionOptions = filteredInscriptions.map((i) => ({ value: i.id, label: `${i.label} - ${i.classe?.nom || ''}` }));

    return (
        <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-8 border-blue-500">
            {/* EN-TÊTE MODALE */}
            <div className="p-6 md:p-8 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            {t("new_payment", "Nouveau Paiement Général")}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">Saisie d'un encaissement tiers ou frais divers.</p>
                    </div>
                </div>
            </div>

            {/* Formulaire complet */}
            <div className="p-6 md:p-8 flex flex-col form-scrollpane overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {/* Identifier section */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <Layers className="w-4 h-4 text-slate-400" />
                                Filtrer par Classe
                            </label>
                            <select
                                value={selectedClasse}
                                onChange={(e) => setSelectedClasse(e.target.value)}
                                className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                            >
                                <option value="">-- Toutes les classes --</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                <User className="w-4 h-4 text-blue-500" />
                                {t("student", "Élève (Débiteur)")}
                            </label>
                            <Select
                                styles={customSelectStyles}
                                options={inscriptionOptions}
                                value={inscriptionOptions.find(opt => opt.value === form.data.inscription_id)}
                                onChange={(opt) => form.setData("inscription_id", opt?.value || "")}
                                placeholder={selectedClasse ? "Rechercher un élève..." : "Sélectionnez une classe d'abord..."}
                                isClearable
                                isDisabled={!selectedClasse && !paiement}
                                classNamePrefix="react-select"
                            />
                            {form.errors.inscription_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.inscription_id}</p>}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("frais_type", "Libellé / Motif")}</label>
                        <select
                            value={form.data.frais_type_id}
                            onChange={(e) => form.setData("frais_type_id", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                        >
                            <option value="">-- Choisir le motif --</option>
                            {fraisTypes.filter(ft => !ft.is_scolarite).map((ft) => (
                                <option key={ft.id} value={ft.id}>{ft.nom}</option>
                            ))}
                        </select>
                        {form.errors.frais_type_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.frais_type_id}</p>}
                    </div>

                    <div className="relative">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("amount", "Montant versé")}</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border-slate-200 dark:border-slate-700 p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold text-lg text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                                value={form.data.montant}
                                onChange={(e) => form.setData("montant", e.target.value)}
                                placeholder="0.00"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">XOF</span>
                        </div>
                        {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.montant}</p>}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {t("date", "Date de paiement")}
                        </label>
                        <input
                            type="date"
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                            value={form.data.date_paiement}
                            onChange={(e) => form.setData("date_paiement", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("mode_payment", "Mode de Règlement")}</label>
                        <select
                            value={form.data.mode_paiement}
                            onChange={(e) => form.setData("mode_paiement", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm font-medium"
                        >
                            <option value="especes">💵 Espèces</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="mobile">📱 Mobile Money</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("reference", "Référence Transaction (Optionnel)")}</label>
                        <input
                            type="text"
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                            value={form.data.reference}
                            onChange={(e) => form.setData("reference", e.target.value)}
                            placeholder="N° de chèque, ID Mobile Money, etc."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("comment", "Notes / Commentaire")}</label>
                        <textarea
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm min-h-[100px]"
                            value={form.data.commentaire}
                            onChange={(e) => form.setData("commentaire", e.target.value)}
                            placeholder="Détails supplémentaires..."
                        ></textarea>
                    </div>
                </div>

                <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {t("cancel", "Annuler")}
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {t("save", "Valider l'Encaissement")}
                    </button>
                </div>
            </div>
        </form>
    );
}

function ScolaritePaymentForm({ paiement, inscriptions, classes, fraisTypes, fraisClasses, onClose }) {
    const { t } = useTranslation();
    const [selectedClasse, setSelectedClasse] = useState("");

    const form = useForm({
        inscription_id: paiement?.inscription_id || "",
        frais_type_id: paiement?.frais_type_id || "",
        montant: paiement?.montant || "",
        date_paiement: paiement?.date_paiement || new Date().toISOString().split("T")[0],
        mode_paiement: paiement?.mode_paiement || "especes",
        reference: paiement?.reference || "",
        mois: paiement?.mois || new Date().toLocaleString('default', { month: 'long' }),
        commentaire: paiement?.commentaire || "",
    });

    const tuitionFees = fraisTypes.filter(ft => ft.is_scolarite);
    const months = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    useEffect(() => {
        if (form.data.inscription_id && form.data.frais_type_id) {
            const student = inscriptions.find(i => i.id === form.data.inscription_id);
            if (student && student.classe_id) {
                const override = fraisClasses?.find(fc =>
                    fc.classe_id == student.classe_id &&
                    fc.frais_type_id == form.data.frais_type_id
                );
                const feeType = tuitionFees.find(ft => ft.id == form.data.frais_type_id);
                const amount = override ? override.montant : (feeType ? feeType.montant : 0);
                form.setData("montant", amount);
            }
        }
    }, [form.data.inscription_id, form.data.frais_type_id]);

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

    const filteredInscriptions = selectedClasse
        ? inscriptions.filter(i => i.classe_id == selectedClasse)
        : inscriptions;

    const inscriptionOptions = filteredInscriptions.map((i) => ({ value: i.id, label: `${i.label} - ${i.classe?.nom || ''}` }));

    return (
        <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-8 border-emerald-500">
            {/* EN-TÊTE MODALE */}
            <div className="p-6 md:p-8 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                            {t("tuition_payment_form", "Encaisser Scolarité")}
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">Le montant requis est prérempli automatiquement.</p>
                    </div>
                </div>
            </div>

            {/* Formulaire complet */}
            <div className="p-6 md:p-8 flex flex-col form-scrollpane overflow-y-auto max-h-[75vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {/* Identifier section STEP FORMAT */}
                    <div className="md:col-span-2 relative p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-900/10 dark:to-slate-800 border border-emerald-100 dark:border-emerald-800/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">1</span>
                                    Choisir la Classe
                                </label>
                                <select
                                    value={selectedClasse}
                                    onChange={(e) => setSelectedClasse(e.target.value)}
                                    className="w-full border-white dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">-- Sélectionner une classe --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">2</span>
                                    Choisir l'Élève
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
                                    value={inscriptionOptions.find(opt => opt.value === form.data.inscription_id)}
                                    onChange={(opt) => form.setData("inscription_id", opt?.value || "")}
                                    placeholder={selectedClasse ? "Sélectionner l'élève..." : "En attente de classe..."}
                                    isClearable
                                    isDisabled={!selectedClasse && !paiement}
                                    classNamePrefix="react-select"
                                />
                                {form.errors.inscription_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.inscription_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Pricing settings */}
                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("tuition_type", "Type de Frais")}</label>
                        <select
                            value={form.data.frais_type_id}
                            onChange={(e) => form.setData("frais_type_id", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm font-bold"
                        >
                            <option value="">-- Tarif applicable --</option>
                            {tuitionFees.map((ft) => (
                                <option key={ft.id} value={ft.id}>{ft.nom}</option>
                            ))}
                        </select>
                        {form.errors.frais_type_id && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.frais_type_id}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("month_paid", "Mois Concerné")}</label>
                        <select
                            value={form.data.mois}
                            onChange={(e) => form.setData("mois", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                        >
                            <option value="">-- Aucun mois / Année complète --</option>
                            {months.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        {form.errors.mois && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.mois}</p>}
                    </div>

                    <div className="md:col-span-2 relative mt-4">
                        <label className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-2 text-sm font-black text-emerald-600 z-10">{t("amount_due_monthly", "MONTANT REQUIS")}</label>
                        <div className="relative border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-1 bg-emerald-50/50 dark:bg-emerald-900/10">
                            <input
                                type="number"
                                className="w-full border-none bg-transparent p-4 pl-12 rounded-xl text-3xl font-black text-emerald-700 dark:text-emerald-400 focus:ring-0 text-right"
                                value={form.data.montant}
                                onChange={(e) => form.setData("montant", e.target.value)}
                            />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600/50 font-black text-2xl">XOF</span>
                        </div>
                        {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5 text-right">{form.errors.montant}</p>}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {t("date", "Date de paiement")}
                        </label>
                        <input
                            type="date"
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                            value={form.data.date_paiement}
                            onChange={(e) => form.setData("date_paiement", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("mode_payment", "Mode de Règlement")}</label>
                        <select
                            value={form.data.mode_paiement}
                            onChange={(e) => form.setData("mode_paiement", e.target.value)}
                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm font-medium"
                        >
                            <option value="especes">💵 Espèces</option>
                            <option value="virement">🏦 Virement Bancaire</option>
                            <option value="mobile">📱 Mobile Money</option>
                            <option value="cheque">📝 Chèque</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Notes &amp; Référence</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                className="flex-1 border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                value={form.data.reference}
                                onChange={(e) => form.setData("reference", e.target.value)}
                                placeholder="N° Réf Transaction..."
                            />
                            <input
                                type="text"
                                className="flex-[2] border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                value={form.data.commentaire}
                                onChange={(e) => form.setData("commentaire", e.target.value)}
                                placeholder="Commentaire exceptionnel..."
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {t("cancel", "Annuler")}
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-70"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        {t("save_tuition", "Valider l'Encaissement")}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function Index({ paiements, annees, currentAnneeId, inscriptions, classes, fraisTypes, fraisClasses, filters, auth }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters.search || "");
    const [selectedAnnee, setSelectedAnnee] = useState(currentAnneeId);
    const [activeTab, setActiveTab] = useState("general"); // 'general' | 'scolarite'

    // Manage separated modals to avoid conflicts in states if needed
    const [generalModalOpen, setGeneralModalOpen] = useState(false);
    const [scolariteModalOpen, setScolariteModalOpen] = useState(false);

    const permissions = auth?.permissions || [];
    const can = (permission) => permissions.includes(permission);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route("paiements.index"),
                { search, annee_scolaire_id: selectedAnnee },
                { preserveState: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, selectedAnnee]);

    const destroy = (id) => {
        if (!confirm(t("confirm_delete_paiement", "⚠️ Supprimer cet encaissement ? Cela mettra à jour le solde comptable de l'élève."))) return;
        router.delete(route("paiements.destroy", id), {
            onSuccess: () => { },
            onError: () => toast.error(t("delete_failed", "Échec de suppression")),
        });
    };

    return (
        <DashboardLayout title={t("caisse_management", "Journal de Caisse")}>

            {/* HEROBANNER */}
            <div className="bg-[#0B1A2D] rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                            <Wallet className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                                {t("journal_caisse", "Journal des Encaissements")}
                            </h1>
                            <p className="text-emerald-100/80 font-medium">
                                Enregistrez et suivez les paiements d'élèves (Scolarité, Frais divers)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TAB LIST & FILTERS */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                {/* Tabs as Pills */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl w-full xl:w-auto overflow-x-auto hide-scrollbar border border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'general'
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        {t("general_fees", "Frais Généraux / Divers")}
                    </button>
                    <button
                        onClick={() => setActiveTab('scolarite')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'scolarite'
                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        {t("tuition_fees", "Scolarités & Échéances")}
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto px-2 xl:px-0">
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedAnnee}
                            onChange={(e) => setSelectedAnnee(e.target.value)}
                            className="w-full sm:w-48 appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-4 pr-10 rounded-xl font-semibold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        >
                            {annees.map((a) => (
                                <option key={a.id} value={a.id}>
                                    Année {a.nom} {a.en_cours ? "⭐️" : ""}
                                </option>
                            ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative w-full sm:w-auto flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t("search_paiement", "Élève, Reçu, Réf...")}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2.5 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    {/* Dynamic Action Button */}
                    {activeTab === 'general' ? (
                        <button
                            onClick={() => setGeneralModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Paiement Général</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setScolariteModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Encaisser Scolarité</span>
                        </button>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <Modal show={generalModalOpen} onClose={() => setGeneralModalOpen(false)} maxWidth="4xl">
                <PaiementForm
                    inscriptions={inscriptions}
                    classes={classes}
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


            {/* TABLE CONTENT */}
            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0B1A2D] text-slate-300 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-5 font-semibold rounded-tl-3xl">{t("date", "Date")}</th>
                                <th className="p-5 font-semibold text-white">{t("student", "Élève")}</th>
                                <th className="p-5 font-semibold">{t("frais_type", "Motif / Période")}</th>
                                <th className="p-5 font-semibold">{t("mode", "Règlement")}</th>
                                <th className="p-5 font-semibold">{t("reference", "Référence")}</th>
                                <th className="p-5 font-semibold text-right text-white">{t("amount", "Montant")}</th>
                                <th className="p-5 font-semibold text-center rounded-tr-3xl">{t("actions", "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {paiements.data.filter(p => {
                                const isSco = fraisTypes.find(ft => ft.id === p.frais_type_id)?.is_scolarite;
                                return activeTab === 'general' ? !isSco : isSco;
                            }).length > 0 ? (
                                paiements.data.filter(p => {
                                    const isSco = fraisTypes.find(ft => ft.id === p.frais_type_id)?.is_scolarite;
                                    return activeTab === 'general' ? !isSco : isSco;
                                }).map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                        <td className="p-5 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {new Date(p.date_paiement).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                    {(p.inscription?.eleve?.user?.nom || "?")[0]}
                                                    {(p.inscription?.eleve?.user?.prenom || "?")[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white capitalize">
                                                        {p.inscription?.eleve?.user?.prenom?.toLowerCase()} {p.inscription?.eleve?.user?.nom?.toUpperCase()}
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1 border border-slate-200 dark:border-slate-700">
                                                        {p.inscription?.classe?.nom}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {activeTab === 'general' ? (
                                                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-3 py-1 rounded-lg text-xs dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                    {p.frais_type?.nom}
                                                </span>
                                            ) : (
                                                <div>
                                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                                        {p.frais_type?.nom || "Scolarité"}
                                                    </div>
                                                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {p.mois || "Année complète"}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest
                                                ${p.mode_paiement === 'especes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                                    p.mode_paiement === 'mobile' ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                                                        'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'}`}>
                                                {p.mode_paiement === 'especes' && <span className="text-sm leading-none">💵</span>}
                                                {p.mode_paiement === 'mobile' && <span className="text-sm leading-none">📱</span>}
                                                {(p.mode_paiement === 'virement' || p.mode_paiement === 'cheque') && <span className="text-sm leading-none">🏦</span>}
                                                <span className="mt-0.5">{p.mode_paiement}</span>
                                            </span>
                                        </td>
                                        <td className="p-5 font-mono text-xs font-medium text-slate-500">
                                            {p.reference || <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="p-5 text-right whitespace-nowrap">
                                            <div className={`font-black tracking-tight ${activeTab === 'general' ? 'text-blue-600 dark:text-blue-400 text-lg' : 'text-emerald-600 dark:text-emerald-400 text-lg'}`}>
                                                {Number(p.montant).toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-400 ml-1">FCFA</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={route('paiements.recu', p.id)}
                                                    target="_blank"
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                                                    title="Imprimer le Reçu"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => destroy(p.id)}
                                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                                                    title={t("delete", "Supprimer")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                            <p className="font-semibold text-lg">{t("no_payments", "Aucun encaissement trouvé.")}</p>
                                            <p className="text-sm mt-1 opacity-70">Enregistrez un paiement pour commencer.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {paiements.links && paiements.links.length > 3 && (
                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                    {paiements.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            preserveScroll
                            preserveState
                            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${link.active
                                ? activeTab === 'general' ? "bg-blue-600 text-white shadow-blue-500/30" : "bg-emerald-600 text-white shadow-emerald-500/30"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

        </DashboardLayout>
    );
}
