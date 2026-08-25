import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Show({ auth, evaluation, eleves, notes: initialNotes, appreciations: initialAppreciations }) {

    // We map initial notes/appreciations to local state for inputs
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        notes: initialNotes || {},
        appreciations: initialAppreciations || {}
    });

    const [changed, setChanged] = useState(false);

    const handleNoteChange = (inscriptionId, value) => {
        setData('notes', {
            ...data.notes,
            [inscriptionId]: value
        });
        setChanged(true);
    };

    const handleAppreciationChange = (inscriptionId, value) => {
        setData('appreciations', {
            ...data.appreciations,
            [inscriptionId]: value
        });
        setChanged(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('evaluations.update_grades', evaluation.id), {
            preserveScroll: true,
            onSuccess: () => setChanged(false)
        });
    };

    return (
        <DashboardLayout
            title={`Notes - ${evaluation.titre}`}
        >
            <div className="mb-6">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Notes et Saisie : {evaluation.titre}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                        ({evaluation.cours.matiere?.nom || 'Général'} - {evaluation.cours.classe.nom})
                    </span>
                </h2>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Info */}
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href={route('cours.evaluations.index', evaluation.cours_id)}
                            className="text-gray-600 hover:text-gray-900 underline"
                        >
                            &larr; Retour aux évaluations
                        </Link>

                        <div className="bg-white px-4 py-2 rounded shadow text-sm">
                            <span className="font-bold mr-3">Date: {new Date(evaluation.date_evaluation).toLocaleDateString()}</span>
                            <span className="font-bold mr-3">Coeff: {evaluation.coefficient}</span>
                            <span className="font-bold">Max: {evaluation.note_max}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {eleves.length === 0 ? (
                                <p className="text-gray-500 text-center">Aucun élève inscrit dans cette classe.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Élève</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Note /{evaluation.note_max}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appréciation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {eleves.map((eleve, index) => {
                                                const currentNote = data.notes[eleve.inscription_id] !== undefined ? data.notes[eleve.inscription_id] : '';
                                                const isGood = currentNote !== '' && parseFloat(currentNote) >= (evaluation.note_max / 2);
                                                const isBad = currentNote !== '' && parseFloat(currentNote) < (evaluation.note_max / 2);

                                                return (
                                                    <tr key={eleve.inscription_id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                                        <td className="px-4 py-2">
                                                            <div className="text-sm font-medium text-gray-900">{eleve.nom_complet}</div>
                                                            <div className="text-xs text-gray-500">{eleve.matricule}</div>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <TextInput
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max={evaluation.note_max}
                                                                className={`w-24 text-center font-bold ${isGood ? 'text-green-600' : ''} ${isBad ? 'text-red-600' : ''}`}
                                                                value={currentNote}
                                                                onChange={(e) => handleNoteChange(eleve.inscription_id, e.target.value)}
                                                                placeholder="-"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <TextInput
                                                                type="text"
                                                                className="w-full text-sm"
                                                                value={data.appreciations[eleve.inscription_id] || ''}
                                                                onChange={(e) => handleAppreciationChange(eleve.inscription_id, e.target.value)}
                                                                placeholder="Commentaire optionnel..."
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                            {changed ? (
                                <span className="text-amber-600 font-bold animate-pulse">modifciations non enregistrées...</span>
                            ) : (
                                <span className="text-green-600">
                                    {wasSuccessful && '✅ Sauvegardé !'}
                                </span>
                            )}

                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('cours.evaluations.index', evaluation.cours_id)}
                                    className="text-gray-600 hover:underline text-sm"
                                >
                                    Annuler
                                </Link>
                                <PrimaryButton disabled={processing || !changed}>
                                    Enregistrer les notes
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </DashboardLayout>
    );
}
