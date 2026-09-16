import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

export default function PermissionMatrix({ permissions = [], value = [], onChange }) {
  const [search, setSearch] = useState('');

  // Regrouper les permissions par module
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach((perm) => {
      const [action, ...moduleParts] = perm.name.split('_'); // ex: "voir_users"
      const module = moduleParts.join('_');
      if (!groups[module]) groups[module] = [];
      groups[module].push({ name: perm.name, label: perm.label || perm.name });
    });
    return groups;
  }, [permissions]);

  const allPermissions = useMemo(() => Object.values(groupedPermissions).flatMap((p) => p.map(x => x.name)), [groupedPermissions]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedPermissions;
    const query = search.toLowerCase().trim();
    const result = {};
    Object.entries(groupedPermissions).forEach(([module, perms]) => {
      const moduleMatches = module.toLowerCase().includes(query);
      const matchingPerms = perms.filter(p => p.name.toLowerCase().includes(query) || (p.label && p.label.toLowerCase().includes(query)));
      if (moduleMatches) {
        result[module] = perms;
      } else if (matchingPerms.length > 0) {
        result[module] = matchingPerms;
      }
    });
    return result;
  }, [groupedPermissions, search]);

  const hasModuleChecked = (module) => {
    const perms = groupedPermissions[module] || [];
    return perms.length > 0 && perms.every((perm) => value.includes(perm.name));
  };

  const togglePermission = (permName) => {
    onChange(
      value.includes(permName)
        ? value.filter((p) => p !== permName)
        : [...value, permName]
    );
  };

  const toggleModule = (module, checked) => {
    const perms = (groupedPermissions[module] || []).map((p) => p.name);
    onChange(
      checked
        ? [...new Set([...value, ...perms])]
        : value.filter((p) => !perms.includes(p))
    );
  };

  const toggleAll = (checked) => {
    onChange(checked ? allPermissions : []);
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils : Checkbox global + Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="toggle-all-perms"
            checked={value.length === allPermissions.length && allPermissions.length > 0}
            onChange={(e) => toggleAll(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <label htmlFor="toggle-all-perms" className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
            Tout sélectionner <span className="text-xs text-slate-400 font-normal">({value.length} / {allPermissions.length} permissions actives)</span>
          </label>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer les modules (ex: paie, classes)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      {Object.keys(filteredGroups).length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucun module ne correspond à « <span className="font-semibold text-slate-700 dark:text-slate-200">{search}</span> ».
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(filteredGroups).map(([module, perms]) => {
            const isPaie = module.toLowerCase() === 'paie';
            const moduleChecked = hasModuleChecked(module);
            return (
              <div 
                key={module} 
                className={`rounded-2xl p-4 transition-all border ${
                  isPaie 
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm' 
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm capitalize text-slate-800 dark:text-white tracking-wide">
                      {module.replace(/_/g, ' ')}
                    </span>
                    {isPaie && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        RH
                      </span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={moduleChecked}
                    onChange={(e) => toggleModule(module, e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    title={`Tout cocher pour ${module}`}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {perms.map((perm) => {
                    const isChecked = value.includes(perm.name);
                    return (
                      <label
                        key={perm.name}
                        className={`flex items-center gap-2.5 text-xs py-1 px-1.5 rounded-lg cursor-pointer select-none transition-colors ${
                          isChecked 
                            ? 'text-slate-900 dark:text-slate-100 font-medium' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.name)}
                          className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] truncate">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
