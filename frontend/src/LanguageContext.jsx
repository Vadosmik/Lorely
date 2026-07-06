import { createContext } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const changeLang = (newLang) => {
    localStorage.setItem('lang', newLang);
    setCurrentLang(newLang);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}