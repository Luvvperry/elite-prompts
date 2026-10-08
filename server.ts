import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get GoogleGenAI client with required User-Agent header
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please check your environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withDeadline = async <T>(promise: Promise<T>, ms: number, code = 'REQUEST_TIMEOUT'): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(code)), ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const isRateLimit = (err: any): boolean => {
  if (!err) return false;
  const status = err.status || err.code || err.statusCode;
  if (status === 429) return true;
  const str = String(err?.message || err || '');
  return /429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(str);
};

const isTransientError = (err: any): boolean => {
  if (!err) return false;
  const status = err.status || err.code || err.statusCode;
  if (status === 503 || status === 500) return true;
  const str = String(err?.message || err || '');
  return /503|UNAVAILABLE|high demand|temporar/i.test(str);
};

const cleanErrorMessage = (err: any): string => {
  if (!err) return "High model demand. Please try again shortly.";
  let str = err?.message || String(err);
  try {
    const jsonMatch = str.match(/\{[\s\S]*"message"\s*:\s*"([^"]+)"[\s\S]*\}/);
    if (jsonMatch && jsonMatch[1]) {
      str = jsonMatch[1];
    } else {
      const parsed = JSON.parse(str);
      if (parsed?.error?.message) str = parsed.error.message;
    }
  } catch {}

  if (/503|UNAVAILABLE|high demand/i.test(str)) {
    return "The model is currently experiencing high demand. Please try again in a few moments.";
  }
  if (/429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(str)) {
    return "AI generation rate limit reached. Please wait a moment before trying again.";
  }
  if (/TIMEOUT/i.test(str)) {
    return "Request took too long. Please try again.";
  }
  return str.replace(/https?:\/\/[^\s]+/g, '').trim() || "Failed to process request.";
};

// ============================================================================
// V1 SMART NATURAL PROMPT DEFINITION
// ============================================================================
const V1_SMART_INSTRUCTION = `
V1 IS THE SMART NATURAL SNAPSHOT ENGINE.
It is NOT a basic prompt, NOT a legacy boilerplate, and NOT a shorter copy of V2.
It should feel like a highly competent human wrote a compact, paste-ready smartphone-photo prompt from the actual scene evidence.

V1 GOAL:
- Preserve every explicit fact from the user and assigned references.
- Resolve the few physical details that matter most: subject placement, clothing behavior, action, camera position, light source, and causal imperfections.
- Keep it concise enough to scan quickly, but specific enough that the image generator cannot fall back to a generic scene.
- Default to casual smartphone realism when the user does not specify a different capture style.

V1 OUTPUT STYLE:
- Return ONLY the final V1 prompt. Never expose reasoning, analysis, checklists, role instructions, or system language.
- Write in the requested prompt-output language.
- Use natural clauses with a small number of adaptive {curly-brace} blocks.
- Use only blocks that matter to the scene. Do not mechanically print empty categories.
- State each important fact once, in the best block.

V1 PERSON TEMPLATE — adapt, localize, and omit irrelevant blocks:
PHOTO / SOLO PHOTO: create an image of the main person from the provided reference or user specification.
subject: {identity/reference fidelity only when applicable; body scale in frame and relevant physical build only when established}.
wearing: {piece-by-piece clothing, color, material, fit, visible accessories, and a few pose-caused folds/compressions}.
environment: {specific place, foreground/background anchors, everyday spatial context, no invented luxury/postcard scenery}.
action and posture: {the photographed instant, torso/head orientation, weight-bearing leg, arms/hands, gaze, and any contact with furniture/vehicle/object}.
the photo is taken: {smartphone/device, rear/front camera, 0.5x/1x/2x/3x if known, photographer position, approximate distance and camera height, framing/orientation}.
light and shadows: {actual source, direction, flash behavior if present, near/far exposure relationship, relevant reflections}.
photo imperfections: {only 1–4 causal flaws that fit the capture: minor shake, slight focus miss, digital shadow noise, flash clipping, WB mismatch, compression, crooked framing}.
skin / focus / format: {natural skin appropriate to distance, natural smartphone depth, no fake bokeh, selected aspect ratio/platform when relevant}.

V1 DUO / GROUP:
- Keep each important person separate enough that wardrobe, hands, action, gaze, and ownership of objects cannot merge.
- Give one shared environment/camera/light description after the subject-specific facts.

V1 OBJECT / POV:
Use a specialized compact structure instead of portrait language:
POV / OBJECT PHOTO.
main object: {material, finish, condition, orientation and scale}.
surface and contact: {what supports it, curvature/pressure/contact shadow, spills/grease/fingerprints/wear only when justified}.
environment: {real surrounding context and a few useful everyday anchors}.
interaction: {hands only if visible/requested; exact grip/contact rather than generic “holding naturally”}.
the photo is taken: {rear smartphone camera in POV, realistic height/distance/tilt and lens mode}.
light and imperfections: {actual source plus causal smartphone flaws}.
format: {requested ratio/platform}.

V1 QUALITY BAR:
- Replace vague “natural pose” with one or two concrete biomechanical facts.
- Replace vague “realistic lighting” with the actual source and its visible consequence.
- Replace vague “shot on iPhone” with camera side/mode + distance/height when the scene needs it.
- Do not invent brands, logos, tattoos, jewelry, landmarks, vehicles, or luxury décor.
- No automatic cinematic language, film grain, 35/50/85mm professional-lens language, studio lighting, or artificial portrait bokeh.
- Daylight defaults to flash off unless requested/physically justified. Direct phone flash at night has strong near-field exposure, rapid falloff, localized reflections, short nearby shadows, and a darker distant background.
- Low light uses digital/high-ISO/shadow/chroma noise, never analog film grain unless explicitly requested.
`;

