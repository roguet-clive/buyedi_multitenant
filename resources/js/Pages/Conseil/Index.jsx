import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Users, Filter, Save, CheckCircle, GraduationCap } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Index({ classes, periodes, students, filters, selectedClasse, selectedPeriode }) {
    const { auth } = usePage().props;
    const [localStudents, setLocalStudents] = useState([]);

    // Initialiser les données locales quand 'students' change
    useEffect(() => {
        setLocalStudents(students);
    }, [students]);

    const handleFilterChange = (key, value) => {
        router.get(route('conseil.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    const handleStudentChange = (index, field, value) => {
        const updated = [...localStudents];
        updated[index][field] = value;
        setLocalStudents(updated);
    };

    const { post, processing } = useForm({});

    const saveAll = () => {
        if (!selectedClasse || !selectedPeriode) return;

        router.post(route('conseil.store'), {
            classe_id: selectedClasse.id,
            periode_id: selectedPeriode.id,
            students: localStudents
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Flash message handled by layout usually
            }
        });
    };

    // Helper des décisions
    const decisions = ["Passage", "Redoublement", "Exclusion", "Conseil de Discipline"];
    const mentions = ["Félicitations", "Encouragements", "Tableau d'Honneur", "Avertissement Travail", "Avertissement Conduite", "Blâme"];

    const getMoyenneColor = (note) => {
        if (note >= 12) return 'text-green-600 font-bold';
        if (note >= 10) return 'text-blue-600 font-bold';
        return 'text-red-500 font-bold';
    };

    return (
        <DashboardLayout
            title="Conseil de Classe"
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-600" /> Délibérations du Conseil
                    </h2>
                    {localStudents.length > 0 && (
                        <PrimaryButton onClick={saveAll} disabled={processing}>
                            <Save className="w-4 h-4 mr-2" /> Enregistrer Délibérations
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title="Conseil de Classe" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* FILTRES */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filters.classe_id || ''}
                            onChange={(e) => handleFilterChange('classe_id', e.target.value)}
                            className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm"
                        >
                            <option value="">Sélectionner une classe...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                        </select>

                        <select
                            value={filters.periode_id || ''}
                            onChange={(e) => handleFilterChange('periode_id', e.target.value)}
                            className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm"
                        >
                            <option value="">Sélectionner une période...</option>
                            {periodes.map(p => <option key={p.id} value={p.id}>{p.nom} (Année {p.annee_scolaire_id})</option>)}
                        </select>
                    </div>

                    {/* LISTE ÉLÈVES */}
                    {selectedClasse && selectedPeriode ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-12">Rang</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-48">Élève</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-20">Moyenne</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Appréciation Globale</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-40">Détails</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {localStudents.map((eleve, index) => (
                                        <tr key={eleve.inscription_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-400">
                                                {eleve.rang}<sup>{eleve.rang === 1 ? 'er' : 'ème'}</sup>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                {eleve.eleve_nom}
                                            </td>
                                            <td className={`px-4 py-3 text-center text-lg ${getMoyenneColor(eleve.moyenne)}`}>
                                                {eleve.moyenne}/20
                                            </td>
                                            <td className="px-4 py-3">
                                                <textarea
                                                    className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                    rows="2"
                                                    value={eleve.appreciation || ''}
                                                    onChange={(e) => handleStudentChange(index, 'appreciation', e.target.value)}
                                                    placeholder="Saisir l'apréciation du conseil..."
                                                ></textarea>
                                            </td>
                                            <td className="px-4 py-3 space-y-2">
                                                <select
                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md"
                                                    value={eleve.mention || ''}
                                                    onChange={(e) => handleStudentChange(index, 'mention', e.target.value)}
                                                >
                                                    <option value="">-- Mention --</option>
                                                    {mentions.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>

                                                <select
                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md font-bold text-gray-700"
                                                    value={eleve.decision || ''}
                                                    onChange={(e) => handleStudentChange(index, 'decision', e.target.value)}
                                                >
                                                    <option value="">-- Décision --</option>
                                                    {decisions.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {localStudents.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Aucun élève trouvé dans cette classe pour la période sélectionnée.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-sm text-center">
                            <div className="inline-flex bg-indigo-100 p-4 rounded-full mb-4">
                                <Users className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prêt à délibérer ?</h3>
                            <p className="text-gray-500">Sélectionnez une classe et une période pour commencer le conseil.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
