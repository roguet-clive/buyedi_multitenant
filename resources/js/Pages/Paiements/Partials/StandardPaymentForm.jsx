import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import useTranslation from "@/Hooks/useTranslation";
import Select from "react-select";
import { Layers, CheckCircle2, User } from "lucide-react";

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

export default function StandardPaymentForm({ 
    paiement, 
    inscriptions = [], 
    fraisTypes = [], 
    onClose,
    preselectedInscriptionId = null,
    onSuccessCallback = null
}) {
    const { t } = useTranslation();
    const otherFees = fraisTypes.filter(ft => !ft.is_scolarite);

    const form = useForm({
        inscription_id: preselectedInscriptionId || paiement?.inscription_id || "",
        frais_type_id: paiement?.frais_type_id || (otherFees[0]?.id || ""),
        montant: paiement?.montant || (otherFees[0]?.montant || ""),
        mode_paiement: paiement?.mode_paiement || "especes",
        commentaire: paiement?.commentaire || "",
    });

    const selectedInsc = inscriptions.find(i => String(i.id) === String(form.data.inscription_id));

    useEffect(() => {
        if (form.data.frais_type_id) {
            const feeType = otherFees.find(ft => ft.id == form.data.frais_type_id);
            if (feeType) {
                const isTenue = feeType.code === 'tenue' || feeType.nom?.toLowerCase().includes('tenue');
                if (isTenue && form.data.inscription_id) {
                    const tenueMontant = selectedInsc?.montant_tenue_exigible || (selectedInsc?.is_secondaire ? 15000 : 10000);
                    form.setData("montant", tenueMontant);
                } else {
                    form.setData("montant", feeType.montant);
                }
            }
        }
    }, [form.data.frais_type_id, form.data.inscription_id]);

    const submit = (e) => {
        e.preventDefault();
        form.post(route("paiements.store"), {
            onSuccess: () => {
                onClose();
                form.reset();
                if (onSuccessCallback) onSuccessCallback();
            },
            onError: () => { },
        });
    };

    const inscriptionOptions = inscriptions.map((i) => ({ value: i.id, label: i.label || `${i.eleve_nom_complet || ''} (${i.classe_nom || ''})` }));

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
            <div className="p-6 md:p-8 form-scrollpane overflow-y-auto max-h-[75vh] space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        {preselectedInscriptionId && selectedInsc ? (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-slate-800 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-200/80 dark:bg-blue-900 text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                                Élève Sélectionné
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                                                {selectedInsc?.matricule}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                            {selectedInsc?.eleve_nom_complet || selectedInsc?.label}
                                        </h4>
                                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                            Classe : {selectedInsc?.classe_nom}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}

                        {/* ALERTE / SUGGESTION TENUE SCOLAIRE NON RÉGLÉE */}
                        {(() => {
                            if (!selectedInsc || selectedInsc.tenue_payee) return null;
                            const tenueFee = otherFees.find(ft => ft.code === 'tenue' || ft.nom?.toLowerCase().includes('tenue'));
                            const isSecondaire = selectedInsc.is_secondaire || selectedInsc.classe_type === 'secondaire';
                            const montantTenue = selectedInsc.montant_tenue_exigible || (isSecondaire ? 15000 : 10000);

                            return (
                                <div className="mt-3 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xl">👕</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                                    Tenue Scolaire non encore réglée
                                                </p>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSecondaire ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                                    {isSecondaire ? 'Secondaire' : 'Maternelle / Primaire'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                                Tarif exigible : <strong>{montantTenue.toLocaleString('fr-FR')} FCFA</strong>. Le parent peut la régler dès maintenant.
                                            </p>
                                        </div>
                                    </div>
                                    {tenueFee && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                form.setData(prev => ({
                                                    ...prev,
                                                    frais_type_id: tenueFee.id,
                                                    montant: montantTenue,
                                                    commentaire: `Règlement Tenue Scolaire (${isSecondaire ? 'Secondaire' : 'Mat/Prim'})`
                                                }));
                                            }}
                                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black shrink-0 transition-colors shadow-sm flex items-center gap-1.5"
                                        >
                                            <span>Régler la Tenue</span>
                                            <span className="bg-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                {montantTenue.toLocaleString('fr-FR')} F
                                            </span>
                                        </button>
                                    )}
                                </div>
                            );
                        })()}
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

                    <div className="md:col-span-1">
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

                    <div className="md:col-span-1">
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
