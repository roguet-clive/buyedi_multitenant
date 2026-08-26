import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import { ChevronLeft, Plus, FileText, Trash, Edit } from "lucide-react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import toast from "react-hot-toast";

export default function Classe({ classe, cours, evaluations, periodes }) {

    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        cours_id: cours.length === 1 ? cours[0].id : '',
        titre: '',
        type: 'devoir',
        date_evaluation: new Date().toISOString().split('T')[0],
        note_max: 20,
        coefficient: 1,
        periode_id: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.cours_id) {
            toast.error("Veuillez sélectionner une matière/cours.");
            return;
        }

        post(route('cours.evaluations.store', data.cours_id), {
            onSuccess: () => {
                setShowModal(false);
                reset('titre');
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Supprimer cette évaluation ? Les notes seront perdues.')) {
            router.delete(route('evaluations.destroy', id));
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Notes - ${classe.nom}`} />

            <div className="p-6 max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Link href={route('notes.index')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Notes - {classe.nom}</h1>
                            <p className="text-gray-500">{cours.length} matières configurées</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle Évaluation
                    </button>
                </div>

                {/* Liste des Évaluations */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Matière</th>
                                <th className="p-4">Titre</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Coeff. / Max</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {evaluations.map(ev => (
                                <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-4">{new Date(ev.date_evaluation).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold">
                                        {ev.cours.matiere ? ev.cours.matiere.nom : 'Titulaire (Global)'}
                                    </td>
                                    <td className="p-4 font-medium">{ev.titre}</td>
                                    <td className="p-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ev.type === 'composition' || ev.type === 'examen' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {ev.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        Coeff {ev.coefficient} / Sur {ev.note_max}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Link
                                            href={route('evaluations.show', ev.id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                                        >
                                            <FileText className="w-3 h-3" /> Consulter / Saisir
                                        </Link>
                                        <button onClick={() => handleDelete(ev.id)} className="text-red-500 hover:text-red-700 p-1">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {evaluations.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        Aucune évaluation créée pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal Création */}
                <Modal show={showModal} onClose={() => setShowModal(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-bold mb-4">Créer une Évaluation</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Select Cours */}
                            <div>
                                <InputLabel value="Matière / Cours" />
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
                                    value={data.cours_id}
                                    onChange={(e) => setData('cours_id', e.target.value)}
                                >
                                    <option value="">Sélectionner...</option>
                                    {cours.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.matiere ? c.matiere.nom : 'Enseignement Général (Titulaire)'}
                                            {c.enseignant ? ` - ${c.enseignant.prenom} ${c.enseignant.nom}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.cours_id} className="mt-2" />
                            </div>

                            {/* Période */}
                            <div>
                                <InputLabel value="Période" />
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
                                    value={data.periode_id}
                                    onChange={(e) => setData('periode_id', e.target.value)}
                                >
                                    <option value="">Sélectionner une période...</option>
                                    {periodes && periodes.filter(p => {
                                        if (!classe) return true;
                                        if (!p.type || p.type === 'global') return true;
                                        if (classe.type === 'secondaire' && p.type === 'secondaire') return true;
                                        if (['maternelle', 'primaire'].includes(classe.type) && p.type === 'primaire') return true;
                                        return false;
                                    }).map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nom}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.periode_id} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Titre" />
                                    <TextInput
                                        value={data.titre}
                                        onChange={(e) => setData('titre', e.target.value)}
                                        className="w-full"
                                        placeholder="ex: Interro 1"
                                    />
                                    <InputError message={errors.titre} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Type" />
                                    <select
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                    >
                                        <option value="interrogation">Interrogation</option>
                                        <option value="devoir">Devoir</option>
                                        <option value="composition">Composition</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <InputLabel value="Date" />
                                    <TextInput type="date" value={data.date_evaluation} onChange={(e) => setData('date_evaluation', e.target.value)} className="w-full" />
                                </div>
                                <div>
                                    <InputLabel value="Sur (Max)" />
                                    <TextInput type="number" value={data.note_max} onChange={(e) => setData('note_max', e.target.value)} className="w-full" />
                                </div>
                                <div>
                                    <InputLabel value="Coeff." />
                                    <TextInput type="number" value={data.coefficient} onChange={(e) => setData('coefficient', e.target.value)} className="w-full" />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton onClick={() => setShowModal(false)}>Annuler</SecondaryButton>
                                <PrimaryButton disabled={processing}>Créer</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>

            </div>
        </DashboardLayout>
    );
}
