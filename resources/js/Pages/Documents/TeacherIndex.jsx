import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { FileText, Download, Trash2, Plus, Filter, BookOpen, Calendar, UploadCloud, FolderOpen, GraduationCap, Clock, X, Save } from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";
import Modal from "@/Components/Modal";
import toast from "react-hot-toast";

const TYPE_CONFIG = {
    cours: { label: 'Cours', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', border: 'border-l-blue-500', icon: BookOpen, btnClass: 'from-blue-600 to-indigo-700' },
    exercice: { label: 'Exercice', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', border: 'border-l-amber-500', icon: FileText, btnClass: 'from-amber-500 to-orange-600' },
    devoir: { label: 'Devoir', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', border: 'border-l-rose-500', icon: Calendar, btnClass: 'from-red-500 to-blue-600' },
};

const selectClass = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 transition-all";

export default function TeacherIndex({ documents, classes, matieres, filters }) {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [availableMatieres, setAvailableMatieres] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        titre: '', description: '', type: 'cours',
        classe_id: '', matiere_id: '', fichier: null, date_limite: ''
    });

    useEffect(() => {
        if (data.classe_id) {
            const selectedClass = classes.find(c => c.id == data.classe_id);
            setAvailableMatieres(selectedClass?.matieres || []);
        } else {
            setAvailableMatieres([]);
        }
    }, [data.classe_id, classes]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('documents.store'), {
            onSuccess: () => { setShowModal(false); reset(); toast.success('Document publié avec succès !'); }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Supprimer ce document ?')) {
            router.delete(route('documents.destroy', id), {
                onSuccess: () => toast.success('Document supprimé.')
            });
        }
    };

    const handleFilter = (key, value) => {
        router.get(route('documents.index'), { ...filters, [key]: value }, { preserveState: true });
    };

    const totalByType = (type) => documents.filter(d => d.type === type).length;

    return (
        <DashboardLayout title="Documents Pédagogiques">
            <Head title="Documents Pédagogiques" />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-teal-950 to-cyan-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <GraduationCap className="w-10 h-10 text-cyan-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-cyan-200 text-sm font-medium mb-3 border border-white/10">
                                <FolderOpen className="w-4 h-4" />
                                <span>Mes Ressources publiées</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Documents Pédagogiques</h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                Publiez et gérez vos cours, exercices et devoirs. Vos élèves et leurs parents seront notifiés automatiquement.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 shrink-0 flex-wrap">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center">
                            <p className="text-2xl font-black text-blue-300">{totalByType('cours')}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Cours</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center">
                            <p className="text-2xl font-black text-amber-300">{totalByType('exercice')}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Exercices</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 px-5 py-3 text-center">
                            <p className="text-2xl font-black text-red-300">{totalByType('devoir')}</p>
                            <p className="text-xs text-slate-300 mt-0.5">Devoirs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <Filter className="w-4 h-4" /> Filtres :
                    </div>
                    <select value={filters.classe_id || ''} onChange={e => handleFilter('classe_id', e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500">
                        <option value="">Toutes mes classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                        {[{ val: '', label: 'Tous' }, { val: 'cours', label: 'Cours' }, { val: 'exercice', label: 'Exercices' }, { val: 'devoir', label: 'Devoirs' }].map(opt => (
                            <button key={opt.val} onClick={() => handleFilter('type', opt.val)}
                                className={`px-4 py-2.5 text-sm font-semibold transition-all ${(filters.type || '') === opt.val ? 'bg-[#0B1A2D] text-white' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/30 transition-all active:scale-95 whitespace-nowrap">
                    <Plus className="w-5 h-5" />
                    Publier un document
                </button>
            </div>

            {/* Avertissement pas de classes */}
            {classes.length === 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-2xl px-5 py-4 mb-6 text-sm font-medium">
                    ⚠️ Vous n'avez aucune classe assignée pour l'année en cours.
                </div>
            )}

            {/* GRILLE DOCUMENTS */}
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {documents.map(doc => {
                        const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.cours;
                        const TypeIcon = cfg.icon;
                        return (
                            <div key={doc.id}
                                className={`bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden border-l-4 ${cfg.border} hover:shadow-xl transition-shadow group`}>
                                <div className="px-5 pt-5 flex items-start justify-between">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                                        <TypeIcon className="w-3.5 h-3.5" />
                                        {cfg.label}
                                    </span>
                                    <button onClick={() => handleDelete(doc.id)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="px-5 py-4">
                                    <p className="text-xs text-slate-400 font-medium mb-1">{doc.classe?.nom} • {doc.matiere?.nom}</p>
                                    <h3 className="font-black text-slate-800 dark:text-white text-base leading-snug" title={doc.titre}>
                                        {doc.titre}
                                    </h3>
                                    {doc.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{doc.description}</p>
                                    )}
                                    {doc.date_limite && (
                                        <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold">
                                            <Clock className="w-3.5 h-3.5" />
                                            Date limite : {new Date(doc.date_limite).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-400">
                                        {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </p>
                                    {doc.fichier_path && (
                                        <a href={route('documents.download', doc.id)}
                                            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${cfg.btnClass} text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95`}>
                                            <Download className="w-3.5 h-3.5" />
                                            Télécharger
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-3xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-6">
                            <UploadCloud className="w-10 h-10 text-teal-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Aucun document publié</h2>
                        <p className="text-slate-500 max-w-sm text-sm mb-6">Commencez par publier un cours ou un exercice pour vos élèves.</p>
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/30 transition-all active:scale-95">
                            <Plus className="w-5 h-5" />
                            Publier un premier document
                        </button>
                    </div>
                </div>
            )}

            {/* MODALE PUBLICATION */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="lg">
                <div className="p-0 overflow-hidden rounded-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <UploadCloud className="w-5 h-5" />
                            <h2 className="text-lg font-bold">Publier un document</h2>
                        </div>
                        <button onClick={() => setShowModal(false)}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Titre */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Titre <span className="text-red-400">*</span>
                            </label>
                            <input type="text" value={data.titre} onChange={e => setData('titre', e.target.value)} required
                                placeholder="Ex: Chapitre 1 - Introduction..."
                                className={selectClass} />
                            {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} className={selectClass}>
                                    <option value="cours">Cours / Leçon</option>
                                    <option value="exercice">Exercice</option>
                                    <option value="devoir">Devoir à rendre</option>
                                </select>
                            </div>
                            {/* Date limite */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Date limite <span className="text-slate-400 font-normal">(optionnel)</span>
                                </label>
                                <input type="date" value={data.date_limite} onChange={e => setData('date_limite', e.target.value)}
                                    className={selectClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Classe */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Classe <span className="text-red-400">*</span>
                                </label>
                                <select value={data.classe_id} onChange={e => setData('classe_id', e.target.value)} required className={selectClass}>
                                    <option value="">— Choisir —</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                </select>
                                {errors.classe_id && <p className="text-red-500 text-xs mt-1">{errors.classe_id}</p>}
                            </div>
                            {/* Matière */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Matière <span className="text-red-400">*</span>
                                </label>
                                <select value={data.matiere_id} onChange={e => setData('matiere_id', e.target.value)} required
                                    disabled={!data.classe_id} className={`${selectClass} disabled:opacity-60`}>
                                    <option value="">{data.classe_id ? '— Choisir —' : 'Choisir une classe d\'abord'}</option>
                                    {availableMatieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                                </select>
                                {errors.matiere_id && <p className="text-red-500 text-xs mt-1">{errors.matiere_id}</p>}
                            </div>
                        </div>

                        {/* Zone de dépôt fichier */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Fichier <span className="text-red-400">*</span>
                                <span className="text-slate-400 font-normal ml-1">(PDF, Doc, Image — Max 10Mo)</span>
                            </label>
                            <label htmlFor="file-upload-modal"
                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 cursor-pointer transition-colors ${data.fichier ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-400 hover:bg-teal-50/50'}`}>
                                <UploadCloud className={`w-10 h-10 mb-2 ${data.fichier ? 'text-teal-500' : 'text-slate-400'}`} />
                                {data.fichier ? (
                                    <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{data.fichier.name}</p>
                                ) : (
                                    <>
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Cliquez pour déposer un fichier</p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, PNG, JPG jusqu'à 10MB</p>
                                    </>
                                )}
                                <input id="file-upload-modal" type="file" className="sr-only"
                                    onChange={e => setData('fichier', e.target.files[0])} />
                            </label>
                            {errors.fichier && <p className="text-red-500 text-xs mt-1">{errors.fichier}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Description <span className="text-slate-400 font-normal">(optionnel)</span>
                            </label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                                placeholder="Décrivez brièvement ce document..."
                                className={`${selectClass} resize-none`} />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors text-sm">
                                Annuler
                            </button>
                            <button type="submit" disabled={processing}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold shadow-md shadow-teal-500/30 transition-all active:scale-95 text-sm disabled:opacity-70">
                                <Save className="w-4 h-4" />
                                {processing ? 'Publication...' : 'Publier'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
