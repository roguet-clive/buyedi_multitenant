import React, { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';
import { AlertTriangle, Trash2, ShieldAlert, Lock, Info } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.roles?.some(role => role.toLowerCase() === 'super-admin' || role.toLowerCase() === 'superadmin');

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
            onError: () => passwordInput.current?.focus(),
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
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-red-200/80 dark:border-red-950/60 shadow-sm space-y-5">
                <div className="flex items-start gap-4 border-b border-red-100 dark:border-red-950/60 pb-5">
                    <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {t('danger_zone_title', 'Clôture & Suppression du Compte')}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {t('danger_zone_desc', "La suppression définitive de votre compte est une action irréversible. Vos accès au portail scolaire seront définitivement révoqués.")}
                        </p>
                    </div>
                </div>

                {isSuperAdmin && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 dark:text-amber-300">
                            <strong className="block font-bold">Protection Administrateur Actif :</strong>
                            <span>
                                En tant que Super-Administrateur, si vous êtes le seul administrateur du progiciel, le système bloquera automatiquement la suppression pour préserver l'accès à l'établissement.
                            </span>
                        </div>
                    </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                    <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                        <strong className="block font-bold text-slate-700 dark:text-slate-300">Intégrité des écritures comptables :</strong>
                        <span>
                            Les quittances de paiement, reçus de scolarité, bulletins et saisies déjà émis sous votre nom resteront conservés dans les archives légales de l'établissement conformément à la réglementation.
                        </span>
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <DangerButton
                        onClick={confirmUserDeletion}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>{t('delete_account_btn', 'Demander la suppression de mon compte')}</span>
                    </DangerButton>
                </div>
            </div>

            {/* MODALE DE CONFIRMATION */}
            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="p-6 sm:p-7 dark:bg-slate-900 dark:text-white space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                {t('confirm_delete_account_title', 'Confirmer la suppression ?')}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Action définitive et immédiate.
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {t('confirm_delete_account_desc', 'Veuillez saisir votre mot de passe pour attester de votre identité et valider la suppression définitive de votre compte.')}
                    </p>

                    <div>
                        <InputLabel htmlFor="password_del" value={t('password', 'Mot de passe actuel')} className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" />
                        <div className="relative mt-1">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <TextInput
                                id="password_del"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="pl-10 block w-full py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
                                isFocused
                                placeholder="Votre mot de passe..."
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <SecondaryButton onClick={closeModal} className="rounded-xl px-5 py-2.5 text-xs font-bold">
                            {t('cancel', 'Annuler')}
                        </SecondaryButton>

                        <DangerButton
                            className="rounded-xl px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30"
                            disabled={processing || !data.password}
                        >
                            {processing ? t('deleting', 'Suppression...') : t('confirm_delete', 'Supprimer définitivement')}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
