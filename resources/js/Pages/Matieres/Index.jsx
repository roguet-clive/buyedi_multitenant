import React, { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { Pencil, Trash2, BookOpen, Plus, CheckCircle2, Clock, Search } from "lucide-react";

function MatiereForm({ matiere, onClose }) {
    const { t } = useTranslation();
    const form = useForm({
        nom: matiere?.nom || "",
        description: matiere?.description || "",
    });

    useEffect(() => {
        if (matiere) {
            form.setData({ nom: matiere.nom, description: matiere.description || "" });
        } else {
            form.reset();
        }
    }, [matiere]);

    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { onClose(); form.reset(); } };
        if (matiere) {
            form.put(route("matieres.update", matiere.id), opts);
        } else {
            form.post(route("matieres.store"), opts);
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className={`p-3 rounded-2xl ${matiere ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                    {matiere ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {matiere ? t("edit_matiere", "Modifier la Matière") : t("create_matiere", "Nouvelle Matière")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {matiere ? "Mettez à jour les informations de cette matière." : "Ajoutez une nouvelle discipline au catalogue de l'établissement."}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("subject_name", "Nom de la Matière")} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        value={form.data.nom}
                        onChange={(e) => form.setData("nom", e.target.value)}
                        placeholder="Ex: Mathématiques, Histoire-Géographie..."
                        required
                        autoFocus
                    />
                    {form.errors.nom && <p className="text-red-500 text-sm mt-1">{form.errors.nom}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("description", "Description")}
                        <span className="ml-2 text-xs font-normal text-slate-400">(optionnel)</span>
                    </label>
                    <textarea
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none h-28"
                        value={form.data.description}
                        onChange={(e) => form.setData("description", e.target.value)}
                        placeholder="Description brève de la matière et de son contenu pédagogique..."
                    />
                    {form.errors.description && <p className="text-red-500 text-sm mt-1">{form.errors.description}</p>}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" onClick={onClose} disabled={form.processing}
                        className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors">
                        {t("cancel", "Annuler")}
                    </button>
                    <button type="submit" disabled={form.processing}
                        className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 ${matiere ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'}`}>
                        {form.processing ? <Clock className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {matiere ? t("update", "Mettre à jour") : t("create", "Créer la matière")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ matieres, can }) {
    const { t } = useTranslation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingMatiere, setEditingMatiere] = useState(null);
    const [search, setSearch] = useState('');

    const openCreateModal = () => { setEditingMatiere(null); setModalOpen(true); };
    const openEditModal = (matiere) => { setEditingMatiere(matiere); setModalOpen(true); };

    const destroy = (id) => {
        if (!confirm(t("confirm_delete", "⚠️ Supprimer cette matière ?"))) return;
        router.delete(route("matieres.destroy", id), {
            preserveScroll: true,
            onError: () => toast.error(t("matiere_delete_failed", "❌ Erreur lors de la suppression")),
        });
    };

    const filteredMatieres = matieres.data.filter(m =>
        m.nom.toLowerCase().includes(search.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <DashboardLayout title={t("matieres_management", "Gestion des Matières")}>
            <Head title={t("matieres", "Matières")} />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#0B1A2D] via-emerald-950 to-teal-900 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl relative overflow-hidden text-white border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner hidden sm:block shrink-0">
                            <BookOpen className="w-10 h-10 text-emerald-200" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-sm font-medium mb-3 border border-white/10">
                                <BookOpen className="w-4 h-4" />
                                <span>{t("subjects_catalog", "Catalogue Pédagogique")}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
                                {t("matieres_title", "Matières & Disciplines")}
                            </h1>
                            <p className="text-slate-300 text-base max-w-xl font-light">
                                {t("matieres_desc", "Gérez le catalogue complet des matières enseignées dans votre établissement. Ces matières serviront à la notation et au suivi pédagogique des élèves.")}
                            </p>
                        </div>
                    </div>

                    {can?.create_matieres && (
                        <button onClick={openCreateModal}
                            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 group w-full md:w-auto mt-4 md:mt-0">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            {t("add_matiere", "Nouvelle Matière")}
                        </button>
                    )}
                </div>
            </div>

            {/* BARRE DE RECHERCHE */}
            <div className="relative z-10 -mt-2 mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t("search_subjects", "Rechercher une matière...")}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* TABLEAU PREMIUM */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0B1A2D] text-white">
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase rounded-tl-3xl">Matière</th>
                                <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase">Description</th>
                                {(can?.edit_matieres || can?.delete_matieres) && (
                                    <th className="py-5 px-6 font-semibold text-sm tracking-wide uppercase text-center rounded-tr-3xl w-36">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredMatieres.length > 0 ? (
                                filteredMatieres.map((m, index) => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                    {m.nom.charAt(0).toUpperCase()}
                                                </div>
                                                <p className="font-bold text-slate-800 dark:text-white">{m.nom}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                                {m.description || <span className="italic text-slate-300 dark:text-slate-600">Aucune description</span>}
                                            </p>
                                        </td>
                                        {(can?.edit_matieres || can?.delete_matieres) && (
                                            <td className="py-5 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    {can?.edit_matieres && (
                                                        <button onClick={() => openEditModal(m)}
                                                            className="p-2.5 rounded-full text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                                            title={t("edit", "Modifier")}>
                                                            <Pencil className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {can?.delete_matieres && (
                                                        <button onClick={() => destroy(m.id)}
                                                            className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            title={t("delete", "Supprimer")}>
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={(can?.edit_matieres || can?.delete_matieres) ? 3 : 2} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <BookOpen className="w-16 h-16 mb-4 opacity-40" />
                                            <p className="text-lg font-medium">
                                                {search ? t("no_results", "Aucun résultat pour cette recherche") : t("no_matieres_found", "Aucune matière enregistrée")}
                                            </p>
                                            <p className="text-sm mt-1">
                                                {search ? "Essayez un autre terme de recherche." : "Commencez par ajouter la première matière."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {matieres.links && matieres.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                        {matieres.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                preserveScroll
                                preserveState
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${link.active
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : link.url
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-default"
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md">
                <MatiereForm
                    key={editingMatiere ? `edit-${editingMatiere.id}` : "new"}
                    matiere={editingMatiere}
                    onClose={() => setModalOpen(false)}
                />
            </Modal>
        </DashboardLayout>
    );
}
