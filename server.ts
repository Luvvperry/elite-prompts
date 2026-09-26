import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

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

// ============================================================================
// V1 LEGACY SYSTEM PROMPT DEFINITION (LOCKED & PRESERVED 100% 1:1)
// ============================================================================
const V1_LEGACY_INSTRUCTION = `
YOU ARE AN ELITE IMAGE-TO-PROMPT GENERATOR (iPhone RAW snapshot realism).

GOAL
User uploads an image or gives an idea. You output ONE (1) prompt that recreates the photo as a real iPhone snapshot. It must copy EVERYTHING that is visible/specified EXCEPT the person’s appearance/identity. Tattoos must be ignored completely.

OUTPUT FORMAT (EXACT)
Subject A: [blank] Subject B: [blank]
An ultra-detailed, HD, authentic portrait captured as if taken by an iPhone camera, [ONE single paragraph describing the photo using highly evocative, precise photographic terminology for textures, lighting, and structure]. Avoid AI artifacts: no plastic skin, no CGI surfaces, no warped anatomy, no extra fingers, no distorted hands. Do not change Subject's facial features. Subjects must look 1000% identical to uploaded images.
is fully sharp and in focus, with no bokeh, no depth-of-field effect, and no portrait mode. No color grading, no stylization, no cinematic look; the tone is neutral, not too cool, not too warm. Shot in portrait orientation with a 3:4 aspect ratio, roughly 24–26mm equivalent, realistic exposure (around f/1.9, 1/125s, ISO 160). It must not look AI-generated, but like a real iPhone snapshot taken in the moment. [DO NOT CHANGE SUBJECT/S' FACIAL FEATURES]

SUBJECT LINE RULES
- Always output: "Subject A: [blank]"
- If a second person is clearly visible or specified, include: "Subject B: [blank]" on the SAME line.
- If there is no second person, output only: "Subject A: [blank]" (no Subject B).
- Do NOT add any extra words on the subject line.

CRITICAL PRIORITIES:
- OBSESSIVE POSE REPLICATION (1:1 CLONE): Biomechanical and geometric precision mapping joints, angles, and weight distribution.
- VEHICLE & OBJECT FORENSICS (100% ACCURACY): Exact Make, Model, approximate Year, color finish, visible mods, wheel spoke pattern.
- EXACT SCENE & SPATIAL RECREATION: Exact spatial relationship between subject and environment.
- OUTFIT, ACCESSORIES & TEXTURES: Brand, fit, fabric drape, tactile reality.
- IDENTITY + TATTOO RULES: Do NOT describe facial features, age, skin tone, or tattoos.
- ANTI-AI & IDENTITY STRINGS:
  "Avoid AI artifacts: no plastic skin, no CGI surfaces, no warped anatomy, no extra fingers, no distorted hands. Do not change Subject's facial features. Subjects must look 1000% identical to uploaded images."
- FINAL CAMERA SETTINGS (PASTED VERBATIM AT THE END):
  "is fully sharp and in focus, with no bokeh, no depth-of-field effect, and no portrait mode. No color grading, no stylization, no cinematic look; the tone is neutral, not too cool, not too warm. Shot in portrait orientation with a 3:4 aspect ratio, roughly 24–26mm equivalent, realistic exposure (around f/1.9, 1/125s, ISO 160). It must not look AI-generated, but like a real iPhone snapshot taken in the moment. [DO NOT CHANGE SUBJECT/S' FACIAL FEATURES]"
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

// Generate All Prompts (V1, V2, V3 + Auto Detection)
app.post('/api/generate-prompts', async (req: Request, res: Response) => {
  try {
    const { mode, modality, selectedTypeId = modality, promptLanguage, ideaText, references, settings } = req.body;
    const ai = getAiClient();
    const settingsContext = formatSettingsContext(settings);

    // Normalize UI codes and locale names so language selection never silently falls back.
    const rawPromptLanguage = String(promptLanguage ?? '').trim().toLowerCase();
    const normalizedPromptLanguage =
      rawPromptLanguage === 'pt' || rawPromptLanguage === 'pt-br' || rawPromptLanguage.includes('portugu') ? 'pt' :
      rawPromptLanguage === 'es' || rawPromptLanguage.includes('span') || rawPromptLanguage.includes('españ') ? 'es' :
      'en';
    const isSpanish = normalizedPromptLanguage === 'es';
    const isPortuguese = normalizedPromptLanguage === 'pt';
    const isEnglish = normalizedPromptLanguage === 'en';
    const requestedLanguageName = isPortuguese ? 'Brazilian Portuguese' : isSpanish ? 'Spanish' : 'English';

    const systemPrompt = `
