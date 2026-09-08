import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { User, Mail, Phone, CheckCircle2 } from 'lucide-react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('profile_updated', 'Profil mis à jour avec succès ✅'));
            },
            onError: () => {
                toast.error(t('profile_update_error', 'Veuillez corriger les erreurs du profil'));
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('profile_info_desc', "Mettez à jour les informations de profil, coordonnées et l'adresse email de votre compte.")}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="nom" value={t('nom', 'Nom')} className="dark:text-gray-300 font-semibold" />
                        <TextInput
                            id="nom"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            value={data.nom}
                            onChange={(e) => setData('nom', e.target.value)}
                            required
                            autoComplete="family-name"
                        />
                        <InputError className="mt-2" message={errors.nom} />
                    </div>

                    <div>
                        <InputLabel htmlFor="prenom" value={t('prenom', 'Prénom')} className="dark:text-gray-300 font-semibold" />
                        <TextInput
                            id="prenom"
                            className="mt-1 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            value={data.prenom}
                            onChange={(e) => setData('prenom', e.target.value)}
                            autoComplete="given-name"
                        />
                        <InputError className="mt-2" message={errors.prenom} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('email', 'Email')} className="dark:text-gray-300 font-semibold" />
                    <div className="relative mt-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <TextInput
                            id="email"
                            type="email"
                            className="pl-10 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="telephone" value={t('telephone', 'Téléphone')} className="dark:text-gray-300 font-semibold" />
                    <div className="relative mt-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <TextInput
                            id="telephone"
                            type="tel"
                            className="pl-10 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                            value={data.telephone}
                            onChange={(e) => setData('telephone', e.target.value)}
                            placeholder="+241 07 XX XX XX"
                            autoComplete="tel"
                        />
                    </div>
                    <InputError className="mt-2" message={errors.telephone} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            {t('email_unverified', "Votre adresse email n'est pas encore vérifiée.")}{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-200"
                            >
                                {t('resend_verification', "Renvoyer le lien de vérification")}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-emerald-600 dark:text-emerald-400">
                                {t('verification_sent', "Un nouveau lien de vérification a été envoyé à votre adresse email.")}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton 
                        disabled={processing} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md border-none flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('save', 'Enregistrer les modifications')}</span>
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
