import { GoogleGenAI } from '@google/genai';

const getAI = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured on the server.');
  return new GoogleGenAI({ apiKey: key });
};

const text = (value: unknown) => typeof value === 'string' ? value : '';
const imagePart = (data: string, mimeType: string) => ({ inlineData: { mimeType, data: data.includes(',') ? data.split(',')[1] : data } });

const languageName = (value: unknown) => value === 'en' ? 'English' : value === 'pt' ? 'Brazilian Portuguese' : 'Spanish';

const parseJson = (value: unknown) => {
  const raw = text(value).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  if (!raw) throw new Error('The AI returned an empty response.');
  try { return JSON.parse(raw); } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error('The AI returned invalid JSON.');
  }
};

const isTransient = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase();
  return error?.status === 429 || error?.status === 503 || /429|503|unavailable|high demand|resource exhausted|temporar|timeout|deadline/i.test(message);
};

const generateWithRetry = async (ai: GoogleGenAI, request: any) => {
  let lastError: any;
  const models = [request.model, 'gemini-3.1-flash', 'gemini-3.5-flash'].filter((model, index, all) => model && all.indexOf(model) === index);
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await ai.models.generateContent({ ...request, model });
      } catch (error: any) {
        lastError = error;
        if (!isTransient(error) || attempt === 1) break;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }
  }
  throw lastError || new Error('AI request failed.');
};

// Shared photographic realism contract. It is deliberately explicit because vague
// instructions produce attractive-looking renders instead of believable phone photos.
const REALISM_ENGINE = `
You are a forensic smartphone-photography prompt engineer. Before writing anything, silently build a concrete Scene Model in this exact order:
1) identify only what would actually be visible;
2) choose the physical camera position, height, side, distance and viewing direction;
3) choose the real crop (head-and-shoulders, half body, three-quarter or full body) and keep it consistent;
4) solve body mechanics: weight distribution, spine, shoulders, elbows, wrists, fingers, knees, feet, head direction and gaze;
5) solve the light path: source, size, direction, falloff, exposure and shadows;
6) solve natural smartphone capture defects appropriate to the light and distance;
7) solve materials and contact physics, including reflections whenever a reflective surface exists;
8) only then write the final prompt.
Do not reveal this internal reasoning or call it a chain of thought. Use it to make the output physically coherent.

REALISM RULES:
- The result must look like an ordinary real photograph captured by a person with a rear smartphone camera, not a poster, render, fashion campaign or cinematic still.
- Never use cinematic, editorial, luxury-advertising, hyper-perfect, flawless, ethereal, dramatic rim light, teal-and-orange grading, volumetric glow or beauty-retouch language.
- Never describe the reference person's face, hair, skin tone, facial features, ethnicity or body appearance in the text. Identity is applied externally from the user's separate personal reference image. Describe only scene, pose, wardrobe, objects, action, light, camera and materials.
- Do not invent extra people, limbs, hands, objects, logos or readable text. Respect the requested subject count.
- Use concrete nouns and observable cause-and-effect. Replace vague phrases such as 'beautiful lighting', 'natural pose' and 'realistic background' with exactly how the light enters, what is in contact, where the body is supported and what the camera sees.
- Clothing must have real fabric behavior: weave, weight, seams, tension, gravity, compression at contact points, uneven hems, small wrinkles and believable occlusion. Do not make clothing look painted or vacuum-sealed.
- Skin, when visible in the final image, must remain ordinary and unretouched: pores, tiny tonal variation, slight shine only where light reaches it, no plastic smoothing, no wax, no face-swap artifacts. Do not describe identity traits.
- Use a normal phone main camera: 24-26mm full-frame equivalent at 1x unless the requested framing clearly requires another phone camera. Mention camera height, distance, focus plane, exposure behavior and 9:16 vertical framing by default. Do not use 35mm, 50mm, 85mm, DSLR or artificial portrait bokeh.
- Imperfections must be causally plausible and subtle: a little motion softness only where movement exists, modest sensor noise in shadows, slight missed focus, uneven auto-exposure, mild rolling-shutter skew, ordinary phone sharpening and compression. Do not stack every defect.
- For glass, mirrors, water, polished stone, glossy tables, cars or metal, explicitly state what is reflected, whether the reflection is strong/soft/broken, the surface finish, the direction of incoming light, the contact shadows and how supported objects interrupt the reflection. Never write only 'coherent reflections'.
- Keep the requested language pure. All prose and every section label inside the returned strings must be in the selected language. Do not mix Portuguese, Spanish and English.
- Output only valid JSON matching the requested keys. No markdown fences and no commentary outside JSON.
`;