// Helper to format settings guidance for prompt generation
const formatSettingsContext = (settings: any): string => {
  if (!settings) return '';
  const parts: string[] = [];

  if (settings.device) parts.push(`- Model/Device: ${settings.device}`);
  if (settings.look || settings.sharpness || settings.hdr) {
    parts.push(`- Look: ${settings.look || 'RAW'}, Sharpness: ${settings.sharpness || 'Natural'}, Dynamic Range: ${settings.hdr || 'Natural'}`);
  }
  if (settings.aspectRatio) parts.push(`- Aspect Ratio: ${settings.aspectRatio}`);
  if (settings.outputFormat && settings.outputFormat !== 'auto') parts.push(`- Output Format / Platform: ${settings.outputFormat}`);
  if (settings.photographicStyle) parts.push(`- Photographic Style: ${settings.photographicStyle}`);
  if (settings.realismLevel !== undefined) parts.push(`- Realism Priority: ${settings.realismLevel}%`);
  parts.push(`- Imperfection Level: ${settings.imperfectionLevel ?? 45}%, Cinematic Level: ${settings.cinematicLevel ?? 10}%, Stylization Level: ${settings.stylizationLevel ?? 0}%, Background Detail: ${settings.backgroundDetailLevel ?? 80}%, Blur Level: ${settings.blurLevel ?? 5}%`);

  if (settings.subjectCount && settings.subjectCount !== 'auto') parts.push(`- Subjects Count: ${settings.subjectCount}`);
  if (settings.bodyPosition && settings.bodyPosition !== 'auto') parts.push(`- Body Position: ${settings.bodyPosition}`);
  if (settings.orientation && settings.orientation !== 'auto') parts.push(`- Orientation: ${settings.orientation}`);
  if (settings.weightDistribution && settings.weightDistribution !== 'auto') parts.push(`- Weight Distribution: ${settings.weightDistribution}`);
  if (settings.posture && settings.posture !== 'auto') parts.push(`- Posture: ${settings.posture} ${settings.customPosture ? `(${settings.customPosture})` : ''}`);
  if (settings.expression && settings.expression !== 'auto') parts.push(`- Expression: ${settings.expression} ${settings.customExpression ? `(${settings.customExpression})` : ''}`);
  if (settings.gaze && settings.gaze !== 'auto') parts.push(`- Gaze: ${settings.gaze}`);
  if (settings.actionDescription) parts.push(`- Action Description: ${settings.actionDescription}`);

  if (settings.cameraDevice && settings.cameraDevice !== 'auto') parts.push(`- Camera Device: ${settings.cameraDevice}`);
  if (settings.cameraLens && settings.cameraLens !== 'auto') parts.push(`- Lens: ${settings.cameraLens}`);
  if (settings.cameraDistance && settings.cameraDistance !== 'auto') parts.push(`- Distance: ${settings.cameraDistance}`);
  if (settings.cameraHeight && settings.cameraHeight !== 'auto') parts.push(`- Height: ${settings.cameraHeight}`);
  if (settings.cameraAngle && settings.cameraAngle !== 'auto') parts.push(`- Angle: ${settings.cameraAngle}`);
  if (settings.cameraFraming && settings.cameraFraming !== 'auto') parts.push(`- Framing: ${settings.cameraFraming}`);

  if (settings.lightTime && settings.lightTime !== 'auto') parts.push(`- Light Time: ${settings.lightTime}`);
  if (settings.lightSource && settings.lightSource !== 'auto') parts.push(`- Light Source: ${settings.lightSource}`);
  if (settings.flashMode && settings.flashMode !== 'auto') parts.push(`- Flash: ${settings.flashMode} (${settings.flashBehavior || 'normal'})`);

  if (settings.captureProfile && settings.captureProfile !== 'auto') {
    const profileMap: Record<string, string> = {
      raw_smartphone: 'Casual raw smartphone photo, authentic mobile sensor processing, natural subtle imperfections, handheld glance',
      clean_smartphone: 'Clean crisp smartphone photography, sharp optics, natural daylight balance, zero fake studio look',
      night_flash: 'Direct mobile phone flash, darker background falloff, harsh specular contact shadows, fast shutter, authentic indoor/night phone snap',
      low_light: 'Realistic low-light digital grain, high ISO noise texture, natural exposure latitude, slightly softer focus',
      candid: 'Spontaneous candid capture, unposed body posture, authentic fleeting glance, natural framing',
      social_media: 'Authentic social media UGC photo, realistic smartphone perspective, relatable casual setting, zero commercial polish',
      pov: 'Authentic first-person point-of-view perspective, eye or chest height glance, realistic foreground interaction',
      mirror: 'Authentic mirror selfie or mirror reflection, natural phone held up, true mirror glass behavior and reflections',
      selfie: 'Authentic front-facing smartphone camera selfie, wide-angle arm-distance perspective, natural facial skin texture',
      documentary: 'Authentic photojournalistic documentary snapshot, neutral observation, natural scene reality, zero cinematic color grade',
      automotive_casual: 'Casual smartphone car snapshot, authentic automotive paint reflections, natural parking/street environment, no commercial car ad gloss',
      object_pov_raw: 'Tangible casual object photograph in first person, real surface context, authentic contact shadows and tactile hand interaction'
    };
    parts.push(`- Capture Profile Forensic Intent: ${profileMap[settings.captureProfile] || settings.captureProfile}`);
  }

  if (settings.cameraMode && settings.cameraMode !== 'auto') {
    parts.push(`- Camera Mode: ${settings.cameraMode}`);
  }
  if (settings.cameraFeel && settings.cameraFeel !== 'auto') {
    parts.push(`- Camera Feel / Capture Demeanor: ${settings.cameraFeel}`);
  }
  if (settings.actionMoment && settings.actionMoment !== 'auto') {
    parts.push(`- Action Moment: ${settings.actionMoment}`);
  }
  if (settings.flashExpanded && settings.flashExpanded !== 'auto') {
    parts.push(`- Flash Behavior: ${settings.flashExpanded}`);
  }

  const activeImperfections: string[] = [];
  if (settings.imperfections) {
    Object.entries(settings.imperfections)
      .filter(([_, v]) => v)
      .forEach(([k]) => activeImperfections.push(k.replace(/([A-Z])/g, ' $1').toLowerCase()));
  }
  if (settings.activeImperfections && settings.activeImperfections.length > 0) {
    settings.activeImperfections.forEach((imp: string) => activeImperfections.push(imp.replace(/_/g, ' ')));
  }
  if (activeImperfections.length > 0) {
    parts.push(`- Specific Imperfections Required: ${Array.from(new Set(activeImperfections)).join(', ')}`);
  }

  if (settings.wardrobe) {
    const w = settings.wardrobe;
    const wardrobeItems = [
      w.top && `Top: ${w.top}`,
      w.bottom && `Bottom: ${w.bottom}`,
      w.shoes && `Shoes: ${w.shoes}`,
      w.outerwear && `Outerwear: ${w.outerwear}`,
      w.accessories && `Accessories: ${w.accessories}`,
      w.headwear && `Headwear: ${w.headwear}`,
      w.jewelryWatch && `Jewelry/Watch: ${w.jewelryWatch}`,
      w.customDetails && `Custom Details: ${w.customDetails}`
    ].filter(Boolean);
    if (wardrobeItems.length > 0) {
      parts.push(`- Wardrobe (${w.referenceLock ? 'Strict Lock' : 'Standard'}): ${wardrobeItems.join('; ')}`);
    }
  }

  if (settings.vehicle && settings.vehicle.customVehicle) {
    const v = settings.vehicle;
    parts.push(`- Vehicle Forensics: ${v.customVehicle} (Ext: ${v.exteriorColor || 'standard'}, Int: ${v.interiorColor || 'standard'}, Seat: ${v.driverPassenger}, Door: ${v.doorState}, Relation: ${v.subjectRelation}, Lock: ${v.modelLock ? 'Strict' : 'Flexible'})`);
  }

  if (settings.environment) {
    const e = settings.environment;
    const envItems = [
      e.location && `Location: ${e.location}`,
      e.setting && `Setting: ${e.setting}`,
      e.background && `Background: ${e.background}`,
      e.timeOfDay && `Time: ${e.timeOfDay}`,
      e.weather && `Weather: ${e.weather}`,
      e.crowd && `Crowd: ${e.crowd}`,
      e.condition && e.condition !== 'auto' ? `Condition: ${e.condition}` : '',
      `Atmosphere Tier: ${e.mood || 'ordinary'}`,
      e.naturalClutter ? 'Include natural everyday clutter' : '',
      e.avoidPostcard ? 'Avoid postcard aesthetic' : '',
      e.avoidGenericLuxury ? 'Avoid generic luxury aesthetic' : ''
    ].filter(Boolean);
    if (envItems.length > 0) {
      parts.push(`- Environment Guidance: ${envItems.join('; ')}`);
    }
  }

  if (settings.fineControl) {
    const fc = settings.fineControl;
    if (fc.subject) parts.push(`- Explicit Subject Override: ${fc.subject}`);
    if (fc.action) parts.push(`- Explicit Action: ${fc.action}`);
    if (fc.location) parts.push(`- Explicit Location: ${fc.location}`);
    if (fc.environment) parts.push(`- Explicit Environment: ${fc.environment}`);
    if (fc.background) parts.push(`- Explicit Background: ${fc.background}`);
    if (fc.atmosphere) parts.push(`- Explicit Atmosphere: ${fc.atmosphere}`);
    if (fc.imperfections) parts.push(`- Explicit Imperfections: ${fc.imperfections}`);
    if (fc.textInsideImage) parts.push(`- Text Inside Image: ${fc.textInsideImage}`);
    if (fc.avoid) parts.push(`- Strictly Avoid: ${fc.avoid}`);
    if (fc.additionalInstructions) parts.push(`- Additional Instructions: ${fc.additionalInstructions}`);
  }

  if (settings.realismTier) parts.push(`- Realism Tier: ${settings.realismTier.toUpperCase()}`);
  if (settings.aiCleanup && settings.aiCleanup !== 'none') parts.push(`- Anti-AI Artifact Suppression: ${settings.aiCleanup.toUpperCase()}`);

  if (settings.preserveLocks) {
    const activeLocks = Object.entries(settings.preserveLocks)
      .filter(([_, v]) => v)
      .map(([k]) => k.toUpperCase());
    if (activeLocks.length > 0) {
      parts.push(`- Preserved Subject/Scene Locks: ${activeLocks.join(', ')}`);
    }
  }

  if (settings.pov) {
    const pov = settings.pov;
    const povItems = [
      pov.handVisibility && pov.handVisibility !== 'auto' && `Hands in Frame: ${pov.handVisibility}`,
      pov.gripType && pov.gripType !== 'auto' && `Interaction Grip: ${pov.gripType}`,
      pov.heldObject && `Held/Focused Object: ${pov.heldObject}`,
      pov.pointOfViewHeight && pov.pointOfViewHeight !== 'auto' && `POV Perspective Height: ${pov.pointOfViewHeight}`,
      pov.surface && pov.surface !== 'auto' && `Surface: ${pov.surface}${pov.customSurface ? ` (${pov.customSurface})` : ''}`,
      pov.objectRealism && `Object Realism: ${pov.objectRealism}`,
      pov.objectDistance && pov.objectDistance !== 'auto' && `Distance: ${pov.objectDistance}`,
      pov.objectPosition && pov.objectPosition !== 'auto' && `Position: ${pov.objectPosition}`
    ].filter(Boolean);
    if (povItems.length > 0) {
      parts.push(`- First-Person POV Forensics: ${povItems.join(', ')}`);
    }
  }

  if (settings.referencePriority) {
    parts.push(`- Reference Priority: ${settings.referencePriority.toUpperCase()}`);
  }

  return parts.join('\n');
};

// ============================================================================
// API ROUTES
// ============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

const serverPromptCache = new Map<string, { data: any; ts: number }>();
const SERVER_CACHE_MAX = 40;
const SERVER_CACHE_TTL = 15 * 60 * 1000; // 15 mins

