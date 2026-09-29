import express from 'express';
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
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const withDeadline = async (promise, ms, code = 'REQUEST_TIMEOUT') => {
    let timer;
    try {
        return await Promise.race([
            promise,
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(code)), ms);
            })
        ]);
    }
    finally {
        if (timer)
            clearTimeout(timer);
    }
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
const formatSettingsContext = (settings) => {
    if (!settings)
        return '';
    const parts = [];
    if (settings.device)
        parts.push(`- Model/Device: ${settings.device}`);
    if (settings.look || settings.sharpness || settings.hdr) {
        parts.push(`- Look: ${settings.look || 'RAW'}, Sharpness: ${settings.sharpness || 'Natural'}, Dynamic Range: ${settings.hdr || 'Natural'}`);
    }
    if (settings.aspectRatio)
        parts.push(`- Aspect Ratio: ${settings.aspectRatio}`);
    if (settings.outputFormat && settings.outputFormat !== 'auto')
        parts.push(`- Output Format / Platform: ${settings.outputFormat}`);
    if (settings.photographicStyle)
        parts.push(`- Photographic Style: ${settings.photographicStyle}`);
    if (settings.realismLevel !== undefined)
        parts.push(`- Realism Priority: ${settings.realismLevel}%`);
    parts.push(`- Imperfection Level: ${settings.imperfectionLevel ?? 45}%, Cinematic Level: ${settings.cinematicLevel ?? 10}%, Stylization Level: ${settings.stylizationLevel ?? 0}%, Background Detail: ${settings.backgroundDetailLevel ?? 80}%, Blur Level: ${settings.blurLevel ?? 5}%`);
    if (settings.subjectCount && settings.subjectCount !== 'auto')
        parts.push(`- Subjects Count: ${settings.subjectCount}`);
    if (settings.bodyPosition && settings.bodyPosition !== 'auto')
        parts.push(`- Body Position: ${settings.bodyPosition}`);
    if (settings.orientation && settings.orientation !== 'auto')
        parts.push(`- Orientation: ${settings.orientation}`);
    if (settings.weightDistribution && settings.weightDistribution !== 'auto')
        parts.push(`- Weight Distribution: ${settings.weightDistribution}`);
    if (settings.posture && settings.posture !== 'auto')
        parts.push(`- Posture: ${settings.posture} ${settings.customPosture ? `(${settings.customPosture})` : ''}`);
    if (settings.expression && settings.expression !== 'auto')
        parts.push(`- Expression: ${settings.expression} ${settings.customExpression ? `(${settings.customExpression})` : ''}`);
    if (settings.gaze && settings.gaze !== 'auto')
        parts.push(`- Gaze: ${settings.gaze}`);
    if (settings.actionDescription)
        parts.push(`- Action Description: ${settings.actionDescription}`);
    if (settings.cameraDevice && settings.cameraDevice !== 'auto')
        parts.push(`- Camera Device: ${settings.cameraDevice}`);
    if (settings.cameraLens && settings.cameraLens !== 'auto')
        parts.push(`- Lens: ${settings.cameraLens}`);
    if (settings.cameraDistance && settings.cameraDistance !== 'auto')
        parts.push(`- Distance: ${settings.cameraDistance}`);
    if (settings.cameraHeight && settings.cameraHeight !== 'auto')
        parts.push(`- Height: ${settings.cameraHeight}`);
    if (settings.cameraAngle && settings.cameraAngle !== 'auto')
        parts.push(`- Angle: ${settings.cameraAngle}`);
    if (settings.cameraFraming && settings.cameraFraming !== 'auto')
        parts.push(`- Framing: ${settings.cameraFraming}`);
    if (settings.lightTime && settings.lightTime !== 'auto')
        parts.push(`- Light Time: ${settings.lightTime}`);
    if (settings.lightSource && settings.lightSource !== 'auto')
        parts.push(`- Light Source: ${settings.lightSource}`);
    if (settings.flashMode && settings.flashMode !== 'auto')
        parts.push(`- Flash: ${settings.flashMode} (${settings.flashBehavior || 'normal'})`);
    if (settings.captureProfile && settings.captureProfile !== 'auto') {
        const profileMap = {
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
    const activeImperfections = [];
    if (settings.imperfections) {
        Object.entries(settings.imperfections)
            .filter(([_, v]) => v)
            .forEach(([k]) => activeImperfections.push(k.replace(/([A-Z])/g, ' $1').toLowerCase()));
    }
    if (settings.activeImperfections && settings.activeImperfections.length > 0) {
        settings.activeImperfections.forEach((imp) => activeImperfections.push(imp.replace(/_/g, ' ')));
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
        if (fc.subject)
            parts.push(`- Explicit Subject Override: ${fc.subject}`);
        if (fc.action)
            parts.push(`- Explicit Action: ${fc.action}`);
        if (fc.location)
            parts.push(`- Explicit Location: ${fc.location}`);
        if (fc.environment)
            parts.push(`- Explicit Environment: ${fc.environment}`);
        if (fc.background)
            parts.push(`- Explicit Background: ${fc.background}`);
        if (fc.atmosphere)
            parts.push(`- Explicit Atmosphere: ${fc.atmosphere}`);
        if (fc.imperfections)
            parts.push(`- Explicit Imperfections: ${fc.imperfections}`);
        if (fc.textInsideImage)
            parts.push(`- Text Inside Image: ${fc.textInsideImage}`);
        if (fc.avoid)
            parts.push(`- Strictly Avoid: ${fc.avoid}`);
        if (fc.additionalInstructions)
            parts.push(`- Additional Instructions: ${fc.additionalInstructions}`);
    }
    if (settings.realismTier)
        parts.push(`- Realism Tier: ${settings.realismTier.toUpperCase()}`);
    if (settings.aiCleanup && settings.aiCleanup !== 'none')
        parts.push(`- Anti-AI Artifact Suppression: ${settings.aiCleanup.toUpperCase()}`);
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
// V4 / V5 — ADDITIVE ENGINES (V1/V2/V3 remain unchanged)
// ============================================================================
const V4_OPENING_LANGUAGE_RULE = `
MANDATORY V4/V5 OPENING — The first sentence of both V4 and V5 must be the exact equivalent in the requested output language, with no heading or preamble:
- Brazilian Portuguese: "Faça uma imagem do homem da foto enviada, seguindo 100% das características dele."
- Spanish: "Haz una imagen del hombre de la foto enviada, siguiendo el 100% de sus características."
- English: "Create an image of the man from the uploaded photo, following 100% of his characteristics."
This is an external face-reference handoff for the final image generator, not a request to describe appearance in text. Continue with scene, wardrobe, pose, action, camera, light and imperfections only.
`;

const V4_SCENE_LOCK_INSTRUCTION = `
ENGINE 4: V4 — HUMAN IPHONE MOMENT RECONSTRUCTION
V4 is the grounded long-form engine. Produce one direct, paste-ready prompt, normally 500–750 words only when the scene needs that detail. Expand facts that change the image, but never pad with synonyms, generic realism adjectives or repeated camera clauses. Use at least 12 natural sentences. Do not summarize or explain the method.

Use this exact semantic mold, translated completely into the requested output language and adapted to the actual reference/idea:
"Create an image with the main [person/object] from the uploaded photo. They are wearing: (every visible garment, exact color, fabric, cut, closure, small wrinkles, compression, and how the clothing falls on the body). Physical appearance: (natural, believable proportions and only visible identity evidence, with no exaggerated anatomy). They are: {the exact real place and time, the ordinary physical environment, foreground/midground/background, surfaces, clutter, nearby people and objects, with no staged set, no model pose and no cinematic composition}. Around them: (only relevant objects with exact position, ownership, orientation, contact and scale). Main action: {the precise spontaneous moment, body mechanics, which hand does what, contact with surfaces and the direction of the gaze}. The photo is taken: (by whom, from what real distance, with a rear smartphone camera, as an unplanned click inside the moment). Photo imperfections: (only causally justified motion blur, imperfect autofocus, uneven exposure, digital noise, phone compression, slight framing error and small out-of-focus areas). Angle: (camera height, side/front relation, distance, tilt, crop and natural perspective without changing body proportions). Photo format: (requested platform, vertical/horizontal ratio and imperfect amateur framing). Light: (real source, direction, hardness, falloff, flash state, shadow behavior, reflected highlights and distant-background exposure). Skin: (unretouched pores, tiny tonal variations, natural texture and no beauty smoothing). Camera simulation: (rear smartphone, plausible 24–26mm equivalent main lens, plausible aperture/ISO/shutter behavior chosen for the actual light, no portrait mode, no artificial background blur, discreet computational HDR, imperfect auto white balance and ordinary mobile color)."

Expand every parenthetical and curly-brace block with specific scene evidence. Put concrete nouns, positions, contact points and causal camera facts before decorative adjectives. Do not repeat facts across blocks.

TEXT, LOGO AND TYPOGRAPHY FIDELITY — when the reference visibly contains a logo, brand mark, sign, label, license plate, menu, interface, product name or any other lettering:
- Treat the visible graphic as high-priority reference evidence. Preserve its exact word order, spelling, letter count, capitalization, logo silhouette, symbol geometry, spacing, baseline, perspective, placement and color relationships.
- Describe only what is actually legible. If the reference is too small, occluded or out of focus, explicitly instruct the image model to keep the text indistinct and not invent replacement letters or brands; never hallucinate readable text.
- Require clean, physically plausible letter edges and logo geometry at the reference's real focus level: no melted glyphs, random characters, mirrored writing, doubled outlines, warped logos, fake watermark, extra brand marks or floating text.
- Keep signs and logos attached to their real surface and obeying its perspective, curvature, folds, reflections, occlusion, lighting and depth of field. Do not sharpen an intentionally out-of-focus sign into invented detail.
- Text is not a decorative afterthought: reserve a dedicated visual-coherence check for every visible word or mark before returning the prompt. The final prompt must continue beyond this mold with a long physical coherence pass written as natural clauses: clothing must fall according to posture; hands, fingers, feet and weight distribution must be human; reflections must follow the surface; shadows must follow the light; distant people must behave independently; objects must have weight and contact; the camera must occupy a physically possible position. Use the supplied scene reference only for count, wardrobe, environment, pose, action and visible details. If a detail is unclear, describe it conservatively instead of inventing brands, text, landmarks or accessories. Never extract or describe personal appearance or identity traits.

REAL PHONE PHOTOGRAPHY RULES:
The result must feel like a real imperfect iPhone snapshot, not an advertisement, render, fashion editorial or AI image. Prefer ordinary observational language over hype. No cinematic color grade, anamorphic look, studio key light, perfect symmetry, plastic skin, fake bokeh, excessive sharpness, 8K, glossy luxury styling, impossible architecture or spotless surfaces. Keep tiny human irregularities: asymmetrical posture, relaxed fingers, clothing bunching, imperfect gaze timing, lived-in objects, mixed exposure, sensor noise and slightly crooked framing. Choose ISO, shutter and flash behavior that agree with the scene; never paste a random camera specification that contradicts daylight, distance or movement. Return only the final long prompt in the requested language, without headings, analysis, quotation marks or instructions to another AI.
`;

const V5_MASTER_ADAPTIVE_INSTRUCTION = `
ENGINE 5: V5 — LIVED-IN SMARTPHONE REALITY MASTER
V5 is the grounded reality engine, not a synonym-heavy mega-prompt. Produce one direct, paste-ready prompt, normally 650–900 words for a complex reference and shorter when the evidence is simple. Every sentence must add a concrete image-changing fact or a necessary physical relationship. Never repeat the same realism idea with different adjectives. Never output a checklist, report, negative-prompt dump or meta-prompt.

REFERENCE APPEARANCE EXCLUSION — WHEN AN UPLOADED PHOTO IS PRESENT:
Use the supplied image only for scene placement, pose, clothing, accessories, action and composition. Do not describe, copy, preserve, lock or analyze the person's face, hair, skin, age, ethnicity, beard, physique or identity traits. Never invent or encode appearance details in the text prompt.


Construct one continuous paste-ready prompt with this hidden order, but do not expose headings or numbered sections in the output: begin with the exact subject and identity/reference fidelity; build the real environment as a lived-in place rather than a set; map every important relationship between people, objects, surfaces and empty space; describe the micro-moment of action and human behavior; describe clothing, hair, skin, hands, feet and posture as physical responses to that moment; place the photographer and phone in a believable position; then resolve optics, focus, exposure, light transport, materials, reflections, motion, compression and amateur framing.

V5 must feel observed, not designed. Include subtle human behavior that a generator usually misses: a gaze that lands slightly late, shoulders that are not perfectly level, fingers resting without posing, weight distributed unevenly, a shirt pulling at one side, fabric compressed where the body touches a rail or seat, hair moved by air, a bottle or phone placed without decorative intent, background people absorbed in their own actions, and small signs that the location is actually used. Never invent these when the reference disproves them; adapt them to visible evidence.

Use a controlled natural prompt made of adaptive clauses and occasional {curly-brace} blocks. Each clause must add a distinct visible fact; remove duplicate descriptions and generic filler before returning the prompt. The blocks should cover: subject/reference lock; wardrobe and body; exact place and time; scene geometry; surrounding objects; action and contact; expression and gaze; photographer position; rear-iPhone capture; lens and perspective; focus behavior; natural skin; light and flash; shadows and reflections; materials and wear; motion and imperfections; format and crop. Every block must add an image-changing fact. Keep explicit user instructions above all inference. Preserve the exact number of people and objects. Do not merge identities, limbs, garments, reflections or ownership.

REALISM TARGET:
V5 QUALITY CONTROL — before returning the prompt, silently verify: the subject still has the same recognizable identity as the supplied reference; no face swap, beauty filter, anatomy redesign, generic influencer face, or invented facial detail was introduced; every requested change is isolated to the requested delta; camera distance, body scale, perspective, light direction, contact shadows and material response agree with each other; the scene contains only evidence-supported or conservative physical details; and the final wording remains a direct image prompt rather than an explanation of these rules.
The photo must look like an unplanned phone photo with imperfect computational processing, not like a commercial image. Use plausible 24–26mm equivalent rear-camera perspective, no portrait mode and no artificial blur. Select realistic exposure values only when they agree with the light; allow digital noise, focus misses, highlight clipping, rolling-shutter softness, mild motion blur, compression, auto-white-balance drift and an imperfect crop when causally justified. Flash must be direct and local when selected, with hard near shadows, bright skin/fabric highlights and real falloff into the background; never wash an entire distant scene evenly. Daylight without requested flash remains flash-off. Preserve pores, fine hair, small skin variations and material texture without beauty retouching. Make every shadow, reflection, fold, contact patch and perspective line obey physics.

Do not use cinematic, editorial, masterpiece, hyperrealistic, luxury campaign, perfect composition, professional studio, glossy skin, fake bokeh, 3D render, illustration, fantasy lighting, random props, unreadable invented text or generic “beautiful” filler unless explicitly requested. The context may be luxurious, but the capture must remain casual, human and slightly flawed. Return only one very long final image prompt in the requested language, with no explanation, no visible framework, no headings and no instruction addressed to an AI.
`;

// ============================================================================
// API ROUTES
// ============================================================================
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
});
// Generate All Prompts (V1, V2, V3, V4, V5 + Auto Detection)
app.post('/api/generate-prompts', async (req, res) => {
    try {
        const { mode, modality, selectedTypeId = modality, promptLanguage, ideaText, references, settings } = req.body;
        const ai = getAiClient();
        const settingsContext = formatSettingsContext(settings);
        // Normalize UI codes and locale names so language selection never silently falls back.
        const rawPromptLanguage = String(promptLanguage ?? '').trim().toLowerCase();
        const normalizedPromptLanguage = rawPromptLanguage === 'pt' || rawPromptLanguage === 'pt-br' || rawPromptLanguage.includes('portugu') ? 'pt' :
            rawPromptLanguage === 'es' || rawPromptLanguage.includes('span') || rawPromptLanguage.includes('españ') ? 'es' :
                'en';
        const isSpanish = normalizedPromptLanguage === 'es';
        const isPortuguese = normalizedPromptLanguage === 'pt';
        const isEnglish = normalizedPromptLanguage === 'en';
        const requestedLanguageName = isPortuguese ? 'Brazilian Portuguese' : isSpanish ? 'Spanish' : 'English';
        const systemPrompt = `
YOU ARE THE WORLD'S FOREMOST OPTICAL FORENSICS AND PHOTOGRAPHIC PROMPT ARCHITECT.
HARD OUTPUT LANGUAGE LOCK: The requested output language is ${requestedLanguageName}.
Write V1, V2, V3, V4, V5, and every natural-language value in autoDetected in ${requestedLanguageName}.
Do not mix languages. V1, V2, V3, V4, V5, and every natural-language value in autoDetected must use the requested output language.

FINAL PROMPT CLEANLINESS — ALL ENGINES:
Never output internal instructions, rule explanations, reference handoff notes, labels such as "the man", "appearance reference", "face/reference", or blocks that say not to describe appearance. The final answer must contain only the requested image prompt: opening sentence, wardrobe, environment, action, effects, shadows, angle, imperfections, camera, light and relevant physical details.

ABSOLUTE APPEARANCE EXCLUSION — ALL ENGINES:
No version may analyze or describe the person's appearance in the text prompt. The opening handoff may refer to 100% of the separate face reference, but must not expand into appearance details. Do not describe face, facial features, hair, skin tone, ethnicity, age, beard, body shape, physique or identity markers. The reference may guide scene placement, pose, clothing, accessories, action and composition only. Treat the person's appearance as supplied separately to the image generator, but do not encode it in the text prompt. This rule overrides any appearance or identity wording elsewhere in these instructions.
Your mission is to construct five (5) distinct, highly specialized prompt engines for an image or scene:
- V1: SMART NATURAL SNAPSHOT (COMPACT, PHYSICALLY RESOLVED)
- V2: STRUCTURED REALISM (CLASSIC MODULAR BLOCKS WITH {})
- V3: FORENSIC DEEP PROMPT (ADAPTIVE CURLY-BRACE FINAL PROMPT, EXTREME PHYSICAL SPECIFICITY)
- V4: HUMAN IPHONE MOMENT RECONSTRUCTION (LONG-FORM REFERENCE-FAITHFUL PROMPT)
- V5: LIVED-IN SMARTPHONE REALITY MASTER (LONG-FORM HUMAN SNAPSHOT SYNTHESIS)

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
ENGINE 1: V1 — SMART NATURAL SNAPSHOT
==================================================
${V1_SMART_INSTRUCTION}

V1 MUST BE DISTINCT FROM V2:
- V1 is compact and high-signal: resolve only the details that materially change the picture.
- V2 is more exhaustive and spatially explicit.
- V1 must never collapse to a generic one-sentence description.
- V1 must never reuse old fixed boilerplate that overrides the user's aspect ratio, flash state, camera choice, or output language.

==================================================
ENGINE 2: V2 — STRUCTURED PHOTOGRAPHIC RECONSTRUCTION
==================================================
V2 is the precision middle engine: substantially more resolved than V1, but cleaner and easier to read than V3.
It must use direct natural-language clauses with adaptive {curly-brace} blocks and must be immediately paste-ready.

V2 CORE DIFFERENCE:
- V1 = compact smart reconstruction.
- V2 = structured photographic reconstruction with explicit geometry, biomechanics, object contact, optics, lighting, material response, and causal imperfections.
- V3 = deepest scene-forensics engine.

V2 BEFORE WRITING — silently resolve, never show the analysis:
1. SUBJECT MAP: count, reference assignment, frame side, scale in frame, body orientation, gaze, expression, action state.
2. BODY MAP: head/chin, shoulder asymmetry, torso, pelvis, weight-bearing leg, relaxed/advancing leg, feet, arms, hands, and contact points.
3. WARDROBE MAP: each visible layer, color, material, cut, closure, drape, tension, bunching, compression, footwear, accessories.
4. SCENE MAP: foreground, subject plane, mid-ground, background, viewer-left/right anchors, floor/wall/architecture, useful clutter, vehicles/objects.
5. OBJECT MAP: ownership, support surface, contact, orientation, scale, occlusion, grip, reflections, wear/grease/dust only when justified.
6. CAMERA MAP: holder, rear/front camera, lens mode, distance, height, direction, tilt, orientation, crop, subject scale, perspective.
7. LIGHT MAP: source(s), direction, hardness, falloff, cast shadows, reflected highlights, near/far exposure, flash reach.
8. IMPERFECTION MAP: only flaws causally supported by movement, light, distance, focus, handheld behavior, or phone processing.

V2 OUTPUT RULES:
- Use the requested output language for EVERY block label and description.
- Do not expose the maps above, numbered phases, JSON, checklists, or meta-instructions.
- Do not use a rigid template when the scene type does not need it.
- Every {} block must contain observable, image-changing information, not filler adjectives.
- State each important fact once. Do not repeat camera/flash/realism in multiple blocks.

V2 — SOLO PERSON / PORTRAIT / LIFESTYLE, adapt and localize:
PHOTO / SOLO PHOTO: create an image of the main person from the provided reference or specification.
main person: {identity/reference fidelity when applicable, body scale in frame, physical build only when established}.
wearing: {all relevant garments and accessories, exact color/material/fit/closure, natural folds, tension and compression caused by pose}.
environment: {specific place and spatial organization, viewer-left/right anchors, foreground/background depth, floor/wall/architecture and restrained everyday details}.
position in space: {where the person stands/sits relative to furniture, vehicle, wall, table, doorway, etc.; distance and occlusion where relevant}.
action: {exact photographed instant, not merely a verb}.
posture and body: {torso/head orientation, shoulders, hips, weight distribution, legs and feet, asymmetry}.
hands and interaction: {which hand, which object/surface, grip/contact/orientation; omit when irrelevant}.
gaze and expression: {where the eyes/head are directed and the expression actually requested/visible}.
camera: {device, rear/front camera and selected lens/mode; smartphone-first if unspecified}.
camera position and framing: {who holds it, approximate distance, height, lateral offset, front/side/3-quarter/rear relation, crop and subject scale}.
light: {real source, direction, intensity relationship, flash behavior if present, background falloff}.
shadows and reflections: {cast/contact shadows and only physically plausible glass/metal/paint highlights}.
materials: {only scene-relevant material response visible at this distance}.
photo imperfections: {only causal smartphone imperfections; no random defect dumping}.
skin and focus: {skin detail proportional to distance, autofocus behavior, natural small-sensor depth, no plastic smoothing or fake portrait bokeh}.
photo format: {requested aspect ratio/platform and crop intent}.

V2 — TWO PEOPLE / GROUPS:
- Give each important subject a separate identity/position, wardrobe, action, hands, gaze, and object ownership description.
- Explicitly map viewer-left/center/viewer-right or other useful spatial relation.
- Never merge clothing, accessories, limbs, laptops, drinks, phones, tools, or actions between subjects.
- Then describe shared environment, camera, light, imperfections, materials and format once.

V2 — OBJECT / POV / FOOD / DESK / TABLE:
Do NOT use portrait language.
POV / OBJECT PHOTO.
main object: {exact object, make/model only if established, material, finish, condition, orientation, scale and position}.
support surface: {surface material, curvature/level, exact contact patches, pressure/compression/contact shadow, spills/grease/sauce/water only when justified}.
secondary objects: {limited scene-specific items, count, ownership, orientation and occlusion; no random décor}.
environment: {garage/kitchen/car/desk/bedroom/etc., foreground/mid-ground/background and ordinary contextual anchors}.
interaction: {hands only when visible/requested; which hand, finger placement, grip/use/contact and sleeve/watch only when established}.
camera and POV: {rear smartphone camera, realistic chest/eye/waist/table height, distance, downward/upward tilt, 0.5x/1x/2x/3x behavior}.
light: {real source(s), direction, falloff, highlight/contact-shadow behavior}.
materials and reflections: {paint curvature, glass reflection/transmission, metal highlights, cardboard folds, food moisture/oil, wood/stone/plastic response only where present}.
photo imperfections: {causal handheld/digital flaws only}.
focus and format: {natural smartphone depth and requested ratio/platform}.

V2 — VEHICLE / PERSON + VEHICLE:
- Preserve the exact named vehicle when established; never downgrade it to “luxury car”.
- Resolve visible side/front/rear, door/window state, wheel/tire ground contact, roofline, interior visibility, and body-panel reflections when they matter.
- If a person leans/sits/enters/exits, state the exact contact point and body mechanics.
- In car interiors, the camera position must physically fit inside/outside the cabin; never place the camera through a seat, dashboard, door, or glass.

V2 — SCENE / INTERIOR / ARCHITECTURE / PRODUCT:
Use blocks such as:
main scene/object: {exact physical content}.
environment and geometry: {architecture, lines, distances, foreground/mid-ground/background, viewer-left/right anchors}.
object relations: {support/contact/scale/orientation/occlusion}.
camera and framing: {smartphone/device, position, distance, height, lens mode, crop}.
light and shadows: {source, direction, falloff, reflections}.
materials: {only visible material response}.
photo imperfections: {causal only}.
format: {requested ratio/platform}.

V2 PHYSICAL RULES:
- “Leaning” requires a real body-to-surface contact point and believable weight transfer.
- “Sitting” requires seat compression, hip/knee/foot logic and clothing folds at waist/knees when visible.
- “Walking” requires a real gait phase, arm counter-swing and possible slight motion blur only if justified.
- “Holding/using” requires which hand, grip/contact and object orientation.
- Food should look irregular and physically used, not automatically styled like advertising.
- Objects on a car hood must follow hood curvature and stable contact; they cannot behave as if on a perfectly level table.
- Reflections must follow glass/metal/paint geometry; do not invent impossible mirrored content.

V2 SMARTPHONE RULES:
- If camera is unspecified, default to rear iPhone/smartphone main camera at 1x, handheld.
- Preserve any explicit 0.5x/1x/2x/3x/front-camera choice exactly.
- No automatic 35mm/50mm/85mm professional-lens language, full-frame look, anamorphic language, studio lighting, or artificial portrait bokeh.
- Day/bright exterior defaults to flash off unless explicitly requested or physically justified.
- Direct phone flash at night: stronger near-field exposure, rapid falloff, possible clipping on white fabric, localized glass/metal highlights, short harder nearby shadows, darker distant background.
- Low light uses digital/high-ISO/shadow/chroma noise, not analog film grain.

V2 QUALITY GATE — silently revise before returning:
- Have all explicit user facts survived unchanged?
- Is every subject/object assigned correctly?
- Are hands, support, contact, occlusion and action physically possible?
- Can the camera really occupy the described position?
- Does flash respect distance and falloff?
- Does clothing respond to the pose?
- Do materials respond to the actual light?
- Is the environment spatial rather than generic?
- Did any buzzword replace concrete evidence?
- Did I invent luxury, landmarks, brands, logos, jewelry, props or cinematic styling?
If any answer exposes a problem, fix it silently before output.

==================================================
ENGINE 3: V3 — FORENSIC DEEP PROMPT (ADAPTIVE CURLY-BRACE FINAL PROMPT)
==================================================
V3 IS THE DEEPEST ENGINE, BUT IT MUST STILL READ LIKE A DIRECT IMAGE PROMPT — NEVER LIKE A TECHNICAL REPORT.

V3 OUTPUT HANDOFF — The scene/reference image is used only to extract the requested scene, wardrobe, pose, action, camera and lighting. The final prompt will be paired with a separate face photo by the image generator. Start the final V3 prompt with the exact language-matched 100%-characteristics handoff defined below, then output only the image prompt. Never output this rule, internal instructions, "uploaded reference", or explanations about appearance.
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
V3 — PERSON / SOLO PERSON / MULTI-SUBJECT STRUCTURED PROMPT
==================================================
V3 MUST USE THE USER'S NEW STRUCTURED MOULD BELOW FOR PEOPLE. The final output is a paste-ready image prompt, not an explanation of this instruction. Keep the section order and the curly-brace blocks exactly. Translate every heading and every value completely into the requested output language.

V3 REFERENCE HANDOFF:
- Portuguese opening for one person: "Faça uma imagem do homem da foto enviada, seguindo 100% das características dele."
- Spanish opening for one person: "Haz una imagen del hombre de la foto enviada, siguiendo el 100% de sus características."
- English opening for one person: "Create an image of the man from the uploaded photo, following 100% of his characteristics."
For two or more people, use the equivalent language-matched opening that explicitly preserves the exact number of people from the supplied references. The reference images may be used to preserve the requested identity through the separate image-reference channel, while the text prompt describes scene, clothing, pose, action, composition, camera and light. Do not add a facial-analysis paragraph or invent appearance traits in text.

V3 PERSON COUNT CONTRACT:
- ONE PERSON: output one [PERSONAGEM] block and never add a second-person block.
- TWO PEOPLE: output [PERSONAGEM 1] and [PERSONAGEM 2], each with separate clothing, posture, action, gaze, hands and object ownership. Never merge them.
- THREE PEOPLE: output [PERSONAGEM 1], [PERSONAGEM 2] and [PERSONAGEM 3] with the same separate fields.
- FOUR OR MORE / GROUP: output one separate [PERSONAGEM N] block for every important person identified by position (viewer-left, left-center, center, right-center, viewer-right), plus [OUTROS PARTICIPANTES] only when the remaining people cannot be individually resolved. Preserve the exact count when known.
- If the selected subject count is auto, infer the count from the explicit idea and references; never default a duo or group to one person.
- Every person's action must be physically compatible with the shared environment and must identify who touches, holds or owns each object.

V3 OUTPUT MOULD — USE THIS ORDER FOR PEOPLE:

[REFERÊNCIAS]
Crie uma imagem extremamente realista baseada nas fotos de referência enviadas. Use as referências para preservar a pessoa ou pessoas, a posição na cena, a pose, a roupa, a ação e a composição solicitadas. Preserve rosto, cabelo, tom de pele e proporções somente quando isso for explicitamente solicitado e sempre através da referência visual separada; não transforme a aparência em uma descrição inventada no texto.

[PERSONAGEM 1]
Idade aparente: { somente se explicitamente fornecida ou claramente necessária para a solicitação; caso contrário, não inventar }
Cabelo: { somente se explicitamente solicitado; caso contrário, preservar pela referência visual sem descrever }
Expressão: { expressão visível ou solicitada, sem inventar traços faciais }
Postura: { posição do corpo, orientação do torso, cabeça, ombros, quadril, pernas, pés e distribuição de peso }
Roupa e tecido: { cada peça visível, cor, material, espessura, corte, caimento, fechamento, dobras e compressões causadas pela pose }
Acessórios: { somente os acessórios visíveis ou solicitados, posição e contato }
Calçado: { tipo, cor, material, meias quando visíveis, contato com o chão e desgaste quando relevante }

[PERSONAGEM 2] (somente se houver)
Idade aparente: { somente se explicitamente fornecida; caso contrário, não inventar }
Cabelo: { somente se explicitamente solicitado; caso contrário, preservar pela referência visual sem descrever }
Expressão: { expressão visível ou solicitada, sem inventar traços faciais }
Postura: { posição independente, orientação, distribuição de peso e relação espacial com os demais }
Roupa e tecido: { peças, cores, materiais, caimento, dobras e compressões próprios deste personagem }
Acessórios: { acessórios próprios, posição e contato }
Calçado: { tipo, material, cor e contato com o chão }

[PERSONAGEM 3] (somente se houver)
Idade aparente: { somente se explicitamente fornecida; caso contrário, não inventar }
Cabelo: { somente se explicitamente solicitado; caso contrário, preservar pela referência visual sem descrever }
Expressão: { expressão visível ou solicitada, sem inventar traços faciais }
Postura: { posição independente, orientação, distribuição de peso e relação espacial com os demais }
Roupa e tecido: { peças, cores, materiais, caimento, dobras e compressões próprios deste personagem }
Acessórios: { acessórios próprios, posição e contato }
Calçado: { tipo, material, cor e contato com o chão }

[PERSONAGENS ADICIONAIS] (somente para quatro ou mais)
{ um bloco separado por pessoa importante; posição no quadro, roupa, postura, ação, gaze, mãos e relação com objetos. Nunca resumir pessoas importantes em "pessoas ao fundo" }

[AMBIENTE]
Localização: { lugar específico, tipo de espaço e relação espacial entre primeiro plano, plano dos personagens e fundo }
Elementos específicos (móveis, objetos): { objetos presentes, quantidade, material, posição, orientação, contato, propriedade e o que cada pessoa toca }
Elementos de fundo: { arquitetura, janelas, portas, veículos, pessoas distantes e detalhes cotidianos somente quando compatíveis com a referência }
Horário: { hora ou período do dia, clima e condição do local quando fornecidos ou visíveis }

[AÇÃO]
O que cada pessoa está fazendo, especificamente: { descreva uma ação diferente para cada personagem quando necessário; mãos esquerda/direita, objeto segurado, contato, direção do olhar, fase do movimento, postura e consequência física na roupa e no ambiente }

[COMPOSIÇÃO]
Enquadramento: { vertical ou horizontal, plano geral/médio/fechado, crop e escala de cada pessoa }
Posição das pessoas: { viewer-left, left-center, center, right-center, viewer-right; distância entre elas, sobreposição e quem está à frente/atrás }
Distância da câmera: { distância realista entre fotógrafo e cena, altura da câmera e perspectiva }
Primeiro plano / fundo: { elementos próximos, profundidade, linhas de fuga, espaço negativo e o que fica parcialmente oculto }

[CÂMERA]
Tipo: câmera traseira/frontal de smartphone { preservar a escolha explícita; padrão: câmera traseira }
Lente equivalente: { 0.5x/1x/2x/3x ou equivalente plausível; não transformar smartphone em lente profissional }
Distância: { distância física e posição do fotógrafo }
Profundidade de campo: { profundidade natural de smartphone, sem modo retrato e sem desfoque artificial }

[IMPERFEIÇÕES]
{ escolher somente 1 ou 2 imperfeições coerentes com a cena: leve motion blur / ruído digital / reflexo / exposição irregular / foco ligeiramente impreciso / compressão / enquadramento levemente torto; nunca despejar todos os defeitos }

[PELE]
Pele com textura natural, poros visíveis, sem efeito plástico. Não inventar descrição de rosto, cabelo, tom de pele, idade ou identidade no texto quando a referência visual separada já fornece isso.

[REALISMO]
A imagem deve parecer fotografia real, não renderização 3D. Manter mãos, dedos, roupas, objetos, sombras, reflexos, escala, contato com superfícies e distribuição de peso fisicamente coerentes. Evitar aparência de CGI, publicidade, editorial de moda, simetria perfeita, iluminação de estúdio, bokeh artificial, HDR exagerado e composição cinematográfica quando não solicitados.

[PROPORÇÃO]
{ sempre 9:16, formato vertical para Instagram, salvo instrução explícita diferente do usuário }

V3 QUALITY METHOD — APPLY SILENTLY BEFORE OUTPUT:
- Treat the prompt as direction for a photographed scene, not as a vague request. Decide who is present, what each person wears, what each person is doing, where the scene occurs, what time it is, where the light comes from and exactly where the camera is.
- Use the principles of a good prompt: concrete subject, clothing, environment, action, camera, light, imperfections, smartphone behavior, reference usage, coherent scene, spontaneous behavior and controlled variations.
- CLOTHING REALISM: name the actual fabric when supported (cotton, linen, leather, knit, denim, silk); describe fit and drape (loose, fitted, structured or fluid); include only a few believable imperfections such as a crease at the elbow or abdomen, a folded sleeve, a slightly uneven collar, stretched fabric at contact points, and layered garments. Never make clothing uniformly perfect, textureless or freshly rendered.
- ENVIRONMENT DIRECTION: specify the location, architecture, three or four concrete furniture/object anchors, background elements, atmosphere and time of day. An environment must have spatial depth and ordinary use; never replace it with "a beautiful city", "a realistic background" or generic luxury scenery.
- ACTION DIRECTION: replace generic posing with a concrete verb connected to an object or surface. Prefer holding a cup with both hands while looking through a window, tying a shoelace with one foot on a step, dragging a clip on an editing timeline, opening a cabinet, checking a phone below eye level or adjusting a bag strap. Define which hand, what contact occurs and what the body is doing as a consequence.
- CAMERA PHYSICS: when supported by the scene, define rear/front smartphone camera, plausible equivalent lens (0.5x wide, approximately 24mm, main approximately 26mm, 2x/3x tighter), camera-to-subject distance, camera height, focus target, depth of field, exposure relationship and whether the background remains relatively sharp or falls off naturally. Camera choices must agree with the light, movement and framing; never paste professional-camera language onto a phone snapshot.
- A good prompt describes what changes pixels: spatial relationships, contact points, materials, hand ownership, body mechanics, light direction and camera position. Avoid hollow adjectives such as "beautiful", "perfectly realistic" or "cinematic" without physical evidence.
- For variations of the same concept, change one controlled variable at a time (location, action, time, framing or light) while preserving the requested people, clothing and reference fidelity.
- The educational topics (50 prompt examples, checklist, blank model, variation exercise, editing commands and common AI errors) are internal quality guidance only. Never print those lessons, the checklist, the 50 prompts or meta-commentary in the final image prompt.
- Return ONLY the completed structured V3 prompt. Do not output analysis, headings such as "ENGINE 3", a checklist, a report or instructions to another AI.

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
- For people, resolve scene placement, clothing, body orientation, weight distribution, legs, feet, hands, gaze, expression, and contacts with objects or surfaces; never resolve or describe appearance or identity traits.
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
${V4_SCENE_LOCK_INSTRUCTION}
${V5_MASTER_ADAPTIVE_INSTRUCTION}
==================================================

==================================================
LANGUAGE LOCALIZATION DIRECTIVE:
==================================================
${isSpanish
            ? `CRITICAL LANGUAGE REQUIREMENT:
- V1: Output 100% in natural Spanish using the smart adaptive curly-brace format.
- V2: Output 100% in Spanish using the structured adaptive curly-brace format.
- V3: Output 100% in Spanish as a direct final prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.
- V4 and V5: Output 100% in Spanish as direct, paste-ready prompts using the V4/V5 rules above.`
            : isPortuguese
                ? `CRITICAL LANGUAGE REQUIREMENT:
- V1: Output 100% in Brazilian Portuguese using the smart adaptive curly-brace format.
- V2: Output 100% in Brazilian Portuguese using the structured adaptive curly-brace format.
- V3: Output 100% in Brazilian Portuguese, including every block label, clause, material, camera term, lighting term, and quality descriptor. Use natural-language clauses and curly braces {}. Do NOT use blueprint headings.
- V4 and V5: Output 100% in Brazilian Portuguese as direct, paste-ready prompts using the V4/V5 rules above.`
                : `CRITICAL LANGUAGE REQUIREMENT:
- V1: Output 100% in natural English using the smart adaptive curly-brace format.
- V2: Output 100% in English using the structured adaptive curly-brace format.
- V3: Output 100% in English as a direct final image prompt using natural-language clauses and curly braces {}. Do NOT use blueprint headings.
- V4 and V5: Output 100% in English as direct, paste-ready prompts using the V4/V5 rules above.`}

==================================================
AUTO DETECT EXTRACTION:
==================================================
Return key detected parameters (subjectCount, pose, behavior, gaze, expression, camera, lens, distance, framing, flash, time, environment, vehicle, activity, lighting) in the language requested.
`;
        const contentsParts = [];
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
        }
        else {
            userTextDescription = `
USER UPLOADED REFERENCE(S) ANALYSIS REQUEST:
MODALITY: ${modality}
SELECTED TYPE: ${selectedTypeId}
ADDITIONAL USER IDEA / DIRECTIVES:
"""${ideaText || 'Recreate and forensically analyze the uploaded reference photo with extreme visual evidence.'}"""

REFERENCES METADATA:
${(references || []).map((r, i) => `Image ${i + 1}: Name="${r.name}", Roles=[${(r.roles || []).join(', ')}], Assignment=${r.subjectAssignment || 'General'}`).join('\n')}

SETTINGS & GUIDANCE:
${settingsContext}
`;
        }
        contentsParts.push({
            text: `OUTPUT LANGUAGE LOCK: Generate V1, V2, V3, V4, V5, and every natural-language value in autoDetected entirely in ${requestedLanguageName}. Do not mix interface languages into the generated prompts.

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
        let lastError = null;
        for (let attempt = 0; attempt < MODELS_CASCADE.length; attempt++) {
            const currentModel = MODELS_CASCADE[Math.min(attempt, MODELS_CASCADE.length - 1)];
            try {
                const response = await ai.models.generateContent({
                    model: currentModel,
                    contents: contentsParts,
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: 0.15,
                        maxOutputTokens: 12000,
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                v1: { type: Type.STRING },
                                v2: { type: Type.STRING },
                                v3: { type: Type.STRING },
                                v4: { type: Type.STRING },
                                v5: { type: Type.STRING },
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
                            required: ["v1", "v2", "v3", "v4", "v5", "autoDetected"]
                        }
                    }
                });
                const responseText = response.text;
                if (!responseText)
                    throw new Error("Empty response from model.");
                const parsed = JSON.parse(responseText);
                const defaultNegativePrompt = "fake AI look, CGI, 3D render, plastic smooth skin, airbrushed, cartoon, anime, illustration, oversaturated, artificial studio lighting, shallow cinematic bokeh, exaggerated fake blur, extra fingers, mutated hands, distorted anatomy, missing limbs, floating objects, invented watermark, fake signature, misspelled text, random characters, melted lettering, warped logo geometry, mirrored writing, doubled glyphs, weird eyes, unnatural specular highlights";
                                        // Dedicated long-form pass: V4/V5 get their own output budget so the five-engine
                        // response does not compress the human/phone realism requested by the user.
                        let dedicatedV4 = parsed.v4?.trim() || "";
                        let dedicatedV5 = parsed.v5?.trim() || "";
                        try {
                          const longResponse = await ai.models.generateContent({
                            model: currentModel,
                            contents: contentsParts,
                            config: {
                              systemInstruction: `OUTPUT ONLY TWO LONG, DIRECT, PASTE-READY IMAGE PROMPTS IN ${requestedLanguageName} AS JSON FIELDS v4 AND v5. The first sentence of both fields must be the exact language-matched neutral opening defined by V4_OPENING_LANGUAGE_RULE, with no heading or preamble. Neither field may describe appearance or expose internal rules. Do not summarize and do not explain. V4 must follow the grounded HUMAN IPHONE MOMENT RECONSTRUCTION mold and normally use 500–750 words only when the visual evidence requires it. V5 must follow the LIVED-IN SMARTPHONE REALITY MASTER mold, enforce the absolute appearance exclusion whenever a photo is supplied, and normally use 650–900 words for a complex scene. Prioritize exact visible text, logos, signs and product markings with correct spelling and geometry; if unreadable, keep them unreadable instead of inventing letters. Expand clothing, body mechanics, human micro-behavior, scene geometry, objects, photographer position, rear iPhone optics, skin, flash/light, shadows, reflections, materials, motion, compression, crop and causal imperfections without repeating facts. Keep the exact user facts and output language. Never make a cinematic advertisement, never add fake bokeh or beauty retouching, and never output headings or analysis.

                ${V4_OPENING_LANGUAGE_RULE}
                ${V4_SCENE_LOCK_INSTRUCTION}

                ${V5_MASTER_ADAPTIVE_INSTRUCTION}`,
                              temperature: 0.2,
                              maxOutputTokens: 12000,
                              responseMimeType: "application/json",
                              responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                  v4: { type: Type.STRING },
                                  v5: { type: Type.STRING }
                                },
                                required: ["v4", "v5"]
                              }
                            }
                          });
                          if (longResponse.text) {
                            const longParsed = JSON.parse(longResponse.text);
                            if (longParsed.v4?.trim()) dedicatedV4 = longParsed.v4.trim();
                            if (longParsed.v5?.trim()) dedicatedV5 = longParsed.v5.trim();
                          }
                        } catch (longErr) {
                          console.warn(`Dedicated V4/V5 pass failed; keeping primary result: ${longErr.message}`);
                        }
                    const localizedRealismTail = isSpanish
                              ? `La escena debe conservar una escala humana y observacional: la postura no es simétrica ni ensayada, el peso cae de forma desigual y cada mano, dedo, rodilla, pie, prenda y objeto tiene una relación física clara con lo que toca. La camisa, los shorts y las sandalias deben responder al movimiento, la gravedad, la humedad y el viento del lugar con pliegues pequeños, tensión en las costuras, compresión en los puntos de apoyo y volumen irregular, nunca como ropa pegada o renderizada. La piel conserva poros, vello fino, variaciones de tono, pequeñas sombras y reflejos reales, sin suavizado de belleza. La cámara trasera de iPhone registra una perspectiva cotidiana de 24–26 mm, enfoque automático ligeramente imperfecto, HDR discreto, color automático no totalmente neutro, ruido digital proporcional a la exposición, compresión móvil y un encuadre apenas torcido. La luz y el flash solo afectan la distancia que físicamente pueden alcanzar; las sombras, reflejos y brillos siguen la dirección de la fuente y caen naturalmente hacia el fondo. Nada debe parecer una campaña, una sesión de moda, una imagen 3D o una composición demasiado perfecta.`
                              : isPortuguese
                              ? `A cena deve conservar escala humana e aparência observacional: a postura não é simétrica nem ensaiada, o peso cai de forma desigual e cada mão, dedo, joelho, pé, peça de roupa e objeto tem uma relação física clara com aquilo que toca. A camisa, o short e as sandálias devem responder ao movimento, à gravidade, à umidade e ao vento do local com pequenas dobras, tensão nas costuras, compressão nos pontos de apoio e volume irregular, nunca como roupa colada ou renderizada. A pele preserva poros, pelos finos, variações de tom, pequenas sombras e reflexos reais, sem suavização de beleza. A câmera traseira do iPhone registra uma perspectiva cotidiana de 24–26 mm, foco automático levemente imperfeito, HDR discreto, cor automática não totalmente neutra, ruído digital proporcional à exposição, compressão móvel e enquadramento um pouco torto. A luz e o flash só alcançam a distância que fisicamente conseguem alcançar; sombras, reflexos e brilhos seguem a direção da fonte e desaparecem naturalmente ao fundo. Nada deve parecer campanha, ensaio de moda, imagem 3D ou composição perfeita.`
                              : `Keep the scene human-scaled and observational: the posture is not symmetrical or rehearsed, weight falls unevenly, and every hand, finger, knee, foot, garment and object has a clear physical relationship with whatever it touches. The shirt, shorts and sandals respond to movement, gravity, humidity and local wind through small folds, seam tension, compression at contact points and irregular volume, never as pasted-on or rendered clothing. Skin keeps pores, fine hair, tonal variation, small shadows and real highlights without beauty smoothing. The rear iPhone records an ordinary 24–26mm perspective with slightly imperfect autofocus, restrained HDR, imperfect automatic color, exposure-proportional digital noise, mobile compression and a subtly crooked frame. Light and flash reach only as far as they physically can; shadows, reflections and highlights follow the source and fall away naturally into the background. Nothing should look like a campaign, fashion shoot, 3D render or overly perfect composition.`;
                            const localizedV5Tail = isSpanish
                              ? `Mantén además las pequeñas decisiones humanas que hacen creíble una fotografía accidental: la mirada puede quedar un instante fuera de sincronía con la acción, los hombros pueden estar a alturas distintas, los dedos pueden descansar sin posar, un objeto puede estar colocado de manera práctica y las personas del fondo pueden ocuparse de sus propias acciones sin mirar a cámara. Conserva la textura de la cubierta, las marcas de uso, el polvo, las huellas, la humedad, los reflejos deformados y las imperfecciones de fabricación solo cuando existan o sean compatibles con la evidencia. La profundidad de campo debe ser la de un teléfono normal, no un recorte artificial; si algo queda suave, debe ser por distancia, movimiento, enfoque o luz. Prioriza siempre una imagen verosímil, espontánea, ligeramente imperfecta y físicamente posible.`
                              : isPortuguese
                              ? `Mantenha também as pequenas decisões humanas que tornam uma fotografia acidental crível: o olhar pode ficar um instante fora de sincronia com a ação, os ombros podem estar em alturas diferentes, os dedos podem descansar sem posar, um objeto pode estar colocado de maneira prática e as pessoas ao fundo podem cuidar das próprias ações sem olhar para a câmera. Preserve a textura do convés, marcas de uso, poeira, marcas de dedo, umidade, reflexos deformados e imperfeições de fabricação apenas quando existirem ou forem compatíveis com a evidência. A profundidade de campo deve ser a de um telefone comum, não um recorte artificial; se algo ficar suave, deve ser por distância, movimento, foco ou luz. Priorize sempre uma imagem verossímil, espontânea, levemente imperfeita e fisicamente possível.`
                              : `Also preserve the small human decisions that make an accidental photograph believable: the gaze may fall a fraction late to the action, shoulders may sit at different heights, fingers may rest without posing, an object may be placed practically, and background people may be absorbed in their own actions without looking at the camera. Keep deck texture, wear marks, dust, fingerprints, moisture, distorted reflections and manufacturing imperfections only when they exist or agree with the evidence. Depth of field must belong to a normal phone, never an artificial cutout; if something is soft, it is soft because of distance, movement, focus or light. Always prioritize a believable, spontaneous, slightly imperfect and physically possible image.`;
                            if (dedicatedV4.length < 2800) dedicatedV4 = `${dedicatedV4} ${localizedRealismTail}`;
                            if (dedicatedV5.length < 3700) dedicatedV5 = `${dedicatedV5} ${localizedRealismTail} ${localizedV5Tail}`;
                            
return res.json({
                    v1: parsed.v1?.trim() || "",
                    v2: parsed.v2?.trim() || "",
                    v3: parsed.v3?.trim() || "",
                    v4: dedicatedV4,
                    v5: dedicatedV5,
                    negativePrompt: defaultNegativePrompt,
                    autoDetected: parsed.autoDetected || {}
                });
            }
            catch (err) {
                lastError = err;
                console.warn(`Attempt ${attempt + 1} with model ${currentModel} failed: ${err.message}`);
                if (attempt < MODELS_CASCADE.length - 1) {
                    await wait(750 * (attempt + 1));
                    continue;
                }
                break;
            }
        }
        throw new Error(`Generation failed: ${lastError?.message || 'High model demand. Please try again in a moment.'}`);
    }
    catch (error) {
        console.error("Generate prompts error:", error);
        res.status(500).json({ error: error.message || "Failed to generate prompts" });
    }
});
// Magic Enhance Idea
app.post('/api/magic-enhance', async (req, res) => {
    const startedAt = Date.now();
    let clientClosed = false;
    req.on('aborted', () => {
        clientClosed = true;
    });
    res.on('close', () => {
        if (!res.writableEnded)
            clientClosed = true;
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
        // Prefer one stable fast model; keep a single fallback so a bad model response cannot create a long retry chain.
        const magicModels = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];
        let lastError = null;
        for (let index = 0; index < magicModels.length; index++) {
            if (clientClosed || res.destroyed)
                return;
            const model = magicModels[index];
            try {
                const result = await withDeadline(ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: { temperature: 0.18 }
                }), 16000, 'MAGIC_MODEL_TIMEOUT');
                const enhanced = result.text?.trim();
                if (!enhanced)
                    throw new Error('EMPTY_ENHANCE_RESPONSE');
                if (!clientClosed && !res.destroyed && !res.headersSent) {
                    return res.json({ enhanced, elapsedMs: Date.now() - startedAt });
                }
                return;
            }
            catch (error) {
                lastError = error;
                console.warn(`[MAGIC] model=${model} failed: ${error?.message || error}`);
                if (clientClosed || res.destroyed)
                    return;
            }
        }
        const message = String(lastError?.message || 'MAGIC_ENHANCE_FAILED');
        const isTimeout = /TIMEOUT/i.test(message);
        const isRateLimit = /429|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(message);
        const status = isTimeout ? 504 : isRateLimit ? 429 : 500;
        if (!clientClosed && !res.destroyed && !res.headersSent) {
            return res.status(status).json({ error: isTimeout ? 'MAGIC_TIMEOUT' : isRateLimit ? 'RATE_LIMIT' : 'MAGIC_ENHANCE_FAILED' });
        }
    }
    catch (error) {
        console.error('[MAGIC] fatal error:', error);
        if (!clientClosed && !res.destroyed && !res.headersSent) {
            return res.status(500).json({ error: error?.message || 'MAGIC_ENHANCE_FAILED' });
        }
    }
});
// Refine Prompt
app.post('/api/refine-prompt', async (req, res) => {
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
   - If V2: Maintain the structured {} brackets format.
   - If V3: Maintain the direct natural-language curly-brace {} format and the same scene-specific block order; never convert it into a blueprint or meta-prompt.
4. Return ONLY the updated prompt text. No preamble or conversational filler.
`;
        const refineModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
        let lastError = null;
        for (const model of refineModels) {
            try {
                const result = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: { temperature: 0.1 }
                });
                const refined = result.text?.trim();
                if (refined)
                    return res.json({ refined });
            }
            catch (error) {
                lastError = error;
                console.warn(`[REFINE] model ${model} failed; trying fallback`, error?.message || error);
            }
        }
        throw lastError || new Error('REFINE_EMPTY_RESPONSE');
    }
    catch (error) {
        console.error("Refine prompt error:", error);
        res.status(500).json({ error: error.message || "Failed to refine prompt" });
    }
});
// Detect Contextual Params
app.post('/api/detect-params', async (req, res) => {
    try {
        const { text, images } = req.body;
        const ai = getAiClient();
        const contentsParts = [];
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
    }
    catch (error) {
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
    }
    else {
        const distPath = path.resolve(__dirname, 'dist');
        app.use(express.static(distPath));
        app.use((_req, res) => {
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
