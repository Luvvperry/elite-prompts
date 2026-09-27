export type Language = 'en' | 'es' | 'pt';
export type PromptLanguage = 'auto' | 'en' | 'es' | 'pt';

export type InputMode = 'image' | 'idea';

export type ModalityType = 
  | 'person'
  | 'object_pov'
  | 'scene'
  | 'vehicle'
  | 'product'
  | 'interior'
  | 'architecture'
  | 'edit_prompt';

export type ViewMode = 'simple' | 'advanced';

// Device type expanded to string to support the full library, while preserving existing literal unions
export type DeviceType = 
  | 'iPhone 15 Pro'
  | 'iPhone 16 Pro Max'
  | 'iPhone 16 Pro'
  | 'iPhone 15 Pro Max'
  | 'iPhone 14 Pro'
  | 'iPhone 13'
  | 'Galaxy S24 Ultra'
  | 'Pixel 9 Pro'
  | 'Professional Camera'
  | (string & {});

export type LookType = 'RAW' | 'Standard' | 'Film' | 'Portra 400';
export type SharpnessType = 'Natural' | 'Crisp' | 'Soft';
export type HDRType = 'Natural' | 'Smart HDR' | 'Low Contrast';

export interface CameraSettings {
  strictRealism: boolean;
  device: DeviceType;
  look: LookType;
  sharpness: SharpnessType;
  hdr: HDRType;
}

export type ReferenceRole = 
  | 'identity'
  | 'face'
  | 'outfit'
  | 'pose'
  | 'location'
  | 'vehicle'
  | 'lighting'
  | 'style'
  | 'object'
  | 'full_image';

export type ReferencePriority = 'loose' | 'balanced' | 'strong' | 'absolute';

export interface ReferenceImage {
  id: string;
  dataUrl: string;
  name: string;
  roles: ReferenceRole[];
  subjectAssignment?: 'Subject A' | 'Subject B' | 'General';
}

// 04 — CAPTURE PROFILE (Defines how the photo should look and feel)
export type CaptureProfile = 
  | 'auto'
  | 'raw_smartphone'
  | 'clean_smartphone'
  | 'night_flash'
  | 'low_light'
  | 'candid'
  | 'social_media'
  | 'pov'
  | 'mirror'
  | 'selfie'
  | 'documentary'
  | 'automotive_casual'
  | 'object_pov_raw';

// CAMERA MODE (Independent from physical device)
export type CameraMode = 
  | 'auto'
  | 'rear_main'
  | 'rear_ultrawide'
  | 'rear_1x'
  | 'rear_2x'
  | 'rear_3x'
  | 'rear_telephoto'
  | 'front_camera'
  | 'mirror_selfie'
  | 'handheld_pov'
  | 'chest_pov'
  | 'overhead'
  | 'low_angle';

// CAMERA FEEL (Imperfections and capture demeanor)
export type CameraFeel = 
  | 'auto'
  | 'very_raw'
  | 'casual'
  | 'clean'
  | 'slightly_shaky'
  | 'quick_snapshot'
  | 'distracted_capture'
  | 'social_media'
  | 'low_light'
  | 'direct_flash'
  | 'older_phone_look';

// Comprehensive Aspect Ratios
export type AspectRatioType = 
  | 'auto' 
  | '1:1' 
  | '4:5' 
  | '5:4' 
  | '3:4' 
  | '4:3' 
  | '2:3' 
  | '3:2' 
  | '9:16' 
  | '16:9' 
  | '9:21' 
  | '21:9' 
  | '1:2' 
  | '2:1' 
  | 'a4_portrait' 
  | 'a4_landscape' 
  | 'mobile_wallpaper' 
  | 'desktop_wallpaper' 
  | 'custom';

// OUTPUT FORMAT (Social/Commercial presets that auto-sync Aspect Ratio)
export type OutputFormatId = 
  | 'auto'
  | 'ig_square'
  | 'ig_portrait'
  | 'ig_story'
  | 'ig_reel'
  | 'tiktok'
  | 'youtube_thumb'
  | 'youtube_shorts'
  | 'facebook_feed'
  | 'facebook_story'
  | 'x_post'
  | 'linkedin_post'
  | 'pinterest_pin'
  | 'whatsapp_status'
  | 'telegram_story'
  | 'mobile_wallpaper'
  | 'desktop_wallpaper'
  | 'website_hero'
  | 'ecommerce_product'
  | 'custom';

