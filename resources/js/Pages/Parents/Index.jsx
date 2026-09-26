import { useState, useEffect } from "react";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import toast from "react-hot-toast";
import useTranslation from "@/Hooks/useTranslation";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Modal from "@/Components/Modal";
import { PencilSquareIcon, TrashIcon, UserPlusIcon, UsersIcon, CheckCircleIcon, IdentificationIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';

function ParentForm({ parent, onClose }) {
    const { t } = useTranslation();
    const form = useForm({
        nom: parent?.user?.nom || "",
        prenom: parent?.user?.prenom || "",
        email: parent?.user?.email || "",
        telephone: parent?.telephone || "",
        adresse: parent?.adresse || "",
        eleve_ids: parent?.eleves?.map(e => e.id) || [],
    });

    // Initial values for React Select
    const [defaultEleves, setDefaultEleves] = useState([]);

    useEffect(() => {
        if (parent) {
            form.setData({
                nom: parent.user?.nom || "",
                prenom: parent.user?.prenom || "",
                email: parent.user?.email || "",
                telephone: parent.telephone || "",
                adresse: parent.adresse || "",
                eleve_ids: parent.eleves?.map(e => e.id) || [],
            });
            // Prepare default options for the select
            const defaults = parent.eleves?.map(e => ({
                value: e.id,
                label: `${e.matricule} - ${e.user?.prenom || ''} ${e.user?.nom || ''}`.trim()
            })) || [];
            setDefaultEleves(defaults);
        } else {
            form.reset();
            setDefaultEleves([]);
        }
    }, [parent]);

    const loadOptions = (inputValue, callback) => {
        if (!inputValue) return callback([]);
        axios.get(route('parents.search.eleves'), { params: { query: inputValue } })
            .then(response => {
                callback(response.data);
            })
            .catch(err => console.error(err));
    };

    const submit = (e) => {
        e.preventDefault();
        if (parent) {
            form.put(route("parents.update", parent.id), {
                onSuccess: () => {
                    onClose();
                    form.reset();
                },
                onError: () => toast.error(t("update_failed", "❌ Veuillez corriger les erreurs en rouge.")),
            });
        } else {
            form.post(route("parents.store"), {
                onSuccess: () => {
                    onClose();
                    form.reset();
                },
                onError: () => toast.error(t("creation_failed", "❌ Veuillez corriger les erreurs en rouge.")),
            });
        }
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
            borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
            borderRadius: '0.75rem',
            padding: '0.25rem 0.5rem',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
            cursor: 'text',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
            }
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            borderRadius: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f1f5f9',
            padding: '0.5rem',
            overflow: 'hidden'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#eff6ff' : 'transparent',
            color: state.isFocused ? '#1e40af' : '#334155',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            padding: '0.625rem 1rem',
            fontWeight: '500',
            transition: 'all 0.1s ease',
            ':active': {
                backgroundColor: '#dbeafe'
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#f1f5f9',
            borderRadius: '0.5rem',
            padding: '2px 4px',
            margin: '4px',
            border: '1px solid #e2e8f0'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#475569',
            fontWeight: '600',
            fontSize: '0.875rem'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#94a3b8',
            borderRadius: '0.375rem',
            ':hover': {
                backgroundColor: '#fee2e2',
                color: '#dc2626'
            }
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#94a3b8',
            fontWeight: '400',
        }),
        input: (provided) => ({
            ...provided,
            color: '#334155',
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#3b82f6' : '#cbd5e1',
            ':hover': {
                color: '#94a3b8'
            }
        })
    };

    return (
        <div className="p-1">
            {/* Header Modale */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700/50 pb-5 mb-6 px-5 pt-5">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                    <UsersIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {parent ? t("edit_parent", "Modifier La Fiche Parent") : t("create_parent", "Enregistrer un Nouveau Parent")}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                        {parent ? "Actualisez les données ou changez l'affection." : "Créez la fiche et reliez le aux élèves correspondants."}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="px-5 pb-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">

                    {/* COLONNE GAUCHE (7/12) : IDENTITE & CONTACT */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* BLOC 1 : Identité */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Identité Civile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("nom", "Nom de Famille")} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-semibold"
                                        value={form.data.nom}
                                        onChange={(e) => form.setData("nom", e.target.value)}
                                        placeholder="Ex: Moussavou"
                                    />
                                    {form.errors.nom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.nom}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("prenom", "Prénom(s)")}</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                                        value={form.data.prenom}
                                        onChange={(e) => form.setData("prenom", e.target.value)}
                                        placeholder="Ex: Jean-Marc"
                                    />
                                    {form.errors.prenom && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.prenom}</p>}
                                </div>
                            </div>
                        </div>

                        {/* BLOC 2 : Coordonnées */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Informations de Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("email", "Adresse Email")} <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                                        value={form.data.email}
                                        onChange={(e) => form.setData("email", e.target.value)}
                                        placeholder="père@email.com"
                                    />
                                    {form.errors.email && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("telephone", "Téléphone Mobile")}</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
                                        value={form.data.telephone}
                                        onChange={(e) => form.setData("telephone", e.target.value)}
                                        placeholder="Ex: +241 77 00 00 00"
                                    />
                                    {form.errors.telephone && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.telephone}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("adresse", "Adresse de Résidence")}</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                                        value={form.data.adresse}
                                        onChange={(e) => form.setData("adresse", e.target.value)}
                                        placeholder="Ex: Quartier Louis, Rue du port..."
                                    />
                                    {form.errors.adresse && <p className="text-red-500 text-xs font-bold mt-1.5">{form.errors.adresse}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE (5/12) : ENFANTS */}
                    <div className="lg:col-span-5 h-full">
                        {/* BLOC 3 : Liaisons Élèves */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50 h-full flex flex-col">
                            <h3 className="text-sm font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <IdentificationIcon className="w-5 h-5" />
                                Affiliation des Elèves
                            </h3>
                            <div className="flex-1">
                                <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Rechercher et associer
                                </label>
                                <div className="relative z-[9999] mb-4">
                                    <AsyncSelect
                                        isMulti
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={loadOptions}
                                        styles={customStyles}
                                        className="text-slate-800 text-sm"
                                        placeholder={t("search", "Chercher un matricule/nom...")}
                                        defaultValue={defaultEleves}
                                        key={defaultEleves.length}
                                        onChange={(selected) => {
                                            form.setData("eleve_ids", selected.map(s => s.value));
                                        }}
                                        noOptionsMessage={() => "Aucun élève trouvé..."}
                                        loadingMessage={() => "Recherche en cours..."}
                                    />
                                </div>
                                <div className="p-4 bg-white/60 dark:bg-slate-800/50 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        {t("search_student_help", "Les élèves liés apparaîtront dans le tableau et seront sous la responsabilité financière/administrative de ce parent.")}
                                    </p>
                                </div>
                                {form.errors.eleve_ids && <p className="text-red-500 text-xs font-bold mt-2">{form.errors.eleve_ids}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700/50 lg:px-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                    >
                        {t("cancel", "Annuler la saisie")}
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-[#0B1A2D] hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                    >
                        {form.processing ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                        )}
                        <span>{parent ? t("update", "Sauvegarder la Fiche") : t("create", "Enregistrer le Parent")}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function Index({ parents, filters }) {
    const { t } = useTranslation();
    const { auth } = usePage().props;
    const permissions = auth?.permissions || [];
    const roles = auth?.roles || [];
    const isTeacher = roles.some(role => role.toLowerCase() === 'enseignant');
    const can = (permission) => permissions.includes(permission) || roles.includes('super-admin') || roles.includes('directeur') || roles.includes('admin');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingParent, setEditingParent] = useState(null);

    const openCreateModal = () => {
        setEditingParent(null);
        setModalOpen(true);
    };

    const openEditModal = (parent) => {
        setEditingParent(parent);
        setModalOpen(true);
    };

    const destroy = (id) => {
        if (!confirm(t("confirm_delete_parent", "⚠️ ATTENTION : La suppression d'un parent est irréversible. Confirmez-vous cette action ?"))) return;
        router.delete(route("parents.destroy", id), {
            preserveScroll: true,
            onSuccess: () => { },
            onError: () => toast.error(t("delete_failed", "❌ Erreur lors de la suppression. Le parent est peut-être lié à des données cruciales.")),
        });
    };

    return (
        <DashboardLayout title={t("parents_management", "Gestion des Parents")}>

            {/* HEADER PAGE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        {isTeacher ? "Contacts Parents d'Élèves" : t("parents_list", "Dossiers Parents d'Élèves")}
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 text-sm font-bold shadow-sm border border-orange-200 dark:border-orange-800/50">
                            {parents.total} {isTeacher ? "Parents de vos classes" : "Enregistrés"}
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {isTeacher
                            ? "Coordonnées de contact des responsables légaux des élèves de vos classes pour le suivi pédagogique et urgences."
                            : "Gérez la base de données des parents et les responsables légaux des élèves."
                        }
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* SEARCH BAR */}
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={t("search_parent", "Chercher par nom...")}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm font-medium shadow-sm"
                            defaultValue={filters.search}
                            onChange={(e) => {
                                router.get(route("parents.index"), { search: e.target.value }, { preserveState: true, replace: true });
                            }}
                        />
                    </div>

                    {can('ajouter_parents') && (
                        <button
                            onClick={openCreateModal}
                            className="w-full md:w-auto group flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-green-500/30 transition-all active:scale-95"
                        >
                            <UserPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            <span>Nouveau Parent</span>
                        </button>
                    )}
                </div>
            </div>

            {/* BANNIÈRE D'INFORMATION ENSEIGNANT */}
            {isTeacher && (
                <div className="mb-6 p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-3 text-indigo-900 dark:text-indigo-200 shadow-sm">
                    <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">
                        <span className="font-extrabold">Espace Contacts Parents :</span> Vous visualisez les coordonnées des responsables légaux des élèves inscrits dans vos classes. Vous pouvez les joindre directement par téléphone, WhatsApp ou e-mail.
                    </p>
                </div>
            )}

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} maxWidth="5xl">
                <ParentForm
                    key={editingParent ? `edit-${editingParent.id}` : "new"}
                    parent={editingParent}
                    onClose={() => setModalOpen(false)}
                />
            </Modal>

            {/* PARENTS TABLE */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 rounded-3xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left border-collapse">
                        <thead className="bg-[#0B1A2D] text-slate-300">
                            <tr className="uppercase text-xs font-bold tracking-wider">
                                <th className="px-6 py-5 rounded-tl-3xl">{t("full_name", "Identité Parent")}</th>
                                <th className="px-6 py-5">{t("contact_info", "Coordonnées de Contact")}</th>
                                <th className="px-6 py-5">{t("children_list", "Enfants Affiliés")}</th>
                                <th className="px-6 py-5 text-center rounded-tr-3xl">{t("actions", "Gestion")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {parents.data.length > 0 ? (
                                parents.data.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        {/* NOMS */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex-items justify-center items-center font-bold text-lg border border-orange-100 dark:border-orange-500/20">
                                                    {parent.user?.nom ? parent.user.nom.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <span className="block font-extrabold text-[#0B1A2D] dark:text-white text-base">
                                                        {parent.user?.nom || '-'}
                                                    </span>
                                                    <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        {parent.user?.prenom || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* COORDONNÉES */}
                                        <td className="px-6 py-5">
                                            <span className="block font-medium text-slate-800 dark:text-slate-200 mb-0.5">{parent.user?.email}</span>
                                            <span className="block text-xs font-mono font-bold text-slate-500">{parent.telephone || "Numéro non renseigné"}</span>
                                        </td>

                                        {/* ENFANTS */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                {parent.eleves && parent.eleves.length > 0 ? (
                                                    parent.eleves.map((eleve) => (
                                                        <div key={eleve.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                                                            <IdentificationIcon className="w-3.5 h-3.5 text-blue-500" />
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                                                                {eleve.user?.nom} {eleve.user?.prenom?.charAt(0)}.
                                                            </span>
                                                            <span className="border-l pl-1.5 border-slate-300 dark:border-slate-500 text-[10px] uppercase font-black text-slate-400">
                                                                {eleve.matricule}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 rounded-lg text-xs font-bold italic">
                                                        ⚠️ Aucun élève rattaché
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ACTIONS & CONTACTS DIRECTS */}
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex justify-center items-center gap-1.5 flex-wrap">
                                                {/* 📞 APPEL DIRECT */}
                                                {parent.telephone && (
                                                    <a
                                                        href={`tel:${parent.telephone}`}
                                                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 rounded-xl transition-all shadow-sm"
                                                        title={`Appeler ${parent.telephone}`}
                                                    >
                                                        <PhoneIcon className="w-4 h-4" />
                                                    </a>
                                                )}

                                                {/* 💬 WHATSAPP */}
                                                {parent.telephone && (
                                                    <a
                                                        href={`https://wa.me/${parent.telephone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/40 dark:hover:bg-green-900/60 dark:text-green-300 rounded-xl transition-all shadow-sm font-bold text-xs"
                                                        title="Envoyer un message WhatsApp"
                                                    >
                                                        <span className="text-[11px]">💬</span>
                                                    </a>
                                                )}

                                                {/* ✉️ EMAIL */}
                                                {parent.user?.email && (
                                                    <a
                                                        href={`mailto:${parent.user.email}`}
                                                        className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-xl transition-all shadow-sm"
                                                        title={`Envoyer un email à ${parent.user.email}`}
                                                    >
                                                        <EnvelopeIcon className="w-4 h-4" />
                                                    </a>
                                                )}

                                                {/* GESTION ADMIN */}
                                                {can('modifier_parents') && (
                                                    <button
                                                        onClick={() => openEditModal(parent)}
                                                        className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-500 rounded-xl transition-all shadow-sm"
                                                        title={t("edit")}
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {can('supprimer_parents') && (
                                                    <button
                                                        onClick={() => destroy(parent.id)}
                                                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-500 rounded-xl transition-all shadow-sm"
                                                        title={t("delete")}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-2">
                                                <UsersIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <span className="font-bold text-lg text-slate-600 dark:text-slate-300">Aucun profil Parent disponible.</span>
                                            <p className="text-sm max-w-sm">Le tableau de bord centralisé est vide. Utilisez le bouton d'ajout en haut de page pour renseigner le premier Profil.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {parents.links && parents.data.length > 0 && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap justify-center sm:justify-end gap-2">
                        {parents.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                preserveScroll
                                preserveState
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${link.active
                                    ? "bg-[#0B1A2D] text-white shadow-md shadow-slate-900/20"
                                    : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                                    } ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

        </DashboardLayout>
    );
}
