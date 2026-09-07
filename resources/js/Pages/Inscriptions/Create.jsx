import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { UserIcon, AcademicCapIcon, BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, CurrencyDollarIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function Create(props) {
  const { t } = useTranslation();
  const {
    inscription,
    elevePreSelectionne,
    eleves: elevesProp = [],
    classes = [],
    annee_en_cours,
    fraisTypes = [],
    flash
  } = props;

  // Helper to safely format date for input (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return dateString.split('T')[0];
  };

  // Identification des types d'admission
  const typeInscription = useMemo(() => {
    return fraisTypes.find(ft => ft.code === 'inscription') || { id: 1, code: 'inscription', nom: "Frais d'Inscription", montant: 10000 };
  }, [fraisTypes]);

  const typeReinscription = useMemo(() => {
    return fraisTypes.find(ft => ft.code === 'reinscription') || { id: 10, code: 'reinscription', nom: "Frais de Réinscription", montant: 5000 };
  }, [fraisTypes]);

  // Frais annexes (excluant inscription et réinscription)
  const fraisAnnexes = useMemo(() => {
    return fraisTypes.filter(ft => ft.code !== 'inscription' && ft.code !== 'reinscription');
  }, [fraisTypes]);

  // Type d'admission par défaut
  const defaultAdmissionType = useMemo(() => {
    if (inscription) {
      return inscription.reinscription ? 'reinscription' : 'inscription';
    }
    if (elevePreSelectionne?.is_reinscription) {
      return 'reinscription';
    }
    return 'inscription';
  }, [inscription, elevePreSelectionne]);

  // Initialiser les frais avec calcul dynamique de la tenue et remise de 50% UNIQUEMENT sur l'inscription (10 000 F -> 5 000 F)
  const initializeFees = (admType = defaultAdmissionType, initialClasseId = '', withRemise = false) => {
    const feesState = {};
    const paidFeeIds = (inscription?.paiements || []).map(p => p.frais_type_id);
    const paiementsMap = (inscription?.paiements || []).reduce((acc, p) => ({ ...acc, [p.frais_type_id]: p }), {});
    const selectedClasse = classes.find(c => String(c.id) === String(initialClasseId));
    const isSecondaire = selectedClasse?.type === 'secondaire';

    fraisTypes.forEach(type => {
      const isPaid = paidFeeIds.includes(type.id);
      let isSelected = isPaid;
      let baseMontant = type.montant || 0;

      // Montant spécifique tenue selon la classe (JAMAIS remisé)
      if (type.code === 'tenue' || type.nom?.toLowerCase().includes('tenue')) {
        baseMontant = isSecondaire ? 15000 : 10000;
      } else if (type.code === 'inscription') {
        baseMontant = type.montant || 10000;
      } else if (type.code === 'reinscription') {
        baseMontant = type.montant || 5000;
      }

      // Remise de 50% UNIQUEMENT sur la nouvelle inscription (10 000 F -> 5 000 F), nul part ailleurs
      let montant = baseMontant;
      if (type.code === 'inscription') {
        montant = (withRemise && admType === 'inscription') ? Math.round(baseMontant * 0.5) : baseMontant;
      }

      if (isPaid && paiementsMap[type.id]?.montant) {
        montant = paiementsMap[type.id].montant;
      }

      // Exclusion mutuelle pour les frais d'admission
      if (type.code === 'inscription') {
        isSelected = isPaid || (admType === 'inscription');
      } else if (type.code === 'reinscription') {
        isSelected = isPaid || (admType === 'reinscription');
      } else if (!inscription) {
        isSelected = isPaid || true;
      }

      feesState[type.id] = {
        selected: isSelected,
        already_paid: isPaid,
        montant: montant
      };
    });
    return feesState;
  };

  const initialHasRemise = Boolean(inscription?.has_remise || false);

  // Form state
  const { data, setData, post, put, processing, errors } = useForm({
    eleve_id: inscription?.eleve_id || elevePreSelectionne?.id || '',
    classe_id: inscription?.classe_id || '',
    date_inscription: formatDate(inscription?.date_inscription),
    admission_type: defaultAdmissionType,
    has_remise: initialHasRemise,
    remise_pourcentage: 50,
    remise_montant: Number(inscription?.remise_montant || 0),
    frais: initializeFees(defaultAdmissionType, inscription?.classe_id || '', initialHasRemise),
    statut: inscription?.statut || 'validee',
  });

  // Détermination du tarif standard hors remise pour un type de frais
  const getBaseMontant = (fraisTypeId, admType = data.admission_type, classeId = data.classe_id) => {
    if (typeInscription?.id && String(fraisTypeId) === String(typeInscription.id)) {
      return Number(typeInscription.montant || 10000);
    }
    if (typeReinscription?.id && String(fraisTypeId) === String(typeReinscription.id)) {
      return Number(typeReinscription.montant || 5000);
    }
    const feeType = fraisAnnexes.find(ft => String(ft.id) === String(fraisTypeId)) || fraisTypes.find(ft => String(ft.id) === String(fraisTypeId));
    const isTenue = feeType?.code === 'tenue' || feeType?.nom?.toLowerCase().includes('tenue');
    if (isTenue) {
      const selected = classes.find(c => String(c.id) === String(classeId));
      return (selected?.type === 'secondaire') ? 15000 : 10000;
    }
    return Number(feeType?.montant || 0);
  };

  // Ensure form is updated if inscription loads late
  useEffect(() => {
    if (inscription) {
      const admType = inscription.reinscription ? 'reinscription' : 'inscription';
      const hasRem = Boolean(inscription.has_remise);
      setData((prev) => ({
        ...prev,
        eleve_id: inscription.eleve_id,
        classe_id: inscription.classe_id,
        date_inscription: formatDate(inscription.date_inscription),
        admission_type: admType,
        has_remise: hasRem,
        remise_pourcentage: hasRem ? Number(inscription.remise_pourcentage || 50) : 50,
        remise_montant: Number(inscription.remise_montant || 0),
        frais: initializeFees(admType, inscription.classe_id, hasRem),
      }));
    }
  }, [inscription]);

  // Bascule de la remise de 50% (APPLIQUÉE UNIQUEMENT SUR L'INSCRIPTION : 10 000 F -> 5 000 F)
  const handleRemiseToggle = (checked) => {
    setData(prev => {
      const nextFrais = { ...prev.frais };

      // La remise touche UNIQUEMENT typeInscription (10 000 F -> 5 000 F), nul part ailleurs
      if (typeInscription?.id && nextFrais[typeInscription.id] && !nextFrais[typeInscription.id].already_paid) {
        const base = Number(typeInscription.montant || 10000);
        nextFrais[typeInscription.id] = {
          ...nextFrais[typeInscription.id],
          montant: checked ? Math.round(base * 0.5) : base,
        };
      }

      return {
        ...prev,
        has_remise: checked,
        remise_pourcentage: checked ? 50 : 0,
        frais: nextFrais,
      };
    });
  };

  // Gestion du changement de type d'admission (EXCLUSION MUTUELLE STRICTE)
  const handleAdmissionChange = (newType) => {
    setData(prev => {
      const updatedFrais = { ...prev.frais };
      
      // Inscription : remise de 50% si active (5 000 F au lieu de 10 000 F)
      if (typeInscription?.id && updatedFrais[typeInscription.id]) {
        const base = Number(typeInscription.montant || 10000);
        updatedFrais[typeInscription.id] = {
          ...updatedFrais[typeInscription.id],
          selected: newType === 'inscription',
          montant: (prev.has_remise && newType === 'inscription') ? Math.round(base * 0.5) : base,
        };
      }

      // Réinscription : TOUJOURS 5 000 F, JAMAIS REMISÉE
      if (typeReinscription?.id && updatedFrais[typeReinscription.id]) {
        const base = Number(typeReinscription.montant || 5000);
        updatedFrais[typeReinscription.id] = {
          ...updatedFrais[typeReinscription.id],
          selected: newType === 'reinscription',
          montant: base,
        };
      }

      return {
        ...prev,
        admission_type: newType,
        has_remise: newType === 'reinscription' ? false : prev.has_remise,
        frais: updatedFrais,
      };
    });
  };

  // Changement d'élève (détection automatique de réinscription)
  const handleEleveChange = (eleveId) => {
    const selected = elevesProp.find(e => String(e.id) === String(eleveId));
    const isReturning = selected?.is_reinscription;
    const nextAdmission = isReturning ? 'reinscription' : 'inscription';

    setData(prev => {
      const updatedFrais = { ...prev.frais };

      if (typeInscription?.id && updatedFrais[typeInscription.id]) {
        const base = Number(typeInscription.montant || 10000);
        updatedFrais[typeInscription.id] = {
          ...updatedFrais[typeInscription.id],
          selected: nextAdmission === 'inscription',
          montant: (prev.has_remise && nextAdmission === 'inscription') ? Math.round(base * 0.5) : base,
        };
      }
      if (typeReinscription?.id && updatedFrais[typeReinscription.id]) {
        const base = Number(typeReinscription.montant || 5000);
        updatedFrais[typeReinscription.id] = {
          ...updatedFrais[typeReinscription.id],
          selected: nextAdmission === 'reinscription',
          montant: base,
        };
      }
      return {
        ...prev,
        eleve_id: eleveId,
        admission_type: nextAdmission,
        has_remise: nextAdmission === 'reinscription' ? false : prev.has_remise,
        frais: updatedFrais,
      };
    });
  };

  // Changement de classe : ajuste automatiquement le montant de la tenue (10 000 Maternelle/Primaire vs 15 000 Secondaire) SANS REMISE
  const handleClasseChange = (classeId) => {
    const selected = classes.find(c => String(c.id) === String(classeId));
    const isSecondaire = selected?.type === 'secondaire';
    const baseTenue = isSecondaire ? 15000 : 10000;

    setData(prev => {
      const updatedFrais = { ...prev.frais };
      const tenueFee = fraisAnnexes.find(ft => ft.code === 'tenue' || ft.nom?.toLowerCase().includes('tenue'));
      
      if (tenueFee && updatedFrais[tenueFee.id] && !updatedFrais[tenueFee.id].already_paid) {
        updatedFrais[tenueFee.id] = {
          ...updatedFrais[tenueFee.id],
          montant: baseTenue // Strictly 15 000 or 10 000, never discounted
        };
      }

      return {
        ...prev,
        classe_id: classeId,
        frais: updatedFrais,
      };
    });
  };

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

  // Calcul dynamique des totaux brut, net et montant de remise (Uniquement sur l'inscription : 5 000 F d'économie)
  const { totalBrut, totalFrais, montantRemise } = useMemo(() => {
    let brut = 0;
    let net = 0;

    Object.keys(data.frais).forEach(id => {
      const item = data.frais[id];
      if (item.selected) {
        const base = getBaseMontant(id, data.admission_type, data.classe_id);
        brut += Number(base || 0);
        net += Number(item.montant || 0);
      }
    });

    const isRemiseActive = data.has_remise && data.admission_type === 'inscription' && data.frais[typeInscription?.id]?.selected;
    const remise = isRemiseActive ? Math.max(0, brut - net) : 0;
    return { totalBrut: brut, totalFrais: net, montantRemise: remise };
  }, [data.frais, data.has_remise, data.admission_type, data.classe_id, typeInscription]);

  // Submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    data.remise_montant = montantRemise;
    const action = inscription 
      ? () => put(route('inscriptions.update', inscription.id)) 
      : () => post(route('inscriptions.store'));

    action({
      onSuccess: () => {},
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

  // Tuitions info for the selected class
  const selectedClasseFrais = useMemo(() => {
    if (!data.classe_id || !props.fraisClasses) return null;
    return props.fraisClasses.find(fc => String(fc.classe_id) === String(data.classe_id));
  }, [data.classe_id, props.fraisClasses]);

  const selectedClasseObj = useMemo(() => {
    return classes.find(c => String(c.id) === String(data.classe_id));
  }, [data.classe_id, classes]);

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
            Affectez l'élève à sa classe et encaissez les droits d'admission et fournitures exigibles.
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
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Affectation & Classe</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ÉLÈVE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('eleve', 'Élève concerné')}</label>
                {!inscription && (
                  <Link href={route('eleves.create')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
                    + Enregistrer Nouveau Dossier
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
                  onChange={(e) => handleEleveChange(e.target.value)}
                  disabled={!!inscription}
                >
                  {elevePreSelectionne ? (
                    <option value={elevePreSelectionne.id}>
                      {elevePreSelectionne.user.prenom} {elevePreSelectionne.user.nom} ({elevePreSelectionne.matricule || 'Nouveau'})
                    </option>
                  ) : (
                    elevesProp.length > 0 ? (
                      <>
                        <option value="">{t('select_student', 'Sélectionnez un élève enregistré...')}</option>
                        {elevesProp.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.user.prenom} {e.user.nom} ({e.matricule || 'Sans matricule'}) {e.is_reinscription ? '— [Ancien élève]' : ''}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">{t('no_available_students', 'Tous les élèves enregistrés sont déjà inscrits.')}</option>
                    )
                  )}
                </select>
              </div>
              {errors.eleve_id && <p className="text-red-500 text-xs font-semibold mt-1">{errors.eleve_id}</p>}
            </div>

            {/* CLASSE */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('classe', 'Classe d\'affectation')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium
                    ${errors.classe_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}
                  `}
                  value={data.classe_id}
                  onChange={(e) => handleClasseChange(e.target.value)}
                >
                  <option value="">{t('select_class', 'Sélectionner le niveau de classe')}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} — [{c.type === 'secondaire' ? 'Secondaire' : (c.type === 'primaire' ? 'Primaire' : 'Maternelle')}]
                    </option>
                  ))}
                </select>
              </div>
              {errors.classe_id && <p className="text-red-500 text-xs font-semibold mt-1">{errors.classe_id}</p>}
            </div>
          </div>

          {/* APERÇU SCOLARITÉ DE LA CLASSE SÉLECTIONNÉE */}
          {selectedClasseObj && (
            <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 shrink-0">
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    Grille Scolarité : {selectedClasseObj.nom} ({selectedClasseObj.type?.toUpperCase()})
                  </h4>
                  {selectedClasseFrais ? (
                    <span className="text-sm font-black text-blue-700 dark:text-blue-300">
                      Montant Annuel : {formatAmount(selectedClasseFrais.montant)}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Non définie dans la grille des scolarités
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-1">
                  💡 <strong>Information :</strong> La scolarité annuelle est distincte des frais d'inscription. Elle sera réglée ultérieurement (par mois pour la maternelle/primaire, par tranches pour le secondaire) via le Journal de Caisse.
                </p>
              </div>
            </div>
          )}
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
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Paramètres du Dossier</h2>
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('type_inscription', 'Statut de l\'Inscription')}</label>
              <select
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-bold"
                value={data.statut}
                onChange={(e) => setData('statut', e.target.value)}
              >
                <option value="validee" className="text-green-600">✅ Validée (Inscription Définitive avec encaissement)</option>
                <option value="en_attente" className="text-amber-600">⏳ En attente (Préinscription - pas de paiement immédiat)</option>
                <option value="brouillon" className="text-slate-500">📝 Brouillon (Dossier incomplet)</option>
                <option value="rejete" className="text-red-600">❌ Rejetée (Dossier clos)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* CARTE 3 : DROITS D'INSCRIPTION & FOURNITURES */}
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
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Droits & Frais d'Inscription</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Frais exigibles immédiatement pour valider le dossier d'inscription (Dossier, Badge, Tenue, etc.).
                </p>
              </div>
            </div>
            {inscription && isValidee && (
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-full border border-blue-100">
                Modification des encaissements
              </span>
            )}
          </div>

          {/* 1. SÉLECTION EXCLUSIVE : INSCRIPTION (10 000 FCFA) vs RÉINSCRIPTION (5 000 FCFA) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>1. Type d'Admission</span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-sans bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  (Choix exclusif : l'un ou l'autre, pas les deux)
                </span>
              </label>
              {data.admission_type === 'reinscription' ? (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Tarif Réinscription sélectionné : 5 000 FCFA
                </span>
              ) : (
                <span className="text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  Tarif Nouvelle Inscription sélectionné : 10 000 FCFA
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OPTION A : NOUVELLE INSCRIPTION (10 000 FCFA) */}
              <div
                onClick={() => isValidee && handleAdmissionChange('inscription')}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between
                  ${data.admission_type === 'inscription'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }
                  ${!isValidee ? 'cursor-not-allowed opacity-60' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${data.admission_type === 'inscription' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'}
                    `}>
                      {data.admission_type === 'inscription' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white text-base">
                        {typeInscription.nom || "Nouvelle Inscription"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pour tout nouvel élève s'inscrivant pour la première fois.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                    Nouveau
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Montant d'inscription :</span>
                  <div className="flex items-baseline gap-2">
                    {data.has_remise && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatAmount(typeInscription.montant || 10000)}
                      </span>
                    )}
                    <span className="text-xl font-black text-blue-700 dark:text-blue-400">
                      {formatAmount(data.has_remise ? Math.round((typeInscription.montant || 10000) * 0.5) : (typeInscription.montant || 10000))}
                    </span>
                    {data.has_remise && (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                        -50%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* OPTION B : RÉINSCRIPTION (5 000 FCFA) - AUCUNE REMISE */}
              <div
                onClick={() => isValidee && handleAdmissionChange('reinscription')}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between
                  ${data.admission_type === 'reinscription'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }
                  ${!isValidee ? 'cursor-not-allowed opacity-60' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${data.admission_type === 'reinscription' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'}
                    `}>
                      {data.admission_type === 'reinscription' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white text-base">
                        {typeReinscription.nom || "Frais de Réinscription"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pour tout élève déjà inscrit lors de l'année précédente.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2.5 py-1 rounded-lg">
                    Ancien Élève
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Montant de réinscription :</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">
                      {formatAmount(typeReinscription.montant || 5000)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FOURNITURES & FRAIS ANNEXES EN GRILLE À 2 COLONNES */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>2. Fournitures & Frais Annexes</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  (Grille à 2 colonnes)
                </span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cochez les fournitures réglées immédiatement par le parent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fraisAnnexes.map((type) => {
                const feeState = data.frais[type.id] || { selected: false, montant: type.montant || 0 };
                const isTenue = type.code === 'tenue' || type.nom.toLowerCase().includes('tenue');
                const isSecondaire = selectedClasseObj?.type === 'secondaire';

                return (
                  <div
                    key={type.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3
                      ${feeState.selected
                        ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }
                      ${isTenue ? (isSecondaire ? 'relative border-l-4 border-l-purple-500' : 'relative border-l-4 border-l-amber-500') : ''}
                    `}
                  >
                    {isTenue && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border
                          ${isSecondaire
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }
                        `}>
                          <span>👕 Tenue Scolaire</span>
                          <span>• {selectedClasseObj ? (isSecondaire ? 'Secondaire (15 000 FCFA)' : 'Maternelle / Primaire (10 000 FCFA)') : '10 000 F (Mat/Prim) • 15 000 F (Sec)'}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {feeState.selected ? 'Payée à l\'inscription' : 'Paiement ultérieur possible'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={feeState.selected}
                          onChange={(e) => handleFeeChange(type.id, 'selected', e.target.checked)}
                          className="mt-1 w-5 h-5 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-600 cursor-pointer"
                          disabled={!isValidee || feeState.already_paid}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm block ${feeState.selected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                              {type.nom}
                            </span>
                            {feeState.already_paid && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                ✓ Déjà Réglé
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono uppercase mt-0.5 block">
                            {type.code || 'ANNEXE'}
                          </span>
                          {isTenue && !feeState.selected && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-lg border border-amber-200/50">
                              ℹ️ Non réglée aujourd'hui : le parent pourra la payer ultérieurement ({isSecondaire ? '15 000 FCFA' : '10 000 FCFA'}). Un suivi d'encaissement sera créé.
                            </p>
                          )}
                        </div>
                      </label>

                      {/* CHAMP MONTANT (AJUSTÉ SELON LA CLASSE CHOISIE) */}
                      <div className="w-28 shrink-0">
                        <div className="relative">
                          <input
                            type="number"
                            className={`w-full text-right py-1.5 px-2.5 rounded-xl border text-sm font-black transition-colors
                              ${feeState.selected
                                ? 'bg-white border-emerald-300 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700'
                              }
                            `}
                            value={feeState.montant}
                            onChange={(e) => handleFeeChange(type.id, 'montant', e.target.value)}
                            disabled={!feeState.selected || !isValidee || feeState.already_paid}
                          />
                          <span className="block text-[10px] text-slate-400 text-right mt-0.5 font-bold">FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. OPTION REMISE COMMERCIALE DE 50% (UNIQUEMENT NOUVELLE INSCRIPTION) */}
          <div className={`mt-6 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm
            ${data.has_remise 
              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-emerald-500/10' 
              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }
            ${data.admission_type === 'reinscription' ? 'opacity-60 cursor-not-allowed' : ''}
          `}>
            <div className="flex items-start sm:items-center gap-3.5">
              <input
                type="checkbox"
                id="remise_checkbox"
                checked={data.has_remise && data.admission_type === 'inscription'}
                onChange={(e) => handleRemiseToggle(e.target.checked)}
                disabled={!isValidee || data.admission_type === 'reinscription'}
                className="w-5 h-5 mt-0.5 sm:mt-0 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-600 cursor-pointer transition-all disabled:cursor-not-allowed"
              />
              <label htmlFor="remise_checkbox" className={`select-none ${data.admission_type === 'reinscription' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800 dark:text-white text-sm sm:text-base">
                    Appliquer une remise de 50% sur l'inscription
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                    -50% (5 000 FCFA au lieu de 10 000 FCFA)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.admission_type === 'reinscription'
                    ? "Remise réservée exclusivement aux nouvelles inscriptions (non applicable sur les réinscriptions, tenues scolaires ou autres fournitures)."
                    : "Réduction de 50% appliquée strictement sur les frais de nouvelle inscription (5 000 FCFA au lieu de 10 000 FCFA). Ne s'applique pas sur la tenue scolaire ni sur les réinscriptions."}
                </p>
              </label>
            </div>
            {data.has_remise && data.admission_type === 'inscription' && (
              <div className="text-left sm:text-right sm:shrink-0 bg-white dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block">
                  Déduction Remise (50%)
                </span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  - {formatAmount(montantRemise)}
                </span>
              </div>
            )}
          </div>

          {/* RÉCAPITULATIF FINANCIER GLOBAL */}
          <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1A2D] to-blue-950 p-[2px]">
            <div className="bg-[#0B1A2D] rounded-[14px] p-6 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 shadow-inner">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Encaissé Immédiatement</p>
                {data.has_remise ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 line-through">Sous-total brut : {formatAmount(totalBrut)}</span>
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Remise -50% (-{formatAmount(montantRemise)})
                      </span>
                    </div>
                    <p className="text-emerald-400 text-xs font-medium">
                      Tarif remisé de 50% appliqué avec succès sur les frais d'inscription.
                    </p>
                  </div>
                ) : (
                  totalFrais > 0 ? (
                    <p className="text-emerald-400 text-sm font-medium">
                      Admission ({data.admission_type === 'reinscription' ? '5 000 F' : '10 000 F'}) + Fournitures sélectionnées. Reçu imprimable généré.
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm font-medium">Aucun paiement initial sélectionné.</p>
                  )
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
                : (isValidee ? 'Valider l\'inscription et imprimer le reçu' : 'Créer le Dossier (Sans paiement)')
              )
            }
          </button>
        </div>

      </form>
    </DashboardLayout>
  );
}
