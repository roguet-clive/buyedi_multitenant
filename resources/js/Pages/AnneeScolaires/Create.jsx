// resources/js/Pages/AnneeScolaires/Create.jsx
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';

export default function Create() {
  const { t } = useTranslation();
  const { flash, auth } = usePage().props;
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  const generatePeriods = (count = 8, start = new Date().getFullYear()) =>
    Array.from({ length: count }).map((_, i) => `${start + i}-${start + i + 1}`);

  const form = useForm({
    nom: generatePeriods(1, new Date().getFullYear())[0],
  });

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!can('ajouter_annee_scolaire')) {
      toast.error(t('no_permission', '❌ Permission refusée'));
      return;
    }
    form.post(route('annee_scolaires.store'), {
      onSuccess: () => toast.success(t('annee_scolaire_created', 'Année scolaire créée ✅')),
    });
  };

  const periods = generatePeriods(10, new Date().getFullYear());

  return (
    <DashboardLayout>
      <Head title={t('add_annee_scolaire', 'Ajouter une année scolaire')} />

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">{t('add_annee_scolaire', 'Ajouter une année scolaire')}</h1>
          <Link
            href={route('annee_scolaires.index')}
            className="text-sm px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← {t('back_to_list', 'Retour à la liste')}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">{t('name', 'Nom')}</label>
            <select
              value={form.data.nom}
              onChange={(e) => form.setData('nom', e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              {periods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {form.errors.nom && (
              <p className="text-red-500 text-sm mt-1">{form.errors.nom}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 flex-wrap">
            <Link
              href={route('annee_scolaires.index')}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('cancel', 'Annuler')}
            </Link>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('create', 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
