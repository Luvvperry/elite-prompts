
export interface ExifData {
  Make?: string;
  Model?: string;
  FNumber?: number;
  ExposureTime?: number;
  ISO?: number;
  FocalLength?: number;
}

export interface PsychologicalAnalysis {
  energySummary: string;
  strengths: string;
  weaknesses: string;
  realismAdjustments: string;
  postureRefinements: string;
  lightingAdjustments: string;
  facialRefinements: string;
}

export interface CoherenceAnalysis {
  coherenceSummary: string;
  alignedElements: string;
  inconsistentElements: string;
  narrativeAdjustments: string;
  lightingRefinements: string;
  postureAdjustments: string;
  environmentalRefinements: string;
}

export interface BiomechanicsAnalysis {
  biomechanicsSummary: string;
  excessiveRigidity: string;
  artificialSymmetry: string;
  unnaturalFingerPositioning: string;
  stiffness: string;
  weightDistribution: string;
  microAdjustments: string;
}

export interface EnvironmentalInteractionAnalysis {
  interactionSummary: string;
  clothingBehavior: string;
  hairResponse: string;
  motionCues: string;
  backgroundElements: string;
  lightDiffusion: string;
  environmentalRefinements: string;
}

export interface PhysicalGroundingAnalysis {
  groundingSummary: string;
  contactShadows: string;
  footCompression: string;
  lightBounce: string;
  perspectiveAlignment: string;
  depthConsistency: string;
  floatingDetection: string;
  groundingCorrections: string;
}

export interface DetailConsistencyAnalysis {
  consistencySummary: string;
  facialRendering: string;
  backgroundDetail: string;
  textureImbalance: string;
  microContrast: string;
  sharpnessZones: string;
  detailRefinements: string;
}

export interface BehavioralRealismAnalysis {
  behavioralSummary: string;
  postureTension: string;
  gazeLogic: string;
  handBehavior: string;
  facialBodyMismatch: string;
  stiffness: string;
  behavioralRefinements: string;
}

export interface VisualNarrativeCongruenceAnalysis {
  congruenceSummary: string;
  postureEmotionContradictions: string;
  subjectEnvironmentMismatch: string;
  statusInconsistencies: string;
  emotionalIncoherence: string;
  subconsciousDiscomfort: string;
  congruenceRefinements: string;
}

export interface SmartphoneRealismCalibrationAnalysis {
  calibrationSummary: string;
  brightnessAndContrast: string;
  shadowsAndHighlights: string;
  colorAndSaturation: string;
  skinToneRealism: string;
  sharpnessAndClarity: string;
  noiseAndArtifacts: string;
  calibrationRecommendations: string;
}

export interface ImageAnalysis {
  quality: string;
  environment: string;
  lighting: string;
  colorPalette: string;
  suggestions: string;
  lensDistortion?: string;
  wardrobeAnalysis?: string;
  brandAnalysis?: string;
  captureAuthenticity?: string;
  psychologicalAnalysis?: PsychologicalAnalysis;
  coherenceAnalysis?: CoherenceAnalysis;
  biomechanicsAnalysis?: BiomechanicsAnalysis;
  environmentalInteractionAnalysis?: EnvironmentalInteractionAnalysis;
  physicalGroundingAnalysis?: PhysicalGroundingAnalysis;
  detailConsistencyAnalysis?: DetailConsistencyAnalysis;
  behavioralRealismAnalysis?: BehavioralRealismAnalysis;
  visualNarrativeCongruenceAnalysis?: VisualNarrativeCongruenceAnalysis;
  smartphoneRealismCalibrationAnalysis?: SmartphoneRealismCalibrationAnalysis;
  detectedTargets?: DetectedTargets;
}

export interface DetectedProbeTarget {
  x: number;
  y: number;
  label: string;
}

export interface DetectedTargets {
  subject?: DetectedProbeTarget;
  wardrobe?: DetectedProbeTarget;
  environment?: DetectedProbeTarget;
  lighting?: DetectedProbeTarget;
}

export interface ExtractedPalette {
  primaryAccent: string;
  primaryAccentHex: string;
  ambientGlow: string;
  ambientSoft: string;
  accentContrast: string;
}

export interface BatchPromptItem {
  id?: string;
  positive: string;
  negative: string;
}

export interface BatchPromptResult {
  id: string;
  idea: string;
  quantity: number;
  country?: string;
  detectedCountry?: string;
  heightCm?: string;
  weightKg?: string;
  gender?: 'woman' | 'man' | 'none';
  prompts: BatchPromptItem[];
  timestamp: number;
}

export interface LifestylePromptProposal {
  id: string;
  purpose: string;
  cameraZoom: '0.5x' | '1x' | '2x' | '3x';
  positive: string;
  negative: string;
}

export interface LifestyleResult {
  id: string;
  referenceImage: string;
  aestheticSummary?: string;
  colorPalette?: string[];
  proposals: LifestylePromptProposal[];
  timestamp: number;
}

export interface PromptResult {
  id: string;
  originalImage?: string;
  identityImage?: string;
  positivePrompt: string;
  negativePrompt: string;
  detectedSummary?: string;
  analysis?: ImageAnalysis | string;
  detectedTargets?: DetectedTargets;
  timestamp: number;
  isBatch?: boolean;
  batchData?: BatchPromptResult;
  isLifestyle?: boolean;
  lifestyleData?: LifestyleResult;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface UserStudioSettings {
  lensType: string;
  aspectRatio: string;
  heightCm: string;
  weightKg: string;
  detailLevel: number;
  addNoise: boolean;
  keepExactWardrobe: boolean;
  manualBrand: string;
  customInstructions: string;
  autoSaveEnabled?: boolean;
  lastSavedAt?: number;
}

export const DEFAULT_USER_SETTINGS: UserStudioSettings = {
  lensType: 'auto',
  aspectRatio: 'auto',
  heightCm: '',
  weightKg: '',
  detailLevel: 3,
  addNoise: false,
  keepExactWardrobe: true,
  manualBrand: '',
  customInstructions: '',
  autoSaveEnabled: false,
};
