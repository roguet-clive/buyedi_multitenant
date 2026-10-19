import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Search, 
  X, 
  Tag, 
  ArrowRight, 
  Layers, 
  School, 
  Check, 
  Info,
  CalendarCheck,
  CreditCard
} from 'lucide-react';

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
        globale: fraisType.globale ?? true,
        is_scolarite: fraisType.is_scolarite ?? false,
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
        onError: () => toast.error(t("update_failed", "Échec de la modification")),
      });
    } else {
      form.post(route("frais_types.store"), {
        onSuccess: () => {
          onClose();
        },
        onError: () => toast.error(t("creation_failed", "Échec de la création")),
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Modale */}
      <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-800">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {fraisType ? "Modifier la Rubrique Comptable" : "Nouvelle Rubrique Comptable"}
            </h2>
            <p className="text-slate-500 font-medium text-xs md:text-sm">
              Définition dans le catalogue officiel des types de frais de l'établissement.
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={submit} className="p-6 md:p-8 flex flex-col gap-6">
        {/* Nom du frais */}
        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Libellé officiel de la rubrique <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border-slate-200 dark:border-slate-700 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            value={form.data.nom}
            onChange={(e) => form.setData("nom", e.target.value)}
            placeholder="Ex: Frais d'Examen d'État, Tenue de sport, Cantine scolaire..."
            required
          />
          {form.errors.nom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.nom}</p>}
        </div>

        {/* Grille Montant de référence + Code Système */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tarif indicatif par défaut
            </label>
            <div className="relative">
              <input
                type="number"
                disabled={form.data.is_scolarite}
                className="w-full border-slate-200 dark:border-slate-700 p-3.5 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800 disabled:opacity-40 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-black font-mono text-blue-600 dark:text-blue-400 text-base"
                value={form.data.montant}
                onChange={(e) => form.setData("montant", parseFloat(e.target.value) || 0)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">F</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              {form.data.is_scolarite 
                ? "Désactivé car le tarif de scolarité varie par classe."
                : "Montant suggéré automatiquement lors de l'application aux classes."}
            </p>
            {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.montant}</p>}
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Code Système (Mapping Métier)
            </label>
            <select
              className="w-full border-slate-200 dark:border-slate-700 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={form.data.code || ""}
              onChange={(e) => form.setData("code", e.target.value)}
            >
              <option value="">Standard (Rubrique libre)</option>
              <option value="inscription">Frais d'Inscription</option>
              <option value="reinscription">Frais de Réinscription</option>
              <option value="tenue">Tenue Scolaire (Uniforme)</option>
              <option value="tenue_sport">Tenue de Sport</option>
              <option value="bulletin_assurance">Assurance & Bulletin</option>
              <option value="examen">Frais d'Examen d'État (BEPC/BAC)</option>
              <option value="carte">Carte Scolaire</option>
              <option value="divers">Frais Divers</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              Permet l'automatisation dans les registres d'inscription et états fournisseurs.
            </p>
            {form.errors.code && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.code}</p>}
          </div>
        </div>

        {/* Nature Scolarité */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 mt-0.5"
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
            <div>
              <span className="block font-bold text-sm text-slate-800 dark:text-slate-200">
                Il s'agit de la Scolarité Principale (Pension annuelle)
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                Cochez uniquement s'il s'agit de la contribution de scolarité des élèves (utilisée pour les relevés de scolarité et impayés mensuels).
              </span>
            </div>
          </label>
        </div>

        {/* Info Passerelle */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300">
          <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Déploiement sur le terrain : </span>
            Pour définir si ce frais s'applique à toute l'école ou à des classes précises (avec paiement en tranches, unique ou mensuel), utilisez la page 
            <strong className="underline ml-1">Gestion des Frais par Classe</strong>.
          </div>
        </div>

        {/* Actions Modale */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-60 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{fraisType ? "Enregistrer les modifications" : "Créer la rubrique"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Index({ fraisTypes, filters = {}, totalClassesCount = 0, currentYear = null, auth }) {
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

  const destroy = (id, nom) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la rubrique comptable "${nom}" ?`)) return;
    router.delete(route("frais_types.destroy", id), {
      preserveScroll: true,
      onSuccess: () => {},
      onError: () => toast.error(t("delete_failed", "Impossible de supprimer cette rubrique")),
    });
  };

  const fraisTypesData = fraisTypes.data ?? [];
  const fraisTypesLinks = fraisTypes.links ?? [];

  return (
    <DashboardLayout title="Nomenclature des Frais">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Catalogue Comptable & Nomenclature</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Types de Frais & Rubriques
          </h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm mt-0.5">
            Dictionnaire des natures de frais facturés par l'établissement pour l'année scolaire <strong>{currentYear?.nom || 'en cours'}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une rubrique..."
              className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <Link
            href={route("frais_classes.index")}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm border border-slate-200 dark:border-slate-700"
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Grille par Classe</span>
          </Link>

          {can("ajouter_frais_types") && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 font-bold transition-all active:scale-95 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Rubrique</span>
            </button>
          )}
        </div>
      </div>

      {/* Bannière Passerelle Pédagogique */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Comment fonctionne la tarification ?</h4>
            <p className="text-xs text-blue-100 mt-0.5">
              Cette page définit le catalogue des rubriques. Pour fixer les prix exacts par classe, les dates limites et les échéanciers, utilisez la gestion par classe.
            </p>
          </div>
        </div>
        <Link
          href={route("frais_classes.index")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow transition-all shrink-0 active:scale-95"
        >
          <span>Ouvrir la Grille par Classe</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Modal Formulaire */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="2xl">
        <FraisTypeForm
          key={editingFraisType ? `edit-${editingFraisType.id}` : "new"}
          fraisType={editingFraisType}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      {/* Tableau des Types de Frais */}
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0B1A2D] text-white">
              <tr>
                <th className="p-4 font-bold tracking-wide uppercase text-xs">Rubrique & Nomenclature</th>
                <th className="p-4 font-bold tracking-wide uppercase text-xs text-right w-44">Tarif Indicatif</th>
                <th className="p-4 font-bold tracking-wide uppercase text-xs text-center w-56">Couverture Classes</th>
                <th className="p-4 font-bold tracking-wide uppercase text-xs text-center w-48">Passerelle & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {fraisTypesData.length > 0 ? (
                fraisTypesData.map((fraisType) => {
                  const classesConfigured = fraisType.frais_classes_count ?? 0;
                  const isTotalSchool = totalClassesCount > 0 && classesConfigured >= totalClassesCount;

                  return (
                    <tr key={fraisType.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* Rubrique & Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            fraisType.is_scolarite 
                              ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700'
                          }`}>
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {fraisType.nom}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {fraisType.code && (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {fraisType.code}
                                </span>
                              )}
                              {fraisType.is_scolarite ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                  Scolarité Principale
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                  Frais Annexe / Prestation
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tarif indicatif */}
                      <td className="p-4 text-right">
                        {fraisType.is_scolarite ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                              Barème par classe
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Spécifique à chaque cycle</span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">
                              {(fraisType.montant ?? 0).toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-sans font-bold">FCFA</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">Tarif de référence</span>
                          </div>
                        )}
                      </td>

                      {/* Couverture par classe */}
                      <td className="p-4 text-center">
                        {classesConfigured > 0 ? (
                          <div className="inline-flex flex-col items-center">
                            {isTotalSchool ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3.5 h-3.5" />
                                <span>Toute l'école ({classesConfigured} classes)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                                <CalendarCheck className="w-3.5 h-3.5" />
                                <span>{classesConfigured} classe(s) assignée(s)</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold">
                            Non déployé (0 classe)
                          </span>
                        )}
                      </td>

                      {/* Actions & Passerelle */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={route("frais_classes.index", { search: fraisType.nom })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-xl transition-all"
                            title="Ouvrir la gestion par classe pour ce frais"
                          >
                            <span>Configurer</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {can("modifier_frais_types") && (
                            <button
                              onClick={() => openEditModal(fraisType)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title={t("edit", "Modifier")}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {can("supprimer_frais_types") && (
                            <button
                              onClick={() => destroy(fraisType.id, fraisType.nom)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title={t("delete", "Supprimer")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-12 text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                      <p className="font-bold">Aucune rubrique comptable trouvée.</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Cliquez sur "Nouvelle Rubrique" pour créer un nouveau type de frais (ex: Tenue, Examen, Transport, etc.).
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {fraisTypesLinks.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2">
            <span className="text-xs text-slate-400">
              Affichage des rubriques comptables du catalogue
            </span>
            <div className="flex flex-wrap gap-1.5">
              {fraisTypesLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.url || "#"}
                  preserveScroll
                  preserveState
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    link.active 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
