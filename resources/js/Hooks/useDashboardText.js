import { usePage } from '@inertiajs/react';

export default function useDashboardText() {
  const { props } = usePage();
  const translations = props.dashboard_trans || {};

  const t = (key, fallback = null) => {
    return translations[key] ?? fallback ?? key;
  };

  return { t };
}