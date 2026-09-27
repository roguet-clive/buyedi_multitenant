import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Trash2, AlertTriangle } from 'lucide-react';
import useTranslation from '@/Hooks/useTranslation';

export default function InscriptionDeleteModal({ target, onClose, onConfirm, isDeleting = false }) {
    const { t } = useTranslation();

    const eleveName = target?.eleve?.user 
        ? `${target.eleve.user.prenom || ''} ${target.eleve.user.nom || ''}`.trim()
        : `${target?.eleve?.nom || ''} ${target?.eleve?.prenom || ''}`.trim();

    return (
        <Transition show={!!target} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" />
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-red-200 dark:border-red-900/50">
                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-2xl">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <Dialog.Title as="h3" className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t("confirm_delete_inscription", "Supprimer l'Inscription")}
                                </Dialog.Title>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                {t("confirm_delete_inscription_text", "Êtes-vous sûr de vouloir supprimer l'inscription de")}{' '}
                                <strong className="text-slate-900 dark:text-white">{eleveName || 'cet élève'}</strong>
                                {target?.classe?.nom && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold ml-2">
                                        {target.classe.nom}
                                    </span>
                                )}
                                {' '}?
                            </p>

                            <div className="p-3.5 mb-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                    {t("delete_inscription_notice", "Cette action est sécurisée : si des versements en caisse sont déjà rattachés à cette inscription, le système empêchera la suppression pour protéger la comptabilité.")}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    {t("cancel", "Annuler")}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{isDeleting ? t("deleting", "Suppression...") : t("delete_btn", "Supprimer")}</span>
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
