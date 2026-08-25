import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from '@inertiajs/react';
import { User, BookOpen, Calendar, CreditCard, ArrowUpRight, Mail } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

export default function ParentDashboard({ auth, children, parentName }) {
    const { t } = useTranslation();
    return (
        <DashboardLayout title={t('parent_workspace', 'Espace Parents')}>
            {/* Header Section */}
            <div className="mb-8 bg-gradient-to-r from-indigo-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 mix-blend-overlay blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{t('hello', 'Bonjour')}, {parentName} 👋</h1>
                    <p className="text-indigo-100 text-lg">
                        {t('parent_welcome', 'Bienvenue sur votre espace parental. Voici le suivi de la scolarité de vos enfants.')}
                    </p>
                </div>
            </div>

            {/* Children Grid */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-500" />
                {t('your_children', 'Vos Enfants')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {children.length === 0 ? (
                    <div className="col-span-full bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                        <p className="font-bold text-lg mb-2">{t('no_children_associated', 'Aucun enfant associé.')}</p>
                        <p>{t('no_children_help', 'Si vous avez des enfants inscrits, veuillez contacter l\'administration pour qu\'ils soient liés à votre compte.')}</p>
                    </div>
                ) : (
                    children.map((child) => (
                        <div key={child.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            {/* Card Header with Photo */}
                            <div className="h-32 bg-gray-100 dark:bg-gray-700 relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
                                <div className="absolute -bottom-12 left-6">
                                    <div className="h-24 w-24 rounded-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex items-center justify-center">
                                        {child.photo ? (
                                            <img src={child.photo} alt={child.nom_complet} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-3xl font-bold text-indigo-500">{child.nom_complet.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-14 pb-6 px-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{child.nom_complet}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('matricule', 'Matricule')}: {child.matricule}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${child.statut === 'validee'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {child.classe}
                                    </span>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <Link
                                        href={route('eleves.show', child.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-semibold text-sm group-hover:scale-[1.02] active:scale-95"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        {t('folder', 'Dossier')}
                                    </Link>
                                    <Link
                                        href="#" // Future routage notes
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-400 dark:bg-gray-700 dark:text-gray-500 rounded-xl cursor-not-allowed font-medium text-sm"
                                        title={t('coming_soon', 'Bientôt disponible')}
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                        {t('notes', 'Notes')}
                                    </Link>
                                    <Link
                                        href={route('communications.create', { type: 'admin' })}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition font-semibold text-sm col-span-2 group-hover:scale-[1.02] active:scale-95"
                                    >
                                        <Mail className="w-4 h-4" />
                                        {t('contact_admin', 'Contacter l\'Administration')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
