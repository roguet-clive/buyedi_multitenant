import React from 'react';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Recu({ inscription, url_verification, etablissement }) {

    // Fonction d'impression
    const handlePrint = () => {
        window.print();
    };

    if (!inscription) return <div>Chargement...</div>;

    const eleve = inscription.eleve?.user || {};
    const classe = inscription.classe || {};
    const annee = inscription.annee_scolaire || {};
    const frais = inscription.frais || [];

    // Calcul du total payé
    const total = inscription.total_frais;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center">
            <Head title={`Reçu N° ${inscription.numero_recu}`} />

            {/* Actions (caché à l'impression) */}
            <div className="mb-6 print:hidden">
                <PrimaryButton onClick={handlePrint} className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    Imprimer le reçu
                </PrimaryButton>
            </div>

            {/* Zone du reçu */}
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full print:shadow-none print:w-full print:max-w-none text-black">
                {/* En-tête */}
                <div className="text-center border-b pb-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        {etablissement?.logo && (
                            <img src={`/storage/${etablissement.logo}`} alt="Logo" className="h-16 w-16 object-contain" />
                        )}
                        <div className="text-right">
                            <h2 className="text-xl font-bold uppercase">{etablissement?.nom || 'Établissement Scolaire'}</h2>
                            <p className="text-sm text-gray-600">{etablissement?.adresse || ''}</p>
                            <p className="text-sm text-gray-600">{etablissement?.telephone || ''}</p>
                            <p className="text-sm text-gray-600">{etablissement?.email || ''}</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold uppercase mt-2 border-2 border-gray-800 inline-block px-4 py-1">
                        Reçu d'Inscription
                    </h1>
                </div>

                {/* Infos Reçu */}
                <div className="flex justify-between mb-6 text-sm">
                    <div>
                        <p><strong>N° Reçu :</strong> {inscription.numero_recu}</p>
                        <p><strong>Date :</strong> {new Date(inscription.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Année Scolaire :</strong> {annee.nom}</p>
                        <p><strong>Classe :</strong> {classe.nom}</p>
                    </div>
                </div>

                {/* Infos Élève */}
                <div className="mb-6 bg-gray-50 p-4 rounded border">
                    <h3 className="font-bold border-b pb-2 mb-2">Informations de l'élève</h3>
                    <p className="text-lg uppercase font-semibold">{eleve.nom} {eleve.prenom}</p>
                    <p>Matricule : {inscription.eleve?.matricule || 'N/A'}</p>
                </div>

                {/* Détails Paiement */}
                <div className="mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                <th className="text-left p-2">Désignation</th>
                                <th className="text-right p-2">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inscription.paiements && inscription.paiements.length > 0 ? (
                                inscription.paiements.map((p, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2">{p.frais_type?.nom || 'Paiement'}</td>
                                        <td className="p-2 text-right">{parseFloat(p.montant).toLocaleString('fr-FR')} FCFA</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="p-4 text-center text-gray-500">Aucun paiement enregistré</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold text-lg">
                                <td className="p-2 text-right border-t">Total Payé :</td>
                                <td className="p-2 text-right border-t">
                                    {inscription.paiements
                                        ? inscription.paiements.reduce((sum, p) => sum + parseFloat(p.montant), 0).toLocaleString('fr-FR')
                                        : '0'} FCFA
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Pied de page et QR Code */}
                <div className="flex justify-between items-end mt-12 border-t pt-6">
                    <div className="text-sm text-gray-500">
                        <p>Ce reçu est généré électroniquement.</p>
                        <p>Merci de votre confiance.</p>
                        <p className="mt-2 text-xs">ID: {inscription.code_securite}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <QRCodeSVG value={url_verification} size={100} />
                        <span className="text-xs mt-1 text-gray-500">Scanner pour vérifier</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