const buildIdeaInstruction = (body: any, language: string) => {
  const idea = text(body.ideaText).trim();
  const mode = body.mode === 'manual' ? 'manual guided template' : 'automatic freeform idea';
  const gesture = text(body.gestureOption).trim() || 'auto';
  const mood = text(body.moodOption).trim() || 'auto';
  const ratio = text(body.aspectRatio).trim() && body.aspectRatio !== 'auto' ? text(body.aspectRatio).trim() : '9:16';
  const height = Number(body.heightCm) > 0 ? Math.round(Number(body.heightCm)) : null;
  const weight = Number(body.weightKg) > 0 ? Math.round(Number(body.weightKg)) : null;
  const measurements = [height ? `height ${height} cm` : '', weight ? `weight ${weight} kg` : ''].filter(Boolean).join(' and ');
  const selectedGesture = gesture !== 'auto' ? gesture : 'infer one ordinary, scene-supported gesture';
  const selectedMood = mood !== 'auto' ? mood : 'infer a restrained expression from the action, never a model pose';

  return `${REALISM_ENGINE}

TASK: Convert the user's idea into one giant, technically precise smartphone photograph prompt. The user is using the ${mode}.
SELECTED BODY LANGUAGE: ${selectedGesture}
SELECTED EMOTIONAL ENERGY: ${selectedMood}
TARGET FORMAT: vertical ${ratio}
${measurements ? `USER-PROVIDED MEASUREMENTS FOR SUBJECT A ONLY: ${measurements}. Include these exact measurements naturally, but do not invent any other physical traits.` : 'No body measurements were provided. Do not invent height, weight, age, ethnicity, build, hair, skin tone or facial traits.'}

USER IDEA:
"""
${idea}
"""

MANDATORY INTERNAL SCENE MODEL:
- Resolve the exact number of requested people and keep that count stable.
- Decide what is in the near foreground, middle distance and background, including ordinary clutter that would actually be visible.
- Decide the camera side, eye height, distance in meters, lens field of view, crop and the exact location of each person in frame.
- Describe the full body mechanics and support: what carries the weight, where each elbow and hand is, which knee bends, how feet meet the floor and where the head is aimed.
- Make the action interact with a concrete object. Avoid 'posing' unless the user explicitly asks for it.
- Explain light direction and falloff, shadow softness, exposure and how the phone's automatic processing handles highlights and shadows.
- If any reflective material appears, explicitly describe the reflection content, intensity, finish, incoming light and contact-shadow interruption.

OUTPUT CONTRACT:
Return exactly this JSON object:
{
  "positive": "...",
  "negative": "...",
  "detectedSummary": "..."
}

POSITIVE PROMPT CONTRACT:
- If people are requested, begin directly with "Subject A:" and add "Subject B:", "Subject C:" only when actually requested. If there are no people, begin directly with the environment or object.
- Write 850-1250 words of dense but readable direction, in ${language} only.
- Use this order: exact subject/action blocks; wardrobe and fabric physics; environment and ordinary objects; foreground/middle/background; composition and crop; camera height/distance/lens/focus; light path and shadows; skin/material behavior without identity description; phone imperfections; final identity instruction.
- State exactly what the separate personal reference photo controls: identity only. It must not be used to copy another reference person's face or body.
- End with a short natural-language instruction in ${language} that the result must look like an unremarkable real smartphone photo, not CGI or a cinematic image.

NEGATIVE PROMPT CONTRACT:
- Start exactly with the translated equivalent of "[NEGATIVE PROMPT]" in ${language}.
- Make it scene-specific, not a generic canned list. Exclude only contradictions: extra subjects beyond the requested count, duplicate bodies, fused limbs, impossible hand-object contact, floating objects, incorrect perspective, fake reflections, plastic skin, beauty retouching, CGI, 3D render, cinematic color grade, excessive HDR, artificial bokeh, studio polish, perfect symmetry and any unrequested readable logo/text.
- Do not exclude details explicitly requested by the user, such as rain, darkness, grain, flash, a mirror or a car.

DETECTED SUMMARY CONTRACT:
- In ${language}, summarize the resolved count, physical camera placement, crop, action anchor, light direction and any reflective-material handling in 3-6 concise lines.
`;
};