export type SurfaceType = 
  | 'auto'
  | 'wood_table'
  | 'glass_table'
  | 'stone'
  | 'concrete'
  | 'car_hood'
  | 'car_interior'
  | 'leather'
  | 'fabric'
  | 'bed'
  | 'floor'
  | 'counter'
  | 'desk'
  | 'metal'
  | 'asphalt'
  | 'grass'
  | 'sand'
  | 'custom';

export type EnvironmentCondition = 
  | 'auto'
  | 'very_clean'
  | 'normal'
  | 'lived_in'
  | 'slightly_messy'
  | 'messy'
  | 'raw'
  | 'dusty'
  | 'used'
  | 'wet'
  | 'dry';

export type ObjectRealism = 
  | 'clean_product'
  | 'natural'
  | 'used'
  | 'very_used'
  | 'imperfect'
  | 'raw';

export interface POVDetails {
  handVisibility: 'auto' | 'one_hand' | 'both_hands' | 'no_hands';
  gripType: 'auto' | 'holding' | 'touching' | 'opening' | 'eating' | 'using' | 'resting' | 'placed' | 'steering' | 'drinking_eating';
  heldObject: string;
  pointOfViewHeight: 'auto' | 'hand' | 'waist' | 'chest' | 'eye' | 'overhead' | 'low' | 'tabletop_lookdown' | 'custom';
  objectDistance?: 'auto' | 'very_close' | 'close' | 'medium' | 'wide_context';
  objectPosition?: 'auto' | 'centered' | 'viewer_left' | 'viewer_right' | 'lower_frame' | 'upper_frame' | 'foreground';
  surface?: SurfaceType;
  customSurface?: string;
  objectRealism?: ObjectRealism;
}

export type PhotographicStyle = 
  | 'auto'
  | 'casual_smartphone'
  | 'pov'
  | 'candid'
  | 'street_photography'
  | 'social_media_ugc'
  | 'night_photography'
  | 'portrait'
  | 'editorial'
  | 'fashion'
  | 'luxury_lifestyle'
  | 'automotive'
  | 'product_photography'
  | 'food'
  | 'architecture'
  | 'real_estate'
  | 'travel'
  | 'documentary'
  | 'cctv_security'
  | 'disposable_camera'
  | '35mm_film'
  | 'polaroid';

export type SubjectCount = '1' | '2' | '3' | 'group' | 'auto';
export type BodyPosition = 'auto' | 'standing' | 'sitting' | 'walking' | 'leaning' | 'crouching' | 'lying' | 'mid_action';
export type SubjectOrientation = 'auto' | 'front' | '3/4' | 'side' | 'rear_3/4' | 'back';
export type WeightDistribution = 'auto' | 'left' | 'right' | 'balanced' | 'dynamic';
export type PostureType = 'auto' | 'relaxed' | 'distracted' | 'casual' | 'leaning' | 'slouched' | 'upright' | 'walking' | 'running' | 'mid_action' | 'custom';
export type ExpressionType = 'auto' | 'neutral' | 'relaxed' | 'distracted' | 'focused' | 'serious' | 'subtle_smile' | 'laughing' | 'tired' | 'curious' | 'custom';
export type GazeType = 'auto' | 'at_camera' | 'away_from_camera' | 'down' | 'up' | 'left' | 'right' | 'at_object' | 'at_another_person';

export type FramingType = 
  | 'auto'
  | 'extreme_close_up'
  | 'close_up'
  | 'headshot'
  | 'chest_up'
  | 'waist_up'
  | 'medium'
  | 'three_quarter_body'
  | 'full_body'
  | 'wide'
  | 'environmental'
  | 'wide_environmental'
  | 'very_wide'
  | 'macro_detail'
  | 'close_object'
  | 'medium_object'
  | 'object_environment'
  | 'wide_context';

export type CameraDistanceExpanded = 
  | 'auto' 
  | 'very_close' 
  | 'close' 
  | '1m' 
  | '1.5m' 
  | '2m' 
  | '3m' 
  | '4m' 
  | '5m' 
  | '6_8m' 
  | '10m_plus';

export type CameraHeightExpanded = 
  | 'auto' 
  | 'ground' 
  | 'knee' 
  | 'waist' 
  | 'chest' 
  | 'eye' 
  | 'above_eye' 
  | 'high_angle' 
  | 'overhead' 
  | 'top_down';