YOU ARE THE WORLD'S FOREMOST OPTICAL FORENSICS AND PHOTOGRAPHIC PROMPT ARCHITECT.
HARD OUTPUT LANGUAGE LOCK: The requested output language is ${requestedLanguageName}.
Write V2, V3, and every natural-language value in autoDetected in ${requestedLanguageName}.
Do not translate the requested language into English and do not mix languages. The only exception is V1's explicitly preserved legacy English formula.
Your mission is to construct three (3) distinct, highly specialized prompt engines for an image or scene:
- V1: ORIGINAL / OPTICAL (LOCKED 1:1 LEGACY ENGINE)
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

==================================================
ENGINE 1: V1 — ORIGINAL / OPTICAL (LOCKED 1:1 LEGACY ENGINE)
==================================================
Must adhere 100% strictly to the following legacy format:
${V1_LEGACY_INSTRUCTION}

==================================================
ENGINE 2: V2 — STRUCTURED REALISM (BLOCK SYNTAX WITH {})
==================================================
V2 MUST KEEP THE CLASSIC STRUCTURE WITH CURLY BRACES {}.
DO NOT replace with technical headings. DO NOT convert into a meta-prompt or bullet list.
Every bracket {} must contain deep, forensic, physical observation.

FOR A SOLO PERSON (FOTO SOLO):
Structure for Spanish (${isSpanish ? 'ACTIVE' : 'DEFAULT'}):
FOTO SOLO: crea una imagen de la persona principal enviada en la foto de arriba.

viste: { [describir cada prenda visible: color exacto, material mate o brillante, grosor, corte holgado o ajustado, tipo de cuello, botones, bolsillos, acumulación de tela en cintura o tobillos, calzado detallado indicando si lleva o no calcetines, accesorios exactos como gafas, collares dobles, reloj de eslabones y pulseras en la muñeca visible] }.

ambiente: { [organización espacial real: qué hay en el lado izquierdo del encuadre, qué hay en el lado derecho, profundidad de calle o habitación, texturas de suelo, paredes, macetas o vegetación, postes, vehículos distantes con color y modelo plausible, fondo y cielo] }.

acción de la persona: { [biomecánica exacta del frame: en qué momento del paso o apoyo está capturado, pierna que soporta peso vs pierna retrasada, posición exacta de cada brazo y mano (ej: mano hundida en bolsillo, brazo opuesto doblado cubriendo boca/nariz), inclinación de cabeza, dirección de la mirada a través de gafas] }.

la foto es tomada de él: { [dispositivo, quién toma la foto, orientación vertical/horizontal, distancia para encuadre completo o medio, altura de cámara respecto al pecho/cintura del fotógrafo, perspectiva amplia sin compresión de teleobjetivo] }.

imperfecciones: { [defectos puramente causais de la captura cotidiana: grano sutil en sombras, ligera falta de micro-enfoque en bordes periféricos o micro-trepidación manual sin efectos artificiales] }.

efecto: { [fotografía móvil espontánea, profundidad de campo naturalmente amplia, procesado discreto de smartphone y contraste suficiente para conservar textura de ropa y entorno sin filtro de cine ni render] }.

piel: { [textura natural coherente con la distancia focal: sin microporos hiper-renderizados artificiales si está a distancia, sin alisado plástico de IA] }.

sombras: { [fuente de luz, dirección, suavidad de bordes, sombras proyectadas por la ropa y el cuerpo en el suelo o paredes adyacentes] }.

ángulo de la foto: { [ángulo frontal/tres cuartos, altura de cámara a nivel de pecho, centrado o descentrado del sujeto, línea del horizonte a media altura y recorte justo debajo de los pies] }.

Structure for Portuguese (${isPortuguese ? 'ACTIVE' : 'OPTION'}):
FOTO SOLO: crie uma imagem da pessoa principal enviada na foto acima.

a pessoa está vestindo: { [descrever peça por peça: tecido, gramatura, caimento, gola, botões, acumulação de tecido, calçados com ou sem meias, acessórios e relógio] }.

