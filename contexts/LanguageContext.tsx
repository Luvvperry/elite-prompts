import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, PromptLanguage } from '../types';
import { translations, TranslationSchema } from '../translations';

export const normalizeLanguage = (lang: string | null | undefined): Language => {
  if (!lang) return 'pt';
  const lower = String(lang).toLowerCase().trim();
  if (lower === 'pt' || lower === 'pt-br' || lower === 'ptbr' || lower === 'pt_br' || lower === 'portuguese') {
    return 'pt';
  }
  if (lower === 'es' || lower === 'spanish') {
    return 'es';
  }
  return 'en';
};

export const toTranslationKey = (lang: Language | string): 'en' | 'es' | 'pt' => {
  const norm = normalizeLanguage(lang);
  if (norm === 'pt') return 'pt';
  if (norm === 'es') return 'es';
  return 'en';
};

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  promptLanguage: PromptLanguage;
  setPromptLanguage: (promptLang: PromptLanguage) => void;
  t: (key: string, fallback?: string) => string;
  translations: TranslationSchema;
  resolvedPromptLanguage: 'en' | 'es' | 'pt';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getNestedValue = (obj: any, path: string): string | undefined => {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read once from localStorage on initialization with navigator.language fallback
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('interfaceLanguage') || localStorage.getItem('ep_lang');
      if (saved) return normalizeLanguage(saved);
      if (typeof navigator !== 'undefined' && navigator.language) {
        return normalizeLanguage(navigator.language);
      }
      return 'pt';
    } catch {
      return 'pt';
    }
  });

  const [promptLanguage, setPromptLanguageState] = useState<PromptLanguage>(() => {
    try {
      const saved = (localStorage.getItem('ep_prompt_lang') as PromptLanguage) || 'auto';
      return saved;
    } catch {
      return 'auto';
    }
  });

  // Internal key for translations object: 'pt' | 'es' | 'en'
  const translationKey: 'en' | 'es' | 'pt' = useMemo(() => {
    return toTranslationKey(language);
  }, [language]);

  const currentTranslations = useMemo(() => {
    return translations[translationKey] || translations.pt;
  }, [translationKey]);

  // Reactive setLanguage
  const setLanguage = useCallback((newLang: Language) => {
    const normalized = normalizeLanguage(newLang);
    console.log('[i18n] Interface language changed:', normalized);
    setLanguageState(normalized);
    try {
      localStorage.setItem('interfaceLanguage', normalized);
      localStorage.setItem('ep_lang', normalized);
      document.documentElement.lang = normalized;
    } catch (e) {
      // Storage unavailable in restricted iframe/incognito
    }
  }, []);

  // Reactive setPromptLanguage
  const setPromptLanguage = useCallback((newPromptLang: PromptLanguage) => {
    setPromptLanguageState(newPromptLang);
    try {
      localStorage.setItem('ep_prompt_lang', newPromptLang);
    } catch (e) {
      // Storage unavailable
    }
  }, []);

  // Sync document.documentElement.lang
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Reactive nested-key translation function
  const t = useCallback((key: string, fallback?: string): string => {
    let val = getNestedValue(currentTranslations, key);
    if (val === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] Missing key "${key}" for "${language}"`);
      }
      val = getNestedValue(translations.en, key);
    }
    return val !== undefined ? val : (fallback !== undefined ? fallback : key);
  }, [currentTranslations, language]);

  const resolvedPromptLanguage = useMemo((): 'en' | 'es' | 'pt' => {
    if (promptLanguage === 'auto') {
      return translationKey;
    }
    return toTranslationKey(promptLanguage as Language);
  }, [promptLanguage, translationKey]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    promptLanguage,
    setPromptLanguage,
    t,
    translations: currentTranslations,
    resolvedPromptLanguage
  }), [language, setLanguage, promptLanguage, setPromptLanguage, t, currentTranslations, resolvedPromptLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
