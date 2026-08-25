import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Filter, Plus, Search, Trash2, UserX, Info, AlertCircle } from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function Index({ sanctions, classes, types, eleves, filters }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        eleve_id: '',
        type_sanction_id: '',
        date_sanction: new Date().toISOString().split('T')[0],
        date_fin: '',
        motif: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('sanctions.index'), { ...filters, search: searchTerm }, { preserveState: true });
    };

    const handleClassChange = (e) => {
        router.get(route('sanctions.index'), { ...filters, classe_id: e.target.value }, { preserveState: true });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('sanctions.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            }
        });
    };

    const deleteSanction = (id) => {
        if (confirm("Confirmer la suppression de cette sanction ?")) {
            router.delete(route('sanctions.destroy', id));
        }
    };

    const getGraviteColor = (gravite) => {
        if (gravite >= 5) return 'bg-red-100 text-red-800 border-red-200';
        if (gravite >= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    return (
        <DashboardLayout
            title="Vie Scolaire - Discipline"
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" /> Gestion de la Discipline
                    </h2>
                    <PrimaryButton onClick={() => setShowModal(true)} disabled={!filters.classe_id}>
                        <Plus className="w-4 h-4 mr-2" /> Nouvelle Sanction
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Discipline & Sanctions" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* FILTERS */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 justify-between">
                        <div className="flex gap-4 items-center flex-1">
                            <select
                                value={filters.classe_id || ''}
                                onChange={handleClassChange}
                                className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm"
                            >
                                <option value="">Choisir une classe (Requis pour ajouter)</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>

                            <form onSubmit={handleSearch} className="flex gap-2">
                                <TextInput
                                    type="text"
                                    placeholder="Rechercher un élève..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="text-sm py-2"
                                />
                                <SecondaryButton type="submit">
                                    <Search className="w-4 h-4" />
                                </SecondaryButton>
                            </form>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Élève</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sanction</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Motif</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Décidé par</th> */}
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sanctions.data.map((sanction) => (
                                    <tr key={sanction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {sanction.eleve?.user?.full_name || 'Inconnu'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {sanction.eleve?.inscription_actuelle?.classe?.nom}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getGraviteColor(sanction.type?.gravite)}`}>
                                                {sanction.type?.nom}
                                            </span>
                                            {sanction.date_fin && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    Jusqu'au {new Date(sanction.date_fin).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={sanction.motif}>
                                            {sanction.motif}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(sanction.date_sanction).toLocaleDateString()}
                                        </td>
                                        {/* <td className="px-6 py-4 text-xs text-gray-400">
                                            {sanction.decideur?.nom}
                                        </td> */}
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => deleteSanction(sanction.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {sanctions.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <UserX className="w-12 h-12 text-gray-300 mb-2" />
                                                <p>Aucune sanction enregistrée.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL AJOUT */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Sanctionner un élève
                    </h2>

                    {!filters.classe_id && (
                        <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Veuillez sélectionner une classe dans le filtre principal d'abord.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel value="Élève" />
                            <select
                                value={data.eleve_id}
                                onChange={e => setData('eleve_id', e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Sélectionner l'élève...</option>
                                {(eleves || []).map(e => (
                                    <option key={e.id} value={e.id}>{e.nom}</option>
                                ))}
                            </select>
                            <InputError message={errors.eleve_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Type de Sanction" />
                            <select
                                value={data.type_sanction_id}
                                onChange={e => setData('type_sanction_id', e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Sélectionner le type...</option>
                                {types.map(t => (
                                    <option key={t.id} value={t.id}>{t.nom} (Gravité: {t.gravite})</option>
                                ))}
                            </select>
                            <InputError message={errors.type_sanction_id} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Date de la sanction" />
                                <TextInput
                                    type="date"
                                    className="w-full"
                                    value={data.date_sanction}
                                    onChange={e => setData('date_sanction', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel value="Fin (si exclusion)" />
                                <TextInput
                                    type="date"
                                    className="w-full"
                                    value={data.date_fin}
                                    onChange={e => setData('date_fin', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Motif / Détails" />
                            <textarea
                                className="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows="3"
                                value={data.motif}
                                onChange={e => setData('motif', e.target.value)}
                                required
                                placeholder="Expliquez la raison de la sanction..."
                            ></textarea>
                            <InputError message={errors.motif} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <SecondaryButton onClick={() => setShowModal(false)} disabled={processing}>
                                Annuler
                            </SecondaryButton>
                            <DangerButton type="submit" disabled={processing || !filters.classe_id}>
                                Enregistrer la Sanction
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
