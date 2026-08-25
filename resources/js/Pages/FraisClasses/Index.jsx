import { useState, useEffect } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { LayoutGrid, Save, Info, CreditCard } from "lucide-react";

// Helper to find existing amount for a class
const getAmount = (classeId, existingFrais) => {
  // existingFrais is grouped by class_id, so it's an object/array: { "1": [ {id, montant, frais_type_id} ] }
  const fees = existingFrais ? existingFrais[classeId] : null;
  if (fees && fees.length > 0) {
    return fees[0].montant; // Assume 1 tuition fee per class for now
  }
  return "";
};

export default function Index({ sections, fraisTypes, existingFrais, currentSchoolYear, auth }) {
  const { t } = useTranslation();
  const { flash } = usePage().props;

  // State
  const [selectedFraisType, setSelectedFraisType] = useState(fraisTypes.length > 0 ? fraisTypes[0].id : "");
  const [amounts, setAmounts] = useState({});

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

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const handleAmountChange = (classeId, value) => {
    setAmounts(prev => ({ ...prev, [classeId]: value }));
  };

  const saveAll = () => {
    if (!selectedFraisType) {
      toast.error(t("please_select_frais_type", "Veuillez sélectionner un type de frais scolarité."));
      return;
    }

    const updates = [];
    Object.keys(amounts).forEach(classeId => {
      const montant = amounts[classeId];
      // Only send if it has a value (even 0 is valid, strictly empty string is not update?) 
      // User might want to set 0. 
      if (montant !== "" && montant !== null) {
        updates.push({
          classe_id: classeId,
          frais_type_id: selectedFraisType, // Use the selected global type
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
      onSuccess: () => toast.success(t("saved_successfully", "Enregistré avec succès !"))
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
    <DashboardLayout title={t("frais_classes_management")}>
      {/* HEADER BANNER */}
      <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row justify-between gap-6 z-10">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
              <LayoutGrid className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                {t("tuition_grid", "Grille de Scolarité")}
              </h1>
              <p className="text-blue-100/80 font-medium text-sm max-w-xl leading-relaxed">
                {t("tuition_grid_desc", "Définissez ici le montant TOTAL que chaque élève doit payer pour toute l'année scolaire (Scolarité, Cantine, etc).")}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs bg-blue-500/20 text-blue-200 py-1.5 px-3 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                <Info className="w-4 h-4" />
                <span>Le système gère automatiquement les paiements partiels d'échéances.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 mt-4 md:mt-0">
            {/* Selector if multiple types */}
            {fraisTypes.length > 1 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-1.5 rounded-xl flex items-center">
                <select
                  className="appearance-none bg-transparent text-white border-0 font-bold focus:ring-0 cursor-pointer pr-8 pl-3 py-2"
                  value={selectedFraisType}
                  onChange={e => setSelectedFraisType(e.target.value)}
                >
                  {fraisTypes.map(ft => (
                    <option key={ft.id} value={ft.id} className="text-slate-800">{ft.nom}</option>
                  ))}
                </select>
              </div>
            )}
            {fraisTypes.length === 1 && (
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-blue-100 font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {fraisTypes[0].nom}
              </div>
            )}

            <button
              onClick={saveAll}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>{t("save_all", "Enregistrer la grille")}</span>
            </button>
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
                  <th className="p-5 font-bold tracking-wide uppercase text-xs border-r border-[#1a2d42]">{t("section")}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs">{t("class")}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs w-64 text-right">{t("montant_scolarite_annuel", "Montant Annuel (FCFA)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sections.map(section => (
                  section.classes.length > 0 && section.classes.map((classe, idx) => (
                    <tr key={classe.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      {/* Show section name only for first class of section */}
                      {idx === 0 && (
                        <td
                          rowSpan={section.classes.length}
                          className="p-5 border-r border-slate-100 dark:border-slate-700 align-top font-black text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/20 text-lg"
                        >
                          {section.nom}
                        </td>
                      )}
                      <td className="p-5 font-bold text-slate-700 dark:text-slate-300">{classe.nom}</td>
                      <td className="p-5">
                        <div className="relative flex items-center justify-end">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="0"
                            className="w-48 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold text-right pr-14 py-2.5 transition-all group-hover:bg-white dark:group-hover:bg-slate-800 text-blue-700 dark:text-blue-400"
                            value={amounts[classe.id] || ""}
                            onChange={e => handleAmountChange(classe.id, e.target.value)}
                          />
                          <span className="absolute right-4 text-slate-400 font-bold text-xs pointer-events-none">
                            FCFA
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
                {sections.every(s => s.classes.length === 0) && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-500">
                      {t("no_classes", "Aucune classe trouvée.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
