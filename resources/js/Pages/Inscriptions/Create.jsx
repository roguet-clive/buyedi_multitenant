import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { UserIcon, AcademicCapIcon, BanknotesIcon, CalendarDaysIcon, CheckCircleIcon, CurrencyDollarIcon, SparklesIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import RemiseCalculator from '@/Components/RemiseCalculator';

export default function Create(props) {
  const { t } = useTranslation();
  const {
    inscription,
    elevePreSelectionne,
    eleves: elevesProp = [],
    classes = [],
    annee_en_cours,
    fraisTypes = [],
    flash,
    forfait_config = { montant_forfait: 70000, frais_inscription: 10000, frais_reinscription: 5000 },
  } = props;

  // Helper to safely format date for input (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    return dateString.split('T')[0];
  };

  // Identification des types d'admission (10 000 FCFA chacun)
  const typeInscription = useMemo(() => {
    return fraisTypes.find(ft => ft.code === 'inscription') || { id: 1, code: 'inscription', nom: "Frais d'Inscription", montant: 10000 };
  }, [fraisTypes]);

  const typeReinscription = useMemo(() => {
    return fraisTypes.find(ft => ft.code === 'reinscription') || { id: 11, code: 'reinscription', nom: "Frais de Réinscription", montant: 10000 };
  }, [fraisTypes]);

  // Frais annexes & fournitures (communs à tous les cycles : Tenues, Sport, Assurance/Bulletin, APE, etc.)
  const fraisAnnexes = useMemo(() => {
    return fraisTypes.filter(ft => {
      if (ft.is_scolarite) return false;
      if (ft.code === 'inscription' || ft.code === 'reinscription') return false;
      if (ft.nom?.toLowerCase().includes('inscription')) return false;
      if (ft.code?.startsWith('arriere')) return false;
      return true;
    });
  }, [fraisTypes]);

  // Helper de badges visuels pour chaque frais annexe
  const getFeeBadgeInfo = (type) => {
    const code = type.code?.toLowerCase() || '';
    const nom = type.nom?.toLowerCase() || '';
    if (code === 'tenue_sport' || nom.includes('sport')) {
      return {
        badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200',
        borderLeft: 'border-l-4 border-l-orange-500',
      };
    }
    if (code === 'tenue' || nom.includes('tenue')) {
      return {
        badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200',
        borderLeft: 'border-l-4 border-l-purple-500',
      };
    }
    if (code === 'bulletin_assurance' || nom.includes('bulletin') || nom.includes('assurance')) {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200',
        borderLeft: 'border-l-4 border-l-emerald-500',
      };
    }
    if (code === 'ape' || nom.includes('ape')) {
      return {
        badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200',
        borderLeft: 'border-l-4 border-l-indigo-500',
      };
    }
    if (code === 'carte' || nom.includes('carte')) {
      return {
        badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 border-cyan-200',
        borderLeft: 'border-l-4 border-l-cyan-500',
      };
    }
    if (code === 'tee_shirt' || nom.includes('tee-shirt') || nom.includes('t-shirt')) {
      return {
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200',
        borderLeft: 'border-l-4 border-l-amber-500',
      };
    }
    return {
      badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      borderLeft: 'border-l-4 border-l-blue-400',
    };
  };

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

  // Initialiser les frais : admission sélectionnée, et frais annexes cochables au choix
  const initializeFees = (admType = defaultAdmissionType, initialClasseId = '') => {
    const feesState = {};
    const paidFeeIds = (inscription?.paiements || []).map(p => p.frais_type_id);
    const paiementsMap = (inscription?.paiements || []).reduce((acc, p) => ({ ...acc, [p.frais_type_id]: p }), {});

    fraisTypes.forEach(type => {
      const isPaid = paidFeeIds.includes(type.id);
      let isSelected = isPaid;
      let montant = Number(type.montant || 0);

      const code = type.code?.toLowerCase() || '';
      const nom = type.nom?.toLowerCase() || '';
      const isReinsc = code === 'reinscription' || nom.includes('réinscription');
      const isInsc = code === 'inscription' || (nom.includes('inscription') && !isReinsc);

      if (isPaid && paiementsMap[type.id]?.montant) {
        montant = paiementsMap[type.id].montant;
      }

      // Règles de sélection par défaut
      if (isInsc) {
        isSelected = isPaid || (admType === 'inscription');
      } else if (isReinsc) {
        isSelected = isPaid || (admType === 'reinscription');
      } else if (type.code?.startsWith('arriere') || type.is_scolarite) {
        isSelected = false;
      } else {
        // Observation 8 : Sont obligatoires à l'inscription :
        // - L'assurance & le bulletin (bulletin_assurance)
        // - La tenue scolaire (tenue)
        // - La tenue de sport (tenue_sport)
        const isMandatoryFee = ['bulletin_assurance', 'tenue', 'tenue_sport'].includes(code)
          || nom.includes('bulletin')
          || nom.includes('assurance')
          || nom.includes('tenue');

        isSelected = isPaid || isMandatoryFee;
      }

      feesState[type.id] = {
        selected: isSelected,
        already_paid: isPaid,
        montant: montant
      };
    });
    return feesState;
  };

  // Identification si un paiement de scolarité existe déjà (lors de l'édition)
  const existingScolaritePayment = useMemo(() => {
    return (inscription?.paiements || []).find(p => p.frais_type?.is_scolarite || p.frais_type?.code === 'scolarite');
  }, [inscription]);

  // Form state avec gestion de la scolarité du 1er mois et des remises
  const { data, setData, post, put, processing, errors } = useForm({
    eleve_id: inscription?.eleve_id || elevePreSelectionne?.id || '',
    classe_id: inscription?.classe_id || '',
    date_inscription: formatDate(inscription?.date_inscription),
    admission_type: defaultAdmissionType,
    frais: initializeFees(defaultAdmissionType, inscription?.classe_id || ''),
    statut: inscription?.statut || 'validee',
    has_remise: Boolean(inscription?.has_remise),
    remise_pourcentage: inscription?.remise_pourcentage ? Number(inscription.remise_pourcentage) : 0,
    remise_montant: inscription?.remise_montant ? Number(inscription.remise_montant) : 0,
    scolarite_accorde: 0,
    payer_scolarite_mois: Boolean(existingScolaritePayment),
    montant_scolarite_mois: existingScolaritePayment ? existingScolaritePayment.montant : '',
  });

  // Détermination du tarif standard pour un type de frais (dynamique depuis FraisType)
  const getBaseMontant = (fraisTypeId) => {
    if (typeInscription?.id && String(fraisTypeId) === String(typeInscription.id)) {
      return Number(typeInscription.montant || 0);
    }
    if (typeReinscription?.id && String(fraisTypeId) === String(typeReinscription.id)) {
      return Number(typeReinscription.montant || 0);
    }
    const feeType = fraisAnnexes.find(ft => String(ft.id) === String(fraisTypeId)) || fraisTypes.find(ft => String(ft.id) === String(fraisTypeId));
    return Number(feeType?.montant || 0);
  };

  // Ensure form is updated if inscription loads late
  useEffect(() => {
    if (inscription) {
      const admType = inscription.reinscription ? 'reinscription' : 'inscription';
      const scolaritePaiement = (inscription.paiements || []).find(p => p.frais_type?.is_scolarite || p.frais_type?.code === 'scolarite');
      setData((prev) => ({
        ...prev,
        eleve_id: inscription.eleve_id,
        classe_id: inscription.classe_id,
        date_inscription: formatDate(inscription.date_inscription),
        admission_type: admType,
        has_remise: Boolean(inscription.has_remise),
        remise_pourcentage: inscription.remise_pourcentage ? Number(inscription.remise_pourcentage) : 0,
        remise_montant: inscription.remise_montant ? Number(inscription.remise_montant) : 0,
        payer_scolarite_mois: prev.payer_scolarite_mois || Boolean(scolaritePaiement),
        montant_scolarite_mois: prev.montant_scolarite_mois !== '' ? prev.montant_scolarite_mois : (scolaritePaiement ? scolaritePaiement.montant : ''),
        frais: initializeFees(admType, inscription.classe_id),
      }));
    }
  }, [inscription]);

  // Gestion du changement de type d'admission
  const handleAdmissionChange = (newType) => {
    setData(prev => {
      const updatedFrais = { ...prev.frais };

      if (typeInscription?.id && updatedFrais[typeInscription.id]) {
        updatedFrais[typeInscription.id] = {
          ...updatedFrais[typeInscription.id],
          selected: newType === 'inscription',
          montant: Number(typeInscription.montant || 0),
        };
      }

      if (typeReinscription?.id && updatedFrais[typeReinscription.id]) {
        updatedFrais[typeReinscription.id] = {
          ...updatedFrais[typeReinscription.id],
          selected: newType === 'reinscription',
          montant: Number(typeReinscription.montant || 0),
        };
      }

      return {
        ...prev,
        admission_type: newType,
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
        updatedFrais[typeInscription.id] = {
          ...updatedFrais[typeInscription.id],
          selected: nextAdmission === 'inscription',
          montant: Number(typeInscription.montant || 0),
        };
      }
      if (typeReinscription?.id && updatedFrais[typeReinscription.id]) {
        updatedFrais[typeReinscription.id] = {
          ...updatedFrais[typeReinscription.id],
          selected: nextAdmission === 'reinscription',
          montant: Number(typeReinscription.montant || 0),
        };
      }
      return {
        ...prev,
        eleve_id: eleveId,
        admission_type: nextAdmission,
        frais: updatedFrais,
      };
    });
  };

  // Changement de classe
  const handleClasseChange = (classeId) => {
    setData(prev => ({
      ...prev,
      classe_id: classeId,
    }));
  };

  // Gestion libre des modifications de montants (admission ou annexes)
  const handleAmountChange = (id, newAmount) => {
    const val = newAmount === '' ? '' : (parseFloat(newAmount) >= 0 ? parseFloat(newAmount) : 0);
    setData(prev => {
      const current = prev.frais[id] || { selected: true, montant: 0 };
      return {
        ...prev,
        frais: {
          ...prev.frais,
          [id]: {
            ...current,
            selected: true, // S'assurer que le frais est coché si on modifie son montant
            montant: val
          }
        }
      };
    });
  };

  // Gestion des modifications de fournitures et frais annexes
  const handleFeeChange = (id, field, value) => {
    const feeType = fraisAnnexes.find(ft => String(ft.id) === String(id)) || fraisTypes.find(ft => String(ft.id) === String(id));

    let updatedItem = {
      ...(data.frais[id] || { selected: false, montant: Number(feeType?.montant || 0) }),
      [field]: value
    };

    // Si on coche et qu'aucun montant n'est encore défini, initialiser au montant standard
    if (field === 'selected' && value === true && (updatedItem.montant === undefined || updatedItem.montant === null || updatedItem.montant === '')) {
      updatedItem.montant = Number(feeType?.montant || 0);
    }

    setData('frais', {
      ...data.frais,
      [id]: updatedItem
    });
  };

  // Submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
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

  // Basculer la sélection d'un frais annexe (au clic sur la carte ou la case)
  const toggleFee = (id) => {
    if (!isValidee) return;
    const current = data.frais[id];
    if (current?.already_paid) return;
    handleFeeChange(id, 'selected', !current?.selected);
  };

  // Tuitions info for the selected class
  const selectedClasseFrais = useMemo(() => {
    if (!data.classe_id || !props.fraisClasses) return null;
    return props.fraisClasses.find(fc => String(fc.classe_id) === String(data.classe_id));
  }, [data.classe_id, props.fraisClasses]);

  const selectedClasseObj = useMemo(() => {
    return classes.find(c => String(c.id) === String(data.classe_id));
  }, [data.classe_id, classes]);

  // Mensualité officielle selon barème
  const scolariteMensuelleOfficielle = useMemo(() => {
    if (selectedClasseObj?.montant_mensuel_officiel) {
      return Number(selectedClasseObj.montant_mensuel_officiel);
    }
    if (selectedClasseFrais?.montant) {
      return Math.round(Number(selectedClasseFrais.montant) / 9);
    }
    return 20000;
  }, [selectedClasseObj, selectedClasseFrais]);

  // Mensualité nette après remise éventuelle
  const scolariteMoisNet = useMemo(() => {
    if (data.scolarite_accorde && Number(data.scolarite_accorde) > 0) {
      return Number(data.scolarite_accorde);
    }
    if (data.has_remise && data.remise_pourcentage > 0) {
      return Math.round(scolariteMensuelleOfficielle * (1 - Number(data.remise_pourcentage) / 100));
    }
    return scolariteMensuelleOfficielle;
  }, [scolariteMensuelleOfficielle, data.has_remise, data.remise_pourcentage, data.scolarite_accorde]);

  // Montant effectif du 1er mois de scolarité (personnalisé dans l'input, remisé ou officiel)
  const scolariteMoisEffectif = useMemo(() => {
    if (data.montant_scolarite_mois !== '' && data.montant_scolarite_mois !== null && data.montant_scolarite_mois !== undefined) {
      return Number(data.montant_scolarite_mois);
    }
    return scolariteMoisNet;
  }, [data.montant_scolarite_mois, scolariteMoisNet]);

  // Calcul dynamique du total des frais sélectionnés
  const totalFrais = useMemo(() => {
    let total = 0;
    Object.keys(data.frais).forEach(id => {
      const item = data.frais[id];
      if (item?.selected) {
        total += Number(item.montant || 0);
      }
    });
    if (data.payer_scolarite_mois) {
      total += Number(scolariteMoisEffectif || 0);
    }
    return total;
  }, [data.frais, data.payer_scolarite_mois, scolariteMoisEffectif]);

  // Droit d'admission effectif (Inscription ou Réinscription avec montant personnalisable)
  const droitAdmission = useMemo(() => {
    if (data.admission_type === 'reinscription' && typeReinscription?.id) {
      const custom = data.frais[typeReinscription.id]?.montant;
      return (custom !== undefined && custom !== null && custom !== '') ? Number(custom) : Number(typeReinscription.montant || 10000);
    }
    if (typeInscription?.id) {
      const custom = data.frais[typeInscription.id]?.montant;
      return (custom !== undefined && custom !== null && custom !== '') ? Number(custom) : Number(typeInscription.montant || 10000);
    }
    return 10000;
  }, [data.admission_type, data.frais, typeInscription, typeReinscription]);

  // Sous-total des fournitures et frais annexes cochés avec leurs montants personnalisés
  const totalFraisAnnexes = useMemo(() => {
    let total = 0;
    fraisAnnexes.forEach(ft => {
      const item = data.frais[ft.id];
      if (item?.selected) {
        const montant = (item.montant !== undefined && item.montant !== null && item.montant !== '') 
          ? Number(item.montant) 
          : Number(ft.montant || 0);
        total += montant;
      }
    });
    return total;
  }, [data.frais, fraisAnnexes]);

  const handleRemiseChange = (remiseData) => {
    setData(prev => ({
      ...prev,
      has_remise: remiseData.has_remise,
      remise_pourcentage: remiseData.remise_pourcentage,
      remise_montant: remiseData.remise_montant,
      scolarite_accorde: remiseData.scolarite_accorde,
      montant_scolarite_mois: remiseData.scolarite_accorde > 0 ? remiseData.scolarite_accorde : prev.montant_scolarite_mois,
    }));
  };

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


          {/* 1. SÉLECTION EXCLUSIVE : INSCRIPTION vs RÉINSCRIPTION */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>1. Type d'Admission</span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-sans bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  (Tarif unique : {formatAmount(typeInscription.montant)})
                </span>
              </label>
              {data.admission_type === 'reinscription' ? (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Tarif Réinscription sélectionné : {formatAmount(typeReinscription.montant)}
                </span>
              ) : (
                <span className="text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  Tarif Nouvelle Inscription sélectionné : {formatAmount(typeInscription.montant)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OPTION A : NOUVELLE INSCRIPTION */}
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
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Montant d'inscription :</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={data.frais[typeInscription.id]?.montant ?? typeInscription.montant ?? 10000}
                      onChange={(e) => handleAmountChange(typeInscription.id, e.target.value)}
                      disabled={!isValidee}
                      className="w-32 py-1 px-2.5 text-right font-black font-mono text-base text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                    <span className="text-xs font-bold text-slate-500">FCFA</span>
                  </div>
                </div>
              </div>

              {/* OPTION B : RÉINSCRIPTION */}
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
                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Montant de réinscription :</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={data.frais[typeReinscription.id]?.montant ?? typeReinscription.montant ?? 10000}
                      onChange={(e) => handleAmountChange(typeReinscription.id, e.target.value)}
                      disabled={!isValidee}
                      className="w-32 py-1 px-2.5 text-right font-black font-mono text-base text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                    <span className="text-xs font-bold text-slate-500">FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. FRAIS ANNEXES & FOURNITURES SCOLAIRES (COCHABLES COMME L'APE) */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>2. Frais Annexes & Fournitures Scolaires</span>
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-300 dark:border-blue-800">
                    Au choix / Cocher selon le besoin
                  </span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cochez les éléments à acquitter aujourd'hui (Tenue, Tenue sport, Assurance/Bulletin, APE, Carte, etc.).
                </p>
              </div>

              {totalFraisAnnexes > 0 && (
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Total annexes cochés :</span>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400">
                    +{formatAmount(totalFraisAnnexes)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fraisAnnexes.map((type) => {
                const feeState = data.frais[type.id] || { selected: false, montant: type.montant || 0 };
                const badgeInfo = getFeeBadgeInfo(type);
                const isSelected = Boolean(feeState.selected);

                return (
                  <div
                    key={type.id}
                    onClick={() => toggleFee(type.id)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 select-none ${badgeInfo.borderLeft}
                      ${isSelected
                        ? 'bg-blue-50/80 border-blue-400 dark:bg-blue-950/40 dark:border-blue-700 shadow-sm ring-1 ring-blue-400/30'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeInfo.badgeBg}`}>
                          {type.nom}
                        </span>
                        {['bulletin_assurance', 'tenue', 'tenue_sport'].includes(type.code?.toLowerCase()) || type.nom?.toLowerCase().includes('tenue') || type.nom?.toLowerCase().includes('assurance') ? (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                            Obligatoire
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                            Optionnel
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50'
                      }`}>
                        {feeState.already_paid ? "Déjà réglé" : (isSelected ? "Sélectionné" : "Non coché")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFee(type.id)}
                          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 cursor-pointer"
                          disabled={!isValidee || feeState.already_paid}
                        />
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-600 dark:text-slate-400'}`}>
                          {feeState.already_paid ? "Déjà Réglé" : (isSelected ? "Inclus" : "Cocher")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={feeState.montant !== undefined && feeState.montant !== null ? feeState.montant : (type.montant || 0)}
                          onChange={(e) => handleAmountChange(type.id, e.target.value)}
                          disabled={!isValidee || feeState.already_paid}
                          title="Modifier le montant à encaisser"
                          className={`w-28 sm:w-32 py-1 px-2.5 text-right font-black font-mono text-sm rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-blue-400 dark:border-blue-600 focus:ring-2 focus:ring-blue-500 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        />
                        <span className="text-[11px] font-bold text-slate-500">FCFA</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. OPTION AVANCE SCOLARITÉ 1ER MOIS (SEPTEMBRE) */}
          <div className="mb-8 border-t border-slate-200/80 dark:border-slate-700 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>3. Avance Scolarité 1er Mois (Septembre)</span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Optionnel
                </span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cochez si le parent règle la scolarité du premier mois aujourd'hui.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
              data.payer_scolarite_mois
                ? 'bg-blue-50/80 border-blue-500 dark:bg-blue-950/40 dark:border-blue-700 shadow-md ring-2 ring-blue-400/20'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-start gap-3.5 cursor-pointer flex-1 select-none">
                  <input
                    type="checkbox"
                    checked={data.payer_scolarite_mois}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setData(prev => ({
                        ...prev,
                        payer_scolarite_mois: isChecked,
                        montant_scolarite_mois: isChecked 
                          ? ((prev.montant_scolarite_mois !== '' && prev.montant_scolarite_mois !== undefined && Number(prev.montant_scolarite_mois) > 0) ? prev.montant_scolarite_mois : scolariteMoisNet) 
                          : ''
                      }));
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 cursor-pointer"
                    disabled={!isValidee}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-800 dark:text-white text-base">
                        Régler la Scolarité du 1er mois (Septembre)
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Avance Facultative
                      </span>
                      {data.has_remise && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                          Tarif remisé
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedClasseObj
                        ? `Classe : ${selectedClasseObj.nom} — Permet d'acquitter d'avance la première mensualité de scolarité.`
                        : "Veuillez sélectionner une classe ci-dessus pour déterminer le montant mensuel de scolarité."
                      }
                    </p>
                  </div>
                </label>

                <div className="text-right shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Montant scolarité à encaisser :
                  </span>
                  <div className="flex items-center justify-end gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={data.montant_scolarite_mois !== undefined && data.montant_scolarite_mois !== null && data.montant_scolarite_mois !== '' ? data.montant_scolarite_mois : scolariteMoisNet}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : (parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : 0);
                        setData(prev => ({
                          ...prev,
                          payer_scolarite_mois: true,
                          montant_scolarite_mois: val,
                          scolarite_accorde: val > 0 ? val : prev.scolarite_accorde
                        }));
                      }}
                      disabled={!isValidee || !data.payer_scolarite_mois}
                      title="Modifier le montant de scolarité à encaisser"
                      className={`w-36 sm:w-40 py-1.5 px-3 text-right font-black font-mono text-xl rounded-xl border-2 transition-all ${
                        data.payer_scolarite_mois
                          ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border-blue-400 dark:border-blue-600 focus:ring-2 focus:ring-blue-500 shadow-inner'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                      }`}
                    />
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300">FCFA</span>
                  </div>
                  {scolariteMensuelleOfficielle > 0 && (
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Tarif standard : {formatAmount(scolariteMensuelleOfficielle)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. CALCULATEUR AUTOMATIQUE DE REMISE NÉGOCIÉE */}
          <div className="mb-8 border-t border-slate-200/80 dark:border-slate-700 pt-6">
            <div className="mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>4. Remise Négociée sur la Scolarité</span>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Optionnel
                </span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Si un tarif préférentiel a été accordé, saisissez directement le montant net mensuel permis ou le pourcentage de remise.
              </p>
            </div>

            <RemiseCalculator
              baseMonthly={scolariteMensuelleOfficielle}
              hasRemise={data.has_remise}
              remisePourcentage={data.remise_pourcentage}
              remiseMontant={data.remise_montant}
              scolariteAccorde={data.scolarite_accorde}
              onChange={handleRemiseChange}
              title="Remise Scolarité Mensuelle"
              monthsCount={9}
            />
          </div>

          {/* 5. RÉCAPITULATIF FINANCIER GLOBAL */}
          <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1A2D] via-blue-950 to-slate-900 p-[2px] shadow-xl">
            <div className="bg-[#0B1A2D] rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1.5 flex-1">
                <p className="text-slate-400 text-xs font-black uppercase tracking-wider">
                  Détail de l'encaissement à l'inscription
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span>• {data.admission_type === 'reinscription' ? 'Réinscription' : 'Inscription'} : <strong className="text-emerald-400 font-bold">{formatAmount(droitAdmission)}</strong></span>
                  {totalFraisAnnexes > 0 && (
                    <span>• Frais annexes cochés : <strong className="text-blue-400 font-bold">+{formatAmount(totalFraisAnnexes)}</strong></span>
                  )}
                  {data.payer_scolarite_mois && (
                    <span>• 1er mois Septembre : <strong className="text-indigo-300 font-bold">+{formatAmount(scolariteMoisEffectif)}</strong></span>
                  )}
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  💡 Un reçu officiel détaillé avec mention légale sera imprimé après validation.
                </p>
              </div>

              <div className="text-right w-full md:w-auto border-t md:border-t-0 border-slate-700/60 pt-4 md:pt-0">
                <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Total Encaissé Immédiatement
                </span>
                <span className="block text-4xl sm:text-5xl font-black text-white tracking-tight text-emerald-400">
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
