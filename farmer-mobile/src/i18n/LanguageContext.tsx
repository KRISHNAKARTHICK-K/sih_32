import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, NestedTranslationDict, SUPPORTED_LANGUAGES } from './types';
import { en } from './en';
import { ta } from './ta';
import { secureStorage } from '../storage';

const LANGUAGE_STORAGE_KEY = 'AGRIPROCURE_PREF_LANGUAGE';

const dictionaries: Record<Language, NestedTranslationDict> = {
  en,
  ta,
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isTamil: boolean;
  isEnglish: boolean;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load persisted language on app mount
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await secureStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored === 'en' || stored === 'ta') {
          setLanguageState(stored);
        }
      } catch (err) {
        console.warn('[LanguageContext] Failed to load stored language preference', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadStoredLanguage();
  }, []);

  const setLanguage = useCallback(async (newLang: Language) => {
    setLanguageState(newLang);
    try {
      await secureStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (err) {
      console.warn('[LanguageContext] Failed to persist language preference', err);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');

      const resolveValue = (dict: NestedTranslationDict): string | null => {
        let current: any = dict;
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k];
          } else {
            return null;
          }
        }
        return typeof current === 'string' ? current : null;
      };

      // 1. Try current language
      let translated = resolveValue(dictionaries[language]);

      // 2. Fallback to English if missing in current language
      if (!translated && language !== 'en') {
        translated = resolveValue(dictionaries.en);
      }

      // 3. Fallback to raw key if not found in English
      if (!translated) {
        translated = key;
      }

      // 4. Interpolate parameters like {count} or {name}
      if (params) {
        for (const [paramKey, paramVal] of Object.entries(params)) {
          translated = translated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        }
      }

      return translated;
    },
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isTamil: language === 'ta',
    isEnglish: language === 'en',
    isLoaded,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;

export default LanguageContext;
