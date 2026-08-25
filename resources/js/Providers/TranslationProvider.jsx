// resources/js/Providers/TranslationProvider.jsx
import { createContext, useState, useEffect } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

export const TranslationContext = createContext();

export default function TranslationProvider({ children, initialLang = 'fr' }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('lang') || initialLang;
  });

  const [translations, setTranslations] = useState(() => {
    return language === 'en' ? en : fr;
  });

  useEffect(() => {
    // DEBUG: Vérifier la langue et les clés chargées

    if (!translations['login_title']) console.warn("Missing 'login_title' key in translations!");

    localStorage.setItem('lang', language);
    setTranslations(language === 'en' ? en : fr);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ t: (key, fallback = null) => translations[key] ?? fallback ?? key, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}