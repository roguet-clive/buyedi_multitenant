import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ classes, cours, evaluations }) {
    return (
        <DashboardLayout>
            <Head title={cours ? `Évaluations: ${cours.matiere?.nom}` : "Gestion des Notes"} />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                    {cours ? `📝 Évaluations - ${cours.matiere?.nom} (${cours.classe?.nom})` : "📝 Gestion des Notes"}
                </h1>
                <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
                    {cours ? (
                        <>
                            <p>Liste des évaluations pour ce cours :</p>
                            {evaluations && evaluations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    {evaluations.map(e => (
                                        <Link key={e.id} href={route('evaluations.show', e.id)} className="block">
                                            <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                <h3 className="font-bold">{e.titre}</h3>
                                                <p className="text-sm text-gray-500">{e.type} - Max: {e.note_max}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-gray-500">Aucune évaluation trouvée pour ce cours.</p>
                            )}
                            <div className="mt-6 flex gap-2">
                                <Link href={route('notes.classe', cours.classe_id)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Retour à la classe</Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>Sélectionnez une classe pour gérer les notes :</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {(classes || []).map(c => (
                                    <Link key={c.id} href={route('notes.classe', c.id)} className="block">
                                        <div className="p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                            <h3 className="font-bold">{c.nom}</h3>
                                            <p className="text-sm text-gray-500">{c.type}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
