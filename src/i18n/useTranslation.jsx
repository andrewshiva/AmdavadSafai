import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from './en.json';
import guTranslations from './gu.json';
import hiTranslations from './hi.json';

// Preserve context instance during Vite Fast Refresh / HMR reloads
const TranslationContext = window.__TranslationContext || createContext({
  t: (key) => key,
  lang: 'gu',
  setLanguage: () => {},
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
    setLang((prev) => {
      if (prev === 'gu') return 'hi';
      if (prev === 'hi') return 'en';
      return 'gu';
    });
  };

  const setLanguage = (newLang) => {
    if (['gu', 'hi', 'en'].includes(newLang)) {
      setLang(newLang);
    }
  };

  const t = (key, params = {}) => {
    let dict = guTranslations;
    if (lang === 'en') dict = enTranslations;
    else if (lang === 'hi') dict = hiTranslations;

    let text = dict[key] || enTranslations[key] || guTranslations[key] || key;
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }
    return text;
  };

  return (
    <TranslationContext.Provider value={{ t, lang, setLanguage, toggleLang }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    return {
      t: (key) => key,
      lang: 'gu',
      setLanguage: () => {},
      toggleLang: () => {}
    };
  }
  return context;
};