const normalizeIdeaResult = (parsed: any, language: string) => {
  let positive = text(parsed?.positive).trim();
  let negative = text(parsed?.negative).trim();
  const isEnglish = language === 'English';
  const isPortuguese = language === 'Brazilian Portuguese';
  const ratioLine = isEnglish
    ? 'Frame: vertical 9:16, with the crop and camera distance kept physically consistent.'
    : isPortuguese
      ? 'Enquadramento: vertical 9:16, mantendo o recorte e a distância da câmera fisicamente consistentes.'
      : 'Encuadre: vertical 9:16, manteniendo el recorte y la distancia de cámara físicamente consistentes.';
  const cameraLine = isEnglish
    ? 'Capture behavior: rear smartphone main camera, 24mm equivalent at 1x, ordinary autofocus, natural sharpening, mild sensor noise only where the exposure requires it, and no artificial portrait blur.'
    : isPortuguese
      ? 'Comportamento da captura: câmera traseira principal de smartphone, equivalente a 24 mm em 1x, foco automático comum, nitidez natural, ruído discreto apenas onde a exposição exigir e nenhum desfoque artificial de retrato.'
      : 'Comportamiento de captura: cámara trasera principal de smartphone, equivalente a 24 mm en 1x, enfoque automático común, nitidez natural, ruido discreto solo donde lo requiera la exposición y ningún desenfoque artificial de retrato.';
  const identityLine = isEnglish
    ? 'Identity instruction: use the user\'s separate personal reference image for identity only; do not describe, copy or transfer another reference person\'s face, hair, skin tone or body.'
    : isPortuguese
      ? 'Instrução de identidade: use a foto pessoal separada do usuário somente para a identidade; não descreva, copie ou transfira o rosto, cabelo, tom de pele ou corpo de outra pessoa de referência.'
      : 'Instrucción de identidad: usa la foto personal separada del usuario solo para la identidad; no describas, copies ni transfieras el rostro, cabello, tono de piel o cuerpo de otra persona de referencia.';
  const authenticityLine = isEnglish
    ? 'It must read as an unremarkable real smartphone photo taken by a person, not CGI, not a 3D render and not a cinematic advertisement.'
    : isPortuguese
      ? 'A imagem deve parecer uma foto comum real feita por uma pessoa com smartphone, não CGI, render 3D ou anúncio cinematográfico.'
      : 'La imagen debe sentirse como una foto común real tomada por una persona con smartphone, no CGI, render 3D ni anuncio cinematográfico.';

  if (!positive) positive = authenticityLine;
  if (!/9:16/.test(positive)) positive += `\n\n${ratioLine}`;
  if (!/24\s*mm|24mm|1x/i.test(positive)) positive += `\n\n${cameraLine}`;
  if (!/separate personal reference|foto personal separada|foto personal del usuario|foto personal/i.test(positive)) positive += `\n\n${identityLine}`;
  if (!/CGI|render 3D|cinematic|cinematográfica|cinematográfico/i.test(positive)) positive += `\n\n${authenticityLine}`;

  const negativeHeader = isEnglish ? '[NEGATIVE PROMPT]' : '[PROMPT NEGATIVO]';
  if (!negative) negative = negativeHeader;
  if (!negative.startsWith(negativeHeader)) negative = `${negativeHeader}\n\n${negative}`;
  return { positive, negative, detectedSummary: text(parsed?.detectedSummary).trim() };
};