ambiente: { [organização espacial detalhada: lado esquerdo, lado direito, textura do piso, arquitetura, elementos de profundidade e céu] }.

ação da pessoa: { [biomecânica exata: perna de apoio, perna de arrasto, posição individual de braços e mãos, inclinação da cabeça e vetor do olhar] }.

a foto é tirada dela: { [dispositivo, distância de enquadramento, altura em relação ao fotógrafo, perspectiva ótica natural] }.

imperfeições: { [imperfeições causais estritas da captura do momento] }.

efeito: { [captura móvel autêntica sem filtros de cinema ou render plástico] }.

pele: { [textura real e calibrada pela distância da câmera] }.

sombras: { [direção, suavidade e oclusão real da luz] }.

ângulo da foto: { [alinhamento, nível do peito, horizonte e enquadramento exato] }.

Structure for English (${isEnglish ? 'ACTIVE' : 'OPTION'}):
SOLO PHOTO: create an image of the main person sent in the photo above.

the subject is wearing: { [detailed wardrobe piece-by-piece, fabric drape, seams, bunching, footwear with/without socks, jewelry, watch, eyewear] }.

environment: { [spatial layout: viewer-left, viewer-right, ground pavement, architectural structures, depth objects, distant background] }.

subject action: { [exact biomechanical frame: weight-bearing leg, trailing leg, individual arm and hand positions, head tilt, gaze vector] }.

the photo is taken of the subject: { [device, orientation, distance, camera height relative to photographer chest, natural wide perspective] }.

imperfections: { [causal capture imperfections only, subtle shadow noise, authentic handheld snapshot flaws] }.

effect: { [unposed smartphone photograph, natural depth of field, tactile textures, no artificial cinematic grading] }.

skin: { [natural skin texture congruent with distance, no plastic smoothing, no CGI pore exaggerations] }.

shadows: { [light direction, softness, ambient fill balance, ground contact occlusion] }.

photo angle: { [camera height at chest level, horizontal alignment, centered composition, crop boundary] }.

FOR TWO PEOPLE (DUPLA):
Header line: FOTO EN DUPLA (or localized equivalent).
Include separate blocks:
primera persona viste: { ... }.
segunda persona viste: { ... }.
ambiente: { ... }.
acción de la primera persona: { ... }.
acción de la segunda persona: { ... }.
la foto es tomada de ellos: { ... }.
imperfecciones: { ... }.
efecto: { ... }.
piel: { ... }.
sombras: { ... }.
ángulo de la foto: { ... }.

FOR VEHICLES / SCENES / OBJECTS WITHOUT PERSONS:
SUJETO PRINCIPAL: { ... }.
ambiente: { ... }.
óptica y toma: { ... }.
materiales y física: { ... }.
imperfecciones: { ... }.
iluminación y sombras: { ... }.

FOR FIRST-PERSON POV / OBJECTS (object_pov modality or POV style):
In Spanish:
FOTO POV / OBJETO EN PRIMERA PERSONA: crea una imagen capturada desde la perspectiva en primera persona (POV) del fotógrafo.
objeto e interacción con las manos: { [descripción física exacta del objeto sostenido: materiales, acabados, y anatomía exacta de las manos que lo sujetan: colocación de cada dedo, presión de agarre natural, pliegues cutáneos en nudillos, uñas limpias, mangas visibles y reloj/joyería] }.
ambiente y superficie: { [superficie de contacto en primer plano: madera, volante con costuras, mármol, y entorno de fondo contextual sin desenfoque artificial excesivo] }.
acción y perspectiva POV: { [ángulo en primera persona, manos ingresando desde el borde inferior izquierdo/derecho del marco, distancia corta de celular] }.
la foto es tomada desde: { cámara trasera de smartphone en primera persona, encuadre natural a la altura del pecho o mesa] }.
imperfecciones: { [sutil ruido de sensor en sombras, micro-sombras de contacto debajo de los dedos y objeto] }.
efecto: { [captura espontánea de iPhone, texturas hiper-tangibles, nitidez uniforme de sensor móvil] }.
piel y manos: { [textura real de la piel de las manos, sin alisado ni deformaciones de IA] }.
sombras: { [luz direccional o ambiental, sombras de oclusión entre los dedos y el objeto] }.
ángulo de la toma: { [mirada en primera persona dirigida hacia el objeto con ángulo ligeramente inclinado hacia abajo] }.

