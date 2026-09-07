import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Trash2 } from 'lucide-react';
import useTranslation from "@/Hooks/useTranslation";

export default function ArriereDeleteModal({ target, onClose, onConfirm }) {
    const { t } = useTranslation();

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
                                    {t("confirm_delete_title", "Supprimer le Dossier Débiteur")}
                                </Dialog.Title>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                {t("confirm_delete_arrear_text", "Êtes-vous sûr de vouloir supprimer le dossier d'arriéré de")}{' '}
                                <strong className="text-slate-900 dark:text-white">{target?.nom_complet || `${target?.nom_eleve} ${target?.prenom_eleve || ''}`}</strong>{' '}
                                ({target?.annee_scolaire_dette}) ?
                            </p>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t("cancel", "Annuler")}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md shadow-red-600/20 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{t("delete_btn", "Supprimer")}</span>
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
