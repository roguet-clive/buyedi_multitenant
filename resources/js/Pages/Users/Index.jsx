import React, { useState, useEffect, useRef } from "react";
import { useForm, usePage, router, Link, Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { 
  Pencil, 
  Trash2, 
  Filter, 
  Plus, 
  Users as UsersIcon, 
  Search, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle,
  KeyRound
} from "lucide-react";

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
];

const getAvatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const ROLE_CONFIG = {
  'super-admin': { 
    label: 'Super Administrateur', 
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800' 
  },
  'directeur': { 
    label: 'Directeur', 
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
  },
  'comptable': { 
    label: 'Comptable', 
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
  },
  'enseignant': { 
    label: 'Enseignant', 
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
  },
  'personnel': { 
    label: 'Personnel', 
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' 
  },
  'parent': { 
    label: 'Parent', 
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
  },
  'eleve': { 
    label: 'Élève', 
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
  },
};

function getRoleLabel(roleName, t) {
  if (ROLE_CONFIG[roleName]?.label) {
    return t(`role_${roleName}`, ROLE_CONFIG[roleName].label);
  }
  return t(`role_${roleName}`, roleName);
}

function UserForm({ user, roles, onClose }) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    password: "",
    roles: user?.roles?.map((r) => r.name) || [],
  });

  useEffect(() => {
    if (user) {
      form.setData({ 
        nom: user.nom || "", 
        prenom: user.prenom || "", 
        email: user.email || "", 
        telephone: user.telephone || "",
        password: "",
        roles: user.roles?.map((r) => r.name) || [] 
      });
    } else {
      form.reset();
      form.clearErrors();
    }
  }, [user]);

  const submit = (e) => {
    e.preventDefault();
    const opts = { 
      onSuccess: () => { 
        onClose(); 
        form.reset(); 
      },
      onError: () => {
        toast.error(t("form_validation_error", "Veuillez vérifier les informations saisies"));
      }
    };
    if (user) { 
      form.put(route("users.update", user.id), opts); 
    } else { 
      form.post(route("users.store"), opts); 
    }
  };

  const handleRoleToggle = (roleName) => {
    const isChecked = form.data.roles.includes(roleName);
    const newRoles = isChecked 
      ? form.data.roles.filter((r) => r !== roleName) 
      : [...form.data.roles, roleName];
    form.setData("roles", newRoles);
  };

  return (
    <div className="flex flex-col md:flex-row overflow-hidden max-h-[85vh]">
      {/* PANNEAU GAUCHE - Informations utilisateur */}
      <div className="md:w-80 shrink-0 bg-slate-50 dark:bg-slate-800/70 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
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
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t("nom", "Nom")} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={form.data.nom} 
              onChange={(e) => form.setData("nom", e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="Ex: DIALLO" 
            />
            {form.errors.nom && <p className="text-red-500 text-xs mt-1">{form.errors.nom}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t("prenom", "Prénom")}
            </label>
            <input 
              type="text" 
              value={form.data.prenom} 
              onChange={(e) => form.setData("prenom", e.target.value)}
              className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              placeholder="Ex: Mamadou" 
            />
            {form.errors.prenom && <p className="text-red-500 text-xs mt-1">{form.errors.prenom}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t("email", "Email")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                required
                value={form.data.email} 
                onChange={(e) => form.setData("email", e.target.value)}
                className="w-full pl-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pr-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                placeholder="utilisateur@ecole.com" 
              />
            </div>
            {form.errors.email && <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1">
              {t("telephone", "Téléphone")}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="tel" 
                value={form.data.telephone} 
                onChange={(e) => form.setData("telephone", e.target.value)}
                className="w-full pl-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pr-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                placeholder="+241 07 XX XX XX" 
              />
            </div>
            {form.errors.telephone && <p className="text-red-500 text-xs mt-1">{form.errors.telephone}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {user ? t("new_password", "Nouveau Mot de passe") : t("password", "Mot de passe")}
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                {user ? t("optional_leave_blank", "Facultatif") : t("optional_auto_gen", "Généré si vide")}
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={form.data.password} 
                onChange={(e) => form.setData("password", e.target.value)}
                className="w-full pl-10 pr-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                placeholder={user ? "Laisser vide pour conserver" : "Laisser vide pour générer"} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.errors.password && <p className="text-red-500 text-xs mt-1">{form.errors.password}</p>}
            {!user && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Le mot de passe sera envoyé par email à l'utilisateur.</span>
              </p>
            )}
          </div>
        </form>

        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={form.processing}
            className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold transition-colors text-sm"
          >
            {t("cancel", "Annuler")}
          </button>
          <button 
            type="submit" 
            form="user-form" 
            disabled={form.processing}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-1.5 text-sm ${
              user 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
            }`}
          >
            {form.processing ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {user ? t("update", "Mettre à jour") : t("create", "Créer le compte")}
          </button>
        </div>
      </div>

      {/* PANNEAU DROIT - Rôles & Accès */}
      <div className="flex-1 p-6 md:p-7 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t("roles_permissions", "Attribution des Rôles")}
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            {form.data.roles.length} {t("roles_selected", "rôle(s) sélectionné(s)")}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Sélectionnez un ou plusieurs rôles à assigner à cet utilisateur pour définir ses droits d'accès.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1">
          {roles.map((role) => {
            const isChecked = form.data.roles.includes(role.name);
            const roleMeta = ROLE_CONFIG[role.name] || { badge: 'bg-slate-100 text-slate-700' };

            return (
              <div 
                key={role.id} 
                onClick={() => handleRoleToggle(role.name)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isChecked 
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-900/20 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60'
                }`}
              >
                <input 
                  type="checkbox" 
                  value={role.name} 
                  checked={isChecked}
                  onChange={() => {}} // Géré par onClick du parent
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${roleMeta.badge}`}>
                      {getRoleLabel(role.name, t)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {role.name === 'super-admin' && 'Accès complet et configuration avancée'}
                    {role.name === 'directeur' && 'Direction de l\'établissement et gestion globale'}
                    {role.name === 'comptable' && 'Gestion financière, paiements et arriérés'}
                    {role.name === 'enseignant' && 'Cahier de notes, cours et emploi du temps'}
                    {role.name === 'personnel' && 'Accès administratif et gestion courante'}
                    {role.name === 'parent' && 'Espace de suivi des élèves rattachés'}
                    {role.name === 'eleve' && 'Espace de consultation notes et devoirs'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {form.errors.roles && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{form.errors.roles}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Users({ users, roles, filters, isSuperAdmin }) {
  const { t } = useTranslation();
  const { auth } = usePage().props;

  const [search, setSearch] = useState(filters.search || "");
  const [filterRole, setFilterRole] = useState(filters.role || "");
  const [showSuperAdmin, setShowSuperAdmin] = useState(Boolean(filters.show_superadmin));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      router.get(
        route("users.index"), 
        { 
          search: search || undefined, 
          role: filterRole || undefined,
          show_superadmin: showSuperAdmin ? '1' : undefined,
        }, 
        { 
          preserveState: true, 
          replace: true,
          preserveScroll: true,
        }
      );
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, filterRole, showSuperAdmin]);

  const openCreateModal = () => { 
    setEditingUser(null); 
    setModalOpen(true); 
  };

  const openEditModal = (user) => { 
    setEditingUser(user); 
    setModalOpen(true); 
  };

  const clearFilters = () => {
    setSearch("");
    setFilterRole("");
    setShowSuperAdmin(false);
    router.get(route("users.index"), {}, { preserveState: true, replace: true });
  };

  const destroy = (user) => {
    if (auth?.user?.id === user.id) {
      toast.error(t("cannot_delete_self", "Vous ne pouvez pas supprimer votre propre compte."));
      return;
    }

    if (!confirm(t("confirm_delete_user", `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.prenom} ${user.nom}" ?`))) {
      return;
    }

    router.delete(route("users.destroy", user.id), {
      preserveScroll: true,
      onSuccess: () => toast.success(t("user_deleted", "Utilisateur supprimé avec succès")),
      onError: () => toast.error(t("delete_failed", "Erreur lors de la suppression de l'utilisateur")),
    });
  };

  const hasFilters = Boolean(search || filterRole || showSuperAdmin);

  return (
    <DashboardLayout title={t("users_management", "Gestion des Utilisateurs")}>
      <Head title={t("users", "Utilisateurs")} />

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-[#0B1A2D] via-slate-800 to-indigo-900 rounded-3xl p-6 sm:p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
              <UsersIcon className="w-9 h-9 text-indigo-200" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs sm:text-sm font-medium mb-3 border border-white/10">
                <Shield className="w-4 h-4" />
                <span>{t("user_access_control", "Contrôle d'Accès & Sécurité")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 tracking-tight">
                {t("users_title", "Utilisateurs du Système")}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl font-light">
                {t("users_desc", "Créez les comptes utilisateurs, modifiez leurs profils et assignez les rôles d'accès au logiciel.")}
              </p>
            </div>
          </div>

          <button 
            onClick={openCreateModal}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 group w-full md:w-auto"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>{t("add_user", "Nouvel Utilisateur")}</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR (RECHERCHE & FILTRES) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 relative z-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_user", "Rechercher par nom, prénom, email ou téléphone...")}
            className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-slate-900 dark:text-white placeholder:text-slate-400" 
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full pl-11 pr-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer text-slate-900 dark:text-white"
          >
            <option value="">{t("all_roles", "Tous les rôles")}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {getRoleLabel(role.name, t)}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle discret pour super-admins */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowSuperAdmin(!showSuperAdmin)}
            className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-bold border transition-all ${
              showSuperAdmin
                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50"
            }`}
            title={showSuperAdmin ? "Masquer les comptes Super-Admin" : "Afficher les comptes Super-Admin"}
          >
            {showSuperAdmin ? <Eye className="w-4 h-4 text-purple-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span>{showSuperAdmin ? "Super-Admin visibles" : "Super-Admin masqués"}</span>
          </button>
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            <span>{t("reset_filters", "Réinitialiser")}</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm sm:ml-auto">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {users.total} {t("users_count", "utilisateur(s)")}
          </span>
        </div>
      </div>

      {/* TABLEAU DES UTILISATEURS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1A2D] text-white">
                <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase rounded-tl-3xl">
                  {t("user", "Utilisateur")}
                </th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase">
                  {t("contact", "Email & Téléphone")}
                </th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase">
                  {t("roles", "Rôles assignés")}
                </th>
                <th className="py-4 px-6 font-semibold text-xs tracking-wider uppercase text-center rounded-tr-3xl w-32">
                  {t("actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.data.length > 0 ? (
                users.data.map((user) => {
                  const isCurrentLoggedUser = auth?.user?.id === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.nom)} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
                            {((user.prenom?.charAt(0) || user.nom?.charAt(0) || '?')).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 dark:text-white">
                                {user.prenom} {user.nom}
                              </p>
                              {isCurrentLoggedUser && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-bold rounded-full">
                                  {t("you", "Vous")}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              ID #{user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.email}</span>
                          </p>
                          {user.telephone && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{user.telephone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r) => {
                              const roleMeta = ROLE_CONFIG[r.name] || { badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' };
                              return (
                                <span 
                                  key={r.id} 
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleMeta.badge}`}
                                >
                                  <Shield className="w-3 h-3" />
                                  <span>{getRoleLabel(r.name, t)}</span>
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                              {t("no_role_assigned", "Aucun rôle assigné")}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => openEditModal(user)}
                            title={t("edit", "Modifier")}
                            className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => destroy(user)}
                            disabled={isCurrentLoggedUser}
                            title={isCurrentLoggedUser ? t("cannot_delete_self", "Vous ne pouvez pas supprimer votre propre compte") : t("delete", "Supprimer")}
                            className={`p-2 rounded-xl transition-colors ${
                              isCurrentLoggedUser 
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50' 
                                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <UsersIcon className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-base font-semibold mb-1">
                        {t("no_users_found", "Aucun utilisateur trouvé")}
                      </p>
                      <p className="text-xs max-w-sm mb-4">
                        {hasFilters 
                          ? t("no_users_filter_desc", "Aucun utilisateur ne correspond à vos critères de recherche.")
                          : t("no_users_desc", "Commencez par ajouter un nouvel utilisateur au système.")}
                      </p>
                      {hasFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {t("reset_all_filters", "Réinitialiser tous les filtres")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {users.links && users.links.length > 3 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Affichage de <span className="font-semibold">{users.from || 0}</span> à <span className="font-semibold">{users.to || 0}</span> sur <span className="font-semibold">{users.total}</span> utilisateurs
            </p>
            <div className="flex flex-wrap gap-1.5">
              {users.links.map((link, i) => (
                <Link 
                  key={i} 
                  href={link.url || "#"} 
                  preserveScroll 
                  preserveState
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    link.active 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : link.url 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" 
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-default pointer-events-none"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL CRÉATION / ÉDITION */}
      <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="4xl">
        <UserForm 
          key={editingUser ? `edit-${editingUser.id}` : "new"} 
          user={editingUser} 
          roles={roles} 
          onClose={() => setModalOpen(false)} 
        />
      </Modal>
    </DashboardLayout>
  );
}
