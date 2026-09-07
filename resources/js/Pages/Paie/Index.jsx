import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router import here
import { Briefcase, CreditCard, FileText, Plus, Save, User, Download, ExternalLink, History } from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError'; // Assuming you have this component

export default function Index({ employees }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyEmployee, setHistoryEmployee] = useState(null);

    const openHistoryModal = (emp) => {
        setHistoryEmployee(emp);
        setShowHistoryModal(true);
    };

    // Form Paiement
    const { data: payData, setData: setPayData, post: postPay, processing: processingPay, reset: resetPay, errors: payErrors } = useForm({
        user_id: '',
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
        salaire_brut: '',
        primes: 0,
        retenues: 0,
        commentaire: ''
    });

    // Form Contrat
    const { data: contractData, setData: setContractData, post: postContract, processing: processingContract, reset: resetContract, errors: contractErrors } = useForm({
        user_id: '',
        type: 'CDI',
        salaire_base: '',
        taux_horaire: '',
        date_debut: ''
    });

    const openPayModal = (user) => {
        setSelectedUser(user);
        setPayData({
            ...payData,
            user_id: user.id,
            salaire_brut: user.contrat?.salaire_base || '',
            primes: 0,
            retenues: 0
        });
        setShowPayModal(true);
    };

    const openContractModal = (user) => {
        setSelectedUser(user);
        setContractData({
            user_id: user.id,
            type: user.contrat?.type || 'CDI',
            salaire_base: user.contrat?.salaire_base || '',
            taux_horaire: user.contrat?.taux_horaire || '',
            date_debut: user.contrat?.date_debut || '' // Format handled in backend usually, need YYYY-MM-DD here
        });
        setShowContractModal(true);
    };

    const submitPay = (e) => {
        e.preventDefault();
        postPay(route('rh.paie.store'), {
            onSuccess: () => {
                setShowPayModal(false);
                resetPay();
            }
        });
    };

    const submitContract = (e) => {
        e.preventDefault();
        postContract(route('rh.contrat.store'), {
            onSuccess: () => {
                setShowContractModal(false);
                resetContract();
            }
        });
    };

    return (
        <DashboardLayout
            title="Paie & Vacations"
        >
            <Head title="RH & Paie" />

            {/* Hero Banner Compact & Épuré */}
            <div className="bg-[#0B1A2D] dark:bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden mb-5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <Briefcase className="w-3.5 h-3.5" />
                            Ressources Humaines
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            Salaires & Vacations
                        </h1>
                        <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-xl">
                            Contrôlez la masse salariale, gérez les contrats et validez les paiements des employés.
                        </p>
                    </div>

                    <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm bg-white text-slate-800">
                            Synthèse Mensuelle
                        </button>
                    </div>
                </div>
            </div>

            {/* Tableau du Personnel */}
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-[#0B1A2D] text-white">
                                <tr>
                                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Membre du Personnel</th>
                                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Détails du Contrat</th>
                                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">État Financier (Dernier Mois)</th>
                                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-right whitespace-nowrap w-[180px]">Actions de Paie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs sm:text-sm">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                                                    {emp.nom?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-white text-sm">
                                                        {emp.prenom} {emp.nom}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        <span className="text-blue-600 dark:text-blue-400 font-medium">{emp.poste || "Non défini"}</span> • {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {emp.contrat ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-bold border 
                                                    bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800">
                                                        <Briefcase className="w-3 h-3 mr-1" />
                                                        {emp.contrat.type}
                                                    </div>
                                                    <div className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1 ml-0.5">
                                                        {parseInt(emp.contrat.salaire_base).toLocaleString()} <span className="text-slate-400 text-[10px]">XAF / mois</span>
                                                    </div>
                                                    {parseFloat(emp.contrat.taux_horaire) > 0 && (
                                                        <div className="font-medium text-amber-600 text-[11px] flex items-center gap-1 ml-0.5">
                                                            + {parseInt(emp.contrat.taux_horaire).toLocaleString()} XAF / h
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
                                                    Aucun contrat
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {emp.last_payment ? (
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 inline-block w-full max-w-[210px]">
                                                    <div className="flex items-center justify-between">
                                                        <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-tight">
                                                            {parseInt(emp.last_payment.net).toLocaleString()} <span className="text-[10px] font-bold text-slate-400">XAF</span>
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                                            <CreditCard className="w-3 h-3" />
                                                            {new Date(emp.last_payment.annee, emp.last_payment.mois - 1).toLocaleString('fr-FR', { month: 'short', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-700">
                                                        <a
                                                            href={route('rh.bulletin.download', emp.last_payment.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                                            title="Ouvrir le bulletin de paie officiel en PDF"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            <span>Bulletin (PDF)</span>
                                                        </a>
                                                        {emp.all_payments && emp.all_payments.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openHistoryModal(emp)}
                                                                className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium underline"
                                                            >
                                                                Historique ({emp.all_payments.length})
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                                                    En attente de paie
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end items-center gap-1.5">
                                                {emp.last_payment && (
                                                    <a
                                                        href={route('rh.bulletin.download', emp.last_payment.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Imprimer / Télécharger le dernier bulletin"
                                                        className="flex items-center justify-center p-2 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-sm"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                <button onClick={() => openContractModal(emp)}
                                                    className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm whitespace-nowrap">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>Dossier HR</span>
                                                </button>
                                                <button onClick={() => openPayModal(emp)} disabled={!emp.contrat}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm whitespace-nowrap
                                                            ${emp.contrat ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>Générer Paie</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CONTRAT */}
            <Modal show={showContractModal} onClose={() => setShowContractModal(false)} maxWidth="5xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-4 border-indigo-500 max-h-[88vh] flex flex-col">
                    {/* EN-TÊTE MODALE */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                    Dossier Contractuel
                                </h2>
                                <p className="text-slate-500 text-xs">Gestion des conditions pour {selectedUser?.nom}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowContractModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1">
                            ✕
                        </button>
                    </div>

                    <form onSubmit={submitContract} className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Section 1 : Base du contrat */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 md:col-span-1">
                                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Informations Principales</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">Type de Contrat</label>
                                        <select
                                            value={contractData.type}
                                            onChange={e => setContractData('type', e.target.value)}
                                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm"
                                        >
                                            <option value="CDI">CDI - Durée Indéterminée</option>
                                            <option value="CDD">CDD - Durée Déterminée</option>
                                            <option value="Vacataire">Vacations / Heures</option>
                                            <option value="Stage">Stage</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">Date d'embauche</label>
                                        <input
                                            type="date"
                                            className="w-full border-slate-200 dark:border-slate-700 p-2.5 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm shadow-sm"
                                            value={contractData.date_debut}
                                            onChange={e => setContractData('date_debut', e.target.value)}
                                            required
                                        />
                                        <InputError message={contractErrors.date_debut} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 : Rémunération */}
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 md:col-span-1">
                                <h3 className="text-xs font-bold uppercase text-indigo-500 tracking-wider mb-3">Conditions de Rémunération</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">Salaire de Base Fixe</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full border-indigo-200 dark:border-indigo-800/50 p-2.5 pl-11 rounded-xl bg-white dark:bg-slate-900 font-bold text-sm text-emerald-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                                value={contractData.salaire_base}
                                                onChange={e => setContractData('salaire_base', e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">XAF</span>
                                        </div>
                                        <InputError message={contractErrors.salaire_base} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">Taux Horaire (Vacations)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full border-indigo-200 dark:border-indigo-800/50 p-2.5 pl-11 rounded-xl bg-white dark:bg-slate-900 font-bold text-sm text-amber-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                                value={contractData.taux_horaire}
                                                onChange={e => setContractData('taux_horaire', e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">XAF</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">À renseigner si paiement au taux horaire.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <button type="button" onClick={() => setShowContractModal(false)}
                                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" disabled={processingContract}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70">
                                <Save className="w-4 h-4" />
                                Sauvegarder le Contrat
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* MODAL PAIE */}
            <Modal show={showPayModal} onClose={() => setShowPayModal(false)} maxWidth="5xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-4 border-emerald-500 max-h-[88vh] flex flex-col">
                    {/* EN-TÊTE MODALE */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                    Édition de Fiche de Paie
                                </h2>
                                <p className="text-slate-500 text-xs">Règlement du mois courant pour {selectedUser?.nom}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1">
                            ✕
                        </button>
                    </div>

                    <form onSubmit={submitPay} className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Période */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 md:col-span-2">
                                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Période concernée</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Mois</label>
                                        <select
                                            className="w-full border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm shadow-sm"
                                            value={payData.mois}
                                            onChange={e => setPayData('mois', e.target.value)}
                                            required
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Année</label>
                                        <input
                                            type="number"
                                            className="w-full border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm shadow-sm"
                                            value={payData.annee}
                                            onChange={e => setPayData('annee', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Calcul (Heures vs Base) */}
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 md:col-span-1">
                                <h3 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-2">Base de Calcul</h3>

                                {parseFloat(selectedUser?.contrat?.taux_horaire || 0) > 0 && (
                                    <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                        <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            Vacations effectuées <span className="text-[10px] text-slate-400 font-normal">({parseInt(selectedUser.contrat.taux_horaire)} XAF/h)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full border-slate-200 dark:border-slate-700 p-2 pr-10 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-center text-xs sm:text-sm"
                                                onChange={e => {
                                                    const heures = parseFloat(e.target.value) || 0;
                                                    const taux = parseFloat(selectedUser.contrat.taux_horaire) || 0;
                                                    const base = parseFloat(selectedUser.contrat.salaire_base) || 0;
                                                    const total = base + (heures * taux);
                                                    setPayData('salaire_brut', total);
                                                }}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Hrs</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Salaire Brut (Base + Vacations)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full border-emerald-200 dark:border-emerald-700 p-2 pl-9 rounded-xl bg-white dark:bg-slate-900 font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm shadow-sm"
                                            value={payData.salaire_brut}
                                            onChange={e => setPayData('salaire_brut', e.target.value)}
                                            required
                                        />
                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-[10px]">XAF</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section Ajustements */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 md:col-span-1">
                                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Ajustements</h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block mb-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">Primes / Bonus (+)</label>
                                        <input
                                            type="number"
                                            className="w-full border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                            value={payData.primes}
                                            onChange={e => setPayData('primes', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-bold text-red-600 dark:text-red-400">Retenues / Avances (-)</label>
                                        <input
                                            type="number"
                                            className="w-full border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-900 text-red-600 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
                                            value={payData.retenues}
                                            onChange={e => setPayData('retenues', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Net a payer et commentaire */}
                            <div className="md:col-span-2 space-y-3">
                                <div className="p-3.5 bg-[#0B1A2D] dark:bg-slate-950 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Net à Payer</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">
                                        {(parseFloat(payData.salaire_brut || 0) + parseFloat(payData.primes || 0) - parseFloat(payData.retenues || 0)).toLocaleString()} <span className="text-xs text-emerald-600">XAF</span>
                                    </span>
                                </div>

                                <div>
                                    <label className="block mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">Commentaire (Optionnel)</label>
                                    <input
                                        className="w-full border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm shadow-sm"
                                        value={payData.commentaire}
                                        onChange={e => setPayData('commentaire', e.target.value)}
                                        placeholder="Ex: Prime d'assiduité, Avance remboursée..."
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="mt-2 pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <button type="button" onClick={() => setShowPayModal(false)}
                                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" disabled={processingPay}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70">
                                <FileText className="w-4 h-4" />
                                Générer Fiche de Paie
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* MODAL HISTORIQUE DES BULLETINS */}
            <Modal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} maxWidth="2xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-4 border-indigo-500 max-h-[85vh] flex flex-col">
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Historique des Bulletins de Paie
                                </h2>
                                <p className="text-slate-500 text-xs">Employé : {historyEmployee?.nom} {historyEmployee?.prenom}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1">
                            ✕
                        </button>
                    </div>

                    <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                        {(!historyEmployee?.all_payments || historyEmployee.all_payments.length === 0) ? (
                            <p className="text-center py-6 text-slate-400 text-xs">Aucun historique de paiement pour cet employé.</p>
                        ) : (
                            <div className="space-y-2.5">
                                {historyEmployee.all_payments.map((payment) => (
                                    <div key={payment.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-white text-sm">
                                                {new Date(payment.annee, payment.mois - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                Versé le {payment.date} • Brut : {parseInt(payment.salaire_brut).toLocaleString()} XAF
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                                {parseInt(payment.net).toLocaleString()} XAF
                                            </span>
                                            <a
                                                href={route('rh.bulletin.download', payment.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>PDF</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                        <button
                            type="button"
                            onClick={() => setShowHistoryModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
