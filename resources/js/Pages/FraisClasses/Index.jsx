import { useState, useEffect, useMemo } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { LayoutGrid, Save, Info, CreditCard, Calculator, CalendarRange, PieChart, Sparkles, CheckCircle2 } from "lucide-react";

// Helper to find existing amount for a class
const getAmount = (classeId, existingFrais) => {
  const fees = existingFrais ? existingFrais[classeId] : null;
  if (fees && fees.length > 0) {
    return fees[0].montant;
  }
  return "";
};

export default function Index({ sections, fraisTypes, existingFrais, currentSchoolYear, auth }) {
  const { t } = useTranslation();
  const { flash } = usePage().props;

  // State
  const [selectedFraisType, setSelectedFraisType] = useState(fraisTypes.length > 0 ? fraisTypes[0].id : "");
  const [amounts, setAmounts] = useState({});
  const [monthlyDivisor, setMonthlyDivisor] = useState(10); // 10 mois (Sept à Juin) ou 9 mois

  // Initialize amounts from existing data
  useEffect(() => {
    const initialAmounts = {};
    if (sections) {
      sections.forEach(section => {
        section.classes.forEach(classe => {
          initialAmounts[classe.id] = getAmount(classe.id, existingFrais);
        });
      });
    }
    setAmounts(initialAmounts);
  }, [existingFrais, sections]);

  const handleAmountChange = (classeId, value) => {
    setAmounts(prev => ({ ...prev, [classeId]: value }));
  };

  const applyToSection = (section, amount) => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const newAmounts = { ...amounts };
    section.classes.forEach(c => {
      newAmounts[c.id] = parseFloat(amount);
    });
    setAmounts(newAmounts);
    toast.success(`Montant appliqué à toutes les classes de ${section.nom}`);
  };

  const formatMoney = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? "0 FCFA" : n.toLocaleString("fr-FR") + " FCFA";
  };

  const saveAll = () => {
    if (!selectedFraisType) {
      toast.error(t("please_select_frais_type", "Veuillez sélectionner un type de frais scolarité."));
      return;
    }

    const updates = [];
    Object.keys(amounts).forEach(classeId => {
      const montant = amounts[classeId];
      if (montant !== "" && montant !== null) {
        updates.push({
          classe_id: classeId,
          frais_type_id: selectedFraisType,
          montant: parseFloat(montant)
        });
      }
    });

    if (updates.length === 0) {
      toast("Aucune modification à enregistrer.");
      return;
    }

    router.post(route('frais_classes.storeBulk'), { updates }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Grille de scolarité mise à jour avec succès !"),
    });
  };

  if (!currentSchoolYear) {
    return (
      <DashboardLayout title={t("frais_classes_management")}>
        <div className="p-6 text-center text-red-500">
          {t("no_active_school_year", "Aucune année scolaire active.")}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("frais_classes_management", "Grille de Scolarité & Échéanciers")}>
      {/* HEADER BANNER */}
      <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row justify-between gap-6 z-10">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
              <LayoutGrid className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {t("tuition_grid", "Grille Tarifaire de Scolarité")}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Année {currentSchoolYear.nom}
                </span>
              </div>
              <p className="text-blue-100/80 font-medium text-sm max-w-2xl leading-relaxed">
                Définissez la scolarité annuelle totale par classe. Le système calcule et propose automatiquement aux parents les options de règlement : <strong>Totalité</strong>, <strong>Mensualités</strong> ou <strong>3 Tranches trimestrielles</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 mt-4 lg:mt-0">
            {/* Diviseur de mois */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2 text-white text-xs font-bold">
              <CalendarRange className="w-4 h-4 text-blue-300" />
              <span>Base mensuelle :</span>
              <select
                value={monthlyDivisor}
                onChange={e => setMonthlyDivisor(Number(e.target.value))}
                className="bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 px-2 py-1 focus:ring-0 cursor-pointer"
              >
                <option value={8}>Septembre à Avril (8 mois)</option>
                <option value={9}>Septembre à Mai (9 mois)</option>
                <option value={10}>Septembre à Juin (10 mois)</option>
              </select>
            </div>

            {/* Selector if multiple types */}
            {fraisTypes.length > 1 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-1.5 rounded-xl flex items-center">
                <select
                  className="appearance-none bg-transparent text-white border-0 font-bold focus:ring-0 cursor-pointer pr-8 pl-3 py-2 text-sm"
                  value={selectedFraisType}
                  onChange={e => setSelectedFraisType(e.target.value)}
                >
                  {fraisTypes.map(ft => (
                    <option key={ft.id} value={ft.id} className="text-slate-800">{ft.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={saveAll}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Save className="w-5 h-5" />
              <span>{t("save_all", "Enregistrer la grille")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXPLANATORY CARDS (GABONESE TUITION FLEXIBILITY) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-black text-xl">
            1
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">Règlement Annuel Total</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paiement intégral au début de l'année scolaire (ex: <strong>120 000 FCFA</strong>). Reçu pour solde tout compte annuel.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-black text-xl">
            2
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">Paiement par Mensualités</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paiement chaque mois (sur {monthlyDivisor} mois de <strong>{monthlyDivisor === 8 ? 'Septembre à Avril' : monthlyDivisor === 9 ? 'Septembre à Mai' : 'Septembre à Juin'}</strong>). Possibilité de régler plusieurs mois en une fois.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-black text-xl">
            3
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-1">Paiement par Tranches</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paiement trimestriel en 3 tranches (ex: <strong>40 000 FCFA × 3</strong>) ou par acomptes libres au guichet jusqu'à épuisement.
            </p>
          </div>
        </div>
      </div>

      {fraisTypes.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-200 font-medium flex items-center gap-4">
          <span className="text-2xl">⚠️</span> {t("no_tuition_type_found", "Aucun type de frais 'Scolarité' trouvé. Veuillez en créer un dans 'Types de frais'.")}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0B1A2D] text-white">
                <tr>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs border-r border-[#1a2d42]">{t("section", "Cycle / Section")}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs">{t("class", "Classe")}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-right w-64 bg-blue-950/40">{t("montant_scolarite_annuel", "1. Total Annuel (FCFA)")}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-right w-56">{t("mensualite_indicative", `2. Mensualité (${monthlyDivisor === 8 ? 'Sept. - Avril' : monthlyDivisor === 9 ? 'Sept. - Mai' : 'Sept. - Juin'})`)}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-right w-56">{t("tranche_trimestrielle", "3. Tranche (3 Trimestres)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sections.map(section => (
                  section.classes.length > 0 && section.classes.map((classe, idx) => {
                    const annualAmount = parseFloat(amounts[classe.id]) || 0;
                    const monthlyAmount = annualAmount > 0 ? Math.round(annualAmount / monthlyDivisor) : 0;
                    const trimesterAmount = annualAmount > 0 ? Math.round(annualAmount / 3) : 0;

                    return (
                      <tr key={classe.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        {/* Section name with quick action button */}
                        {idx === 0 && (
                          <td
                            rowSpan={section.classes.length}
                            className="p-5 border-r border-slate-100 dark:border-slate-700 align-top bg-slate-50/50 dark:bg-slate-900/20"
                          >
                            <div className="font-black text-slate-800 dark:text-slate-200 text-base mb-2">
                              {section.nom}
                            </div>
                            <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full mb-3">
                              {section.classes.length} classe(s)
                            </span>
                          </td>
                        )}
                        <td className="p-5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {classe.nom}
                          </span>
                        </td>
                        
                        {/* 1. Annual Input */}
                        <td className="p-5 bg-blue-50/30 dark:bg-blue-950/10">
                          <div className="relative flex items-center justify-end">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              placeholder="0"
                              className="w-48 border-blue-200 dark:border-blue-800/60 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-black text-right pr-14 py-2.5 transition-all text-blue-700 dark:text-blue-400 text-base shadow-sm"
                              value={amounts[classe.id] !== undefined ? amounts[classe.id] : ""}
                              onChange={e => handleAmountChange(classe.id, e.target.value)}
                            />
                            <span className="absolute right-3.5 text-blue-500 font-black text-xs pointer-events-none">
                              FCFA
                            </span>
                          </div>
                        </td>

                        {/* 2. Monthly Calculation */}
                        <td className="p-5 text-right">
                          {annualAmount > 0 ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-xl">
                                {monthlyAmount.toLocaleString('fr-FR')} FCFA <span className="text-[10px] text-emerald-600/70">/mois</span>
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">× {monthlyDivisor} mois</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs italic">—</span>
                          )}
                        </td>

                        {/* 3. Trimester Calculation */}
                        <td className="p-5 text-right">
                          {annualAmount > 0 ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/50 px-3 py-1.5 rounded-xl">
                                {trimesterAmount.toLocaleString('fr-FR')} FCFA <span className="text-[10px] text-purple-600/70">/tranche</span>
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">× 3 trimestres</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ))}
                {sections.every(s => s.classes.length === 0) && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      {t("no_classes", "Aucune classe trouvée.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Les calculs mensuels et trimestriels s'actualisent en direct lors de la saisie du montant annuel.</span>
            </div>
            <button
              onClick={saveAll}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{t("save_all", "Enregistrer la grille tarifaire")}</span>
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