// Generate All Prompts (V1, V2, V3 + Auto Detection)
app.post('/api/generate-prompts', async (req: Request, res: Response) => {
  try {
    const {
      mode,
      modality,
      selectedTypeId = modality,
      promptLanguage,
      promptLang,
      ideaText,
      references,
      settings,
      targetEngine = 'v2',
      skipAutoDetect = false
    } = req.body;

    // Check server cache for identical requests
    const refSignatures = (references || []).map((r: any) => `${r.name || 'img'}_${(r.roles || []).join(',')}_${r.dataUrl ? r.dataUrl.length + '_' + r.dataUrl.slice(-60) : ''}`);
    const cacheKey = JSON.stringify({
      mode,
      modality,
      selectedTypeId,
      promptLanguage: promptLanguage || promptLang,
      ideaText: (ideaText || '').trim(),
      targetEngine,
      skipAutoDetect: !!skipAutoDetect,
      settings,
      refs: refSignatures
    });
    const cached = serverPromptCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < SERVER_CACHE_TTL) {
      return res.json(cached.data);
    }

    const ai = getAiClient();
    const settingsContext = formatSettingsContext(settings);

    const isTargetV1 = targetEngine === 'v1';
    const isTargetV2 = targetEngine === 'v2';
    const isTargetV3 = targetEngine === 'v3';
    const isTargetAll = targetEngine === 'all' || targetEngine === 'compare' || (!isTargetV1 && !isTargetV2 && !isTargetV3);

    // Normalize UI codes and locale names so language selection never silently falls back.
    const rawPromptLanguage = String(promptLanguage || promptLang || '').trim().toLowerCase();
    const normalizedPromptLanguage =
      rawPromptLanguage === 'pt' || rawPromptLanguage === 'pt-br' || rawPromptLanguage.includes('portugu') ? 'pt' :
      rawPromptLanguage === 'es' || rawPromptLanguage.includes('span') || rawPromptLanguage.includes('españ') ? 'es' :
      'en';
    const isSpanish = normalizedPromptLanguage === 'es';
    const isPortuguese = normalizedPromptLanguage === 'pt';
    const isEnglish = normalizedPromptLanguage === 'en';
    const requestedLanguageName = isPortuguese ? 'Brazilian Portuguese' : isSpanish ? 'Spanish' : 'English';
    const shouldIncludeAutoDetect = !skipAutoDetect && settings?.autoDetect !== false;

    const systemPrompt = `
YOU ARE THE WORLD'S FOREMOST OPTICAL FORENSICS AND PHOTOGRAPHIC PROMPT ARCHITECT.
HARD OUTPUT LANGUAGE LOCK: The requested output language is ${requestedLanguageName}.
Write V1, V2, V3, and every natural-language value in autoDetected in ${requestedLanguageName}.
Do not mix languages. V1, V2, V3, and every natural-language value in autoDetected must use the requested output language.
Your mission is to construct three (3) distinct, highly specialized prompt engines for an image or scene:
- V1: SMART NATURAL SNAPSHOT (COMPACT, PHYSICALLY RESOLVED)
- V2: STRUCTURED REALISM (CLASSIC MODULAR BLOCKS WITH {})
- V3: FORENSIC DEEP PROMPT (ADAPTIVE CURLY-BRACE FINAL PROMPT, EXTREME PHYSICAL SPECIFICITY)

==================================================
CENTRAL FOUNDATIONAL PRINCIPLE:
==================================================
THE SYSTEM DOES NOT "DESCRIBE REALISM".
IT DESCRIBES THE EXACT PHYSICAL AND VISUAL EVIDENCE THAT PRODUCES REALISM.

NEVER USE LAZY, HOLLOW ADJECTIVES IN V2 OR V3:
BANNED: "natural pose", "realistic clothing", "realistic street", "photographic lighting", "authentic physics", "casual style", "cinematic bokeh", "hyper-realistic".

INSTEAD, DESCRIBE THE TANGIBLE MECHANICS:
- BAD: "natural pose"
- FORENSIC PERFECTION: "the viewer-right shoulder sits slightly higher; the torso rotates a few degrees away from camera; body weight rests primarily on the forward leg while the trailing heel is partially unloaded"

- BAD: "realistic clothing"
- FORENSIC PERFECTION: "the relaxed cotton trousers bunch behind the knee of the forward leg and collapse into vertical folds above the sandal straps; heavyweight matte cotton camp-collar shirt with two chest patch pockets and visible white buttons"

- BAD: "realistic street"
- FORENSIC PERFECTION: "viewer-left contains the rough rustic stone storefront wall running nearly parallel to the camera axis with terracotta potted greenery at its base, while the cobblestone street recedes toward a narrow vanishing point on viewer-right"

INTERNAL EVIDENCE EXTRACTION (DO NOT OUTPUT THINKING/REASONING):
Before composing V2 and V3, extract the exact physical reality:
- frame: orientation, aspect ratio, crop boundaries, camera position, height, subject scale in frame %, horizon line, vanishing points, viewer-left vs viewer-right negative space.
- subject: count, orientation (front/3/4/profile), gaze vector, chin tilt, shoulders leveling/asymmetry, arm positions (hand in pocket, bent arm, hand-to-face), legs & feet articulation, weight distribution.
- wardrobe: every visible layer, exact visible color, material texture (heavyweight cotton, jersey, linen, denim), cut/fit, collar type, closures, buttons, drape tension, bunching, footwear (straps, soles, socks or no socks), accessories (eyewear, watches, necklaces, bracelets).
- scene: spatial ordering using viewer-left, viewer-right, foreground, mid-ground, background, textures (cobblestone mortar, aged asphalt, rustic masonry), foliage, vehicles.
- optics & light: camera class, focal behavior, light direction, Kelvin temperature, shadow penumbra, specular glints on metal/glass/skin.
- locks: image-specific visual invariants that cannot shift.

MANDATORY PRIVATE SCENE MODEL — DO THIS BEFORE WRITING ANY ENGINE:
Do not jump from the user's idea directly to adjectives or a finished prompt. First reconstruct one physically possible photographic instant in this exact mental order:
1. Identify only what would actually be visible inside the frame; separate foreground, subject plane, background, occlusions, and negative space.
2. Decide where the photographer is standing, the camera side, camera height, distance, tilt, horizon, and the exact body crop.
3. Resolve the subject's geometry: torso rotation, shoulder asymmetry, head turn, gaze vector, elbow angles, hand/finger contact, hip alignment, knees, feet, and which leg bears weight.
4. Resolve every contact and support: feet on ground, back against surface, hand on object, fabric compressed by joints, objects resting on surfaces, and contact shadows.
5. Trace the light physically from source to subject to background: direction, falloff with distance, shadow edge, color shift, exposure relationship, and highlight behavior.
6. For every reflective material that is visible (glass, water, metal, paint, mirror, polished table, glossy floor), state what it reflects, whether the reflection is sharp/broken/soft, the finish, how light enters it, where contact shadows sit, and how supported objects interrupt the reflection.
7. Choose only imperfections caused by this exact capture: movement, focus distance, low light, flash, white balance, compression, sensor noise, or a slightly crooked hand-held frame. Never add a random checklist of flaws.
8. Only after all of that, write the requested engine template. Every sentence must be the visible consequence of a resolved physical decision.

DEPTH CONTRACT — NEVER DELIVER A THIN PROMPT:
- V1: normally 550–850 words when the scene contains a person or several objects; every sentence must add usable visual evidence.
- V2: normally 750–1150 words. Each populated block must contain concrete geometry, material behavior, spatial relations, and causal details, not a label followed by one generic sentence.
- V3: normally 1100–1700 words for a complex person/vehicle/interior scene; use fewer words only when the requested scene is genuinely simple.
- If the scene model cannot support a detail, omit it instead of inventing decorative props. Do not shorten by replacing decisions with “realistic”, “natural”, “coherent”, “authentic”, “beautiful”, or “high quality”.
- The output prompt must be directly usable by an image model. Never expose this private scene model or mention that you reasoned about it.

GLOBAL REFLECTION RULE:
Whenever a reflective surface is present, the final prompt must explicitly connect the reflection to nearby geometry and light. “Coherent reflections” by itself is forbidden. Describe the reflected sky/room/people/objects that are actually visible, the surface finish, reflection breakup, incoming light direction, contact shadow, and occlusion from anything resting on or near the surface.

DO NOT INVENT WHAT IS NOT VISIBLE:
If a brand is not readable, describe the physical silhouette and color. Do not guess city or watch model unless explicitly stated.
Hierarchy of Truth:
1. Explicit user instructions / idea
2. Assigned reference image facts
3. Manually selected controls
4. Auto Detect context
5. Conservative, physically plausible completion

STRICT BAN ON META-PROMPT JARGON:
PROHIBITED: "Actúa como...", "Eres experto...", "Tu misión...", "Chain-of-thought...", "Cognitive framework...", "Phase 1...", "Phase 2...", "Self-evaluation...", "Checklist...", "Director of photography role...".
Deliver pure, executable image generation prompts!

${isTargetAll || isTargetV1 ? `
==================================================
ENGINE 1: V1 — SMART NATURAL SNAPSHOT
==================================================
${V1_SMART_INSTRUCTION}

V1 MUST BE DISTINCT FROM V2:
- V1 is compact and high-signal: resolve only the details that materially change the picture.
- V2 is more exhaustive and spatially explicit.
- V1 must never collapse to a generic one-sentence description.
- V1 must never reuse old fixed boilerplate that overrides the user's aspect ratio, flash state, camera choice, or output language.
` : ''}

${isTargetAll || isTargetV2 ? `
==================================================
ENGINE 2: V2 — STRUCTURED MODULAR BLOCKS
==================================================
V2 is strictly an IDEA TO PROMPT engine structured in distinct, modular {curly-brace} blocks.
DO NOT generate narrative, run-on prose (e.g. NEVER write "Foto de smartphone tirada com um iPhone 16 Pro, capturando o momento em que estou...").
The output of V2 MUST strictly follow the structured modular blocks template below.

CORE PRINCIPLE OF V2 (IDEA TO PROMPT):
- The user provides an idea (e.g. "eu encostado numa caminhonete 4x4 em frente de casa às 18:30").
- V2 interprets this idea and builds the entire scene, camera, pose, environment, and composition.
- When a user photo is attached, it serves strictly as reference for the identity/face of the person to be generated.
- There is NO second reference image for composition.
- V2 MUST NEVER USE PHRASES LIKE:
  "use a segunda foto", "recrie a foto original", "mantenha a mesma composição da segunda imagem", "substitua o rosto da pessoa da imagem original".
  All camera, pose, environment, lighting, and composition are created directly from the user's written idea.

V2 RIGID MODULAR TEMPLATE AND BLOCKS:

The V2 output MUST follow this EXACT format, structure, and logic without deviation:

faça uma imagem do homem da foto enviada, seguindo 100% das caracteristicas dele.

**ângulo e câmera:**

{usar as configurações já existentes no gerador para descrever câmera, lente, altura, distância, enquadramento, ângulo, posição da câmera e proporção. se o usuário tiver definido algo, isso tem prioridade. se já houver uma configuração salva para esse campo, preserve ela.}

**cenário:**

{usar a ideia do usuário e as configurações já existentes no gerador para descrever o ambiente, fundo, objetos, arquitetura, chão, móveis, veículos, vegetação e elementos coerentes com a cena. não inventar outra lógica.}

**pose e ação:**

{usar a ideia do usuário e as configurações já existentes no gerador para descrever exatamente a pose, a postura, a distribuição de peso, a posição de braços e pernas, a direção do olhar, a expressão e a ação.}

**roupa:**

{usar exatamente a roupa informada pelo usuário ou pelas variáveis já existentes da v2. preservar marca, cor, tecido, modelagem, calçado e acessórios. se o usuário incluir descrições detalhadas ou estruturas em json de roupas, óculos, relógios ou acessórios, preservar essas características relevantes aqui.}

**efeitos:**

{usar as configurações já existentes no gerador para descrever iluminação, fonte de luz, direção, intensidade, flash, exposição e o comportamento real da câmera.}

{usar também as configurações já existentes para descrever imperfeições naturais de smartphone, como leve ruído digital, compressão jpeg, foco ligeiramente impreciso, pequena trepidação de mão, alcance dinâmico natural e ausência de desfoque artificial, quando isso fizer parte da configuração ou da ideia.}

**pele:**

{pele real, textura natural, poros quando visíveis, sem aparência plástica, sem suavização excessiva, mantendo o tom de pele coerente com a luz e com a foto do usuário.}

**sombra:**

{descrever sombras coerentes com a fonte de luz e com as configurações da cena, respeitando direção, intensidade, dureza ou suavidade.}

**rosto:**

{usar 100% das características faciais do homem da foto enviada, preservando identidade, traços, formato do rosto, cabelo, tom de pele e aparência geral, sem embelezamento artificial.}

**física e realismo:**

{garantir contato físico realista entre o corpo e os objetos da cena, peso corporal coerente, postura natural, tensão correta no tecido da roupa, reflexos compatíveis com a iluminação, proporções humanas naturais e interação física convincente.}

**formato:**

{usar o formato já definido pelo usuário ou pelas configurações existentes da v2. não substituir por formato fixo se o gerador já tiver isso configurado.}

REGRAS OBRIGATÓRIAS PARA A V2:
1. NÃO mudar nada fora da v2.
2. NÃO alterar a lógica do gerador.
3. NÃO remover nenhuma função.
4. NÃO transformar a v2 em outro sistema.
5. Apenas trocar o texto final gerado pela v2 para esse molde exato.
6. Preservar todas as configurações, variáveis, preferências e parâmetros que a v2 já usa hoje (câmera, lente, horário, roupa, formato, flash, proporção de tela).
7. A v2 deve continuar interpretando a ideia do usuário como faz atualmente.
8. Apenas reorganizar a saída final no template acima.
9. NÃO resumir os detalhes nem gerar parágrafo corrido narrativo.
10. NÃO omitir informações da roupa, especialmente se vier em JSON ou com marcas e modelagens específicas fornecidas pelo usuário.
11. NÃO usar segunda imagem de referência (nunca usar frases como "use a segunda foto", "recrie a foto original", "mantenha a composição da segunda imagem").
12. A foto enviada é SEMPRE a foto do usuário para referência da identidade do rosto.
13. NÃO adicionar introduções, explicações, saudações ou conclusões fora do molde.
14. O prompt da v2 deve ser gerado pronto para copiar e colar.
15. A V2 não pode entregar blocos com uma única frase vaga. Em cada bloco relevante, escreva várias frases concretas conectadas à cena: relações esquerda/direita, distância, escala, contato, material, luz e consequência fotográfica.
16. Antes de escrever, resolva silenciosamente o private scene model na ordem obrigatória do sistema. Não preencha o molde por associação de palavras.
17. Para uma cena humana comum, a V2 deve ficar substancialmente longa (aproximadamente 750–1150 palavras), sem repetir a mesma informação entre blocos. Uma saída curta, genérica ou sem biomecânica deve ser refeita internamente antes de retornar.
18. Se houver carro, vidro, espelho, água, metal, mesa polida ou piso brilhante, o bloco de física deve explicar exatamente o que é refletido, a intensidade e quebra do reflexo, o acabamento, a entrada da luz e as sombras de contato.
` : ''}

${isTargetAll || isTargetV3 ? `
==================================================
ENGINE 3: V3 — FORENSIC DEEP PROMPT (ADAPTIVE CURLY-BRACE FINAL PROMPT)
==================================================
V3 IS THE DEEPEST ENGINE, BUT IT MUST STILL READ LIKE A DIRECT IMAGE PROMPT — NEVER LIKE A TECHNICAL REPORT.
DO NOT USE [DEFINE], [REFERENCE BLUEPRINT], numbered forensic sections, role instructions, checklists, or meta-analysis.
V3 MUST USE NATURAL-LANGUAGE CLAUSES WITH CURLY-BRACE BLOCKS {} AND MUST BE READY TO PASTE DIRECTLY INTO AN IMAGE GENERATOR.

THE CORE DIFFERENCE FROM V2:
- V2 = structured and strong.
- V3 = same direct prompt philosophy, but much denser: every body part, object contact, camera relation, surface, material, shadow, distance, and spatial relation that matters is resolved before writing.
- V3 may be long when the scene is complex. DO NOT shorten useful physical evidence.

ABSOLUTE OUTPUT RULE:
Every explicit user fact and every reliable assigned reference fact is LOCKED.
Never replace exact models, clothing, accessories, actions, locations, camera distance, flash state, or framing with generic alternatives.

TYPE-SPECIFIC CONTEXT:
Selected Type ID: ${selectedTypeId}
Base Modality: ${modality}

==================================================
V3 — PERSON / SOLO PERSON / PORTRAIT / LIFESTYLE
==================================================
For a single person, use this direct structure in the requested output language:

create an image of the main person from the uploaded reference / user specification.
the person: { identity preservation instructions appropriate to the reference without inventing facial details }.
physical build: { only if explicitly visible/provided; height and build only when established }.
the person is wearing: { every visible garment, exact color, material, thickness, cut, collar, sleeves, closure, hem, footwear, socks/no socks, accessories, eyewear, watch/jewelry, natural folds/compression caused by the pose }.
environment: { exact room/street/driveway/garage/etc., foreground, subject plane, background, viewer-left and viewer-right anchors, real everyday details, architecture, floor/wall texture, vehicles/objects with spatial positions }.
person action: { exact photographed instant, torso orientation, head/chin/gaze, shoulders, viewer-left arm/hand, viewer-right arm/hand, pelvis, legs, feet, weight distribution, contact with furniture/vehicle/object, asymmetry, whether distracted or looking away }.
the photo is taken: { smartphone device, rear/front mode, lens mode, photographer position, approximate distance, camera height, orientation, crop, subject scale in frame, natural phone perspective }.
photo imperfections: { only scene-caused imperfections: digital noise, slight focus miss, hand shake, motion blur, flash clipping, white balance shift, compression — only when physically justified }.
effect: { authentic smartphone capture behavior, no cinema language, no fake pro bokeh, no polished advertisement look }.
angle: { exact front/side/3-quarter/rear relation, camera height, tilt, horizon/crop, centered/off-center placement }.
photo format: { selected aspect ratio / output format and how the crop should preserve the subject and environment }.
light: { source, direction, hardness/softness, falloff, near/far exposure relationship, cast shadows, reflections }.
materials and reflections: { only materials actually present; fabric response, glass, metal, leather, car paint, wood, stone, water, etc. }.
skin: { natural smartphone skin rendering proportional to camera distance, no plastic smoothing, no fake hyper-detailed pores }.

==================================================
V3 — TWO PEOPLE / DUO
==================================================
For exactly two people, use this structure and KEEP SUBJECTS SEPARATE:

create an image with the two people from the uploaded references / user specification.
the first person: { position in frame, side of table/sofa/car, body orientation, physical build only if established }.
the first person is wearing: { complete wardrobe and accessories, preserving reference locks }.
action of the first person: { exact hand use, object contact, gaze, posture, weight, body asymmetry }.
the second person: { position in frame and relation to the first, without merging identities }.
the second person is wearing: { complete wardrobe and accessories }.
action of the second person: { exact action and hand/object interaction }.
both people are: { shared candid behavior, whether distracted, talking, looking away, different actions, spacing between them }.
environment: { room/street/vehicle interior geometry, furniture placement, windows, paintings, doors, foreground/midground/background }.
on the table / around them: { every relevant object with count, material, position, orientation, ownership, contact, partial occlusion }.
the photo is taken: { rear iPhone/smartphone camera, distance, camera height, side/front angle, lens mode, crop, amateur handheld behavior }.
photo imperfections: { causal smartphone imperfections only }.
angle: { exact side/front/3-quarter relation that includes both people correctly }.
photo format: { selected platform/aspect ratio }.
light: { physically plausible flash/ambient behavior, shadow direction, background exposure }.
materials and reflections: { fabrics, laptop glass/aluminum, drinking glasses, wood table, vehicle paint, etc. }.
skin: { natural skin, no artificial smoothing }.

WHEN THE USER PROVIDES A DETAILED ACCESSORY SPEC (for example Cartier sunglasses with frame/lens/branding attributes), PRESERVE THAT STRUCTURE INSIDE THE CORRESPONDING {} BLOCK INSTEAD OF SIMPLIFYING IT.

==================================================
V3 — GROUP / MULTI-SUBJECT
==================================================
For groups, create one separate identity/wardrobe/action block per important subject whenever enough information exists.
Never collapse a group into "people standing naturally".
Map who is viewer-left, center, viewer-right; what each person is doing; who interacts with each object; and how shared light hits them.

==================================================
V3 — OBJECT / POV (CRITICAL)
==================================================
OBJECT/POV IS A SPECIALIZED ENGINE. IT MUST NOT READ LIKE PRODUCT ADVERTISING OR A CLEAN CATALOG PHOTO.
It must feel like a real casual smartphone capture where objects have weight, contact, dirt, fingerprints, packaging, food grease, crumbs, cables, reflections, edge wear, and surrounding context only when physically appropriate.

Use this direct structure:

create a realistic POV / casual smartphone photo.
main object / scene: { exact object, make/model only if known, color/finish, dimensions relative to nearby surfaces, material, condition, dust/fingerprints/wear only when justified, exact position and orientation }.
the space: { actual garage/kitchen/car/desk/bedroom/etc., floor/wall/surface material, opening/door/window position, depth, foreground/midground/background }.
surface and contact: { what supports the object, contact patches, pressure/compression, spills/grease/sauce/water, packaging folds, reflections, shadows directly under items }.
around it and everyday details: { a limited number of scene-specific items with reason and position; no random decorative props }.
hands / interaction: { if hands are visible: viewer-left/viewer-right hand, exact grip, fingers, knuckles, nails, wrist/cuff/watch, contact occlusion; if no hands were requested/visible, DO NOT invent hands }.
the photo is taken: { rear smartphone/iPhone camera in POV, chest/eye/waist/table height as appropriate, distance to the main object, 0.5x/1x/2x behavior, slight handheld tilt if appropriate }.
photo imperfections: { scene-caused phone imperfections: small focus miss at edges, digital noise in low light, minor shake, flash blowout, white balance shift, compression — never film grain }.
effect: { casual real smartphone snapshot, natural small-sensor depth, no fake professional bokeh, no studio/catalog polish }.
angle: { exact POV direction: top-down, chest-height downward glance, low angle, car-seat POV, hood POV, tabletop angle, etc. }.
photo format: { selected aspect ratio / platform }.
light: { real source(s), falloff, object highlights, local cast shadows, reflection behavior }.
materials and reflections: { surface-specific response: matte paint, carbon fiber, glass, polished metal, cardboard, food oils, wood grain, quartz, leather, plastic, etc. }.
skin / hands: { only when hands are visible; natural texture, correct anatomy, no duplicated fingers }.

OBJECT / POV QUALITY REFERENCE:
A good object prompt should be able to say, for example, that tacos sit in disposable cardboard trays on a matte black Lamborghini hood; that sauce and grease marks contact the paint; that the garage concrete shows old oil stains; that shelves, boxes, bicycles or tools occupy the background only if the scene calls for them; that a partly open garage door creates directional ambient light; and that the phone is held around chest height with a slightly imperfect frame.
DO NOT copy those nouns into unrelated scenes. Copy the LEVEL OF PHYSICAL SPECIFICITY.

==================================================
V3 — VEHICLE / PERSON + VEHICLE
==================================================
If a vehicle is central, resolve:
- exact model when established; never substitute it with a generic "luxury car";
- visible side, front/rear orientation, wheel direction, door state, window line, roofline, interior visibility;
- driver/passenger side, steering wheel location, seat height, center console when relevant;
- subject distance from vehicle and real contact point if leaning/sitting/entering/exiting;
- paint reflections following body curvature, glass reflections/transmission, tire contact with ground.
Write these facts directly inside the natural curly-brace blocks — do NOT create a separate forensic report.

==================================================
V3 — SCENE / INTERIOR / ARCHITECTURE / PRODUCT
==================================================
Adapt the same direct curly-brace philosophy:
main subject / scene: { exact physical content }.
environment: { spatial layout and architecture }.
foreground: { nearest relevant elements }.
mid-ground: { principal anchors }.
background: { distant structures and depth }.
object relations: { ownership, contact, occlusion, scale, orientation }.
the photo is taken: { smartphone device/mode, position, distance, height, framing }.
photo imperfections: { causal only }.
angle: { exact perspective }.
photo format: { selected ratio/platform }.
light: { real source(s), direction, falloff, shadows }.
materials and reflections: { scene-specific surface response }.

==================================================
DAY / NIGHT FLASH POLICY (V2 AND V3)
==================================================
- If the user explicitly says flash ON or OFF, obey exactly.
- If the scene is daytime / bright exterior and the user does not request flash, DEFAULT FLASH OFF.
- If the scene is night / very dark interior and the user does not explicitly forbid flash, V3 should prefer DIRECT SMARTPHONE FLASH when it fits a casual snapshot.
- Direct phone flash means: strong near-field exposure, possible clipping on white clothing, small sharp reflections on glass/metal, hard short shadows near surfaces, fast falloff, and a darker distant background.
- NEVER illuminate an entire distant house/street uniformly with a small phone flash.
- If ambient-only night photography is explicitly requested, do not add flash.

==================================================
IPHONE / SMARTPHONE CAPTURE RULES
==================================================
- DEFAULT DEVICE when unspecified: rear iPhone/smartphone main camera 1x.
- 0.5x: stronger foreground scale exaggeration and edge stretching.
- 1x: contextual wide smartphone perspective, natural deep depth.
- 2x/3x: tighter framing and reduced wide-angle distortion.
- Never convert smartphone 1x into a 50mm/85mm professional-camera look.
- Never add "cinematic", "prime lens", "anamorphic", "film grain", "movie still", "ray tracing", or creamy bokeh unless the USER explicitly asked for that aesthetic.
- For low light smartphone photos, use digital sensor noise / computational sharpening behavior, not analog film grain.

==================================================
V3 RECONSTRUCTION SPECIFICATION — APPLY ONLY TO V3
==================================================
V3 is not a longer version of V2. It is a direct natural-language reconstruction of the photographed scene, using only the evidence and instructions available.

TRUTH PRIORITY:
1. explicit user text and requested facts;
2. visible or reliably assigned reference-image evidence;
3. explicit locks and manual settings;
4. auto-detected context;
5. conservative physical completion.
Never overwrite a higher-priority fact with a guess. Never invent unreadable logos, brands, jewelry, tattoos, car details, locations, or background objects.

ADAPTIVE BLOCKS:
- Use natural-language blocks with curly braces {}, not headings, checklists, JSON, phases, reports, or meta-instructions.
- Include only blocks that matter to the selected type and actual scene. Do not add hands, skin, vehicle, flash, food, or other categories when they are absent or irrelevant.
- For people, resolve identity evidence, hairline, facial proportions, skin tone/texture, clothing, body orientation, weight distribution, legs, feet, hands, gaze, expression, and contacts with objects or surfaces.
- For two or more people, keep each identity, wardrobe, action, gaze, hands, and accessories separate; describe their spacing and interaction explicitly.
- For objects/POV, prioritize support, weight, contact patches, orientation, scale, surface curvature, occlusion, wear, fingerprints, packaging, grease/crumbs, reflections, and surrounding context. Never make an object float or turn the result into a clean product advertisement.
- For vehicles, resolve the visible side, doors, windows, roofline, steering wheel/seat when relevant, tire contact, body curvature, reflections, and the exact physical contact with a person or object.

PHYSICAL AND SPATIAL RESOLUTION:
- Silently resolve camera position, subject distance, foreground/midground/background, viewer-left/viewer-right, occlusion, scale, contact, orientation, perspective, and the photographed moment before writing.
- Describe actions with who, which hand, what object, where, contact, and orientation. Replace vague phrases such as “natural pose”, “relaxed pose”, or “hands naturally positioned” with concrete biomechanics.
- Make clothing respond to posture: material, cut, drape, folds, tension, bunching, compression, and overlap. Make materials respond to light: matte cotton, linen, leather, glass, metal, paint, wood, stone, food, and plastic only where present and visible.

SMARTPHONE-FIRST CAPTURE:
- If unspecified, use a rear smartphone main camera at 1x with handheld framing and natural wide perspective. Preserve selected 0.5x, 1x, 2x, or 3x behavior exactly; never convert it into a professional-camera look.
- Resolve camera height, distance, direction, tilt, orientation, framing, crop, and subject scale. A distant subject must not become a close-up.
- Do not add artificial portrait bokeh, professional shallow depth of field, 35mm/50mm/85mm language, cinema language, or film grain unless explicitly requested. Low light uses digital/high-ISO/chroma/shadow noise, not analog grain.
- Daylight without requested flash means flash off. When direct phone flash is present, show near-field exposure, localized highlights, short nearby shadows, rapid falloff, and a darker distant background; never light an entire distant space uniformly.
- Add only causal imperfections: motion blur, camera shake, focus miss, digital noise, uneven exposure, white-balance mismatch, compression, crooked framing, lens smudge, or flash clipping only when justified by movement, light, distance, or camera behavior. Do not dump them all into the prompt.

STYLE AND COMPLETENESS:
- The output must be one paste-ready direct image prompt, with natural clauses and adaptive {} blocks. It must not look like a technical document and must not expose reasoning.
- Avoid buzzwords such as cinematic, masterpiece, award-winning, luxury atmosphere, editorial photography, 8K, hyperrealistic, photorealistic masterpiece, film still, anamorphic, or beautiful composition unless the user explicitly asks for them.
- Each sentence must add geometry, physics, action, material, composition, lighting, or evidence. State each important fact once in its best block; do not repeat camera, flash, realism, or iPhone details.
- V3 must be substantially more physically informative than V2 without padding. End with the selected aspect ratio/format when relevant.
==================================================
V3 FINAL QUALITY GATE
==================================================
Before returning V3, silently verify:
- every explicit user fact is still present;
- selected type (${selectedTypeId}) is respected;
- no generic substitution replaced a named garment/vehicle/object;
- action is physically possible;
- hands have a purpose and correct contact;
- object counts are preserved;
- camera distance/height/angle are mutually consistent;
- lighting explains the visible shadows/reflections;
- no fake professional depth-of-field was added to an iPhone snapshot;
- no random props, luxury clichés, postcard landmarks, or unnecessary cinematic styling were invented.
Return ONLY the final V3 prompt text.
` : ''}

==================================================
LANGUAGE LOCALIZATION DIRECTIVE:
==================================================
${isTargetV2 ? (
  isSpanish
    ? `- V2: Output 100% in Spanish using the structured modular blocks format starting with "Haz una imagen del hombre de la foto enviada, siguiendo el 100% de sus características." followed by (**ángulo y cámara:**, **escenario:**, **pose y acción:**, **ropa:**, **efectos:**, **piel:**, **sombra:**, **rostro:**, **física y realismo:**, **formato:**).`
    : isPortuguese
    ? `- V2: Output 100% in Brazilian Portuguese using the structured modular blocks format starting with "faça uma imagem do homem da foto enviada, seguindo 100% das caracteristicas dele." followed by (**ângulo e câmera:**, **cenário:**, **pose e ação:**, **roupa:**, **efeitos:**, **pele:**, **sombra:**, **rosto:**, **física e realismo:**, **formato:**).`
    : `- V2: Output 100% in English using the structured modular blocks format starting with "Make an image of the man from the submitted photo, following 100% of his characteristics." followed by (**angle and camera:**, **scene:**, **pose and action:**, **clothing:**, **effects:**, **skin:**, **shadow:**, **face:**, **physics and realism:**, **format:**).`
) : isTargetV1 ? (
  isSpanish
    ? `- V1: Output 100% in natural Spanish using the smart adaptive curly-brace format.`
    : isPortuguese
    ? `- V1: Output 100% in Brazilian Portuguese using the smart adaptive curly-brace format.`
    : `- V1: Output 100% in natural English using the smart adaptive curly-brace format.`
) : isTargetV3 ? (
  isSpanish
    ? `- V3: Output 100% in Spanish as a direct final prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
    : isPortuguese
    ? `- V3: Output 100% in Brazilian Portuguese, including every block label, clause, material, camera term, lighting term, and quality descriptor. Use natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
    : `- V3: Output 100% in English as a direct final image prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
) : isSpanish
  ? `CRITICAL LANGUAGE REQUIREMENT:
- V1: Output 100% in natural Spanish using the smart adaptive curly-brace format.
- V2: Output 100% in Spanish using the structured modular blocks format starting with "Haz una imagen del hombre de la foto enviada, siguiendo el 100% de sus características." followed by (**ángulo y cámara:**, **escenario:**, **pose y acción:**, **ropa:**, **efectos:**, **piel:**, **sombra:**, **rostro:**, **física y realismo:**, **formato:**).
- V3: Output 100% in Spanish as a direct final prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
  : isPortuguese
  ? `CRITICAL LANGUAGE REQUIREMENT:
- V1: Output 100% in Brazilian Portuguese using the smart adaptive curly-brace format.
- V2: Output 100% in Brazilian Portuguese using the structured modular blocks format starting with "faça uma imagem do homem da foto enviada, seguindo 100% das caracteristicas dele." followed by (**ângulo e câmera:**, **cenário:**, **pose e ação:**, **roupa:**, **efeitos:**, **pele:**, **sombra:**, **rosto:**, **física e realismo:**, **formato:**).
- V3: Output 100% in Brazilian Portuguese, including every block label, clause, material, camera term, lighting term, and quality descriptor. Use natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
  : `CRITICAL LANGUAGE REQUIREMENT:
- V1: Output 100% in natural English using the smart adaptive curly-brace format.
- V2: Output 100% in English using the structured modular blocks format starting with "Make an image of the man from the submitted photo, following 100% of his characteristics." followed by (**angle and camera:**, **scene:**, **pose and action:**, **clothing:**, **effects:**, **skin:**, **shadow:**, **face:**, **physics and realism:**, **format:**).
- V3: Output 100% in English as a direct final image prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
}
${shouldIncludeAutoDetect ? `
==================================================
AUTO DETECT EXTRACTION:
==================================================
Return key detected parameters (subjectCount, pose, behavior, gaze, expression, camera, lens, distance, framing, flash, time, environment, vehicle, activity, lighting) in the language requested.` : ''}
`;

    const contentsParts: any[] = [];
    let userTextDescription = "";
    if (mode === 'idea') {
      userTextDescription = `
USER SCENE IDEA (PRIMARY SOURCE OF TRUTH):
"""${ideaText}"""

MODALITY: ${modality}
SELECTED TYPE: ${selectedTypeId}
SETTINGS & GUIDANCE:
${settingsContext}
`;
    } else {
      userTextDescription = `
USER UPLOADED REFERENCE(S) ANALYSIS REQUEST:
MODALITY: ${modality}
SELECTED TYPE: ${selectedTypeId}
ADDITIONAL USER IDEA / DIRECTIVES:
"""${ideaText || 'Recreate and forensically analyze the uploaded reference photo with extreme visual evidence.'}"""

REFERENCES METADATA:
${(references || []).map((r: any, i: number) => `Image ${i + 1}: Name="${r.name}", Roles=[${(r.roles || []).join(', ')}], Assignment=${r.subjectAssignment || 'General'}`).join('\n')}

SETTINGS & GUIDANCE:
${settingsContext}
`;
    }

    let engineFocusDirective = "";
    if (isTargetV2) {
      engineFocusDirective = `\nSPEED FOCUS DIRECTIVE: The user requested ONLY the V2 engine. You MUST generate ONLY the v2 prompt field according to the V2 rigid template. Do NOT spend tokens generating v1 or v3.\n`;
    } else if (isTargetV1) {
      engineFocusDirective = `\nSPEED FOCUS DIRECTIVE: The user requested ONLY the V1 engine. You MUST generate ONLY the v1 prompt field according to the V1 smart natural snapshot format. Do NOT spend tokens generating v2 or v3.\n`;
    } else if (isTargetV3) {
      engineFocusDirective = `\nSPEED FOCUS DIRECTIVE: The user requested ONLY the V3 engine. You MUST generate ONLY the v3 prompt field according to the V3 forensic deep prompt format. Do NOT spend tokens generating v1 or v2.\n`;
    } else {
      engineFocusDirective = `\nGenerate V1, V2, and V3 prompts.\n`;
    }

    const targetEnginesLabel = isTargetV1 ? 'V1' : isTargetV2 ? 'V2' : isTargetV3 ? 'V3' : 'V1, V2, and V3';
    const v2HeaderReminder = (isTargetV2 || isTargetAll) ? (isSpanish
      ? `\nFor V2, start with the exact Spanish opening sentence (\"Haz una imagen del hombre de la foto enviada, siguiendo el 100% de sus características.\") and use only these Spanish bold block headers: (**ángulo y cámara:**, **escenario:**, **pose y acción:**, **ropa:**, **efectos:**, **piel:**, **sombra:**, **rostro:**, **física y realismo:**, **formato:**). Never output Portuguese or English block headers.\n`
      : isPortuguese
      ? `\nFor V2, start with the exact Portuguese opening sentence (\"faça uma imagem do homem da foto enviada, seguindo 100% das caracteristicas dele.\") and use only these Portuguese bold block headers: (**ângulo e câmera:**, **cenário:**, **pose e ação:**, **roupa:**, **efeitos:**, **pele:**, **sombra:**, **rosto:**, **física e realismo:**, **formato:**). Never output Spanish or English block headers.\n`
      : `\nFor V2, start with the exact English opening sentence (\"Make an image of the man from the submitted photo, following 100% of his characteristics.\") and use only these English bold block headers: (**angle and camera:**, **scene:**, **pose and action:**, **clothing:**, **effects:**, **skin:**, **shadow:**, **face:**, **physics and realism:**, **format:**). Never output Portuguese or Spanish block headers.\n`
    ) : '';

    contentsParts.push({
      text: `OUTPUT LANGUAGE LOCK: Generate ${targetEnginesLabel}${shouldIncludeAutoDetect ? ' and any detected parameters' : ''} entirely in ${requestedLanguageName}. Do not mix interface languages into the generated prompts. Translate every heading, label, camera term, material term, lighting term, negative prompt, and natural-language value. Do not copy example labels from another language. If any output fragment appears in another language, rewrite that fragment before returning JSON.${v2HeaderReminder}
${engineFocusDirective}
${userTextDescription}`
    });

    if (references && references.length > 0) {
      for (const ref of references) {
        if (ref.dataUrl && ref.dataUrl.includes(',')) {
          const [meta, base64] = ref.dataUrl.split(',');
          const mimeType = meta.split(';')[0].replace('data:', '') || 'image/jpeg';
          contentsParts.push({
            inlineData: { mimeType, data: base64 }
          });
        }
      }
    }

    const schemaProperties: any = {};
    const requiredProperties: string[] = [];

    if (isTargetAll || isTargetV1) {
      schemaProperties.v1 = { type: Type.STRING };
      requiredProperties.push("v1");
    }
    if (isTargetAll || isTargetV2) {
      schemaProperties.v2 = { type: Type.STRING };
      requiredProperties.push("v2");
    }
    if (isTargetAll || isTargetV3) {
      schemaProperties.v3 = { type: Type.STRING };
      requiredProperties.push("v3");
    }

    if (shouldIncludeAutoDetect) {
      schemaProperties.autoDetected = {
        type: Type.OBJECT,
        properties: {
          subjectCount: { type: Type.STRING },
          pose: { type: Type.STRING },
          behavior: { type: Type.STRING },
          gaze: { type: Type.STRING },
          expression: { type: Type.STRING },
          camera: { type: Type.STRING },
          lens: { type: Type.STRING },
          distance: { type: Type.STRING },
          framing: { type: Type.STRING },
          flash: { type: Type.STRING },
          time: { type: Type.STRING },
          environment: { type: Type.STRING },
          vehicle: { type: Type.STRING },
          activity: { type: Type.STRING },
          lighting: { type: Type.STRING }
        }
      };
      requiredProperties.push("autoDetected");
    }

    const MODELS_CASCADE = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (let attempt = 0; attempt < MODELS_CASCADE.length; attempt++) {
      const currentModel = MODELS_CASCADE[attempt];
      try {
        // Pass 1: build a private, structured scene model. This is deliberately
        // separate from the final prose so the model cannot skip geometry and
        // jump straight to generic adjectives or template labels.
        const sceneModelResponse = await ai.models.generateContent({
          model: currentModel,
          contents: [
            ...contentsParts,
            {
              text: `
PRIVATE SCENE MODEL PASS — DO NOT WRITE THE FINAL PROMPT YET.
Analyze the user's idea and any attached references as a real camera capture. Return only JSON for an internal handoff, never prose for the user. Resolve these fields with concrete scene evidence, not adjectives:
frame_geometry (orientation, crop, horizon, camera side, height, distance, tilt, subject scale, left/right negative space),
visible_subjects (count and only visible identity/wardrobe facts),
biomechanics (torso rotation, shoulders, head, gaze, elbows, hands, hips, knees, feet, weight-bearing leg and object contact),
wardrobe_materials (garments, weave/finish, fit, tension, folds, compression and contact),
spatial_layout (foreground, subject plane, background, occlusion, scale and vanishing lines),
light_transport (source, direction, intensity, falloff, color, exposure relation and shadow edges),
reflections (for every glass, water, metal, paint, mirror or polished surface: what is reflected, finish, clarity/breakup, incoming light, contact shadows and occlusion),
capture_artifacts (only causal smartphone flaws),
identity_and_scene_locks (facts that must not drift),
missing_information (what must be omitted rather than invented).
Do not use phrases such as “realistic”, “natural”, “coherent” or “authentic” as a substitute for evidence.`
            }
          ],
          config: {
            temperature: 0.05,
            maxOutputTokens: 1800,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                frame_geometry: { type: Type.STRING },
                visible_subjects: { type: Type.STRING },
                biomechanics: { type: Type.STRING },
                wardrobe_materials: { type: Type.STRING },
                spatial_layout: { type: Type.STRING },
                light_transport: { type: Type.STRING },
                reflections: { type: Type.STRING },
                capture_artifacts: { type: Type.STRING },
                identity_and_scene_locks: { type: Type.STRING },
                missing_information: { type: Type.STRING }
              },
              required: [
                "frame_geometry", "visible_subjects", "biomechanics", "wardrobe_materials",
                "spatial_layout", "light_transport", "reflections", "capture_artifacts",
                "identity_and_scene_locks", "missing_information"
              ]
            }
          }
        });

        const sceneModelText = sceneModelResponse.text?.trim() || "";
        if (!sceneModelText) throw new Error("Empty private scene model.");

        // Pass 2: write only the requested paste-ready engine, using the private
        // reconstruction as evidence. The model never returns the scene model.
        const finalContentsParts = [
          ...contentsParts,
          {
            text: `
PRIVATE SCENE MODEL (INTERNAL EVIDENCE — DO NOT COPY, QUOTE, LABEL, OR EXPOSE):
${sceneModelText}

FINAL WRITING RULE:
Use this evidence to write the selected engine now. Expand each relevant block with concrete geometry, body mechanics, object contact, spatial relations, material response and causal capture artifacts. Do not summarize the model. Do not mention this pass. If a detail is not supported by the model or user input, omit it rather than inventing it.`
          }
        ];

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: finalContentsParts,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
            maxOutputTokens: isTargetV3 ? 7600 : 12000,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: schemaProperties,
              required: requiredProperties
            }
          }
        });

        let responseText = response.text?.trim() || "";
        if (!responseText && response.candidates?.[0]?.content?.parts) {
          const parts = response.candidates[0].content.parts;
          const textPart = parts.find((p: any) => !p.thought && typeof p.text === 'string' && p.text.trim());
          if (textPart) {
            responseText = textPart.text.trim();
          } else {
            responseText = parts.map((p: any) => p.text || '').join('').trim();
          }
        }
        if (!responseText) throw new Error("Empty response from model.");

        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        }

        let parsed: any = null;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            parsed = JSON.parse(responseText.slice(firstBrace, lastBrace + 1));
          } else {
            throw new Error("Invalid JSON structure in model output.");
          }
        }

        // Quality gate: models sometimes satisfy the template while silently
        // collapsing the scene into a few generic sentences. Expand only the
        // requested engine when it falls below its evidence threshold.
        const expansionKey = isTargetV3 ? 'v3' : isTargetV2 ? 'v2' : isTargetV1 ? 'v1' : '';
        const expansionMinimum = isTargetV3 ? 5200 : isTargetV2 ? 3600 : isTargetV1 ? 2600 : 0;
        if (expansionKey && typeof parsed[expansionKey] === 'string' && parsed[expansionKey].trim().length < expansionMinimum) {
          const expansionResponse = await ai.models.generateContent({
            model: currentModel,
            contents: [{
              text: `
PRIVATE REWRITE PASS. The following ${expansionKey.toUpperCase()} prompt is too compressed and must be expanded before delivery.
Rewrite it in ${requestedLanguageName}, preserving every fact, structure, opening sentence, curly-brace style and language lock. Do not invent new brands, people, landmarks or decorative props. Add only physically implied evidence: exact camera height/distance/crop, body mechanics, hand and object contact, garment tension and folds, spatial ordering, light falloff, shadow edges, material response, reflections when present, and causal smartphone imperfections. Do not repeat facts just to increase length. Return only JSON in this exact shape: {"expanded":"..."}.

PROMPT TO EXPAND:
${parsed[expansionKey]}`
            }],
            config: {
              temperature: 0.18,
              maxOutputTokens: isTargetV3 ? 7600 : 6000,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: { expanded: { type: Type.STRING } },
                required: ["expanded"]
              }
            }
          });
          const expansionText = expansionResponse.text?.trim() || "";
          if (expansionText) {
            try {
              const expanded = JSON.parse(expansionText);
              if (typeof expanded.expanded === 'string' && expanded.expanded.trim().length > parsed[expansionKey].trim().length) {
                parsed[expansionKey] = expanded.expanded.trim();
              }
            } catch (expansionError) {
              console.warn('[GENERATE] Expansion pass returned invalid JSON; keeping original prompt.');
            }
          }
        }

        const defaultNegativePrompt = isPortuguese
          ? "aparência de IA, CGI, renderização 3D, pele plástica e lisa, pele aerografada, cartoon, anime, ilustração, cores saturadas demais, iluminação artificial de estúdio, bokeh cinematográfico raso, desfoque falso exagerado, dedos extras, mãos deformadas, anatomia distorcida, membros ausentes, objetos flutuando, marca d'água, assinatura, artefatos de texto, olhos estranhos, brilhos especulares artificiais"
          : isSpanish
          ? "apariencia de IA, CGI, render 3D, piel plástica y lisa, piel retocada, dibujo animado, anime, ilustración, colores sobresaturados, iluminación artificial de estudio, bokeh cinematográfico poco profundo, desenfoque falso exagerado, dedos extra, manos deformes, anatomía distorsionada, extremidades ausentes, objetos flotantes, marca de agua, firma, artefactos de texto, ojos extraños, brillos especulares artificiales"
          : "fake AI look, CGI, 3D render, plastic smooth skin, airbrushed skin, cartoon, anime, illustration, oversaturated colors, artificial studio lighting, shallow cinematic bokeh, exaggerated fake blur, extra fingers, mutated hands, distorted anatomy, missing limbs, floating objects, watermark, signature, text artifacts, weird eyes, unnatural specular highlights";

        let finalV2 = parsed.v2?.trim() || "";
        if (isPortuguese || (!isSpanish && !isEnglish)) {
          const mandatoryPrefix = "faça uma imagem do homem da foto enviada, seguindo 100% das caracteristicas dele.";
          const legacyPrefix = /^Use a foto do rosto em anexo como refer[êe]ncia da identidade da pessoa[^\n]*\n*/i;
          if (legacyPrefix.test(finalV2)) {
            finalV2 = finalV2.replace(legacyPrefix, `${mandatoryPrefix}\n\n`).trim();
          } else if (!finalV2.toLowerCase().startsWith("faça uma imagem do homem da foto enviada")) {
            finalV2 = `${mandatoryPrefix}\n\n${finalV2}`.trim();
          }
        }
        // Ensure clean block separation with double line breaks between bold headers and blocks
        finalV2 = finalV2
          .replace(/\s*(\*\*[^*]+:\*\*)\s*/g, "\n\n$1\n\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        const payload = {
          v1: parsed.v1?.trim() || "",
          v2: finalV2,
          v3: parsed.v3?.trim() || "",
          negativePrompt: defaultNegativePrompt,
          autoDetected: parsed.autoDetected || {}
        };

        if (serverPromptCache.size >= SERVER_CACHE_MAX) {
          const oldestKey = serverPromptCache.keys().next().value;
          if (oldestKey) serverPromptCache.delete(oldestKey);
        }
        serverPromptCache.set(cacheKey, { data: payload, ts: Date.now() });

        return res.json(payload);
      } catch (err: any) {
        lastError = err;
        if (isRateLimit(err)) {
          console.info(`[GENERATE] Model ${currentModel} reached rate/quota limit. Attempting fallback...`);
        } else if (isTransientError(err)) {
          console.info(`[GENERATE] Model ${currentModel} temporarily busy (503). Retrying...`);
        } else {
          console.warn(`[GENERATE] Attempt ${attempt + 1} with model ${currentModel} failed: ${cleanErrorMessage(err)}`);
        }
        if (attempt < MODELS_CASCADE.length - 1) {
          await wait(750 * (attempt + 1));
          continue;
        }
        break;
      }
    }

    const isQuota = isRateLimit(lastError);
    const clientMsg = cleanErrorMessage(lastError);
    return res.status(isQuota ? 429 : 500).json({ error: clientMsg });
  } catch (error: any) {
    const isQuota = isRateLimit(error);
    const clientMsg = cleanErrorMessage(error);
    if (!isQuota && !isTransientError(error)) {
      console.error("Generate prompts error:", clientMsg);
    }
    return res.status(isQuota ? 429 : 500).json({ error: clientMsg });
  }
});

