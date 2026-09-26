import React, { useState, useRef, useMemo } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, KeyRound, Check, X } from 'lucide-react';

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

    // Calcul de la robustesse du mot de passe
    const passwordStrength = useMemo(() => {
        const val = data.password || '';
        if (!val) return { score: 0, label: '', color: 'bg-slate-200' };

        let score = 0;
        if (val.length >= 8) score += 25;
        if (val.length >= 12) score += 15;
        if (/[A-Z]/.test(val)) score += 20;
        if (/[0-9]/.test(val)) score += 20;
        if (/[^A-Za-z0-9]/.test(val)) score += 20;

        if (score <= 35) return { score, label: 'Faible', color: 'bg-rose-500', textColor: 'text-rose-600' };
        if (score <= 65) return { score, label: 'Moyen', color: 'bg-amber-500', textColor: 'text-amber-600' };
        if (score <= 85) return { score, label: 'Robuste', color: 'bg-blue-500', textColor: 'text-blue-600' };
        return { score: 100, label: 'Excellent', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
    }, [data.password]);

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
        <section className={`space-y-6 ${className}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* FORMULAIRE (7/12) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-emerald-500" />
                            <span>{t('update_password', 'Mise à jour du mot de passe')}</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t('password_desc', "Assurez-vous d'utiliser un mot de passe robuste et confidentiel pour protéger vos accès.")}
                        </p>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="current_password" value={t('current_password', 'Mot de passe actuel')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type={showCurrent ? "text" : "password"}
                                    className="block w-full py-2.5 pl-3.5 pr-10 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                    autoComplete="current-password"
                                    placeholder="••••••••••••"
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
                            <InputError message={errors.current_password} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={t('new_password', 'Nouveau mot de passe')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type={showNew ? "text" : "password"}
                                    className="block w-full py-2.5 pl-3.5 pr-10 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                    autoComplete="new-password"
                                    placeholder="Au moins 8 caractères..."
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
                            <InputError message={errors.password} className="mt-1.5" />

                            {/* JAUGE DE COMPLEXITÉ EN TEMPS RÉEL */}
                            {data.password && (
                                <div className="mt-2.5 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500">Robustesse :</span>
                                        <span className={`font-bold ${passwordStrength.textColor}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 rounded-full ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value={t('confirm_password', 'Confirmer le mot de passe')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type={showConfirm ? "text" : "password"}
                                    className="block w-full py-2.5 pl-3.5 pr-10 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                    autoComplete="new-password"
                                    placeholder="Répétez le mot de passe..."
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
                            <InputError message={errors.password_confirmation} className="mt-1.5" />
                        </div>

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
                                    <span>{t('saved', 'Mot de passe mis à jour')}</span>
                                </p>
                            </Transition>

                            <PrimaryButton 
                                disabled={processing} 
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-emerald-500/25 border-none flex items-center gap-2 cursor-pointer ml-auto active:scale-95 transition-all"
                            >
                                <Lock className="w-4 h-4" />
                                <span>{processing ? t('updating', 'Mise à jour...') : t('update_password_btn', 'Changer le mot de passe')}</span>
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* CRITÈRES DE SÉCURITÉ (5/12) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Recommandations de Sécurité
                        </span>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-2.5">
                                <div className={`p-1 rounded-md mt-0.5 ${data.password.length >= 8 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                                    {data.password.length >= 8 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-400"></div>}
                                </div>
                                <span className={data.password.length >= 8 ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-500'}>
                                    Au minimum 8 caractères (12 recommandés)
                                </span>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className={`p-1 rounded-md mt-0.5 ${/[A-Z]/.test(data.password) ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                                    {/[A-Z]/.test(data.password) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-400"></div>}
                                </div>
                                <span className={/[A-Z]/.test(data.password) ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-500'}>
                                    Au moins une lettre majuscule (A-Z)
                                </span>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className={`p-1 rounded-md mt-0.5 ${/[0-9]/.test(data.password) ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                                    {/[0-9]/.test(data.password) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-400"></div>}
                                </div>
                                <span className={/[0-9]/.test(data.password) ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-500'}>
                                    Au moins un chiffre (0-9)
                                </span>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className={`p-1 rounded-md mt-0.5 ${/[^A-Za-z0-9]/.test(data.password) ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                                    {/[^A-Za-z0-9]/.test(data.password) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-400"></div>}
                                </div>
                                <span className={/[^A-Za-z0-9]/.test(data.password) ? 'text-slate-800 dark:text-white font-semibold' : 'text-slate-500'}>
                                    Un symbole ou caractère spécial (!, @, #, $, ...)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Conseil de cybersécurité</span>
                        </div>
                        <p className="text-[11px] opacity-80">
                            Renouvelez régulièrement votre mot de passe et évitez d'utiliser des dates de naissance ou le nom de l'établissement.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
