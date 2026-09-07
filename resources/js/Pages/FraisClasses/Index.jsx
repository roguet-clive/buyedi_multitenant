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
        "Voulez-vous appliquer le barème officiel Buyedi ?\n\n• Maternelle (Petite, Moyenne, Grande Section) : 13 000 FCFA/mois (9 mois = 117 000 FCFA)\n• Primaire 1ère à 4ème Année : 13 500 FCFA/mois (9 mois = 121 500 FCFA)\n• Primaire 5ème Année : 15 000 FCFA/mois (9 mois = 135 000 FCFA)\n• Secondaire Général (6e à 1ère hors 3e) : 3 Tranches (70 000 F en Septembre, 32 500 F fin Novembre, 32 500 F fin Janvier = 135 000 FCFA)\n• Secondaire Examen (3e & Terminale) : 3 Tranches (70 000 F en Septembre, 37 500 F fin Novembre, 37 500 F fin Janvier = 145 000 FCFA)\n\nToutes les classes de l'année en cours seront automatiquement calibrées."
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
          toast.success("Barème officiel appliqué avec succès !");
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
                  <Sparkles className="w-3.5 h-3.5" /> Année {currentSchoolYear.nom}
                </span>
              </div>
              <p className="text-blue-100/80 font-medium text-sm max-w-3xl leading-relaxed">
                Gestion officielle des tarifs et échéances : <strong>Maternelle</strong> (13 000 FCFA/mois), <strong>Primaire 1ère-4ème</strong> (13 500 FCFA/mois), <strong>5ème Année</strong> (15 000 FCFA/mois) et <strong>Secondaire</strong> (3 Tranches : 70 000 FCFA à la rentrée, 32 500 ou 37 500 FCFA en Novembre et Janvier).
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
              title="Calibrer toutes les classes selon la règle officielle Buyedi"
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

      {/* 4 CARTES POLITIQUES TARIFAIRES BUYEDI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* CARTE 1 : MATERNELLE */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                <Baby className="w-3 h-3" /> Maternelle
              </span>
              <span className="text-[11px] font-bold text-slate-400">Petite, Moy., Grande</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">
              13 000 FCFA <span className="text-xs font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Règlement en <strong>9 mensualités</strong> de Septembre à Mai. Pas de tranches.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Annuel :</span>
            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">117 000 FCFA</span>
          </div>
        </div>

        {/* CARTE 2 : PRIMAIRE 1ère à 4ème */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Primaire (1e-4e)
              </span>
              <span className="text-[11px] font-bold text-slate-400">1ère à 4ème Année</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">
              13 500 FCFA <span className="text-xs font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Règlement en <strong>9 mensualités</strong> de Septembre à Mai.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Annuel :</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">121 500 FCFA</span>
          </div>
        </div>

        {/* CARTE 3 : PRIMAIRE 5ème Année */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-teal-200/70 dark:border-teal-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 5ème Année
              </span>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">Classe CEP</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">
              15 000 FCFA <span className="text-xs font-semibold text-slate-400">/ mois</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Règlement en <strong>9 mensualités</strong> de Septembre à Mai pour la préparation au certificat.
            </p>
          </div>
          <div className="pt-3 border-t border-teal-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Annuel :</span>
            <span className="font-mono font-black text-teal-600 dark:text-teal-400 text-sm">135 000 FCFA</span>
          </div>
        </div>

        {/* CARTE 4 : SECONDAIRE (Général & Examen) */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Secondaire
              </span>
              <span className="text-[11px] font-bold text-slate-400">6e à Terminale</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">
              3 Tranches
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              <strong>T1 (Sept.)</strong> : 70 000 F • <strong>T2 & T3</strong> : 32 500 F (Général) ou 37 500 F (3e/Tle).
            </p>
          </div>
          <div className="pt-3 border-t border-purple-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total :</span>
            <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-sm">135k / 145k FCFA</span>
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
                  <th className="p-5 font-bold tracking-wide uppercase text-xs w-36 text-center">Mode de Paiement</th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-right w-60 bg-blue-950/40">
                    {t("montant_scolarite_annuel", "Total Annuel (FCFA)")}
                  </th>
                  <th className="p-5 font-bold tracking-wide uppercase text-xs text-left">
                    Détail de l'Échéancier Officiel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {sections.map((section) =>
                  section.classes.length > 0 &&
                  section.classes.map((classe, idx) => {
                    const annualAmount = parseFloat(amounts[classe.id]) || 0;
                    const isMaternelleOrPrimaire = section.id === "maternelle" || section.id === "primaire";
                    const isExamen = classe.is_examen || ["3e", "tle"].includes(classe.nom.toLowerCase().trim());
                    const existingData = getExistingData(classe.id, existingFrais);

                    // Mensualité indicative (9 mois)
                    const monthlyAmount = annualAmount > 0 ? Math.round(annualAmount / 9) : 0;

                    // Tranches indicatives
                    let t1 = 0,
                      t2 = 0,
                      t3 = 0;
                    if (annualAmount === 145000 && isExamen) {
                      t1 = 70000;
                      t2 = 37500;
                      t3 = 37500;
                    } else if (annualAmount === 135000) {
                      t1 = 70000;
                      t2 = 32500;
                      t3 = 32500;
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
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                              <CalendarRange className="w-3.5 h-3.5" /> Mensuel (9 mois)
                            </span>
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
                            // Maternelle & Primaire : Affichage des mensualités
                            annualAmount > 0 ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-xs bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                  {monthlyAmount.toLocaleString("fr-FR")} FCFA / mois
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Septembre à Mai (9 mensualités)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 text-xs italic">—</span>
                            )
                          ) : (
                            // Secondaire : Affichage des 3 Tranches
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
