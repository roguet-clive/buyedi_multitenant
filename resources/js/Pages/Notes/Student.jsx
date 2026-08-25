import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { FileText, Award, Calendar } from "lucide-react";

export default function Student({ groupedNotes, periodes }) {

    // groupedNotes est un objet { "Maths": [notes...], "Français": [notes...] }
    const subjects = Object.keys(groupedNotes);

    return (
        <DashboardLayout>
            <Head title="Mes Notes" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Mes Notes
                </h1>
                <p className="text-gray-500">Relevé de toutes vos évaluations par matière.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {subjects.length > 0 ? subjects.map((matiere, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                {matiere}
                            </h3>
                            <span className="text-xs font-medium text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                {groupedNotes[matiere].length} notes
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {groupedNotes[matiere].map(note => (
                                <div key={note.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm
                                            ${(note.valeur / note.evaluation.note_max) >= 0.5 ? 'bg-green-500' : 'bg-red-500'}
                                        `}>
                                            {note.valeur}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                                {note.evaluation.type}
                                                <span className="text-gray-400 font-normal ml-2 text-xs">
                                                    (Sur {note.evaluation.note_max})
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(note.evaluation.date_evaluation).toLocaleDateString()}
                                                {note.evaluation.periode && (
                                                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[10px]">
                                                        {note.evaluation.periode.nom}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {/* Optional: Add badge or extra info */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-12">
                        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-500">Aucune note disponible</h2>
                        <p className="text-gray-400">Les évaluations apparaîtront ici une fois saisies.</p>
                    </div>
                )}
            </div>

        </DashboardLayout>
    );
}
