import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { Settings, Plus, Edit2, Trash2, CheckCircle2, Search, X, Tag } from 'lucide-react';

function FraisTypeForm({ fraisType, onClose }) {
  const { t } = useTranslation();
  const form = useForm({
    nom: fraisType?.nom || "",
    code: fraisType?.code || "",
    globale: fraisType?.globale ?? true,
    is_scolarite: fraisType?.is_scolarite ?? false,
    montant: fraisType?.montant ?? 0,
  });

  useEffect(() => {
    if (fraisType) {
      form.setData({
        nom: fraisType.nom,
        code: fraisType.code || "",
        globale: fraisType.globale,
        is_scolarite: fraisType.is_scolarite,
        montant: fraisType.montant ?? 0
      });
    } else {
      form.reset("nom", "code", "globale", "is_scolarite", "montant");
    }
  }, [fraisType]);

  const submit = (e) => {
    e.preventDefault();
    if (fraisType) {
      form.put(route("frais_types.update", fraisType.id), {
        onSuccess: () => {
          onClose();
        },
        onError: () => toast.error(t("update_failed")),
      });
    } else {
      form.post(route("frais_types.store"), {
        onSuccess: () => {
          onClose();
        },
        onError: () => toast.error(t("creation_failed")),
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
      {/* Header Modale */}
      <div className="p-6 md:p-8 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {fraisType ? t("edit_frais_type", "Modifier le Type de Frais") : t("create_frais_type", "Nouveau Type de Frais")}
            </h2>
            <p className="text-slate-500 font-medium text-sm">Configuration d'une rubrique comptable.</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={submit} className="p-6 md:p-8 flex flex-col gap-6">
        <div>
          <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("name", "Libellé de la rubrique")}</label>
          <input
            type="text"
            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={form.data.nom}
            onChange={(e) => form.setData("nom", e.target.value)}
            placeholder="Ex: Frais d'Inscription, Tenue de sport..."
          />
          {form.errors.nom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.nom}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("amount", "Montant par défaut")}</label>
            <div className="relative">
              <input
                type="number"
                disabled={form.data.is_scolarite}
                className="w-full border-slate-200 dark:border-slate-700 p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900 disabled:opacity-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-bold text-blue-600"
                value={form.data.montant}
                onChange={(e) => form.setData("montant", parseFloat(e.target.value))}
                title={form.data.is_scolarite ? "Désactivé car c'est la scolarité" : ""}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">XOF</span>
            </div>
            {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.montant}</p>}
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("system_code", "Code Système Mapping")}</label>
            <select
              className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={form.data.code || ""}
              onChange={(e) => form.setData("code", e.target.value)}
            >
              <option value="">{t("none", "Standard (Aucun code externe)")}</option>
              <option value="inscription">{t("code_inscription", "Frais d'Inscription")}</option>
              <option value="tenue">{t("code_tenue", "Tenue Scolaire")}</option>
              <option value="carte">{t("code_carte", "Carte d'Identité Scolaire")}</option>
              <option value="divers">{t("code_divers", "Frais Divers / Examens")}</option>
            </select>
            {form.errors.code && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.code}</p>}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <label className={`flex items-start gap-4 p-4 rounded-xl border ${form.data.globale ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700'} cursor-pointer transition-colors`}>
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500/20"
                checked={form.data.globale}
                onChange={(e) => form.setData("globale", e.target.checked)}
              />
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">Frais Global (Appartient à l'école)</span>
              <span className="block text-xs text-slate-500 mt-1">S'applique à tous les élèves sans distinction par défaut.</span>
            </div>
          </label>

          <label className={`flex items-start gap-4 p-4 rounded-xl border ${form.data.is_scolarite ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'} cursor-pointer transition-colors`}>
            <div className="flex h-6 items-center">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-blue-300 text-blue-500 focus:ring-blue-500/20"
                checked={form.data.is_scolarite}
                onChange={(e) => {
                  const isScolarite = e.target.checked;
                  form.setData({
                    ...form.data,
                    is_scolarite: isScolarite,
                    montant: isScolarite ? 0 : form.data.montant
                  });
                }}
              />
            </div>
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200">Il s'agit de la Scolarité Principale</span>
              <span className="block text-xs text-slate-500 mt-1">Le montant sera défini par classe dans la grille de scolarité.</span>
            </div>
          </label>
        </div>


        <div className="mt-4 pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {t("cancel", "Annuler")}
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70"
          >
            <CheckCircle2 className="w-5 h-5" />
            {fraisType ? t("update", "Enregistrer les modifications") : t("create", "Créer la rubrique")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Index({ fraisTypes, filters = {}, auth }) {
  const { t } = useTranslation();
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFraisType, setEditingFraisType] = useState(null);

  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);



  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route("frais_types.index"), { search }, { preserveState: true, replace: true });
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const openCreateModal = () => {
    setEditingFraisType(null);
    setModalOpen(true);
  };

  const openEditModal = (fraisType) => {
    setEditingFraisType(fraisType);
    setModalOpen(true);
  };

  const destroy = (id) => {
    if (!confirm(t("confirm_delete_frais_type"))) return;
    router.delete(route("frais_types.destroy", id), {
      preserveScroll: true,
      onSuccess: () => { },
      onError: () => toast.error(t("delete_failed")),
    });
  };

  const fraisTypesData = fraisTypes.data ?? [];
  const fraisTypesLinks = fraisTypes.links ?? [];

  return (
    <DashboardLayout title={t("frais_types_management")}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">
            {t("frais_types_list", "Configuration des Frais")}
          </h1>
          <p className="text-slate-500 font-medium">Définissez les différentes rubriques comptables et tarifs par défaut.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une rubrique..."
              className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {can("ajouter_frais_types") && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>{t("add_frais_type", "Nouvelle Rubrique")}</span>
            </button>
          )}
        </div>
      </div>

      <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="2xl">
        <FraisTypeForm
          key={editingFraisType ? `edit-${editingFraisType.id}` : "new"}
          fraisType={editingFraisType}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0B1A2D] text-white">
              <tr>
                <th className="p-4 font-bold tracking-wide uppercase text-xs">{t("nom", "Rubrique / Nom")}</th>
                <th className="p-4 font-bold tracking-wide uppercase text-xs text-right w-40">{t("amount", "Montant BASE")}</th>
                <th className="p-4 font-bold tracking-wide uppercase text-xs text-center">{t("global_fee", "Application")}</th>
                <th className="p-4 font-bold tracking-wide uppercase text-xs text-center w-32">{t("actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {fraisTypesData.length > 0 ? (
                fraisTypesData.map((fraisType) => (
                  <tr key={fraisType.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">{fraisType.nom}</div>
                      {fraisType.code && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                          {fraisType.code}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {fraisType.is_scolarite ? (
                        <span className="text-slate-400 italic text-sm">Dépend de la classe</span>
                      ) : (
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {(fraisType.montant ?? 0).toLocaleString()} <span className="text-xs text-slate-400">FCFA</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {fraisType.is_scolarite ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold whitespace-nowrap">
                            Scolarité
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold whitespace-nowrap">
                            Frais Annexe
                          </span>
                        )}
                        {fraisType.globale && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold whitespace-nowrap">
                            Global (Tous)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {can("modifier_frais_types") && (
                          <button
                            onClick={() => openEditModal(fraisType)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t("edit")}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {can("supprimer_frais_types") && (
                          <button
                            onClick={() => destroy(fraisType.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t("delete")}
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
                  <td colSpan="4" className="text-center p-8 text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      <p>{t("no_frais_types_found", "Aucune rubrique comptable trouvée.")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {fraisTypesLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {fraisTypesLinks.map((link, i) => (
              <Link
                key={i}
                href={link.url || "#"}
                preserveScroll
                preserveState
                className={`px-3 py-1 rounded ${link.active ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
