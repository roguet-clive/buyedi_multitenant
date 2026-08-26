import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, router } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import {
    FileText,
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    Search,
    Shield,
    AlertCircle,
    User,
    GraduationCap,
    CreditCard,
    Filter,
    Calendar,
    Send,
    Eye,
    X,
    Radio
} from "lucide-react";
import toast from "react-hot-toast";

export default function Index({
    demandes,
    isStaff = false,
    isParent = false,
    isStudent = false,
    children = [],
    studentProfile = null,
    filters = {}
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState(null);

    // 🔄 Auto-actualisation intelligente en temps réel si des demandes sont en attente
    useEffect(() => {
        const hasPending = demandes?.data?.some(d => d.statut === 'en_attente');
        if (!hasPending) return;

        const timer = setInterval(() => {
            router.reload({
                only: ['demandes'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 10000); // Rafraîchissement toutes les 10 secondes

        return () => clearInterval(timer);
    }, [demandes]);

    // Formulaire de création de demande
    const createForm = useForm({
        eleve_id: isStudent ? studentProfile?.id : (children[0]?.id || ''),
        type_document: 'certificat_scolarite',
        motif: '',
    });

    // Formulaire de rejet (staff)
    const rejectForm = useForm({
        statut: 'rejete',
        motif_rejet: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('demandes-documents.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset('motif');
                toast.success('Demande enregistrée et transmise au secrétariat.');
            },
            onError: () => toast.error('Erreur lors de la transmission de la demande.'),
        });
    };

    const handleApprove = (demandeId) => {
        if (!confirm('Confirmez-vous la validation et la mise à disposition de ce document officiel ?')) return;

        router.patch(route('demandes-documents.traiter', demandeId), {
            statut: 'approuve',
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Demande approuvée. Document prêt au téléchargement.'),
            onError: () => toast.error('Erreur lors de l\'approbation.'),
        });
    };

    const openRejectModal = (demande) => {
        setSelectedDemande(demande);
        rejectForm.setData('motif_rejet', '');
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!selectedDemande) return;

        rejectForm.patch(route('demandes-documents.traiter', selectedDemande.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedDemande(null);
                toast.success('Demande rejetée avec notification envoyée.');
            },
            onError: () => toast.error('Erreur lors du rejet.'),
        });
    };

    const handleFilterChange = (key, value) => {
        router.get(route('demandes-documents.index'), {
            ...filters,
            [key]: value
        }, { preserveState: true, replace: true });
    };

    const formatAmount = (val) => Number(val || 0).toLocaleString('fr-FR') + ' FCFA';

    const getDocumentName = (type) => {
        switch (type) {
            case 'certificat_scolarite': return 'Certificat de Scolarité';
            case 'carte_scolaire': return 'Carte Scolaire';
            case 'fiche_synthese': return 'Fiche de Synthèse';
            case 'attestation_inscription': return 'Attestation d\'Inscription';
            default: return 'Document Administratif';
        }
    };

    return (
        <DashboardLayout title="Guichet des Documents Administratifs">
            <Head title="Demandes de Documents" />

            {/* HERO BANNER */}
            <div className="bg-[#0B1A2D] rounded-3xl p-8 md:p-10 mb-8 relative overflow-hidden shadow-2xl border border-slate-800 text-white">
                <div className="absolute top-0 right-0 -m-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -m-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-blue-300 text-xs font-bold border border-white/10 uppercase tracking-wide">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>Guichet Numérique Certifié</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            {isStaff ? "Traitement des Demandes de Documents" : "Mes Demandes de Documents Officiels"}
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                            {isStaff 
                                ? "Vérifiez la conformité des dossiers, l'état de caisse et délivrez les certificats et attestations certifiés." 
                                : "Effectuez vos demandes de certificat de scolarité, carte scolaire ou attestation en ligne et suivez leur délivrance."}
                        </p>
                    </div>

                    {/* Bouton Nouvelle Demande (Élève / Parent / Staff) */}
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3.5 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-emerald-500/25 transition-all active:scale-95 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Faire une Demande</span>
                    </button>
                </div>
            </div>

            {/* FILTRES POUR L'ADMINISTRATION */}
            {isStaff && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Rechercher élève ou matricule..."
                                defaultValue={filters.search || ''}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFilterChange('search', e.target.value);
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Filtre Type Document */}
                        <select
                            value={filters.type_document || 'all'}
                            onChange={(e) => handleFilterChange('type_document', e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                            <option value="all">Tous les types</option>
                            <option value="certificat_scolarite">Certificat de Scolarité</option>
                            <option value="carte_scolaire">Carte Scolaire</option>
                            <option value="fiche_synthese">Fiche de Synthèse</option>
                        </select>
                    </div>

                    {/* Onglets Statut */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
                        {[
                            { key: 'all', label: 'Toutes' },
                            { key: 'en_attente', label: 'En attente' },
                            { key: 'approuve', label: 'Approuvées' },
                            { key: 'rejete', label: 'Rejetées' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleFilterChange('statut', tab.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    (filters.statut || 'all') === tab.key
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* TABLEAU DES DEMANDES */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[850px]">
                        <thead className="bg-[#0B1A2D] text-white">
                            <tr>
                                <th className="p-5 font-bold uppercase text-xs">Élève & Classe</th>
                                <th className="p-5 font-bold uppercase text-xs">Document Demandé</th>
                                <th className="p-5 font-bold uppercase text-xs">Motif & Date</th>
                                {isStaff && <th className="p-5 font-bold uppercase text-xs">Situation Caisse</th>}
                                <th className="p-5 font-bold uppercase text-xs text-center">Statut</th>
                                <th className="p-5 font-bold uppercase text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {demandes.data && demandes.data.length > 0 ? (
                                demandes.data.map((demande) => {
                                    const eleveNom = demande.eleve?.user?.nom_complet || (demande.eleve?.user?.nom + ' ' + demande.eleve?.user?.prenom);
                                    const classeNom = demande.eleve?.inscriptions?.[0]?.classe?.nom || 'Classe non assignée';

                                    return (
                                        <tr key={demande.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* Élève */}
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-sm shrink-0">
                                                        {eleveNom?.charAt(0) || 'E'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                            {eleveNom}
                                                        </p>
                                                        <p className="text-xs text-slate-400 font-mono">
                                                            Matr. {demande.eleve?.matricule} &bull; <strong className="text-slate-600 dark:text-slate-300 font-semibold">{classeNom}</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Document */}
                                            <td className="p-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700">
                                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>{getDocumentName(demande.type_document)}</span>
                                                </div>
                                            </td>

                                            {/* Motif & Date */}
                                            <td className="p-5">
                                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                                    {demande.motif || <span className="text-slate-400 italic">Aucun motif précisé</span>}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(demande.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>

                                            {/* Situation Caisse (Staff only) */}
                                            {isStaff && (
                                                <td className="p-5">
                                                    {demande.finance ? (
                                                        demande.finance.is_solde ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Soldé
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-200 dark:border-amber-800" title={`Payé : ${formatAmount(demande.finance.total_paye)} / Dû : ${formatAmount(demande.finance.total_du)}`}>
                                                                <AlertCircle className="w-3.5 h-3.5" /> Dû: {formatAmount(demande.finance.reste)}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>
                                            )}

                                            {/* Statut */}
                                            <td className="p-5 text-center">
                                                {demande.statut === 'approuve' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Prêt / Validé
                                                    </span>
                                                ) : demande.statut === 'rejete' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-black" title={demande.motif_rejet}>
                                                        <XCircle className="w-3.5 h-3.5" /> Refusé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black">
                                                        <Clock className="w-3.5 h-3.5" /> En attente
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Téléchargement pour l'élève/parent si approuvé */}
                                                    {demande.statut === 'approuve' && (
                                                        <a
                                                            href={route('demandes-documents.download', demande.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            <span>Télécharger</span>
                                                        </a>
                                                    )}

                                                    {/* Boutons d'action pour le staff */}
                                                    {isStaff && (
                                                        <>
                                                            {demande.statut === 'en_attente' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(demande.id)}
                                                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                                                                        title="Valider et autoriser le téléchargement"
                                                                    >
                                                                        Autoriser
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openRejectModal(demande)}
                                                                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold transition-all"
                                                                        title="Rejeter la demande"
                                                                    >
                                                                        Rejeter
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Imprimer pour guichet */}
                                                            <a
                                                                href={route('demandes-documents.download', demande.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                                                title="Imprimer pour guichet"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={isStaff ? 6 : 5} className="p-12 text-center text-slate-400 italic">
                                        <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                        <p className="font-bold text-slate-700 dark:text-slate-300 text-base">Aucune demande de document enregistrée</p>
                                        <p className="text-xs text-slate-400 mt-1">Cliquez sur « Faire une Demande » pour solliciter un certificat ou une attestation.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL NOUVELLE DEMANDE */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="lg">
                <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl">
                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                                    Nouvelle Demande de Document
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Transmettez votre demande officielle au secrétariat de l'école.
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-5">
                        {/* Sélecteur d'enfant pour le Parent */}
                        {isParent && children.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Sélectionner l'enfant <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={createForm.data.eleve_id}
                                    onChange={(e) => createForm.setData('eleve_id', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm font-bold text-slate-800 dark:text-white"
                                >
                                    {children.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nom_complet} — {c.classe} ({c.matricule})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Type de Document */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Type de document officiel <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={createForm.data.type_document}
                                onChange={(e) => createForm.setData('type_document', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm font-bold text-slate-800 dark:text-white"
                            >
                                <option value="certificat_scolarite">🎓 Certificat de Scolarité Officiel</option>
                                <option value="carte_scolaire">🪪 Carte Scolaire de l'Élève</option>
                                <option value="fiche_synthese">📋 Fiche de Synthèse & Dossier Scolaire</option>
                                <option value="attestation_inscription">📜 Attestation d'Inscription</option>
                            </select>
                        </div>

                        {/* Motif Optionnel */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                Motif ou Précision (Optionnel)
                            </label>
                            <textarea
                                rows="3"
                                value={createForm.data.motif}
                                onChange={(e) => createForm.setData('motif', e.target.value)}
                                placeholder="Ex: Pour dossier d'allocations, visa, inscription concours..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-500/25 transition-all"
                            >
                                Envoyer la demande
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* MODAL REJET (STAFF ONLY) */}
            <Modal show={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="md">
                <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl">
                    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg">
                                Rejeter la demande
                            </h3>
                            <p className="text-xs text-slate-400">
                                Indiquez le motif qui sera envoyé au demandeur.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleRejectSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Motif du refus <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows="3"
                                value={rejectForm.data.motif_rejet}
                                onChange={(e) => rejectForm.setData('motif_rejet', e.target.value)}
                                placeholder="Ex: Arriéré de scolarité sur la 2ème tranche / Photo d'identité non conforme."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500"
                            ></textarea>
                            {rejectForm.errors.motif_rejet && (
                                <p className="text-red-500 text-xs font-bold mt-1">{rejectForm.errors.motif_rejet}</p>
                            )}
                        </div>

                        <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={rejectForm.processing}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
                            >
                                Confirmer le rejet
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
