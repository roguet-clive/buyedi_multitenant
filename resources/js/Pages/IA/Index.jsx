import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Brain, Zap, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Index({ alerts }) {
    const [analyzing, setAnalyzing] = useState(false);

    const handleRunAnalysis = () => {
        setAnalyzing(true);
        router.post(route('ia.run'), {}, {
            onFinish: () => {
                setAnalyzing(false);
            },
            onSuccess: () => {
                toast.success("Analyse terminée !");
            }
        });
    };

    return (
        <DashboardLayout title="Intelligence Artificielle">
            <Head title="IA & Alertes" />

            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        Assistant Intelligent
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Surveillance automatique des anomalies financières et pédagogiques.
                    </p>
                </div>

                <button
                    onClick={handleRunAnalysis}
                    disabled={analyzing}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all
                        ${analyzing
                            ? 'bg-indigo-400 cursor-wait'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 hover:scale-105'
                        }`}
                >
                    {analyzing ? (
                        <>
                            <Activity className="w-5 h-5 animate-spin" />
                            Analyse en cours...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Lancer une analyse
                        </>
                    )}
                </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Système Actif</h3>
                    </div>
                    <p className="text-sm text-gray-500">L'IA surveille vos données en permanence.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Dernière Analyse</h3>
                    </div>
                    <p className="text-sm text-gray-500">À l'instant</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Alertes Détectées</h3>
                    </div>
                    <p className="text-sm text-gray-500">{alerts.total} anomalies signalées</p>
                </div>
            </div>

            {/* Recent Alerts Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Journal des Activités IA</h3>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {alerts.data.length > 0 ? (
                        alerts.data.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${alert.read_at ? 'bg-gray-300' : 'bg-red-500'}`}></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {alert.data.title}
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                            {alert.data.message}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{new Date(alert.created_at).toLocaleString()}</span>
                                            <span>•</span>
                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                Automatisé
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Aucune alerte IA générée pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>

        </DashboardLayout>
    );
}
