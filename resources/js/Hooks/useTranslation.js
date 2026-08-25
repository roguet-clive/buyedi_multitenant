// resources/js/hooks/useTranslation.js
import { useContext } from 'react';
import { TranslationContext } from '../Providers/TranslationProvider';

export default function useTranslation() {
  const { t, language, setLanguage } = useContext(TranslationContext);
  return { t, language, setLanguage };
}