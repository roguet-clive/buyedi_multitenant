import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

const LanguageSwitcher = ({ currentLocale, className = '' }) => {
  const { setLang } = useTranslation();
  const [selected, setSelected] = useState(currentLocale || 'fr');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang && storedLang !== selected) {
      setSelected(storedLang);
      setLang(storedLang);
    }
  }, []);

  const handleChange = (e) => {
    const lang = e.target.value;
    setSelected(lang);
    setLoading(true);

    setLang(lang);
    localStorage.setItem('lang', lang);

    router.post('/language-switch', { locale: lang }, {
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  };

  const flagMap = {
    fr: '/flags/fr.svg',
    en: '/flags/en.svg',
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <img
        src={flagMap[selected]}
        alt={`${selected} flag`}
        className="w-5 h-4 rounded shadow-sm"
      />
      <select
        id="language-select"
        name="language"
        className="px-3 py-2 rounded border focus:outline-none focus:ring"
        value={selected}
        onChange={handleChange}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
      {loading && (
        <span className="absolute right-2 top-2 text-sm text-gray-500 animate-pulse">
          Changement...
        </span>
      )}
    </div>
  );
};

export default LanguageSwitcher;