import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { FileText, Download, Lock } from "lucide-react";

export default function Student({ periodes, inscription_id }) {

    return (
        <DashboardLayout>
            <Head title="Mes Bulletins" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Mes Bulletins
                </h1>
                <p className="text-gray-500">Consultez et téléchargez vos bulletins de notes pour chaque période.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {periodes.length > 0 ? periodes.map((periode) => (
                    <div key={periode.id} className={`rounded-xl border p-6 flex flex-col justify-between h-48 transition-all
                        ${periode.actif
                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-75'
                        }
                    `}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{periode.nom}</h3>
                                {periode.actif ? (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Disponible</span>
                                ) : (
                                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">Verrouillé</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {new Date(periode.date_debut).toLocaleDateString()} - {new Date(periode.date_fin).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="mt-4">
                            {periode.actif ? (
                                <a
                                    href={route('bulletins.download', { inscription: inscription_id, periode_id: periode.id })}
                                    target="_blank"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Télécharger PDF
                                </a>
                            ) : (
                                <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed py-2 px-4 rounded-lg font-medium">
                                    <Lock className="w-4 h-4" />
                                    Indisponible
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune période scolaire définie pour le moment.</p>
                    </div>
                )}
            </div>

        </DashboardLayout>
    );
}
