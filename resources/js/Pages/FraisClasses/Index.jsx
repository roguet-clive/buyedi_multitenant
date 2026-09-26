import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
  LayoutGrid,
  Save,
  CalendarRange,
  Layers,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Baby,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// Helper pour trouver le montant et les échéances existantes pour une classe
const getExistingData = (classeId, existingFrais) => {
  const fees = existingFrais ? existingFrais[classeId] : null;
  if (fees && fees.length > 0) {
    return {
      montant: fees[0].montant,
      echeances: fees[0].echeances || [],
    };
  }
  return { montant: "", echeances: [] };
};

export default function Index({ sections, fraisTypes, existingFrais, currentSchoolYear }) {
  const { t } = useTranslation();
  const [selectedFraisType, setSelectedFraisType] = useState(fraisTypes.length > 0 ? fraisTypes[0].id : "");
  const [amounts, setAmounts] = useState({});
  const [isApplyingBareme, setIsApplyingBareme] = useState(false);

  // Initialisation des montants depuis les données existantes
  useEffect(() => {
    const initialAmounts = {};
    if (sections) {
      sections.forEach((section) => {
        section.classes.forEach((classe) => {
          const { montant } = getExistingData(classe.id, existingFrais);
          initialAmounts[classe.id] = montant;
        });
      });
    }
    setAmounts(initialAmounts);
  }, [existingFrais, sections]);

  const handleAmountChange = (classeId, value) => {
    setAmounts((prev) => ({ ...prev, [classeId]: value }));
  };

  const applyOfficialSchedule = () => {
    if (
      !confirm(
        "Voulez-vous appliquer le barème officiel du Complexe Scolaire Sagesse Divine ?\n\n• Crèche (8h-13h) : 20 000 FCFA/mois (180 000 FCFA/an)\n• Crèche (8h-16h) : 30 000 FCFA/mois (270 000 FCFA/an)\n• Maternelle (3, 4, 5 ans) : 20 000 FCFA/mois (180 000 FCFA/an)\n• Primaire (1ère, 2ème, 3ème Année) : 20 000 FCFA/mois (180 000 FCFA/an)\n• Primaire 4ème Année : 25 000 FCFA/mois (225 000 FCFA/an)\n• Primaire 5ème Année : 30 000 FCFA/mois (270 000 FCFA/an)\n\nToutes les classes seront calibrées sur 9 mensualités avec échéance chaque 10 du mois."
      )
    ) {
      return;
    }

    setIsApplyingBareme(true);
    router.post(
      route("frais_classes.appliquerBaremeOfficiel"),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Barème officiel Sagesse Divine appliqué avec succès !");
          setIsApplyingBareme(false);
        },
        onError: () => {
          toast.error("Erreur lors de l'application du barème officiel.");
          setIsApplyingBareme(false);
        },
      }
    );
  };

  const saveAll = () => {
    if (!selectedFraisType) {
      toast.error(t("please_select_frais_type", "Veuillez sélectionner un type de frais scolarité."));
      return;
    }

    const updates = [];
    Object.keys(amounts).forEach((classeId) => {
      const montant = amounts[classeId];
      if (montant !== "" && montant !== null && !isNaN(parseFloat(montant))) {
        updates.push({
          classe_id: classeId,
          frais_type_id: selectedFraisType,
          montant: parseFloat(montant),
        });
      }
    });

    if (updates.length === 0) {
      toast("Aucune modification à enregistrer.");
      return;
    }

    router.post(
      route("frais_classes.storeBulk"),
      { updates },
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Grille de scolarité mise à jour avec succès !"),
      }
    );
  };

  if (!currentSchoolYear) {
    return (
      <DashboardLayout title={t("frais_classes_management")}>
        <div className="p-6 text-center text-red-500 font-bold">
          {t("no_active_school_year", "Aucune année scolaire active.")}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("frais_classes_management", "Grille de Scolarité & Échéanciers")}>
      {/* BANNIÈRE D'EN-TÊTE PRINCIPALE */}
      <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0 text-blue-300">
              <LayoutGrid className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {t("tuition_grid", "Grille Tarifaire & Échéanciers de Scolarité")}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Complexe Scolaire Sagesse Divine • {currentSchoolYear.nom}
                </span>
              </div>
              <p className="text-blue-100/80 font-medium text-sm max-w-3xl leading-relaxed">
                Règlements de scolarité sur <strong>9 mois (Septembre à Mai)</strong> • Paiement chaque <strong>5 ou 10 du mois</strong> • Options de paiement au <strong>mois</strong> ou au <strong>trimestre</strong>.
              </p>
            </div>
          </div>

          {/* BOUTONS D'ACTIONS HAUT DE PAGE */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            {/* BOUTON BAREME OFFICIEL 1-CLIC */}
            <button
              onClick={applyOfficialSchedule}
              disabled={isApplyingBareme}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-blue-500/30 font-bold flex items-center justify-center gap-2.5 transition-all active:scale-95 text-sm border border-white/10"
              title="Calibrer toutes les classes selon la règle officielle Sagesse Divine"
            >
              <RefreshCw className={`w-4 h-4 ${isApplyingBareme ? "animate-spin" : ""}`} />
              <span>Appliquer Barème Officiel</span>
            </button>

            {/* BOUTON ENREGISTRER */}
            <button
              onClick={saveAll}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{t("save_all", "Enregistrer la grille")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 CARTES POLITIQUES TARIFAIRES SAGESSE DIVINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {/* CARTE 1 : CRÈCHE */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-amber-200/70 dark:border-amber-800/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Baby className="w-3 h-3" /> Crèche
              </span>
              <span className="text-[10px] font-bold text-slate-400">8h-13h / 8h-16h</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-0.5">
              20k <span className="text-xs font-normal text-slate-400">à</span> 30k <span className="text-[11px] font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-3">
              8h-13h : 20 000 F • 8h-16h : 30 000 F.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total (9m) :</span>
            <span className="font-mono font-black text-amber-600 dark:text-amber-400">180k - 270k F</span>
          </div>
        </div>

        {/* CARTE 2 : MATERNELLE 3, 4, 5 ANS */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                <Baby className="w-3 h-3" /> Maternelle
              </span>
              <span className="text-[10px] font-bold text-slate-400">3, 4 & 5 ans</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-0.5">
              20 000 F <span className="text-[11px] font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Petite, Moyenne, Grande Section.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total (9m) :</span>
            <span className="font-mono font-black text-blue-600 dark:text-blue-400">180 000 FCFA</span>
          </div>
        </div>

        {/* CARTE 3 : PRIMAIRE 1ère à 3ème */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Primaire (1e-3e)
              </span>
              <span className="text-[10px] font-bold text-slate-400">1ère, 2e, 3e</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-0.5">
              20 000 F <span className="text-[11px] font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Règlement en 9 mois de Septembre à Mai.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total (9m) :</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">180 000 FCFA</span>
          </div>
        </div>

        {/* CARTE 4 : PRIMAIRE 4ème Année */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 4ème Année
              </span>
              <span className="text-[10px] font-bold text-indigo-500">Primaire</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-0.5">
              25 000 F <span className="text-[11px] font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Règlement en 9 mois de Septembre à Mai.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total (9m) :</span>
            <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">225 000 FCFA</span>
          </div>
        </div>

        {/* CARTE 5 : PRIMAIRE 5ème Année (CEP) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-teal-200/70 dark:border-teal-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 5ème Année
              </span>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Classe CEP</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-0.5">
              30 000 F <span className="text-[11px] font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Préparation intensive au certificat.
            </p>
          </div>
          <div className="pt-2 border-t border-teal-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Total (9m) :</span>
            <span className="font-mono font-black text-teal-600 dark:text-teal-400">270 000 FCFA</span>
          </div>
        </div>
      </div>

      {/* TABLEAU PRINCIPAL DE LA GRILLE */}
      {fraisTypes.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-200 font-medium flex items-center gap-4">
          <span className="text-2xl">⚠️</span> {t("no_tuition_type_found", "Aucun type de frais 'Scolarité' trouvé.")}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0B1A2D] text-white">
                <tr>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs border-r border-[#1a2d42] w-48">
                    {t("section", "Cycle / Section")}
                  </th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs w-44">{t("class", "Classe")}</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs w-44 text-center">Périodicités Autorisées</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-right w-56 bg-blue-950/40">
                    {t("montant_scolarite_annuel", "Total Annuel (FCFA)")}
                  </th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-left">
                    Détail des Échéances (Mois / Trimestre)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sections.map((section) =>
                  section.classes.length > 0 &&
                  section.classes.map((classe, idx) => {
                    const annualAmount = parseFloat(amounts[classe.id]) || 0;
                    const isMaternelleOrPrimaire = section.id === "creche" || section.id === "maternelle" || section.id === "primaire";
                    const isExamen = classe.is_examen || ["3e", "tle"].includes(classe.nom.toLowerCase().trim());

                    // Mensualité (9 mois)
                    const monthlyAmount = annualAmount > 0 ? Math.round(annualAmount / 9) : 0;
                    const trimAmount = monthlyAmount * 3;

                    // Tranches indicatives
                    let t1 = 0, t2 = 0, t3 = 0;
                    if (annualAmount === 145000 && isExamen) {
                      t1 = 70000; t2 = 37500; t3 = 37500;
                    } else if (annualAmount === 135000) {
                      t1 = 70000; t2 = 32500; t3 = 32500;
                    } else if (annualAmount > 0) {
                      t1 = Math.min(70000, annualAmount);
                      const reste = Math.max(0, annualAmount - t1);
                      t2 = Math.round(reste / 2);
                      t3 = reste - t2;
                    }

                    return (
                      <tr
                        key={classe.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Section name */}
                        {idx === 0 && (
                          <td
                            rowSpan={section.classes.length}
                            className="p-5 border-r border-slate-100 dark:border-slate-700 align-top bg-slate-50/50 dark:bg-slate-900/20"
                          >
                            <div className="font-black text-slate-800 dark:text-slate-200 text-base mb-1.5 flex items-center gap-2">
                              {section.id === "creche" && <Baby className="w-5 h-5 text-amber-500" />}
                              {section.id === "maternelle" && <Baby className="w-5 h-5 text-blue-500" />}
                              {section.id === "primaire" && <BookOpen className="w-5 h-5 text-emerald-500" />}
                              {section.id === "secondaire" && <Layers className="w-5 h-5 text-purple-500" />}
                              {section.nom}
                            </div>
                            <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full mb-3">
                              {section.classes.length} classe(s)
                            </span>
                          </td>
                        )}

                        {/* Nom de la classe */}
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              {classe.nom}
                            </span>
                            {isExamen && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" /> Examen
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Mode de paiement */}
                        <td className="p-5 text-center">
                          {isMaternelleOrPrimaire ? (
                            <div className="flex flex-col gap-1 items-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                                <CalendarRange className="w-3 h-3" /> Mensuel (9 mois)
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Trimestre (3x)
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                              <Layers className="w-3.5 h-3.5" /> 3 Tranches
                            </span>
                          )}
                        </td>

                        {/* Saisie Montant Annuel */}
                        <td className="p-5 bg-blue-50/20 dark:bg-blue-950/10 text-right">
                          <div className="relative inline-flex items-center justify-end">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              placeholder="0"
                              className="w-44 border-blue-200 dark:border-blue-800/60 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-black text-right pr-14 py-2.5 transition-all text-blue-700 dark:text-blue-400 text-base shadow-sm"
                              value={amounts[classe.id] !== undefined ? amounts[classe.id] : ""}
                              onChange={(e) => handleAmountChange(classe.id, e.target.value)}
                            />
                            <span className="absolute right-3.5 text-blue-500 font-black text-xs pointer-events-none">
                              FCFA
                            </span>
                          </div>
                        </td>

                        {/* Détail Échéancier */}
                        <td className="p-5">
                          {isMaternelleOrPrimaire ? (
                            annualAmount > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-xs bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                  {monthlyAmount.toLocaleString("fr-FR")} F / mois
                                </span>
                                <span className="font-mono text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800/40">
                                  Trimestre : <strong>{trimAmount.toLocaleString("fr-FR")} F</strong>
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium ml-1">
                                  (Échéance chaque 10 du mois)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs italic">—</span>
                            )
                          ) : (
                            annualAmount > 0 ? (
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  T1 (Sept.) : <strong>{t1.toLocaleString("fr-FR")} F</strong>
                                </span>
                                <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  T2 (Fin Nov.) : <strong>{t2.toLocaleString("fr-FR")} F</strong>
                                </span>
                                <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                  T3 (Fin Janv.) : <strong>{t3.toLocaleString("fr-FR")} F</strong>
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs italic">—</span>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                {sections.every((s) => s.classes.length === 0) && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      {t("no_classes", "Aucune classe trouvée.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pied de page du tableau */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                L'enregistrement met à jour automatiquement la base de données et synchronise les échéanciers pour chaque élève.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={applyOfficialSchedule}
                disabled={isApplyingBareme}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isApplyingBareme ? "animate-spin" : ""}`} />
                <span>Barème Officiel</span>
              </button>
              <button
                onClick={saveAll}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>{t("save_all", "Enregistrer la grille")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
