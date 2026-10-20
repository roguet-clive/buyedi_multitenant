import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    School,
    ShieldCheck,
    CreditCard,
    FileText,
    Users,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    ExternalLink,
    Zap,
    TrendingUp,
    BarChart3,
    GraduationCap,
    Clock,
    Lock,
    Globe2,
    Check,
    ChevronDown,
    ChevronUp,
    Star,
    Phone,
    Mail,
    MapPin,
    QrCode,
    Sliders,
    Building2,
    Calendar,
    Send,
    MessageCircle,
    Database,
    Bell,
    CheckCircle,
    Smartphone,
    Award,
    Headphones,
    RefreshCw
} from 'lucide-react';

export default function Landing({ tenants = [], pricing = {} }) {
    // 🎛️ États interactifs
    const [billingAnnual, setBillingAnnual] = useState(true);
    const [activeTab, setActiveTab] = useState('finances');
    const [simulatedStudents, setSimulatedStudents] = useState(450);
    const [openFaq, setOpenFaq] = useState(0);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [demoSent, setDemoSent] = useState(false);
    const [mockupTab, setMockupTab] = useState('recouvrement'); // 'recouvrement' | 'transactions' | 'eleves'
    const [qrScanned, setQrScanned] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [smsSent, setSmsSent] = useState(false);
    const [demoForm, setDemoForm] = useState({
        nom: '',
        ecole: '',
        email: '',
        telephone: '',
        eleves: '300-600',
        message: '',
    });

    const triggerQrScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setQrScanned(true);
        }, 1200);
    };

    const triggerSmsReminders = () => {
        setSmsSent(true);
        setTimeout(() => {
            setSmsSent(false);
        }, 3500);
    };

    // 💰 Calculs dynamiques du simulateur de ROI
    const timeSavedHours = Math.round(simulatedStudents * 0.16);
    const moneyRecovered = (simulatedStudents * 8333).toLocaleString('fr-FR');
    const paperSavings = (simulatedStudents * 1450).toLocaleString('fr-FR');

    const handleSchoolRedirect = (domain) => {
        if (!domain) return;
        const port = window.location.port ? `:${window.location.port}` : '';
        window.location.href = `http://${domain}${port}/login`;
    };

    const handleDemoSubmit = (e) => {
        e.preventDefault();
        setDemoSent(true);
    };

    // 🌟 Éléments de la Marquee qui défile en continu (Image de référence utilisateur)
    const marqueeItems = [
        { icon: ShieldCheck, text: "Base de données MySQL 100% isolée par école" },
        { icon: QrCode, text: "Reçus de paiement certifiés avec QR Code infalsifiable" },
        { icon: GraduationCap, text: "Bulletins conformes aux normes ministérielles MEN" },
        { icon: Smartphone, text: "Portail mobile parents & alertes SMS automatiques" },
        { icon: Zap, text: "Déploiement automatique de votre école en moins de 60 secondes" },
        { icon: Award, text: "15 jours d'essai gratuit offert sans carte bancaire" },
        { icon: Database, text: "Sauvegardes automatiques quotidiennes sur cloud privé" },
        { icon: BarChart3, text: "Comptabilité & journal de caisse en temps réel" },
        { icon: Headphones, text: "Support technique VIP 7j/7 dédié aux écoles" },
        { icon: Lock, text: "Étanchéité totale des données & sécurité certifiée" },
    ];

    // 📦 Données des onglets de modules
    const modulesData = {
        scolarite: {
            title: "Gestion Scolaire & Inscriptions simplifiées",
            desc: "Centralisez tous les dossiers élèves, gérez les affectations de classes et délivrez les certificats de scolarité en un clic.",
            bullets: [
                "Dossier élève complet avec historique médical et administratif",
                "Gestion multi-cycles : Maternelle, Primaire, Collège et Lycée",
                "Édition instantanée des certificats, attestations et billets de sortie"
            ],
            table: [
                { col1: "Inscriptions validées", col2: "542 élèves inscrits", badge: "Validé", badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { col1: "Classes actives", col2: "18 classes réparties", badge: "Actif", badgeColor: "bg-blue-50 text-blue-700 border border-blue-200" },
                { col1: "Dossiers complets", col2: "96.4% de conformité", badge: "Conforme", badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
            ]
        },
        finances: {
            title: "Suivi instantané de vos recettes et de la trésorerie",
            desc: "Paiements échelonnés en tranches ou mensualités. Éradiquez les fraudes grâce aux reçus officiels infalsifiables avec QR Code certifié.",
            bullets: [
                "Calcul automatique des impayés et relances financières ciblées",
                "Génération de reçus officiels avec QR Code sécurisé et vérifiable",
                "Journal de caisse complet avec export comptable automatisé"
            ],
            table: [
                { col1: "Scolarité Tranche 1", col2: "120 000 F CFA", badge: "Payé (QR Validé)", badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { col1: "Frais d'inscription", col2: "35 000 F CFA", badge: "Payé", badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { col1: "Cantine & Transport", col2: "45 000 F CFA", badge: "En attente", badgeColor: "bg-amber-50 text-amber-700 border border-amber-200" },
            ]
        },
        bulletins: {
            title: "Bulletins de notes officiels conformes aux normes MEN",
            desc: "Calcul instantané des moyennes trimestrielles et semestrielles, coefficients officiels, rangs, appréciations et conseils de classe.",
            bullets: [
                "Saisie intuitive des notes par matière pour les enseignants",
                "Génération PDF en masse des bulletins officiels prêts pour impression",
                "Tableau d'honneur, avertissements et statistiques de réussite"
            ],
            table: [
                { col1: "Trimestre 1 (Général)", col2: "Moyenne 13.8 / 20", badge: "Généré", badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { col1: "Taux de réussite", col2: "89.4% admis", badge: "Excellent", badgeColor: "bg-blue-50 text-blue-700 border border-blue-200" },
                { col1: "Conseils de classe", col2: "18 / 18 validés", badge: "Clôturé", badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
            ]
        },
        parents: {
            title: "Portail Parents & Communication SMS en direct",
            desc: "Offrez aux parents une expérience moderne : consultation des notes, suivi des absences et état des paiements depuis leur smartphone.",
            bullets: [
                "Accès mobile dédié pour chaque parent d'élève",
                "Alertes instantanées par SMS en cas de retard ou d'absence",
                "Téléchargement direct des reçus et des bulletins scolaires"
            ],
            table: [
                { col1: "Comptes parents actifs", col2: "710 parents connectés", badge: "Connecté", badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { col1: "Notifications envoyées", col2: "1 420 SMS envoyés", badge: "Délivré", badgeColor: "bg-blue-50 text-blue-700 border border-blue-200" },
                { col1: "Taux d'ouverture", col2: "99.1% d'engagement", badge: "Record", badgeColor: "bg-purple-50 text-purple-700 border border-purple-200" },
            ]
        },
        rh: {
            title: "Ressources Humaines & Paie des enseignants",
            desc: "Gérez les contrats du personnel, le suivi des heures de vacation, et générez les fiches de paie en conformité avec la réglementation.",
            bullets: [
                "Contrats enseignants permanents et vacataires avec taux horaires",
                "Calcul automatisé des salaires nets, cotisations et acomptes",
                "Impression sécurisée des fiches de paie et registres du personnel"
            ],
            table: [
                { col1: "Masse salariale mensuelle", col2: "3 850 000 F CFA", badge: "Payé", badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
                { col1: "Enseignants vacataires", col2: "24 professeurs", badge: "Validé", badgeColor: "bg-blue-50 text-blue-700 border border-blue-200" },
                { col1: "Bulletins de paie", col2: "32 fiches générées", badge: "Archivé", badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
            ]
        }
    };

    const faqs = [
        {
            q: "Comment fonctionne la période d'essai gratuit de 14 jours ?",
            a: "Dès que vous créez votre école, votre espace dédié et sa base de données MySQL isolée sont instantanément provisionnés. Vous bénéficiez de 14 jours d'accès total à toutes les fonctionnalités sans aucune restriction et sans carte bancaire."
        },
        {
            q: "Nos données scolaires sont-elles réellement sécurisées et séparées des autres écoles ?",
            a: "Oui, à 100%. Buyedi utilise une architecture d'entreprise Multi-Tenant avec une base de données MySQL strictement dédiée à votre établissement. Aucune autre école ne peut accéder à vos données, et vos sauvegardes sont totalement indépendantes."
        },
        {
            q: "Pouvons-nous importer nos élèves et classes déjà enregistrés sous Excel ?",
            a: "Absolument. Buyedi intègre un assistant d'importation Excel / CSV pour charger en quelques clics l'ensemble de vos élèves, parents, enseignants et classes existants. Notre équipe support peut également vous assister gratuitement."
        },
        {
            q: "Quels sont les modes de paiement acceptés pour l'abonnement SaaS ?",
            a: "Nous acceptons les règlements par Airtel Money, Moov Money, Virement bancaire, Chèque ou Carte bancaire. Les factures sont émises avec quittance officielle."
        },
        {
            q: "Comment contacter le support technique en cas de besoin ?",
            a: "Notre service client basé à Libreville est joignable 6 jours sur 7 par WhatsApp direct, téléphone et email. Pour les formules Pro et Entreprise, une assistance prioritaire est assurée sous 30 minutes."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
            <Head title="Buyedi SaaS - Pilotez votre établissement vers l'excellence numérique" />

            {/* 🧭 NAVIGATION BAR ÉLÉGANTE */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/images/logo.png"
                            alt="Logo Buyedi"
                            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="hidden w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white font-black text-xl shadow-md">
                            B
                        </div>
                    </Link>

                    {/* Liens Centraux */}
                    <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
                        <a href="#accueil" className="text-blue-600 hover:text-blue-700 transition">Accueil</a>
                        <a href="#piliers" className="hover:text-blue-600 transition">Pourquoi Buyedi</a>
                        <a href="#modules" className="hover:text-blue-600 transition">Fonctionnalités</a>
                        <a href="#simulateur" className="hover:text-blue-600 transition">Calculateur ROI</a>
                        <a href="#tarifs" className="hover:text-blue-600 transition">Tarifs</a>
                        <a href="#temoignages" className="hover:text-blue-600 transition">Témoignages</a>
                        <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
                    </div>

                    {/* Actions de Droite */}
                    <div className="flex items-center gap-3">
                        {/* Sélecteur d'école démo pour tester les sous-domaines */}
                        {tenants.length > 0 && (
                            <div className="hidden sm:block">
                                <select
                                    value={selectedSchool}
                                    onChange={(e) => {
                                        setSelectedSchool(e.target.value);
                                        handleSchoolRedirect(e.target.value);
                                    }}
                                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-blue-600 cursor-pointer hover:bg-slate-100 transition"
                                >
                                    <option value="">🏫 Accéder à mon école...</option>
                                    {tenants.map((t) => (
                                        <option key={t.id} value={t.domain}>
                                            {t.nom} ({t.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <a
                            href="#demo"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition hover:border-slate-300"
                        >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Prendre contact</span>
                        </a>

                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>Créer mon école</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 🚀 HERO SECTION (Ultra dynamique & fidèle à l'image) */}
            <section id="accueil" className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Colonne Gauche : Titre & Promesse */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-7 space-y-6 text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Plateforme de Gestion Scolaire & Financière</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                                Pilotez votre <br />
                                <span className="text-slate-900">établissement vers</span> <br />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                    l'excellence numérique.
                                </span>
                            </h1>

                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                                Simplifiez la gestion scolaire, optimisez vos finances et offrez une expérience moderne aux parents et élèves. La solution tout-en-un conçue pour les écoles de demain.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                                <Link
                                    href="/onboarding"
                                    className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-xl shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    <span>Créer l'école de l'excellence</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <a
                                    href="#demo"
                                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm sm:text-base px-7 py-4 rounded-xl shadow-xs transition hover:border-slate-400"
                                >
                                    <span>Demander une démonstration</span>
                                </a>
                            </div>

                            {/* Avantages sous les CTAs */}
                            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>14 jours d'essai gratuit</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Sans carte bancaire</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span>Support réactif 24/7</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Colonne Droite : Mockup Interactif Flottant du Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="lg:col-span-5 relative"
                        >
                            <div className="relative mx-auto max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl shadow-blue-500/10 animate-float">
                                
                                {/* Header du Mockup */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Espace Scolaire Dédié</div>
                                        <div className="text-sm font-extrabold text-slate-900">CS Sagesse Divine</div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Établissement actif
                                    </span>
                                </div>

                                {/* Mini sélecteur d'onglets à l'intérieur du mockup */}
                                <div className="flex items-center gap-2 mt-4 bg-slate-50 p-1 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-600">
                                    <button
                                        onClick={() => setMockupTab('recouvrement')}
                                        className={`flex-1 py-1.5 rounded-lg transition-all ${mockupTab === 'recouvrement' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'hover:text-slate-900'}`}
                                    >
                                        Finance & Caisse
                                    </button>
                                    <button
                                        onClick={() => setMockupTab('transactions')}
                                        className={`flex-1 py-1.5 rounded-lg transition-all ${mockupTab === 'transactions' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'hover:text-slate-900'}`}
                                    >
                                        Reçu QR Code
                                    </button>
                                    <button
                                        onClick={() => setMockupTab('eleves')}
                                        className={`flex-1 py-1.5 rounded-lg transition-all ${mockupTab === 'eleves' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'hover:text-slate-900'}`}
                                    >
                                        Effectifs
                                    </button>
                                </div>

                                {/* Contenu dynamique selon l'onglet choisi */}
                                <AnimatePresence mode="wait">
                                    {mockupTab === 'recouvrement' && (
                                        <motion.div
                                            key="recouvrement"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="my-4 space-y-3"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-semibold text-slate-500">Recouvrement</div>
                                                    <div className="text-xl font-black text-slate-900 mt-0.5">88,2%</div>
                                                    <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                                                        <TrendingUp className="w-3 h-3" /> +4,3% ce mois
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-semibold text-slate-500">Caisse du Jour</div>
                                                    <div className="text-xl font-black text-slate-900 mt-0.5">1 450 000 F</div>
                                                    <div className="text-[10px] text-blue-600 font-bold mt-1">12 paiements validés</div>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="text-xs font-bold text-amber-900">Relance Tranche 2</div>
                                                    <div className="text-[11px] text-amber-700">14 retards identifiés</div>
                                                </div>
                                                <button
                                                    onClick={triggerSmsReminders}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                                                        smsSent
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                                                    }`}
                                                >
                                                    {smsSent ? '✓ 14 SMS transmis !' : '⚡ Relancer par SMS'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {mockupTab === 'transactions' && (
                                        <motion.div
                                            key="transactions"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="my-4 space-y-3"
                                        >
                                            <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-100 relative overflow-hidden">
                                                {isScanning && (
                                                    <motion.div
                                                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400 shadow-md shadow-blue-500 z-10"
                                                        animate={{ top: ['0%', '100%', '0%'] }}
                                                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                                    />
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                                                            <QrCode className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-900">Reçu Scolarité #REC-084</div>
                                                            <div className="text-[11px] text-slate-500">Élève : NDONG Alain (1ère C)</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-black text-slate-900">120 000 F</div>
                                                        <div className="text-[10px] font-bold text-emerald-600">
                                                            {qrScanned ? '✓ Conforme MEN' : 'Vérifiable'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-2.5 border-t border-blue-100/80 flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500 font-mono">Empreinte SHA-256 certifiée</span>
                                                    <button
                                                        onClick={triggerQrScan}
                                                        disabled={isScanning}
                                                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs flex items-center gap-1 cursor-pointer"
                                                    >
                                                        {isScanning ? (
                                                            <>
                                                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                                                <span>Scan en cours...</span>
                                                            </>
                                                        ) : qrScanned ? (
                                                            '✓ Reçu Authentifié'
                                                        ) : (
                                                            'Tester le scanner QR'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {mockupTab === 'eleves' && (
                                        <motion.div
                                            key="eleves"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="my-4 space-y-3"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-semibold text-slate-500">Effectifs Inscrits</div>
                                                    <div className="text-xl font-black text-slate-900 mt-0.5">842 élèves</div>
                                                    <div className="text-[10px] text-emerald-600 font-bold mt-1">100% dossiers à jour</div>
                                                </div>
                                                <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100">
                                                    <div className="text-[11px] font-semibold text-slate-500">Classes Actives</div>
                                                    <div className="text-xl font-black text-slate-900 mt-0.5">28 classes</div>
                                                    <div className="text-[10px] text-blue-600 font-bold mt-1">Maternelle au Lycée</div>
                                                </div>
                                            </div>

                                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                                                        KM
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900">Koumba Marc - Tle D</div>
                                                        <div className="text-[10px] text-indigo-700 font-semibold">Moyenne T1 : 15.2 / 20 • Tableau d'honneur</div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                                    À jour
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bouton Action du Mockup */}
                                <div className="mb-4">
                                    <Link
                                        href="/onboarding"
                                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all hover:shadow-lg"
                                    >
                                        <span>Créer l'espace de votre école</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                    <span>Sous-domaine : <strong>sagesse.buyedi.com</strong></span>
                                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Base isolée
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 📊 STATS BANNER (+20, +12 500, +35%, 98.2%) */}
            <section className="border-y border-slate-100 bg-slate-50/50 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-200">
                        <div className="space-y-1 hover:scale-105 transition-transform duration-200">
                            <div className="text-3xl sm:text-4xl font-black text-blue-600">+20</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-600">Établissements Partenaires</div>
                        </div>
                        <div className="space-y-1 hover:scale-105 transition-transform duration-200">
                            <div className="text-3xl sm:text-4xl font-black text-slate-900">+12 500</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-600">Élèves & Parents Gérés</div>
                        </div>
                        <div className="space-y-1 hover:scale-105 transition-transform duration-200">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600">+35%</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-600">Gain de temps administratif</div>
                        </div>
                        <div className="space-y-1 hover:scale-105 transition-transform duration-200">
                            <div className="text-3xl sm:text-4xl font-black text-indigo-600">98.2%</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-600">Taux de satisfaction client</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🌊 MARQUEE BLEUE QUI DÉFILE EN CONTINU (Exactement demandée par l'utilisateur !) */}
            <div className="bg-blue-600 text-white py-3.5 overflow-hidden shadow-inner select-none relative group border-y border-blue-500">
                {/* Dégradés latéraux pour estomper l'entrée et la sortie des éléments */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-blue-600 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue-600 to-transparent z-10" />

                <motion.div
                    className="flex items-center gap-10 font-bold text-xs sm:text-sm tracking-wide shrink-0 will-change-transform"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        ease: "linear",
                        duration: 35,
                        repeat: Infinity,
                    }}
                    style={{ width: "max-content" }}
                >
                    {/* Première boucle */}
                    {marqueeItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={`m1-${idx}`} className="flex items-center gap-2.5 shrink-0 hover:text-blue-200 transition-colors">
                                <span className="p-1 rounded-md bg-white/15 backdrop-blur-xs flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-white shrink-0" />
                                </span>
                                <span className="whitespace-nowrap font-medium text-white tracking-wide">{item.text}</span>
                                <span className="text-blue-300/70 ml-6">•</span>
                            </div>
                        );
                    })}

                    {/* Deuxième boucle pour assurer un défilement infini sans coupure */}
                    {marqueeItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={`m2-${idx}`} className="flex items-center gap-2.5 shrink-0 hover:text-blue-200 transition-colors">
                                <span className="p-1 rounded-md bg-white/15 backdrop-blur-xs flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-white shrink-0" />
                                </span>
                                <span className="whitespace-nowrap font-medium text-white tracking-wide">{item.text}</span>
                                <span className="text-blue-300/70 ml-6">•</span>
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {/* 🏛️ LES 4 PILIERS D'EXCELLENCE */}
            <section id="piliers" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">POURQUOI BUYEDI ?</div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Les 4 Piliers d'Excellence qui transforment votre école
                    </h2>
                    <p className="mt-3 text-slate-600 text-sm sm:text-base">
                        Découvrez pourquoi plus de 20 établissements font confiance à Buyedi au quotidien.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Pilier 1 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 font-bold shadow-xs">
                                <School className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mb-2">Gestion Administrative</h3>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                Inscriptions en 1 clic, gestion des classes, dossiers élèves complets et archivage sécurisé de tous les documents.
                            </p>
                        </div>
                        <a href="#modules" className="mt-6 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                            <span>En savoir plus</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Pilier 2 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold shadow-xs">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mb-2">Finances & Facturation</h3>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                Suivi des paiements, gestion des tranches, relances automatiques et reçus certifiés avec QR Code infalsifiable.
                            </p>
                        </div>
                        <a href="#modules" className="mt-6 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                            <span>En savoir plus</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Pilier 3 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5 font-bold shadow-xs">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mb-2">Suivi Pédagogique</h3>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                Bulletins de notes officiels, gestion des absences, emplois du temps et relevés de notes générés en masse.
                            </p>
                        </div>
                        <a href="#modules" className="mt-6 text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
                            <span>En savoir plus</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Pilier 4 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 font-bold shadow-xs">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 mb-2">Portail Parents & SMS</h3>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                Accès mobile dédié pour les parents, suivi des notes en temps réel et notifications d'absence instantanées par SMS.
                            </p>
                        </div>
                        <a href="#modules" className="mt-6 text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group">
                            <span>En savoir plus</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </section>

            {/* 📑 MODULES INTÉGRÉS AVEC ONGLETS INTERACTIFS & ANIMATION FRAMER MOTION */}
            <section id="modules" className="py-20 bg-slate-50/70 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">FONCTIONNALITÉS COMPLÈTES</div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                            Explorez les modules intégrés de Buyedi
                        </h2>
                        <p className="mt-2 text-slate-600 text-sm">
                            Tout ce dont votre équipe a besoin au quotidien, réuni sur une interface fluide.
                        </p>
                    </div>

                    {/* Barre d'onglets animée */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                        {[
                            { id: 'scolarite', name: 'Gestion Scolaire', icon: School },
                            { id: 'finances', name: 'Finances & Caisse', icon: CreditCard },
                            { id: 'bulletins', name: 'Bulletins & Notes', icon: FileText },
                            { id: 'parents', name: 'Portail Parents', icon: Users },
                            { id: 'rh', name: 'Ressources Humaines', icon: Users },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                        isActive
                                            ? 'text-white shadow-lg shadow-blue-600/25 bg-blue-600'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Carte d'aperçu dynamique du module avec Framer Motion */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                
                                {/* Colonne Descriptif */}
                                <div className="lg:col-span-6 space-y-4">
                                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Module Spécialisé</div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                                        {modulesData[activeTab].title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {modulesData[activeTab].desc}
                                    </p>

                                    <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                                        {modulesData[activeTab].bullets.map((b, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-4">
                                        <Link
                                            href="/onboarding"
                                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 group"
                                        >
                                            <span>Tester ce module sur votre école</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Colonne Mockup Tableau */}
                                <div className="lg:col-span-6">
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
                                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <span>Indicateur Clé</span>
                                            <span>Statut d'Exécution</span>
                                        </div>

                                        <div className="space-y-3">
                                            {modulesData[activeTab].table.map((row, idx) => (
                                                <div key={idx} className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center justify-between shadow-xs">
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900">{row.col1}</div>
                                                        <div className="text-[11px] text-slate-500">{row.col2}</div>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${row.badgeColor}`}>
                                                        {row.badge}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                                            <span>Données sécurisées en temps réel</span>
                                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Synchronisé
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* 🧮 CALCULATEUR DE ROI / GAIN EN TEMPS & ARGENT */}
            <section id="simulateur" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">SIMULATEUR DE RENTABILITÉ</div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Combien Buyedi fera gagner à votre établissement ?
                    </h2>
                    <p className="mt-2 text-slate-600 text-sm">
                        Déplacez le curseur pour simuler les gains de productivité et financiers de votre école.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl">
                    {/* Slider d'élèves */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-700">Nombre d'élèves de l'école :</span>
                            <span className="px-4 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-black text-base sm:text-lg shadow-xs">
                                {simulatedStudents} élèves
                            </span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="1500"
                            step="25"
                            value={simulatedStudents}
                            onChange={(e) => setSimulatedStudents(Number(e.target.value))}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2">
                            <span>50 élèves (Maternelle)</span>
                            <span>750 élèves (Moyen)</span>
                            <span>1500 élèves (Grand Complexe)</span>
                        </div>
                    </div>

                    {/* 3 Cartes de métriques ROI */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-center">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition">
                            <div className="text-3xl font-black text-blue-600 mb-1">+{timeSavedHours}h</div>
                            <div className="text-xs font-bold text-slate-700">Temps administratif économisé / an</div>
                            <div className="text-[11px] text-slate-500 mt-1">Inscriptions, bulletins & reçus instantanés</div>
                        </div>

                        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 hover:border-emerald-300 transition">
                            <div className="text-3xl font-black text-emerald-600 mb-1">+{moneyRecovered} F</div>
                            <div className="text-xs font-bold text-slate-700">Recouvrement d'impayés amélioré</div>
                            <div className="text-[11px] text-slate-500 mt-1">Grâce aux alertes et relances automatiques</div>
                        </div>

                        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 hover:border-amber-300 transition">
                            <div className="text-3xl font-black text-amber-600 mb-1">+{paperSavings} F</div>
                            <div className="text-xs font-bold text-slate-700">Économies papier & fournitures</div>
                            <div className="text-[11px] text-slate-500 mt-1">Zéro reçus papier perdus, bulletins en ligne</div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition hover:scale-[1.02]"
                        >
                            <span>Calculer mon potentiel avec Buyedi</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 💎 TARIFS CONFORMES À LA MAQUETTE */}
            <section id="tarifs" className="py-24 bg-slate-50/70 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">GRILLE TARIFAIRE</div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                            Des formules adaptées à chaque taille d'établissement
                        </h2>
                        <p className="mt-2 text-slate-600 text-sm">
                            Commencez sans engagement avec 14 jours d'essai gratuit complet.
                        </p>

                        {/* Toggle Annuel / Mensuel */}
                        <div className="mt-8 inline-flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setBillingAnnual(false)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                                    !billingAnnual ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Facturation mensuelle
                            </button>
                            <button
                                onClick={() => setBillingAnnual(true)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                    billingAnnual ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>Facturation annuelle</span>
                                <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                    2 mois offerts
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
                        
                        {/* 1. STANDARD */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">STANDARD</h3>
                                <p className="text-xs text-slate-500 mt-1">Idéal pour écoles maternelles et petits collèges</p>

                                <div className="mt-6 mb-6">
                                    <div className="text-3xl font-black text-slate-900">
                                        {billingAnnual ? '250 000 F' : '25 000 F'}
                                        <span className="text-xs text-slate-500 font-medium"> {billingAnnual ? '/ an' : '/ mois'}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-1">Jusqu'à 250 élèves</div>
                                </div>

                                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-6">
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Inscriptions & Dossiers élèves</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Gestion des frais & caisse journalière</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Reçus officiels avec QR Code vérifiable</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>1 Année scolaire active</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Support standard par email</span>
                                    </li>
                                </ul>
                            </div>

                            <Link
                                href="/onboarding?formule=starter"
                                className="mt-8 w-full py-3.5 px-4 rounded-xl text-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs"
                            >
                                Choisir Standard
                            </Link>
                        </div>

                        {/* 2. PRO (LE PLUS POPULAIRE) */}
                        <div className="relative bg-white border-2 border-blue-600 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-blue-500/15">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                                ★ LE PLUS POPULAIRE
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-slate-900">PRO</h3>
                                <p className="text-xs text-blue-600 font-semibold mt-1">Pour écoles primaires et secondaires établies</p>

                                <div className="mt-6 mb-6">
                                    <div className="text-3xl font-black text-slate-900">
                                        {billingAnnual ? '325 000 F' : '32 500 F'}
                                        <span className="text-xs text-slate-500 font-medium"> {billingAnnual ? '/ an' : '/ mois'}</span>
                                    </div>
                                    <div className="text-[11px] text-blue-600 font-bold mt-1">Jusqu'à 800 élèves</div>
                                </div>

                                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                                        <span className="font-semibold">Tous les modules Standard inclus</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                                        <span className="font-semibold">Bulletins de notes officiels MEN</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                                        <span>Gestion des arriérés & relances</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                                        <span>Module RH & paie des enseignants</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                                        <span>Support prioritaire WhatsApp & Téléphone 6j/7</span>
                                    </li>
                                </ul>
                            </div>

                            <Link
                                href="/onboarding?formule=pro"
                                className="mt-8 w-full py-4 px-4 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-600/30 transition hover:scale-[1.02]"
                            >
                                Démarrer l'essai gratuit Pro
                            </Link>
                        </div>

                        {/* 3. SUR-MESURE / ENTREPRISE (Carte Sombre Prestigieuse) */}
                        <div className="bg-[#0b1329] text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                            <div>
                                <h3 className="text-xl font-black text-white">SUR-MESURE</h3>
                                <p className="text-xs text-slate-400 mt-1">Pour grands complexes scolaires & multi-sites</p>

                                <div className="mt-6 mb-6">
                                    <div className="text-3xl font-black text-white">
                                        Dès 100 000 F
                                        <span className="text-xs text-slate-400 font-medium"> / mois</span>
                                    </div>
                                    <div className="text-[11px] text-indigo-400 font-bold mt-1">Élèves & classes illimités</div>
                                </div>

                                <ul className="space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-6">
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span>Tous les modules actuels et futurs</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span>Multi-établissements & multi-campus</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span>Nom de domaine dédié personnalisé (ex: mon-ecole.ga)</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span>Sauvegardes automatiques quotidiennes</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span>Formation sur site & Chef de projet dédié</span>
                                    </li>
                                </ul>
                            </div>

                            <a
                                href="#demo"
                                className="mt-8 w-full py-3.5 px-4 rounded-xl text-center text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 transition shadow-md"
                            >
                                Contacter l'équipe
                            </a>
                        </div>

                    </div>
                </div>
            </section>

            {/* ⭐ TÉMOIGNAGES CLIENTS RÉELS */}
            <section id="temoignages" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">TÉMOIGNAGES CLIENTS</div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Ce que disent les chefs d'établissements partenaires
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Avis 1 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl transition flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                                "Depuis l'adoption de Buyedi, nous avons réduit nos impayés de 40% dès le premier trimestre. La vérification des reçus par QR Code a éradiqué toute tentative de fraude."
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm">
                                OJ
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-slate-900">M. Obame Jean-Pierre</div>
                                <div className="text-[11px] text-slate-500">Directeur, CS Sagesse Divine</div>
                            </div>
                        </div>
                    </div>

                    {/* Avis 2 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl transition flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                                "L'édition des bulletins qui prenait 2 semaines à toute l'équipe pédagogique se fait désormais en 2 heures chrono. Un gain de temps inestimable pour notre école."
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm">
                                NB
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-slate-900">Mme Nzé Brigitte</div>
                                <div className="text-[11px] text-slate-500">Fondatrice, GS Oguemwet</div>
                            </div>
                        </div>
                    </div>

                    {/* Avis 3 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl transition flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-1 text-amber-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                                "Les parents adorent recevoir les alertes et les reçus certifiés directement. L'image de marque de notre établissement s'est nettement modernisée."
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
                                BP
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-slate-900">M. Boussougou Patrick</div>
                                <div className="text-[11px] text-slate-500">Gestionnaire Financier</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 📝 FORMULAIRE DE DEMANDE DE DÉMONSTRATION PERSONNALISÉE */}
            <section id="demo" className="py-20 bg-slate-50/80 border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                            
                            {/* Descriptif Démo */}
                            <div className="lg:col-span-5 space-y-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">DÉMONSTRATION PRIVÉE</div>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                                    Demandez votre démonstration personnalisée
                                </h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                    Découvrez en direct comment Buyedi répond aux besoins précis de votre école lors d'une session privée avec l'un de nos spécialistes.
                                </p>

                                <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Présentation interactive en visio de 25 min</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Simulation sur les effectifs de votre école</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Réponses à toutes vos questions</span>
                                    </li>
                                </ul>

                                <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    <span>Ligne directe Libreville : <strong>+241 77 00 00 00</strong></span>
                                </div>
                            </div>

                            {/* Formulaire Démo */}
                            <div className="lg:col-span-7">
                                {demoSent ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                                        <h4 className="text-lg font-extrabold text-emerald-900">Demande enregistrée avec succès !</h4>
                                        <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">
                                            Merci {demoForm.nom}. Notre conseiller prendra contact avec vous sous 2 heures ouvrées pour planifier votre démonstration.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleDemoSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Votre Nom & Prénom *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Jean-Paul Mba"
                                                    value={demoForm.nom}
                                                    onChange={(e) => setDemoForm({ ...demoForm, nom: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Nom de l'établissement *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="CS Saint-Exupéry"
                                                    value={demoForm.ecole}
                                                    onChange={(e) => setDemoForm({ ...demoForm, ecole: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Email professionnel *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="direction@ecole.ga"
                                                    value={demoForm.email}
                                                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone (WhatsApp) *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="+241 77 00 00 00"
                                                    value={demoForm.telephone}
                                                    onChange={(e) => setDemoForm({ ...demoForm, telephone: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">Effectif estimé</label>
                                            <select
                                                value={demoForm.eleves}
                                                onChange={(e) => setDemoForm({ ...demoForm, eleves: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition"
                                            >
                                                <option value="moins-150">Moins de 150 élèves</option>
                                                <option value="150-400">150 à 400 élèves</option>
                                                <option value="400-800">400 à 800 élèves</option>
                                                <option value="plus-800">Plus de 800 élèves (Multi-sites)</option>
                                            </select>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            Réserver ma démonstration gratuite
                                        </button>
                                    </form>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ❓ FOIRE AUX QUESTIONS (ACCORDÉON INTERACTIF) */}
            <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">QUESTIONS FRÉQUENTES</div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                        Tout ce que vous devez savoir sur Buyedi
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div
                                key={index}
                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition shadow-xs hover:border-slate-300"
                            >
                                <button
                                    onClick={() => setOpenFaq(isOpen ? null : index)}
                                    className="w-full px-6 py-4.5 text-left flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-900 hover:text-blue-600 transition"
                                >
                                    <span>{faq.q}</span>
                                    {isOpen ? (
                                        <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 🌑 FOOTER SOMBRE DE HAUTE QUALITÉ */}
            <footer className="bg-[#0b1329] text-slate-400 pt-16 pb-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
                        {/* Marque */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo Buyedi"
                                    className="h-9 w-auto brightness-200 invert"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <span className="text-xl font-black text-white">Buyedi</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Plateforme SaaS de référence pour la gestion scolaire, pédagogique et financière des établissements d'excellence.
                            </p>
                            <div className="text-xs text-slate-500 font-mono">
                                Multi-Tenant • Bases Dédiées
                            </div>
                        </div>

                        {/* Liens Produit */}
                        <div>
                            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">Produit</div>
                            <ul className="space-y-2.5 text-xs">
                                <li><a href="#modules" className="hover:text-white transition">Gestion Scolaire</a></li>
                                <li><a href="#modules" className="hover:text-white transition">Finances & Reçus QR</a></li>
                                <li><a href="#modules" className="hover:text-white transition">Bulletins de Notes MEN</a></li>
                                <li><a href="#modules" className="hover:text-white transition">Portail Parents & SMS</a></li>
                                <li><a href="#tarifs" className="hover:text-white transition">Grille Tarifaire</a></li>
                            </ul>
                        </div>

                        {/* Écosystème & Accès */}
                        <div>
                            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">Accès & Plateforme</div>
                            <ul className="space-y-2.5 text-xs">
                                <li>
                                    <Link href="/onboarding" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                                        <span>Créer un établissement</span> <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/super-admin" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        <span>Super Admin SaaS</span>
                                    </Link>
                                </li>
                                <li><a href="#simulateur" className="hover:text-white transition">Simulateur de ROI</a></li>
                                <li><a href="#demo" className="hover:text-white transition">Demander une démo</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact Direct</div>
                            <div className="space-y-2.5 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span>Libreville, Gabon</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span>+241 77 00 00 00</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span>contact@buyedi.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div>
                            &copy; {new Date().getFullYear()} Buyedi Multi-Tenant. Tous droits réservés.
                        </div>
                        <div className="flex items-center gap-6">
                            <span>Conforme réglementations MEN</span>
                            <span>Confidentialité garantie</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
