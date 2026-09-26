import { 
  FullSettings, 
  GenerationOutput, 
  InputMode, 
  ModalityType, 
  PromptLanguage, 
  ReferenceImage, 
  AutoDetectedParams 
} from "../types";

export const generateAllPrompts = async (
  mode: InputMode,
  modality: ModalityType,
  promptLanguage: PromptLanguage,
  ideaText: string,
  references: ReferenceImage[],
  settings: FullSettings,
  selectedTypeId: string = 'person'
): Promise<{
  v1: string;
  v2: string;
  v3: string;
  negativePrompt?: string;
  autoDetected: AutoDetectedParams;
}> => {
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
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status}) while generating prompts.`);
  }

  return response.json();
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
  modality: ModalityType
): Promise<string> => {
  const trimmedIdea = rawIdea?.trim() || '';
  if (!trimmedIdea) return rawIdea;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('/api/magic-enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawIdea: trimmedIdea,
        modality,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Magic Enhance server error (${response.status})`);
    }

    const enhanced = typeof data.enhanced === 'string' ? data.enhanced.trim() : '';
    if (!enhanced) throw new Error('Magic Enhance returned an empty result');
    return enhanced;
  } catch (e) {
    const error = e instanceof DOMException && e.name === 'AbortError'
      ? new Error('Magic Enhance timed out')
      : e;
    console.error('Magic Enhance failed:', error);
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
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
