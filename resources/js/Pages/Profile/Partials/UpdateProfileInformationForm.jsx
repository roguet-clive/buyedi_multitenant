import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { User, Mail, Phone, CheckCircle2, ShieldCheck, Calendar, Building2, AlertCircle } from 'lucide-react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const { auth, etablissement } = usePage().props;
    const user = auth.user;
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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* FORMULAIRE PRINCIPAL (7/12) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" />
                            <span>{t('personal_information', 'Informations personnelles')}</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t('profile_info_desc', "Mettez à jour vos informations d'identité, adresse email et téléphone professionnel.")}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="nom" value={t('nom', 'Nom de famille')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                                <div className="relative mt-1">
                                    <TextInput
                                        id="nom"
                                        className="block w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        value={data.nom}
                                        onChange={(e) => setData('nom', e.target.value)}
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>
                                <InputError className="mt-1.5" message={errors.nom} />
                            </div>

                            <div>
                                <InputLabel htmlFor="prenom" value={t('prenom', 'Prénom(s)')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                                <div className="relative mt-1">
                                    <TextInput
                                        id="prenom"
                                        className="block w-full py-2.5 px-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                        value={data.prenom}
                                        onChange={(e) => setData('prenom', e.target.value)}
                                        autoComplete="given-name"
                                    />
                                </div>
                                <InputError className="mt-1.5" message={errors.prenom} />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value={t('email', 'Adresse Email Officielle')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                            <div className="relative mt-1">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="pl-10 block w-full py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <InputError className="mt-1.5" message={errors.email} />
                        </div>

                        <div>
                            <InputLabel htmlFor="telephone" value={t('telephone', 'Numéro de Téléphone')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                            <div className="relative mt-1">
                                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <TextInput
                                    id="telephone"
                                    type="tel"
                                    className="pl-10 block w-full py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                    value={data.telephone}
                                    onChange={(e) => setData('telephone', e.target.value)}
                                    placeholder="+241 07 XX XX XX"
                                    autoComplete="tel"
                                />
                            </div>
                            <InputError className="mt-1.5" message={errors.telephone} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                    <p className="font-semibold">
                                        {t('email_unverified', "Votre adresse email n'est pas encore vérifiée.")}
                                    </p>
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="font-bold underline hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
                                    >
                                        {t('resend_verification', "Renvoyer le lien de confirmation par email")}
                                    </Link>
                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                            {t('verification_sent', "Un nouveau lien de vérification a été envoyé à votre adresse email.")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 translate-y-1"
                                leave="transition ease-in-out duration-200"
                                leaveTo="opacity-0 -translate-y-1"
                            >
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('saved', 'Modifications enregistrées')}</span>
                                </p>
                            </Transition>

                            <PrimaryButton 
                                disabled={processing} 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-blue-500/25 border-none flex items-center gap-2 cursor-pointer ml-auto active:scale-95 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{processing ? t('saving', 'Enregistrement...') : t('save', 'Enregistrer les modifications')}</span>
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* FICHE SYNTHÈSE DE COMPTE (5/12) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Fiche de Compte Système
                        </span>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700/60">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                    <span>Statut du compte :</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Actif & Validé</span>
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700/60">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span>Date d'inscription :</span>
                                </span>
                                <strong className="text-slate-800 dark:text-white font-bold">
                                    {formatDate(user.created_at)}
                                </strong>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700/60">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-amber-500" />
                                    <span>Vérification email :</span>
                                </span>
                                <strong className={user.email_verified_at ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                    {user.email_verified_at ? "Vérifié ✓" : "En attente"}
                                </strong>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-cyan-500" />
                                    <span>Établissement :</span>
                                </span>
                                <strong className="text-slate-800 dark:text-white font-bold truncate max-w-[160px]">
                                    {etablissement?.nom || 'Buyedi Academy'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Sécurité des données de connexion</span>
                        </div>
                        <p className="text-[11px] opacity-80">
                            Vos identifiants permettent de tracer toutes vos opérations (encaissements, saisies de notes, modifications). Veillez à ne jamais communiquer vos accès.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
