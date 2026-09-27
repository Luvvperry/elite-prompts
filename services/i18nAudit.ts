import { translations } from '../translations';
import { Language } from '../types';

/**
 * Audit helper to verify 100% parity across translation keys for en, es, pt.
 */
export function auditTranslations(): { valid: boolean; differences: string[] } {
  const languages: Language[] = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'hi', 'ru', 'id', 'tr'];
  const differences: string[] = [];

  function getKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        keys = keys.concat(getKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  const referenceKeys = new Set(getKeys(translations.en));
  for (const language of languages.filter((lang) => lang !== 'en')) {
    const keys = new Set(getKeys(translations[language]));
    for (const key of referenceKeys) if (!keys.has(key)) differences.push(`Missing key in '${language}': ${key}`);
    for (const key of keys) if (!referenceKeys.has(key)) differences.push(`Extra key in '${language}' not in 'en': ${key}`);
  }

  if (differences.length > 0) {
    console.warn(`[I18N AUDIT] Found ${differences.length} inconsistencies:`, differences);
  }

  return {
    valid: differences.length === 0,
    differences
  };
}

// Run immediately during development
if (typeof window !== 'undefined' && Boolean((import.meta as any).env?.DEV)) {
  auditTranslations();
}
