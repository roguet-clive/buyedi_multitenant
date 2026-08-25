import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import useTranslation from '@/Hooks/useTranslation';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {t('delete_account', 'Supprimer le compte')}
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('delete_account_desc', 'Une fois votre compte supprimé, toutes ses ressources et données seront définitivement effacées.')}
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="bg-red-600 hover:bg-red-700">
                {t('delete_account', 'Supprimer le compte')}
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 dark:bg-gray-800 dark:text-white">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('confirm_delete_account_title', 'Êtes-vous sûr de vouloir supprimer votre compte ?')}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {t('confirm_delete_account_desc', 'Veuillez entrer votre mot de passe pour confirmer que vous souhaitez supprimer définitivement votre compte.')}
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value={t('password', 'Mot de passe')} className="sr-only" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            isFocused
                            placeholder={t('password', 'Mot de passe')}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            {t('cancel', 'Annuler')}
                        </SecondaryButton>

                        <DangerButton className="ms-3 bg-red-600 hover:bg-red-700" disabled={processing}>
                            {t('delete_account', 'Supprimer le compte')}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
