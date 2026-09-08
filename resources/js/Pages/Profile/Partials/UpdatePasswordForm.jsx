import React, { useState, useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const { t } = useTranslation();

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success(t('password_updated', 'Mot de passe mis à jour avec succès ✅'));
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }

                toast.error(t('password_update_error', 'Erreur lors du changement de mot de passe'));
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('password_desc', "Assurez-vous que votre compte utilise un mot de passe robuste d'au moins 8 caractères pour rester sécurisé.")}
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5">
                <div>
                    <InputLabel htmlFor="current_password" value={t('current_password', 'Mot de passe actuel')} className="dark:text-gray-300 font-semibold" />
                    <div className="relative mt-1">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrent ? "text" : "password"}
                            className="block w-full pr-10 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('new_password', 'Nouveau mot de passe')} className="dark:text-gray-300 font-semibold" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showNew ? "text" : "password"}
                            className="block w-full pr-10 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value={t('confirm_password', 'Confirmer le nouveau mot de passe')} className="dark:text-gray-300 font-semibold" />
                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showConfirm ? "text" : "password"}
                            className="block w-full pr-10 dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton 
                        disabled={processing} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md border-none flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('save', 'Mettre à jour le mot de passe')}</span>
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('saved', 'Enregistré.')}</span>
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
