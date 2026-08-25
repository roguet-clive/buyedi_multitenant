import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import Modal from '@/Components/Modal';
import { Pencil, Trash2, CalendarDays, Plus, CheckCircle2, Star, Clock } from 'lucide-react';

function AnneeForm({ annee, onClose }) {
  const { t } = useTranslation();
  const form = useForm({
    nom: annee?.nom || '',
  });

  useEffect(() => {
    if (annee) {
      form.setData('nom', annee.nom);
    } else {
      form.reset('nom');
    }
  }, [annee]);

  const submit = (e) => {
    e.preventDefault();
    if (annee) {
      form.put(route('annee_scolaires.update', annee.id), {
        onSuccess: () => {
          onClose();
          form.reset();
        },
        onError: () => toast.error(t('annee_scolaire_update_failed', 'Erreur de mise à jour ❌')),
      });
    } else {
      form.post(route('annee_scolaires.store'), {
        onSuccess: () => {
          onClose();
          form.reset();
        },
        onError: () => toast.error(t('annee_scolaire_creation_failed', 'Erreur de création ❌')),
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className={`p-3 rounded-2xl ${annee ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
          {annee ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {annee ? t('edit_annee_scolaire', "Modifier l'année scolaire") : t('add_annee_scolaire', "Nouvelle année scolaire")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {annee ? "Modifiez le nom de l'année sélectionnée." : "Créez une nouvelle période pour enregistrer les données."}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('nom_annee', "Nom de l'année (ex: 2024-2025)")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.data.nom}
            onChange={(e) => form.setData('nom', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg placeholder:text-slate-400"
            placeholder="2024-2025"
            required
          />
          {form.errors.nom && <p className="text-red-500 text-sm mt-2">{form.errors.nom}</p>}
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors disabled:opacity-50"
            disabled={form.processing}
          >
            {t('cancel', "Annuler")}
          </button>
          <button
            type="submit"
            disabled={form.processing}
            className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 ${annee ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'}`}
          >
            {form.processing ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {annee ? t('update', "Mettre à jour") : t('create', "Créer l'année")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Index({ annees }) {
  const { t } = useTranslation();
  const { auth } = usePage().props;
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnee, setEditingAnnee] = useState(null);

  const openCreateModal = () => {
    setEditingAnnee(null);
    setModalOpen(true);
  };

  const openEditModal = (annee) => {
    setEditingAnnee(annee);
    setModalOpen(true);
  };

  const form = useForm({});

  const setCurrent = (id) => {
    if (!can('modifier_annee_scolaire')) {
      toast.error(t('permission_denied', '❌ Permission refusée'));
      return;
    }
    form.post(route('annee_scolaires.setCurrent', id), {
      preserveScroll: true,
      onError: () => toast.error(t('annee_scolaire_update_failed', 'Erreur lors de la mise à jour ❌')),
    });
  };

  const destroy = (id) => {
    if (!confirm(t('confirm_delete', 'Voulez-vous vraiment supprimer cette année scolaire ? Cette action est irréversible.'))) return;
    router.delete(route('annee_scolaires.destroy', id), {
      preserveScroll: true,
    });
  };

  return (
    <DashboardLayout title={t('annee_scolaires', "Gestions des Années Scolaires")}>
      <Head title={t('annee_scolaires', 'Années scolaires')} />

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-indigo-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block">
              <CalendarDays className="w-10 h-10 text-emerald-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-sm font-medium mb-3 border border-white/10 shadow-sm">
                <Clock className="w-4 h-4" />
                <span>{t("academic_timeline", "Chronologie Académique")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight drop-shadow-sm">
                {t("school_years", "Années Scolaires")}
              </h1>
              <p className="text-slate-300 text-base max-w-xl font-light">
                {t("school_years_desc", "Gérez les différentes périodes académiques de votre établissement. Définissez l'année active sur laquelle toutes les opérations courantes seront enregistrées.")}
              </p>
            </div>
          </div>

          {can('ajouter_annee_scolaire') && (
            <button
              onClick={openCreateModal}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group w-full md:w-auto mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              {t("add_year", "Ajouter une année")}
            </button>
          )}
        </div>
      </div>

      <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md">
        <AnneeForm
          annee={editingAnnee}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      {/* TABLEAU PREMIUM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative z-10 -mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1A2D] text-white">
                <th className="py-5 px-6 font-semibold text-sm tracking-wide rounded-tl-3xl uppercase">{t('nom', 'Période Scolaire')}</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide text-center uppercase">{t('current_status', 'Statut Actif')}</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide text-center uppercase rounded-tr-3xl w-40">{t('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {annees.length > 0 ? (
                annees.map((annee) => (
                  <tr
                    key={annee.id}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${annee.en_cours ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${annee.en_cours ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                          <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-slate-800 dark:text-white">{annee.nom}</p>
                          {annee.en_cours && (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-500">Année courante</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      {annee.en_cours ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-md shadow-amber-500/20">
                          <Star className="w-4 h-4 fill-white" />
                          <span>{t("active_year", "Année Active")}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCurrent(annee.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          {form.processing ? <Clock className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>}
                          <span>{t("set_active", "Définir active")}</span>
                        </button>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {can('modifier_annee_scolaire') && (
                          <button
                            onClick={() => openEditModal(annee)}
                            className="p-2.5 rounded-full text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10 transition-colors tooltip-trigger"
                            title={t('edit', 'Modifier')}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                        )}
                        {can('supprimer_annee_scolaire') && (
                          <button
                            onClick={() => destroy(annee.id)}
                            className="p-2.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 transition-colors tooltip-trigger"
                            title={t('delete', 'Supprimer')}
                            disabled={annee.en_cours} // Empêcher la suppression de l'année en cours
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <CalendarDays className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg font-medium">{t('no_school_years_found', 'Aucune année scolaire enregistrée')}</p>
                      <p className="text-sm mt-1">{t('add_first_year', 'Commencez par ajouter la première année académique.')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