export type CameraAngleExpanded = 
  | 'auto' 
  | 'front' 
  | 'slight_three_quarter' 
  | 'three_quarter' 
  | 'side' 
  | 'rear_three_quarter' 
  | 'back' 
  | 'low_angle' 
  | 'high_angle' 
  | 'top_down' 
  | 'dutch_tilt' 
  | 'casual_imperfect';

export type ActionMoment = 
  | 'auto'
  | 'static'
  | 'before_action'
  | 'mid_action'
  | 'impact_moment'
  | 'immediately_after'
  | 'walking'
  | 'turning'
  | 'sitting_down'
  | 'standing_up'
  | 'reaching'
  | 'holding'
  | 'using_object'
  | 'distracted'
  | 'waiting'
  | 'talking'
  | 'laughing'
  | 'eating'
  | 'drinking'
  | 'smoking'
  | 'driving'
  | 'custom';

export type FlashExpanded = 
  | 'auto'
  | 'off'
  | 'on'
  | 'direct'
  | 'hard_direct'
  | 'strong'
  | 'slight_blowout'
  | 'heavy_blowout'
  | 'close_range_flash'
  | 'night_flash';

export type AICleanupLevel = 'none' | 'low' | 'medium' | 'high';

export type ImperfectionKey = 
  | 'motion_blur_slight'
  | 'motion_blur_medium'
  | 'motion_blur_strong'
  | 'focus_miss_small'
  | 'soft_focus'
  | 'digital_noise'
  | 'high_iso_noise'
  | 'flash_blowout'
  | 'white_balance_error'
  | 'compression'
  | 'lens_smudge'
  | 'finger_near_lens'
  | 'minor_camera_shake'
  | 'crooked_horizon'
  | 'slight_underexposure'
  | 'slight_overexposure';

export interface PreserveLocks {
  face: boolean;
  hair: boolean;
  skinTone: boolean;
  body: boolean;
  height: boolean;
  outfit: boolean;
  accessories: boolean;
  pose: boolean;
  vehicle: boolean;
  object: boolean;
  environment: boolean;
  camera: boolean;
  lighting: boolean;
}

export type CameraDeviceAdvanced = 'auto' | 'iphone_rear' | 'iphone_front' | 'smartphone_rear' | 'professional_camera';
export type CameraLens = 'auto' | '0.5x' | '1x' | '2x' | '3x' | '24mm' | '35mm' | '50mm';
export type CameraDistance = CameraDistanceExpanded;
export type CameraHeight = CameraHeightExpanded;
export type CameraAngle = CameraAngleExpanded;
export type CameraFraming = FramingType;

export type LightTime = 'auto' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'blue_hour' | 'night' | 'late_night';
export type LightSource = 'auto' | 'natural' | 'phone_flash' | 'streetlight' | 'window' | 'ceiling_light' | 'lamp' | 'mixed_light' | 'no_artificial';
export type FlashMode = 'auto' | 'on' | 'off';
export type FlashBehavior = 'normal' | 'strong' | 'slight_blowout' | 'hard_direct' | 'natural_falloff';

export interface WardrobeSettings {
  top: string;
  bottom: string;
  shoes: string;
  outerwear: string;
  accessories: string;
  headwear: string;
  jewelryWatch: string;
  customDetails: string;
  referenceLock: boolean;
}

export interface VehicleSettings {
  customVehicle: string;
  modelLock: boolean;
  exteriorColor: string;
  interiorColor: string;
  driverPassenger: 'driver' | 'passenger' | 'auto';
  doorState: 'open' | 'closed' | 'auto';
  subjectRelation: 'inside' | 'driving' | 'entering' | 'exiting' | 'leaning_against' | 'standing_near' | 'sitting_on' | 'custom';
}

export interface EnvironmentSettings {
  location: string;
  setting: string;
  background: string;
  timeOfDay: string;
  weather: string;
  crowd: string;
  naturalClutter: boolean;
  mood: 'ordinary' | 'premium' | 'luxury' | 'raw';
  avoidPostcard: boolean;
  avoidGenericLuxury: boolean;
  condition?: EnvironmentCondition;
}

