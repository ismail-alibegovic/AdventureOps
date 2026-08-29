import React, { createContext, useContext, useState } from 'react';
import { bs } from './bs';
import { en } from './en';
import { SupportedLanguage } from '../types';

type TranslationKey = keyof typeof bs;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine initial language from path or default to 'en'
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/bs')) return 'bs';
      if (path.startsWith('/en')) return 'en';
      const saved = localStorage.getItem('rafting_lang');
      if (saved === 'en' || saved === 'bs') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rafting_lang', lang);
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/bs') || currentPath.startsWith('/en')) {
        const rest = currentPath.replace(/^\/(bs|en)/, '');
        const newPath = `/${lang}${rest || ''}`;
        window.history.pushState(null, '', newPath);
      }
    }
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = language === 'en' ? en : bs;
    return dict[key] || fallback || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
