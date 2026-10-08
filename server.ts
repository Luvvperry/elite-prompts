import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';


const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini client initialization
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
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

const ANALYZER_SYSTEM_INSTRUCTION = `ROLE: Advanced Realism Optimization Engine & Forensic Visual Prompt Engineer specializing in Multi-Subject Identification, Literal Environment Replication, Exact Clothing & Accessories Physics, Optical Lens Geometry, Lighting Fidelity, and Smartphone Photography Realism.

TASK: Deconstruct user images to extract authentic poses, clothing fit, real light, and environmental nuances into structured prompts tailored to their personal identity—without copying the reference subject's face.

STRICT FORENSIC IDENTITY & FACE SEPARATION:
1. FACIAL FEATURES & IDENTITY EXCLUSION:
- NEVER describe the reference subject's face or attempt to transfer their facial identity.
- Explicitly reserve the face for the user's personal identity.

2. CLOTHING & ACCESSORIES - RIGOROUS VISUAL FIDELITY:
- Identify each visible garment: exact type, observable color, fit, button status, collar, sleeves, wrinkles.
- Brand inspection: state exact recognizable logo or label if clearly identifiable, or "brand not visible or unidentifiable".

3. REAL ENVIRONMENT & OBJECT AUDITING:
- Replicate visible surfaces, lighting, and authentic objects without hallucinating props.

4. REAL PHONE CAMERA PARAMETERS:
- Fixed 24mm equivalent full-frame phone camera, 1x, natural perspective. Vertical 9:16 composition.`;

const BATCH_ANALYZER_SYSTEM_INSTRUCTION = `ROLE: Advanced Realism Optimization Engine & Forensic Visual Prompt Engineer specializing in Multi-Subject Identification, Literal Environment Replication, Exact Clothing & Accessories Physics, Optical Lens Geometry, Lighting Fidelity, and Smartphone Photography Realism for Prompt Batches.

REGLAS ESTRICTAS DE ESTRUCTURA Y FORMATO DEL PROMPT POSITIVO:
1. REGLA OBLIGATORIA DE INICIO DIRECTO DE SUJETOS:
- Si la escena contiene personas, el prompt DEBE comenzar DIRECTAMENTE con "Subject A:".
- PROHIBIDO anteponer cualquier título, párrafo explicativo o numeración.
- Si hay N personas, usa "Subject A:", "Subject B:", etc.
- Si hay 0 personas, describe el entorno directamente sin bloques de "Subject".

2. CÁMARA Y ÓPTICA FIJA (INVARIABLE EN TODOS LOS PROMPTS):
"Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural. Composición vertical 9:16."

3. CIERRE OBLIGATORIO:
- Si hay 1 o más personas: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"
- Si hay 0 personas: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, ILUMINACIÓN Y COMPOSICIÓN]"

4. PROMPT NEGATIVO QUIRÚRGICO:
- Inicia siempre con "[PROMPT NEGATIVO]\\n\\n".
- Excluye específicamente 35mm, 50mm, 85mm, teleobjetivo, cámara réflex DSLR, iluminación de estudio, look cinematográfico, filtros IA, render 3D, CGI, piel plástica, etc.

5. INCORPORACIÓN DE ESTATURA Y PESO DEL USUARIO EN SUJETO A:
- Cuando el usuario proporcione estatura y/o peso, dichos valores exactos con sus unidades DEBEN integrarse obligatoriamente de forma orgánica y explícita en la descripción de "Subject A:" (ej: "estatura 178 cm y peso 72 kg").`;

