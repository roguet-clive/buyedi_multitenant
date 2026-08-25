import React, { useMemo } from 'react';

export default function PermissionMatrix({ permissions = [], value = [], onChange }) {
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

  const hasModuleChecked = (module) =>
    groupedPermissions[module].every((perm) => value.includes(perm.name));

  const togglePermission = (permName) => {
    onChange(
      value.includes(permName)
        ? value.filter((p) => p !== permName)
        : [...value, permName]
    );
  };

  const toggleModule = (module, checked) => {
    const perms = groupedPermissions[module].map((p) => p.name);
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
    <div className="space-y-4">
      {/* Checkbox global */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={value.length === allPermissions.length && allPermissions.length > 0}
          onChange={(e) => toggleAll(e.target.checked)}
          className="accent-blue-600"
        />
        <span className="text-sm font-medium text-gray-800 dark:text-white">
          Tout sélectionner
        </span>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedPermissions).map(([module, perms]) => (
          <div key={module} className="border rounded-md p-4 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold capitalize text-gray-800 dark:text-white">
                {module}
              </span>
              <input
                type="checkbox"
                checked={hasModuleChecked(module)}
                onChange={(e) => toggleModule(module, e.target.checked)}
                className="accent-blue-600"
              />
            </div>
            <div className="flex flex-col gap-2">
              {perms.map((perm) => (
                <label
                  key={perm.name}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(perm.name)}
                    onChange={() => togglePermission(perm.name)}
                    className="accent-blue-600"
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
