import DashboardLayout from '@/Layouts/DashboardLayout';
import PermissionMatrix from '@/Shared/PermissionMatrix';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { Shield, Pencil, ArrowLeft, Save, Clock, Key } from 'lucide-react';

export default function EditRole() {
  const { t } = useTranslation();
  const { role, permissions } = usePage().props;

  const { data, setData, put, processing, errors } = useForm({
    name: role.name,
    permissions: role.permissions.map((p) => p.name),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('roles.update', role.id));
  };

  return (
    <DashboardLayout title={t('edit_role', 'Modifier le Rôle')}>
      <Head title={t('edit_role', 'Modifier le rôle')} />

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
          {/* Colonne gauche */}
          <div className="xl:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 xl:sticky xl:top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {t('edit_role_identity', 'Modifier le Rôle')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Édition : <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{role.name}</span>
                  </p>
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
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="Ex: comptable, directeur..."
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl mb-6">
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    {data.permissions.length} permission{data.permissions.length !== 1 ? 's' : ''} sélectionnée{data.permissions.length !== 1 ? 's' : ''} pour ce rôle.
                  </p>
                </div>
              </div>

              <button type="submit" disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-70">
                {processing ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('update_role', 'Mettre à jour')}
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
                    <p className="text-sm text-slate-500 mt-0.5">Cochez ou décochez les actions autorisées pour ce rôle</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <PermissionMatrix
                  permissions={permissions}
                  value={data.permissions}
                  onChange={(perms) => setData('permissions', perms)}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
