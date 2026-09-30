import { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
  LayoutGrid,
  Sparkles,
  Calendar,
  Clock,
  AlertCircle,
  GraduationCap,
  Baby,
  BookOpen,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Award,
  Wallet,
  CalendarRange,
  CalendarCheck,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Index({
  sections = [],
  classes = [],
  fraisTypes = [],
  existingFrais = {},
  currentSchoolYear,
}) {
  const { t } = useTranslation();

  // Filtres
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedFraisTypeFilter, setSelectedFraisTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClasses, setExpandedClasses] = useState({});

  // États du modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFraisClasse, setEditingFraisClasse] = useState(null);
  const [isApplyingBareme, setIsApplyingBareme] = useState(false);

  // Formulaire modal
  const [formData, setFormData] = useState({
    classe_ids: [],
    frais_type_id: "",
    montant: "",
    mode_paiement: "unique", // 'unique', 'tranches', 'mensuel'
    description: "",
    date_limite: "",
    echeances: [],
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Formateur de devise
  const formatMoney = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("fr-FR").format(num) + " FCFA";
  };

  // Liste plate des classes filtrées
  const filteredClasses = useMemo(() => {
    let list = classes;

    // Filtre section
    if (selectedSection !== "all") {
      list = list.filter((c) => {
        if (selectedSection === "creche") return c.is_creche || c.type === "creche" || c.nom?.toLowerCase().includes("crèche") || c.nom?.toLowerCase().includes("creche");
        if (selectedSection === "maternelle") return c.type === "maternelle" && !(c.is_creche || c.nom?.toLowerCase().includes("crèche"));
        if (selectedSection === "primaire") return c.type === "primaire";
        if (selectedSection === "secondaire") return c.type === "secondaire";
        return true;
      });
    }

    // Filtre recherche textuelle
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.nom?.toLowerCase().includes(q));
    }

    // Filtre par type de frais configuré
    if (selectedFraisTypeFilter !== "all") {
      list = list.filter((c) => {
        const fees = existingFrais[c.id] || [];
        return fees.some((f) => String(f.frais_type_id) === String(selectedFraisTypeFilter));
      });
    }

    return list;
  }, [classes, selectedSection, searchQuery, selectedFraisTypeFilter, existingFrais]);

  // Statistique globale
  const totalClassesConfigured = useMemo(() => {
    return Object.keys(existingFrais).filter((cid) => (existingFrais[cid] || []).length > 0).length;
  }, [existingFrais]);

  // Ouvrir le modal d'ajout pour une classe précise ou en multi-classe
  const openCreateModal = (defaultClasseId = null) => {
    setEditingFraisClasse(null);
    const startYear = currentSchoolYear?.nom ? parseInt(currentSchoolYear.nom) : new Date().getFullYear();
    const defaultDate = `${startYear}-11-30`;

    const initialClasseIds = defaultClasseId ? [Number(defaultClasseId)] : (classes.length > 0 ? [classes[0].id] : []);
    const initialFraisType = fraisTypes.length > 0 ? fraisTypes[0] : null;

    setFormData({
      classe_ids: initialClasseIds,
      frais_type_id: initialFraisType?.id || "",
      montant: initialFraisType?.montant || "",
      mode_paiement: initialFraisType?.is_scolarite ? "tranches" : "unique",
      description: "",
      date_limite: defaultDate,
      echeances: generateDefaultEcheances(
        initialFraisType?.is_scolarite ? "tranches" : "unique",
        initialFraisType?.montant || 0,
        defaultDate,
        initialFraisType?.nom
      ),
    });
    setIsModalOpen(true);
  };

  // Ouvrir le modal en mode modification
  const openEditModal = (fraisClasse) => {
    setEditingFraisClasse(fraisClasse);
    setFormData({
      classe_ids: [fraisClasse.classe_id],
      frais_type_id: fraisClasse.frais_type_id,
      montant: fraisClasse.montant,
      mode_paiement: fraisClasse.mode_paiement || (fraisClasse.echeances?.length > 1 ? (fraisClasse.echeances[0]?.type === "mensualite" ? "mensuel" : "tranches") : "unique"),
      description: fraisClasse.description || "",
      date_limite: fraisClasse.date_limite ? fraisClasse.date_limite.split("T")[0] : "",
      echeances: (fraisClasse.echeances || []).map((ech, idx) => ({
        id: ech.id,
        nom: ech.nom,
        montant: ech.montant,
        date_limite: ech.date_limite ? ech.date_limite.split("T")[0] : "",
        ordre: ech.ordre || idx + 1,
        type: ech.type || fraisClasse.mode_paiement || "unique",
      })),
    });
    setIsModalOpen(true);
  };

  // Génération automatique des échéances selon le mode choisi
  const generateDefaultEcheances = (mode, totalMontant, dateLimite, nomFrais = "Frais") => {
    const total = parseFloat(totalMontant) || 0;
    const startYear = currentSchoolYear?.nom ? parseInt(currentSchoolYear.nom) : new Date().getFullYear();
    const nextYear = startYear + 1;

    if (mode === "unique") {
      return [
        {
          nom: nomFrais || "Paiement Unique",
          montant: total,
          date_limite: dateLimite || `${startYear}-11-30`,
          ordre: 1,
          type: "unique",
        },
      ];
    }

    if (mode === "tranches") {
      const t1 = Math.round(total * 0.5);
      const t2 = Math.round((total - t1) / 2);
      const t3 = total - t1 - t2;
      return [
        { nom: "1ère Tranche", montant: t1, date_limite: `${startYear}-09-30`, ordre: 1, type: "tranche" },
        { nom: "2ème Tranche", montant: t2, date_limite: `${startYear}-11-30`, ordre: 2, type: "tranche" },
        { nom: "3ème Tranche", montant: t3, date_limite: `${nextYear}-01-31`, ordre: 3, type: "tranche" },
      ];
    }

    if (mode === "mensuel") {
      const mensuel = total > 0 ? Math.round(total / 9) : 0;
      const mois = [
        { nom: "Septembre", date: `${startYear}-09-10` },
        { nom: "Octobre", date: `${startYear}-10-10` },
        { nom: "Novembre", date: `${startYear}-11-10` },
        { nom: "Décembre", date: `${startYear}-12-10` },
        { nom: "Janvier", date: `${nextYear}-01-10` },
        { nom: "Février", date: `${nextYear}-02-10` },
        { nom: "Mars", date: `${nextYear}-03-10` },
        { nom: "Avril", date: `${nextYear}-04-10` },
        { nom: "Mai", date: `${nextYear}-05-10` },
      ];

      return mois.map((m, idx) => ({
        nom: m.nom,
        montant: mensuel,
        date_limite: m.date,
        ordre: idx + 1,
        type: "mensualite",
      }));
    }

    return [];
  };

  // Changement de mode de paiement dans le modal
  const handleModeChange = (newMode) => {
    const selectedType = fraisTypes.find((ft) => String(ft.id) === String(formData.frais_type_id));
    setFormData((prev) => ({
      ...prev,
      mode_paiement: newMode,
      echeances: generateDefaultEcheances(newMode, prev.montant, prev.date_limite, selectedType?.nom),
    }));
  };

  // Changement du montant global dans le modal
  const handleTotalMontantChange = (val) => {
    const num = parseFloat(val) || 0;
    const selectedType = fraisTypes.find((ft) => String(ft.id) === String(formData.frais_type_id));

    setFormData((prev) => ({
      ...prev,
      montant: val,
      echeances: generateDefaultEcheances(prev.mode_paiement, num, prev.date_limite, selectedType?.nom),
    }));
  };

  // Mise à jour d'une échéance spécifique
  const updateEcheanceField = (index, field, value) => {
    setFormData((prev) => {
      const nextEch = [...prev.echeances];
      nextEch[index] = { ...nextEch[index], [field]: value };
      return { ...prev, echeances: nextEch };
    });
  };

  // Ajouter une tranche personnalisée
  const addEcheanceRow = () => {
    setFormData((prev) => ({
      ...prev,
      echeances: [
        ...prev.echeances,
        {
          nom: `Tranche ${prev.echeances.length + 1}`,
          montant: 0,
          date_limite: "",
          ordre: prev.echeances.length + 1,
          type: prev.mode_paiement === "mensuel" ? "mensualite" : "tranche",
        },
      ],
    }));
  };

  // Supprimer une tranche personnalisée
  const removeEcheanceRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      echeances: prev.echeances.filter((_, idx) => idx !== index),
    }));
  };

  // Total cumulé actuel des échéances
  const totalEcheancesSum = useMemo(() => {
    return (formData.echeances || []).reduce((sum, item) => sum + (parseFloat(item.montant) || 0), 0);
  }, [formData.echeances]);

  // Validation & Enregistrement
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.frais_type_id) {
      toast.error("Veuillez sélectionner un type de frais.");
      return;
    }

    if (formData.classe_ids.length === 0) {
      toast.error("Veuillez sélectionner au moins une classe.");
      return;
    }

    const totalMontant = parseFloat(formData.montant) || 0;
    if (totalMontant <= 0) {
      toast.error("Le montant total doit être supérieur à zéro.");
      return;
    }

    setFormSubmitting(true);

    if (editingFraisClasse) {
      // Modification
      router.put(
        route("frais_classes.update", editingFraisClasse.id),
        {
          montant: totalMontant,
          mode_paiement: formData.mode_paiement,
          description: formData.description,
          date_limite: formData.date_limite || null,
          echeances: formData.echeances,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success("Frais et échéancier mis à jour ✅");
            setIsModalOpen(false);
            setFormSubmitting(false);
          },
          onError: (err) => {
            toast.error("Erreur lors de la mise à jour");
            setFormSubmitting(false);
          },
        }
      );
    } else {
      // Création
      router.post(
        route("frais_classes.store"),
        {
          classe_ids: formData.classe_ids,
          frais_type_id: formData.frais_type_id,
          montant: totalMontant,
          mode_paiement: formData.mode_paiement,
          description: formData.description,
          date_limite: formData.date_limite || null,
          echeances: formData.echeances,
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            toast.success("Frais configuré avec succès ✅");
            setIsModalOpen(false);
            setFormSubmitting(false);
          },
          onError: (err) => {
            toast.error("Erreur lors de la création");
            setFormSubmitting(false);
          },
        }
      );
    }
  };

  // Suppression d'un frais
  const handleDeleteFrais = (fraisClasse) => {
    const nomFrais = fraisClasse.frais_type?.nom || "ce frais";
    const nomClasse = fraisClasse.classe?.nom || "cette classe";

    if (!confirm(`Supprimer définitivement le frais « ${nomFrais} » pour la classe ${nomClasse} ?`)) {
      return;
    }

    router.delete(route("frais_classes.destroy", fraisClasse.id), {
      preserveScroll: true,
      onSuccess: () => toast.success("Frais supprimé ✅"),
      onError: () => toast.error("Erreur lors de la suppression."),
    });
  };

  // Application du barème officiel 1-clic
  const applyOfficialSchedule = () => {
    if (
      !confirm(
        "Voulez-vous appliquer le barème officiel de scolarité Sagesse Divine à toutes les classes ?\n\n• Crèche (8h-13h) : 20 000 FCFA/mois (180 000 FCFA/an)\n• Crèche (8h-16h) : 30 000 FCFA/mois (270 000 FCFA/an)\n• Maternelle (3, 4, 5 ans) : 20 000 FCFA/mois (180 000 FCFA/an)\n• Primaire (1ère, 2ème, 3ème Année) : 20 000 FCFA/mois (180 000 FCFA/an)\n• Primaire 4ème Année : 25 000 FCFA/mois (225 000 FCFA/an)\n• Primaire 5ème Année : 30 000 FCFA/mois (270 000 FCFA/an)\n• Secondaire (Hors Examen) : 135 000 FCFA en 3 tranches\n• Secondaire (Examen 3ème & Tle) : 145 000 FCFA en 3 tranches"
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
          toast.success("Barème officiel appliqué avec succès ✅");
          setIsApplyingBareme(false);
        },
        onError: () => {
          toast.error("Erreur lors de l'application du barème.");
          setIsApplyingBareme(false);
        },
      }
    );
  };

  // Gestion du dépliage d'une classe
  const toggleClassExpand = (classeId) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [classeId]: !prev[classeId],
    }));
  };

  if (!currentSchoolYear) {
    return (
      <DashboardLayout title={t("frais_classes_management", "Frais par Classe")}>
        <div className="p-8 text-center text-red-500 font-bold bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-red-100">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          Aucune année scolaire active. Veuillez en activer une dans les paramètres.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("frais_classes_management", "Configuration des Frais par Classe")}>
      {/* 1. EN-TÊTE PRINCIPAL */}
      <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0 text-blue-300">
              <LayoutGrid className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Gestion des Frais & Échéanciers par Classe
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Année Scolaire {currentSchoolYear.nom}
                </span>
              </div>
              <p className="text-blue-100/80 font-medium text-sm max-w-3xl leading-relaxed">
                Paramétrez tout type de frais pour vos classes : <strong>Scolarité</strong>, <strong>Frais d'Examen</strong> (CEPE, BEPC, BAC), Informatique, Travaux Pratiques... avec rythme de paiement <strong>en 1 fois</strong>, par <strong>tranches</strong> ou par <strong>mensualités</strong>.
              </p>
            </div>
          </div>

          {/* BOUTONS D'ACTION HAUT DE PAGE */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={applyOfficialSchedule}
              disabled={isApplyingBareme}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white px-5 py-3 rounded-2xl border border-white/10 font-bold flex items-center justify-center gap-2.5 transition-all text-xs sm:text-sm active:scale-95 shadow-sm"
              title="Calibrer automatiquement la scolarité de base selon le barème officiel"
            >
              <RefreshCw className={`w-4 h-4 ${isApplyingBareme ? "animate-spin" : ""}`} />
              <span>Barème Scolarité 1-Clic</span>
            </button>

            <button
              onClick={() => openCreateModal()}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/30 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>+ Configurer un Frais</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS RAPIDES & GUIDE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classes Configurées</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
              {totalClassesConfigured} <span className="text-xs font-normal text-slate-400">/ {classes.length} classes</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Types de Frais Disponibles</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
              {fraisTypes.length} <span className="text-xs font-normal text-slate-400">catégories</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rythmes de Paiement</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span> Unique •
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span> Tranches •
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span> Mois
            </p>
          </div>
        </div>
      </div>

      {/* 3. BARRE DE FILTRES ET DE RECHERCHE */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm mb-8 space-y-4">
        {/* Onglets de sections */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-4">
          <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wide">Section :</span>
          {[
            { id: "all", label: "Toutes les Sections", icon: Layers },
            { id: "creche", label: "Crèche", icon: Baby },
            { id: "maternelle", label: "Maternelle", icon: Baby },
            { id: "primaire", label: "Primaire", icon: BookOpen },
            { id: "secondaire", label: "Secondaire", icon: GraduationCap },
          ].map((sec) => {
            const Icon = sec.icon;
            const active = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#0B1A2D] text-white shadow-md shadow-slate-900/20 dark:bg-blue-600"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Barre de recherche et filtre frais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une classe (ex: 3ème, CM2, 5 ans...)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedFraisTypeFilter}
              onChange={(e) => setSelectedFraisTypeFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">Tous les types de frais (Scolarité, Examens, etc.)</option>
              {fraisTypes.map((ft) => (
                <option key={ft.id} value={ft.id}>
                  Filtrer par : {ft.nom} {ft.is_scolarite ? "(Scolarité)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. LISTE DES CLASSES ET LEURS FRAIS */}
      <div className="space-y-6">
        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">Aucune classe ne correspond à vos filtres</p>
            <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou sélectionnez une autre section.</p>
          </div>
        ) : (
          filteredClasses.map((classe) => {
            const classFees = existingFrais[classe.id] || [];
            const totalAnnuel = classFees.reduce((acc, f) => acc + (parseFloat(f.montant) || 0), 0);
            const isExpanded = expandedClasses[classe.id] ?? true;

            return (
              <div
                key={classe.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden transition-all"
              >
                {/* EN-TÊTE DE LA CLASSE */}
                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-600 text-blue-600 dark:text-blue-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">{classe.nom}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {classe.type?.toUpperCase()}
                        </span>
                        {classe.isClasseExamen && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Classe d'Examen
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {classFees.length === 0 ? "Aucun frais rattaché pour l'instant" : `${classFees.length} frais configuré(s)`}
                      </p>
                    </div>
                  </div>

                  {/* CUMUL & BOUTONS D'ACTION */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-semibold text-slate-400 block">Total général exigible :</span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {formatMoney(totalAnnuel)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openCreateModal(classe.id)}
                        className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800"
                        title="Ajouter un frais (examen, scolarité, activité...) à cette classe"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter Frais</span>
                      </button>

                      <button
                        onClick={() => toggleClassExpand(classe.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={isExpanded ? "Replier la classe" : "Déplier la classe"}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* CONTENU : LISTE DES FRAIS DE CETTE CLASSE */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4">
                    {classFees.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                          Cette classe ne comporte aucun frais spécifique enregistré pour l'année en cours.
                        </p>
                        <button
                          onClick={() => openCreateModal(classe.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Configurer un premier frais
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {classFees.map((frais) => {
                          const echeances = frais.echeances || [];
                          const mode = frais.mode_paiement || (echeances.length > 1 ? (echeances[0]?.type === "mensualite" ? "mensuel" : "tranches") : "unique");

                          return (
                            <div
                              key={frais.id}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                              <div>
                                {/* TITRE DU FRAIS + BADGE MODE */}
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-base font-black text-slate-800 dark:text-white">
                                        {frais.frais_type?.nom || "Frais"}
                                      </h3>
                                      {frais.frais_type?.is_scolarite && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                          Scolarité
                                        </span>
                                      )}
                                    </div>
                                    {frais.description && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                        {frais.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* BADGE MODE DE PAIEMENT */}
                                  <div>
                                    {mode === "unique" && (
                                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                                        <Wallet className="w-3 h-3" /> Unique
                                      </span>
                                    )}
                                    {mode === "tranches" && (
                                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {echeances.length || 3} Tranches
                                      </span>
                                    )}
                                    {mode === "mensuel" && (
                                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {echeances.length || 9} Mois
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* MONTANT TOTAL */}
                                <div className="mt-2 mb-3 flex items-baseline justify-between">
                                  <span className="text-xs font-semibold text-slate-400">Montant total :</span>
                                  <span className="text-xl font-black text-blue-700 dark:text-blue-400 font-mono">
                                    {formatMoney(frais.montant)}
                                  </span>
                                </div>

                                {/* DÉTAIL DES ÉCHÉANCES */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                      Échéancier ({echeances.length}) :
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {echeances.map((ech, idx) => (
                                      <div
                                        key={ech.id || idx}
                                        className="text-xs flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50"
                                      >
                                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                          {ech.nom}
                                        </span>
                                        <div className="flex items-center gap-3">
                                          {ech.date_limite && (
                                            <span className="text-[11px] text-slate-400">
                                              Limite: {new Date(ech.date_limite).toLocaleDateString("fr-FR")}
                                            </span>
                                          )}
                                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            {formatMoney(ech.montant)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* BOUTONS ACTIONS SUR CE FRAIS */}
                              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(frais)}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Modifier</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteFrais(frais)}
                                  className="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Supprimer</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. MODAL LARGE HORIZONTAL UI/UX HAUT DE GAMME */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-w-6xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* EN-TÊTE PREMIUM DU MODAL */}
              <div className="relative bg-[#0B1A2D] dark:bg-slate-950 text-white p-6 sm:px-8 sm:py-6 shrink-0 border-b border-white/10 flex items-center justify-between">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative flex items-center gap-4 z-10">
                  <div className="p-3 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-2xl shadow-sm shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {editingFraisClasse ? "Modifier le Frais de Classe" : "Studio de Configuration des Frais"}
                      </h3>
                      <span className="text-[11px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                        {currentSchoolYear.nom}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200/70 mt-0.5">
                      Paramétrez le montant, le mode de paiement et l'échéancier financier sur-mesure.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="relative z-10 p-2.5 text-slate-400 hover:text-white rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CORPS DU MODAL : SPLIT HORIZONTAL 2 COLONNES */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* COLONNE GAUCHE (5 / 12) : PARAMÉTRAGE DE BASE */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* 1. CLASSE(S) CIBLÉE(S) */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span>1. Classe(s) Cible(s)</span>
                        </label>
                        {!editingFraisClasse && (
                          <div className="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, classe_ids: classes.map((c) => c.id) }))}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              Tout cocher
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, classe_ids: [] }))}
                              className="text-slate-400 hover:underline"
                            >
                              Effacer
                            </button>
                          </div>
                        )}
                      </div>

                      {editingFraisClasse ? (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900 text-sm font-black text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {editingFraisClasse.classe?.nom} ({editingFraisClasse.classe?.type?.toUpperCase()})
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 pr-1">
                            {classes.map((cls) => {
                              const isChecked = formData.classe_ids.includes(cls.id);
                              return (
                                <button
                                  type="button"
                                  key={cls.id}
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      classe_ids: isChecked
                                        ? prev.classe_ids.filter((id) => id !== cls.id)
                                        : [...prev.classe_ids, cls.id],
                                    }));
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isChecked
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3.5 h-3.5" />}
                                  <span>{cls.nom}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            💡 <strong>{formData.classe_ids.length}</strong> classe(s) sélectionnée(s). Ce frais leur sera automatiquement appliqué.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 2. CATÉGORIE DU FRAIS & MONTANT TOTAL */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>2. Type de Frais</span>
                        </label>
                        <select
                          value={formData.frais_type_id}
                          onChange={(e) => {
                            const newTypeId = e.target.value;
                            const ft = fraisTypes.find((item) => String(item.id) === String(newTypeId));
                            setFormData((prev) => ({
                              ...prev,
                              frais_type_id: newTypeId,
                              montant: prev.montant || ft?.montant || "",
                            }));
                          }}
                          disabled={Boolean(editingFraisClasse)}
                          className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 shadow-sm"
                          required
                        >
                          <option value="">Sélectionner un frais (Examen, Scolarité...)</option>
                          {fraisTypes.map((ft) => (
                            <option key={ft.id} value={ft.id}>
                              {ft.nom} {ft.is_scolarite ? "— [Scolarité Annuelle]" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                          <span>3. Montant Total Exigible</span>
                          <span className="text-[11px] font-bold text-blue-600">Devise : FCFA</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={formData.montant}
                            onChange={(e) => handleTotalMontantChange(e.target.value)}
                            placeholder="Ex: 135000"
                            className="w-full py-3 pl-4 pr-16 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-xl text-lg font-black font-mono text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 shadow-sm"
                            required
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                            FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. RYTHME DE PAIEMENT */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>4. Rythme de Paiement</span>
                      </label>

                      <div className="grid grid-cols-3 gap-2">
                        {/* UNIQUE */}
                        <button
                          type="button"
                          onClick={() => handleModeChange("unique")}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                            formData.mode_paiement === "unique"
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm font-black"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${formData.mode_paiement === "unique" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Wallet className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold leading-tight">En 1 Fois (Unique)</span>
                        </button>

                        {/* TRANCHES */}
                        <button
                          type="button"
                          onClick={() => handleModeChange("tranches")}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                            formData.mode_paiement === "tranches"
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-sm font-black"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${formData.mode_paiement === "tranches" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold leading-tight">Par Tranches</span>
                        </button>

                        {/* MENSUEL */}
                        <button
                          type="button"
                          onClick={() => handleModeChange("mensuel")}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                            formData.mode_paiement === "mensuel"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-sm font-black"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${formData.mode_paiement === "mensuel" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold leading-tight">Par Mois (9m)</span>
                        </button>
                      </div>
                    </div>

                    {/* 4. DESCRIPTION FACULTATIVE */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Consigne / Note explicative (Optionnelle)
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Ex: Frais obligatoires pour les épreuves du BEPC..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* COLONNE DROITE (7 / 12) : STUDIO D'ÉCHÉANCIER EN DIRECT */}
                  <div className="lg:col-span-7 bg-slate-50/90 dark:bg-slate-800/80 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700 flex flex-col justify-between h-full">
                    <div>
                      {/* Entête du studio */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 gap-3 mb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <CalendarRange className="w-5 h-5 text-blue-600" />
                            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                              Studio d'Échéancier ({formData.echeances.length} échéance{formData.echeances.length > 1 ? "s" : ""})
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Personnalisez les intitulés, montants partiels et dates limites de versement.
                          </p>
                        </div>

                        {formData.mode_paiement !== "unique" && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const total = parseFloat(formData.montant) || 0;
                                const count = formData.echeances.length;
                                if (count === 0 || total <= 0) return;
                                const base = Math.floor(total / count);
                                const rem = total - base * count;
                                setFormData((prev) => ({
                                  ...prev,
                                  echeances: prev.echeances.map((ech, idx) => ({
                                    ...ech,
                                    montant: idx === 0 ? base + rem : base,
                                  })),
                                }));
                                toast.success("Montants équilibrés !");
                              }}
                              className="px-2.5 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center gap-1 transition-all shadow-sm"
                              title="Répartir le montant total équitablement"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                              <span>Équilibrer</span>
                            </button>

                            <button
                              type="button"
                              onClick={addEcheanceRow}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Tranche</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* JAUGE DE VÉRIFICATION DU TOTAL */}
                      <div className="mb-5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-bold text-slate-500">Équilibre de l'échéancier :</span>
                          <span
                            className={`font-mono font-black text-sm ${
                              Math.abs(totalEcheancesSum - (parseFloat(formData.montant) || 0)) < 1
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {formatMoney(totalEcheancesSum)} / {formatMoney(formData.montant || 0)}
                          </span>
                        </div>

                        {/* Barre de progression */}
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              Math.abs(totalEcheancesSum - (parseFloat(formData.montant) || 0)) < 1
                                ? "bg-emerald-500"
                                : totalEcheancesSum < (parseFloat(formData.montant) || 0)
                                ? "bg-blue-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${
                                parseFloat(formData.montant) > 0
                                  ? Math.min(100, (totalEcheancesSum / parseFloat(formData.montant)) * 100)
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>

                        {/* Statut textuel */}
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          {Math.abs(totalEcheancesSum - (parseFloat(formData.montant) || 0)) < 1 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Répartition parfaite : somme des échéances conforme au montant total.
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Écart : {formatMoney(totalEcheancesSum - (parseFloat(formData.montant) || 0))} restant à ajuster.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* LISTE DÉTAILLÉE DES ÉCHÉANCES */}
                      {formData.mode_paiement === "unique" ? (
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <Wallet className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-800 dark:text-white">Paiement Comptant (1 seule fois)</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              La totalité du montant ({formatMoney(formData.montant || 0)}) est exigible en un seul versement.
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>Date limite d'exigibilité :</span>
                            <input
                              type="date"
                              value={formData.date_limite}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  date_limite: val,
                                  echeances: prev.echeances.map((ech) => ({ ...ech, date_limite: val })),
                                }));
                              }}
                              className="bg-transparent border-0 font-bold text-blue-600 focus:ring-0 p-0 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                          {formData.echeances.map((ech, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={ech.nom}
                                  onChange={(e) => updateEcheanceField(idx, "nom", e.target.value)}
                                  placeholder="Intitulé tranche"
                                  className="w-full sm:w-44 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <input
                                    type="date"
                                    value={ech.date_limite || ""}
                                    onChange={(e) => updateEcheanceField(idx, "date_limite", e.target.value)}
                                    className="bg-transparent border-0 text-[11px] font-medium text-slate-600 dark:text-slate-300 p-0 focus:ring-0"
                                  />
                                </div>

                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="500"
                                    value={ech.montant}
                                    onChange={(e) => updateEcheanceField(idx, "montant", parseFloat(e.target.value) || 0)}
                                    placeholder="Montant"
                                    className="w-28 px-2.5 py-1.5 text-xs font-black font-mono text-blue-700 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-right focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>

                                {formData.echeances.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEcheanceRow(idx)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    title="Supprimer cette échéance"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Résumé de fin de colonne droite */}
                    <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                      <span>Calendrier synchronisé avec le Journal de Caisse & Reçus</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">
                        {formData.echeances.length} versement(s) prévus
                      </span>
                    </div>
                  </div>
                </div>

                {/* BARRE D'ACTIONS INFERIEURE DU MODAL */}
                <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    * Tous les paramètres d'échéances seront immédiatement effectifs pour les inscriptions et paiements.
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors text-xs sm:text-sm"
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50 text-xs sm:text-sm flex items-center gap-2.5 active:scale-95"
                    >
                      {formSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{editingFraisClasse ? "Enregistrer les modifications" : "Valider et Appliquer le Frais"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

