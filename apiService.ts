import type {
  BatchPromptItem,
  DetectedTargets,
  ExifData,
  ImageAnalysis,
  LifestylePromptProposal,
} from './types';

export interface AnalyzeResult {
  positive: string;
  negative: string;
  detectedSummary: string;
  analysis?: ImageAnalysis;
  detectedTargets?: DetectedTargets;
}

export interface IdeaPromptResult {
  positive: string;
  negative: string;
  detectedSummary?: string;
}

export interface BatchProgressCallbackData {
  completed: number;
  total: number;
  newPrompts: BatchPromptItem[];
}

export interface LifestyleAnalysisResult {
  aestheticSummary: string;
  colorPalette: string[];
  proposals: LifestylePromptProposal[];
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let response: Response | null = null;
  let payload: any = {};
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    payload = await response.json().catch(() => ({}));
    if (response.ok) return payload as T;
    const retryable = response.status === 429 || response.status === 503 || payload?.retryable === true;
    if (!retryable || attempt === 1) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(payload?.error || `Request failed (${response?.status || 'network error'})`);
}

export const analyzeImage = (
  base64Image: string,
  mimeType: string,
  lensType = 'auto',
  detailLevel = 3,
  addNoise = false,
  customInstructions = '',
  exifData: ExifData | null = null,
  aspectRatio = 'auto',
  heightCm?: number | string | null,
  weightKg?: number | string | null,
  language = 'es',
  identityBase64?: string | null,
  identityMimeType?: string | null,
  keepExactWardrobe = true,
  manualBrand = '',
) => post<AnalyzeResult>('/api/analyze-image', {
  base64Image,
  mimeType,
  lensType,
  detailLevel,
  addNoise,
  customInstructions,
  exifData,
  aspectRatio,
  heightCm,
  weightKg,
  language,
  identityBase64,
  identityMimeType,
  keepExactWardrobe,
  manualBrand,
});

export const generatePromptFromIdea = (
  ideaText: string,
  gestureOption?: string,
  moodOption?: string,
  aspectRatio = 'auto',
  heightCm?: number | string | null,
  weightKg?: number | string | null,
  modeOrLanguage: 'auto' | 'manual' | string = 'auto',
  languageParam = 'es',
) => {
  let mode: 'auto' | 'manual' = 'auto';
  let language = 'es';
  if (modeOrLanguage === 'auto' || modeOrLanguage === 'manual') {
    mode = modeOrLanguage;
    language = languageParam || 'es';
  } else {
    language = modeOrLanguage;
    if (languageParam === 'auto' || languageParam === 'manual') mode = languageParam;
  }
  return post<IdeaPromptResult>('/api/generate-idea-prompt', {
    ideaText,
    gestureOption,
    moodOption,
    aspectRatio,
    heightCm,
    weightKg,
    mode,
    language,
  });
};

export const generatePromptBatch = async (
  idea: string,
  totalQuantity = 100,
  country?: string,
  language = 'es',
  onProgress?: (data: BatchProgressCallbackData) => void,
  heightCm?: string,
  weightKg?: string,
  gender?: 'woman' | 'man' | 'none' | null,
): Promise<BatchPromptItem[]> => {
  const targetQuantity = Math.max(1, Math.min(300, totalQuantity));
  const chunkSize = targetQuantity <= 6 ? targetQuantity : targetQuantity <= 30 ? 5 : 6;
  const all: BatchPromptItem[] = [];
  for (let start = 1; start <= targetQuantity; start += chunkSize) {
    const count = Math.min(chunkSize, targetQuantity - start + 1);
    try {
      const result = await post<{ items: BatchPromptItem[] }>('/api/generate-prompt-batch', {
        idea,
        count,
        startIdx: start,
        endIdx: start + count - 1,
        country,
        language,
        heightCm,
        weightKg,
        gender,
      });
      const items = Array.isArray(result.items) ? result.items : [];
      all.push(...items);
      onProgress?.({ completed: all.length, total: targetQuantity, newPrompts: items });
    } catch (error) {
      console.warn(`Batch chunk ${start}-${start + count - 1} failed`, error);
    }
  }
  return all.slice(0, targetQuantity);
};

export const generateLifestylePrompts = (
  base64Image: string,
  mimeType: string,
  language = 'es',
  previousConcepts: string[] = [],
) => post<LifestyleAnalysisResult>('/api/generate-lifestyle-prompts', {
  base64Image,
  mimeType,
  language,
  previousConcepts,
});
