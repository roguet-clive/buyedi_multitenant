import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Send, Mail, Check, Filter } from 'lucide-react';
import { motion } from "framer-motion";

export default function Index({ communications }) {

    return (
        <DashboardLayout title="Communications">
            <Head title="Communications" />

            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Mail className="w-8 h-8 text-blue-600" />
                        Communications
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Historique des messages envoyés aux parents et personnels.
                    </p>
                </div>
                <div>
                    <Link
                        href={route('communications.create')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                    >
                        <Send className="w-4 h-4" />
                        Nouveau Message
                    </Link>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Sujet</th>
                                <th className="px-6 py-4">Destinataires</th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {communications.data.length > 0 ? (
                                communications.data.map((comm) => (
                                    <tr key={comm.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            <Link href={route('communications.show', comm.id)} className="hover:text-blue-600 hover:underline">
                                                {comm.subject}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {comm.target_type === 'all' ? 'Tout le monde' :
                                                    comm.target_type === 'role' ? 'Rôle spécifique' :
                                                        comm.target_type === 'classe' ? 'Parents d\'une classe' : 'Utilisateur unique'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                            {comm.message}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(comm.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                <Check className="w-3 h-3" /> Envoyé
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        Aucun message envoyé pour l'instant.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </DashboardLayout>
    );
}
