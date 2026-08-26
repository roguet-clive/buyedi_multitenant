import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router, usePage } from "@inertiajs/react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  IdCard,
  GraduationCap,
  BookOpen,
  CalendarDays,
  FileText,
  LogOut,
  Bell,
  PiggyBank,
  CreditCard,
  BarChart3,
  Brain,
  School,
  UserCog,
  ChevronDown,
  Mail,
  UploadCloud,
  TrendingUp,
  Archive,
} from "lucide-react";
import useTranslation from "@/Hooks/useTranslation";

export default function Sidebar() {
  const { t } = useTranslation();
  const { auth, url, etablissement } = usePage().props;
  const unreadCount = auth?.unreadCount || 0;
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  // Fonction pour vérifier si un lien est actif
  const isActive = (link) => {
    if (link.children) {
      return link.children.some(child => isActive(child));
    }
    return link.routeName && route().current(link.routeName + '*');
  };

  const links = useMemo(() => {
    // 🎓 MENU ÉLÈVE & PARENTS (Simplifié et Premium)
    // Vérification robuste insensible à la casse
    const isStudent = auth?.roles?.some(role => role.toLowerCase() === 'eleve');
    const isParent = auth?.roles?.some(role => role.toLowerCase() === 'parent');

    if (isStudent || isParent) {
      return [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: t("dashboard"), href: route("dashboard"), routeName: "dashboard" },
        // Eleve specific
        ...(isStudent ? [
          { icon: <IdCard className="w-5 h-5" />, label: "Mon Dossier Scolaire", href: route("eleves.mon-dossier"), routeName: "eleves.mon-dossier" },
          { icon: <Users className="w-5 h-5" />, label: "Mes Inscriptions", href: route("inscriptions.index"), routeName: "inscriptions.index" },
          { icon: <CalendarDays className="w-5 h-5" />, label: "Mon Emploi du temps", href: route("emploi_du_temps.index"), routeName: "emploi_du_temps.index" },
          { icon: <FileText className="w-5 h-5" />, label: "Mes Notes", href: route("notes.index"), routeName: "notes.index" },
          { icon: <BookOpen className="w-5 h-5" />, label: "Mes Cours & Devoirs", href: route("documents.index"), routeName: "documents.index" },
          { icon: <FileText className="w-5 h-5" />, label: "Demandes de Documents", href: route("demandes-documents.index"), routeName: "demandes-documents.index" },
          { icon: <FileText className="w-5 h-5" />, label: "Mes Bulletins", href: route("bulletins.index"), routeName: "bulletins.index" },
          { icon: <ShieldCheck className="w-5 h-5" />, label: "Mes Absences", href: route("absences.index"), routeName: "absences.index" },
          { icon: <CreditCard className="w-5 h-5" />, label: "Mes Paiements", href: route("paiements.index"), routeName: "paiements.index" },
        ] : []),
        ...(isParent ? [
          { icon: <IdCard className="w-5 h-5" />, label: "Dossier de l'Élève", href: route("eleves.mon-dossier"), routeName: "eleves.mon-dossier" },
          { icon: <FileText className="w-5 h-5" />, label: "Demandes de Documents", href: route("demandes-documents.index"), routeName: "demandes-documents.index" },
        ] : []),
        // Common
        { icon: <Mail className="w-5 h-5" />, label: "Mes Messages", href: route("communications.index"), routeName: "communications.index" },
        {
          icon: <Bell className="w-5 h-5" />,
          label: t("notifications"),
          href: route("notifications.index"),
          badge: unreadCount > 0 ? unreadCount : null
        },
      ];
    }

    // 👨‍🏫 MENU ENSEIGNANT (Optimisé)
    const isTeacher = auth?.roles?.some(role => role.toLowerCase() === 'enseignant');

    if (isTeacher) {
      return [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: t("dashboard"), href: route("dashboard"), routeName: "dashboard" },
        {
          icon: <BookOpen className="w-5 h-5" />,
          label: "Mes Cours",
          href: route("cours.mes-cours"),
          routeName: "cours.mes-cours"
        },
        { icon: <CalendarDays className="w-5 h-5" />, label: "Mon Emploi du temps", href: route("emploi_du_temps.index"), routeName: "emploi_du_temps.index" },
        { icon: <UploadCloud className="w-5 h-5" />, label: "Partage Documents", href: route("documents.index"), routeName: "documents.index" },
        { icon: <ShieldCheck className="w-5 h-5" />, label: "Saisie Absences", href: route("absences.index"), routeName: "absences.index" },
        { icon: <FileText className="w-5 h-5" />, label: "Saisie Notes", href: route("notes.index"), routeName: "notes.index" },
        { icon: <Users className="w-5 h-5" />, label: "Contacts Parents", href: route("parents.index"), routeName: "parents.index" },
        { icon: <Mail className="w-5 h-5" />, label: t("communications"), href: route("communications.index"), routeName: "communications.index" },
        {
          icon: <Bell className="w-5 h-5" />,
          label: t("notifications"),
          href: route("notifications.index"),
          badge: unreadCount > 0 ? unreadCount : null
        },
      ];
    }

    // 🛡️ MENU GLOBAL (ADMIN / PROF / PARENT)
    // Basé sur les permissions
    return [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: t("dashboard"), href: route("dashboard"), routeName: "dashboard" },

      // 📚 PÉDAGOGIE (Coeur de métier)
      {
        icon: <BookOpen className="w-5 h-5" />,
        label: t("pedagogie"),
        children: [
          { icon: <Users className="w-4 h-4" />, label: t("inscriptions"), href: route("inscriptions.index"), can: "voir_inscriptions", routeName: "inscriptions.index" },
          { icon: <School className="w-4 h-4" />, label: t("classes"), href: route("classes.index"), can: "voir_classes", routeName: "classes.index" },
          { icon: <GraduationCap className="w-4 h-4" />, label: t("eleves"), href: route("eleves.index"), can: "voir_eleves", routeName: "eleves.index" },
          { icon: <Users className="w-4 h-4" />, label: t("parents"), href: route("parents.index"), can: "voir_parents", routeName: "parents.index" },
          { icon: <BookOpen className="w-4 h-4" />, label: "Affectations (Cours)", href: route("cours.index"), can: "voir_cours", routeName: "cours.index" },
          { icon: <CalendarDays className="w-4 h-4" />, label: t("emploi_du_temps"), href: route("emploi_du_temps.index"), can: "voir_emplois_du_temps", routeName: "emploi_du_temps.index" },
          { icon: <FileText className="w-4 h-4" />, label: t("notes"), href: route("notes.index"), can: "voir_notes", routeName: "notes.index" },
          { icon: <UploadCloud className="w-4 h-4" />, label: t("documents_pedagogiques", "Documents Pédagogiques"), href: route("documents.index"), can: "voir_documents", routeName: "documents.index" },
          { icon: <FileText className="w-4 h-4 text-emerald-400" />, label: "Demandes Documents", href: route("demandes-documents.index"), can: "voir_documents", routeName: "demandes-documents.index" },
          { icon: <FileText className="w-4 h-4" />, label: t("bulletins"), href: route("bulletins.index"), can: "voir_bulletins", routeName: "bulletins.index" },
          { icon: <FileText className="w-4 h-4" />, label: t("absences"), href: route("absences.index"), can: "voir_absences", routeName: "absences.index" },
        ],
      },

      // 💰 FINANCE
      {
        icon: <PiggyBank className="w-5 h-5" />,
        label: t("finances"),
        children: [
          { icon: <TrendingUp className="w-4 h-4" />, label: "Vue Globale", href: route("finances.index"), can: "voir_stats", routeName: "finances.index" },
          { icon: <CreditCard className="w-4 h-4" />, label: t("caisse"), href: route("paiements.index"), can: "voir_paiements", routeName: "paiements.index" },
          { icon: <CreditCard className="w-4 h-4" />, label: t("depenses"), href: route("depenses.index"), can: "voir_depenses", routeName: "depenses.index" },
          { icon: <CreditCard className="w-4 h-4" />, label: t("frais_classes"), href: route("frais_classes.index"), can: "voir_frais_classes", routeName: "frais_classes.index" },
          { icon: <CreditCard className="w-4 h-4" />, label: t("types_de_frais"), href: route("frais_types.index"), can: "voir_frais_types", routeName: "frais_types.index" },
        ],
      },

      // 👥 RESSOURCES HUMAINES
      {
        icon: <Users className="w-5 h-5" />,
        label: t("gestion_rh"),
        children: [
          { icon: <Users className="w-4 h-4" />, label: t("enseignants"), href: route("enseignants.index"), can: "voir_enseignants", routeName: "enseignants.index" },
          { icon: <IdCard className="w-4 h-4" />, label: t("employes"), href: route("personnels.index"), can: "voir_personnels", routeName: "personnels.index" },
          { icon: <CreditCard className="w-4 h-4" />, label: "Salaires & Paie", href: route("rh.paie.index"), can: "voir_personnels", routeName: "rh.paie.index" },
        ],
      },

      // 📨 COMMUNICATION & APPS
      { icon: <Mail className="w-5 h-5" />, label: t("communications"), href: route("communications.index"), can: "voir_communications", routeName: "communications.index" },
      {
        icon: <Bell className="w-5 h-5" />,
        label: t("notifications"),
        href: route("notifications.index"),
        badge: unreadCount > 0 ? unreadCount : null
      },

      // 📊 STATS & IA
      { icon: <BarChart3 className="w-5 h-5" />, label: t("statistiques"), href: route("stats.index"), can: "voir_stats", routeName: "stats.index" },
      { icon: <Brain className="w-5 h-5" />, label: t("ia_alertes"), href: route("ia.index"), can: "voir_stats", routeName: "ia.index" },

      // ⚙️ ADMINISTRATION (En bas)
      {
        icon: <ShieldCheck className="w-5 h-5" />,
        label: t("parametres"),
        children: [
          { icon: <School className="w-4 h-4" />, label: t("etablissement"), href: route("etablissement.edit"), can: "modifier_etablissement" },
          { icon: <CalendarDays className="w-4 h-4" />, label: t("school_years"), href: route("annee_scolaires.index"), can: "voir_annee_scolaire", routeName: "annee_scolaires.index" },
          { icon: <CalendarDays className="w-4 h-4" />, label: t("periodes"), href: route("periodes.index"), can: "voir_periodes", routeName: "periodes.index" },
          { icon: <BookOpen className="w-4 h-4" />, label: t("matieres"), href: route("matieres.index"), can: "voir_matieres", routeName: "matieres.index" },
          // { icon: <Users className="w-4 h-4" />, label: t("parents"), href: route("parents.index"), can: "voir_parents", routeName: "parents.index" },
          { icon: <UserCog className="w-4 h-4" />, label: t("utilisateurs"), href: route("users.index"), can: "voir_users", routeName: "users.index" },
          { icon: <ShieldCheck className="w-4 h-4" />, label: t("roles_permissions"), href: route("roles.index"), can: "voir_roles", routeName: "roles.index" },
          { icon: <Archive className="w-4 h-4 text-emerald-400" />, label: "Archives & Rapports", href: route("archives.index"), can: "voir_archives", routeName: "archives.index" },
          // 📜 LOGS
          { icon: <FileText className="w-4 h-4 text-orange-400" />, label: t("activity_logs"), href: route("logs.index"), can: "voir_logs", routeName: "logs.index" },
        ],
      },
    ];
  }, [t, unreadCount, auth]);

  const filterLinks = (links) =>
    links
      .map(link => {
        // Gestion des sous-menus (ex: Pédagogie, Admin)
        if (link.children) {
          const children = filterLinks(link.children);
          // Si aucun enfant n'est visible, on cache le parent
          if (!children.length) return null;
          return { ...link, children };
        }

        // Vérification permission simple
        if (link.can && !can(link.can)) return null;

        return link;
      })
      .filter(Boolean);

  const filteredLinks = useMemo(() => filterLinks(links), [links]);

  const [open, setOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (key) => setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));

  // Auto-expand active dropdowns
  useEffect(() => {
    const newOpenDropdowns = {};
    const checkLinks = (links, level = 0) => {
      links.forEach((link, idx) => {
        const key = `${link.label}-${level}-${idx}`;
        if (link.children) {
          if (isActive(link)) {
            newOpenDropdowns[key] = true;
          }
          checkLinks(link.children, level + 1);
        }
      });
    };
    checkLinks(filteredLinks);
    setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
  }, [url, filteredLinks]);

  const renderLinks = (links, level = 0) => {
    return links.map((link, idx) => {
      const hasChildren = link.children && link.children.length > 0;
      const key = `${link.label}-${level}-${idx}`;
      const active = isActive(link);

      return (
        <div key={key}>
          {hasChildren ? (
            <motion.div
              whileHover={{ x: 5 }}
              onClick={() => toggleDropdown(key)}
              className={`flex items-center justify-between px-3 py-3 mx-1 my-0.5 rounded-xl cursor-pointer transition-all duration-300 outline-none
                ${active
                  ? "bg-green-500/15 text-green-400 shadow-sm border border-green-500/20"
                  : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50"}
                ${level > 0 ? "pl-8 text-sm" : ""}`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <span className={`${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"} transition-opacity`}>
                  {link.icon}
                </span>
                {open && <span className={`font-semibold tracking-wide ${active ? "text-green-400" : ""}`}>{link.label}</span>}
                {link.badge && open && (
                  <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-auto shadow-sm">
                    {link.badge}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${openDropdowns[key] ? "rotate-180 text-white" : "text-slate-500"}`} />
            </motion.div>
          ) : (
            <Link href={link.href || "#"} className="block outline-none">
              <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between px-3 py-3 mx-1 my-0.5 rounded-xl cursor-pointer transition-all duration-300 outline-none
                  ${active
                    ? "bg-green-500/15 text-green-400 shadow-sm border border-green-500/20"
                    : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50"}
                  ${level > 0 ? "pl-8 text-sm" : ""}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-center gap-3">
                  <span className={`${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"} transition-opacity`}>
                    {link.icon}
                  </span>
                  {open && <span className={`font-semibold tracking-wide ${active ? "text-green-400" : ""}`}>{link.label}</span>}
                  {link.badge && open && (
                    <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-auto shadow-sm">
                      {link.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            </Link>
          )}

          {hasChildren && (
            <AnimatePresence>
              {openDropdowns[key] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20">
                  {renderLinks(link.children, level + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: open ? 260 : 80 }}
      className="bg-[#0B1A2D] text-slate-300 shadow-xl flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-[#1e293b] scrollbar-hide z-50 transition-colors"
    >
      <div className="flex items-center justify-between p-4 border-b border-[#1e293b] mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={etablissement?.logo ? `/storage/${etablissement.logo}` : "/images/icone.png"}
            alt="Logo"
            className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-sm border border-[#1e293b] flex-shrink-0"
            onError={(e) => {
              e.target.src = "/images/icone.png";
            }}
          />
          {open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col truncate">
              <span className="text-base font-bold tracking-tight text-white truncate max-w-[140px]">
                {etablissement?.sigle || etablissement?.nom || "Buyedi"}
              </span>
              <span className="text-[10px] text-green-400 font-semibold tracking-wider uppercase">
                {etablissement?.sigle ? "Etablissement" : "ERP Scolaire"}
              </span>
            </motion.div>
          )}
        </div>
        <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-green-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 ml-auto">
          {open ? <ChevronDown className="w-5 h-5 rotate-90" /> : <ChevronDown className="w-5 h-5 -rotate-90" />}
        </button>
      </div>

      <nav className="mt-2 space-y-1 pb-4 px-2">{renderLinks(filteredLinks)}</nav>
    </motion.div>
  );
}
