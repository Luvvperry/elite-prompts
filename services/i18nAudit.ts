import { translations } from '../translations';
import { Language } from '../types';

/**
 * Audit helper to verify 100% parity across translation keys for en, es, pt.
 */
export function auditTranslations(): { valid: boolean; differences: string[] } {
  const languages: Language[] = ['en', 'es', 'pt'];
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

  const enKeys = new Set(getKeys(translations.en));
  const esKeys = new Set(getKeys(translations.es));
  const ptKeys = new Set(getKeys(translations.pt));

  // Check en vs es
  for (const k of enKeys) {
    if (!esKeys.has(k)) differences.push(`Missing key in 'es': ${k}`);
  }
  for (const k of esKeys) {
    if (!enKeys.has(k)) differences.push(`Extra key in 'es' not in 'en': ${k}`);
  }

  // Check en vs pt
  for (const k of enKeys) {
    if (!ptKeys.has(k)) differences.push(`Missing key in 'pt': ${k}`);
  }
  for (const k of ptKeys) {
    if (!enKeys.has(k)) differences.push(`Extra key in 'pt' not in 'en': ${k}`);
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
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  auditTranslations();
}
