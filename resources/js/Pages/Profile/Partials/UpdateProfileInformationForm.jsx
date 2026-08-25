import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('profile_info_desc', "Mettez à jour les informations de profil et l'adresse email de votre compte.")}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="nom" value={t('nom', 'Nom')} className="dark:text-gray-300" />
                    <TextInput
                        id="nom"
                        className="mt-1 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        value={data.nom}
                        onChange={(e) => setData('nom', e.target.value)}
                        required
                        isFocused
                        autoComplete="family-name"
                    />
                    <InputError className="mt-2" message={errors.nom} />
                </div>

                <div>
                    <InputLabel htmlFor="prenom" value={t('prenom', 'Prénom')} className="dark:text-gray-300" />
                    <TextInput
                        id="prenom"
                        className="mt-1 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        value={data.prenom}
                        onChange={(e) => setData('prenom', e.target.value)}
                        required
                        autoComplete="given-name"
                    />
                    <InputError className="mt-2" message={errors.prenom} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('email', 'Email')} className="dark:text-gray-300" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">
                            {t('email_unverified', "Votre adresse email n'est pas vérifiée.")}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                            >
                                {t('resend_verification', "Cliquez ici pour renvoyer l'email de vérification.")}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600 dark:text-green-400">
                                {t('verification_sent', "Un nouveau lien de vérification a été envoyé à votre adresse email.")}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border-none">
                        {t('save', 'Enregistrer')}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('saved', 'Enregistré.')}</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
