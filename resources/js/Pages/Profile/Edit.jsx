import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ProfilePermissionsTab from './Partials/ProfilePermissionsTab';
import useTranslation from "@/Hooks/useTranslation";
import { User, Shield, AlertTriangle, Key, Mail, Phone, Calendar, Building2, Crown, CheckCircle2 } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();
    const { auth, etablissement } = usePage().props;
    const user = auth?.user || {};
    const roles = auth?.roles || [];
    const permissions = auth?.permissions || [];
    const isSuperAdmin = roles.some(role => role.toLowerCase() === 'super-admin' || role.toLowerCase() === 'superadmin');

    const [activeTab, setActiveTab] = useState('info');

    // Initiales de l'utilisateur
    const getInitials = () => {
        const p = user.prenom ? user.prenom.charAt(0).toUpperCase() : '';
        const n = user.nom ? user.nom.charAt(0).toUpperCase() : '';
        return (p + n) || 'U';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const tabs = [
        { id: 'info', label: t('tab_profile', 'Informations & Coordonnées'), icon: User },
        { id: 'security', label: t('tab_security', 'Sécurité & Mot de passe'), icon: Shield },
        { id: 'permissions', label: t('tab_permissions', 'Rôles & Habilitations'), icon: Key, badge: roles.length > 0 ? roles[0].replace('-', ' ') : null },
        { id: 'danger', label: t('tab_danger', 'Gestion du Compte'), icon: AlertTriangle, danger: true },
    ];

    return (
        <DashboardLayout title={t('profile', 'Mon Profil Utilisateur')}>
            <Head title={t('profile', 'Profil Utilisateur')} />

            {/* HERO BANNER EXECUTIVE */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-indigo-950 rounded-3xl p-7 sm:p-9 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Profil info gauche */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                        {/* Avatar avec initiales et anneau de statut */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 p-0.5 shadow-xl">
                                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-2xl sm:text-3xl font-black text-white tracking-wider">
                                    {getInitials()}
                                </div>
                            </div>
                            <span 
                                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full shadow-md"
                                title="Compte Actif"
                            ></span>
                        </div>

                        {/* Textes et métadonnées */}
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    {user.prenom} {user.nom}
                                </h1>
                                {isSuperAdmin ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 border border-amber-400/40">
                                        <Crown className="w-3.5 h-3.5" />
                                        <span>Super Admin</span>
                                    </span>
                                ) : roles.length > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>{roles[0].replace('-', ' ')}</span>
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-300">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{user.email}</span>
                                    {user.email_verified_at && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Email vérifié" />
                                    )}
                                </span>
                                {user.telephone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{user.telephone}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{etablissement?.nom || 'Buyedi Academy'}</span>
                                </span>
                            </div>

                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>Compte créé le {formatDate(user.created_at)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Stats rapides droite */}
                    <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                        <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rôle</span>
                            <span className="text-sm font-black text-amber-300 block capitalize">
                                {roles[0] ? roles[0].replace('-', ' ') : 'Standard'}
                            </span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Habilitations</span>
                            <span className="text-sm font-black text-emerald-400 block">
                                {isSuperAdmin ? 'Toutes (*)' : `${permissions.length} actives`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NAVIGATION PAR ONGLETS (TABS) */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px mb-6 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                                isActive
                                    ? tab.danger
                                        ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 shadow-sm border border-red-200 dark:border-red-900/60'
                                        : 'bg-white text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 shadow-md border border-slate-200/80 dark:border-slate-800'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? (tab.danger ? 'text-red-600' : 'text-indigo-600 dark:text-indigo-400') : 'text-slate-400'}`} />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className="ml-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* CONTENU DE L'ONGLET ACTIF */}
            <div className="transition-all duration-200">
                {activeTab === 'info' && (
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                )}

                {activeTab === 'security' && (
                    <UpdatePasswordForm />
                )}

                {activeTab === 'permissions' && (
                    <ProfilePermissionsTab
                        roles={roles}
                        permissions={permissions}
                        isSuperAdmin={isSuperAdmin}
                    />
                )}

                {activeTab === 'danger' && (
                    <DeleteUserForm />
                )}
            </div>
        </DashboardLayout>
    );
}
