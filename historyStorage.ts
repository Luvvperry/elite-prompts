import { PromptResult, LifestyleResult } from './types';

export const HISTORY_KEY = 'project_trx_history';
const MAX_DATA_URL_LENGTH = 45000; // ~45KB max per thumbnail

/**
 * Creates a compact, compressed JPEG thumbnail from a base64 data URL or image source.
 * Produces tiny payloads (~5KB - 12KB) to stay well within browser localStorage limits.
 */
export const createThumbnail = (
  dataUrl: string,
  maxDimension = 160,
  quality = 0.6
): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width || maxDimension;
        let height = img.height || maxDimension;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL('image/jpeg', quality);
          resolve(thumb);
        } else {
          resolve('');
        }
      } catch (err) {
        console.warn('Failed to render thumbnail canvas:', err);
        resolve('');
      }
    };

    img.onerror = () => {
      resolve('');
    };

    img.src = dataUrl;
  });
};

/**
 * Sanitizes a history item before storage so it never contains multi-megabyte base64 strings.
 */
export const sanitizeItemForStorage = (item: PromptResult, stripImages = false): PromptResult => {
  const sanitized: PromptResult = {
    ...item,
  };

  if (stripImages) {
    sanitized.originalImage = undefined;
    sanitized.identityImage = undefined;
    if (sanitized.lifestyleData) {
      sanitized.lifestyleData = {
        ...sanitized.lifestyleData,
        referenceImage: '',
      };
    }
    return sanitized;
  }

  // Ensure originalImage is not a bloated uncompressed data URL
  if (sanitized.originalImage && sanitized.originalImage.length > MAX_DATA_URL_LENGTH) {
    sanitized.originalImage = undefined;
  }

  // Ensure identityImage is not bloated
  if (sanitized.identityImage && sanitized.identityImage.length > MAX_DATA_URL_LENGTH) {
    sanitized.identityImage = undefined;
  }

  // Ensure lifestyleData doesn't duplicate a huge image
  if (sanitized.lifestyleData) {
    const lifeRef = sanitized.lifestyleData.referenceImage;
    sanitized.lifestyleData = {
      ...sanitized.lifestyleData,
      referenceImage:
        lifeRef && lifeRef.length <= MAX_DATA_URL_LENGTH
          ? lifeRef
          : (sanitized.originalImage || ''),
    };
  }

  return sanitized;
};

/**
 * Safely saves history to localStorage using progressive compaction tiers
 * to prevent QuotaExceededError and gracefully preserve as much history as possible.
 */
export const saveHistoryToStorage = (history: PromptResult[]): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  // Strategy tiers from best to most compact
  const tiers: Array<() => PromptResult[]> = [
    // Tier 1: Up to 25 items with compact thumbnails
    () => history.slice(0, 25).map((item) => sanitizeItemForStorage(item, false)),

    // Tier 2: Up to 15 items with compact thumbnails
    () => history.slice(0, 15).map((item) => sanitizeItemForStorage(item, false)),

    // Tier 3: Up to 12 items, keep image only for top 2 items
    () =>
      history.slice(0, 12).map((item, idx) =>
        sanitizeItemForStorage(item, idx > 1)
      ),

    // Tier 4: Up to 8 items, completely text-only (all images stripped)
    () => history.slice(0, 8).map((item) => sanitizeItemForStorage(item, true)),

    // Tier 5: Up to 3 items, completely text-only
    () => history.slice(0, 3).map((item) => sanitizeItemForStorage(item, true)),

    // Tier 6: Single newest item text-only
    () => (history.length > 0 ? [sanitizeItemForStorage(history[0], true)] : []),
  ];

  for (const getTierData of tiers) {
    try {
      const dataToSave = getTierData();
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem(HISTORY_KEY, serialized);
      return true;
    } catch (err: any) {
      const isQuotaError =
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014;

      if (!isQuotaError) {
        console.warn('Storage save error:', err);
        break;
      }
      // If QuotaExceededError, loop advances to next more compact tier
    }
  }

  // If even tier 6 failed, try clearing broken history key
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}

  console.warn('Could not persist history to localStorage due to strict quota limits. Maintained in memory.');
  return false;
};

/**
 * Safely loads history from localStorage and sanitizes any existing oversized data.
 */
export const loadHistoryFromStorage = (): PromptResult[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let hasBloatedItem = false;
    const sanitizedList: PromptResult[] = parsed.map((item: any) => {
      if (!item || typeof item !== 'object') return item;
      if (
        (item.originalImage && item.originalImage.length > MAX_DATA_URL_LENGTH) ||
        (item.identityImage && item.identityImage.length > MAX_DATA_URL_LENGTH) ||
        (item.lifestyleData?.referenceImage && item.lifestyleData.referenceImage.length > MAX_DATA_URL_LENGTH)
      ) {
        hasBloatedItem = true;
      }
      return sanitizeItemForStorage(item, false);
    });

    // If bloated data from previous sessions was detected, re-save immediately to clear storage pressure
    if (hasBloatedItem) {
      saveHistoryToStorage(sanitizedList);
    }

    return sanitizedList;
  } catch (err) {
    console.error('Failed to parse history from storage:', err);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    return [];
  }
};
