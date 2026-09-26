import React from 'react';
import { Shield, Key, CheckCircle, Crown, Lock, Wallet, GraduationCap, BookOpen, Settings, MessageSquare } from 'lucide-react';
import useTranslation from '@/Hooks/useTranslation';

export default function ProfilePermissionsTab({ roles = [], permissions = [], isSuperAdmin = false }) {
    const { t } = useTranslation();

    const modules = [
        {
            name: "Finances, Caisse & Recouvrement",
            icon: Wallet,
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40",
            keys: ['paiements', 'depenses', 'frais', 'arrieres', 'finances', 'caisse'],
        },
        {
            name: "Scolarité, Inscriptions & Classes",
            icon: GraduationCap,
            color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40",
            keys: ['eleves', 'inscriptions', 'classes', 'matieres', 'periodes', 'annee'],
        },
        {
            name: "Pédagogie, Notes & Bulletins",
            icon: BookOpen,
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40",
            keys: ['notes', 'bulletins', 'evaluations', 'absences', 'cours'],
        },
        {
            name: "Administration & Configuration",
            icon: Settings,
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40",
            keys: ['users', 'roles', 'etablissement', 'backup', 'logs', 'dashboard'],
        },
        {
            name: "Communications & Documents",
            icon: MessageSquare,
            color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40",
            keys: ['communications', 'documents', 'demandes', 'notifications'],
        },
    ];

    const getRoleBadgeStyle = (role) => {
        const lower = role.toLowerCase();
        if (lower.includes('admin')) {
            return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20';
        }
        if (lower.includes('directeur')) {
            return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20';
        }
        if (lower.includes('comptable') || lower.includes('econome')) {
            return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20';
        }
        return 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-slate-500/20';
    };

    return (
        <div className="space-y-6">
            {/* EN-TÊTE RÔLES ATTRIBUÉS */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                            {t('assigned_roles', 'Profil de Rôle Système')}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <span>{t('your_roles_title', 'Habilitations & Profils de Connexion')}</span>
                        </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {roles.length === 0 ? (
                            <span className="text-xs font-semibold text-slate-400 italic">Aucun rôle spécifique</span>
                        ) : (
                            roles.map((r, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md ${getRoleBadgeStyle(r)}`}
                                >
                                    <Crown className="w-3.5 h-3.5" />
                                    <span>{r.replace('-', ' ')}</span>
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* BANNIÈRE SUPER ADMIN OU DÉTAILS DES PERMISSIONS */}
            {isSuperAdmin ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-500/30 shrink-0">
                        <Crown className="w-7 h-7" />
                    </div>
                    <div>
                        <h5 className="text-base font-black text-slate-900 dark:text-white">
                            Accès Système Intégral (Super-Administrateur)
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            Votre compte détient le plus haut niveau d'autorisation dans la hiérarchie logicielle de Buyedi. 
                            Vous disposez d'un contrôle complet et sans restriction sur l'ensemble des modules, écritures financières, 
                            configurations d'établissement et gestions d'utilisateurs.
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg border border-amber-500/30">
                            <CheckCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Toutes les permissions ({permissions.length} actives) sont automatiquement accordées</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* MODULES ET DROITS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-500" />
                        <span>Répartition des droits par département</span>
                    </h5>
                    <span className="text-xs text-slate-500 font-medium">
                        {isSuperAdmin ? 'Illimité' : `${permissions.length} permission(s) active(s)`}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((mod, idx) => {
                        const Icon = mod.icon;
                        const matchingPerms = isSuperAdmin
                            ? ['Accès complet en lecture', 'Accès complet en écriture', 'Validation des opérations', 'Export et rapports']
                            : permissions.filter(p => mod.keys.some(k => p.toLowerCase().includes(k)));

                        return (
                            <div
                                key={idx}
                                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-2.5 rounded-xl border ${mod.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h6 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                {mod.name}
                                            </h6>
                                            <span className="text-[10px] text-slate-500">
                                                {matchingPerms.length} habilitation(s)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                                        {matchingPerms.length === 0 ? (
                                            <span className="text-[11px] text-slate-400 italic">Aucun droit spécifique dans ce module</span>
                                        ) : (
                                            matchingPerms.map((perm, pIdx) => (
                                                <span
                                                    key={pIdx}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
                                                >
                                                    <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                                                    <span>{perm.replace(/_/g, ' ')}</span>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
