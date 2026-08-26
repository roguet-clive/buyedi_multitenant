import React, { useState, useEffect } from "react";
import { useForm, usePage, router, Link, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { Pencil, Trash2, Filter, Plus, Users as UsersIcon, Search, CheckCircle2, Clock, Shield } from "lucide-react";

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-red-500 to-blue-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
];
const getAvatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

function UserForm({ user, roles, onClose }) {
  const { t } = useTranslation();
  const form = useForm({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    roles: user?.roles?.map((r) => r.name) || [],
  });

  useEffect(() => {
    if (user) {
      form.setData({ nom: user.nom, prenom: user.prenom, email: user.email, roles: user.roles?.map((r) => r.name) || [] });
    } else {
      form.reset("nom", "prenom", "email", "roles");
    }
  }, [user]);

  const submit = (e) => {
    e.preventDefault();
    const opts = { onSuccess: () => { onClose(); form.reset(); } };
    if (user) { form.put(route("users.update", user.id), opts); }
    else { form.post(route("users.store"), opts); }
  };

  return (
    <div className="flex flex-col md:flex-row overflow-hidden">
      {/* PANNEAU GAUCHE - Informations */}
      <div className="md:w-72 shrink-0 bg-slate-50 dark:bg-slate-800/60 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 p-7 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2.5 rounded-xl ${user ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
            {user ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {user ? t("edit_user", "Modifier l'utilisateur") : t("create_user", "Nouvel Utilisateur")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Informations du compte</p>
          </div>
        </div>

        <form id="user-form" onSubmit={submit} className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t("nom", "Nom")} *</label>
            <input type="text" value={form.data.nom} onChange={(e) => form.setData("nom", e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="Ex: DIALLO" />
            {form.errors.nom && <p className="text-red-500 text-xs mt-1">{form.errors.nom}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t("prenom", "Prénom")} *</label>
            <input type="text" value={form.data.prenom} onChange={(e) => form.setData("prenom", e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="Ex: Mamadou" />
            {form.errors.prenom && <p className="text-red-500 text-xs mt-1">{form.errors.prenom}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{t("email", "Email")} *</label>
            <input type="email" value={form.data.email} onChange={(e) => form.setData("email", e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="email@ecole.com" />
            {form.errors.email && <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>}
          </div>
        </form>

        <div className="flex gap-3 mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
          <button type="button" onClick={onClose} disabled={form.processing}
            className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-semibold transition-colors text-sm">
            {t("cancel", "Annuler")}
          </button>
          <button type="submit" form="user-form" disabled={form.processing}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-1.5 text-sm ${user ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
            {form.processing ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {user ? t("update", "Mettre à jour") : t("create", "Créer")}
          </button>
        </div>
      </div>

      {/* PANNEAU DROIT - Rôles */}
      <div className="flex-1 p-7">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{t("roles", "Rôles & Accès")}</h3>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {roles.map((role) => {
            const isChecked = form.data.roles.includes(role.name);
            return (
              <label key={role.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${isChecked ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'}`}>
                <input type="checkbox" value={role.name} checked={isChecked}
                  onChange={(e) => {
                    const newRoles = e.target.checked ? [...form.data.roles, role.name] : form.data.roles.filter((r) => r !== role.name);
                    form.setData("roles", newRoles);
                  }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {t(`role_${role.name}`, role.name)}
                </span>
              </label>
            );
          })}
        </div>
        {form.errors.roles && <p className="text-red-500 text-sm mt-2">{form.errors.roles}</p>}
      </div>
    </div>
  );
}

export default function Users({ users, roles, filters }) {
  const { t } = useTranslation();
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search || "");
  const [filterRole, setFilterRole] = useState(filters.role || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(route("users.index"), { search, role: filterRole }, { preserveState: true, replace: true });
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, filterRole]);

  const openCreateModal = () => { setEditingUser(null); setModalOpen(true); };
  const openEditModal = (user) => { setEditingUser(user); setModalOpen(true); };

  const destroy = (id) => {
    if (!confirm(t("confirm_delete", "⚠️ Supprimer cet utilisateur ?"))) return;
    router.delete(route("users.destroy", id), {
      preserveScroll: true,
      onError: () => toast.error(t("delete_failed", "❌ Erreur lors de la suppression")),
    });
  };

  return (
    <DashboardLayout title={t("users_management", "Gestion des Utilisateurs")}>
      <Head title={t("users", "Utilisateurs")} />

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0B1A2D] via-slate-800 to-indigo-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
              <UsersIcon className="w-10 h-10 text-indigo-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-sm font-medium mb-3 border border-white/10">
                <Shield className="w-4 h-4" />
                <span>{t("user_access_control", "Contrôle d'Accès")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                {t("users_title", "Utilisateurs du Système")}
              </h1>
              <p className="text-slate-300 text-base max-w-xl font-light">
                {t("users_desc", "Gérez les comptes utilisateurs, assignez des rôles et contrôlez les accès à l'application.")}
              </p>
            </div>
          </div>

          <button onClick={openCreateModal}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 group w-full md:w-auto mt-4 md:mt-0">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t("add_user", "Nouvel Utilisateur")}
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10 -mt-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_user", "Rechercher un utilisateur...")}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all" />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer">
            <option value="">{t("all_roles", "Tous les rôles")}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>{t(`role_${role.name}`, role.name)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm ml-auto">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {users.total} {t("users_count", "utilisateurs")}
          </span>
        </div>
      </div>

      {/* TABLEAU PREMIUM */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1A2D] text-white">
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Utilisateur</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Email</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Rôles</th>
                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase text-center rounded-tr-3xl w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.data.length > 0 ? (
                users.data.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.prenom)} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                          {(user.prenom?.charAt(0) || '?').toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-800 dark:text-white">{user.prenom} {user.nom}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.length > 0 ? (
                          user.roles.map((r) => (
                            <span key={r.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold">
                              <Shield className="w-3 h-3" />
                              {t(`role_${r.name}`, r.name)}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">Aucun rôle</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(user)}
                          className="p-2.5 rounded-full text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => destroy(user.id)}
                          className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <UsersIcon className="w-16 h-16 mb-4 opacity-40" />
                      <p className="text-lg font-medium">{t("no_users_found", "Aucun utilisateur trouvé")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {users.links && users.links.length > 3 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {users.links.map((link, i) => (
              <Link key={i} href={link.url || "#"} preserveScroll preserveState
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${link.active ? "bg-indigo-600 text-white shadow-sm" : link.url ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-default"}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>

      <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="2xl">
        <UserForm key={editingUser ? `edit-${editingUser.id}` : "new"} user={editingUser} roles={roles} onClose={() => setModalOpen(false)} />
      </Modal>
    </DashboardLayout>
  );
}