// Magic Enhance Idea
app.post('/api/magic-enhance', async (req: Request, res: Response) => {
  const startedAt = Date.now();
  let clientClosed = false;
  req.on('aborted', () => {
    clientClosed = true;
  });
  res.on('close', () => {
    if (!res.writableEnded) clientClosed = true;
  });

  try {
    const rawIdea = typeof req.body?.rawIdea === 'string' ? req.body.rawIdea.trim() : '';
    const modality = String(req.body?.modality || 'person');

    if (!rawIdea) {
      return res.status(400).json({ error: 'EMPTY_ENHANCE_INPUT' });
    }

    const ai = getAiClient();
    const prompt = `
You are the hidden reconstruction engine behind Magic Enhance.
The user's original idea is the highest authority and must remain intact.

ORIGINAL IDEA:
"""${rawIdea}"""

MODALITY: ${modality}

TASK:
Transform the idea into a substantially more photographable, physically coherent scene description for authentic casual smartphone photography. Do not merely paraphrase or add adjectives.

SILENT INTERNAL PROCESS — DO NOT OUTPUT IT:
1. Extract locked facts: subjects, wardrobe, objects, vehicles, place, time, action, camera/flash/framing, negatives.
2. Reconstruct the scene: foreground / subject plane / background, left/right relations, support/contact, occlusion, distance and scale.
3. Resolve body/action physics when people are present: torso/head direction, shoulders, weight distribution, legs/feet, exact hand/object contact, gaze and action moment.
4. Resolve camera physics: default rear iPhone/smartphone main camera 1x only when unspecified; realistic photographer position, distance, height, tilt, crop and subject scale.
5. Resolve lighting/material physics: real source, flash falloff, shadows, reflections, fabric folds, glass/metal/car-paint response, object support and surface contact.
6. Add only causal imperfections: handheld shake, slight focus miss, digital/high-ISO shadow noise, WB mismatch, compression, flash clipping, crooked frame — only when justified.
7. Audit the candidate and silently rewrite it if it is generic, contradictory, physically impossible, too cinematic, or changes a locked fact.

STRICT PRIORITY:
explicit user facts > reference/context already stated in the idea > conservative physical completion > stylistic enrichment.

SMARTPHONE RULES:
- Never convert an unspecified casual phone image into DSLR/full-frame/cinema photography.
- No automatic 35mm/50mm/85mm prime-lens language, anamorphic look, film grain, studio lighting, creamy bokeh, fake portrait mode, teal/orange grade, or luxury/editorial clichés.
- Day/bright exterior: flash off unless explicitly requested or physically justified.
- Night/direct phone flash when requested: near subject receives stronger frontal exposure; white fabric can clip; glass/metal produces localized highlights; nearby short shadows are harder; illumination falls off quickly; distant background stays darker.
- Low-light imperfection is digital sensor/high-ISO/shadow/chroma noise, not analog film grain.

OBJECT / POV SPECIAL MODE:
If the modality or idea is object/POV/food/desk/table/car-hood oriented, prioritize object orientation, support surface, contact patches, curvature, packaging folds, wear/fingerprints/grease/crumbs only when justified, surrounding context, camera height/tilt and material reflections. Do not turn it into a catalog/product-ad photo. Do not invent hands unless visible/requested by the idea.

OUTPUT:
- Return ONLY the enhanced idea itself.
- Match the language of the user's original idea exactly: Portuguese stays Portuguese, Spanish stays Spanish, English stays English.
- Keep the user's facts and tone; enrich physical/spatial/camera evidence.
- Do not show analysis, headings like PASS 1/PASS 2, checklists, JSON, explanations, or commentary.
`;

    // Prefer fast, high-quota model with fallback to handle rate limits seamlessly.
    const magicModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (let index = 0; index < magicModels.length; index++) {
      if (clientClosed || res.destroyed) return;
      const model = magicModels[index];
      try {
        const result = await withDeadline(
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.18
            }
          }),
          38000,
          'MAGIC_MODEL_TIMEOUT'
        );

        let enhanced = result.text?.trim() || '';
        if (!enhanced && result.candidates?.[0]?.content?.parts) {
          const parts = result.candidates[0].content.parts;
          const textPart = parts.find((p: any) => !p.thought && typeof p.text === 'string' && p.text.trim());
          if (textPart) {
            enhanced = textPart.text.trim();
          } else {
            enhanced = parts.map((p: any) => p.text || '').join('').trim();
          }
        }

        if (!enhanced) throw new Error('EMPTY_ENHANCE_RESPONSE');

        if (!clientClosed && !res.destroyed && !res.headersSent) {
          return res.json({ enhanced, elapsedMs: Date.now() - startedAt });
        }
        return;
      } catch (error: any) {
        lastError = error;
        if (isRateLimit(error)) {
          console.info(`[MAGIC] model=${model} hit quota/rate limit. Attempting next model...`);
        } else {
          console.warn(`[MAGIC] model=${model} failed: ${error?.message || error}`);
        }
        if (clientClosed || res.destroyed) return;
      }
    }

    const message = String(lastError?.message || 'MAGIC_ENHANCE_FAILED');
    const isTimeout = /TIMEOUT/i.test(message);
    const isQuota = isRateLimit(lastError);
    const status = isTimeout ? 504 : isQuota ? 429 : 500;
    if (!clientClosed && !res.destroyed && !res.headersSent) {
      return res.status(status).json({ error: isTimeout ? 'MAGIC_TIMEOUT' : isQuota ? 'RATE_LIMIT' : 'MAGIC_ENHANCE_FAILED' });
    }
  } catch (error: any) {
    if (!isRateLimit(error)) {
      console.error('[MAGIC] error:', error?.message || error);
    }
    if (!clientClosed && !res.destroyed && !res.headersSent) {
      return res.status(500).json({ error: error?.message || 'MAGIC_ENHANCE_FAILED' });
    }
  }
});

