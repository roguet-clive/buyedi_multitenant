import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { UserIcon, AcademicCapIcon, BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function Create(props) {
  const { t } = useTranslation();
  // Unify props from page props to avoid confusion
  const {
    inscription,
    elevePreSelectionne,
    eleves: elevesProp = [],
    classes = [],
    annee_en_cours,
    fraisTypes = [], // Now an array of all FraisTypes
    flash
  } = props;

  // Helper to safely format date for input (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return dateString.split('T')[0];
  };

  // Helper to initialize fees state
  const initializeFees = () => {
    const feesState = {};
    fraisTypes.forEach(type => {
      feesState[type.id] = {
        selected: false,
        montant: type.montant || 0
      };
    });
    return feesState;
  };

  // Form state
  const { data, setData, post, put, processing, errors } = useForm({
    eleve_id: inscription?.eleve_id || elevePreSelectionne?.id || '',
    classe_id: inscription?.classe_id || '',
    date_inscription: formatDate(inscription?.date_inscription),
    frais: initializeFees(),
    statut: inscription?.statut || 'validee',
  });

  // Ensure form is updated if inscription loads late (optional, but safer)
  useEffect(() => {
    if (inscription) {
      setData((prev) => ({
        ...prev,
        eleve_id: inscription.eleve_id,
        classe_id: inscription.classe_id,
        date_inscription: formatDate(inscription.date_inscription),
      }));
    }
  }, [inscription]);

  // Handle fee change
  const handleFeeChange = (id, field, value) => {
    setData('frais', {
      ...data.frais,
      [id]: {
        ...data.frais[id],
        [field]: value
      }
    });
  };

  // Calculate total dynamically based on selected checkboxes
  const totalFrais = useMemo(() => {
    let total = 0;
    Object.values(data.frais).forEach(item => {
      if (item.selected) {
        total += Number(item.montant || 0);
      }
    });
    return total;
  }, [data.frais]);

  // Submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const action = inscription ? () => put(route('inscriptions.update', inscription.id)) : () => post(route('inscriptions.store'));

    action({
      onSuccess: () => {
        // Handled by flash and redirect
      },
      onError: (err) => {
        if (err.response?.status === 409) {
          toast.error(t('eleve_already_registered', 'Cet élève est déjà inscrit pour cette année.'));
        }
      },
    });
  };

  // Formatter montant
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0 FCFA' : num.toLocaleString('fr-FR') + ' FCFA';
  };

  const isValidee = data.statut === 'validee';

  return (
    <DashboardLayout title={inscription ? t('edit_inscription', 'Modifier') : t('create_inscription', 'Nouvelle Inscription')}>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link href={route('inscriptions.index')} className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 mb-1">
            &larr; Retour aux inscriptions
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {inscription ? 'Modifier l’inscription' : 'Nouvelle Inscription'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Remplissez les informations ci-dessous pour {inscription ? 'mettre à jour' : 'enregistrer'} l'étudiant.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* CARTE 1 : INFORMATIONS ÉTUDIANT & CLASSE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Informations Scolaires</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ÉLÈVE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('eleve', 'Élève concerné')}</label>
                {!inscription && (
                  <Link href={route('eleves.create')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
                    + Ajouter Nouveau
                  </Link>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AcademicCapIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium
                    ${errors.eleve_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}
                  `}
                  value={data.eleve_id}
                  onChange={(e) => setData('eleve_id', e.target.value)}
                  disabled={!!inscription} // On ne modifie pas l'élève d'une inscription existante
                >
                  {elevePreSelectionne ? (
                    <option value={elevePreSelectionne.id}>
                      {elevePreSelectionne.user.prenom} {elevePreSelectionne.user.nom}
                    </option>
                  ) : (
                    elevesProp.length > 0 ? (
                      <>
                        <option value="">{t('select_student', 'Sélectionnez un élève inscrit...')}</option>
                        {elevesProp.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.user.prenom} {e.user.nom} ({e.matricule})
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">{t('no_available_students', 'Aucun élève libre. Tous sont inscrits.')}</option>
                    )
                  )}
                </select>
              </div>
              {errors.eleve_id && <p className="text-red-500 text-xs font-semibold mt-1">{errors.eleve_id}</p>}
            </div>

            {/* CLASSE */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('classe', 'Classe affectée')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium
                    ${errors.classe_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}
                  `}
                  value={data.classe_id}
                  onChange={(e) => setData('classe_id', e.target.value)}
                >
                  <option value="">{t('select_class', 'Sélectionner le niveau de classe')}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              {errors.classe_id && <p className="text-red-500 text-xs font-semibold mt-1">{errors.classe_id}</p>}
            </div>
          </div>
        </motion.div>

        {/* CARTE 2 : STATUT & DATE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Paramètres d'inscription</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DATE */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('date_inscription', 'Date d\'inscription')}</label>
              <input
                type="date"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium"
                value={data.date_inscription}
                onChange={(e) => setData('date_inscription', e.target.value)}
              />
            </div>

            {/* STATUT */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('type_inscription', 'Statut du Dossier')}</label>
              <select
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-bold"
                value={data.statut}
                onChange={(e) => setData('statut', e.target.value)}
              >
                <option value="validee" className="text-green-600">✅ Validée (Inscription Finale)</option>
                <option value="en_attente" className="text-amber-600">⏳ En attente (Préinscription)</option>
                <option value="brouillon" className="text-slate-500">📝 Brouillon (Saisie libre)</option>
                <option value="rejete" className="text-red-600">❌ Rejetée (Dossier clos)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* CARTE 3 : PAIEMENTS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border p-6 md:p-8 transition-all duration-500
            ${isValidee
              ? 'border-green-400 dark:border-green-500/50 shadow-green-900/10'
              : 'border-slate-200 dark:border-slate-700/50 opacity-60 grayscale'
            }
          `}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isValidee ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                <BanknotesIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Frais Associés</h2>
                {!isValidee && <p className="text-xs text-amber-600 font-semibold mt-0.5">La gestion financière s'active lorsque le dossier est "Validé".</p>}
              </div>
            </div>
            {inscription && isValidee && (
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-full border border-blue-100">
                Ajout de reçus supplémentaires
              </span>
            )}
          </div>

          {(fraisTypes.length === 0) ? (
            <div className="p-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3">
              <XMarkIcon className="w-6 h-6 text-amber-500" />
              <p className="font-semibold text-sm">Il n'y a aucun paramétrage de frais de scolarité actif sur la plateforme.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fraisTypes.map((type) => {
                const feeState = data.frais[type.id] || { selected: false, montant: 0 };

                return (
                  <div
                    key={type.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300
                       ${feeState.selected
                        ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50'
                        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      }
                     `}
                  >
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feeState.selected}
                        onChange={(e) => handleFeeChange(type.id, 'selected', e.target.checked)}
                        className="w-5 h-5 text-green-600 bg-slate-100 border-slate-300 rounded focus:ring-green-500 dark:bg-slate-900 dark:border-slate-600 transition-colors cursor-pointer"
                        disabled={!isValidee}
                      />
                      <div>
                        <span className={`font-bold block ${feeState.selected ? 'text-green-800 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {type.nom}
                        </span>
                        <span className="text-xs font-mono text-slate-500 uppercase">{type.code}</span>
                      </div>
                    </label>

                    <div className="mt-4 sm:mt-0 relative w-full sm:w-48">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        className={`w-full text-right py-2 pl-3 pr-10 rounded-xl border focus:outline-none transition-colors font-bold
                            ${feeState.selected
                            ? 'bg-white border-green-300 focus:border-green-500 ring-2 ring-transparent focus:ring-green-500/20 text-[#0B1A2D]'
                            : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-900 dark:border-slate-700'
                          }
                          `}
                        value={feeState.montant}
                        onChange={(e) => handleFeeChange(type.id, 'montant', e.target.value)}
                        disabled={!feeState.selected || !isValidee}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* RÉCAPITULATIF FINANCIER EN TROMPE-L'ŒIL */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1A2D] to-blue-950 p-[2px]">
            <div className="bg-[#0B1A2D] rounded-[14px] p-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 shadow-inner">
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Montant Exigible Immédiatement</p>
                {totalFrais > 0 ? (
                  <p className="text-emerald-400 text-sm font-medium">Les paiements seront générés dès validation.</p>
                ) : (
                  <p className="text-slate-500 text-sm font-medium">Aucun paiement rattaché.</p>
                )}
              </div>
              <div className="text-right w-full sm:w-auto">
                <span className="block text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatAmount(totalFrais)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BUTTON BAR */}
        <div className="flex border-t border-slate-200 dark:border-slate-700 pt-6 mt-10 space-y-4 sm:space-y-0 sm:flex-row flex-col items-center justify-end gap-4">

          <Link href={route('inscriptions.index')} className="text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white px-6 py-3 transition-colors">
            Annuler
          </Link>

          <button
            type="submit"
            disabled={processing || (!elevePreSelectionne && elevesProp.length === 0)}
            className={`w-full sm:w-auto text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg
              ${isValidee
                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                : 'bg-[#0B1A2D] hover:bg-slate-800 shadow-blue-900/30'
              }
            `}
          >
            {processing ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            )}

            {processing
              ? 'Enregistrement...'
              : (inscription
                ? t('update', 'Enregistrer les modifications')
                : (isValidee ? 'Valider l\'inscription et éditer les paiements' : 'Créer le Dossier (Sans paiement)')
              )
            }
          </button>
        </div>

      </form>
    </DashboardLayout>
  );
}
