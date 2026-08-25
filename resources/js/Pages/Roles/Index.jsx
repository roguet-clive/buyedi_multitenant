import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { Shield, Plus, Pencil, Trash2, Key, ArrowLeft } from 'lucide-react';

export default function Index() {
  const { t } = useTranslation();
  const { roles } = usePage().props;
  const { delete: destroy } = useForm();

  const handleDelete = (roleId) => {
    if (!confirm(t('confirm_delete', '⚠️ Supprimer ce rôle ?'))) return;
    destroy(route('roles.destroy', roleId));
  };

  return (
    <DashboardLayout title={t('roles_management', 'Gestion des Rôles')}>
      <Head title={t('roles', 'Rôles')} />

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0B1A2D] via-slate-800 to-indigo-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
              <Shield className="w-10 h-10 text-indigo-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-sm font-medium mb-3 border border-white/10">
                <Key className="w-4 h-4" />
                <span>{t("access_management", "Gestion des Accès")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                {t("roles_title", "Rôles & Permissions")}
              </h1>
              <p className="text-slate-300 text-base max-w-xl font-light">
                {t("roles_desc", "Définissez les profils d'accès et associez des permissions précises à chaque rôle pour sécuriser votre application.")}
              </p>
            </div>
          </div>

          <Link href={route('roles.create')}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 group w-full md:w-auto mt-4 md:mt-0">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t('create_role', 'Nouveau Rôle')}
          </Link>
        </div>
      </div>

      {/* TABLEAU PREMIUM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative z-10 -mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1A2D] text-white">
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl w-1/4">Nom du Rôle</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Permissions Associées</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase text-center rounded-tr-3xl w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors align-top">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white capitalize">{role.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.length > 0 ? (
                        role.permissions.map((p) => (
                          <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-full text-xs font-medium">
                            <Key className="w-3 h-3" />
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-sm italic">Aucune permission assignée</span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={route('roles.edit', role.id)}
                        className="p-2.5 rounded-full text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                        title={t('edit', 'Modifier')}>
                        <Pencil className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(role.id)}
                        className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title={t('delete', 'Supprimer')}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