// Refine Prompt
app.post('/api/refine-prompt', async (req: Request, res: Response) => {
  try {
    const { targetEngine, originalPrompt, refinementDirective } = req.body;
    const ai = getAiClient();

    const prompt = `
YOU ARE A PRECISION PHOTOGRAPHIC PROMPT SURGEON.
You are given an existing generated prompt (${(targetEngine || 'v1').toUpperCase()} ENGINE) and a user modification request.

ORIGINAL PROMPT:
"""${originalPrompt}"""

USER'S EXACT MODIFICATION DIRECTIVE:
"""${refinementDirective}"""

CRITICAL RULES:
1. ONLY apply the exact modification specified by the user; preserve all poses, camera settings, lighting, vehicle, environment, and background.
2. DO NOT randomly rewrite the rest of the prompt or re-roll the entire scene.
3. Maintain the exact formatting style of the target engine:
   - If V1: Preserve its compact smart-natural curly-brace style and scene facts; do not expand it into V2/V3.
   - If V2: Maintain the structured {} brackets format with the bold headers (**ângulo e câmera:**, **cenário:**, etc.) and the mandatory opening sentence.
   - If V3: Maintain the direct natural-language curly-brace {} format and the same scene-specific block order; never convert it into a blueprint or meta-prompt.
4. Return ONLY the updated prompt text. No preamble or conversational filler.
`;

    const refineModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let refinedText = '';
    for (const model of refineModels) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { temperature: 0.1 }
        });
        let text = result.text?.trim() || '';
        if (!text && result.candidates?.[0]?.content?.parts) {
          const parts = result.candidates[0].content.parts;
          const textPart = parts.find((p: any) => !p.thought && typeof p.text === 'string' && p.text.trim());
          if (textPart) text = textPart.text.trim();
        }
        if (text) {
          refinedText = text;
          break;
        }
      } catch (err: any) {
        if (!isRateLimit(err)) {
          console.warn(`Refine prompt model ${model} failed:`, err?.message || err);
        }
      }
    }

    res.json({ refined: refinedText || originalPrompt });
  } catch (error: any) {
    if (!isRateLimit(error)) {
      console.error("Refine prompt error:", error);
    }
    res.status(500).json({ error: error.message || "Failed to refine prompt" });
  }
});

