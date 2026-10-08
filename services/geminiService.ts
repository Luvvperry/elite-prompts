import {
  FullSettings,
  GenerationOutput,
  InputMode,
  ModalityType,
  PromptLanguage,
  ReferenceImage,
  AutoDetectedParams
} from "../types";

// Safe in-memory cache for prompt generations
interface CacheEntry {
  result: {
    v1: string;
    v2: string;
    v3: string;
    negativePrompt?: string;
    autoDetected: AutoDetectedParams;
  };
  timestamp: number;
}
const promptCache = new Map<string, CacheEntry>();
const CACHE_MAX_ENTRIES = 30;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface GeneratePromptsPayload {
  mode: InputMode;
  modality: ModalityType;
  promptLanguage: PromptLanguage;
  ideaText: string;
  references: ReferenceImage[];
  settings: FullSettings;
  selectedTypeId?: string;
  targetEngine?: 'v1' | 'v2' | 'v3' | 'compare' | 'all';
  skipAutoDetect?: boolean;
  signal?: AbortSignal;
}

export const generateAllPrompts = async (
  modeOrOpts: InputMode | GeneratePromptsPayload,
  modalityParam?: ModalityType,
  promptLanguageParam?: PromptLanguage,
  ideaTextParam?: string,
  referencesParam?: ReferenceImage[],
  settingsParam?: FullSettings,
  selectedTypeIdParam: string = 'person',
  targetEngineParam: 'v1' | 'v2' | 'v3' | 'compare' | 'all' = 'v2',
  signalParam?: AbortSignal
): Promise<{
  v1: string;
  v2: string;
  v3: string;
  negativePrompt?: string;
  autoDetected: AutoDetectedParams;
}> => {
  let mode: InputMode;
  let modality: ModalityType;
  let promptLanguage: PromptLanguage;
  let ideaText: string;
  let references: ReferenceImage[];
  let settings: FullSettings;
  let selectedTypeId: string;
  let targetEngine: 'v1' | 'v2' | 'v3' | 'compare' | 'all';
  let skipAutoDetect = false;
  let signal: AbortSignal | undefined;

  if (typeof modeOrOpts === 'object') {
    mode = modeOrOpts.mode;
    modality = modeOrOpts.modality;
    promptLanguage = modeOrOpts.promptLanguage;
    ideaText = modeOrOpts.ideaText || '';
    references = modeOrOpts.references || [];
    settings = modeOrOpts.settings;
    selectedTypeId = modeOrOpts.selectedTypeId || 'person';
    targetEngine = modeOrOpts.targetEngine || 'v2';
    skipAutoDetect = !!modeOrOpts.skipAutoDetect;
    signal = modeOrOpts.signal;
  } else {
    mode = modeOrOpts;
    modality = modalityParam || 'person';
    promptLanguage = promptLanguageParam || 'pt';
    ideaText = ideaTextParam || '';
    references = referencesParam || [];
    settings = settingsParam!;
    selectedTypeId = selectedTypeIdParam;
    targetEngine = targetEngineParam;
    signal = signalParam;
  }

  // Build exact deterministic cache signature
  const refSignatures = (references || []).map(r => `${r.id}_${(r.roles || []).join(',')}_${r.subjectAssignment || ''}_${r.dataUrl ? r.dataUrl.length + '_' + r.dataUrl.slice(-60) : ''}`);
  const cacheKey = JSON.stringify({
    m: mode,
    mod: modality,
    t: selectedTypeId,
    lang: promptLanguage,
    idea: ideaText.trim(),
    eng: targetEngine,
    skipAutoDetect,
    refs: refSignatures,
    s: {
      dev: settings.device,
      asp: settings.aspectRatio,
      fmt: settings.outputFormat,
      sty: settings.photographicStyle,
      cap: settings.captureProfile,
      camMode: settings.cameraMode,
      camFeel: settings.cameraFeel,
      fls: settings.flashExpanded,
      act: settings.actionMoment,
      rea: settings.realismLevel,
      imp: settings.imperfectionLevel,
      cin: settings.cinematicLevel,
      subCount: settings.subjectCount,
      bodyPos: settings.bodyPosition,
      gaze: settings.gaze,
      exp: settings.expression,
      ward: settings.wardrobe,
      veh: settings.vehicle,
      env: settings.environment,
      fine: settings.fineControl
    }
  });

  // Check cache (instant 0ms response for identical inputs)
  const cached = promptCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.result;
  }

  const response = await fetch('/api/generate-prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode,
      modality,
      promptLanguage,
      ideaText,
      references,
      settings,
      selectedTypeId,
      targetEngine,
      skipAutoDetect,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status}) while generating prompts.`);
  }

  const result = await response.json();

  // Save to LRU cache
  if (promptCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = promptCache.keys().next().value;
    if (oldestKey) promptCache.delete(oldestKey);
  }
  promptCache.set(cacheKey, { result, timestamp: Date.now() });

  return result;
};

// Legacy generatePrompts wrapper for backwards compatibility
export const generatePrompts = async (
  imageBuffer: string,
  settings: any
): Promise<string> => {
  const references: ReferenceImage[] = [{
    id: 'legacy-1',
    dataUrl: imageBuffer,
    name: 'uploaded_image.jpg',
    roles: ['full_image']
  }];

  const fullSettings: FullSettings = {
    strictRealism: settings.strictRealism ?? true,
    device: settings.device ?? 'iPhone 16 Pro',
    look: settings.look ?? 'RAW',
    sharpness: settings.sharpness ?? 'Natural',
    hdr: settings.hdr ?? 'Natural',
    outputModel: 'gemini-3.1-pro-preview',
    aspectRatio: '3:4',
    photographicStyle: 'casual_smartphone',
    captureProfile: 'auto',
    realismLevel: 95,
    cameraMode: 'auto',
    cameraFeel: 'auto',
    actionMoment: 'auto',
    flashExpanded: 'auto',
    imperfectionLevel: 45,
    cinematicLevel: 10,
    stylizationLevel: 0,
    backgroundDetailLevel: 80,
    blurLevel: 5,
    subjectCount: 'auto',
    subjectHeight: '',
    bodyPosition: 'auto',
    orientation: 'auto',
    weightDistribution: 'auto',
    posture: 'auto',
    customPosture: '',
    expression: 'auto',
    customExpression: '',
    gaze: 'auto',
    actionDescription: '',
    cameraDevice: 'auto',
    cameraLens: 'auto',
    cameraDistance: 'auto',
    cameraHeight: 'auto',
    cameraAngle: 'auto',
    cameraFraming: 'auto',
    lightTime: 'auto',
    lightSource: 'auto',
    flashMode: 'auto',
    flashBehavior: 'normal',
    imperfections: {
      motionBlur: false,
      slightFocusMiss: true,
      digitalNoise: true,
      flashBlowout: false,
      whiteBalanceShift: false,
      compression: false,
      lensSmudge: false,
      minorCameraShake: true
    },
    wardrobe: {
      top: '', bottom: '', shoes: '', outerwear: '', accessories: '', headwear: '', jewelryWatch: '', customDetails: '', referenceLock: true
    },
    vehicle: {
      customVehicle: '', modelLock: true, exteriorColor: '', interiorColor: '', driverPassenger: 'auto', doorState: 'auto', subjectRelation: 'leaning_against'
    },
    environment: {
      location: '', setting: '', background: '', timeOfDay: '', weather: '', crowd: '', naturalClutter: true, mood: 'ordinary', avoidPostcard: true, avoidGenericLuxury: true
    },
    referencePriority: 'absolute',
    fineControl: {
      subject: '', action: '', location: '', environment: '', background: '', atmosphere: '', imperfections: '', purpose: '', referenceUse: '', textInsideImage: '', avoid: '', additionalInstructions: ''
    },
    autoDetect: true
  };

  const res = await generateAllPrompts('image', 'person', 'auto', '', references, fullSettings, 'person');
  return res.v1;
};

// Magic Enhance for User Idea
export const magicEnhanceIdea = async (
  rawIdea: string,
  modality: ModalityType,
  signal?: AbortSignal
): Promise<string> => {
  const input = typeof rawIdea === 'string' ? rawIdea.trim() : '';
  if (!input) throw new Error('EMPTY_ENHANCE_INPUT');

  const response = await fetch('/api/magic-enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawIdea: input, modality }),
    signal,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    throw new Error(response.ok ? 'INVALID_ENHANCE_RESPONSE' : 'SERVER_ERROR');
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'error' in data
      ? String((data as { error?: unknown }).error || 'SERVER_ERROR')
      : 'SERVER_ERROR';
    if (response.status === 429 || /429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(message)) {
      throw new Error('RATE_LIMIT');
    }
    if (response.status === 408 || response.status === 504 || /TIMEOUT/i.test(message)) {
      throw new Error('TIMEOUT');
    }
    if (response.status >= 500) throw new Error('SERVER_ERROR');
    throw new Error(message || 'UNKNOWN');
  }

  const enhanced = typeof data === 'object' && data !== null && 'enhanced' in data
    ? (data as { enhanced?: unknown }).enhanced
    : null;
  if (typeof enhanced !== 'string' || !enhanced.trim()) {
    throw new Error('EMPTY_ENHANCE_RESPONSE');
  }
  return enhanced.trim();
};

// Refine Prompt with Specific Delta
export const refinePrompt = async (
  targetEngine: 'v1' | 'v2' | 'v3',
  originalPrompt: string,
  refinementDirective: string
): Promise<string> => {
  const response = await fetch('/api/refine-prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetEngine,
      originalPrompt,
      refinementDirective,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status}) while refining prompt.`);
  }

  const data = await response.json();
  return data.refined || originalPrompt;
};

// Quick Contextual Auto-Detect for Idea or Image
export const detectContextualParams = async (
  text: string,
  images: ReferenceImage[]
): Promise<AutoDetectedParams> => {
  try {
    const response = await fetch('/api/detect-params', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        images,
      }),
    });

    if (!response.ok) {
      return {};
    }

    return response.json();
  } catch (err) {
    console.error("Auto detect failed:", err);
    return {};
  }
};
