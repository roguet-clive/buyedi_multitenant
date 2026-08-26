import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from '@inertiajs/react';
import { User, BookOpen, Calendar, CreditCard, ArrowUpRight, Mail, FileText, CheckCircle2, Award, Clock } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

export default function ParentDashboard({ auth, children = [], parentName }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout title={t('parent_workspace', 'Espace Parents')}>
            <Head title="Espace Parents - Suivi Scolaire" />

            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-[#0B1A2D] via-indigo-900 to-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 mix-blend-overlay blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-blue-500/10 mix-blend-overlay blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-md border border-white/10">
                            👨‍👩‍👧 Portail Parental Officiel
                        </div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">{t('hello', 'Bonjour')}, {parentName} 👋</h1>
                        <p className="text-indigo-100 text-base max-w-2xl leading-relaxed">
                            {t('parent_welcome', 'Suivez en temps réel la scolarité, les relevés de notes, la situation financière et les démarches administratives de vos enfants.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('demandes-documents.index')}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 shrink-0"
                        >
                            <FileText className="w-4 h-4" />
                            <span>Guichet des Demandes</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Children Grid */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                        <User className="w-5 h-5" />
                    </div>
                    <span>{t('your_children', 'Vos Enfants Inscrits')} ({children.length})</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {children.length === 0 ? (
                    <div className="col-span-full bg-amber-50 dark:bg-amber-900/20 p-8 rounded-3xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                        <h4 className="font-extrabold text-lg mb-2">{t('no_children_associated', 'Aucun enfant associé actuellement.')}</h4>
                        <p className="text-sm leading-relaxed">
                            {t('no_children_help', 'Si vos enfants sont déjà inscrits à l\'établissement, veuillez contacter le secrétariat pour lier leurs dossiers à votre compte parental.')}
                        </p>
                    </div>
                ) : (
                    children.map((child) => (
                        <div key={child.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group overflow-hidden flex flex-col justify-between">
                            <div>
                                {/* Header Card */}
                                <div className="h-28 bg-gradient-to-r from-slate-100 to-indigo-50 dark:from-slate-800 dark:to-slate-850 relative p-6">
                                    <div className="absolute -bottom-10 left-6">
                                        <div className="h-20 w-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-md overflow-hidden flex items-center justify-center">
                                            {child.photo ? (
                                                <img src={child.photo} alt={child.nom_complet} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="text-2xl font-black text-indigo-600">{child.nom_complet.charAt(0)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${child.statut === 'validee'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {child.classe}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-12 pb-4 px-6">
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-0.5">{child.nom_complet}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{t('matricule', 'Matricule')}: <strong className="text-slate-600 dark:text-slate-300">{child.matricule}</strong></p>
                                </div>
                            </div>

                            {/* Actions Grille */}
                            <div className="p-6 pt-0 space-y-2.5">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <Link
                                        href={route('eleves.show', child.id)}
                                        className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition font-bold text-xs border border-slate-100 dark:border-slate-700 active:scale-95"
                                    >
                                        <BookOpen className="w-4 h-4 text-indigo-500" />
                                        <span>Dossier Élève</span>
                                    </Link>
                                    <Link
                                        href={route('notes.index', { child_id: child.id })}
                                        className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition font-bold text-xs border border-slate-100 dark:border-slate-700 active:scale-95"
                                    >
                                        <Award className="w-4 h-4 text-emerald-500" />
                                        <span>Notes & Bulletins</span>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <Link
                                        href={route('paiements.index', { child_id: child.id })}
                                        className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition font-bold text-xs border border-slate-100 dark:border-slate-700 active:scale-95"
                                    >
                                        <CreditCard className="w-4 h-4 text-blue-500" />
                                        <span>Caisse & Scolarité</span>
                                    </Link>
                                    <Link
                                        href={route('demandes-documents.index')}
                                        className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition font-bold text-xs border border-slate-100 dark:border-slate-700 active:scale-95"
                                    >
                                        <FileText className="w-4 h-4 text-purple-500" />
                                        <span>Demander Doc</span>
                                    </Link>
                                </div>

                                <Link
                                    href={route('communications.create', { type: 'admin' })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl transition font-bold text-xs border border-indigo-200/50 dark:border-indigo-800/50 active:scale-95"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Écrire à l'administration / enseignants</span>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