// ─── ENDPOINT 1: ANALYZE IMAGE ───────────────────────────────────────────────
app.post('/api/analyze-image', async (req: Request, res: Response) => {
  try {
    const {
      base64Image,
      mimeType,
      lensType = 'auto',
      detailLevel = 3,
      addNoise = false,
      customInstructions = '',
      exifData = null,
      aspectRatio = 'auto',
      heightCm,
      weightKg,
      language = 'es',
      identityBase64,
      identityMimeType,
      keepExactWardrobe = true,
      manualBrand = '',
    } = req.body;

    if (!base64Image || !mimeType) {
      return res.status(400).json({ error: 'base64Image and mimeType are required' });
    }

    const ai = getGeminiClient();
    const isEs = language === 'es';

    const sceneImagePart = {
      inlineData: {
        mimeType,
        data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image,
      },
    };

    const hasIdentityPhoto = Boolean(identityBase64 && identityMimeType);
    const identityImagePart = hasIdentityPhoto
      ? {
          inlineData: {
            mimeType: identityMimeType!,
            data: identityBase64!.includes(',') ? identityBase64!.split(',')[1] : identityBase64!,
          },
        }
      : null;

    const parts: any[] = [sceneImagePart];
    if (identityImagePart) parts.push(identityImagePart);

    // Height & Weight instructions
    let physicalMeasurementsInstruction = '';
    const validHeight = heightCm && Number(heightCm) > 0 ? Math.round(Number(heightCm)) : null;
    const validWeight = weightKg && Number(weightKg) > 0 ? Math.round(Number(weightKg)) : null;

    if (validHeight && validWeight) {
      physicalMeasurementsInstruction = isEs
        ? `\\nESTATURA Y PESO DEL USUARIO: estatura ${validHeight} cm y peso ${validWeight} kg. En el prompt positivo para el Sujeto A incluye explícitamente: "estatura ${validHeight} cm y peso ${validWeight} kg".`
        : `\\nUSER HEIGHT AND WEIGHT: height ${validHeight} cm and weight ${validWeight} kg. In the positive prompt for Subject A explicitly include: "height ${validHeight} cm and weight ${validWeight} kg".`;
    } else if (validHeight) {
      physicalMeasurementsInstruction = isEs
        ? `\\nESTATURA DEL USUARIO: estatura ${validHeight} cm. En el prompt positivo para el Sujeto A incluye explícitamente: "estatura ${validHeight} cm".`
        : `\\nUSER HEIGHT: height ${validHeight} cm. In the positive prompt for Subject A explicitly include: "height ${validHeight} cm".`;
    } else if (validWeight) {
      physicalMeasurementsInstruction = isEs
        ? `\\nPESO DEL USUARIO: peso ${validWeight} kg. En el prompt positivo para el Sujeto A incluye explícitamente: "peso ${validWeight} kg".`
        : `\\nUSER WEIGHT: weight ${validWeight} kg. In the positive prompt for Subject A explicitly include: "weight ${validWeight} kg".`;
    }

    const promptText = `Realiza la deconstrucción fotográfica forense de alta fidelidad:
1. "positive": Prompt positivo detallado y fiel a la foto. Inicia con Subject A si hay personas.
2. "negative": Prompt negativo dinámico y quirúrgico para esta toma. Inicia con "[PROMPT NEGATIVO]\\n\\n".
3. "detectedSummary": Resumen estructurado de composición, sujetos, ropa, accesorios y entorno.
4. "analysis": Diagnóstico técnico con calidad, entorno, iluminación, paleta, ropa ("wardrobeAnalysis"), marcas ("brandAnalysis") y autenticidad ("captureAuthenticity").
5. "detectedTargets": Coordenadas normalizadas (x: 5 a 95, y: 5 a 95) de "subject", "wardrobe", "environment", "lighting".

${physicalMeasurementsInstruction}
${customInstructions ? `Instrucciones adicionales del usuario: ${customInstructions}` : ''}
${manualBrand ? `Marca ingresada manualmente: ${manualBrand}` : ''}
${isEs ? 'Idioma de salida: Español.' : 'Output language: English.'}`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: ANALYZER_SYSTEM_INSTRUCTION,
        temperature: 0.35,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-image:', error);
    return res.status(500).json({ error: error.message || 'Error analyzing image' });
  }
});

