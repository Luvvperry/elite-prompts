import { ExtractedPalette } from './types';

export const DEFAULT_PALETTE: ExtractedPalette = {
  primaryAccent: '#38BDF8',
  primaryAccentHex: '#38BDF8',
  ambientGlow: 'rgba(56, 189, 248, 0.22)',
  ambientSoft: 'rgba(56, 189, 248, 0.07)',
  accentContrast: '#0F172A',
};

/**
 * Converts RGB components to hex string.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates perceived luminance of an RGB color (0 to 255).
 */
function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Adjusts color to guarantee WCAG AA visibility against both dark graphite and pearl surfaces.
 */
function tuneAccentLuminance(r: number, g: number, b: number): { r: number; g: number; b: number } {
  let lum = getLuminance(r, g, b);

  // If too dark, boost brightness while keeping hue
  if (lum < 95) {
    const factor = (115) / Math.max(lum, 15);
    r = Math.min(255, r * factor);
    g = Math.min(255, g * factor);
    b = Math.min(255, b * factor);
  }
  // If blown out / near white, tone down slightly
  else if (lum > 225) {
    const factor = 205 / lum;
    r = r * factor;
    g = g * factor;
    b = b * factor;
  }

  // Ensure minimum chromatic vibrancy
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (sat < 0.15) {
    // Slight cool-slate lift for very muted photos
    r = Math.round(r * 0.9 + 56 * 0.1);
    g = Math.round(g * 0.9 + 189 * 0.1);
    b = Math.round(b * 0.9 + 248 * 0.1);
  }

  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

/**
 * Extracts dominant accent and ambient colors from an image source using an offscreen canvas.
 */
export async function extractPaletteFromImage(
  imageSource: string | File
): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    let objectUrl = '';
    let srcUrl = '';

    if (typeof imageSource === 'string') {
      srcUrl = imageSource;
    } else {
      objectUrl = URL.createObjectURL(imageSource);
      srcUrl = objectUrl;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          cleanup();
          resolve(DEFAULT_PALETTE);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        // Collect color samples
        interface ColorBin {
          r: number;
          g: number;
          b: number;
          count: number;
          score: number;
        }

        const bins: ColorBin[] = [];

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          const lum = getLuminance(r, g, b);
          // Filter out extreme pitch black and pure blown white
          if (lum < 20 || lum > 245) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;

          // Score colors favoring saturation and moderate luminance
          const lumScore = 1 - Math.abs(lum - 135) / 135;
          const score = (saturation * 2.2 + lumScore * 1.2);

          // Find nearby bin
          let found = false;
          for (const bin of bins) {
            const dist = Math.sqrt(
              Math.pow(r - bin.r, 2) + Math.pow(g - bin.g, 2) + Math.pow(b - bin.b, 2)
            );
            if (dist < 36) {
              bin.r = (bin.r * bin.count + r) / (bin.count + 1);
              bin.g = (bin.g * bin.count + g) / (bin.count + 1);
              bin.b = (bin.b * bin.count + b) / (bin.count + 1);
              bin.count += 1;
              bin.score += score;
              found = true;
              break;
            }
          }

          if (!found) {
            bins.push({ r, g, b, count: 1, score });
          }
        }

        if (bins.length === 0) {
          cleanup();
          resolve(DEFAULT_PALETTE);
          return;
        }

        // Sort bins by quality score
        bins.sort((a, b) => b.score - a.score);

        const primaryRaw = bins[0];
        const secondaryRaw = bins.length > 1 ? bins[1] : bins[0];

        const tunedPrimary = tuneAccentLuminance(primaryRaw.r, primaryRaw.g, primaryRaw.b);
        const hex = rgbToHex(tunedPrimary.r, tunedPrimary.g, tunedPrimary.b);
        const lum = getLuminance(tunedPrimary.r, tunedPrimary.g, tunedPrimary.b);

        // Text contrast inside filled elements
        const accentContrast = lum > 145 ? '#0F172A' : '#FFFFFF';

        const palette: ExtractedPalette = {
          primaryAccent: `rgb(${tunedPrimary.r}, ${tunedPrimary.g}, ${tunedPrimary.b})`,
          primaryAccentHex: hex,
          ambientGlow: `rgba(${tunedPrimary.r}, ${tunedPrimary.g}, ${tunedPrimary.b}, 0.28)`,
          ambientSoft: `rgba(${secondaryRaw.r}, ${secondaryRaw.g}, ${secondaryRaw.b}, 0.12)`,
          accentContrast,
        };

        cleanup();
        resolve(palette);
      } catch (err) {
        console.warn('Failed to extract palette:', err);
        cleanup();
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      cleanup();
      resolve(DEFAULT_PALETTE);
    };

    img.src = srcUrl;
  });
}

/**
 * Applies dynamic palette to root CSS custom properties with smooth transitions.
 */
export function applyPaletteToDocument(palette: ExtractedPalette) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--trx-accent', palette.primaryAccentHex);
  root.style.setProperty('--trx-accent-glow', palette.ambientGlow);
  root.style.setProperty('--trx-ambient-glow', palette.ambientGlow);
  root.style.setProperty('--trx-ambient-soft', palette.ambientSoft);
  root.style.setProperty('--trx-accent-contrast', palette.accentContrast);
}