const hasLanguageLeak = (result: any, language: string) => {
  const all = `${text(result?.positive)} ${text(result?.negative)} ${text(result?.detectedSummary)}`;
  if (language === 'Brazilian Portuguese') return /\b(half body|full body|subject|environment|lighting|foreground|background|wearing|standing|sitting|shot on|negative prompt)\b/i.test(all);
  if (language === 'Spanish') return /\b(half body|full body|subject|environment|lighting|foreground|background|wearing|standing|sitting|shot on|negative prompt)\b/i.test(all);
  return /\b(sujeito|ambiente|iluminação|primer plano|fondo|vestindo|sentado|em pé|fotografia casual|prompt negativo)\b/i.test(all);
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const route = new URL(req.url || '/', 'https://local').pathname;
  try {
    const body = req.body || {};
    const ai = getAI();

    if (route.endsWith('/analyze-image')) {
      if (!body.base64Image || !body.mimeType) return res.status(400).json({ error: 'base64Image and mimeType are required' });
      const language = languageName(body.language);
      const prompt = `${REALISM_ENGINE}\nAnalyze the supplied scene reference as a director of an ordinary real phone photo. Generate one positive prompt and one negative prompt in ${language}. Start the positive prompt directly with the subject/environment description. Include concrete wardrobe, environment, action, composition, camera, light, imperfections, skin/material physics, reflective-surface behavior when relevant, and 9:16. Never copy the reference person's face or physical identity. Return JSON with keys positive, negative, detectedSummary, analysis, detectedTargets.`;
      const r = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: { parts: [imagePart(text(body.base64Image), text(body.mimeType)), { text: prompt }] }, config: { temperature: 0.3, maxOutputTokens: 7000, responseMimeType: 'application/json' } });
      return res.status(200).json(parseJson(r.text));
    }

    if (route.endsWith('/generate-idea-prompt')) {
      if (!body.ideaText) return res.status(400).json({ error: 'ideaText is required' });
      const language = languageName(body.language);
      const prompt = buildIdeaInstruction(body, language);
      const r = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: prompt, config: { temperature: 0.3, maxOutputTokens: 9000, responseMimeType: 'application/json' } });
      const parsed = parseJson(r.text);
      return res.status(200).json(normalizeIdeaResult(parsed, language));
    }

    if (route.endsWith('/generate-prompt-batch')) {
      if (!body.idea) return res.status(400).json({ error: 'idea is required' });
      const count = Math.max(1, Math.min(12, Number(body.count) || 1));
      const language = languageName(body.language);
      const prompt = `${REALISM_ENGINE}\nCreate exactly ${count} distinct prompt objects in ${language} from this idea: ${text(body.idea)}. Vary location, action, framing and ordinary imperfections while keeping identity external. Each positive prompt must resolve camera height, distance, crop, body mechanics, light path, contact shadows and material/reflection behavior when relevant. Return JSON array under key items; each item must have id, positive, negative, title.`;
      const r = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: prompt, config: { temperature: 0.35, maxOutputTokens: 7000, responseMimeType: 'application/json' } });
      const parsed = parseJson(r.text);
      return res.status(200).json({ items: Array.isArray(parsed.items) ? parsed.items : [] });
    }

    if (route.endsWith('/generate-lifestyle-prompts')) {
      if (!body.base64Image || !body.mimeType) return res.status(400).json({ error: 'base64Image and mimeType are required' });
      const language = body.language === 'en' ? 'English' : 'Spanish';
      const prompt = `${REALISM_ENGINE}\nStudy this reference only for palette, place and atmosphere, never copy its composition or person. Generate exactly five different lifestyle prompt proposals in ${language}, with no people, readable text or commercial logos. Resolve physical camera placement, ordinary phone imperfections and material/reflection behavior whenever relevant. Return JSON with aestheticSummary, colorPalette array and proposals array containing id, purpose, cameraZoom, positive and negative.`;
      const r = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: { parts: [imagePart(text(body.base64Image), text(body.mimeType)), { text: prompt }] }, config: { temperature: 0.35, maxOutputTokens: 7000, responseMimeType: 'application/json' } });
      return res.status(200).json(parseJson(r.text));
    }

    return res.status(404).json({ error: 'Unknown API route' });
  } catch (error: any) {
    console.error('API error', error);
    const transient = isTransient(error);
    return res.status(transient ? 503 : 500).json({
      error: transient ? 'The AI service is temporarily busy. Please try again in a few seconds.' : (error?.message || 'Server error'),
      retryable: transient,
    });
  }
}