// ─── ENDPOINT 2: GENERATE IDEA PROMPT ─────────────────────────────────────────
app.post('/api/generate-idea-prompt', async (req: Request, res: Response) => {
  try {
    const {
      ideaText,
      gestureOption = 'auto',
      moodOption = 'auto',
      aspectRatio = 'auto',
      heightCm,
      weightKg,
      mode = 'auto',
      language = 'es',
    } = req.body;

    if (!ideaText) {
      return res.status(400).json({ error: 'ideaText is required' });
    }

    const ai = getGeminiClient();
    const isEs = language === 'es';

    const validHeight = heightCm && Number(heightCm) > 0 ? Math.round(Number(heightCm)) : null;
    const validWeight = weightKg && Number(weightKg) > 0 ? Math.round(Number(weightKg)) : null;

    let measurementsStr = '';
    if (validHeight && validWeight) {
      measurementsStr = `estatura ${validHeight} cm y peso ${validWeight} kg`;
    } else if (validHeight) {
      measurementsStr = `estatura ${validHeight} cm`;
    } else if (validWeight) {
      measurementsStr = `peso ${validWeight} kg`;
    }

    const taskPrompt = `Transforma la siguiente idea en un prompt fotográfico forense ultra-realista de smartphone:
"""
${ideaText}
"""
Modo: ${mode}
Gesto: ${gestureOption}
Estado de ánimo: ${moodOption}
Relación de aspecto: ${aspectRatio}
${measurementsStr ? `Medidas de usuario para Sujeto A: ${measurementsStr}` : ''}
${isEs ? 'Idioma: Español' : 'Language: English'}

Genera un JSON con {"positive": "...", "negative": "..."}.
El prompt positivo debe iniciar directamente con "Subject A:" si hay personas, incluir cámara de celular 24mm f/1.8 equivalente a 1x y perspectiva 9:16 natural.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: taskPrompt }] },
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-idea-prompt:', error);
    return res.status(500).json({ error: error.message || 'Error generating idea prompt' });
  }
});

// ─── ENDPOINT 3: GENERATE PROMPT BATCH CHUNK ───────────────────────────────────
app.post('/api/generate-prompt-batch', async (req: Request, res: Response) => {
  try {
    const {
      idea,
      count = 5,
      startIdx = 1,
      endIdx = 5,
      country,
      language = 'es',
      heightCm,
      weightKg,
    } = req.body;

    if (!idea) {
      return res.status(400).json({ error: 'idea is required' });
    }

    const ai = getGeminiClient();
    const isEs = language === 'es';

    const validHeight = heightCm && Number(heightCm) > 0 ? Math.round(Number(heightCm)) : null;
    const validWeight = weightKg && Number(weightKg) > 0 ? Math.round(Number(weightKg)) : null;

    let measurementsInstruction = '';
    if (validHeight && validWeight) {
      measurementsInstruction = isEs
        ? `\\nESTATURA Y PESO DEL USUARIO: estatura ${validHeight} cm y peso ${validWeight} kg. En cada variante con personas, para Subject A integra explícitamente: "estatura ${validHeight} cm y peso ${validWeight} kg".`
        : `\\nUSER HEIGHT AND WEIGHT: height ${validHeight} cm and weight ${validWeight} kg. In every variant with people, for Subject A explicitly integrate: "height ${validHeight} cm and weight ${validWeight} kg".`;
    } else if (validHeight) {
      measurementsInstruction = isEs
        ? `\\nESTATURA DEL USUARIO: estatura ${validHeight} cm. Para Subject A integra: "estatura ${validHeight} cm".`
        : `\\nUSER HEIGHT: height ${validHeight} cm. For Subject A integrate: "height ${validHeight} cm".`;
    } else if (validWeight) {
      measurementsInstruction = isEs
        ? `\\nPESO DEL USUARIO: peso ${validWeight} kg. Para Subject A integra: "peso ${validWeight} kg".`
        : `\\nUSER WEIGHT: weight ${validWeight} kg. For Subject A integrate: "weight ${validWeight} kg".`;
    }

    const countryContext = country && country.trim() && country !== 'none'
      ? `\\nCONTEXTO DE PAÍS: ${country}. Integra de manera natural arquitectura, atmósfera y cultura de ${country}.`
      : '';

    const chunkPrompt = `Genera exactamente ${count} prompts fotográficos forenses (variantes #${startIdx} a #${endIdx} del lote) para la siguiente idea central:
"""
${idea}
"""
${countryContext}
${measurementsInstruction}
${isEs ? 'IDIOMA: Todos los prompts positivos y negativos deben estar en ESPAÑOL.' : 'LANGUAGE: English.'}

INSTRUCCIONES DE CONTEO Y FORMATO DE SUJETOS:
1. Conteo de Sujetos: Determina cuántas personas están implícitas o explícitas en la idea ("${idea}").
   - Si hay personas: CADA prompt positivo DEBE comenzar DIRECTAMENTE con "Subject A:". No pongas ningún texto antes.
   ${validHeight || validWeight ? `- OBLIGATORIO: Integra en la descripción del Subject A: "${[validHeight ? `estatura ${validHeight} cm` : '', validWeight ? `peso ${validWeight} kg` : ''].filter(Boolean).join(' y ')}".` : ''}
   - Si NO hay personas (0 personas): describe la escena/objetos directamente sin crear bloques de "Subject".
2. Cámara y Óptica Fija (OBLIGATORIA en TODOS los prompts):
   - "Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural. Composición vertical 9:16."
3. Variación entre prompts: Cambia posturas, expresiones, ropa contextual, luz, fondos y objetos sin duplicar escenas ni desvirtuar la idea central.
4. Prompt negativo: Crea para cada variante su prompt negativo quirúrgico que inicie con "[PROMPT NEGATIVO]\\n\\n".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: chunkPrompt }] },
      config: {
        systemInstruction: BATCH_ANALYZER_SYSTEM_INSTRUCTION,
        temperature: 0.65,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  positive: {
                    type: Type.STRING,
                    description: "Prompt positivo completo. Inicia directamente con 'Subject A:' si hay personas.",
                  },
                  negative: {
                    type: Type.STRING,
                    description: "Prompt negativo quirúrgico que inicia con '[PROMPT NEGATIVO]\\n\\n'.",
                  },
                },
                required: ['positive', 'negative'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];

    // Sanitize and ensure height/weight guarantee
    const sanitized = rawItems.map((item: any, idx: number) => {
      let positive = typeof item.positive === 'string' ? item.positive.trim() : '';
      let negative = typeof item.negative === 'string' ? item.negative.trim() : '';

      positive = positive.replace(/^["'`]|["'`]$/g, '').trim();
      positive = positive.replace(/^(Prompt\s*#?\d+:?\s*)/i, '').trim();

      if (isEs && !negative.startsWith('[PROMPT NEGATIVO]')) {
        negative = `[PROMPT NEGATIVO]\\n\\n${negative}`;
      } else if (!isEs && !negative.startsWith('[NEGATIVE PROMPT]')) {
        negative = `[NEGATIVE PROMPT]\\n\\n${negative}`;
      }

      if (validHeight || validWeight) {
        const hasHeight = validHeight ? positive.includes(`${validHeight}`) : true;
        const hasWeight = validWeight ? positive.includes(`${validWeight}`) : true;

        if ((!hasHeight || !hasWeight) && positive.startsWith('Subject A:')) {
          const measurementStr = validHeight && validWeight
            ? (isEs ? `estatura ${validHeight} cm, peso ${validWeight} kg` : `height ${validHeight} cm, weight ${validWeight} kg`)
            : validHeight
              ? (isEs ? `estatura ${validHeight} cm` : `height ${validHeight} cm`)
              : (isEs ? `peso ${validWeight} kg` : `weight ${validWeight} kg`);

          const rest = positive.slice('Subject A:'.length).trim();
          positive = `Subject A: (${measurementStr}), ${rest}`;
        }
      }

      return {
        id: `${Date.now()}_${startIdx}_${idx}`,
        positive,
        negative,
      };
    });

    return res.json({ items: sanitized });
  } catch (error: any) {
    console.error('Error in /api/generate-prompt-batch:', error);
    return res.status(500).json({ error: error.message || 'Error generating batch' });
  }
});

// ─── ENDPOINT 4: GENERATE LIFESTYLE PROMPTS ───────────────────────────────────
app.post('/api/generate-lifestyle-prompts', async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType, language = 'es', previousConcepts = [] } = req.body;
    if (!base64Image || !mimeType) return res.status(400).json({ error: 'base64Image and mimeType are required' });
    const ai = getGeminiClient();
    const isEs = language === 'es';
    const imagePart = { inlineData: { mimeType, data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image } };
    const previousBlock = Array.isArray(previousConcepts) && previousConcepts.length
      ? `\nPreviously generated concepts to avoid repeating:\n${previousConcepts.map((item: string) => `- ${item}`).join('\n')}` : '';
    const prompt = `Analyze this reference only as an aesthetic and environmental guide, then generate exactly five different lifestyle photography prompt proposals. Do not copy the exact main subject or identical composition. Keep every proposal plausible, ordinary and physically coherent; no people, no readable text and no commercial logos. Vary the core concept across local wildlife (at most one proposal), native flora, a contextual vehicle, vernacular architecture, and geology/expedition textures when they fit the reference. Use a real smartphone capture, vertical 9:16, and casual imperfections instead of cinematic polish. ${isEs ? 'Escribe todos los valores en español natural y fotográfico.' : 'Write every value in natural photographic English.'}${previousBlock}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', contents: { parts: [imagePart, { text: prompt }] },
      config: { temperature: 0.65, responseMimeType: 'application/json', responseSchema: {
        type: Type.OBJECT, properties: {
          aestheticSummary: { type: Type.STRING }, colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          proposals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
            id: { type: Type.STRING }, purpose: { type: Type.STRING }, cameraZoom: { type: Type.STRING }, positive: { type: Type.STRING }, negative: { type: Type.STRING }
          }, required: ['purpose','cameraZoom','positive','negative'] } }
        }, required: ['aestheticSummary','colorPalette','proposals']
      } }
    });
    const parsed = JSON.parse(response.text || '{}');
    const proposals = Array.isArray(parsed.proposals) ? parsed.proposals.slice(0, 5).map((item: any, index: number) => ({
      id: item.id || `${Date.now()}_${index}`, purpose: String(item.purpose || ''),
      cameraZoom: ['0.5x','1x','2x','3x'].includes(item.cameraZoom) ? item.cameraZoom : '1x',
      positive: String(item.positive || '').trim(), negative: String(item.negative || '').trim()
    })) : [];
    return res.json({ aestheticSummary: String(parsed.aestheticSummary || ''), colorPalette: Array.isArray(parsed.colorPalette) ? parsed.colorPalette.map(String).slice(0, 6) : [], proposals });
  } catch (error: any) {
    console.error('Error in /api/generate-lifestyle-prompts:', error);
    return res.status(500).json({ error: error.message || 'Error generating lifestyle prompts' });
  }
});

// ─── STATIC / DEV SERVING ───────────────────────────────────────────────────

export { app };
export default app;
