// contexts/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languageNames, getDirection, getTextAlign } from '../lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ar'); // Arabe par défaut

  // Charger la langue sauvegardée
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  // Sauvegarder la langue quand elle change
  useEffect(() => {
    localStorage.setItem('language', language);
    // Mettre à jour la direction du document
    document.documentElement.dir = getDirection(language);
    document.documentElement.lang = language;
  }, [language]);

  // Fonction pour obtenir une traduction
  const t = (key) => {
    return translations[language]?.[key] || translations['ar'][key] || key;
  };

  // Changer de langue
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    dir: getDirection(language),
    textAlign: getTextAlign(language),
    isRTL: language === 'ar',
    languageNames,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
