import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    Printer, 
    ArrowLeft, 
    Download, 
    Users, 
    School, 
    Filter, 
    Calendar, 
    Search,
    X,
    FileSpreadsheet,
    FileText, 
    CheckCircle2, 
    Building2,
    ShieldCheck,
    Layers,
    Sparkles 
} from 'lucide-react';
import useTranslation from '@/Hooks/useTranslation';

export default function Registre({
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
    const [orientation, setOrientation] = useState('portrait'); // 'portrait' | 'landscape'
    const [selectedClasse, setSelectedClasse] = useState(filters.classe_id || '');
    const [selectedSexe, setSelectedSexe] = useState(filters.sexe || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handlePrint = () => {
        window.print();
    };

    const handleFilterChange = (newFilters) => {
        router.get(
            route('inscriptions.registre'),
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

    const calculateAge = (birthDateStr) => {
        if (!birthDateStr) return '';
        const birth = new Date(birthDateStr);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age > 0 ? `(${age} ans)` : '';
    };

    // Filtrage instantané côté client (recherche + classe + sexe)
    const filteredInscriptions = useMemo(() => {
        return inscriptions.filter((insc) => {
            const eleve = insc.eleve || {};
            const user = eleve.user || {};
            const classe = insc.classe || {};
            const parent = eleve.parents?.[0] || {};
            const parentUser = parent.user || {};

            // Filtre classe
            if (selectedClasse && String(insc.classe_id) !== String(selectedClasse)) {
                return false;
            }

            // Filtre sexe
            if (selectedSexe && eleve.sexe?.toUpperCase() !== selectedSexe.toUpperCase()) {
                return false;
            }

            // Filtre recherche
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const nom = (user.nom || '').toLowerCase();
                const prenom = (user.prenom || '').toLowerCase();
                const matricule = (eleve.matricule || '').toLowerCase();
                const classeNom = (classe.nom || '').toLowerCase();
                const parentNom = (parentUser.nom || parent.nom_complet || '').toLowerCase();
                const tel = (parent.telephone || user.telephone || '').toLowerCase();

                return nom.includes(term) ||
                    prenom.includes(term) ||
                    matricule.includes(term) ||
                    classeNom.includes(term) ||
                    parentNom.includes(term) ||
                    tel.includes(term);
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

        // Si recherche ou filtre sexe actif, ré-adapter les élèves de chaque classe
        return baseClasses.map(group => {
            const matchingEleves = group.eleves.filter(insc => {
                const eleve = insc.eleve || {};
                const user = eleve.user || {};
                const parent = eleve.parents?.[0] || {};
                const parentUser = parent.user || {};

                if (selectedSexe && eleve.sexe?.toUpperCase() !== selectedSexe.toUpperCase()) {
                    return false;
                }

                if (searchTerm.trim()) {
                    const term = searchTerm.toLowerCase();
                    const nom = (user.nom || '').toLowerCase();
                    const prenom = (user.prenom || '').toLowerCase();
                    const matricule = (eleve.matricule || '').toLowerCase();
                    const parentNom = (parentUser.nom || parent.nom_complet || '').toLowerCase();
                    return nom.includes(term) || prenom.includes(term) || matricule.includes(term) || parentNom.includes(term);
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

    // Export CSV compatible Excel
    const handleExportCSV = () => {
        const headers = ["N°", "Matricule", "Nom", "Prénom", "Sexe", "Date Naissance", "Classe", "Statut Inscription", "Parent / Responsable", "Téléphone Parent"];
        
        const rows = filteredInscriptions.map((item, index) => {
            const eleve = item.eleve || {};
            const user = eleve.user || {};
            const parent = eleve.parents?.[0] || {};
            const parentUser = parent.user || {};
            const parentNom = parentUser.nom ? `${parentUser.prenom || ''} ${parentUser.nom}`.trim() : (parent.nom_complet || '-');

            return [
                index + 1,
                eleve.matricule || '-',
                user.nom || '-',
                user.prenom || '-',
                eleve.sexe ? eleve.sexe.toUpperCase() : '-',
                eleve.date_naissance ? formatDate(eleve.date_naissance) : '-',
                item.classe?.nom || 'Non assignée',
                item.statut === 'validee' ? 'Validée' : (item.statut || 'En attente'),
                parentNom,
                parent.telephone || user.telephone || '-',
            ];
        });

        const csvContent = [
            headers.join(";"),
            ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const anneeNom = anneeActive?.nom ? anneeActive.nom.replace(/[^a-zA-Z0-9]/g, '_') : 'annee_en_cours';
        link.setAttribute("href", url);
        link.setAttribute("download", `registre_eleves_inscrits_${anneeNom}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-6 px-3 sm:px-6 flex flex-col items-center print:bg-white print:p-0 print:m-0 font-sans">
            <Head title={`Registre Officiel des Inscrits - ${anneeActive?.nom || 'Année en cours'} - Buyedi`} />

            {/* STYLES SPÉCIFIQUES POUR L'IMPRESSION A4 INSTITUTIONNELLE */}
            <style>{`
                @media print {
                    @page {
                        size: A4 ${orientation};
                        margin: 8mm 8mm;
                    }
                    html, body {
                        background: white !important;
                        height: 100% !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-size: 10px;
                        color: #0f172a !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        break-after: page;
                        page-break-after: always;
                    }
                    .avoid-break {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            {/* BARRE D'ACTIONS ET FILTRES (MASQUÉE À L'IMPRESSION) */}
            <div className={`w-full ${orientation === 'landscape' ? 'max-w-[297mm]' : 'max-w-[215mm]'} mb-6 flex flex-col gap-3.5 no-print transition-all duration-300`}>
                
                {/* Ligne 1 : Navigation, Bascule de vue, Format Papier et Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            href={route('inscriptions.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Retour Inscriptions</span>
                        </Link>

                        <Link
                            href={route('inscriptions.tenues.fournisseur')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                            <span>👕 Bon Fournisseur Tenues</span>
                        </Link>

                        {/* Commutateur de vue : Par Classe ou Global */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setViewMode('classe')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    viewMode === 'classe'
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                🏫 Par Classe
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('global')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    viewMode === 'global'
                                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                📋 Registre Général (A-Z)
                            </button>
                        </div>

                        {/* Sélecteur de format papier (Portrait vs Paysage) */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setOrientation('portrait')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    orientation === 'portrait'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Format A4 Vertical standard"
                            >
                                📄 Portrait
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrientation('landscape')}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    orientation === 'landscape'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Format A4 Horizontal panoramique (recommandé pour tables larges)"
                            >
                                📑 Paysage
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                            title="Télécharger un tableau CSV compatible Microsoft Excel"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Export Excel</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimer ({orientation === 'portrait' ? 'Portrait' : 'Paysage'})</span>
                        </button>
                    </div>
                </div>

                {/* Ligne 2 : Barre de Recherche en direct & Filtres interactifs */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-xs">
                    
                    {/* Recherche instantanée */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par nom, prénom, matricule ou parent..."
                            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filtre Classe */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Classe :</span>
                            <select
                                value={selectedClasse}
                                onChange={(e) => setSelectedClasse(e.target.value)}
                                className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">🏫 Toutes les classes ({stats.nb_classes})</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre Sexe */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Sexe :</span>
                            <select
                                value={selectedSexe}
                                onChange={(e) => setSelectedSexe(e.target.value)}
                                className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Tous les sexes</option>
                                <option value="M">👦 Garçons ({stats.garcons})</option>
                                <option value="F">👧 Filles ({stats.filles})</option>
                            </select>
                        </div>

                        {/* Année scolaire */}
                        {annees.length > 1 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">Année :</span>
                                <select
                                    value={filters.annee_scolaire_id || anneeActive?.id || ''}
                                    onChange={(e) => handleFilterChange({ annee_scolaire_id: e.target.value })}
                                    className="py-1.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                                >
                                    {annees.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.nom} {a.en_cours ? '(Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DOCUMENT OFFICIEL D'IMPRESSION (FORMAT A4 DYNAMIQUE) */}
            <div className={`w-full ${
                orientation === 'landscape'
                    ? 'max-w-[297mm] min-h-[210mm] print:min-h-[190mm]'
                    : 'max-w-[215mm] min-h-[297mm] print:min-h-[277mm]'
            } bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none relative flex flex-col justify-between transition-all duration-300`}>
                
                {/* Filigrane d'authentification en arrière-plan */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none font-black text-8xl tracking-widest uppercase">
                    {etablissement?.sigle || etablissement?.nom || 'BUYEDI'}
                </div>

                {/* 1. EN-TÊTE OFFICIEL DE L'ÉTABLISSEMENT */}
                <div className="border-b-2 border-slate-900 pb-4 mb-5 relative z-10">
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2.5 flex items-center justify-between border-b border-slate-100 pb-1">
                        <span>Ministère de l'Éducation Nationale • République & Démocratie</span>
                        <span className="font-mono">Document Administratif Certifié</span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        {/* Logo & École */}
                        <div className="flex items-center gap-3.5">
                            {etablissement?.logo ? (
                                <img
                                    src={`/storage/${etablissement.logo}`}
                                    alt="Logo"
                                    className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-1"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center">
                                    {etablissement?.sigle?.substring(0, 2) || 'BY'}
                                </div>
                            )}

                            <div>
                                <h2 className="text-base font-black uppercase tracking-tight text-slate-900 leading-none">
                                    {etablissement?.nom || 'Établissement Scolaire'}
                                </h2>
                                {etablissement?.sigle && (
                                    <span className="text-xs font-bold text-indigo-700 tracking-wider">
                                        {etablissement.sigle}
                                    </span>
                                )}
                                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                                    {[etablissement?.adresse, etablissement?.telephone, etablissement?.email].filter(Boolean).join(' • ')}
                                </p>
                            </div>
                        </div>

                        {/* Titre & Année */}
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 tracking-wider mb-1">
                                Annuaire Matriculaire & Registre Scolaire
                            </span>
                            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                REGISTRE DES ÉLÈVES INSCRITS
                            </h1>
                            <span className="text-xs font-bold text-slate-700 mt-0.5">
                                Année Scolaire : <strong className="text-indigo-900">{anneeActive?.nom || 'En cours'}</strong>
                            </span>
                        </div>
                    </div>

                    {/* BANDEAU SYNTHÈSE STATISTIQUE AVEC JAUGE DE PARITÉ */}
                    <div className="mt-4 pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-slate-50 print:bg-slate-100/60 p-2 rounded-lg border border-slate-200">
                                <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Effectif Total</span>
                                <span className="text-base font-black text-slate-900">{stats.total} Élèves</span>
                            </div>
                            <div className="bg-slate-50 print:bg-slate-100/60 p-2 rounded-lg border border-slate-200">
                                <span className="text-[9.5px] font-bold text-blue-600 uppercase block">Garçons (M)</span>
                                <span className="text-base font-black text-blue-900">{stats.garcons} ({stats.total > 0 ? Math.round((stats.garcons / stats.total) * 100) : 0}%)</span>
                            </div>
                            <div className="bg-slate-50 print:bg-slate-100/60 p-2 rounded-lg border border-slate-200">
                                <span className="text-[9.5px] font-bold text-emerald-600 uppercase block">Filles (F)</span>
                                <span className="text-base font-black text-emerald-900">{stats.filles} ({stats.total > 0 ? Math.round((stats.filles / stats.total) * 100) : 0}%)</span>
                            </div>
                            <div className="bg-slate-50 print:bg-slate-100/60 p-2 rounded-lg border border-slate-200">
                                <span className="text-[9.5px] font-bold text-purple-600 uppercase block">Classes Actives</span>
                                <span className="text-base font-black text-purple-900">{stats.nb_classes} Classes</span>
                            </div>
                        </div>

                        {/* Mini barre visuelle de répartition filles/garçons */}
                        {stats.total > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-[9.5px] text-slate-500">
                                <span className="font-bold text-blue-700">👦 {Math.round((stats.garcons / stats.total) * 100)}%</span>
                                <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${(stats.garcons / stats.total) * 100}%` }} className="bg-blue-600 h-full"></div>
                                    <div style={{ width: `${(stats.filles / stats.total) * 100}%` }} className="bg-emerald-500 h-full"></div>
                                </div>
                                <span className="font-bold text-emerald-700">👧 {Math.round((stats.filles / stats.total) * 100)}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. CORPS DE LA LISTE */}
                <div className="flex-1 flex flex-col mb-6">
                    {/* CAS A : VUE PAR CLASSE */}
                    {viewMode === 'classe' ? (
                        <div className="space-y-6 relative z-10 flex-1">
                            {displayedParClasse.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500">
                                    Aucun élève inscrit trouvé pour les critères sélectionnés.
                                </div>
                            ) : (
                                displayedParClasse.map((classeGroup, cIdx) => (
                                    <div key={classeGroup.classe_id || cIdx} className={`space-y-2 mb-6 ${cIdx < displayedParClasse.length - 1 ? 'page-break' : ''}`}>
                                    {/* Titre de section de classe */}
                                    <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <School className="w-4 h-4 text-amber-300" />
                                            <span>Classe : {classeGroup.classe_nom}</span>
                                        </div>
                                        <div className="text-[11px] font-medium flex items-center gap-3">
                                            <span>Effectif : <strong className="text-amber-300">{classeGroup.effectif}</strong></span>
                                            <span>👦 {classeGroup.garcons} G</span>
                                            <span>👧 {classeGroup.filles} F</span>
                                        </div>
                                    </div>

                                    {/* Tableau des élèves de la classe */}
                                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                        <table className="w-full text-left text-[11px] border-collapse">
                                            <thead>
                                                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9.5px] border-b border-slate-200">
                                                    <th className="py-2 px-2.5 w-8 text-center">N°</th>
                                                    <th className="py-2 px-2.5 w-24">Matricule</th>
                                                    <th className="py-2 px-2.5">Nom & Prénoms</th>
                                                    <th className="py-2 px-2 w-12 text-center">Sexe</th>
                                                    <th className="py-2 px-2.5 w-32">Né(e) le</th>
                                                    <th className="py-2 px-2.5">Parent / Contact</th>
                                                    <th className="py-2 px-2.5 w-20 text-center">Statut</th>
                                                    {orientation === 'landscape' && (
                                                        <th className="py-2 px-2.5 w-28 text-center">Émargement</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {classeGroup.eleves.map((insc, idx) => {
                                                    const eleve = insc.eleve || {};
                                                    const user = eleve.user || {};
                                                    const parent = eleve.parents?.[0] || {};
                                                    const parentUser = parent.user || {};
                                                    const parentNom = parentUser.nom ? `${parentUser.prenom || ''} ${parentUser.nom}`.trim() : (parent.nom_complet || '-');

                                                    return (
                                                        <tr key={insc.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                                                            <td className="py-1.5 px-2.5 text-center font-bold text-slate-500">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="py-1.5 px-2.5 font-mono font-bold text-slate-800 text-[10.5px]">
                                                                {eleve.matricule || '-'}
                                                            </td>
                                                            <td className="py-1.5 px-2.5 font-bold uppercase text-slate-900">
                                                                {user.nom} <span className="font-semibold capitalize text-slate-700">{user.prenom}</span>
                                                            </td>
                                                            <td className="py-1.5 px-2 text-center font-bold">
                                                                <span className={eleve.sexe?.toUpperCase() === 'F' ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                                                                    {eleve.sexe ? eleve.sexe.toUpperCase() : '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-1.5 px-2.5 text-slate-700">
                                                                {eleve.date_naissance ? (
                                                                    <span>
                                                                        {formatDate(eleve.date_naissance)}{' '}
                                                                        <span className="text-[9.5px] text-slate-500">{calculateAge(eleve.date_naissance)}</span>
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="py-1.5 px-2.5 text-slate-700">
                                                                <span className="block font-medium truncate max-w-[170px]">{parentNom}</span>
                                                                <span className="text-[10px] text-slate-500 font-mono">
                                                                    {parent.telephone || user.telephone || ''}
                                                                </span>
                                                            </td>
                                                            <td className="py-1.5 px-2.5 text-center">
                                                                <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                                                                    insc.statut === 'validee'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {insc.statut === 'validee' ? 'Validé' : (insc.statut || 'En cours')}
                                                                </span>
                                                            </td>
                                                            {orientation === 'landscape' && (
                                                                <td className="py-1.5 px-2.5 text-center text-slate-300 italic text-[9px]">
                                                                    ....................
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    /* CAS B : REGISTRE GÉNÉRAL DE TOUTE L'ÉCOLE (A À Z) */
                    <div className="overflow-x-auto border border-slate-200 rounded-lg relative z-10 flex-1">
                        <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                                <tr className="bg-slate-800 text-white font-bold uppercase text-[9.5px]">
                                    <th className="py-2 px-2.5 w-10 text-center">N°</th>
                                    <th className="py-2 px-2.5 w-24">Matricule</th>
                                    <th className="py-2 px-2.5">Nom & Prénoms de l'Élève</th>
                                    <th className="py-2 px-2 w-12 text-center">Sexe</th>
                                    <th className="py-2 px-2.5 w-24">Classe</th>
                                    <th className="py-2 px-2.5 w-28">Date Naissance</th>
                                    <th className="py-2 px-2.5">Responsable Légal</th>
                                    <th className="py-2 px-2.5 w-24">Téléphone</th>
                                    {orientation === 'landscape' && (
                                        <th className="py-2 px-2.5 w-24 text-center">Statut</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInscriptions.map((insc, idx) => {
                                    const eleve = insc.eleve || {};
                                    const user = eleve.user || {};
                                    const parent = eleve.parents?.[0] || {};
                                    const parentUser = parent.user || {};
                                    const parentNom = parentUser.nom ? `${parentUser.prenom || ''} ${parentUser.nom}`.trim() : (parent.nom_complet || '-');

                                    return (
                                        <tr key={insc.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                                            <td className="py-1.5 px-2.5 text-center font-bold text-slate-500">
                                                {idx + 1}
                                            </td>
                                            <td className="py-1.5 px-2.5 font-mono font-bold text-slate-800 text-[10px]">
                                                {eleve.matricule || '-'}
                                            </td>
                                            <td className="py-1.5 px-2.5 font-bold uppercase text-slate-900">
                                                {user.nom} <span className="font-semibold capitalize text-slate-700">{user.prenom}</span>
                                            </td>
                                            <td className="py-1.5 px-2 text-center font-bold">
                                                <span className={eleve.sexe?.toUpperCase() === 'F' ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
                                                    {eleve.sexe ? eleve.sexe.toUpperCase() : '-'}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2.5 font-bold text-indigo-900">
                                                {insc.classe?.nom || 'Non assignée'}
                                            </td>
                                            <td className="py-1.5 px-2.5 text-slate-700">
                                                {eleve.date_naissance ? formatDate(eleve.date_naissance) : '-'}
                                            </td>
                                            <td className="py-1.5 px-2.5 text-slate-700 font-medium truncate max-w-[160px]">
                                                {parentNom}
                                            </td>
                                            <td className="py-1.5 px-2.5 font-mono text-[10px] text-slate-600">
                                                {parent.telephone || user.telephone || '-'}
                                            </td>
                                            {orientation === 'landscape' && (
                                                <td className="py-1.5 px-2.5 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                        insc.statut === 'validee'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {insc.statut === 'validee' ? 'Validé' : (insc.statut || 'En cours')}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                </div>

                {/* 3. PIED DE PAGE OFFICIEL AVEC SIGNATURES */}
                <div className="avoid-break mt-auto pt-6 border-t border-slate-300 text-xs relative z-10">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-5">
                        <span>Fait à {etablissement?.ville || 'Libreville'}, le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        <span>Document certifié conforme • BUYEDI School Management</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div className="border border-slate-300 rounded-xl p-4 h-28 flex flex-col justify-between bg-slate-50/40 print:bg-transparent">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                Le Secrétaire Administratif
                            </span>
                            <span className="text-[10px] text-slate-400 italic">Signature</span>
                        </div>

                        <div className="border border-slate-300 rounded-xl p-4 h-28 flex flex-col justify-between bg-slate-50/40 print:bg-transparent">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                Le Chef d'Établissement / La Direction
                            </span>
                            <span className="text-[10px] text-slate-400 italic">Date, Visa et Cachet officiel</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
