import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Printer, 
    ArrowLeft, 
    Download, 
    Users, 
    School, 
    Filter, 
    Search,
    X,
    FileSpreadsheet,
    CheckCircle2, 
    Building2,
    Scissors,
    Shirt,
    Sparkles
} from 'lucide-react';
import useTranslation from '@/Hooks/useTranslation';

export default function TenuesFournisseur({
    inscriptions = [],
    parClasse = [],
    stats = {},
    filters = {},
    classes = [],
    annees = [],
    anneeActive = {},
    etablissement = {},
}) {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    const [viewMode, setViewMode] = useState('classe'); // 'classe' | 'global'
    const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
    const [selectedClasse, setSelectedClasse] = useState(filters.classe_id || '');
    const [selectedSexe, setSelectedSexe] = useState(filters.sexe || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handlePrint = () => {
        window.print();
    };

    const handleFilterChange = (newFilters) => {
        router.get(
            route('inscriptions.tenues.fournisseur'),
            {
                ...filters,
                ...newFilters,
            },
            { preserveState: true, replace: true }
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Date actuelle pour le document imprimable
    const dateGeneration = useMemo(() => {
        return new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    // Filtrage instantané côté client
    const filteredInscriptions = useMemo(() => {
        return inscriptions.filter((insc) => {
            const eleve = insc.eleve || {};
            const user = eleve.user || {};
            const classe = insc.classe || {};

            if (selectedClasse && String(insc.classe_id) !== String(selectedClasse)) {
                return false;
            }

            if (selectedSexe && eleve.sexe?.toUpperCase() !== selectedSexe.toUpperCase()) {
                return false;
            }

            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const nom = (user.nom || '').toLowerCase();
                const prenom = (user.prenom || '').toLowerCase();
                const matricule = (eleve.matricule || '').toLowerCase();
                const classeNom = (classe.nom || '').toLowerCase();

                return nom.includes(term) ||
                    prenom.includes(term) ||
                    matricule.includes(term) ||
                    classeNom.includes(term);
            }

            return true;
        });
    }, [inscriptions, selectedClasse, selectedSexe, searchTerm]);

    // Filtrage dynamique pour la vue par classe
    const displayedParClasse = useMemo(() => {
        const baseClasses = selectedClasse
            ? parClasse.filter(c => String(c.classe_id) === String(selectedClasse))
            : parClasse;

        if (!searchTerm.trim() && !selectedSexe) {
            return baseClasses;
        }

        return baseClasses.map(group => {
            const matchingEleves = group.eleves.filter(insc => {
                const eleve = insc.eleve || {};
                const user = eleve.user || {};

                if (selectedSexe && eleve.sexe?.toUpperCase() !== selectedSexe.toUpperCase()) {
                    return false;
                }

                if (searchTerm.trim()) {
                    const term = searchTerm.toLowerCase();
                    const nom = (user.nom || '').toLowerCase();
                    const prenom = (user.prenom || '').toLowerCase();
                    const matricule = (eleve.matricule || '').toLowerCase();
                    return nom.includes(term) || prenom.includes(term) || matricule.includes(term);
                }

                return true;
            });

            return {
                ...group,
                effectif: matchingEleves.length,
                filles: matchingEleves.filter(i => i.eleve?.sexe?.toUpperCase() === 'F').length,
                garcons: matchingEleves.filter(i => i.eleve?.sexe?.toUpperCase() === 'M').length,
                eleves: matchingEleves,
            };
        }).filter(group => group.effectif > 0);
    }, [parClasse, selectedClasse, selectedSexe, searchTerm]);

    // Export CSV compatible Excel pour envoi par email ou WhatsApp
    const handleExportCSV = () => {
        const headers = ["N°", "Matricule", "Nom", "Prénom", "Sexe", "Classe", "Montant Tenue", "Date Règlement", "N° Reçu", "Taille / Mesure", "Statut Livraison"];
        
        const rows = filteredInscriptions.map((item, index) => {
            const eleve = item.eleve || {};
            const user = eleve.user || {};
            const classe = item.classe || {};
            const tenue = item.tenue_info || {};

            return [
                index + 1,
                eleve.matricule || '-',
                user.nom || '-',
                user.prenom || '-',
                eleve.sexe ? eleve.sexe.toUpperCase() : '-',
                classe.nom || '-',
                `${tenue.montant || 12000} FCFA`,
                tenue.date_paiement || '-',
                tenue.numero_recu || '-',
                "", // Taille à renseigner par le tailleur
                "À livrer"
            ];
        });

        const csvContent = "\uFEFF" + [
            headers.join(";"),
            ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Commandes_Tenues_Fournisseur_${anneeActive?.nom || 'Annee'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-4 print:bg-white print:p-0 print:m-0 text-slate-800">
            <Head title={`Bon de Commande & Liste Tenues - Fournisseur (${anneeActive?.nom || ''})`} />

            {/* CSS SPÉCIFIQUE POUR L'IMPRESSION A4 */}
            <style>{`
                @media print {
                    @page {
                        size: A4 ${orientation};
                        margin: 8mm 10mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-break-inside-avoid {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .print-break-after {
                        break-after: page;
                        page-break-after: always;
                    }
                    table {
                        font-size: 10px !important;
                    }
                    th, td {
                        padding: 4px 6px !important;
                    }
                }
            `}</style>

            {/* BARRE D'ACTIONS ET FILTRES (NO-PRINT) */}
            <div className="max-w-[297mm] mx-auto mb-6 no-print space-y-4">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('inscriptions.index')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Shirt className="w-5 h-5 text-emerald-600" />
                                Bon de Commande des Tenues Scolaires
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Liste officielle certifiée pour confection et livraison par le fournisseur / tailleur
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Orientation Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setOrientation('landscape')}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                                    orientation === 'landscape'
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Format Paysage (Recommandé)"
                            >
                                Paysage
                            </button>
                            <button
                                onClick={() => setOrientation('portrait')}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                                    orientation === 'portrait'
                                        ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Format Portrait"
                            >
                                Portrait
                            </button>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setViewMode('classe')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    viewMode === 'classe'
                                        ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                Par Classe
                            </button>
                            <button
                                onClick={() => setViewMode('global')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    viewMode === 'global'
                                        ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                Liste Continue
                            </button>
                        </div>

                        {/* Export Excel Button */}
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                            title="Télécharger la liste pour WhatsApp ou Email"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Export Excel</span>
                        </button>

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimer (A4)</span>
                        </button>
                    </div>
                </div>

                {/* Filtres interactifs */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    {/* Recherche */}
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par élève ou matricule..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>

                    {/* Filtre Classe */}
                    <div>
                        <select
                            value={selectedClasse}
                            onChange={(e) => setSelectedClasse(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.nom}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre Sexe */}
                    <div>
                        <select
                            value={selectedSexe}
                            onChange={(e) => setSelectedSexe(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            <option value="">Tous les genres (Garçons & Filles)</option>
                            <option value="M">Garçons uniquement</option>
                            <option value="F">Filles uniquement</option>
                        </select>
                    </div>

                    {/* Filtre Année */}
                    <div>
                        <select
                            value={filters.annee_scolaire_id || ''}
                            onChange={(e) => handleFilterChange({ annee_scolaire_id: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                            {annees.map(a => (
                                <option key={a.id} value={a.id}>
                                    Année {a.nom} {a.en_cours ? '(Active)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* FEUILLE IMPRIMABLE A4 */}
            <div className="max-w-[297mm] mx-auto bg-white p-8 print:p-0 rounded-2xl shadow-xl print:shadow-none border border-slate-200 print:border-none">
                
                {/* EN-TÊTE ÉTABLISSEMENT & TITRE DU DOCUMENT */}
                <div className="border-b-2 border-slate-800 pb-3 mb-4">
                    <div className="flex items-start justify-between">
                        {/* Logo & École */}
                        <div className="flex items-center gap-3">
                            {etablissement?.logo ? (
                                <img
                                    src={`/storage/${etablissement.logo}`}
                                    alt="Logo"
                                    className="h-16 w-16 object-contain rounded-lg border border-slate-200 p-0.5"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center">
                                    {etablissement?.sigle?.substring(0, 2) || 'CS'}
                                </div>
                            )}
                            <div>
                                <h1 className="text-base font-black uppercase text-slate-900 leading-tight">
                                    {etablissement?.nom || 'Complexe Scolaire'}
                                </h1>
                                {etablissement?.sigle && (
                                    <p className="text-xs font-bold text-emerald-800 tracking-wider">
                                        {etablissement.sigle} {etablissement.devise ? `• ${etablissement.devise}` : ''}
                                    </p>
                                )}
                                <p className="text-[11px] text-slate-600 mt-0.5">
                                    {[etablissement?.adresse, etablissement?.ville, etablissement?.telephone, etablissement?.email].filter(Boolean).join(' • ')}
                                </p>
                            </div>
                        </div>

                        {/* Titre & Références Document */}
                        <div className="text-right">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-1">
                                BON DE COMMANDE FOURNISSEUR
                            </span>
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                ÉTAT DES TENUES SCOLAIRES RÉGLÉES
                            </h2>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                                Année Scolaire : <span className="font-extrabold text-slate-900">{anneeActive?.nom || 'En cours'}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                                Édité le : {dateGeneration}
                            </p>
                        </div>
                    </div>

                    {/* SYNTHÈSE CHIFFRÉE POUR LE FOURNISSEUR / TAILLEUR */}
                    <div className="mt-3 grid grid-cols-4 gap-2 bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center text-xs">
                        <div className="border-r border-emerald-200">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total Tenues à Confectionner</span>
                            <span className="text-lg font-black text-emerald-950 font-mono">
                                {filteredInscriptions.length} tenues
                            </span>
                        </div>
                        <div className="border-r border-emerald-200">
                            <span className="text-[10px] font-bold uppercase text-blue-800 block">👦 Modèles Garçons</span>
                            <span className="text-lg font-black text-blue-900 font-mono">
                                {filteredInscriptions.filter(i => i.eleve?.sexe?.toUpperCase() === 'M').length}
                            </span>
                        </div>
                        <div className="border-r border-emerald-200">
                            <span className="text-[10px] font-bold uppercase text-pink-800 block">👧 Modèles Filles</span>
                            <span className="text-lg font-black text-pink-900 font-mono">
                                {filteredInscriptions.filter(i => i.eleve?.sexe?.toUpperCase() === 'F').length}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase text-slate-700 block">Classes Concernées</span>
                            <span className="text-lg font-black text-slate-900 font-mono">
                                {displayedParClasse.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* VUE PAR CLASSE */}
                {viewMode === 'classe' ? (
                    <div className="space-y-6">
                        {displayedParClasse.length > 0 ? (
                            displayedParClasse.map((groupe, idx) => (
                                <div key={groupe.classe_id} className="print-break-inside-avoid">
                                    {/* Titre de la classe avec sous-totaux pour le tailleur */}
                                    <div className="bg-slate-800 text-white px-3 py-1.5 rounded-t-lg flex items-center justify-between text-xs font-bold">
                                        <div className="flex items-center gap-2">
                                            <span className="uppercase tracking-wide font-black">{groupe.classe_nom}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-normal">
                                                {groupe.classe_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] font-mono">
                                            <span className="text-blue-300">👦 Garçons : {groupe.garcons}</span>
                                            <span className="text-pink-300">👧 Filles : {groupe.filles}</span>
                                            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded font-black">
                                                Total : {groupe.effectif}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tableau des élèves de la classe */}
                                    <div className="border border-slate-300 rounded-b-lg overflow-hidden mb-4">
                                        <table className="w-full text-left text-[10px] border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-800 uppercase font-extrabold border-b border-slate-300 text-[9px]">
                                                    <th className="py-1.5 px-2 w-8 text-center border-r border-slate-200">N°</th>
                                                    <th className="py-1.5 px-2 w-24 border-r border-slate-200">Matricule</th>
                                                    <th className="py-1.5 px-2 border-r border-slate-200">Nom & Prénom Élève</th>
                                                    <th className="py-1.5 px-2 w-14 text-center border-r border-slate-200">Sexe</th>
                                                    <th className="py-1.5 px-2 w-28 border-r border-slate-200">Date Règlement / Réf</th>
                                                    <th className="py-1.5 px-2 w-32 border-r border-slate-200 text-center bg-amber-50/70">
                                                        Taille / Mensurations
                                                    </th>
                                                    <th className="py-1.5 px-2 w-24 text-center bg-slate-50">
                                                        Livré / Émargé
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {groupe.eleves.map((insc, index) => {
                                                    const eleve = insc.eleve || {};
                                                    const user = eleve.user || {};
                                                    const tenue = insc.tenue_info || {};
                                                    const isFille = eleve.sexe?.toUpperCase() === 'F';

                                                    return (
                                                        <tr key={insc.id} className="hover:bg-slate-50">
                                                            <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                                                                {index + 1}
                                                            </td>
                                                            <td className="py-1.5 px-2 font-mono font-bold text-slate-800 border-r border-slate-200">
                                                                {eleve.matricule || '-'}
                                                            </td>
                                                            <td className="py-1.5 px-2 font-bold uppercase text-slate-900 border-r border-slate-200">
                                                                {user.nom} {user.prenom}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center font-extrabold border-r border-slate-200">
                                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${
                                                                    isFille 
                                                                        ? 'bg-pink-100 text-pink-800 border border-pink-200' 
                                                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                }`}>
                                                                    {isFille ? 'Fille' : 'Garçon'}
                                                                </span>
                                                            </td>
                                                            <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200 font-mono text-[9.5px]">
                                                                <div>{tenue.date_paiement}</div>
                                                                <div className="text-[8px] text-slate-400 truncate">{tenue.numero_recu}</div>
                                                            </td>
                                                            {/* Colonne réservée au tailleur pour noter la taille ou retouche */}
                                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center bg-amber-50/20">
                                                                <div className="h-4 border-b border-dashed border-slate-300"></div>
                                                            </td>
                                                            {/* Colonne émargement avec case à cocher */}
                                                            <td className="py-1.5 px-2 text-center">
                                                                <div className="inline-flex items-center justify-center w-4 h-4 rounded border border-slate-400"></div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-xl">
                                Aucune tenue scolaire payée trouvée pour les critères sélectionnés.
                            </div>
                        )}
                    </div>
                ) : (
                    /* VUE GLOBALE CONTINUE */
                    <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-left text-[10px] border-collapse">
                            <thead>
                                <tr className="bg-slate-800 text-white uppercase font-extrabold text-[9px]">
                                    <th className="py-1.5 px-2 w-8 text-center border-r border-slate-700">N°</th>
                                    <th className="py-1.5 px-2 w-24 border-r border-slate-700">Matricule</th>
                                    <th className="py-1.5 px-2 border-r border-slate-700">Nom & Prénom Élève</th>
                                    <th className="py-1.5 px-2 w-14 text-center border-r border-slate-700">Sexe</th>
                                    <th className="py-1.5 px-2 w-28 border-r border-slate-700">Classe</th>
                                    <th className="py-1.5 px-2 w-28 border-r border-slate-700">Date Règlement</th>
                                    <th className="py-1.5 px-2 w-32 border-r border-slate-700 text-center bg-slate-900">
                                        Taille / Mensurations
                                    </th>
                                    <th className="py-1.5 px-2 w-24 text-center bg-slate-900">
                                        Livré / Émargé
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInscriptions.map((insc, index) => {
                                    const eleve = insc.eleve || {};
                                    const user = eleve.user || {};
                                    const classe = insc.classe || {};
                                    const tenue = insc.tenue_info || {};
                                    const isFille = eleve.sexe?.toUpperCase() === 'F';

                                    return (
                                        <tr key={insc.id} className="hover:bg-slate-50">
                                            <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                                                {index + 1}
                                            </td>
                                            <td className="py-1.5 px-2 font-mono font-bold text-slate-800 border-r border-slate-200">
                                                {eleve.matricule || '-'}
                                            </td>
                                            <td className="py-1.5 px-2 font-bold uppercase text-slate-900 border-r border-slate-200">
                                                {user.nom} {user.prenom}
                                            </td>
                                            <td className="py-1.5 px-2 text-center font-extrabold border-r border-slate-200">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${
                                                    isFille 
                                                        ? 'bg-pink-100 text-pink-800 border border-pink-200' 
                                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                }`}>
                                                    {isFille ? 'F' : 'M'}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2 font-bold text-slate-800 border-r border-slate-200">
                                                {classe.nom || '-'}
                                            </td>
                                            <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200 font-mono text-[9.5px]">
                                                {tenue.date_paiement}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center bg-amber-50/20">
                                                <div className="h-4 border-b border-dashed border-slate-300"></div>
                                            </td>
                                            <td className="py-1.5 px-2 text-center">
                                                <div className="inline-flex items-center justify-center w-4 h-4 rounded border border-slate-400"></div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SIGNATURES OFFICIELLES & DÉCHARGE DE COMMANDE */}
                <div className="mt-8 pt-4 border-t-2 border-slate-400 print-break-inside-avoid">
                    <div className="grid grid-cols-2 gap-12 text-xs">
                        {/* Direction de l'Établissement */}
                        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
                            <span className="font-extrabold uppercase text-slate-800 block text-[10px]">
                                Pour l'Établissement (Donneur d'Ordre)
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Visa, Date & Cachet de la Direction :
                            </p>
                            <div className="h-20 flex items-end">
                                <span className="text-[9px] text-slate-400 italic font-mono">Date : _____/_____/20____</span>
                            </div>
                        </div>

                        {/* Fournisseur / Tailleur */}
                        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50">
                            <span className="font-extrabold uppercase text-slate-800 block text-[10px]">
                                Pour le Fournisseur / Confectionneur (Accusé de Réception)
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Nom du Responsable, Date & Signature :
                            </p>
                            <div className="h-20 flex items-end">
                                <span className="text-[9px] text-slate-400 italic font-mono">Date : _____/_____/20____</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-[9px] text-slate-400 font-mono">
                        Document officiel certifié généré par {etablissement?.nom || 'BUYEDI'} • Impression au format A4
                    </div>
                </div>

            </div>
        </div>
    );
}
