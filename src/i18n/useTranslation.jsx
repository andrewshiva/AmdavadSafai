import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from './en.json';
import guTranslations from './gu.json';

// Preserve context instance during Vite Fast Refresh / HMR reloads
const TranslationContext = window.__TranslationContext || createContext({
  t: (key) => key,
  lang: 'gu',
  toggleLang: () => {}
});
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.__TranslationContext = TranslationContext;
}

export const TranslationProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('amdavad_safai_lang_v2') || 'gu';
  });

  useEffect(() => {
    localStorage.setItem('amdavad_safai_lang_v2', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'gu' : 'en'));
  };

  const t = (key) => {
    const translations = lang === 'en' ? enTranslations : guTranslations;
    return translations[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, lang, toggleLang }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    // Return safe fallback instead of throwing during HMR or Fast Refresh transitions
    return {
      t: (key) => key,
      lang: 'gu',
      toggleLang: () => {}
    };
  }
  return context;
};
