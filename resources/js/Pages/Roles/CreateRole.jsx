import DashboardLayout from '@/Layouts/DashboardLayout';
import PermissionMatrix from '@/Shared/PermissionMatrix';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { Shield, Plus, ArrowLeft, Save, Clock, Key } from 'lucide-react';

export default function CreateRole() {
  const { t } = useTranslation();
  const { permissions } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    permissions: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('roles.store'));
  };

  return (
    <DashboardLayout title={t('create_role', 'Créer un Rôle')}>
      <Head title={t('create_role', 'Créer un rôle')} />

      {/* HEADER */}
      <div className="flex items-center mb-8">
        <Link href={route('roles.index')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('back_to_roles', 'Retour aux Rôles')}
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Colonne gauche - Infos */}
          <div className="xl:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 xl:sticky xl:top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {t('role_identity', 'Nouveau Rôle')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Définissez le nom et les droits</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t('role_name', 'Nom du rôle')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Ex: comptable, directeur..."
                  autoFocus
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl mb-6">
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {data.permissions.length > 0
                      ? `${data.permissions.length} permission${data.permissions.length > 1 ? 's' : ''} sélectionnée${data.permissions.length > 1 ? 's' : ''}`
                      : "Sélectionnez les permissions ci-contre pour définir les droits de ce rôle."}
                  </p>
                </div>
              </div>

              <button type="submit" disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70">
                {processing ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('save_role', 'Créer le Rôle')}
              </button>
            </div>
          </div>

          {/* Colonne droite - Permissions */}
          <div className="xl:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {t('permissions_matrix', 'Matrice des Permissions')}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">Cochez les actions autorisées pour ce rôle</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <PermissionMatrix
                  permissions={permissions.map((perm) => ({
                    name: perm.name,
                    label: perm.name,
                  }))}
                  value={data.permissions}
                  onChange={(permsSelected) => setData('permissions', permsSelected)}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
