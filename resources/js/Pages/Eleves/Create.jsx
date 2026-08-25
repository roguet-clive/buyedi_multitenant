import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { CameraIcon, TrashIcon, UserIcon, IdentificationIcon, MapPinIcon, HeartIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function EleveForm({ mode = 'create', eleveInitial = null }) {
  const { t } = useTranslation();
  const { permissions = {} } = usePage().props;
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sécuriser les données initiales
  const initialData = {
    nom: eleveInitial?.nom || '',
    prenom: eleveInitial?.prenom || '',
    email: eleveInitial?.email || '',
    sexe: eleveInitial?.sexe || 'M',
    date_naissance: eleveInitial?.date_naissance || '',
    lieu_naissance: eleveInitial?.lieu_naissance || '',
    probleme_particulier: eleveInitial?.probleme_particulier || '',
    photo: null,
  };

  const { data, setData, post, put, processing, errors, reset } = useForm(initialData);

  useEffect(() => {
    document.title = mode === 'create' ? t('add_eleve', 'Nouveau Dossier Élève') : t('edit_eleve', 'Modifier Dossier Élève');
  }, [mode, t]);

  // Charger la preview si une photo existe déjà en mode édition
  useEffect(() => {
    if (mode === 'edit' && eleveInitial?.photo) {
      setPreviewUrl(eleveInitial.photo);
    }
  }, [mode, eleveInitial]);

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('file_too_large', '⚠️ Le fichier est trop lourd. Max 2MB.'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(t('invalid_file_type', '⚠️ Veuillez sélectionner une image valide (JPG, PNG).'));
      return;
    }

    setData('photo', file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const removePhoto = () => {
    setData('photo', null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (mode === 'create') {
      post(route('eleves.store'), {
        data: formData,
        onSuccess: () => {
          reset();
          setPreviewUrl(null);
        },
        onError: () => toast.error(t('error_occurred', 'Veuillez vérifier les champs en rouge.')),
      });
    } else {
      // Form method spoofing pour Laravel API
      formData.append('_method', 'PUT');
      post(route('eleves.update', eleveInitial?.id), {
        data: formData,
        onSuccess: () => {
          // Géré par middleware
        },
        onError: () => toast.error(t('error_occurred', 'Veuillez vérifier les champs en rouge.')),
      });
    }
  };

  return (
    <DashboardLayout title={mode === 'create' ? t('add_eleve', 'Ajout Élève') : t('edit_eleve', 'Mise à jour Élève')}>

      {/* HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={route('eleves.index')}
            className="p-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
            title={t('back_to_list', 'Retour à la liste')}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {mode === 'create' ? t('add_eleve', 'Créer un dossier élève') : t('edit_eleve', 'Mettre à jour le dossier')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              {mode === 'create' ? 'Remplissez les informations ci-dessous pour ajouter un élève.' : 'Modifiez les informations personnelles de l\'élève.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">

        {/* CARTE 1 : PHOTO & IDENTITÉ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <IdentificationIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Identité de l'apprenant</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Bloc Photo (Dropzone) */}
            <div className="flex-shrink-0 w-full lg:w-1/3 flex flex-col items-center">
              <div
                className={`w-48 h-48 rounded-3xl overflow-hidden relative transition-all duration-300 flex items-center justify-center border-4 border-dashed
                     ${isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner'
                    : (previewUrl ? 'border-transparent shadow-lg bg-slate-100 dark:bg-slate-800' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50')
                  }
                   `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 cursor-pointer">
                    <CameraIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-bold text-slate-500">Ajouter une photo</span>
                    <span className="block text-[10px] text-slate-400 mt-1">(Glisser-déposer ou cliquer)</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {previewUrl ? (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="mt-4 px-4 py-1.5 flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold text-xs rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                >
                  <TrashIcon className="w-4 h-4" /> Supprimer la photo
                </button>
              ) : (
                <p className="text-xs text-slate-400 mt-4 text-center">Format recommandé : Carré<br />JPG/PNG (Max 2MB)</p>
              )}
              {errors?.photo && <p className="text-red-500 text-xs font-semibold mt-2 text-center">{errors.photo}</p>}
            </div>

            {/* Bloc Champs Identité */}
            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Nom(s) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={data.nom}
                      onChange={(e) => setData('nom', e.target.value)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-bold
                           ${errors.nom ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'}
                         `}
                      required
                    />
                  </div>
                  {errors?.nom && <p className="text-red-500 text-xs font-semibold">{errors.nom}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Prénom(s)</label>
                  <input
                    type="text"
                    value={data.prenom}
                    onChange={(e) => setData('prenom', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium"
                  />
                  {errors?.prenom && <p className="text-red-500 text-xs font-semibold">{errors.prenom}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Genre <span className="text-red-500">*</span></label>
                  <select
                    value={data.sexe}
                    onChange={(e) => setData('sexe', e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium"
                    required
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  {errors?.sexe && <p className="text-red-500 text-xs font-semibold">{errors.sexe}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Contact / Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="mail@exemple.com"
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium"
                    required
                  />
                  {errors?.email && <p className="text-red-500 text-xs font-semibold">{errors.email}</p>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARTE 2 : HISTORIQUE ET VIE PRIVÉE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Naissance et Origines</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Date de naissance</label>
                <input
                  type="date"
                  value={data.date_naissance}
                  onChange={(e) => setData('date_naissance', e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium"
                />
                {errors?.date_naissance && <p className="text-red-500 text-xs font-semibold">{errors.date_naissance}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Lieu de naissance</label>
                <input
                  type="text"
                  placeholder="Ville, Pays..."
                  value={data.lieu_naissance}
                  onChange={(e) => setData('lieu_naissance', e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium"
                />
                {errors?.lieu_naissance && <p className="text-red-500 text-xs font-semibold">{errors.lieu_naissance}</p>}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400">
                <HeartIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Dossier Médical & Particularités
                {data.probleme_particulier && <ExclamationTriangleIcon className="w-4 h-4 text-red-500 animate-pulse" />}
              </h2>
            </div>

            <div className="space-y-1.5 h-full">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Remarques médicales, allergies, consignes...</label>
              <textarea
                value={data.probleme_particulier}
                onChange={(e) => setData('probleme_particulier', e.target.value)}
                rows={5}
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors sm:text-sm resize-none font-medium h-[116px]"
                placeholder="Laissez vide si l'élève ne présente aucun antécédent particulier à signaler à la direction ou au corps professoral."
              />
              {errors?.probleme_particulier && <p className="text-red-500 text-xs font-semibold">{errors.probleme_particulier}</p>}
            </div>
          </motion.div>
        </div>

        {/* BOUTONS ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link
            href={route('eleves.index')}
            className="text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white px-6 py-3 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="w-full sm:w-auto bg-[#0B1A2D] hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-900/30 disabled:opacity-50 flex justify-center items-center gap-2 text-lg active:scale-95"
          >
            {processing ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CheckCircleIcon className="w-5 h-5" />
            )}
            {mode === 'create' ? 'Déposer le Dossier' : 'Mettre à jour la fiche'}
          </button>
        </div>

      </form>
    </DashboardLayout>
  );
}