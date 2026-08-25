// resources/js/Pages/Classes/Index.jsx
import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { PencilSquareIcon, TrashIcon, FunnelIcon, MagnifyingGlassIcon, PlusCircleIcon, PresentationChartLineIcon, ListBulletIcon, UsersIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from 'framer-motion';

function ClasseForm({ classe, onClose }) {
  const { t } = useTranslation();
  const form = useForm({
    nom: classe?.nom || "",
    type: classe?.type || "",
  });

  const submit = (e) => {
    e.preventDefault();
    if (classe) {
      form.put(route("classes.update", classe.id), {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    } else {
      form.post(route("classes.store"), {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    }
  };

  useEffect(() => {
    if (!classe) {
      form.reset("nom", "type");
    } else {
      form.setData({
        nom: classe.nom,
        type: classe.type,
      });
    }
  }, [classe]);

  const TYPES = [
    { value: 'maternelle', label: t('maternelle', 'Maternelle') },
    { value: 'primaire', label: t('primaire', 'Primaire') },
    { value: 'secondaire', label: t('secondaire', 'Secondaire') },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
          <PresentationChartLineIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">{classe ? t("edit_class", "Modifier la classe") : t("create_class", "Nouvelle Classe")}</h2>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("nom", "Nom de la Classe")}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ListBulletIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Ex: 6ème A, Maternelle Grande Section..."
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium
                 ${form.errors.nom ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}
               `}
              value={form.data.nom}
              onChange={(e) => form.setData("nom", e.target.value)}
            />
          </div>
          {form.errors.nom && <p className="text-red-500 text-xs font-semibold mt-1">{form.errors.nom}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t("type", "Cycle (Type)")}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium
                 ${form.errors.type ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}
               `}
              value={form.data.type}
              onChange={(e) => form.setData("type", e.target.value)}
            >
              <option value="">{t("select_type", "Sélectionner un cycle d'enseignement")}</option>
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {form.errors.type && <p className="text-red-500 text-xs font-semibold mt-1">{form.errors.type}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition"
          >
            {t("cancel", "Annuler")}
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className="bg-green-500 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-green-600 transition shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center gap-2"
          >
            {form.processing && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {classe ? t("update", "Enregistrer") : t("create", "Ajouter")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Index({ classes, filters, can }) {
  const { t } = useTranslation();
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search || "");
  const [filterType, setFilterType] = useState(filters.type || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);

  const TYPES = [
    { value: 'maternelle', label: t('maternelle', 'Maternelle') },
    { value: 'primaire', label: t('primaire', 'Primaire') },
    { value: 'secondaire', label: t('secondaire', 'Secondaire') },
  ];

  // 🔎 Recherche/filtre avec debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route("classes.index"),
        { search, type: filterType },
        { preserveState: true, replace: true }
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, filterType]);

  const openCreateModal = () => {
    setEditingClasse(null);
    setModalOpen(true);
  };

  const openEditModal = (classe) => {
    setEditingClasse(classe);
    setModalOpen(true);
  };

  const destroy = (id) => {
    if (!confirm(t("confirm_delete", "⚠️ Supprimer cette classe ?"))) return;
    router.delete(route("classes.destroy", id), {
      preserveScroll: true,
    });
  };

  const getSectionBadgeColor = (type) => {
    switch (type) {
      case 'maternelle': return 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
      case 'primaire': return 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
      case 'secondaire': return 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <DashboardLayout title={t("classes_management", "Gestion des Classes")}>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            {t("classes_list", "Salles de Classe")}
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-sm font-bold shadow-sm border border-blue-200 dark:border-blue-800/50">
              {classes.total || 0}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gérez toutes les salles de classe réparties par cycle d'enseignement.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {can?.create_classes && (
            <button
              onClick={openCreateModal}
              className="group flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-green-500/30 transition-all active:scale-95"
            >
              <PlusCircleIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>{t("add_class", "Nouvelle Classe")}</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTRES & RECHERCHE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t("search_class", "Rechercher par nom de classe...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium"
            >
              <option value="">{t("all_types", "Tous les cycles")}</option>
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
        <ClasseForm
          key={editingClasse ? `edit-${editingClasse.id}` : "new"}
          classe={editingClasse}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      {/* TABLE SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 rounded-3xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-[#0B1A2D] text-slate-300">
              <tr className="text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-5 rounded-tl-3xl">{t("nom", "Nom de la Classe")}</th>
                <th className="px-6 py-5">{t("nombre_eleves", "Élèves inscrits")}</th>
                <th className="px-6 py-5">{t("type", "Cycle / Niveau")}</th>
                <th className="px-6 py-5 text-center rounded-tr-3xl">{t("actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {classes.data.length > 0 ? (
                classes.data.map((classe) => (
                  <tr key={classe.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1A2D] to-blue-800 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
                          {classe.nom.charAt(0)}
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors text-base">
                          {classe.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={route('eleves.index', { classe_id: classe.id })}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group-hover:text-indigo-600"
                        title="Voir l'effectif"
                      >
                        <span className="inline-flex items-center justify-center px-4 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-lg text-sm font-black border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors">
                          {classe.inscriptions_count || 0}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">élèves</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getSectionBadgeColor(classe.type)}`}>
                        {classe.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          href={route('eleves.index', { classe_id: classe.id })}
                          className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-500 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                          title="Voir l'effectif"
                        >
                          <UsersIcon className="w-5 h-5" />
                        </Link>
                        {can?.edit_classes && (
                          <button
                            onClick={() => openEditModal(classe)}
                            className="p-2.5 text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
                            title={t("edit")}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                        )}
                        {can?.delete_classes && (
                          <button
                            onClick={() => destroy(classe.id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            title={t("delete")}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(can?.edit_classes || can?.delete_classes) ? "4" : "3"} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <PresentationChartLineIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <span>{t("no_classes_found", "Aucune classe trouvée. Créez-en une pour commencer !")}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {classes.links && classes.links.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap justify-center sm:justify-end gap-2">
            {classes.links.map((link, i) => (
              <Link
                key={i}
                href={link.url || "#"}
                preserveScroll
                preserveState
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${link.active
                    ? "bg-[#0B1A2D] text-white shadow-md"
                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                  } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
