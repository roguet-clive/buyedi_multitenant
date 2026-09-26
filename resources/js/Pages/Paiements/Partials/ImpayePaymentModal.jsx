import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, router } from '@inertiajs/react';
import { 
    CreditCard, 
    X, 
    Wallet, 
    CheckCircle2, 
    User, 
    AlertTriangle, 
    Check, 
    Printer, 
    Layers, 
    ArrowRight 
} from 'lucide-react';
import useTranslation from '@/Hooks/useTranslation';

export default function ImpayePaymentModal({ 
    debiteur, 
    fraisTypes = [], 
    onClose, 
    formatFCFA 
}) {
    const { t } = useTranslation();
    const [quickChoice, setQuickChoice] = useState('retard');
    const [receiptUrl, setReceiptUrl] = useState(null);

    // Trouver le type de frais scolarité et tenue
    const fraisScolarite = fraisTypes.find(ft => ft.is_scolarite || ft.nom?.toLowerCase()?.includes('scolarit'));
    const fraisTenue = fraisTypes.find(ft => ft.nom?.toLowerCase()?.includes('tenue'));

    const form = useForm({
        inscription_id: '',
        frais_type_id: '',
        montant: '',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: 'especes',
        mois: '',
        commentaire: '',
    });

    useEffect(() => {
        if (debiteur) {
            setReceiptUrl(null);
            const defFraisId = fraisScolarite?.id || (fraisTypes[0]?.id || '');
            
            // Priorité : solder les retards échus s'il y en a, sinon la scolarité totale
            const montantDefaut = debiteur.scolarite_retard_montant > 0 
                ? debiteur.scolarite_retard_montant 
                : (debiteur.scolarite_reste > 0 ? debiteur.scolarite_reste : debiteur.total_du);

            const moisDefaut = (debiteur.elements_en_retard || []).length > 0 
                ? (debiteur.elements_en_retard || []).join(', ') 
                : (debiteur.is_secondaire ? 'Scolarité' : 'Scolarité en cours');

            form.setData({
                inscription_id: debiteur.inscription_id,
                frais_type_id: defFraisId,
                montant: montantDefaut,
                date_paiement: new Date().toISOString().split('T')[0],
                mode_paiement: 'especes',
                mois: moisDefaut,
                commentaire: `Règlement scolarité (${moisDefaut})`,
            });
            setQuickChoice(debiteur.scolarite_retard_montant > 0 ? 'retard' : 'scolarite');
        }
    }, [debiteur]);

    const handleQuickAction = (action) => {
        if (!debiteur) return;
        setQuickChoice(action);

        if (action === 'retard') {
            form.setData({
                ...form.data,
                frais_type_id: fraisScolarite?.id || form.data.frais_type_id,
                montant: debiteur.scolarite_retard_montant || debiteur.scolarite_reste,
                mois: (debiteur.elements_en_retard || []).join(', '),
                commentaire: `Règlement échéance(s) en retard (${(debiteur.elements_en_retard || []).join(', ')})`,
            });
        } else if (action === 'scolarite') {
            form.setData({
                ...form.data,
                frais_type_id: fraisScolarite?.id || form.data.frais_type_id,
                montant: debiteur.scolarite_reste,
                mois: 'Solde Annuel Scolarité',
                commentaire: 'Règlement solde intégral de la scolarité annuelle',
            });
        } else if (action === 'tenue') {
            form.setData({
                ...form.data,
                frais_type_id: fraisTenue?.id || form.data.frais_type_id,
                montant: debiteur.tenue_montant,
                mois: 'Tenue Scolaire',
                commentaire: 'Règlement tenue scolaire officielle',
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!debiteur) return;

        form.post(route('paiements.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const dernierPaiementId = page.props?.flash?.dernier_paiement_id;
                if (dernierPaiementId) {
                    setReceiptUrl(route('paiements.recu', dernierPaiementId));
                } else {
                    onClose();
                }
            },
        });
    };

    const montantVerse = parseFloat(form.data.montant || 0);
    const progressionActuelle = debiteur?.scolarite_annuelle > 0
        ? Math.round((debiteur.scolarite_payee / debiteur.scolarite_annuelle) * 100)
        : 0;
    const nouvelleProgression = debiteur?.scolarite_annuelle > 0
        ? Math.min(100, Math.round(((debiteur.scolarite_payee + montantVerse) / debiteur.scolarite_annuelle) * 100))
        : 100;

    return (
        <Transition show={!!debiteur} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 md:p-6">
                        <Dialog.Panel className="w-full max-w-5xl xl:max-w-6xl transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/80 dark:border-slate-800">
                            
                            {/* HEADER HORIZONTAL */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-5">
                                <div className="flex items-center gap-3.5">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Dialog.Title as="h3" className="text-xl font-black text-slate-900 dark:text-white">
                                                Règlement Direct d'Impayé
                                            </Dialog.Title>
                                            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                                                Créance : {formatFCFA(debiteur?.total_du)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Encaissement au guichet et génération instantanée de la quittance sans quitter le suivi
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* BANDEAU SUCCÈS SI PAIEMENT ENREGISTRÉ AVEC BOUTON IMPRESSION */}
                            {receiptUrl && (
                                <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-600 text-white">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                                                Paiement enregistré avec succès en comptabilité !
                                            </h4>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                                La créance a été mise à jour. Vous pouvez imprimer la quittance maintenant.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all active:scale-95"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span>Imprimer le Reçu Officiel</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CORPS HORIZONTAL (2 COLONNES EQUILIBREES) */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                                    
                                    {/* COLONNE GAUCHE (5/12) : SITUATION DE LA CRÉANCE */}
                                    <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1A2D] via-[#112640] to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                        <div className="relative z-10 space-y-4">
                                            {/* Header Élève */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block mb-1.5">
                                                        Dossier Élève
                                                    </span>
                                                    <h4 className="text-xl font-black text-white leading-tight">
                                                        {debiteur?.nom_complet}
                                                    </h4>
                                                    <p className="text-xs text-slate-300 mt-0.5">
                                                        Classe : <strong className="text-white">{debiteur?.classe_nom}</strong> • Mat: {debiteur?.matricule}
                                                    </p>
                                                    {debiteur?.parent_contact && debiteur?.parent_contact !== 'N/A' && (
                                                        <p className="text-[11px] text-amber-300 mt-1 flex items-center gap-1 font-medium">
                                                            <span>Parent : {debiteur?.parent_nom || ''} ({debiteur?.parent_contact})</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            </div>

                                            {/* Encadré Créance Totale Restante */}
                                            <div className="bg-gradient-to-r from-rose-500/20 to-orange-500/10 border border-rose-500/30 p-4 rounded-2xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] uppercase font-extrabold text-rose-300 tracking-wider">
                                                        Total Restant Dû
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200">
                                                        {progressionActuelle}% de scolarité réglée
                                                    </span>
                                                </div>
                                                <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 font-mono tracking-tight">
                                                    {formatFCFA(debiteur?.total_du)}
                                                </div>
                                            </div>

                                            {/* Détail analytique des postes d'impayés */}
                                            <div className="space-y-2 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs">
                                                <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider mb-1">
                                                    Postes Débiteurs :
                                                </span>

                                                {/* 1. Scolarité */}
                                                <div className="flex items-center justify-between py-1 border-b border-white/5">
                                                    <span className="text-slate-300 font-medium">🎓 Scolarité Reste :</span>
                                                    <strong className="text-white font-mono">{formatFCFA(debiteur?.scolarite_reste)}</strong>
                                                </div>
                                                {debiteur?.elements_en_retard?.length > 0 && (
                                                    <div className="pl-2 pb-1 text-[11px] flex flex-wrap gap-1">
                                                        <span className="text-rose-300 font-bold">Échéances échues :</span>
                                                        {debiteur.elements_en_retard.map((el, i) => (
                                                            <span key={i} className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 text-[10px] font-black border border-rose-400/40">
                                                                {el}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* 2. Tenue */}
                                                <div className="flex items-center justify-between py-1 border-b border-white/5">
                                                    <span className="text-slate-300 font-medium">👕 Tenue Scolaire :</span>
                                                    {debiteur?.tenue_payee ? (
                                                        <span className="text-emerald-400 font-bold">✓ Réglée</span>
                                                    ) : (
                                                        <strong className="text-amber-400 font-mono">{formatFCFA(debiteur?.tenue_montant)} (Impayée)</strong>
                                                    )}
                                                </div>

                                                {/* 3. Arriérés passés */}
                                                {debiteur?.arrieres_dette > 0 && (
                                                    <div className="flex items-center justify-between py-1">
                                                        <span className="text-purple-300 font-medium">⏳ Arriérés passés :</span>
                                                        <strong className="text-purple-300 font-mono">{formatFCFA(debiteur?.arrieres_dette)}</strong>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Jauge de progression */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                                                    <span>Progression Scolarité après ce versement</span>
                                                    <span className="font-bold text-emerald-300">{nouvelleProgression}%</span>
                                                </div>
                                                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                                                    <div 
                                                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                                                        style={{ width: `${nouvelleProgression}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                                            <span>Scolarité totale : {formatFCFA(debiteur?.scolarite_annuelle)}</span>
                                            <span className="text-emerald-300 font-bold">Déjà versé : {formatFCFA(debiteur?.scolarite_payee)}</span>
                                        </div>
                                    </div>

                                    {/* COLONNE DROITE (7/12) : FORMULAIRE D'ENCAISSEMENT LARGE */}
                                    <div className="lg:col-span-7 bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            
                                            {/* 1. Choix Rapide en 1-clic */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                    1. Choix Rapide de Règlement (1-clic)
                                                </label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {debiteur?.scolarite_retard_montant > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickAction('retard')}
                                                            className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                                quickChoice === 'retard'
                                                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 ring-2 ring-rose-400/30'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                                                            }`}
                                                        >
                                                            <span className="block font-black">Retards Échus</span>
                                                            <span className="text-[10px] opacity-80 block font-mono">{formatFCFA(debiteur.scolarite_retard_montant)}</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickAction('scolarite')}
                                                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            quickChoice === 'scolarite'
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/30'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                        }`}
                                                    >
                                                        <span className="block font-black">Solder Scolarité</span>
                                                        <span className="text-[10px] opacity-80 block font-mono">{formatFCFA(debiteur?.scolarite_reste)}</span>
                                                    </button>

                                                    {!debiteur?.tenue_payee && debiteur?.tenue_montant > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickAction('tenue')}
                                                            className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                                quickChoice === 'tenue'
                                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 ring-2 ring-amber-400/30'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                                                            }`}
                                                        >
                                                            <span className="block font-black">Régler Tenue</span>
                                                            <span className="text-[10px] opacity-80 block font-mono">{formatFCFA(debiteur.tenue_montant)}</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickChoice('libre')}
                                                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            quickChoice === 'libre'
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/30'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                                        }`}
                                                    >
                                                        <span className="block font-black">Montant Libre</span>
                                                        <span className="text-[10px] opacity-80 block font-mono">Personnalisé</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Saisie du Montant & Choix du Type de Frais */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                                        2. Type de Frais Encaissé <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={form.data.frais_type_id}
                                                        onChange={(e) => form.setData('frais_type_id', e.target.value)}
                                                        className="w-full py-3 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        required
                                                    >
                                                        {fraisTypes.map(ft => (
                                                            <option key={ft.id} value={ft.id}>
                                                                {ft.nom} {ft.is_scolarite ? '(Scolarité)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                                                        Montant Encaissé (FCFA) <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="1"
                                                            value={form.data.montant}
                                                            onChange={(e) => {
                                                                form.setData('montant', e.target.value);
                                                                setQuickChoice('libre');
                                                            }}
                                                            className="w-full border-none bg-transparent py-2.5 pl-14 pr-3 rounded-2xl text-xl font-black text-emerald-700 dark:text-emerald-400 focus:ring-0 text-right font-mono"
                                                            placeholder="0"
                                                            required
                                                        />
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                                            FCFA
                                                        </span>
                                                    </div>
                                                    {form.errors.montant && <p className="text-red-500 text-xs font-bold mt-1">{form.errors.montant}</p>}
                                                </div>
                                            </div>

                                            {/* Grille 2 colonnes : Mode de paiement & Date */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Mode de Règlement <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={form.data.mode_paiement}
                                                        onChange={(e) => form.setData('mode_paiement', e.target.value)}
                                                        className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        required
                                                    >
                                                        <option value="especes">💵 Espèces (Guichet)</option>
                                                        <option value="mobile">📱 Mobile Money (Airtel / Moov)</option>
                                                        <option value="virement">🏦 Virement Bancaire</option>
                                                        <option value="cheque">📝 Chèque</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Date d'encaissement <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={form.data.date_paiement}
                                                        onChange={(e) => form.setData('date_paiement', e.target.value)}
                                                        className="w-full py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Grille 2 colonnes : Mois / Période & Commentaire */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Période / Mois couverts
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.data.mois}
                                                        onChange={(e) => form.setData('mois', e.target.value)}
                                                        className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        placeholder="Ex: Octobre, Novembre..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                        Observation sur le reçu
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.data.commentaire}
                                                        onChange={(e) => form.setData('commentaire', e.target.value)}
                                                        className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                                                        placeholder="Ex: Règlement apporté par le parent..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions horizontales */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/60 mt-4">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                {t("cancel", "Annuler")}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={form.processing || !form.data.montant || parseFloat(form.data.montant) <= 0}
                                                className="inline-flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>{form.processing ? "Encaissement..." : "Valider et Émettre le Reçu"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
