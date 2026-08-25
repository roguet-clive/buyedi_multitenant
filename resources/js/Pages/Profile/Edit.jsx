import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import useTranslation from "@/Hooks/useTranslation";
import { User, Shield, AlertTriangle } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout title={t('profile')}>
            <Head title={t('profile')} />

            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
                    <User className="w-8 h-8 text-blue-500" />
                    {t('profile_management', 'Gestion du Profil')}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Colonne Gauche : Infos & Password */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('profile_information', 'Informations du profil')}</h3>
                            </div>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('update_password', 'Mise à jour du mot de passe')}</h3>
                            </div>
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </div>

                    {/* Colonne Droite : Danger Zone */}
                    <div className="space-y-6">
                        <div className="p-6 bg-white dark:bg-gray-800 shadow sm:rounded-xl border border-red-100 dark:border-red-900/30">
                            <div className="flex items-center gap-2 mb-4 border-b border-red-100 dark:border-red-900/30 pb-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <h3 className="text-lg font-medium text-red-600 dark:text-red-400">{t('danger_zone', 'Zone de danger')}</h3>
                            </div>
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
