import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useTranslation from '@/Hooks/useTranslation';
import { PencilSquareIcon, TrashIcon, EyeIcon, UserPlusIcon, MagnifyingGlassIcon, FunnelIcon, UserGroupIcon, IdentificationIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function Index({ filters, classes }) {
  const { t } = useTranslation();
  const { eleves: elevesProp = {}, flash, classes: classesProp = [], auth } = usePage().props;
  const permissions = auth?.permissions || [];
  const can = (permission) => permissions.includes(permission);

  const { delete: destroy } = useForm();

  const [search, setSearch] = useState(filters?.search || "");
  const [filterSexe, setFilterSexe] = useState(filters?.sexe || "");
  const [filterClasse, setFilterClasse] = useState(filters?.classe_id || "");

  const elevesData = elevesProp?.data || [];
  const elevesLinks = elevesProp?.links || [];
  const classesList = classesProp || [];

  // Recherche avec debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.get(
        route("eleves.index"),
        { search, sexe: filterSexe, classe_id: filterClasse },
        { preserveState: true, replace: true }
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [search, filterSexe, filterClasse]);

  const handleDelete = (id) => {
    if (!confirm(t("confirm_delete", "Voulez-vous vraiment supprimer définitivement cet élève de la base de données ?"))) return;
    destroy(route("eleves.destroy", id), {
      onSuccess: () => {
        // Toast géré par middleware
      },
    });
  };

  return (
    <DashboardLayout title={t("eleves_management", "Gestion des élèves")}>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            {t("eleves_management", "Effectif des Élèves")}
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-sm font-bold shadow-sm border border-blue-200 dark:border-blue-800/50">
              {elevesProp.total}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Consultez et gérez l'ensemble des étudiants enregistrés dans l'établissement.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {can('ajouter_eleves') && (
            <Link
              href={route("eleves.create")}
              className="group flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-green-500/30 transition-all active:scale-95"
            >
              <UserPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>{t("create_eleve", "Nouveau Dossier")}</span>
            </Link>
          )}
        </div>
      </div>

      {/* FILTERS & SEARCH MODULE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t("search", "Rechercher par nom, prénom ou matricule...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre */}
          <div className="relative w-full sm:w-40">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IdentificationIcon className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={filterSexe}
              onChange={(e) => setFilterSexe(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium truncate"
            >
              <option value="">Tous les genres</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          {/* Classe */}
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={filterClasse}
              onChange={(e) => setFilterClasse(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors sm:text-sm appearance-none font-medium truncate"
            >
              <option value="">Toutes les classes</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* DATA TABLE SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 rounded-3xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead className="bg-[#0B1A2D] text-slate-300">
              <tr className="text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-5 rounded-tl-3xl">{t("photo", "Identité Visuelle")}</th>
                <th className="px-6 py-5">{t("matricule", "Matricule")}</th>
                <th className="px-6 py-5">{t("noms", "Noms & Prénoms")}</th>
                <th className="px-6 py-5">{t("classe", "Statut Scolaire")}</th>
                <th className="px-6 py-5">{t("parents", "Contact Famille")}</th>
                <th className="px-6 py-5 text-center rounded-tr-3xl">{t("actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {elevesData.length > 0 ? elevesData.map((eleve) => (
                <tr key={eleve.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  {/* Avatar */}
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                      {eleve.photo ? (
                        <img
                          src={eleve.photo}
                          alt={`${eleve.prenom} ${eleve.nom}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
                          {eleve.nom ? eleve.nom.charAt(0) : '?'}
                        </span>
                      )}
                      {/* Status dot */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                  </td>

                  {/* Matricule */}
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {eleve.matricule || <span className="text-amber-500">A GÉNÉRER</span>}
                  </td>

                  {/* Noms */}
                  <td className="px-6 py-4">
                    <div>
                      <span className="block font-extrabold text-[#0B1A2D] dark:text-white text-base">
                        {eleve.nom || '-'}
                      </span>
                      <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                        {eleve.prenom || '-'}
                      </span>
                    </div>
                  </td>

                  {/* Statut Scolaire */}
                  <td className="px-6 py-4">
                    {eleve.classe ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          {eleve.classe}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Non affecté
                      </span>
                    )}
                  </td>

                  {/* Parents */}
                  <td className="px-6 py-4">
                    {eleve.parents && eleve.parents.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {eleve.parents.map(parent => (
                          <div key={parent.id} className="text-sm">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              {parent.nom_complet}
                              {parent.lien && <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded font-bold uppercase tracking-wider">{parent.lien}</span>}
                            </span>
                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{parent.telephone}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold italic bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                        <UserGroupIcon className="w-3.5 h-3.5" /> Aucun affilié
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center flex-wrap gap-2">
                      <Link
                        href={route("eleves.show", eleve.id)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl transition-all shadow-sm"
                        title={t("view_details", "Consulter le dossier")}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>

                      {can('modifier_eleves') && (
                        <Link
                          href={route("eleves.edit", eleve.id)}
                          className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-500 rounded-xl transition-all shadow-sm"
                          title={t("edit", "Modifier")}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                      )}

                      {can('ajouter_inscriptions') && (
                        <Link
                          href={route("inscriptions.create.eleve", eleve.id)}
                          className="p-2.5 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-500 rounded-xl transition-all shadow-sm"
                          title={t("inscribe", "Inscrire Cet Élève")}
                        >
                          <UserPlusIcon className="w-4 h-4" />
                        </Link>
                      )}

                      {can('supprimer_eleves') && (
                        <button
                          onClick={() => handleDelete(eleve.id)}
                          className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-500 rounded-xl transition-all shadow-sm"
                          title={t("delete", "Supprimer")}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <UserGroupIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <span className="font-medium text-lg">La base de données des élèves est vide.</span>
                      <p className="text-sm">Veuillez importer ou saisir un nouvel élève pour alimenter ce tableau.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {elevesLinks.length > 0 && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap justify-center sm:justify-end gap-2">
            {elevesLinks.map((link, i) => (
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