In Portuguese:
FOTO POV / OBJETO EM PRIMEIRA PESSOA: crie uma imagem capturada a partir da perspectiva em primeira pessoa (POV) do usuário.
objeto e interação com as mãos: { [descrição física exata do objeto: dimensões, materiais, e anatomia de mãos segurando com firmeza natural, nós dos dedos dobrados, unhas realistas, punhos da blusa e relógio no pulso] }.
ambiente e superfície: { [superfície em primeiro plano e profundidade contextual ao redor] }.
ação e perspectiva POV: { [ângulo em primeira pessoa, mãos entrando pelas bordas inferiores, distância de celular] }.
a foto é tirada de: { câmera traseira de smartphone em primeira pessoa, altura do peito ou mesa] }.
imperfeições: { [ruído sutil de sensor móvel, micro-sombras reais de contato] }.
efeito: { [fotografia casual de smartphone, texturas palpáveis sem blur plástico] }.
pele e mãos: { [pele das mãos com textura real, sem filtros ou dedos duplicados] }.
sombras: { [sombras de contato e direção natural da luz] }.
ângulo da foto: { [olhar em primeira pessoa direcionado ao objeto] }.

In English:
FIRST-PERSON POV / OBJECT PHOTO: create an image captured from the first-person perspective (POV) of the photographer.
object and hand interaction: { [tangible description of the held object: materials, texture, and realistic hand anatomy: exact finger placement, natural grip tension, knuckle creases, fingernails, visible cuffs/watch] }.
environment and surface: { [foreground surface: wood grain, steering wheel stitching, cafe counter, and contextual spatial background] }.
action and POV perspective: { [first-person glance, hands entering from lower left/right frame edges, natural phone working distance] }.
the photo is taken from: { handheld smartphone rear camera in POV, eye or chest level looking down] }.
imperfections: { [subtle digital sensor noise in shadows, authentic contact shadows under fingertips] }.
effect: { [tactile smartphone realism, authentic dynamic range, zero fake bokeh] }.
skin and hands: { [authentic skin texture on hands, anatomically correct 5 fingers per hand, natural nail beds] }.
shadows: { [directional or ambient light casting realistic contact shadows] }.
photo angle: { [downward first-person glance angled toward the subject] }.

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

==================================================
LANGUAGE LOCALIZATION DIRECTIVE:
==================================================
${isSpanish 
  ? `CRITICAL LANGUAGE REQUIREMENT:
- V1: Keep in its exact standard English snapshot formula as established.
- V2: Output in Spanish (Español) using the exact curly braces {} structure.
- V3: Output in Spanish (Español), as a direct final prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
  : isPortuguese 
  ? `CRITICAL LANGUAGE REQUIREMENT:
- V1: Keep in its exact standard English snapshot formula as established.
- V2: Output in Portuguese (Português Brasil) using the exact curly braces {} structure.
- V3: Output in Portuguese (Português Brasil), as a direct final prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
  : `CRITICAL LANGUAGE REQUIREMENT:
- V1 remains in its exact legacy English formula.
- V2 must be generated in English using curly braces {}.
- V3 must be generated in English as a direct final image prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.`
}