// Detect Contextual Params
app.post('/api/detect-params', async (req: Request, res: Response) => {
  try {
    const { text, images } = req.body;
    const ai = getAiClient();
    const contentsParts: any[] = [];

    contentsParts.push({
      text: `Analyze this scene request and deduce the most authentic optical and physical parameters:
Request: "${text}"`
    });

    if (images && images.length > 0) {
      for (const img of images.slice(0, 2)) {
        if (img.dataUrl && img.dataUrl.includes(',')) {
          const [meta, base64] = img.dataUrl.split(',');
          const mimeType = meta.split(';')[0].replace('data:', '') || 'image/jpeg';
          contentsParts.push({
            inlineData: { mimeType, data: base64 }
          });
        }
      }
    }

    const detectModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let detectedData: any = {};

    for (const model of detectModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contentsParts,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                pose: { type: Type.STRING },
                behavior: { type: Type.STRING },
                gaze: { type: Type.STRING },
                expression: { type: Type.STRING },
                camera: { type: Type.STRING },
                lens: { type: Type.STRING },
                distance: { type: Type.STRING },
                framing: { type: Type.STRING },
                flash: { type: Type.STRING },
                time: { type: Type.STRING },
                environment: { type: Type.STRING },
                vehicle: { type: Type.STRING },
                activity: { type: Type.STRING }
              }
            }
          }
        });

        let respText = response.text?.trim() || '';
        if (!respText && response.candidates?.[0]?.content?.parts) {
          const parts = response.candidates[0].content.parts;
          const textPart = parts.find((p: any) => !p.thought && typeof p.text === 'string' && p.text.trim());
          if (textPart) respText = textPart.text.trim();
        }

        if (respText) {
          if (respText.startsWith('```')) {
            respText = respText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
          }
          detectedData = JSON.parse(respText);
          break;
        }
      } catch (err: any) {
        if (!isRateLimit(err)) {
          console.warn(`Detect params model ${model} failed:`, err?.message || err);
        }
      }
    }

    res.json(detectedData);
  } catch (error: any) {
    if (!isRateLimit(error)) {
      console.error("Detect params error:", error);
    }
    res.json({});
  }
});

// ============================================================================
// VITE / STATIC SERVING
// ============================================================================
export default app;

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
