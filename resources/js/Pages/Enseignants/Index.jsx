import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import {
    Pencil, Trash2, Eye, User, Briefcase, GraduationCap, Phone, MapPin, Search, Plus, CheckCircle2, X, AlertCircle, Loader2
} from "lucide-react";

function EnseignantForm({ enseignant, onClose }) {
    const { t } = useTranslation();
    const form = useForm({
        nom: enseignant?.nom || "",
        prenom: enseignant?.prenom || "",
        email: enseignant?.user?.email || "",
        password: "",
        sexe: enseignant?.sexe || "M",
        telephone: enseignant?.telephone || "",
        adresse: enseignant?.adresse || "",
        specialite: enseignant?.specialite || "",
        cv: null,
    });

    useEffect(() => {
        if (enseignant) {
            form.setData({
                nom: enseignant.nom || "",
                prenom: enseignant.prenom || "",
                email: enseignant.user?.email || "",
                password: "",
                sexe: enseignant.sexe || "M",
                telephone: enseignant.telephone || "",
                adresse: enseignant.adresse || "",
                specialite: enseignant.specialite || "",
                cv: null,
            });
        } else {
            form.reset();
        }
    }, [enseignant]);

    const submit = (e) => {
        e.preventDefault();
        if (enseignant) {
            form.transform((data) => ({
                ...data,
                _method: "PUT",
            })).post(route("enseignants.update", enseignant.id), {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Dossier enseignant mis à jour avec succès ✅");
                    onClose();
                    form.reset();
                },
                onError: (errs) => {
                    const firstErr = Object.values(errs)[0];
                    toast.error(firstErr || "Veuillez vérifier les informations saisies.");
                }
            });
        } else {
            form.post(route("enseignants.store"), {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Enseignant intégré avec succès ✅");
                    onClose();
                    form.reset();
                },
                onError: (errs) => {
                    const firstErr = Object.values(errs)[0];
                    toast.error(firstErr || "Veuillez vérifier les informations saisies.");
                }
            });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8 pb-0 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        {enseignant ? t("edit_enseignant", "Modifier l'enseignant") : t("create_enseignant", "Ajouter un enseignant")}
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Gérez le dossier personnel et professionnel.</p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* BANNIÈRE D'ERREURS */}
            {form.errors && Object.keys(form.errors).length > 0 && (
                <div className="mx-6 md:mx-8 mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-bold mb-1">Veuillez corriger les informations suivantes :</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                            {Object.entries(form.errors).map(([key, msg]) => (
                                <li key={key}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="p-6 md:p-8 pt-0 flex flex-col gap-6" encType="multipart/form-data">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                    {/* 1. Informations Personnelles */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-5 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            Identité
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("nom", "Nom")} <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-medium"
                                    value={form.data.nom} onChange={(e) => form.setData("nom", e.target.value)} />
                                {form.errors.nom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.nom}</p>}
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("prenom", "Prénom")} <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-medium"
                                    value={form.data.prenom} onChange={(e) => form.setData("prenom", e.target.value)} />
                                {form.errors.prenom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.prenom}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t("email", "Email Professionnel")} <span className="text-slate-400 font-normal text-xs">(Optionnel • Auto-généré si vide)</span>
                                </label>
                                <div className="relative">
                                    <input type="email" className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-medium"
                                        value={form.data.email} onChange={(e) => form.setData("email", e.target.value)} placeholder="prenom.nom@ecole.com (facultatif)" />
                                </div>
                                {form.errors.email && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.email}</p>}
                                <p className="text-xs text-slate-400 mt-1.5">Sera utilisé pour créer son compte d'accès Portail.</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t("password", "Mot de passe d'accès")} <span className="text-slate-400 font-normal text-xs">{enseignant ? "(Laisser vide pour conserver l'actuel)" : "(Par défaut : 12345678)"}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-mono text-sm"
                                        value={form.data.password}
                                        onChange={(e) => form.setData("password", e.target.value)}
                                        placeholder={enseignant ? "Laisser vide pour ne pas modifier" : "12345678"}
                                    />
                                </div>
                                {form.errors.password && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.password}</p>}
                                <p className="text-xs text-slate-400 mt-1.5">Mot de passe pour se connecter sur l'espace enseignant.</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("sexe", "Sexe")}</label>
                                <div className="relative">
                                    <select className="w-full border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm appearance-none font-medium text-slate-700 dark:text-slate-200"
                                        value={form.data.sexe} onChange={(e) => form.setData("sexe", e.target.value)}>
                                        <option value="M">{t("homme", "Masculin")}</option>
                                        <option value="F">{t("femme", "Féminin")}</option>
                                    </select>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 2. Coordonnées & Profession */}
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                        <h3 className="text-sm font-black uppercase text-blue-500 tracking-widest mb-5 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Dossier Professionnel
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {t("telephone", "Téléphone")}</label>
                                <input type="text" className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-medium"
                                    value={form.data.telephone} onChange={(e) => form.setData("telephone", e.target.value)} placeholder="+241 00 00 00 00" />
                                {form.errors.telephone && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.telephone}</p>}
                            </div>

                            <div className="md:col-span-1">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {t("adresse", "Adresse")}</label>
                                <input type="text" className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-medium"
                                    value={form.data.adresse} onChange={(e) => form.setData("adresse", e.target.value)} placeholder="Quartier, Ville" />
                                {form.errors.adresse && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.adresse}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-slate-400" /> {t("specialite", "Spécialité Principale")}</label>
                                <input type="text" className="w-full border-blue-200 dark:border-blue-800/50 bg-white dark:bg-slate-900 p-3 pl-4 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm font-bold text-blue-700 dark:text-blue-400"
                                    value={form.data.specialite} onChange={(e) => form.setData("specialite", e.target.value)} placeholder="Ex: Mathématiques, SVT, Anglais..." />
                                {form.errors.specialite && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.specialite}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">{t("cv", "Curriculum Vitae (PDF, Max 4Mo)")}</label>
                                <div className="relative">
                                    <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="w-full border border-dashed border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/40 hover:file:bg-blue-100"
                                        onChange={(e) => form.setData("cv", e.target.files[0])} />
                                </div>
                                {form.errors.cv && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.cv}</p>}
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
                        {form.processing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : enseignant ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        {enseignant ? t("update", "Mettre à jour le dossier") : t("create", "Intégrer l'enseignant")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ enseignants, filters }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingEnseignant, setEditingEnseignant] = useState(null);

    // useEffect(() => {
    //     if (flash?.success) toast.success(flash.success);
    //     if (flash?.error) toast.error(flash.error);
    // }, [flash]);

    const openCreateModal = () => {
        setEditingEnseignant(null);
        setModalOpen(true);
    };

    const openEditModal = (enseignant) => {
        setEditingEnseignant(enseignant);
        setModalOpen(true);
    };

    const destroy = (id) => {
        if (!confirm(t("confirm_delete_enseignant", "⚠️ Supprimer cet enseignant ?\nATTENTION : Cela supprimera également le compte utilisateur associé (accès login)."))) return;
        router.delete(route("enseignants.destroy", id), {
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout title={t("enseignants_management", "Gestion des Enseignants")}>
            {/* Header Banner */}
            <div className="relative mb-8 bg-[#0B1A2D] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-800">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

                <div className="relative p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
                    <div className="flex items-start gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0">
                            <GraduationCap className="w-8 h-8 text-blue-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                                {t("enseignants_list", "Corps Professoral")}
                            </h1>
                            <p className="text-blue-100/80 font-medium text-sm max-w-xl leading-relaxed">
                                Gérez les enseignants de votre établissement, consultez leurs affectations de classes et informations de contact.
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                                <span className="text-xs font-bold text-blue-50 tracking-wider">
                                    {enseignants.total} {t("enseignants_count", "ENSEIGNANTS ACTIFS")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 sm:w-auto w-full">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder={t("search_enseignant", "Rechercher...")}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-100/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-md font-medium"
                                defaultValue={filters.search}
                                onChange={(e) => {
                                    router.get(
                                        route("enseignants.index"),
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
                            <span>{t("add_enseignant", "Nouveau")}</span>
                        </button>
                    </div>
                </div>
            </div>

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="5xl">
                <EnseignantForm
                    key={editingEnseignant ? `edit-${editingEnseignant.id}` : "new"}
                    enseignant={editingEnseignant}
                    onClose={() => setModalOpen(false)}
                />
            </Modal>

            <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-[#0B1A2D] text-white">
                            <tr>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs w-16 text-center">{t("avatar", "#")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs">{t("full_name", "Identité")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs w-48">{t("specialite", "Spécialité")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs">{t("contacts", "Contacts")}</th>
                                <th className="p-5 font-bold tracking-wide uppercase text-xs text-center w-36">{t("actions", "Actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {enseignants.data.length > 0 ? (
                                enseignants.data.map((enseignant) => (
                                    <tr key={enseignant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-5 align-middle text-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm mx-auto shadow-sm ring-2 ring-white dark:ring-slate-800">
                                                {enseignant.prenom.charAt(0)}{enseignant.nom.charAt(0)}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-slate-800 dark:text-slate-200 text-base">{enseignant.prenom} <span className="uppercase">{enseignant.nom}</span></div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {enseignant.adresse || "Adresse non renseignée"}</div>
                                        </td>
                                        <td className="p-5">
                                            {enseignant.specialite ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                                    <Briefcase className="w-3 h-3" />
                                                    {enseignant.specialite}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {enseignant.telephone || "-"}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /> {enseignant?.user?.email || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={route("enseignants.show", enseignant.id)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title={t("view", "Voir le profil détaillé")}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => openEditModal(enseignant)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title={t("edit")}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => destroy(enseignant.id)}
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
                                            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                                            <p className="font-medium">{t("no_enseignants_found", "Aucun enseignant trouvé.")}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {enseignants.links && (
                    <div className="mt-4 flex flex-wrap gap-2 p-6 border-t border-slate-100 dark:border-slate-700">
                        {enseignants.links.map((link, i) => (
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