export interface AdvancedFineControl {
  subject: string;
  action: string;
  location: string;
  environment: string;
  background: string;
  atmosphere: string;
  imperfections: string;
  purpose: string;
  referenceUse: string;
  textInsideImage: string;
  avoid: string;
  additionalInstructions: string;
}

export interface AutoDetectedParams {
  subjectCount?: string;
  pose?: string;
  behavior?: string;
  gaze?: string;
  expression?: string;
  camera?: string;
  lens?: string;
  distance?: string;
  framing?: string;
  flash?: string;
  time?: string;
  environment?: string;
  vehicle?: string;
  activity?: string;
  lighting?: string;
  captureProfile?: string;
  surface?: string;
}

export interface FullSettings {
  // Legacy / Basic
  strictRealism: boolean;
  device: DeviceType;
  look: LookType;
  sharpness: SharpnessType;
  hdr: HDRType;

  // Simple Mode Controls
  outputModel: string;
  aspectRatio: AspectRatioType;
  outputFormat?: OutputFormatId;
  photographicStyle: PhotographicStyle;
  captureProfile: CaptureProfile;
  realismLevel: number; // 50 to 100

  // New Camera Controls
  cameraMode: CameraMode;
  cameraFeel: CameraFeel;

  // Advanced Sliders (defaults favor natural realism)
  imperfectionLevel: number; // 0 to 100
  cinematicLevel: number; // 0 to 100 (default low)
  stylizationLevel: number; // 0 to 100 (default 0)
  backgroundDetailLevel: number; // 0 to 100
  blurLevel: number; // 0 to 100 (default low/natural)
  realismTier?: 'natural' | 'raw' | 'very_raw' | 'forensic';
  aiCleanup?: AICleanupLevel;

  // Advanced Subject
  subjectCount: SubjectCount;
  subjectHeight: string;
  bodyPosition: BodyPosition;
  orientation: SubjectOrientation;
  weightDistribution: WeightDistribution;
  posture: PostureType;
  customPosture: string;
  expression: ExpressionType;
  customExpression: string;
  gaze: GazeType;
  actionDescription: string;
  actionMoment?: ActionMoment;

  // Advanced Camera
  cameraDevice: CameraDeviceAdvanced;
  cameraLens: CameraLens;
  cameraDistance: CameraDistance;
  cameraHeight: CameraHeight;
  cameraAngle: CameraAngle;
  cameraFraming: CameraFraming;

  // Advanced Light
  lightTime: LightTime;
  lightSource: LightSource;
  flashMode: FlashMode;
  flashBehavior: FlashBehavior;
  flashExpanded?: FlashExpanded;

  // Imperfections (Legacy object + new multi-select list)
  imperfections: {
    motionBlur: boolean;
    slightFocusMiss: boolean;
    digitalNoise: boolean;
    flashBlowout: boolean;
    whiteBalanceShift: boolean;
    compression: boolean;
    lensSmudge: boolean;
    minorCameraShake: boolean;
  };
  activeImperfections?: ImperfectionKey[];

  // Wardrobe & Vehicle
  wardrobe: WardrobeSettings;
  vehicle: VehicleSettings;
  environment: EnvironmentSettings;

  // Reference Priority
  referencePriority: ReferencePriority;

  // Fine Control
  fineControl: AdvancedFineControl;

  // Auto Detect toggle
  autoDetect: boolean;

  // Locks
  preserveLocks?: PreserveLocks;

  // POV details
  pov?: POVDetails;
}

export interface GenerationOutput {
  v1: string; // V1 — Smart Natural Snapshot
  v2: string; // V2 — Structured Realism (with {} blocks)
  v3: string; // V3 — Forensic Deep Prompt (adaptive curly-brace final prompt, not a meta-blueprint)
  v4: string; // V4 — Scene-Lock Consistency Engine
  v5: string; // V5 — Master Adaptive Image Prompt
  negativePrompt?: string;
  timestamp: number;
  id: string;
  mode: InputMode;
  modality: ModalityType;
  selectedTypeId?: string;
  promptLanguage: PromptLanguage;
  inputIdea?: string;
  referenceImagesMeta?: Array<{ name: string; roles: ReferenceRole[] }>;
  autoDetected?: AutoDetectedParams;
  settingsSnapshot: FullSettings;
}

export type PromptResult = string;

export interface PresetItem {
  id: string;
  name: string;
  isDefault?: boolean;
  description?: string;
  settings: Partial<FullSettings>;
}
