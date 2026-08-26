import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { ChevronLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function Show({ evaluation, inscriptions, notes: existingNotes }) {

    const [grades, setGrades] = useState({});

    useEffect(() => {
        const initialGrades = {};
        inscriptions.forEach(insc => {
            const note = existingNotes[insc.id];
            initialGrades[insc.id] = {
                valeur: note?.valeur ?? '',
                appreciation: note?.appreciation || ''
            };
        });
        setGrades(initialGrades);
    }, [inscriptions, existingNotes]);

    const { post, processing } = useForm({});

    const handleChange = (id, field, value) => {
        setGrades(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(route('evaluations.update_grades', evaluation.id), { grades });
    };

    const saveGrades = () => {
        router.post(route('evaluations.update_grades', evaluation.id), { grades }, {
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Saisie Notes - ${evaluation.titre}`} />

            <div className="p-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('notes.classe', evaluation.cours.classe_id)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{evaluation.titre}</h1>
                            <p className="text-gray-500">
                                {evaluation.cours.matiere ? evaluation.cours.matiere.nom : 'Enseignement Général'} •
                                {evaluation.cours.classe.nom} •
                                Sur {evaluation.note_max} pts
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4">Élève</th>
                                    <th className="p-4 w-32">Note (/{evaluation.note_max})</th>
                                    <th className="p-4">Appréciation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {inscriptions.map(insc => {
                                    const entry = grades[insc.id] || { valeur: '', appreciation: '' };

                                    // Color logic based on grade
                                    const gradeVal = parseFloat(entry.valeur);
                                    let colorClass = "";
                                    if (!isNaN(gradeVal)) {
                                        if (gradeVal < evaluation.note_max / 2) colorClass = "text-red-600 font-bold";
                                        else if (gradeVal === evaluation.note_max) colorClass = "text-green-600 font-bold";
                                    }

                                    return (
                                        <tr key={insc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="p-4 font-medium">
                                                {insc.eleve.user.nom} {insc.eleve.user.prenom}
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={evaluation.note_max}
                                                    step="0.01"
                                                    value={entry.valeur}
                                                    onChange={(e) => handleChange(insc.id, 'valeur', e.target.value)}
                                                    className={`w-full rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 focus:ring-blue-500 ${colorClass}`}
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={entry.appreciation}
                                                    onChange={(e) => handleChange(insc.id, 'appreciation', e.target.value)}
                                                    className="w-full rounded border-gray-300 dark:bg-gray-900 dark:border-gray-700 text-sm"
                                                    placeholder="Très bien, AB, ..."
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0 flex justify-end">
                        <button
                            onClick={saveGrades}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Enregistrer les Notes
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
import { router } from "@inertiajs/react";