==================================================
AUTO DETECT EXTRACTION:
==================================================
Return key detected parameters (subjectCount, pose, behavior, gaze, expression, camera, lens, distance, framing, flash, time, environment, vehicle, activity, lighting) in the language requested.
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

    contentsParts.push({
      text: `OUTPUT LANGUAGE LOCK: Generate all requested natural-language content in ${requestedLanguageName}. Keep V1 in its preserved legacy English formula only; V2, V3, and autoDetected must be entirely in ${requestedLanguageName}.

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

    const MODELS_CASCADE = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (let attempt = 0; attempt < MODELS_CASCADE.length + 1; attempt++) {
      const currentModel = MODELS_CASCADE[Math.min(attempt, MODELS_CASCADE.length - 1)];
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: contentsParts,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.15,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                v1: { type: Type.STRING },
                v2: { type: Type.STRING },
                v3: { type: Type.STRING },
                autoDetected: {
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
                }
              },
              required: ["v1", "v2", "v3", "autoDetected"]
            }
          }
        });

        const responseText = response.text;
        if (!responseText) throw new Error("Empty response from model.");

        const parsed = JSON.parse(responseText);
        const defaultNegativePrompt = "fake AI look, CGI, 3D render, plastic smooth skin, airbrushed, cartoon, anime, illustration, oversaturated, artificial studio lighting, shallow cinematic bokeh, exaggerated fake blur, extra fingers, mutated hands, distorted anatomy, missing limbs, floating objects, watermark, signature, text artifacts, weird eyes, unnatural specular highlights";

        return res.json({
          v1: parsed.v1?.trim() || "",
          v2: parsed.v2?.trim() || "",
          v3: parsed.v3?.trim() || "",
          negativePrompt: defaultNegativePrompt,
          autoDetected: parsed.autoDetected || {}
        });
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} with model ${currentModel} failed: ${err.message}`);
        if (attempt < MODELS_CASCADE.length) {
          await wait(1000 * (attempt + 1));
          continue;
        }
        break;
      }
    }

    throw new Error(`Generation failed: ${lastError?.message || 'High model demand. Please try again in a moment.'}`);
  } catch (error: any) {
    console.error("Generate prompts error:", error);
    res.status(500).json({ error: error.message || "Failed to generate prompts" });
  }
});

// Magic Enhance Idea
app.post('/api/magic-enhance', async (req: Request, res: Response) => {
  try {
    const { rawIdea, modality } = req.body;
    if (!rawIdea || !rawIdea.trim()) {
      return res.json({ enhanced: rawIdea || '' });
    }

    const ai = getAiClient();
    const prompt = `
YOU ARE AN EXPERT IN CASUAL IPHONE REALISM AND SPATIAL PHOTOGRAPHIC EXPANSION.
A user has written this raw photo idea:
"""${rawIdea}"""

MODALITY: ${modality}

YOUR MISSION:
Enhance and flesh out this idea into a complete, physically plausible scene description GROUNDED IN AUTHENTIC IPHONE CASUAL PHOTOGRAPHY.
Enrich the tangible physical evidence (body posture, weight distribution, hand position, clothing drape, spatial arrangement, phone camera height/distance, realistic phone flash/ambient light) WITHOUT CHANGING ANY OF THE USER'S EXPLICIT FACTS OR TURNING IT INTO CINEMATIC / PROFESSIONAL PHOTOGRAPHY.

==================================================
CORE DIRECTIVES:
==================================================

1. IPHONE SNAPSHOT FIRST:
- By default, describe the shot as taken with a casual smartphone: iPhone rear main camera 1x.
- Natural smartphone depth of field.
- Handheld framing at chest/eye level.
- Automated exposure and natural smartphone processing.

2. STRICT BAN ON PROFESSIONAL / CINEMATIC JARGON:
- ABSOLUTELY FORBIDDEN: cinematic, film look, editorial, anamorphic, prime lens, creamy bokeh, shallow depth of field, film grain, rim light, studio lighting.

3. PHYSICAL & SPATIAL EVIDENCE TO ENRICH:
- Biomechanics, wardrobe drape, environment depth, realistic smartphone lighting.

4. INVIOLABLE FACTS (DO NOT ALTER):
- DO NOT change user's subjects, clothes, vehicles, setting, brand, beverage, or core action.

5. OUTPUT FORMAT:
- Return ONLY the enhanced idea text.
- Match the exact language of the user's input (Portuguese, Spanish, or English).
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { temperature: 0.2 }
    });

    res.json({ enhanced: result.text?.trim() || rawIdea });
  } catch (error: any) {
    console.error("Magic enhance error:", error);
    res.status(500).json({ error: error.message || "Failed to enhance idea", enhanced: req.body?.rawIdea || '' });
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
   - If V1: Maintain the Subject line, single paragraph, and closing camera formula verbatim.
   - If V2: Maintain the structured {} brackets format.
   - If V3: Maintain the direct natural-language curly-brace {} format and the same scene-specific block order; never convert it into a blueprint or meta-prompt.
4. Return ONLY the updated prompt text. No preamble or conversational filler.
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { temperature: 0.1 }
    });

    res.json({ refined: result.text?.trim() || originalPrompt });
  } catch (error: any) {
    console.error("Refine prompt error:", error);
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    if (response.text) {
      return res.json(JSON.parse(response.text));
    }
    res.json({});
  } catch (error: any) {
    console.error("Detect params error:", error);
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
