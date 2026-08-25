import { usePage } from '@inertiajs/react';

export default function useAuthText() {
  const { props } = usePage();
  const translations = props.auth_trans || {};

  const t = (key, fallback = null) => {
    return translations[key] ?? fallback ?? key;
  };

  return { t };
}