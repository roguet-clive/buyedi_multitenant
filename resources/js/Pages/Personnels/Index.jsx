import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import {
    Pencil, Trash2, Eye, User, Briefcase, GraduationCap, Phone, MapPin, Search, Plus, CheckCircle2, X
} from "lucide-react";

function PersonnelForm({ personnel, onClose }) {
    const { t } = useTranslation();
    const form = useForm({
        nom: personnel?.user?.nom || "",
        prenom: personnel?.user?.prenom || "",
        email: personnel?.user?.email || "",
        poste: personnel?.poste || "",
        telephone: personnel?.telephone || "",
        adresse: personnel?.adresse || "",
        date_embauche: personnel?.date_embauche || "",
        date_naissance: personnel?.date_naissance || "",
        lieu_naissance: personnel?.lieu_naissance || "",
        sexe: personnel?.sexe || "M",
        // Contrat
        salaire_base: personnel?.user?.contrat?.salaire_base || "",
        type_contrat: personnel?.user?.contrat?.type || "CDI",
    });

    useEffect(() => {
        if (personnel) {
            form.setData({
                nom: personnel.user.nom,
                prenom: personnel.user.prenom,
                email: personnel.user.email,
                poste: personnel.poste,
                telephone: personnel.telephone || "",
                adresse: personnel.adresse || "",
                date_embauche: personnel.date_embauche || "",
                date_naissance: personnel.date_naissance || "",
                lieu_naissance: personnel.lieu_naissance || "",
                sexe: personnel.sexe || "M",
                salaire_base: personnel.user?.contrat?.salaire_base || "",
                type_contrat: personnel.user?.contrat?.type || "CDI",
            });
        } else {
            form.reset();
        }
    }, [personnel]);

    const submit = (e) => {
        e.preventDefault();
        const action = personnel ? route("personnels.update", personnel.id) : route("personnels.store");
        const method = personnel ? form.put : form.post;

        method(action, {
            onSuccess: () => {
                onClose();
                form.reset();
            },
            onError: () => toast.error(personnel ? t("update_failed") : t("creation_failed")),
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8 pb-0 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        {personnel ? t("edit_personnel", "Modifier le membre du personnel") : t("create_personnel", "Ajouter un membre du personnel")}
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Gérez le dossier personnel, le poste et le contrat.</p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={submit} className="p-6 md:p-8 pt-0 flex flex-col gap-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                    {/* 1. Informations Personnelles */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-5 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            État Civil & Coordonnées
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("nom", "Nom")} <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                    value={form.data.nom} onChange={(e) => form.setData("nom", e.target.value)} />
                                {form.errors.nom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.nom}</p>}
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("prenom", "Prénom")} <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                    value={form.data.prenom} onChange={(e) => form.setData("prenom", e.target.value)} />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("email", "Email Professionnel")} <span className="text-red-500">*</span></label>
                                <input type="email" required className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                    value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} placeholder="employe@ecole.com" />
                                {form.errors.email && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.email}</p>}
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("telephone", "Téléphone")}</label>
                                <input type="text" className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                    value={form.data.telephone} onChange={(e) => form.setData("telephone", e.target.value)} placeholder="+241 00 ..." />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("adresse", "Adresse")}</label>
                                <input type="text" className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                    value={form.data.adresse} onChange={(e) => form.setData("adresse", e.target.value)} placeholder="Quartier, Ville" />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Date de Naissance</label>
                                <input type="date" className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                    value={form.data.date_naissance} onChange={(e) => form.setData("date_naissance", e.target.value)} />
                            </div>

                            <div className="md:col-span-1 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Lieu de Naiss.</label>
                                    <input type="text" className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
                                        value={form.data.lieu_naissance} onChange={(e) => form.setData("lieu_naissance", e.target.value)} />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Sexe</label>
                                    <select className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm appearance-none font-medium text-slate-700 dark:text-slate-200"
                                        value={form.data.sexe} onChange={(e) => form.setData("sexe", e.target.value)}>
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Informations Professionnelles & Contrat */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                        <h3 className="text-sm font-black uppercase text-blue-500 tracking-widest mb-5 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Dossier Professionnel & Contrat
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Poste Occupé <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 pl-4 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-bold text-blue-700 dark:text-blue-400"
                                    value={form.data.poste} onChange={(e) => form.setData("poste", e.target.value)} required placeholder="Ex: Informaticien, Surveillant, Agent d'entretien..." />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Date d'embauche</label>
                                <input type="date" className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-medium"
                                    value={form.data.date_embauche} onChange={(e) => form.setData("date_embauche", e.target.value)} />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Type de Contrat</label>
                                <div className="relative">
                                    <select className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm appearance-none font-bold text-slate-700 dark:text-slate-200"
                                        value={form.data.type_contrat} onChange={(e) => form.setData("type_contrat", e.target.value)}>
                                        <option value="CDI">CDI (Contrat à Durée Indéterminée)</option>
                                        <option value="CDD">CDD (Contrat à Durée Déterminée)</option>
                                        <option value="Vacataire">Vacataire</option>
                                        <option value="Stage">Stage</option>
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Salaire de Base Mensuel</label>
                                <div className="relative">
                                    <input type="number" min="0" step="1000" className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 pl-12 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-bold text-emerald-600 dark:text-emerald-400"
                                        value={form.data.salaire_base} onChange={(e) => form.setData("salaire_base", e.target.value)} placeholder="0" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold text-sm">XAF</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="mt-2 pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 w-full">
                    <button type="button" onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        {t("cancel", "Annuler")}
                    </button>
                    <button type="submit" disabled={form.processing}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70">
                        {personnel ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                {t("update", "Mettre à jour le dossier")}
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                {t("create", "Ajouter l'employé")}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ personnels, filters }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPersonnel, setEditingPersonnel] = useState(null);



    const openCreateModal = () => {
        setEditingPersonnel(null);
        setModalOpen(true);
    };

    const openEditModal = (personnel) => {
        setEditingPersonnel(personnel);
        setModalOpen(true);
    };

    const destroy = (id) => {
        if (!confirm(t("confirm_delete", "⚠️ Supprimer ce personnel ?"))) return;
        router.delete(route("personnels.destroy", id), {
            preserveScroll: true,
            onSuccess: () => { },
            onError: () => toast.error(t("delete_failed", "❌ Erreur lors de la suppression")),
        });
    };

    return (
        <DashboardLayout title={t("personnels_management", "Gestion du Personnel")}>
            {/* Header Banner */}
            <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="relative p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
                            <Briefcase className="w-8 h-8 text-blue-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                                Employés & Administration
                            </h1>
                            <p className="text-blue-100/80 font-medium text-sm max-w-xl leading-relaxed">
                                Gérez l'ensemble du personnel administratif et d'encadrement, de leurs postes à leurs contrats.
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg">
                                <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
                                <span className="text-xs font-bold text-blue-50 tracking-wider">
                                    {personnels.total} {t("personnels_count", "EMPLOYÉS")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 sm:w-auto w-full">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder={t("search_personnel", "Rechercher...")}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-100/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-md font-medium"
                                defaultValue={filters.search}
                                onChange={(e) => {
                                    router.get(
                                        route("personnels.index"),
                                        { search: e.target.value },
                                        { preserveState: true, replace: true }
                                    );
                                }}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-blue-400"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t("add_personnel", "Nouveau")}</span>
                        </button>
                    </div>
                </div>
            </div>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="5xl">
                <PersonnelForm
                    key={editingPersonnel ? `edit-${editingPersonnel.id}` : "new"}
                    personnel={editingPersonnel}
                    onClose={() => setModalOpen(false)}
                />
            </Modal>

            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-[#0B1A2D] text-white">
                            <tr>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs w-16 text-center">#</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs">{t("employee", "Identité & Poste")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs">{t("contacts", "Contacts")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs w-48">{t("contract", "Contrat & Embauche")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs text-center w-32">{t("actions", "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {personnels.data.length > 0 ? (
                                personnels.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-5 align-middle text-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/60 dark:to-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm mx-auto shadow-sm ring-2 ring-white dark:ring-slate-800">
                                                {p.user?.prenom?.charAt(0) || ""}{p.user?.nom?.charAt(0) || "U"}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-base">{p.user?.prenom} <span className="uppercase">{p.user?.nom}</span></div>
                                            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                                                <Briefcase className="w-3 h-3" />
                                                {p.poste || "Non spécifié"}
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 font-medium"><Phone className="w-3.5 h-3.5 text-slate-400" /> {p.telephone || "-"}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /> {p.user?.email || "-"}</span>
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {p.user?.contrat?.type ? (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${p.user.contrat.type === 'CDI' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                            p.user.contrat.type === 'CDD' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                                'bg-slate-200 text-slate-700 border border-slate-300'
                                                            }`}>
                                                            {p.user.contrat.type}
                                                        </span>
                                                    ) : <span className="text-slate-400 italic text-xs">Pas de contrat</span>}
                                                </div>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">Embauche: {p.date_embauche || "-"}</span>
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title={t("edit")}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => destroy(p.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title={t("delete")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                            <p className="font-medium">Aucun membre du personnel enregistré.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {personnels.links && (
                    <div className="mt-4 flex flex-wrap gap-2 p-6 border-t border-slate-100 dark:border-slate-700">
                        {personnels.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                preserveScroll
                                preserveState
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${link.active ? "bg-blue-600 shadow-md shadow-blue-500/20 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
