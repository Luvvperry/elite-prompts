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
    for (let attempt = 0; attempt < 1; attempt += 1) {
      try {
        return await ai.models.generateContent({ ...request, model });
      } catch (error: any) {
        lastError = error;
        if (!isTransient(error)) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
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

const fallbackIdeaResult = (body: any, language: string) => {
  const idea = text(body.ideaText).trim();
  const ratio = body.aspectRatio && body.aspectRatio !== 'auto' ? body.aspectRatio : '9:16';
  if (language === 'English') return {
    positive: `Subject A: Create a real, ordinary smartphone photograph based on this user concept: ${idea}. Resolve the scene as a physically possible everyday moment, not a poster or advertisement. Keep the requested action concrete and connected to a visible object. Use natural body mechanics, believable weight distribution, relaxed shoulders, correctly supported elbows and hands, and feet that touch the ground. Describe the requested clothing with real fabric weight, seams, gravity, compression, small wrinkles and uneven folds. Describe a specific lived-in environment with foreground, middle distance and background elements that belong there. Use a rear smartphone main camera at 1x, approximately 24mm equivalent, with a concrete camera height and distance, an ordinary autofocus plane and a vertical ${ratio} crop. Use only plausible available light, with a clear direction, falloff, exposure behavior and contact shadows. If glass, metal, water, a car, a mirror or polished material appears, show what is reflected, whether it is soft or broken, how light enters the surface and how touching or supported objects interrupt the reflection. Preserve ordinary phone behavior: mild sharpening, slight noise only in darker areas, modest compression and imperfect auto-exposure. Use the user's separate personal reference image for identity only; do not describe or copy another person's face or body. The result must look like an unremarkable real smartphone photo, not CGI, a 3D render or a cinematic advertisement.`,
    negative: '[NEGATIVE PROMPT] extra people, duplicate subjects, fused limbs, impossible hand-object contact, floating objects, incorrect perspective, plastic skin, beauty retouching, CGI, 3D render, cinematic grading, excessive HDR, artificial portrait bokeh, studio polish, perfect symmetry, fake reflections, clothing without folds',
    detectedSummary: `Fallback local: concept received; vertical ${ratio}; real rear smartphone camera at 1x; identity remains external.`
  };
  if (language === 'Brazilian Portuguese') return {
    positive: `Sujeito A: Crie uma fotografia real e comum de smartphone baseada neste conceito do usuário: ${idea}. Resolva a cena como um momento cotidiano fisicamente possível, não como pôster ou anúncio. Mantenha a ação solicitada concreta e ligada a um objeto visível. Use mecânica corporal natural, distribuição de peso crível, ombros relaxados, cotovelos e mãos apoiados corretamente e pés em contato com o chão. Descreva a roupa solicitada com peso real do tecido, costuras, gravidade, compressão, pequenos amassados e dobras irregulares. Descreva um ambiente vivido com elementos de primeiro plano, plano intermediário e fundo. Use câmera traseira principal de smartphone em 1x, equivalente a aproximadamente 24 mm, com altura e distância concretas, foco automático comum e enquadramento vertical ${ratio}. Use somente luz disponível plausível, com direção, queda, exposição e sombras de contato claras. Se aparecer vidro, metal, água, carro, espelho ou material polido, mostre o que é refletido, se o reflexo é suave ou quebrado, como a luz entra na superfície e como objetos apoiados interrompem o reflexo. Preserve o comportamento comum do celular: nitidez moderada, ruído discreto apenas em áreas escuras, compressão leve e exposição automática imperfeita. Use a foto pessoal separada do usuário somente para a identidade; não descreva nem copie o rosto ou corpo de outra pessoa. O resultado deve parecer uma foto comum real de smartphone, não CGI, render 3D ou anúncio cinematográfico.`,
    negative: '[PROMPT NEGATIVO] pessoas extras, sujeitos duplicados, membros fundidos, contato impossível entre mão e objeto, objetos flutuando, perspectiva incorreta, pele plástica, retoque de beleza, CGI, render 3D, gradação cinematográfica, HDR excessivo, bokeh artificial de retrato, acabamento de estúdio, simetria perfeita, reflexos falsos, roupas sem dobras',
    detectedSummary: `Fallback local: conceito recebido; vertical ${ratio}; câmera traseira real em 1x; identidade permanece externa.`
  };
  return {
    positive: `Sujeto A: Crea una fotografía real y cotidiana de smartphone basada en este concepto del usuario: ${idea}. Resuelve la escena como un momento físicamente posible, no como un póster ni un anuncio. Mantén la acción concreta y conectada con un objeto visible. Usa mecánica corporal natural, distribución de peso creíble, hombros relajados, manos y codos apoyados correctamente y pies en contacto con el suelo. Describe la ropa con peso real del tejido, costuras, gravedad, compresión, pequeñas arrugas y pliegues irregulares. Describe un entorno vivido con primer plano, plano medio y fondo. Usa la cámara trasera principal de un smartphone a 1x, equivalente a unos 24 mm, con altura y distancia concretas, enfoque automático común y encuadre vertical ${ratio}. Usa luz disponible plausible con dirección, caída, exposición y sombras de contacto claras. Si aparece vidrio, metal, agua, coche, espejo o material pulido, especifica qué se refleja, si el reflejo es suave o quebrado, cómo entra la luz y cómo los objetos interrumpen el reflejo. Mantén el comportamiento normal del teléfono: nitidez moderada, ruido discreto solo en sombras, compresión ligera y exposición automática imperfecta. Usa la foto personal separada del usuario solo para la identidad; no describas ni copies el rostro o cuerpo de otra persona. El resultado debe parecer una foto real común de smartphone, no CGI, render 3D ni anuncio cinematográfico.`,
    negative: '[PROMPT NEGATIVO] personas extra, sujetos duplicados, extremidades fusionadas, contacto imposible entre mano y objeto, objetos flotantes, perspectiva incorrecta, piel plástica, retoque de belleza, CGI, render 3D, gradación cinematográfica, HDR excesivo, bokeh artificial, acabado de estudio, simetría perfecta, reflejos falsos, ropa sin arrugas',
    detectedSummary: `Fallback local: concepto recibido; vertical ${ratio}; cámara trasera real a 1x; identidad externa.`
  };
};

const fallbackLifestyleResult = (language: string) => {
  const english = language === 'English';
  const prefix = english ? 'Lifestyle variation' : 'Propuesta lifestyle';
  const prompts = english
    ? [
        'A casual vertical smartphone photograph of the main vehicle or object from the uploaded reference in the same broad environment and color atmosphere, photographed at normal standing height with the rear 1x camera. Keep the scene lived-in, preserve ordinary surface wear, natural shadows and realistic reflections. No people, no staged advertising, no CGI.',
        'A close but non-macro smartphone detail of the most visually important material from the uploaded reference, keeping its real texture, small imperfections and surrounding context. Use soft available light, a slightly imperfect crop and natural phone sharpening. No people, no artificial bokeh, no cinematic grading.',
        'A wider vertical smartphone snapshot inspired by the uploaded reference environment, showing the main subject with believable foreground, middle distance and background layers. Keep the original atmosphere and palette without copying an exact composition. Use natural exposure, ordinary clutter and physically correct reflections. No people or readable logos.',
        'A low but realistic phone-camera viewpoint of the main non-human subject suggested by the uploaded reference, with the camera close to ground level but not distorted. Preserve material response, contact shadows, edge wear and light falloff. The result must look like a spontaneous phone photo, not a commercial campaign.',
        'A quiet everyday smartphone photograph based on the uploaded reference mood, showing a plausible alternate moment in the same visual world. Keep colors restrained, surfaces imperfect, reflections soft or broken according to each material, and the vertical frame slightly unprecise. No people, no CGI, no studio polish.'
      ]
    : [
        'Una fotografía vertical casual de smartphone del vehículo u objeto principal de la referencia subida, dentro del mismo tipo de entorno y atmósfera cromática. Cámara trasera 1x a altura normal, desgaste real, sombras naturales y reflejos físicamente correctos. Sin personas, publicidad ni CGI.',
        'Un detalle cercano pero no macro del material visualmente más importante de la referencia subida, conservando su textura real, pequeñas imperfecciones y contexto. Luz disponible suave, recorte ligeramente imperfecto y nitidez natural de móvil. Sin personas, bokeh artificial ni gradación cinematográfica.',
        'Una toma vertical más amplia inspirada en el entorno de la referencia subida, con capas creíbles de primer plano, plano medio y fondo. Mantén la atmósfera y la paleta sin copiar la composición exacta. Exposición natural, objetos cotidianos y reflejos físicamente correctos. Sin personas ni logotipos legibles.',
        'Un punto de vista bajo pero realista de cámara de móvil sobre el sujeto no humano sugerido por la referencia, cerca del suelo pero sin distorsión exagerada. Conserva materiales, sombras de contacto, desgaste y caída de luz. Debe parecer una foto espontánea, no una campaña comercial.',
        'Una fotografía cotidiana y tranquila de smartphone basada en el ambiente de la referencia subida, mostrando un momento alternativo plausible del mismo mundo visual. Colores contenidos, superficies imperfectas, reflejos suaves o quebrados según el material y encuadre vertical ligeramente imperfecto. Sin personas, CGI ni acabado de estudio.'
      ];
  return {
    aestheticSummary: english ? 'Fallback active: the AI service is busy, so five safe, non-human lifestyle directions were prepared from the uploaded reference mood.' : 'Fallback activo: el servicio de IA está ocupado, así que se prepararon cinco direcciones lifestyle seguras y sin personas a partir del ambiente de la referencia subida.',
    colorPalette: english ? ['reference colors', 'natural daylight', 'material neutrals'] : ['colores de la referencia', 'luz natural', 'neutros materiales'],
    proposals: prompts.map((positive, index) => ({
      id: `lifestyle-fallback-${index + 1}`,
      purpose: `${prefix} ${index + 1}`,
      cameraZoom: (['1x', '2x', '0.5x', '1x', '2x'] as const)[index],
      positive: `${positive} Vertical 9:16 composition.`,
      negative: english ? '[NEGATIVE PROMPT]\n\npeople, human figures, readable logos, CGI, 3D render, artificial bokeh, excessive HDR, fake reflections, studio lighting, perfect surfaces' : '[PROMPT NEGATIVO]\n\npersonas, figuras humanas, logotipos legibles, CGI, render 3D, bokeh artificial, HDR excesivo, reflejos falsos, iluminación de estudio, superficies perfectas'
    }))
  };
};

const buildLifestyleFinalInstruction = (language: string, sceneModel: any) => `${REALISM_ENGINE}

LIFESTYLE ENGINE — DISTINCT OUTPUT FORMAT:
You are not generating a person prompt and you are not copying the reference composition. The uploaded image is an aesthetic and environmental reference only. Preserve its visual world, materials, palette and atmosphere, then invent five different publishable lifestyle scenes with no people.

INTERNAL SCENE MODEL ALREADY RECONSTRUCTED:
${JSON.stringify(sceneModel)}

Before writing the final values, silently verify each proposal in this order:
1) every visible object belongs to the chosen environment;
2) the camera position, height, distance, lens and crop could physically produce the frame;
3) the main non-human subject has a stable support surface and believable scale;
4) light direction, exposure, shadows and color temperature agree with the time and place;
5) glass, water, paint, metal, stone, fabric or polished surfaces specify their actual reflection and contact behavior;
6) imperfections are sparse and caused by the capture, never decorative effects;
7) no people, faces, body parts, invented brands or readable text appear.

Do not reveal the Scene Model, analysis, chain of thought or intermediate decisions. Return only valid JSON in ${language} with exactly these keys:
{
  "aestheticSummary": "...",
  "colorPalette": ["...", "...", "..."],
  "proposals": [
    {"id":"...", "purpose":"...", "cameraZoom":"0.5x|1x|2x", "positive":"...", "negative":"..."}
  ]
}

Create exactly five proposals. They must be genuinely different in camera placement, distance, crop, object emphasis and moment, while remaining in the same visual world. Each positive value must be 250-450 words in ${language} and include: concrete environment and objects; foreground, middle distance and background; camera height and distance; phone lens and focus plane; light path and falloff; contact shadows; material response; explicit reflection content and strength where relevant; subtle smartphone imperfections; vertical 9:16 framing; and a final statement that the image is a normal real smartphone photograph, not CGI, 3D or a cinematic advertisement. Keep every label and prose string in ${language}. Negative values must be scene-specific and begin with the translated equivalent of [NEGATIVE PROMPT].`;

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
      try {
        const r = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: prompt, config: { temperature: 0.3, maxOutputTokens: 9000, responseMimeType: 'application/json' } });
        const parsed = parseJson(r.text);
        return res.status(200).json(normalizeIdeaResult(parsed, language));
      } catch (error: any) {
        if (isTransient(error)) return res.status(200).json(fallbackIdeaResult(body, language));
        throw error;
      }
    }

    if (route.endsWith('/generate-prompt-batch')) {
      if (!body.idea) return res.status(400).json({ error: 'idea is required' });
      const count = Math.max(1, Math.min(12, Number(body.count) || 1));
      const language = languageName(body.language);
      const prompt = `${REALISM_ENGINE}\nCreate exactly ${count} distinct prompt objects in ${language} from this idea: ${text(body.idea)}. Vary location, action, framing and ordinary imperfections while keeping identity external. Each positive prompt must resolve camera height, distance, crop, body mechanics, light path, contact shadows and material/reflection behavior when relevant. Return JSON array under key items; each item must have id, positive, negative, title.`;
      try {
        const r = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: prompt, config: { temperature: 0.35, maxOutputTokens: 7000, responseMimeType: 'application/json' } });
        const parsed = parseJson(r.text);
        return res.status(200).json({ items: Array.isArray(parsed.items) ? parsed.items : [] });
      } catch (error: any) {
        if (!isTransient(error)) throw error;
        const fallback = fallbackIdeaResult({ ideaText: body.idea, aspectRatio: '9:16' }, language);
        return res.status(200).json({ items: Array.from({ length: count }, (_, index) => ({ id: `fallback-${index + 1}`, title: `${language === 'Brazilian Portuguese' ? 'Variação' : language === 'Spanish' ? 'Variación' : 'Variation'} ${index + 1}`, positive: `${fallback.positive}\n\n${language === 'English' ? `Variation ${index + 1}: change the camera distance and ordinary background details while preserving the same physical action.` : language === 'Brazilian Portuguese' ? `Variação ${index + 1}: altere a distância da câmera e os detalhes comuns do fundo, mantendo a mesma ação física.` : `Variación ${index + 1}: cambia la distancia de cámara y los detalles cotidianos del fondo, manteniendo la misma acción física.`}`, negative: fallback.negative })) });
      }
    }

    if (route.endsWith('/generate-lifestyle-prompts')) {
      if (!body.base64Image || !body.mimeType) return res.status(400).json({ error: 'base64Image and mimeType are required' });
      const language = body.language === 'en' ? 'English' : 'Spanish';
      const scenePrompt = `${REALISM_ENGINE}
LIFESTYLE SCENE RECONSTRUCTION — INTERNAL STEP ONLY:
Inspect the uploaded image as an environment and object reference, not as a composition to copy. Do not describe or preserve any person because the final scenes must contain no people. Build a compact factual scene model in ${language} with exactly these keys: visible_subjects, environment, foreground, middle_distance, background, camera_inferred, light_and_shadows, materials_and_reflections, palette_and_atmosphere, safe_variation_boundaries. Include only observable details. For camera_inferred, estimate height, distance, viewing side, lens field of view and crop. For materials_and_reflections, state what is reflected, surface finish, reflection strength, incoming light and contact-shadow behavior. Do not write prompts, do not invent brands or text, and do not reveal chain of thought; return only valid JSON.`;
      try {
        let sceneModel: any;
        try {
          const sceneResponse = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: { parts: [imagePart(text(body.base64Image), text(body.mimeType)), { text: scenePrompt }] }, config: { temperature: 0.15, maxOutputTokens: 3500, responseMimeType: 'application/json' } });
          sceneModel = parseJson(sceneResponse.text);
        } catch {
          // If the analysis call is busy, let the final writer inspect the image itself.
          sceneModel = { fallback: 'Inspect the uploaded image directly before writing. Reconstruct visible objects, camera, crop, light, materials and reflections internally.' };
        }
        const finalPrompt = buildLifestyleFinalInstruction(language, sceneModel);
        const finalContents = sceneModel?.fallback
          ? { parts: [imagePart(text(body.base64Image), text(body.mimeType)), { text: finalPrompt }] }
          : finalPrompt;
        const finalResponse = await generateWithRetry(ai, { model: 'gemini-3.8-flash', contents: finalContents, config: { temperature: 0.3, maxOutputTokens: 12000, responseMimeType: 'application/json' } });
        const parsed = parseJson(finalResponse.text);
        if (!Array.isArray(parsed.proposals) || parsed.proposals.length < 5) throw new Error('Lifestyle engine returned fewer than five proposals.');
        return res.status(200).json({ ...parsed, proposals: parsed.proposals.slice(0, 5) });
      } catch (error: any) {
        // Keep the UI usable during a provider outage, without changing the normal two-step brain.
        return res.status(200).json(fallbackLifestyleResult(language));
      }
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
