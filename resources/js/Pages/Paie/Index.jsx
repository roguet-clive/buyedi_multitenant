import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Add router import here
import { Briefcase, CreditCard, FileText, Plus, Save, User } from 'lucide-react';
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

            {/* Hero Banner Minimaliste */}
            <div className="bg-[#0B1A2D] dark:bg-slate-900 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Briefcase className="w-3.5 h-3.5" />
                            Ressources Humaines
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            Salaires & Vacations
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
                            Contrôlez la masse salariale, gérez les contrats et validez les paiements des employés de l'établissement.
                        </p>
                    </div>

                    <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                        <button className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md bg-white text-slate-800">
                            Synthèse Mensuelle
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-8 -mt-8 relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead className="bg-[#0B1A2D] text-white">
                                    <tr>
                                        <th className="p-5 font-bold text-sm tracking-wide first:pl-6 last:pr-6">Membre du Personnel</th>
                                        <th className="p-5 font-bold text-sm tracking-wide">Détails du Contrat</th>
                                        <th className="p-5 font-bold text-sm tracking-wide">État Financier (Dernier Mois)</th>
                                        <th className="p-5 font-bold text-sm tracking-wide text-right first:pl-6 last:pr-6 whitespace-nowrap w-[200px]">Actions de Paie</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {employees.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="p-5 first:pl-6 last:pr-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/30 shrink-0">
                                                        {emp.nom?.charAt(0) || <User className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-base">
                                                            {emp.prenom} {emp.nom}
                                                        </div>
                                                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{emp.poste || "Non défini"}</span> • {emp.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {emp.contrat ? (
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="inline-flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-bold border 
                                                        bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800">
                                                            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                                                            {emp.contrat.type}
                                                        </div>
                                                        <div className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-1.5 ml-1">
                                                            {parseInt(emp.contrat.salaire_base).toLocaleString()} <span className="text-slate-400 text-xs">XAF / mois</span>
                                                        </div>
                                                        {parseFloat(emp.contrat.taux_horaire) > 0 && (
                                                            <div className="font-medium text-amber-600 text-xs flex items-center gap-1.5 ml-1">
                                                                + {parseInt(emp.contrat.taux_horaire).toLocaleString()} XAF / h sup. ou va.
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm font-medium border border-slate-200 dark:border-slate-700">
                                                        Aucun dossier de contrat
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                {emp.last_payment ? (
                                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 inline-block w-full max-w-[200px]">
                                                        <span className="block font-black text-emerald-600 dark:text-emerald-400 text-lg tracking-tight">
                                                            {parseInt(emp.last_payment.net).toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">XAF</span>
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mt-1">
                                                            <CreditCard className="w-3.5 h-3.5" />
                                                            {new Date(emp.last_payment.annee, emp.last_payment.mois - 1).toLocaleString('fr-FR', { month: 'short', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                                        En attente de paie
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 first:pl-6 last:pr-6 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button onClick={() => openContractModal(emp)}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm whitespace-nowrap">
                                                        <FileText className="w-4 h-4" />
                                                        <span className="hidden lg:inline">Dossier HR</span>
                                                    </button>
                                                    <button onClick={() => openPayModal(emp)} disabled={!emp.contrat}
                                                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 whitespace-nowrap
                                                                ${emp.contrat ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'}`}>
                                                        <CreditCard className="w-4 h-4" />
                                                        <span className="hidden lg:inline">Générer Paie</span>
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
            </div>

            {/* MODAL CONTRAT */}
            <Modal show={showContractModal} onClose={() => setShowContractModal(false)} maxWidth="2xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-8 border-indigo-500">
                    {/* EN-TÊTE MODALE */}
                    <div className="p-6 md:p-8 pb-0 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                Dossier Contractuel
                            </h2>
                            <p className="text-slate-500 font-medium text-sm">Gestion des conditions pour {selectedUser?.nom}</p>
                        </div>
                    </div>

                    <form onSubmit={submitContract} className="p-6 md:p-8 pt-0 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Section 1 : Base du contrat */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 md:col-span-2">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Informations Principales</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Type de Contrat</label>
                                        <select
                                            value={contractData.type}
                                            onChange={e => setContractData('type', e.target.value)}
                                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 dark:text-slate-200 shadow-sm"
                                        >
                                            <option value="CDI">CDI - Durée Indéterminée</option>
                                            <option value="CDD">CDD - Durée Déterminée</option>
                                            <option value="Vacataire">Vacations / Heures</option>
                                            <option value="Stage">Stage</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Date d'embauche</label>
                                        <input
                                            type="date"
                                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                            value={contractData.date_debut}
                                            onChange={e => setContractData('date_debut', e.target.value)}
                                            required
                                        />
                                        <InputError message={contractErrors.date_debut} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 : Rémunération */}
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 md:col-span-2">
                                <h3 className="text-xs font-black uppercase text-indigo-500 tracking-widest mb-4">Conditions de Rémunération</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Salaire de Base Fixe</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full border-indigo-200 dark:border-indigo-800/50 p-3 pl-12 rounded-xl bg-white dark:bg-slate-900 font-bold text-lg text-emerald-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                                value={contractData.salaire_base}
                                                onChange={e => setContractData('salaire_base', e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">XAF</span>
                                        </div>
                                        <InputError message={contractErrors.salaire_base} className="mt-1" />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Taux Horaire (Heures sup. / Vacations)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full border-indigo-200 dark:border-indigo-800/50 p-3 pl-12 rounded-xl bg-white dark:bg-slate-900 font-bold text-lg text-amber-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                                value={contractData.taux_horaire}
                                                onChange={e => setContractData('taux_horaire', e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">XAF</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1.5 font-medium">À renseigner si paiement au taux horaire.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" onClick={() => setShowContractModal(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" disabled={processingContract}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70">
                                <Save className="w-5 h-5" />
                                Sauvegarder le Contrat
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* MODAL PAIE */}
            <Modal show={showPayModal} onClose={() => setShowPayModal(false)} maxWidth="3xl">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-t-8 border-emerald-500">
                    {/* EN-TÊTE MODALE */}
                    <div className="p-6 md:p-8 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 mb-6 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-800">
                                <CreditCard className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Édition de Fiche de Paie
                                </h2>
                                <p className="text-slate-500 font-medium text-sm">Règlement du mois courant pour {selectedUser?.nom}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submitPay} className="p-6 md:p-8 pt-0 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Période */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 md:col-span-2">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Période concernée</h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Mois</label>
                                        <select
                                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
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
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Année</label>
                                        <input
                                            type="number"
                                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                            value={payData.annee}
                                            onChange={e => setPayData('annee', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Calcul (Heures vs Base) */}
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 md:col-span-1">
                                <h3 className="text-xs font-black uppercase text-emerald-500 tracking-widest mb-4">Base de Calcul</h3>

                                {parseFloat(selectedUser?.contrat?.taux_horaire || 0) > 0 && (
                                    <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                        <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                            Vacations effectuées <span className="text-xs text-slate-400 font-normal ml-1">({parseInt(selectedUser.contrat.taux_horaire)} XAF/h)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full border-slate-200 dark:border-slate-700 p-3 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-center"
                                                onChange={e => {
                                                    const heures = parseFloat(e.target.value) || 0;
                                                    const taux = parseFloat(selectedUser.contrat.taux_horaire) || 0;
                                                    const base = parseFloat(selectedUser.contrat.salaire_base) || 0;
                                                    const total = base + (heures * taux);
                                                    setPayData('salaire_brut', total);
                                                }}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Hrs</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Salaire Brut (Base + Vacations)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full border-emerald-200 dark:border-emerald-700 p-3 pl-10 rounded-xl bg-white dark:bg-slate-900 font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                            value={payData.salaire_brut}
                                            onChange={e => setPayData('salaire_brut', e.target.value)}
                                            required
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">XAF</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section Ajustements */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 md:col-span-1">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Ajustements</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">Primes / Bonus (+)</label>
                                        <input
                                            type="number"
                                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                            value={payData.primes}
                                            onChange={e => setPayData('primes', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm font-bold text-red-600 dark:text-red-400">Retenues / Avances (-)</label>
                                        <input
                                            type="number"
                                            className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 text-red-600 font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
                                            value={payData.retenues}
                                            onChange={e => setPayData('retenues', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Net a payer et commentaire */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="p-4 bg-[#0B1A2D] dark:bg-slate-950 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-full">
                                            <CreditCard className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <span className="text-sm text-slate-300 font-bold uppercase tracking-wider">Net à Payer</span>
                                    </div>
                                    <span className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
                                        {(parseFloat(payData.salaire_brut || 0) + parseFloat(payData.primes || 0) - parseFloat(payData.retenues || 0)).toLocaleString()} <span className="text-sm text-emerald-600">XAF</span>
                                    </span>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Commentaire (Optionnel)</label>
                                    <input
                                        className="w-full border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                                        value={payData.commentaire}
                                        onChange={e => setPayData('commentaire', e.target.value)}
                                        placeholder="Ex: Prime d'assiduité, Avance remboursée..."
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="mt-4 pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" onClick={() => setShowPayModal(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" disabled={processingPay}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-70">
                                <FileText className="w-5 h-5" />
                                Générer Fiche de Paie
                            </button>
                        </div>
                    </form>
                </div>
            </Modal >
        </DashboardLayout >
    );
}
