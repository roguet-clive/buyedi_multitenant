import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function Verify({ inscription, code }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Head title="Vérification d'authenticité" />

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                {inscription ? (
                    <>
                        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Reçu Authentique</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Le reçu numéro <strong>{inscription.numero_recu}</strong> est valide.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left space-y-2 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Élève :</span>
                                <span className="font-semibold dark:text-white">{inscription.eleve?.user?.nom} {inscription.eleve?.user?.prenom}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Classe :</span>
                                <span className="font-semibold dark:text-white">{inscription.classe?.nom}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Date :</span>
                                <span className="font-semibold dark:text-white">{new Date(inscription.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                <span className="text-gray-500 dark:text-gray-400">Montant :</span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                    {parseFloat(inscription.total_frais).toLocaleString('fr-FR')} FCFA
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Reçu Invalide</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Aucun reçu correspondant au code de sécurité :
                            <br />
                            <code className="bg-red-50 text-red-600 px-2 py-1 rounded text-sm mt-2 block">{code}</code>
                        </p>
                        <p className="text-sm text-gray-500">
                            Veuillez vérifier le code ou contacter l'établissement.
                        </p>
                    </>
                )}

                <div className="mt-6 border-t pt-4">
                    <p className="text-xs text-gray-400">Système de vérification Buyedi</p>
                </div>
            </div>
        </div>
    );
}
