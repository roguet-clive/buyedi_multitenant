import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";

export default function Index({ classes, periodes, bulletins, filters }) {

    const [selectedClasse, setSelectedClasse] = useState(filters.classe_id || '');
    const [selectedPeriode, setSelectedPeriode] = useState(filters.periode_id || '');

    const handleSearch = () => {
        router.get(route('bulletins.index'), {
            classe_id: selectedClasse,
            periode_id: selectedPeriode
        }, { preserveState: true });
    };

    return (
        <DashboardLayout>
            <Head title="Bulletins de Notes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Génération des Bulletins</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classe</label>
                                <select
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm"
                                    value={selectedClasse}
                                    onChange={e => setSelectedClasse(e.target.value)}
                                >
                                    <option value="">Choisir une classe...</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Période</label>
                                <select
                                    className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm"
                                    value={selectedPeriode}
                                    onChange={e => setSelectedPeriode(e.target.value)}
                                >
                                    <option value="">Choisir une période...</option>
                                    {periodes.map(p => (
                                        <option key={p.id} value={p.id}>{p.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <PrimaryButton onClick={handleSearch} disabled={!selectedClasse || !selectedPeriode} className="w-full justify-center py-2.5">
                                    Afficher les Résultats
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>

                    {bulletins.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Résultats ({bulletins.length} élèves)</h3>
                                <div className="flex gap-2">
                                    <a 
                                        href={route('bulletins.pv', { classe_id: filters.classe_id, periode_id: filters.periode_id })}
                                        target="_blank"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium inline-flex items-center"
                                    >
                                        Voir Procès Verbal
                                    </a>
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                                        Imprimer Tout (PDF)
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rang</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Élève</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Moyenne Générale</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appréciation</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {bulletins.map((b, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${b.rang === 1 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                                        b.rang === 2 ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                                                            b.rang === 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'text-gray-500'
                                                        }`}>
                                                        {b.rang}{b.rang === 1 ? 'er' : 'ème'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {b.inscription.eleve.user.nom} {b.inscription.eleve.user.prenom}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{b.inscription.eleve.matricule}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-lg font-bold ${b.moyenne_generale >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {b.moyenne_generale}
                                                    </span>
                                                    <span className="text-gray-400 text-xs"> / 20</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {b.appreciation_generale}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <a
                                                        href={route('bulletins.download', { inscription: b.inscription.id, periode_id: filters.periode_id })}
                                                        target="_blank"
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold border border-indigo-200 bg-indigo-50 px-3 py-1 rounded"
                                                    >
                                                        PDF
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        filters.classe_id && filters.periode_id && (
                            <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded shadow">
                                Aucun bulletin généré. Vérifiez qu'il y a des notes saisies pour cette classe et période.
                            </div>
                        )
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
