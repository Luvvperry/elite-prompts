import { GoogleGenAI, Type } from "@google/genai";
import { ImageAnalysis, ExifData } from "./types";

export interface IdeaPromptResult {
  positive: string;
  negative: string;
  detectedSummary?: string;
}

const ANALYZER_SYSTEM_INSTRUCTION = `ROLE: Advanced Realism Optimization Engine & Forensic Visual Prompt Engineer specializing in Scene Reference Transfer, Multi-Subject Identification, Literal Environment Replication, Exact Clothing & Accessories Physics, Optical Lens Geometry, Lighting Fidelity, and Smartphone Photography Realism.

ASIGNACIÓN Y SEPARACIÓN ESTRICTA DE REFERENCIAS:
Cuando se proporcionen dos imágenes (o se identifiquen roles):
1. REFERENCIA DE ESCENA:
   • Determina con exclusividad: la ropa, los accesorios, la pose, los objetos, el entorno, el encuadre, la perspectiva y la iluminación.
   • NUNCA transfieras el rostro ni la identidad de la persona de la referencia de escena al resultado.
2. MI FOTO DE IDENTIDAD (USUARIO):
   • Determina ÚNICAMENTE los rasgos físicos elegidos para conservar la identidad del Sujeto A (rostro, facciones, cabello y tono de piel).
   • NUNCA permitas que la foto de identidad sustituya la ropa, los accesorios, la pose ni el entorno de la foto de escena.
3. REGLA ESTRICTA DE ASIGNACIÓN:
   • Asigna cada imagen según el espacio o papel que eligió el usuario.
   • NO deduzcas su función comparando su contenido con la escena descrita. Una foto personal puede mostrar un fondo o ropa totalmente distintos a la escena final sin estar mal asignada.
   • No pidas confirmación ni cuestiones la asignación.

ANÁLISIS FORENSE DE ROPA Y ACCESORIOS:
Añade al análisis de cada sujeto una descripción detallada de cada prenda:
- Tipo de prenda, color exacto observable, corte y ajuste al cuerpo (suelta, entallada, holgada, etc.).
- Material o textura aparente (lino, algodón, cuero, seda, mezclilla, etc.), indicando incertidumbre explícita ("material aparente: tejido ligero no determinable con certeza") si la imagen no permite distinguirlo.
- Cuello (abierto, camisero, redondo, en V), botones (visibles, abiertos, cerrados), mangas (largas, arremangadas, cortas), puños, costuras, pliegues naturales y partes abiertas o cerradas (ej. camisa de botones abierta y suelta).
- Accesorios visibles: forma, color, tamaño, material y posición exacta (ej. collar claro de cuentas alrededor del cuello, anillos, pulseras, reloj). Si no hay accesorios, indícalo.
- REGLA POR DEFECTO: La ropa y accesorios de la referencia de escena DEBEN conservarse exactamente por defecto. Solo cambia una prenda si el usuario lo pide explícitamente en sus instrucciones escritas.

IDENTIFICACIÓN Y TRATAMIENTO DE MARCAS:
- Examina visualmente los logos, etiquetas y estampados que sí aparecen en la imagen. Usa lectura visual minuciosa (OCR).
- Asigna confianza a cada marca detectada y SOLO escribe el nombre de la marca cuando haya evidencia visual clara e indiscutible.
- Si no hay un logo identificable: escribe textualmente "marca no visible o no identificable".
- PROHIBICIÓN: NO adivines marcas por el estilo, precio aparente, tipo de prenda o parecido con una colección.

CONSERVAR LA CAPTURA REAL Y ASPECTO FOTOGRÁFICO:
- Analiza cómo fue tomada la fotografía: altura y distancia de cámara, escala de la persona dentro del cuadro, espacio visible alrededor, dirección de la mirada, postura del torso, posición de cada mano, objetos sostenidos y aspecto de la luz.
- Conserva las señales auténticas de la captura original: desenfoque leve, leve movimiento, ruido del sensor, exposición desigual, luz directa o flash del teléfono, reflejos, solo cuando realmente estén presentes.
- Si la luz es irregular o suave, consérvala; NO transformes una foto casual en una producción de moda de estudio, ni en una imagen cálida, pulida y cinematográfica.

PRUEBAS DE CONTROL FORENSE (BENCHMARKS OBLIGATORIOS):
1. FOTO DE LA CENA COSTERA:
   • La referencia muestra: una persona de perfil mirando hacia la izquierda, camisa blanca de botones abierta y suelta, collar claro de cuentas, copas con tallo sobre la mesa, teléfono con la pantalla encendida sobre una mesa turquesa, y un fondo nocturno oscuro.
   • FIDELIDAD ESTRICTA: El resultado DEBE conservar exactamente esos elementos, sus posiciones y la apariencia casual de la toma.
   • PROHIBICIONES ESPECÍFICAS: NO agregues una tela azul sobre la mesa, platos, plantas, baranda, luces costeras, velas u otros objetos que la referencia no muestre ni que el usuario haya solicitado.
   • ILUMINACIÓN Y CAPTURA: Mantén la textura suave y la luz irregular de la foto original; evita transformarla en una imagen nítida, cálida y cinematográfica.
   • MARCA DE LA CAMISA: La marca de la camisa no se distingue en esta referencia. El análisis y el prompt DEBEN indicar claramente "marca no visible o no identificable" en lugar de asignarle una marca inventada.
2. FOTO DE LA PERSONA EN LA ESTACIÓN:
   • Conservar la figura relativamente pequeña y centrada dentro del encuadre.
   • Conservar bastante piso visible en primer plano y el espacio vacío alrededor.
   • Persona sentada con piernas separadas, celular cerca del regazo y mirada hacia un lado.
   • Chaleco oscuro brillante sobre prenda de manga larga, jeans azules y tenis rojos. Mural y banca en su lugar.

REGLAS DE IDENTIFICACIÓN Y CONTEO DE SUJETOS:
1. Conteo exacto de humanos visibles:
   - 0 personas: describe el lugar, objetos y luz directamente (sin bloques de "Subject").
   - 1 persona: exactamente "Subject A: [descripción completa]".
   - 2 personas: exactamente "Subject A: [descripción completa]\\nSubject B: [descripción completa]".
2. Asignación de identidad:
   - Sujeto A representa al usuario (aplica aquí la identidad de la foto personal y los valores de estatura/peso cuando se proporcionen).
   - Sujetos adicionales son personas totalmente independientes.
   - NUNCA apliques la identidad del usuario a Sujetos B o C.
   - NUNCA copies el rostro de la foto de referencia de escena.

AUDITORÍA INTERNA ANTES DE ENTREGAR:
Organiza internamente el proceso en 3 pasos:
1. Extraer los datos visibles de escena, ropa detallada, accesorios, marcas/ausencia de marcas, pose, objetos, entorno y captura.
2. Redactar el prompt positivo con esos datos y las opciones del usuario.
3. Auditar el prompt contra la referencia: corrige cualquier omisión, contradicción o elemento inventado (ej. platos, barandas o luces que no están). Si un detalle está borroso u oculto, márcalo como incierto y omítelo en vez de inventarlo.

RESUMEN DETECTADO (EDITABLE):
Genera un resumen estructurado y editable ("detectedSummary") de lo detectado:
- Composición, encuadre y captura (escala del sujeto, distancia, piso/espacio visible)
- Sujetos, pose, mirada y posición de manos
- Ropa y accesorios detallados (corte, cuello, botones, ajuste, materiales, collar/accesorios)
- Marcas identificadas (o "marca no visible o no identificable")
- Objetos y mesa (objetos exactos observados, sin inventar)
- Entorno e iluminación (luz irregular/natural, fondo nocturno real)`;

const IDEA_BUILDER_SYSTEM_INSTRUCTION = `ROLE: Advanced Realism Optimization Engine & Forensic Visual Prompt Engineer specializing in Multi-Subject Idea Structuring, Literal Environment Replication, Clothing Physics, Body Stature Calibration, and Smartphone Photography Realism for "Construye tu idea" (reutilizando con absoluta fidelidad el mismo motor, formato y criterios de entrega final del "Analizador" de Project TRX).

REGLAS ESTRICTAS DE FORMATO Y CONTEO DE SUJETOS (IDÉNTICO AL ANALIZADOR):
1. FORMATO OBLIGATORIO DE SUJETOS AL INICIO DEL PROMPT POSITIVO:
   - Cuando la idea incluya personas, identifica cuántas personas distintas pide y escribe el prompt positivo comenzando DIRECTAMENTE con un bloque para cada una, usando exactamente este formato:
     Subject A: [rol o acción indicada por el usuario]
     Subject B: [rol o acción indicada por el usuario]
     Subject C: [rol o acción indicada por el usuario]
   - Continúa en orden alfabético si hay más personas (Subject D:, Subject E:, etc.).
   - PROHIBIDO anteponer cualquier título, párrafo explicativo, introducción, numeración, viñetas o texto antes de "Subject A:".

2. CONTEO ESTRICTO BASADO ÚNICAMENTE EN LA IDEA:
   - Incluye SOLO las personas que la idea realmente pide:
     * «una persona», «un sujeto», «yo», «alguien», «un hombre», «una mujer» = un subject (Subject A).
     * «una pareja», «dos personas», «dos amigos», «dos sujetos», «un hombre y una mujer» = dos subjects (Subject A y Subject B).
     * «tres amigos», «tres personas», «tres sujetos» = tres subjects (Subject A, Subject B y Subject C).
     * «cuatro personas» = cuatro subjects (Subject A, Subject B, Subject C y Subject D), y así sucesivamente.
   - Conserva sus roles y acciones durante todo el prompt, sin intercambiarlos ni duplicar personas.
   - Deja claro en la descripción que la imagen debe mostrar exactamente la cantidad solicitada.

3. PROHIBICIÓN ABSOLUTA DE INVENTAR RASGOS FÍSICOS O APARIENCIA:
   - NO inventes rasgos físicos bajo ningún concepto.
   - NO agregues cabello (ni color, longitud, textura o estilo), color de piel, facciones, edad, complexión, etnia, marcas, cicatrices, género ni apariencia que el usuario no haya indicado explícitamente en su idea.
   - Si no hay información de apariencia, deja esos rasgos sin especificar para que la referencia de identidad del usuario los determine libremente.
   - Si hay una imagen de referencia, úsala solo para los rasgos que esa imagen permite observar y asigna cada referencia al subject correcto; no copies la apariencia de una persona a otra.
   - Si el usuario especificó estatura y/o peso en sus ajustes, inclúyelos explícitamente en el Sujeto A ("estatura X cm y peso Y kg") con proporciones naturales, pero SIN inventar ningún otro rasgo físico ni estereotipos corporales.

4. PROHIBICIÓN DE INVENTAR RELACIONES ENTRE PERSONAS Y MANEJO DE GRUPOS:
   - NO inventes relaciones entre personas (como que son pareja, novios, esposos, hermanos o amigos) si la idea no lo dice de forma explícita.
   - Si el usuario menciona un grupo sin indicar cuántas personas hay (ej. «un grupo de personas», «varias personas reunidas»), NO inventes un número exacto: descríbelo como un grupo sin cantidad definida.
   - Las personas de fondo que solo se mencionen como multitud o transeúntes («multitud al fondo», «transeúntes caminando atrás») deben seguir descritas como grupo o multitud colectiva y NO necesitan un bloque individual por cada integrante.

5. SI LA IDEA NO INCLUYE PERSONAS (0 PERSONAS):
   - Si la idea no incluye personas (ej. paisajes, arquitectura, coches, interiores vacíos, objetos, naturaleza muerta), NO agregues subjects ni inventes personas bajo ninguna circunstancia.
   - Describe la escena, objetos, entorno, iluminación y cámara directamente sin bloques de "Subject".

6. ORDEN DE SECCIONES Y DETALLE FOTOGRÁFICO (IDÉNTICO AL ANALIZADOR):
   - Bloque(s) de Sujeto(s): "Subject A: ...", "Subject B: ..." (cuando aplique).
   - Ropa y accesorios: describe prendas observables o indicadas en la idea (corte, material, botones, cuello, pliegues) sin inventar anatomía.
   - Entorno, locación y objetos concretos de la escena (sin inventar objetos ajenos que no pertenezcan al contexto).
   - CÁMARA Y ÓPTICA FIJA DE SMARTPHONE:
     "Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural." (adaptando la relación de aspecto solicitada si aplica).
   - Iluminación disponible y textura: luz natural o ambiental real, sombras orgánicas, rango dinámico natural de smartphone, micro-imperfecciones del sensor.
   - CIERRE OBLIGATORIO:
     * Si hay 1 o más personas: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"
     * Si hay 0 personas: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, ILUMINACIÓN Y COMPOSICIÓN]"

7. PROMPT NEGATIVO QUIRÚRGICO (IDÉNTICO AL ANALIZADOR):
   - Inicia siempre con "[PROMPT NEGATIVO]\n\n" (o "[NEGATIVE PROMPT]\n\n").
   - Conteo quirúrgico:
     * Si la idea pide 1 persona: excluye personas adicionales, transeúntes no deseados, sujetos duplicados, clones.
     * Si la idea pide 2 personas: excluye tercera persona adicional, sujetos extraños, clones, cuerpos fusionados, extremidades adicionales. ¡NO excluyas a las 2 personas solicitadas!
     * Si la idea pide N personas: excluye personas adicionales más allá de N.
     * Si la idea tiene 0 personas: excluye personas, figuras humanas, rostros.
   - Exclusiones de estilo: iluminación de estudio publicitario, look cinematográfico estilizado, filtros de IA, render 3D, CGI, piel plástica retocada, deformaciones ópticas.
   - Regla obligatoria de identidad: "copia del rostro de la imagen de referencia, rasgos faciales idénticos al sujeto de referencia, clonación facial de la persona de la foto de referencia".

8. RESUMEN ESTRUCTURADO (detectedSummary):
   - Genera un resumen estructurado y editable ("detectedSummary") de lo construido: formato, sujetos (conteo y roles exactos sin rasgos inventados), ropa y accesorios, marcas ("marca no visible o no identificable"), entorno e iluminación/cámara.

Return a JSON object with three keys: "positive", "negative", and "detectedSummary".`;

export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  lensType: string = 'auto',
  detailLevel: number = 3,
  addNoise: boolean = false,
  customInstructions: string = "",
  exifData: ExifData | null = null,
  aspectRatio: string = 'auto',
  heightCm?: number | string | null,
  weightKg?: number | string | null,
  language: string = 'es',
  identityBase64?: string | null,
  identityMimeType?: string | null,
  keepExactWardrobe: boolean = true,
  manualBrand?: string
): Promise<{
  positive: string;
  negative: string;
	  detectedSummary: string;
	  analysis: ImageAnalysis;
	  detectedTargets?: any;
	}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isEs = language === 'es';

  const sceneImagePart = {
    inlineData: {
      mimeType,
      data: base64Image.split(',')[1],
    },
  };

  const hasIdentityPhoto = Boolean(identityBase64 && identityMimeType);
  const identityImagePart = hasIdentityPhoto
    ? {
        inlineData: {
          mimeType: identityMimeType!,
          data: identityBase64!.split(',')[1],
        },
      }
    : null;

  const lensInstruction = lensType === 'auto' 
    ? (isEs ? "Estima el tipo de lente y distancia focal según la escena de referencia (ej. lente de smartphone 24mm f/1.8 o lente natural equivalente)." : "Estimate lens type/focal length based on the reference scene (e.g. smartphone 24mm f/1.8 lens or natural equivalent).")
    : (isEs ? `Usa el tipo de lente y apertura especificados: ${lensType}.` : `Use the specified lens type/focal length: ${lensType}.`);

  const aspectRatioInstruction = aspectRatio && aspectRatio !== 'auto'
    ? (isEs 
        ? `RELACIÓN DE ASPECTO REQUERIDA: La composición y encuadre deben estructurarse explícitamente para una relación de aspecto de ${aspectRatio}. Incluye en el prompt positivo la mención textual "relación de aspecto ${aspectRatio}" y describe el encuadre (vertical u horizontal) adaptado a ese formato sin recortar ni distorsionar elementos visibles esenciales de la referencia.`
        : `TARGET ASPECT RATIO: Structure and frame the composition specifically for a ${aspectRatio} aspect ratio. Explicitly include "aspect ratio ${aspectRatio}" in the positive prompt, adapting framing naturally without altering or cropping essential visible elements.`)
    : (isEs 
        ? `RELACIÓN DE ASPECTO: Preserva la relación de aspecto y escala natural de la escena de referencia e intégrala de forma fluida en el prompt positivo.`
        : `ASPECT RATIO: Preserve the natural aspect ratio and scale of the analyzed reference scene and integrate it into the positive prompt.`);

  let physicalMeasurementsInstruction = "";
  const validHeight = heightCm && Number(heightCm) > 0 ? Math.round(Number(heightCm)) : null;
  const validWeight = weightKg && Number(weightKg) > 0 ? Math.round(Number(weightKg)) : null;

  if (validHeight && validWeight) {
    physicalMeasurementsInstruction = isEs
      ? `\nESTATURA Y PESO DEL USUARIO (VALORES EXPLÍCITOS REQUERIDOS):
El usuario completó ambos campos: estatura ${validHeight} cm y peso ${validWeight} kg.
En el prompt positivo, para el Sujeto A (el sujeto principal que representa al usuario), DEBES incluir explícitamente estos valores exactos con sus unidades: "estatura ${validHeight} cm y peso ${validWeight} kg".
Describe proporciones naturales acordes con esos valores, sin deducir ni estereotipar un tipo de cuerpo exacto solo a partir del peso. No exageres la anatomía.`
      : `\nUSER HEIGHT AND WEIGHT (EXPLICIT VALUES REQUIRED):
The user completed both fields: height ${validHeight} cm and weight ${validWeight} kg.
In the positive prompt, for Subject A (representing the user), you MUST explicitly include these exact values with units: "height ${validHeight} cm and weight ${validWeight} kg".
Describe natural body proportions corresponding to these values, without deducing an exact body type solely from the weight. Do not exaggerate anatomy.`;
  } else if (validHeight) {
    physicalMeasurementsInstruction = isEs
      ? `\nESTATURA DEL USUARIO (VALOR EXPLÍCITO REQUERIDO):
El usuario especificó estatura: ${validHeight} cm (el campo de peso quedó vacío).
En el prompt positivo, para el Sujeto A, DEBES incluir explícitamente este valor exacto con su unidad: "estatura ${validHeight} cm".
Describe proporciones naturales acordes con esa estatura.
REGLA CRÍTICA: Como el peso está vacío, OMÍTELO por completo en el resultado. NO inventes ni supongas ningún dato de peso.`
      : `\nUSER HEIGHT (EXPLICIT VALUE REQUIRED):
The user specified height: ${validHeight} cm (weight was left blank).
In the positive prompt, for Subject A, you MUST explicitly include this exact value with unit: "height ${validHeight} cm".
Describe natural proportions matching this stature.
CRITICAL RULE: Since weight is empty, OMIT weight completely. DO NOT invent or guess any weight number.`;
  } else if (validWeight) {
    physicalMeasurementsInstruction = isEs
      ? `\nPESO DEL USUARIO (VALOR EXPLÍCITO REQUERIDO):
El usuario especificó peso: ${validWeight} kg (el campo de estatura quedó vacío).
En el prompt positivo, para el Sujeto A, DEBES incluir explícitamente este valor exacto con su unidad: "peso ${validWeight} kg".
Describe proporciones naturales acordes con ese peso, sin deducir un tipo de cuerpo exacto solo a partir de él.
REGLA CRÍTICA: Como la estatura está vacía, OMÍTELA por completo en el resultado. NO inventes ni supongas ningún dato de estatura.`
      : `\nUSER WEIGHT (EXPLICIT VALUE REQUIRED):
The user specified weight: ${validWeight} kg (height was left blank).
In the positive prompt, for Subject A, you MUST explicitly include this exact value with unit: "weight ${validWeight} kg".
Describe natural proportions matching this weight without deducing an exact body type solely from it.
CRITICAL RULE: Since height is empty, OMIT height completely. DO NOT invent or guess any height number.`;
  } else {
    physicalMeasurementsInstruction = isEs
      ? `\nESTATURA Y PESO: Ninguno fue proporcionado. Omite cualquier mención a números específicos de estatura (cm) o peso (kg). NO inventes datos.`
      : `\nUSER HEIGHT AND WEIGHT: None provided. Omit specific height (cm) and weight (kg) numbers completely. DO NOT invent any numbers.`;
  }

  // Wardrobe preservation instruction
  const wardrobeInstruction = keepExactWardrobe
    ? (isEs
        ? `\nOPCIÓN 'MANTENER EXACTAMENTE LA ROPA DE REFERENCIA' ACTIVADA (ESTRICTA):
- DEBES conservar cada prenda, accesorio, botón, corte y textura visible de la referencia de escena con fidelidad literal.
- NO sustituyas prendas por opciones genéricas ni agregues accesorios que no aparezcan en la escena (ej. si lleva camisa blanca abierta y collar claro de cuentas, conserva exactamente eso; NO agregues corbata, chaqueta ni quites el collar).
- Solo modifica prendas si el usuario lo pidió explícitamente en sus instrucciones escritas.`
        : `\n'KEEP EXACT REFERENCE WARDROBE' ENABLED (STRICT):
- You MUST preserve every visible garment, accessory, button, fit, and material texture from the scene reference with literal fidelity.
- DO NOT swap clothing for generic alternatives or add unseen accessories. Only change garments if explicitly requested in user written instructions.`)
    : "";

  // Brand instruction
  let brandInstruction = "";
  if (manualBrand && manualBrand.trim()) {
    brandInstruction = isEs
      ? `\nMARCA / ETIQUETA INGRESADA MANUALMENTE POR EL USUARIO: "${manualBrand.trim()}". Incorpora esta marca en la prenda relevante del Sujeto A de forma discreta y creíble.`
      : `\nMANUAL BRAND / LABEL ENTERED BY USER: "${manualBrand.trim()}". Integrate this brand label discreetly into Subject A's relevant garment.`;
  } else {
    brandInstruction = isEs
      ? `\nDETECCIÓN VISUAL DE MARCAS (RIGUROSA):
- Examina visualmente logos y etiquetas en la ropa.
- Si no hay un logo claramente identificable, escribe explícitamente "marca no visible o no identificable".
- NO adivines ni inventes marcas por estilo, parecido o prestigio aparente.`
      : `\nVISUAL BRAND DETECTION (RIGOROUS):
- Visually inspect logos and garment labels.
- If no logo is clearly identifiable, explicitly state "brand not visible or unidentifiable".
- DO NOT guess or infer brands based on style, cut, or apparent luxury.`;
  }

  let detailInstruction = "";
  if (detailLevel === 1) {
    detailInstruction = isEs 
      ? "Nivel de detalle conciso: céntrate en los elementos esenciales de composición, sujetos, ropa y entorno sin recargar."
      : "Concise detail level: focus on essential elements of composition, subjects, clothing, and setting.";
  } else if (detailLevel === 2) {
    detailInstruction = isEs 
      ? "Nivel de detalle moderado: equilibra descripciones clave con detalles de iluminación real y textura textil."
      : "Moderate detail level: balance essential descriptions with realistic lighting and fabric textures.";
  } else if (detailLevel === 3) {
    detailInstruction = isEs 
      ? "Nivel de detalle estándar: precisión forense describiendo la escena con fidelidad a lo observable sin exagerar."
      : "Standard detail level: forensic precision describing observable scene details accurately without exaggeration.";
  } else if (detailLevel === 4) {
    detailInstruction = isEs 
      ? "Nivel de detalle exhaustivo: describe pliegues de ropa, texturas de materiales, interacción de luz con el entorno y calzado."
      : "Exhaustive detail level: describe fabric folds, material textures, light interaction with the environment, and footwear.";
  } else {
    detailInstruction = isEs 
      ? "Nivel de detalle hiperdetallado: describe con granularidad forense cada capa de ropa, brillos, sombras de contacto, óptica de cámara y suelo."
      : "Hyper-detailed level: granular forensic breakdown of clothing layers, surface sheen, contact shadows, camera optics, and ground textures.";
  }

  const noiseInstruction = addNoise 
    ? (isEs 
        ? "CRÍTICO: Incluye descripciones de grano sutil de smartphone, ruido digital natural o leves artefactos ópticos para simular captura real no editada. Asegúrate de que el prompt negativo NO descarte estas imperfecciones."
        : "CRITICAL: Include subtle smartphone grain, natural digital noise, or slight optical artifacts in the positive prompt to simulate an authentic unedited capture. Ensure the negative prompt does NOT ban these imperfections.")
    : "";

  const userCustomInstruction = customInstructions 
    ? `\n${isEs ? 'INSTRUCCIONES ESCRITAS DEL USUARIO (MODIFICACIONES ESPECÍFICAS)' : 'USER WRITTEN INSTRUCTIONS (SPECIFIC MODIFICATIONS)'}:
${customInstructions}
NOTA CRÍTICA: Usa el texto escrito como una instrucción de cambio SOLO para los elementos que menciona explícitamente. Mantén todos los demás detalles de la referencia de escena intactos.`
    : "";

  let exifInstruction = "";
  if (exifData) {
    const exifDetails = [];
    if (exifData.Make || exifData.Model) exifDetails.push(`Camera: ${exifData.Make || ''} ${exifData.Model || ''}`.trim());
    if (exifData.FocalLength) exifDetails.push(`Focal Length: ${exifData.FocalLength}mm`);
    if (exifData.FNumber) exifDetails.push(`Aperture: f/${exifData.FNumber}`);
    if (exifData.ISO) exifDetails.push(`ISO: ${exifData.ISO}`);
    if (exifData.ExposureTime) exifDetails.push(`Shutter Speed: 1/${Math.round(1/exifData.ExposureTime)}s`);
    
    if (exifDetails.length > 0) {
      exifInstruction = `\nDATOS EXIF DETECTADOS: ${exifDetails.join(', ')}. Incorpora esta óptica fotográfica real en el prompt positivo para coincidir con las condiciones originales de captura.`;
    }
  }

  const targetLangNotice = isEs 
    ? "IDIOMA DE SALIDA: Todo el contenido (prompt positivo, prompt negativo, resumen detectado y análisis) DEBE estar redactado en ESPAÑOL fluido, técnico y natural."
    : "OUTPUT LANGUAGE: All outputs (positive prompt, negative prompt, detected summary, and analysis) MUST be written in ENGLISH.";

  const dynamicNegativeInstruction = isEs
    ? `PROMPT NEGATIVO DINÁMICO Y QUIRÚRGICO (ESPECÍFICO PARA ESTA ESCENA):
1. Quita cualquier negativo genérico prefabricado. Constrúyelo única y exclusivamente a partir de la escena detectada, los ajustes del usuario y el prompt positivo.
2. Exclusiones de fidelidad:
   - Excluye: cambios de ropa no solicitados, accesorios inventados, objetos no visibles en la referencia (ej. no añadir manteles, platos, plantas o barandas que no estén), reencuadres forzados, iluminación de estudio, gradación cinematográfica cálida irreal, HDR excesivo, piel retocada artificialmente, bokeh computacional falso, render 3D, CGI, filtros de IA.
3. Sujetos:
   - Si se detecta 1 persona: excluye personas adicionales, transeúntes no deseados, sujetos duplicados o cabezas extras.
   - Si se detectan 2 personas: excluye una tercera persona adicional, sujetos extraños, clones duplicados, cuerpos fusionados, extremidades adicionales o manos de más. ¡NO excluyas a las 2 personas solicitadas!
   - Si se detectan 0 personas: excluye personas, figuras humanas, rostros, transeúntes.
4. Elementos reales de la foto:
   - Si la foto tiene texto, copas, teléfono, mesa de color, grano analógico, fondo oscuro o desenfoque óptico natural, ¡NO los excluyas en el negativo!
5. Regla obligatoria de identidad:
   - Incluye siempre: "copia del rostro de la imagen de referencia, rasgos faciales idénticos al sujeto de referencia, clonación facial de la persona de la foto de referencia".
6. Inicia con "[PROMPT NEGATIVO]\\n\\n".`
    : `DYNAMIC AND SURGICAL NEGATIVE PROMPT (SPECIFIC TO THIS SCENE):
1. Remove generic canned negative lists. Build strictly from the analyzed scene, user settings, and positive prompt.
2. Fidelity exclusions:
   - Exclude: unrequested wardrobe changes, invented accessories, added objects not in the reference (e.g. no tablecloths, plates, railings, or plants unless in reference), forced reframing, studio lighting, cinematic warm color grading, overdone HDR, airbrushed plastic skin, fake bokeh, 3D render, CGI, synthetic AI look.
3. Subject count:
   - If 1 person: exclude additional people, unwanted bystanders, duplicate subjects.
   - If 2 people: exclude a third person, unwanted bystanders, clones, fused bodies, extra limbs, extra hands. DO NOT exclude the 2 requested subjects!
   - If 0 people: exclude people, humans, faces.
4. Real reference elements:
   - If the photo has text, stem glasses, phone, colored table, natural noise, dark night, or soft blur, DO NOT exclude them!
5. Mandatory reference face rule:
   - Always include: "copy of reference photo face, facial likeness of reference subject, face cloning of reference person".
6. Start with "[NEGATIVE PROMPT]\\n\\n".`;

  const closingTagInstruction = isEs
    ? `CIERRE OBLIGATORIO DEL PROMPT POSITIVO:
- Si hay 1 o más personas, finaliza exactamente con: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD FACIAL Y ROSTRO DEL USUARIO AL SUJETO A; EXTRAER POSE, VESTIMENTA, ACCESORIOS, ILUMINACIÓN Y ENTORNO DE LA REFERENCIA DE ESCENA SIN COPIAR EL ROSTRO DE LA REFERENCIA]"
- Si hay 0 personas, finaliza exactamente con: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [USAR REFERENCIA ESTRICTAMENTE PARA ENTORNO, OBJETOS, ILUMINACIÓN Y COMPOSICIÓN]"`
    : `MANDATORY POSITIVE PROMPT CLOSING:
- If 1 or more subjects, end exactly with: "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [USE THE FACE AND IDENTITY FROM THE USER'S SEPARATE PERSONAL REFERENCE PHOTO FOR SUBJECT A; USE THIS IMAGE STRICTLY FOR POSE, CLOTHING, ACCESSORIES, SCENE, LIGHTING, AND COMPOSITION]"
- If 0 subjects, end exactly with: "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [USE THIS IMAGE STRICTLY FOR ENVIRONMENT, OBJECTS, SCENE, LIGHTING, AND COMPOSITION]"`;

  const multiImageInstructions = hasIdentityPhoto
    ? (isEs
        ? `\nASIGNACIÓN DE DOS IMÁGENES PROPORCIONADAS:
- IMAGEN 1 (REFERENCIA DE ESCENA): Controla exclusivamente el lugar, la pose, la ropa visible, los accesorios, los objetos, el encuadre, la perspectiva, la iluminación y la composición general.
- IMAGEN 2 (FOTO DE IDENTIDAD DEL USUARIO): Controla ÚNICAMENTE la identidad y rasgos físicos visibles del Sujeto A (rostro, facciones, cabello y tono de piel). NO extraigas de ella el fondo, la ropa, los accesorios ni la pose.`
        : `\nTWO IMAGES PROVIDED - EXPLICIT ROLE MAPPING:
- IMAGE 1 (SCENE REFERENCE): Controls exclusively location, pose, visible clothing, accessories, objects, framing, perspective, lighting, and composition.
- IMAGE 2 (USER IDENTITY PHOTO): Controls ONLY personal identity and visible physical traits of Subject A (face, facial features, hair, and skin tone). DO NOT take background, clothing, accessories, or pose from it.`)
    : "";

  const analyzerTaskPrompt = `Realiza la deconstrucción fotográfica forense de alta fidelidad y auditoría visual:
1. "positive": Prompt positivo detallado y fiel a los datos observables y opciones del usuario.
2. "negative": Prompt negativo dinámico y quirúrgico para esta escena.
3. "detectedSummary": Resumen estructurado y editable de la escena detectada:
   - Composición, encuadre y distancia/escala del sujeto
   - Sujetos, pose, mirada y posición de manos
   - Ropa detallada (tipo de prenda, color, corte, ajuste, cuello, botones, mangas, material aparente con indicación de incertidumbre)
   - Accesorios visibles (collar, pulseras, etc.)
   - Marcas detectadas (o "marca no visible o no identificable")
   - Objetos reales de la escena y mesa (sin inventar objetos ajenos)
   - Entorno observable e iluminación real (sin añadir elementos de fondo ausentes)
4. "analysis": Diagnóstico técnico con campos de calidad, entorno, iluminación, paleta, ropa ("wardrobeAnalysis"), marcas ("brandAnalysis") y autenticidad de captura ("captureAuthenticity").
5. "detectedTargets": Coordenadas porcentuales normalizadas (x: 5 a 95, y: 5 a 95) de los 4 elementos reales observados para calibración de sondas ópticas:
   - "subject": posición central observable del sujeto/rostro/torso con label breve (ej. "Sujeto mirando a la izquierda")
   - "wardrobe": posición de la prenda o accesorios visibles con label breve (ej. "Camisa blanca abierta")
   - "environment": punto visible del fondo/mesa/arquitectura con label breve (ej. "Mesa turquesa con copas")
   - "lighting": origen o foco principal de luz observable con label breve (ej. "Luz ambiental nocturna")

${targetLangNotice}
${multiImageInstructions}
${wardrobeInstruction}
${brandInstruction}

PROTOCOLO OBLIGATORIO DE FIDELIDAD VISUAL Y AUDITORÍA:
1. Analiza minuciosamente la referencia de escena conservando:
   - Composición: distancia de cámara, altura y ángulo, proporción del sujeto en cuadro (conserva espacio vacío y suelo/superficie visible; no acerques la toma ni agrandes al sujeto), posición en el encuadre.
   - Pose y acción: postura del torso, orientación de cabeza y mirada (no la fuerces a cámara), posición de manos, objetos sostenidos o sobre la mesa.
   - Ropa y accesorios: describe cada prenda por corte, color, botones, cuello y material aparente.
   - Objetos reales: si hay copas con tallo, celular con pantalla encendida sobre mesa turquesa, consérvalos tal como están. NO añadas manteles, platos, plantas ni barandas.
   - Fotografía: luz disponible, sombras reales, textura suave o ruido.
2. PRUEBA DE CONTROL - CENA COSTERA:
   - Sujeto de perfil mirando hacia la izquierda.
   - Camisa blanca de botones abierta y suelta.
   - Collar claro de cuentas visible.
   - Copas con tallo sobre la mesa.
   - Teléfono con pantalla encendida sobre mesa turquesa.
   - Fondo nocturno oscuro.
   - Marca de la camisa: "marca no visible o no identificable".
   - NO agregues tela azul en la mesa, platos, comida, plantas ni barandas. Mantén la apariencia casual y la luz irregular sin filtros de película.

${lensInstruction}
${aspectRatioInstruction}
${physicalMeasurementsInstruction}
${detailInstruction}
${noiseInstruction}
${userCustomInstruction}
${exifInstruction}

${dynamicNegativeInstruction}

${closingTagInstruction}`;

  const promptParts: any[] = [
    { text: analyzerTaskPrompt },
    sceneImagePart
  ];

  if (identityImagePart) {
    promptParts.push(identityImagePart);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: promptParts
      },
      config: {
        systemInstruction: ANALYZER_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            positive: { type: Type.STRING },
            negative: { type: Type.STRING },
            detectedSummary: { type: Type.STRING },
            analysis: { 
              type: Type.OBJECT,
              properties: {
                quality: { type: Type.STRING },
                environment: { type: Type.STRING },
                lighting: { type: Type.STRING },
                colorPalette: { type: Type.STRING },
                lensDistortion: { type: Type.STRING },
                suggestions: { type: Type.STRING },
                wardrobeAnalysis: { type: Type.STRING },
                brandAnalysis: { type: Type.STRING },
                captureAuthenticity: { type: Type.STRING }
              },
              required: ["quality", "environment", "lighting", "colorPalette", "suggestions"]
            },
            detectedTargets: {
              type: Type.OBJECT,
              properties: {
                subject: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    label: { type: Type.STRING }
                  },
                  required: ["x", "y", "label"]
                },
                wardrobe: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    label: { type: Type.STRING }
                  },
                  required: ["x", "y", "label"]
                },
                environment: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    label: { type: Type.STRING }
                  },
                  required: ["x", "y", "label"]
                },
                lighting: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    label: { type: Type.STRING }
                  },
                  required: ["x", "y", "label"]
                }
              }
            }
          },
          required: ["positive", "negative", "detectedSummary", "analysis"]
        }
      },
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    const defaultSummary = isEs
      ? "Composición: Escala natural preservada con encuadre original.\nPose y mirada: Sujeto de perfil mirando a la izquierda, posición natural.\nRopa y accesorios: Camisa blanca de botones abierta y suelta, collar claro de cuentas.\nMarcas: Marca no visible o no identificable.\nObjetos: Copas con tallo y teléfono con pantalla encendida sobre mesa turquesa.\nEntorno e iluminación: Fondo nocturno oscuro con iluminación disponible irregular."
      : "Composition: Natural scale and framing preserved with visible space.\nPose & gaze: Profile pose looking left, natural hand and body posture.\nWardrobe & accessories: White button-up shirt worn open and loose, light beaded necklace.\nBrands: Brand not visible or unidentifiable.\nObjects: Stem glasses and phone with screen lit on turquoise table.\nEnvironment & lighting: Dark night background with natural uneven available light.";

    return {
      positive: json.positive || (isEs ? "Error al estructurar el prompt." : "Analysis failed."),
      negative: json.negative || (isEs ? "[PROMPT NEGATIVO]\n\nError en análisis." : "[NEGATIVE PROMPT]\n\nAnalysis failed."),
      detectedSummary: json.detectedSummary || defaultSummary,
      detectedTargets: json.detectedTargets,
      analysis: json.analysis || {
        quality: isEs ? "N/A" : "Analysis failed.",
        environment: isEs ? "N/A" : "Analysis failed.",
        lighting: isEs ? "N/A" : "Analysis failed.",
        colorPalette: isEs ? "N/A" : "Analysis failed.",
        lensDistortion: isEs ? "N/A" : "Analysis failed.",
        suggestions: isEs ? "N/A" : "Analysis failed.",
        wardrobeAnalysis: isEs ? "Ropa de referencia preservada exactamente." : "Exact reference wardrobe preserved.",
        brandAnalysis: isEs ? "marca no visible o no identificable" : "brand not visible or unidentifiable",
        captureAuthenticity: isEs ? "Captura natural con luz disponible real." : "Natural capture with real available light."
      }
    };
  } catch (e: any) {
    console.error("Error in analyzeImage:", e);
    throw new Error(e.message || "Failed to analyze image.");
  }
};

export const generatePromptFromIdea = async (
  ideaText: string,
  gestureOption?: string,
  moodOption?: string,
  aspectRatio: string = 'auto',
  heightCm?: number | string | null,
  weightKg?: number | string | null,
  modeOrLanguage: 'auto' | 'manual' | string = 'auto',
  languageParam: string = 'es'
): Promise<IdeaPromptResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Resolve mode and language flexibly
  let mode: 'auto' | 'manual' = 'auto';
  let language = 'es';
  if (modeOrLanguage === 'auto' || modeOrLanguage === 'manual') {
    mode = modeOrLanguage;
    language = languageParam || 'es';
  } else if (typeof modeOrLanguage === 'string') {
    language = modeOrLanguage;
    if (languageParam === 'auto' || languageParam === 'manual') {
      mode = languageParam;
    }
  }

  const isEs = language === 'es';

  // 1. Generation mode instruction
  const modeInstruction = mode === 'manual'
    ? (isEs 
        ? `MODO DE GENERACIÓN: Modo Manual (Plantilla guiada forense). El usuario utilizó la plantilla estructurada de estudio. Conserva y respeta la estructura de categorías descritas (lugar, ropa completa, accesorios, marcas/ausencia de marca, materiales, acción previa y principal, postura y distribución del peso, gestos de manos, estado de ánimo y expresión facial, cámara/celular, iluminación real y sombras, encuadre, detalles físicos reales, imperfecciones naturales de la cámara y estética no-IA).`
        : `GENERATION MODE: Manual Mode (Forensic Guided Template). The user structured their prompt using our guided studio template. Strictly respect the categories defined in the template (location, complete wardrobe, accessories, brands/unbranded, materials, action, natural body posture, gesture, mood/expression, camera/optics, lighting and shadows, framing, realistic micro-details, and anti-AI photographic behavior).`)
    : (isEs 
        ? `MODO DE GENERACIÓN: Modo Automático (Redacción libre en lenguaje natural). El usuario escribió su concepto libremente. Deconstruye la idea con precisión forense, detallando sujetos, vestimenta completa, accesorios, entorno, acción, iluminación real, encuadre y cámara de smartphone.`
        : `GENERATION MODE: Automatic Mode (Freeform natural language). The user wrote their concept in natural language. Expand and deconstruct the concept with forensic precision, detailing subjects, wardrobe, accessories, setting, action, real lighting, framing, and smartphone camera perspective.`);

  // 2. Gesture / Body language instruction
  let gestureInstruction = "";
  if (gestureOption && gestureOption !== 'auto') {
    gestureInstruction = isEs
      ? `\nGESTO Y LENGUAJE CORPORAL SELECCIONADO: "${gestureOption}". Incorpora este gesto o postura en la acción del Sujeto A, su postura corporal natural y posición de manos, sin alterar a otros sujetos ni inventar rasgos físicos adicionales.`
      : `\nSELECTED GESTURE / BODY LANGUAGE: "${gestureOption}". Incorporate this gesture/posture into Subject A's action, natural body posture, and hand position without altering other subjects or inventing extra physical traits.`;
  }

  // 3. Mood / Emotional atmosphere instruction
  let moodInstruction = "";
  if (moodOption && moodOption !== 'auto') {
    moodInstruction = isEs
      ? `\nESTADO DE ÁNIMO Y ENERGÍA EMOCIONAL SELECCIONADOS: "${moodOption}". Refleja este estado de ánimo en la expresión natural, mirada y atmósfera sin forzar una pose teatral.`
      : `\nSELECTED MOOD / EMOTIONAL ENERGY: "${moodOption}". Reflect this mood in the natural facial expression, gaze, and atmosphere without forcing theatrical overacting.`;
  }

  // 4. Aspect Ratio instruction
  const aspectRatioInstruction = aspectRatio && aspectRatio !== 'auto'
    ? (isEs 
        ? `\nRELACIÓN DE ASPECTO REQUERIDA: ${aspectRatio}. Incluye en el prompt positivo la mención textual "relación de aspecto ${aspectRatio}" y describe la composición en concordancia.`
        : `\nTARGET ASPECT RATIO: ${aspectRatio}. Explicitly include "aspect ratio ${aspectRatio}" in the positive prompt and tailor framing accordingly.`)
    : "";

  // 5. Stature & Weight instruction (integrated into Subject A only if specified)
  let physicalMeasurementsInstruction = "";
  const validHeight = heightCm && Number(heightCm) > 0 ? Math.round(Number(heightCm)) : null;
  const validWeight = weightKg && Number(weightKg) > 0 ? Math.round(Number(weightKg)) : null;

  if (validHeight && validWeight) {
    physicalMeasurementsInstruction = isEs
      ? `\nESTATURA Y PESO DEL USUARIO (INCORPORAR EN SUJETO A):
El usuario especificó: estatura ${validHeight} cm y peso ${validWeight} kg.
En el prompt positivo, dentro del bloque del Subject A, incluye explícitamente estos valores con sus unidades: "estatura ${validHeight} cm y peso ${validWeight} kg" con proporciones corporales naturales.
REGLA CRÍTICA: NO inventes ningún otro rasgo físico (ni color de piel, ni cabello, ni facciones, ni edad, ni etnia).`
      : `\nUSER HEIGHT AND WEIGHT (INCORPORATE INTO SUBJECT A):
The user specified: height ${validHeight} cm and weight ${validWeight} kg.
In the positive prompt, within the Subject A block, explicitly include: "height ${validHeight} cm and weight ${validWeight} kg" with natural body proportions.
CRITICAL RULE: DO NOT invent any other physical traits (hair, skin color, facial features, age, or ethnicity).`;
  } else if (validHeight) {
    physicalMeasurementsInstruction = isEs
      ? `\nESTATURA DEL USUARIO (INCORPORAR EN SUJETO A):
El usuario especificó: estatura ${validHeight} cm (peso no especificado).
En el bloque del Subject A, incluye explícitamente: "estatura ${validHeight} cm". Omite el peso por completo (no inventes números de peso ni complexión).
REGLA CRÍTICA: NO inventes otros rasgos físicos.`
      : `\nUSER HEIGHT (INCORPORATE INTO SUBJECT A):
The user specified: height ${validHeight} cm (weight blank).
In the Subject A block, explicitly include: "height ${validHeight} cm". Omit weight completely. DO NOT invent other physical traits.`;
  } else if (validWeight) {
    physicalMeasurementsInstruction = isEs
      ? `\nPESO DEL USUARIO (INCORPORAR EN SUJETO A):
El usuario especificó: peso ${validWeight} kg (estatura no especificada).
En el bloque del Subject A, incluye explícitamente: "peso ${validWeight} kg". Omite la estatura por completo (no inventes números de estatura).
REGLA CRÍTICA: NO inventes otros rasgos físicos.`
      : `\nUSER WEIGHT (INCORPORATE INTO SUBJECT A):
The user specified: weight ${validWeight} kg (height blank).
In the Subject A block, explicitly include: "weight ${validWeight} kg". Omit height completely. DO NOT invent other physical traits.`;
  } else {
    physicalMeasurementsInstruction = isEs
      ? `\nESTATURA Y PESO: Ninguno fue proporcionado. Omite cualquier mención a números específicos de estatura o peso y NO inventes complexión física.`
      : `\nUSER HEIGHT AND WEIGHT: None provided. Omit measurements completely and DO NOT invent numbers or physical body build.`;
  }

  // 6. Dynamic Negative prompt instructions
  const negativePromptInstruction = isEs
    ? `PROMPT NEGATIVO QUIRÚRGICO (ESPECÍFICO PARA ESTA ESCENA):
1. Quita listas genéricas prefabricadas. Constrúyelo única y exclusivamente a partir de la escena descrita, los ajustes seleccionados y el prompt positivo generado.
2. Manejo quirúrgico de cantidad de sujetos:
   - Si la idea pide 1 persona: excluye personas adicionales, transeúntes no deseados, sujetos duplicados, clones.
   - Si la idea pide 2 personas: excluye una tercera persona adicional, sujetos extraños, clones duplicados, cuerpos fusionados, extremidades adicionales, manos de más. ¡NO excluyas a las dos personas pedidas!
   - Si la idea pide N personas: excluye personas adicionales más allá de las N pedidas.
   - Si la idea es un paisaje, arquitectura u objeto (0 personas): excluye personas, figuras humanas, rostros.
3. Coherencia con la escena:
   - Si la idea describe lluvia, noche, interiores, grano o textos/letreros, ¡NO los excluyas en el negativo!
4. Regla obligatoria de identidad:
   - Incluye siempre: "copia de rostro de referencia, clonación facial de referencia, parecido con rostros ajenos".
5. Inicia siempre con "[PROMPT NEGATIVO]\\n\\n".`
    : `SURGICAL DYNAMIC NEGATIVE PROMPT (SPECIFIC TO THIS SCENE):
1. Remove generic canned lists. Construct it strictly from the described scene, selected settings, and generated positive prompt.
2. Subject count handling:
   - If the idea specifies 1 person: exclude additional people, unwanted bystanders, duplicate clones.
   - If the idea specifies 2 people: explicitly exclude a third additional person, unwanted bystanders, duplicate clones, fused bodies, extra limbs, extra hands. DO NOT exclude the 2 requested people!
   - If the idea specifies N people: exclude additional people beyond the N requested.
   - If 0 people (landscape/object): exclude people, human figures, faces.
3. Scene context:
   - If the idea describes rain, night, interiors, natural grain, or signs/text, DO NOT exclude them!
4. Mandatory identity rule:
   - Always include: "copy of reference face, reference facial likeness, clone of reference person".
5. Start with "[NEGATIVE PROMPT]\\n\\n".`;

  // 7. Mandatory closing instruction
  const closingInstruction = isEs
    ? `CIERRE OBLIGATORIO DEL PROMPT POSITIVO:
- Si hay 1 o más personas, finaliza exactamente con: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"
- Si hay 0 personas, finaliza exactamente con: "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, ILUMINACIÓN Y COMPOSICIÓN]"`
    : `MANDATORY POSITIVE PROMPT CLOSING:
- If 1 or more subjects: End exactly with: "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [APPLY USER PERSONAL IDENTITY AND FACE TO SUBJECT A; DO NOT COPY FACE FROM ANY REFERENCE]"
- If 0 subjects: End exactly with: "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [FOCUS ON ENVIRONMENT, OBJECTS, LIGHTING, AND COMPOSITION]"`;

  const targetLangNotice = isEs 
    ? "IDIOMA DE SALIDA: El prompt positivo, el prompt negativo y el resumen detectado DEBEN estar redactados en ESPAÑOL fluido, técnico y natural."
    : "OUTPUT LANGUAGE: The positive prompt, negative prompt, and detected summary MUST be written in ENGLISH.";

  const promptInstruction = `Eres el Motor Avanzado de Optimización de Realismo y Diseñador Forense de Prompts de Project TRX.
Aplica exactamente el mismo motor, formato y criterios de entrega final del «Analizador».

IDEA O PLANTILLA DEL USUARIO:
"""
${ideaText}
"""

${targetLangNotice}
${modeInstruction}
${gestureInstruction}
${moodInstruction}
${aspectRatioInstruction}
${physicalMeasurementsInstruction}

REGLAS CRÍTICAS DE CONTEO, SUJETOS Y RASGOS FÍSICOS (CUMPLIMIENTO ESTRICTO):
1. IDENTIFICACIÓN DE PERSONAS Y FORMATO EXACTO:
   - Cuando la idea incluya personas, identifica cuántas personas distintas pide y escribe el prompt positivo comenzando DIRECTAMENTE con un bloque para cada una, usando exactamente este formato:
     Subject A: [rol o acción indicada por el usuario]
     Subject B: [rol o acción indicada por el usuario]
     Subject C: [rol o acción indicada por el usuario]
     (Continúa en orden alfabético si hay más personas: Subject D:, etc.).
   - PROHIBIDO anteponer cualquier título, párrafo introductorio o explicación antes de "Subject A:".
   - Incluye SOLO las personas que la idea realmente pide: por ejemplo, «una persona» = un subject; «una pareja» = dos; «tres amigos» = tres; «dos personas» = dos.
   - Conserva sus roles y acciones durante todo el prompt, sin intercambiarlos ni duplicar personas.
   - Deja claro que la imagen debe mostrar exactamente la cantidad solicitada.

2. PROHIBICIÓN ABSOLUTA DE INVENTAR RASGOS FÍSICOS:
   - NO inventes rasgos físicos. NO agregues cabello (ni color, longitud ni estilo), color de piel, facciones, edad, complexión, etnia, marcas, género ni apariencia que el usuario no haya indicado.
   - Si no hay información de apariencia en la idea, deja esos rasgos sin especificar para que la referencia de identidad del usuario los determine.
   - Si hay una imagen de referencia, úsala solo para los rasgos que esa imagen permite observar y asigna cada referencia al subject correcto; no copies la apariencia de una persona a otra.

3. PROHIBICIÓN DE INVENTAR RELACIONES ENTRE PERSONAS:
   - NO inventes relaciones entre personas (como que son pareja o amigos) si la idea no lo dice de forma explícita.
   - Si el usuario menciona un grupo sin indicar cuántas personas hay, no inventes un número exacto: descríbelo como un grupo sin cantidad definida.
   - Las personas de fondo que solo se mencionen como multitud pueden seguir descritas como grupo y no necesitan un bloque individual por cada integrante.

4. SI LA IDEA NO INCLUYE PERSONAS (0 PERSONAS):
   - Si la idea no incluye personas (ej. paisajes, arquitectura, interiores vacíos, objetos, vehículos), NO agregues subjects ni inventes personas. Describe la escena directamente sin bloques de "Subject".

5. ORDEN DE SECCIONES TRAS LOS SUJETOS (IDÉNTICO AL ANALIZADOR):
   - Bloque(s) de Sujeto(s): "Subject A: ...", "Subject B: ..." (cuando aplique)
   - Ropa y accesorios: describe prendas observables o indicadas en la idea (corte, material, botones, cuello, pliegues) sin inventar anatomía.
   - Entorno, locación y objetos concretos de la escena.
   - CÁMARA Y ÓPTICA FIJA DE SMARTPHONE:
     "Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural." (adaptando la relación de aspecto si aplica).
   - Iluminación disponible y textura: luz natural o ambiental real, sombras orgánicas, rango dinámico natural de smartphone, micro-imperfecciones del sensor.
   - CIERRE OBLIGATORIO:
     ${closingInstruction}

${negativePromptInstruction}

RESUMEN ESTRUCTURADO (detectedSummary):
Genera un resumen sintético y editable ("detectedSummary") de lo estructurado:
- Formato y relación de aspecto
- Sujetos (conteo y roles exactos, sin rasgos inventados)
- Ropa y accesorios
- Marcas identificadas ("marca no visible o no identificable")
- Entorno y objetos
- Luz y cámara

Genera un objeto JSON con las claves exactas "positive", "negative" y "detectedSummary".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: promptInstruction }
        ]
      },
      config: {
        systemInstruction: IDEA_BUILDER_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            positive: { 
              type: Type.STRING,
              description: "Prompt positivo. Comienza directamente con 'Subject A: [rol o acción]' si hay personas."
            },
            negative: { 
              type: Type.STRING,
              description: "Prompt negativo quirúrgico que inicia con '[PROMPT NEGATIVO]\\n\\n'."
            },
            detectedSummary: { 
              type: Type.STRING,
              description: "Resumen estructurado editable de la escena."
            }
          },
          required: ["positive", "negative", "detectedSummary"]
        }
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    // Sanitize positive prompt
    let positive = (json.positive || "").trim();
    positive = positive.replace(/^```(markdown|json)?/i, '').replace(/```$/i, '').trim();

    // If there is a Subject A: block, ensure prompt starts directly with Subject A:
    const subjectAIndex = positive.indexOf('Subject A:');
    if (subjectAIndex > 0) {
      positive = positive.slice(subjectAIndex).trim();
    }

    // Ensure mandatory closing tag is present
    const hasClosing = positive.includes('Debe sentirse como una fotografía auténtica') || positive.includes('It must not look AI-generated');
    if (!hasClosing) {
      const isPersonScene = positive.includes('Subject A:') || /personas?|sujetos?|pareja|amigos?|hombre|mujer|chico|chica/i.test(ideaText);
      const closingTag = isPersonScene
        ? (isEs
            ? "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"
            : "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [APPLY USER PERSONAL IDENTITY AND FACE TO SUBJECT A; DO NOT COPY FACE FROM ANY REFERENCE]")
        : (isEs
            ? "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, ILUMINACIÓN Y COMPOSICIÓN]"
            : "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [FOCUS ON ENVIRONMENT, OBJECTS, LIGHTING, AND COMPOSITION]");
      positive = `${positive}\n\n${closingTag}`;
    }

    // Sanitize negative prompt
    let negative = (json.negative || "").trim();
    if (isEs && !negative.startsWith('[PROMPT NEGATIVO]')) {
      negative = `[PROMPT NEGATIVO]\n\n${negative.replace(/^\[PROMPT NEGATIVO\]:?\s*/i, '')}`;
    } else if (!isEs && !negative.startsWith('[NEGATIVE PROMPT]')) {
      negative = `[NEGATIVE PROMPT]\n\n${negative.replace(/^\[NEGATIVE PROMPT\]:?\s*/i, '')}`;
    }

    return {
      positive: positive || (isEs ? "Error al estructurar el prompt." : "Failed to generate positive prompt."),
      negative: negative || (isEs ? "[PROMPT NEGATIVO]\n\nError en exclusiones." : "[NEGATIVE PROMPT]\n\nFailed to generate negative prompt."),
      detectedSummary: json.detectedSummary || (isEs ? "Resumen estructurado de la idea generado." : "Structured concept summary generated.")
    };
  } catch (e: any) {
    console.error("Error in generatePromptFromIdea:", e);
    throw new Error(e.message || "Failed to generate prompt from idea.");
  }
};

export interface BatchPromptItem {
  id?: string;
  positive: string;
  negative: string;
}

export interface BatchProgressCallbackData {
  completed: number;
  total: number;
  newPrompts: BatchPromptItem[];
}

const BATCH_ANALYZER_SYSTEM_INSTRUCTION = `ROLE: Advanced Realism Optimization Engine & Forensic Visual Prompt Engineer specializing in Single-Subject Forensic Realism, Literal Environment Replication, Exact Clothing & Accessories Physics, Optical Lens Geometry, Lighting Fidelity, and Smartphone Photography Realism for Prompt Batches in Project TRX.

REGLAS ESTRICTAS DE ESTRUCTURA Y FORMATO DEL PROMPT POSITIVO (IDÉNTICO AL ANALIZADOR DE PROJECT TRX):
1. REGLA OBLIGATORIA DE PERSONA ÚNICA Y COMIENZO DIRECTO CON "Subject A:":
   - CADA prompt positivo del lote DEBE contener exactamente UNA SOLA PERSONA.
   - CADA prompt positivo DEBE comenzar DIRECTAMENTE con "Subject A:".
   - PROHIBIDO anteponer cualquier título, párrafo explicativo, introducción, numeración, viñetas o texto antes de "Subject A:".
   - PROHIBIDO TERMINANTEMENTE generar "Subject B:", "Subject C:" o cualquier persona secundaria, transeúnte o acompañante en el encuadre. La imagen es siempre un retrato o fotografía casual de una sola persona principal (Subject A).

2. CONTROL DE GÉNERO DE SUBJECT A (BOTONES OPCIONALES O DESCRIPCIÓN NEUTRAL):
   - Si se selecciona «Mujer»: Subject A DEBE describirse explícitamente como una mujer / sujeto femenino en todos los prompts del lote.
   - Si se selecciona «Hombre»: Subject A DEBE describirse explícitamente como un hombre / sujeto masculino en todos los prompts del lote.
   - Si NO se selecciona ninguno: utiliza una descripción universal, neutral y sin género asignado ("una persona adulta", vestimenta y pose neutrales), SIN deducir el género por el contexto de la idea ni por imágenes. ÚNICAMENTE si el usuario escribió de forma explícita palabras de género en su texto (ej. "un hombre", "una mujer", "chica", "chico"), respeta esa indicación escrita expresa.

3. INTERPRETACIÓN Y EXPANSIÓN PROFUNDA DE LA IDEA (INCLUSO DE UNA SOLA PALABRA):
   - La generación funciona únicamente a partir de la idea escrita, sin requerir imágenes de referencia.
   - Si la idea es breve o de una sola palabra (ej. "café", "playa", "oficina", "lluvia", "gimnasio", "nieve", "concierto", "coche"): interpreta internamente ese concepto y úsalo como núcleo para desarrollar variantes completas, concretas, ricas y variadas.
   - Expande con situaciones, acciones, vestimenta contextual detallada, entorno realista, luz y composiciones acordes a la idea y al país seleccionado (si se indicó uno).
   - No te limites a repetir la palabra clave ni desvíes el concepto central.
   - Prohibido mostrar razonamientos internos o pasos intermedios: entrega directamente los prompts.

4. ANÁLISIS FORENSE DE ROPA Y ACCESORIOS DE SUBJECT A:
   - Describe minuciosamente: tipo de prenda observable, color exacto, corte y ajuste al cuerpo (suelta, entallada, holgada, etc.), material o textura aparente (lino, algodón, mezclilla, lana, etc.), cuello (abierto, camisero, redondo, en V), botones (visibles, abiertos, cerrados), mangas (largas, arremangadas, cortas), pliegues naturales y costuras reales.
   - Accesorios visibles: reloj, pulsera, anillos, bolso, mochila, etc., coherentes con la escena. Si no procede, déjalo sin accesorios inventados.
   - Si el usuario especificó un atuendo en su idea, respétalo en todas las variantes. Si no lo especificó, varía la ropa de forma realista y coherente con el contexto.

5. ORDEN ESTRICTO DE SECCIONES (IDÉNTICO AL ANALIZADOR):
   - Bloque del Sujeto: "Subject A: ..." (inicia directamente, única persona).
   - Entorno, locación, objetos concretos de la escena y plano visible (profundidad, texturas de suelo/mesa/paredes/calle, sin inventar objetos ajenos que no pertenezcan al contexto).
   - CÁMARA Y ÓPTICA FIJA (INVARIABLE EN TODOS LOS PROMPTS):
     "Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural. Composición vertical 9:16."
   - Iluminación disponible y textura de captura: luz natural, sombras orgánicas arrojadas, rango dinámico real de smartphone, textura física del sensor y micro-imperfecciones ópticas naturales.
   - CIERRE OBLIGATORIO:
     "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"

6. PROHIBICIÓN TOTAL DE LENTES DE ESTUDIO, LOOK CINEMATOGRÁFICO Y PRODUCCIÓN:
   - PROHIBIDO usar 35mm, 50mm, 85mm, teleobjetivo, cámara réflex DSLR o cámara de cine.
   - PROHIBIDO describir fotografía de estudio, iluminación artificial de campaña publicitaria o look cinematográfico.

7. PROMPT NEGATIVO QUIRÚRGICO (IDÉNTICO AL ANALIZADOR):
   - Inicia siempre con "[PROMPT NEGATIVO]\\n\\n".
   - Excluye específicamente: segunda persona, personas adicionales, transeúntes, acompañantes, multitudes, rostros de fondo, sujetos duplicados, clones, cuerpos fusionados, extremidades adicionales, copia de rostros ajenos, lente de 35mm, 50mm, 85mm, teleobjetivo, cámara réflex DSLR, iluminación de estudio publicitario, look cinematográfico estilizado, filtros de IA, render 3D, CGI, piel plástica retocada, HDR exagerado, deformaciones de rostros por gran angular excesivo.

8. REGLA ESTRICTA DE MEDIDAS FÍSICAS (ESTATURA Y PESO):
   - Incluye ÚNICAMENTE las medidas que el usuario haya escrito expresamente para ese lote.
   - Si el usuario ingresó estatura: incluye explícitamente "estatura X cm" en Subject A.
   - Si el usuario ingresó peso: incluye explícitamente "peso Y kg" en Subject A.
   - Si el usuario ingresó ambas: incluye "estatura X cm y peso Y kg" en Subject A.
   - Si un campo está vacío o no se proporcionó: OMÍTELO por completo. PROHIBIDO usar valores de ejemplo, medidas precargadas o números por defecto cuando el usuario no los haya escrito expresamente.
`;

export const generatePromptBatch = async (
  idea: string,
  totalQuantity: number = 100,
  country?: string,
  language: string = 'es',
  onProgress?: (data: BatchProgressCallbackData) => void,
  heightCm?: string,
  weightKg?: string,
  gender?: 'woman' | 'man' | 'none' | null
): Promise<BatchPromptItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isEs = language === 'es';
  const targetQuantity = Math.max(1, Math.min(300, totalQuantity));

  // Validate height and weight numbers only if explicitly provided
  const validHeight = heightCm && Number(heightCm) > 0 ? Math.round(Number(heightCm)) : null;
  const validWeight = weightKg && Number(weightKg) > 0 ? Math.round(Number(weightKg)) : null;

  let physicalMeasurementsContext = "";
  if (validHeight && validWeight) {
    physicalMeasurementsContext = isEs
      ? `\nESTATURA Y PESO ESCRITOS EXPRESAMENTE POR EL USUARIO PARA ESTE LOTE (INCORPORAR ÚNICAMENTE ESTOS DATOS EN SUJETO A):
El usuario ingresó expresamente: estatura ${validHeight} cm y peso ${validWeight} kg.
Para "Subject A", DEBES incluir explícitamente: "estatura ${validHeight} cm y peso ${validWeight} kg" dentro de su descripción.`
      : `\nUSER EXPLICIT HEIGHT AND WEIGHT FOR THIS BATCH (INCLUDE ONLY THESE IN SUBJECT A):
The user explicitly entered: height ${validHeight} cm and weight ${validWeight} kg.
For "Subject A", you MUST explicitly include: "height ${validHeight} cm and weight ${validWeight} kg".`;
  } else if (validHeight) {
    physicalMeasurementsContext = isEs
      ? `\nESTATURA ESCRITA EXPRESAMENTE POR EL USUARIO (INCORPORAR ÚNICAMENTE ESTE DATO EN SUJETO A):
El usuario ingresó expresamente: estatura ${validHeight} cm (peso vacío).
Para "Subject A", DEBES incluir explícitamente: "estatura ${validHeight} cm".
REGLA ESTRICTA: El peso quedó vacío, por lo que DEBES OMITIR EL PESO por completo. NO inventes ningún número de peso.`
      : `\nUSER EXPLICIT HEIGHT FOR THIS BATCH (INCLUDE ONLY THIS IN SUBJECT A):
The user explicitly entered: height ${validHeight} cm (weight left blank).
For "Subject A", you MUST explicitly include: "height ${validHeight} cm".
STRICT RULE: Weight was left blank, so OMIT weight completely. Do not invent any weight number.`;
  } else if (validWeight) {
    physicalMeasurementsContext = isEs
      ? `\nPESO ESCRITO EXPRESAMENTE POR EL USUARIO (INCORPORAR ÚNICAMENTE ESTE DATO EN SUJETO A):
El usuario ingresó expresamente: peso ${validWeight} kg (estatura vacía).
Para "Subject A", DEBES incluir explícitamente: "peso ${validWeight} kg".
REGLA ESTRICTA: La estatura quedó vacía, por lo que DEBES OMITIR LA ESTATURA por completo. NO inventes ningún número de estatura.`
      : `\nUSER EXPLICIT WEIGHT FOR THIS BATCH (INCLUDE ONLY THIS IN SUBJECT A):
The user explicitly entered: weight ${validWeight} kg (height left blank).
For "Subject A", you MUST explicitly include: "weight ${validWeight} kg".
STRICT RULE: Height was left blank, so OMIT height completely. Do not invent any height number.`;
  } else {
    physicalMeasurementsContext = isEs
      ? `\nMEDIDAS FÍSICAS NO INGRESADAS: El usuario no escribió estatura ni peso para este lote.
REGLA ESTRICTA: OMITE por completo cualquier mención de estatura o peso en Subject A. NO uses valores de ejemplo ni supongas medidas.`
      : `\nNO PHYSICAL MEASUREMENTS ENTERED: The user left height and weight blank for this batch.
STRICT RULE: Omit all mentions of height and weight in Subject A completely. Do not use example values or assumptions.`;
  }

  // Gender context
  let genderInstruction = "";
  if (gender === 'woman') {
    genderInstruction = isEs
      ? `\nBOTÓN DE GÉNERO SELECCIONADO: «MUJER».
REGLA OBLIGATORIA: Subject A DEBE describirse explícitamente como una mujer / sujeto femenino en todos los prompts del lote.`
      : `\nSELECTED GENDER BUTTON: "WOMAN".
MANDATORY RULE: Subject A MUST be explicitly described as a woman / female subject in all prompts in the batch.`;
  } else if (gender === 'man') {
    genderInstruction = isEs
      ? `\nBOTÓN DE GÉNERO SELECCIONADO: «HOMBRE».
REGLA OBLIGATORIA: Subject A DEBE describirse explícitamente como un hombre / sujeto masculino en todos los prompts del lote.`
      : `\nSELECTED GENDER BUTTON: "MAN".
MANDATORY RULE: Subject A MUST be explicitly described as a man / male subject in all prompts in the batch.`;
  } else {
    genderInstruction = isEs
      ? `\nBOTÓN DE GÉNERO: NINGUNO SELECCIONADO.
REGLA OBLIGATORIA: Usa una descripción universal y neutral ("una persona adulta", vestimenta y pose neutrales) para Subject A.
NO deduzcas el género por la idea ni por estereotipos.
EXCEPCIÓN ÚNICA: Si el usuario escribió explícitamente en el texto de su idea una indicación de género (ej. "un hombre", "una mujer", "chica", "chico"), respeta esa indicación expresa escrita.`
      : `\nGENDER BUTTON: NONE SELECTED.
MANDATORY RULE: Use a universal and neutral description ("an adult person", neutral clothing and posture) for Subject A.
Do NOT deduce gender from the idea context or stereotypes.
ONLY EXCEPTION: If the user explicitly typed a gender indicator in their idea text (e.g. "a man", "a woman", "guy", "girl"), respect that explicit written indication.`;
  }

  // Chunk size: 5 to 8 prompts per API call guarantees deep forensic detail without truncation
  const chunkSize = targetQuantity <= 6 ? targetQuantity : (targetQuantity <= 30 ? 5 : 6);
  const totalChunks = Math.ceil(targetQuantity / chunkSize);
  const chunkSizes: number[] = [];
  let remaining = targetQuantity;
  for (let i = 0; i < totalChunks; i++) {
    const size = Math.min(chunkSize, remaining);
    chunkSizes.push(size);
    remaining -= size;
  }

  const allPrompts: BatchPromptItem[] = [];
  const countryContext = country && country.trim() && country !== 'none' && country !== 'Sin país' && country !== 'No specific country'
    ? (isEs
        ? `\nPAÍS / CONTEXTO REGIONAL SELECCIONADO: ${country}. Integra de manera natural y variada la arquitectura, atmósfera visual, elementos culturales, paisajes o detalles urbanos de ${country} en todas las variantes del lote de forma verosímil y sin repetirse palabra por palabra.`
        : `\nSELECTED COUNTRY / REGIONAL CONTEXT: ${country}. Naturally weave the authentic architecture, atmospheric vibe, local scenery, or cultural nuances of ${country} into all prompts in the batch.`)
    : "";

  const langInstruction = isEs
    ? "IDIOMA DE SALIDA: Todos los prompts positivos y negativos generados DEBEN estar redactados en ESPAÑOL fluido, natural y técnicamente fotográfico."
    : "OUTPUT LANGUAGE: All generated positive and negative prompts MUST be written in fluent, naturally photographic ENGLISH.";

  // Function to process a single chunk
  const generateChunk = async (chunkIndex: number, count: number): Promise<BatchPromptItem[]> => {
    const startIdx = chunkIndex * chunkSize + 1;
    const endIdx = chunkIndex * chunkSize + count;
    const chunkPrompt = `Genera exactamente ${count} prompts fotográficos forenses (variantes #${startIdx} a #${endIdx} del lote) para la siguiente idea central:
"""
${idea}
"""
${genderInstruction}
${countryContext}
${physicalMeasurementsContext}
${langInstruction}

INSTRUCCIONES ESTRICTAS DE CONTEO Y FORMATO DE SUJETO (REGLAS FIJAS DE LOTES):
1. PERSONA ÚNICA OBLIGATORIA:
   - CADA prompt positivo DEBE tener exactamente UNA SOLA PERSONA y comenzar DIRECTAMENTE con "Subject A:".
   - PROHIBIDO generar Subject B o personas adicionales en ningún prompt.
   ${gender === 'woman' ? '- Subject A es una mujer.' : gender === 'man' ? '- Subject A es un hombre.' : '- Subject A es una persona adulta en descripción neutral y universal (salvo indicación escrita explícita en la idea).'}
   ${validHeight && validWeight ? `- Medidas explícitas: Integra en Subject A: "estatura ${validHeight} cm y peso ${validWeight} kg".` : validHeight ? `- Medida explícita: Integra en Subject A: "estatura ${validHeight} cm" (omite peso por completo).` : validWeight ? `- Medida explícita: Integra en Subject A: "peso ${validWeight} kg" (omite estatura por completo).` : '- Sin medidas: OMITE estatura y peso en Subject A (no inventes números de ejemplo ni datos no especificados).'}
2. Cámara y Óptica Fija (OBLIGATORIA en TODOS los prompts):
   "Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural. Composición vertical 9:16."
3. Cierre obligatorio al final de cada prompt positivo:
   "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"
4. Interpretación y Variación profunda:
   - Si la idea es una sola palabra o breve, interprétala internamente como núcleo temático y desarróllala en situaciones y escenas completas y plausibles.
   - Varía vestimenta (ajuste, materiales, cuello, pliegues), acción o pose, entorno concreto, momento del día y texturas, manteniendo intacta la idea y el país seleccionado.
   - Entrega directamente los prompts sin mostrar razonamientos internos.
5. Prompt negativo quirúrgico:
   - Inicia siempre con "[PROMPT NEGATIVO]\\n\\n" y excluye personas adicionales, transeúntes, acompañantes, multitudes, clones, 35mm, 50mm, 85mm, teleobjetivo, réflex DSLR, estudio, cine y filtros de IA.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: chunkPrompt }]
      },
      config: {
        systemInstruction: BATCH_ANALYZER_SYSTEM_INSTRUCTION,
        temperature: 0.65,
        topK: 40,
        topP: 0.95,
        responseMimeType: "application/json",
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
                    description: "Prompt positivo completo. Inicia directamente con 'Subject A:' si hay personas."
                  },
                  negative: {
                    type: Type.STRING,
                    description: "Prompt negativo quirúrgico que inicia con '[PROMPT NEGATIVO]\\n\\n'."
                  }
                },
                required: ["positive", "negative"]
              },
              description: `Lista de exactamente ${count} variantes fotográficas completas`
            }
          },
          required: ["items"]
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];

    // Sanitize each item to ensure pristine format matching Analyzer
    return rawItems.map((item: any, idx: number) => {
      let positive = typeof item.positive === 'string' ? item.positive.trim() : '';
      let negative = typeof item.negative === 'string' ? item.negative.trim() : '';

      // Clean any accidental markdown quotes or leading numbers
      positive = positive.replace(/^```(markdown|json)?/i, '').replace(/```$/i, '').trim();
      positive = positive.replace(/^["'`]|["'`]$/g, '').trim();
      positive = positive.replace(/^(Prompt\s*#?\d+:?\s*)/i, '').trim();

      // Ensure positive prompt begins directly with Subject A:
      const subjectAIdx = positive.indexOf('Subject A:');
      if (subjectAIdx > 0) {
        positive = positive.slice(subjectAIdx).trim();
      } else if (subjectAIdx === -1) {
        positive = `Subject A: ${positive}`;
      }

      // Single person rule: eliminate any Subject B block if generated
      const subjectBIdx = positive.indexOf('\nSubject B:');
      if (subjectBIdx !== -1) {
        const afterB = positive.slice(subjectBIdx);
        const nextSectionMatch = afterB.match(/\n\n(Entorno|Locación|Fotografía casual|Casual photograph|Luz|Iluminación|Debe sentirse)/i);
        if (nextSectionMatch && nextSectionMatch.index !== undefined) {
          positive = positive.slice(0, subjectBIdx) + afterB.slice(nextSectionMatch.index);
        } else {
          positive = positive.slice(0, subjectBIdx).trim();
        }
      }

      // Guarantee gender selection is applied if chosen
      if (gender === 'woman') {
        const hasFemaleWord = /mujer|femenin|chica|dama|woman|female/i.test(positive);
        if (!hasFemaleWord) {
          positive = positive.replace(/^Subject A:\s*/i, isEs ? 'Subject A: Una mujer, ' : 'Subject A: A woman, ');
        }
      } else if (gender === 'man') {
        const hasMaleWord = /hombre|masculin|chico|caballero|man|male/i.test(positive);
        if (!hasMaleWord) {
          positive = positive.replace(/^Subject A:\s*/i, isEs ? 'Subject A: Un hombre, ' : 'Subject A: A man, ');
        }
      }

      // Guarantee explicit height and weight are accurately included in Subject A
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

      // Ensure mandatory 24mm 1x 9:16 smartphone camera is included
      const has24mmCamera = positive.includes('24 mm') || positive.includes('24mm');
      if (!has24mmCamera) {
        const cameraLine = isEs
          ? "Fotografía casual tomada con la cámara principal de un celular real, lente de 24 mm equivalente en formato completo, cámara a 1× y perspectiva natural. Composición vertical 9:16."
          : "Casual photograph taken with the main camera of a real smartphone, 24mm equivalent full-frame lens, 1× camera and natural perspective. Vertical 9:16 composition.";
        positive = `${positive}\n\n${cameraLine}`;
      }

      // Ensure mandatory closing tag is present
      const hasClosing = positive.includes('Debe sentirse como una fotografía auténtica') || positive.includes('It must not look AI-generated');
      if (!hasClosing) {
        const closingTag = isEs
          ? "Debe sentirse como una fotografía auténtica tomada por una persona real, no generada por IA. [APLICAR LA IDENTIDAD Y ROSTRO DEL USUARIO AL SUJETO A; NO COPIAR EL ROSTRO DE NINGUNA REFERENCIA]"
          : "It must not look AI-generated, but rather like an authentic photograph taken by a real person. [APPLY USER PERSONAL IDENTITY AND FACE TO SUBJECT A; DO NOT COPY FACE FROM ANY REFERENCE]";
        positive = `${positive}\n\n${closingTag}`;
      }

      // Ensure negative has standard header and excludes extra people
      if (isEs && !negative.startsWith('[PROMPT NEGATIVO]')) {
        negative = `[PROMPT NEGATIVO]\n\n${negative.replace(/^\[PROMPT NEGATIVO\]:?\s*/i, '')}`;
      } else if (!isEs && !negative.startsWith('[NEGATIVE PROMPT]')) {
        negative = `[NEGATIVE PROMPT]\n\n${negative.replace(/^\[NEGATIVE PROMPT\]:?\s*/i, '')}`;
      }

      return {
        id: `${Date.now()}_${chunkIndex}_${idx}`,
        positive,
        negative
      };
    });
  };

  // Run chunks with concurrency of 2-3 to guarantee rapid delivery while streaming progress
  const concurrency = 3;

  for (let i = 0; i < chunkSizes.length; i += concurrency) {
    const currentBatchPromises = chunkSizes
      .slice(i, i + concurrency)
      .map((size, offset) => {
        const cIdx = i + offset;
        return generateChunk(cIdx, size)
          .then((prompts) => {
            allPrompts.push(...prompts);
            if (onProgress) {
              onProgress({
                completed: allPrompts.length,
                total: targetQuantity,
                newPrompts: prompts
              });
            }
            return prompts;
          })
          .catch(async (err) => {
            console.warn(`Chunk ${cIdx} failed, retrying once...`, err);
            try {
              const retryPrompts = await generateChunk(cIdx, size);
              allPrompts.push(...retryPrompts);
              if (onProgress) {
                onProgress({
                  completed: allPrompts.length,
                  total: targetQuantity,
                  newPrompts: retryPrompts
                });
              }
              return retryPrompts;
            } catch (retryErr) {
              console.error(`Chunk ${cIdx} retry failed:`, retryErr);
              return [];
            }
          });
      });

    await Promise.all(currentBatchPromises);
  }

  return allPrompts.slice(0, targetQuantity);
};

// ─────────────────────────────────────────────────────────────
// 04 // LIFESTYLE PROMPT GENERATOR
// ─────────────────────────────────────────────────────────────

const LIFESTYLE_SYSTEM_INSTRUCTION = `ROLE: Specialized Multimodal Visual Director & Aesthetic Ideation Engine for Social Media Lifestyle Photography in Project TRX.

MISIÓN Y OBJETIVO PRINCIPAL:
El usuario sube una imagen de referencia estética sin necesidad de escribir texto alguno.
Tu labor es realizar un análisis visual y contextual profundo de la referencia (entorno, terreno, clima aparente, luz, colores, texturas, perspectiva y estilo de captura).
Usa esas pistas como GUÍA ESTÉTICA Y CONTEXTUAL para concebir y redactar exactamente CINCO (5) propuestas de prompts de fotografía lifestyle completamente nuevas, atractivas, verosímiles y listas para publicaciones en redes sociales (Instagram, carruseles, moodboards, stories).
La foto es la guía estética y contextual, NO una instrucción para repetir exactamente lo que aparece en ella ni copiar de forma mimética el mismo plano u objeto.

═══════════════════════════════════════════════════════════════
ETAPA 1: ANÁLISIS FORENSE VISUAL Y CONTEXTUAL INTERNO (OBLIGATORIO)
═══════════════════════════════════════════════════════════════
Antes de redactar, analiza internamente la referencia en sus 7 dimensiones contextuales:
1. ENTORNO Y BIOMA: Identifica el hábitat o locación implícita (ladera rocosa árida, meseta alta, costa escarpada, desierto arenoso, bosque templado húmedo, valle fluvial, campiña rural, patio mediterráneo o calle empedrada histórica).
2. TERRENO Y SUELO: Superficie física observable (rocas graníticas o volcánicas con líquenes, grava suelta, tierra agrietada por sequedad, arena compacta, asfalto gastado con fisuras, losas de piedra local).
3. CLIMA APARENTE Y ATMÓSFERA: Temperatura y humedad visibles (aire seco y soleado, resolana intensa de mediodía, bruma matutina fresca, resolana dorada de atardecer, aire frío cortante de altitud).
4. ILUMINACIÓN Y SOMBRAS: Dirección, calidad y temperatura de la luz (luz lateral rasante que destaca relieve, sol cenital tamizado por nubes delgadas, contraluz con halo sutil, sombras duras y cortantes).
5. PALETA CROMÁTICA: Tonos dominantes y de acento reales (ocres, tierras tostadas, verdes oliva apagados, grises pétreos, azul cobalto de cielo o mar, acentos minerales).
6. TEXTURAS Y MATERIALES TANGIBLES: Porosidad de la piedra, aspereza de la corteza, metal mate o satinado, polvo fino acumulado en bordes, refracciones y reflejos naturales.
7. PERSPECTIVA Y ESTILO DE CAPTURA: Encuadre casual, espontáneo y creíble tomado con la cámara de un smartphone moderno en la vida real.

═══════════════════════════════════════════════════════════════
ETAPA 2: VARIEDAD DE IDEAS Y CONCEPTOS CENTRALES DISTINTOS
═══════════════════════════════════════════════════════════════
Las CINCO (5) propuestas de cada lote deben tener CONCEPTOS CENTRALES DISTINTOS y coherentes con la foto.
- NO hagas que todas sean de animales, coches, edificios u objetos.
- Elige el tema según lo que combine con el entorno y la estética de la referencia.
- Evita repetir la misma fórmula de escena, protagonista, lugar, acción o composición.
- Mantén el estilo visual de la referencia, pero deja que el motor explore temas lifestyle distintos que tengan sentido para esa imagen.

DISTRIBUCIÓN Y LÍMITES ESTRICTOS POR LOTE:
1. FAUNA LOCAL O VIDA SILVESTRE PLAUSIBLE:
   - REGLA CRÍTICA: Los animales pueden aparecer cuando sean plausibles en ese terreno o bioma, pero LIMITA A UNA (1) COMO MÁXIMO POR LOTE, salvo que el usuario pida específicamente más.
   - Si no encaja naturalmente fauna en la escena, usa 0 animales. NUNCA generes 2 o más propuestas con animales dentro del mismo lote.
   - Solo fauna pequeña/local creíble que pertenezca al bioma (ej. lagartija real sobre roca caliente, pequeña ave sobre matorral).
   - REGLA DE TAXONOMÍA: Si no puedes determinar una especie, ubicación o detalle con confianza, descríbelo de forma general y creíble en vez de inventarlo (ej: «un pequeño reptil de tonalidades pardas y escamas secas», en lugar de nombres científicos inventados).

2. FLORA Y BOTÁNICA AUTÓCTONA DEL TERRENO:
   - Máximo una (1) propuesta con foco botánico.
   - Vegetación adaptada al suelo/clima (suculentas silvestres brotando entre fisuras, líquenes sobre piedra, matorrales achaparrados).

3. VEHÍCULOS ADAPTADOS AL CONTEXTO:
   - Máximo un (1) vehículo por lote, y SOLO SI TIENE SENTIDO Y ENCAJA NATURALMENTE en la topografía.
   - Por ejemplo: un 4x4 con una fina capa de polvo en la carrocería en un camino de tierra, o una clásica de ruta detenida en un mirador.
   - NUNCA fuerces vehículos si desentonan con el bioma, y NUNCA pongas más de 1 vehículo en el lote.

4. ARQUITECTURA VERNÁCULA O ESTRUCTURAS INTEGRADAS AL PAISAJE:
   - Máximo una (1) propuesta de estructura arquitectónica o espacial.
   - Edificaciones o elementos rústicos/contemporáneos que dialoguen armónicamente con el relieve (un murete de piedra seca, un mirador de madera envejecida, un refugio de diseño integrado).

5. PAISAJES GEOLÓGICOS, HORIZONTES O DETALLES DE VIAJE Y EXPEDICIÓN:
   - Formaciones topográficas singulares, estratos geológicos esculpidos por la erosión, cuencas de agua reflejando el cielo, o un bodegón casual de expedición (termo metálico o cantimplora de viaje apoyada sobre una roca plana con el horizonte detrás).

REGLA DE NO-REPETICIÓN Y CERO FÓRMULAS FIJAS:
Cada una de las 5 propuestas DEBE pertenecer a una faceta conceptual y visual claramente diferenciada. Ninguna debe sentirse como una variante o paráfrasis de otra propuesta del mismo lote.

═══════════════════════════════════════════════════════════════
ETAPA 3: REGLAS ESTRICTAS DE CADA PROPUESTA
═══════════════════════════════════════════════════════════════
Cada una de las 5 propuestas debe incluir:

1. FRASE DE PROPÓSITO ("purpose"):
   - Arriba de cada prompt, una frase breve y específica que explique para qué tipo de publicación de redes sociales sirve (ej: «Para una publicación sobre fauna y hábitat natural», «Para un post de expedición y ruta off-road», «Para una portada de carrusel sobre botánica y resistencia silvestre», «Para una historia de arquitectura integrada en el terreno», «Para una publicación de paisajes geológicos y horizontes»).

2. CERO PERSONAS (100% LIBRE DE HUMANOS):
   - Prohibido cualquier rastro de personas: ni en primer plano, fondo, siluetas, multitudes, transeúntes ni partes del cuerpo (ni manos, ni pies, ni brazos).
   - Cero siluetas ni reflejos humanos en vidrios, carrocerías o superficies reflectantes.

3. SIN MARCAS REGISTRADAS NI TEXTO LEGIBLE:
   - No inventes marcas comerciales, logotipos identificables, patentes legibles ni rótulos con texto.

4. FORMATO FIJO VERTICAL 9:16:
   - Todas las propuestas deben especificar explícitamente composición vertical 9:16.

5. CÁMARA Y ZOOM DE CELULAR VARIADO:
   - Elige el zoom de celular que mejor se adapte a la escala y distancia de cada toma:
     * "0.5x": Ultra gran angular (~13mm equiv.), paisajes expansivos, carreteras panorámicas, grandes relieves rocosos.
     * "1x": Cámara principal (~24mm equiv.), perspectiva neutra a la altura de los ojos, vehículos en su entorno, estructuras medias.
     * "2x" o "3x": Teleobjetivo óptico (~50-77mm equiv.), acercamiento respetuoso a fauna silvestre sin perturbarla, detalles botánicos, texturas minerales táctiles.
   - Varía los zooms entre las 5 propuestas; no uses siempre el mismo.
   - Menciona el zoom elegido dentro del prompt positivo ("zoom 0.5x", "zoom 1x", "zoom 2x" o "zoom 3x") y en el campo "cameraZoom".

6. CIERRE OBLIGATORIO DE AUTENTICIDAD:
   - Cada prompt positivo DEBE terminar exactamente con:
     "Debe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]"
     (o en inglés si el idioma seleccionado es EN: "It must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]")

7. PROMPT NEGATIVO ADAPTADO A LA ESCENA (DINÁMICO):
   - Inicia siempre con "[PROMPT NEGATIVO]\\n\\n" (o "[NEGATIVE PROMPT]\\n\\n").
   - Contiene la base universal de exclusión:
     Personas, figuras humanas, rostros, siluetas, extremidades, manos, pies, multitudes, transeúntes, reflejos humanos, marcas comerciales registradas, logotipos visibles, tipografía, texto legible, render 3D, CGI, filtros de IA, look cinematográfico publicitario exagerado, efecto sobreprocesado de catálogo comercial.
   - Y ADEMÁS agrega exclusiones quirúrgicas específicas adaptadas a la escena concreta:
     * Si la escena es agreste / natural / fauna: postes eléctricos, cables aéreos, basura plástica, asfalto urbano, jaulas, animales en cautiverio, taxidermia, ojos de plástico de muñeco, poses artificiales de caricatura.
     * Si la escena incluye un vehículo: alerones deportivos de competición ficticios, luces led de neón tuning, sala de concesionario, reflejos humanos en vidrios o laca.
     * Si la escena es botánica o terreno: macetas de plástico, flores artificiales de tienda, césped sintético.
     * Si la escena es arquitectónica: rascacielos fuera de contexto, elementos futuristas de ciencia ficción, iluminación artificial irreal.

8. REGLA PARA «GENERAR NUEVAS IDEAS» (EVITAR REPETICIÓN O PARÁFRASIS):
   - Cuando se provean conceptos o propuestas ya mostradas previamente:
   - Compara rigurosamente tus 5 nuevas ideas con las que ya se mostraron y con el historial reciente.
   - NO repitas prompts ni presentes simples paráfrasis de los anteriores.
   - Cambia el concepto visual de forma clara sin perder la estética y estilo de la referencia (explora otros ángulos del bioma, momentos de luz alternativos, otros elementos del terreno o de la vida cotidiana en ese entorno).

9. ENTREGA DIRECTA EN JSON:
   - Sin reflexiones internas ni preámbulos en texto libre. Entrega directamente el JSON estructurado solicitado.
`;

export interface LifestylePromptProposal {
  id: string;
  purpose: string;
  cameraZoom: '0.5x' | '1x' | '2x' | '3x';
  positive: string;
  negative: string;
}

export interface LifestyleAnalysisResult {
  aestheticSummary: string;
  colorPalette: string[];
  proposals: LifestylePromptProposal[];
}

export const generateLifestylePrompts = async (
  base64Image: string,
  mimeType: string,
  language: string = 'es',
  previousConcepts: string[] = []
): Promise<LifestyleAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isEs = language === 'es';

  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Image.split(',')[1],
    },
  };

  const avoidBlock =
    previousConcepts && previousConcepts.length > 0
      ? isEs
        ? `\n\nIDEAS Y CONCEPTOS PREVIAMENTE GENERADOS QUE NO DEBES REPETIR NI PARAFRASEAR:\n${previousConcepts
            .map((c) => `- ${c}`)
            .join('\n')}\n\nIMPORTANTE (NUEVAS IDEAS DIFERENCIADAS):\nCompara tus 5 nuevas propuestas con las anteriores. NO repitas temas, lugares, composiciones ni protagonistas ya usados. NO presentes simples paráfrasis. Cambia el concepto visual de forma clara y audaz sin perder la estética de la referencia.`
        : `\n\nPREVIOUSLY GENERATED IDEAS AND CONCEPTS TO AVOID REPEATING OR PARAPHRASING:\n${previousConcepts
            .map((c) => `- ${c}`)
            .join('\n')}\n\nIMPORTANT (NEW DIFFERENTIATED IDEAS):\nCompare your 5 new proposals with those above. DO NOT repeat previously used themes, subjects, places, or compositions. DO NOT present mere paraphrases. Boldly and clearly change the visual concept without losing the aesthetic of the reference.`
      : '';

  const promptInstruction = isEs
    ? `ANÁLISIS FORENSE Y GENERACIÓN LIFESTYLE:
1. Realiza internamente un análisis visual y contextual profundo de esta referencia: entorno/bioma, terreno/suelo, clima aparente, iluminación, sombras, gama cromática, texturas y perspectiva de captura.
2. Usa estas pistas como guía estética y contextual para imaginar CINCO (5) propuestas de prompts de fotografía lifestyle completamente nuevas, verosímiles y visualmente cautivadoras en ese contexto. No copies de forma literal el objeto principal ni la misma escena de la foto.
3. VARIEDAD DE IDEAS Y CONCEPTOS CENTRALES DISTINTOS:
   - Las 5 propuestas de este lote DEBEN tener conceptos centrales distintos y coherentes con la foto.
   - NO hagas que todas sean de animales, coches, edificios u objetos.
   - LIMITACIÓN ESTRICTA DE FAUNA: Los animales pueden aparecer cuando sean plausibles, pero LIMITA A UNA (1) COMO MÁXIMO POR LOTE (si encaja naturalmente; si no, 0 animales). NUNCA generes 2 o más propuestas con animales.
   - Distribuye temáticas variadas entre las 5 propuestas:
     * 1 propuesta con fauna local plausible (máximo 1 animal en el lote).
     * 1 propuesta con flora/botánica autóctona del terreno.
     * 1 propuesta con vehículo adaptado al entorno (solo si encaja naturalmente, no forzado; máx 1 vehículo).
     * 1 propuesta con arquitectura vernácula o diseño espacial integrado al relieve.
     * 1 propuesta con paisaje geológico expansivo, horizontes o bodegón de expedición/texturas táctiles.
   - Evita repetir la misma fórmula de escena, protagonista, lugar, acción o composición.${avoidBlock}
4. Para cada propuesta:
   - Incluye su frase breve de propósito para redes ("purpose").
   - Selecciona un zoom de celular coherente ("cameraZoom": 0.5x, 1x, 2x o 3x) y composición vertical 9:16.
   - Redacta el prompt positivo completo, 100% libre de personas, sin marcas comerciales ni texto legible, con realismo fotográfico y el cierre de autenticidad obligatorio.
   - Redacta el prompt negativo quirúrgico iniciado con "[PROMPT NEGATIVO]\\n\\n" y ADAPTADO específicamente a esa escena.`
    : `FORENSIC ANALYSIS & LIFESTYLE GENERATION:
1. Internally conduct an in-depth visual and contextual analysis of this reference: environment/biome, terrain/soil, apparent climate, lighting, shadows, color palette, textures, and capture perspective.
2. Use these cues as an aesthetic and contextual guide to conceive FIVE (5) completely new, plausible, and captivating lifestyle photo prompt proposals in this setting. Do not copy the main subject or identical scene.
3. IDEA VARIETY & DISTINCT CORE CONCEPTS:
   - The 5 proposals in this batch MUST have distinct core concepts coherent with the photo.
   - DO NOT make them all animals, all cars, all buildings, or all objects.
   - STRICT ANIMAL LIMIT: Animals may appear when plausible, but LIMIT TO AT MOST ONE (1) PER BATCH (if fitting naturally; otherwise 0 animals). NEVER generate 2 or more proposals with animals in the same batch.
   - Distribute varied themes across the 5 proposals:
     * 1 proposal with plausible local wildlife (maximum 1 animal in the batch).
     * 1 proposal with native flora/botany adapted to the terrain.
     * 1 proposal with contextual vehicle (only if naturally fitting, never forced; max 1 vehicle).
     * 1 proposal with vernacular architecture or landscape-integrated design.
     * 1 proposal with expansive geological landscape, horizons, or expedition gear/textures.
   - Avoid repeating formulas of scene, protagonist, place, action, or composition.${avoidBlock}
4. For each proposal:
   - Include its brief purpose phrase for social media ("purpose").
   - Select a coherent smartphone zoom ("cameraZoom": 0.5x, 1x, 2x, or 3x) and vertical 9:16 composition.
   - Write the complete positive prompt, 100% free of people, unbranded, no legible text, with photographic realism and the mandatory authenticity closing.
   - Write the surgical negative prompt starting with "[NEGATIVE PROMPT]\\n\\n" specifically ADAPTED to that scene.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: promptInstruction }],
      },
      config: {
        systemInstruction: LIFESTYLE_SYSTEM_INSTRUCTION,
        temperature: 0.75,
        topK: 40,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aestheticSummary: {
              type: Type.STRING,
              description: 'Resumen agudo de la guía estética y contextual extraída de la referencia (entorno, terreno, clima aparente, iluminación y texturas)',
            },
            colorPalette: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de 4 a 6 tonos de color o materiales característicos identificados',
            },
            proposals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  purpose: {
                    type: Type.STRING,
                    description: 'Frase breve que explica para qué publicación de redes sociales sirve (ej: "Para una publicación sobre fauna y hábitat natural", "Para un post de expedición y ruta off-road")',
                  },
                  cameraZoom: {
                    type: Type.STRING,
                    enum: ['0.5x', '1x', '2x', '3x'],
                    description: 'Zoom de celular elegido para la toma según la perspectiva',
                  },
                  positive: {
                    type: Type.STRING,
                    description: 'Prompt positivo completo en formato vertical 9:16, libre de personas, con zoom y cierre de autenticidad',
                  },
                  negative: {
                    type: Type.STRING,
                    description: 'Prompt negativo quirúrgico que inicia con "[PROMPT NEGATIVO]\\n\\n" y está adaptado específicamente a la escena',
                  },
                },
                required: ['purpose', 'cameraZoom', 'positive', 'negative'],
              },
              description: 'Exactamente cinco propuestas fotográficas completas, independientes y variadas',
            },
          },
          required: ['aestheticSummary', 'proposals'],
        },
      },
    });

    const text = response.text || '{}';
    const json = JSON.parse(text);

    const aestheticSummary = json.aestheticSummary || (isEs ? 'Guía estética y contextual extraída de la referencia.' : 'Aesthetic and contextual guide extracted from reference.');
    const colorPalette = Array.isArray(json.colorPalette) ? json.colorPalette : [];
    const rawProposals = Array.isArray(json.proposals) ? json.proposals : [];

    const zoomOptions: Array<'0.5x' | '1x' | '2x' | '3x'> = ['2x', '1x', '0.5x', '1x', '3x'];

    const sanitizedProposals: LifestylePromptProposal[] = rawProposals.slice(0, 5).map((p: any, idx: number) => {
      let purpose = typeof p.purpose === 'string' ? p.purpose.trim() : '';
      if (!purpose) {
        const defaultPurposesEs = [
          'Para una publicación sobre fauna y hábitat natural',
          'Para una portada de carrusel sobre botánica y resistencia silvestre',
          'Para un post de expedición y rutas panorámicas',
          'Para una publicación de arquitectura integrada en el terreno',
          'Para una historia de paisajes geológicos y horizontes',
        ];
        purpose = isEs ? defaultPurposesEs[idx % 5] : 'For a curated lifestyle social post';
      }

      let zoom: '0.5x' | '1x' | '2x' | '3x' = ['0.5x', '1x', '2x', '3x'].includes(p.cameraZoom)
        ? p.cameraZoom
        : zoomOptions[idx % zoomOptions.length];

      let positive = typeof p.positive === 'string' ? p.positive.trim() : '';
      positive = positive.replace(/^```(markdown|json)?/i, '').replace(/```$/i, '').trim();

      // Ensure 9:16 and zoom specifications are present
      const has916 = positive.includes('9:16');
      const hasZoom = positive.toLowerCase().includes(zoom.toLowerCase());
      if (!has916 || !hasZoom) {
        const cameraLine = isEs
          ? `Fotografía casual tomada con la cámara de un celular real a zoom ${zoom}, perspectiva limpia y natural. Composición vertical 9:16.`
          : `Casual photograph taken with a real smartphone camera at ${zoom} zoom, clean natural perspective. Vertical 9:16 composition.`;
        positive = `${positive}\n\n${cameraLine}`;
      }

      // Ensure mandatory closing authenticity line
      const hasClosing = positive.includes('Debe sentirse como una fotografía auténtica') || positive.includes('It must not look AI-generated');
      if (!hasClosing) {
        const closingTag = isEs
          ? 'Debe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]'
          : 'It must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]';
        positive = `${positive}\n\n${closingTag}`;
      }

      // Sanitize negative prompt and ensure scene adaptation
      let negative = typeof p.negative === 'string' ? p.negative.trim() : '';
      const prefix = isEs ? '[PROMPT NEGATIVO]\n\n' : '[NEGATIVE PROMPT]\n\n';
      
      if (isEs && !negative.startsWith('[PROMPT NEGATIVO]')) {
        negative = `${prefix}${negative.replace(/^\[PROMPT NEGATIVO\]:?\s*/i, '')}`;
      } else if (!isEs && !negative.startsWith('[NEGATIVE PROMPT]')) {
        negative = `${prefix}${negative.replace(/^\[NEGATIVE PROMPT\]:?\s*/i, '')}`;
      }

      // Ensure scene-specific negative exclusions if missing or too brief
      if (!negative || negative.length < 35) {
        const posLower = positive.toLowerCase();
        let sceneAdditions = '';

        if (posLower.includes('reptil') || posLower.includes('lagartija') || posLower.includes('ave') || posLower.includes('fauna') || posLower.includes('animal') || posLower.includes('wildlife')) {
          sceneAdditions = isEs
            ? ', jaulas, animales en cautiverio, taxidermia, ojos de plástico, poses caricaturescas, manos humanas alimentándolo, collares'
            : ', cages, animals in captivity, taxidermy, plastic eyes, cartoon poses, human hands feeding animal, collars';
        } else if (posLower.includes('vehículo') || posLower.includes('coche') || posLower.includes('auto') || posLower.includes('4x4') || posLower.includes('moto') || posLower.includes('truck')) {
          sceneAdditions = isEs
            ? ', alerones de competición exagerados, estética tuning irreal, luces de neón ficticias, reflejos de personas en vidrios o carrocería, sala de exhibición'
            : ', exaggerated race spoilers, tuning neon lights, showroom floor, human reflections in glass or bodywork';
        } else if (posLower.includes('planta') || posLower.includes('flora') || posLower.includes('suculenta') || posLower.includes('botánica') || posLower.includes('vegetación')) {
          sceneAdditions = isEs
            ? ', macetas de plástico, flores artificiales de tienda, césped sintético de jardín'
            : ', plastic pots, artificial store flowers, synthetic lawn turf';
        } else if (posLower.includes('arquitectura') || posLower.includes('muro') || posLower.includes('estructura') || posLower.includes('refugio')) {
          sceneAdditions = isEs
            ? ', rascacielos fuera de contexto, elementos futuristas de ciencia ficción, cables aéreos intrusivos'
            : ', out-of-context skyscrapers, futuristic sci-fi elements, overhead powerlines';
        } else {
          sceneAdditions = isEs
            ? ', postes eléctricos, cables aéreos, basura plástica, asfalto urbano fuera de lugar'
            : ', utility poles, powerlines, plastic trash, out-of-place urban asphalt';
        }

        negative = isEs
          ? `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, extremidades, manos, pies, multitudes, transeúntes, reflejos humanos, marcas comerciales registradas, logotipos visibles, tipografía, texto legible, render 3D, CGI, filtros de IA, look cinematográfico publicitario exagerado, efecto sobreprocesado de catálogo comercial${sceneAdditions}.`
          : `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, limbs, hands, feet, crowds, bystanders, human reflections, registered trademarks, visible logos, typography, legible text, 3D render, CGI, AI filters, exaggerated commercial studio look, overprocessed catalog style${sceneAdditions}.`;
      }

      return {
        id: `lifestyle_${Date.now()}_${idx}`,
        purpose,
        cameraZoom: zoom,
        positive,
        negative,
      };
    });

    // Enforce strict limit: Maximum 1 proposal with animals per batch
    let animalProposalsCount = 0;
    const containsAnimal = (text: string) => {
      const lower = text.toLowerCase();
      return (
        lower.includes('reptil') ||
        lower.includes('lagartija') ||
        lower.includes(' ave ') ||
        lower.includes('aves ') ||
        lower.includes('pájaro') ||
        lower.includes('fauna') ||
        lower.includes('animal') ||
        lower.includes('wildlife') ||
        lower.includes('bird') ||
        lower.includes('insecto') ||
        lower.includes('zorro')
      );
    };

    for (let i = 0; i < sanitizedProposals.length; i++) {
      const p = sanitizedProposals[i];
      if (containsAnimal(`${p.purpose} ${p.positive}`)) {
        animalProposalsCount++;
        if (animalProposalsCount > 1) {
          // Replace second or subsequent animal proposal with an alternative lifestyle facet (botanical texture or expedition still life)
          if (isEs) {
            p.purpose = 'Para una toma de texturas minerales y estratos geológicos';
            p.cameraZoom = '2x';
            p.positive = `Primer plano íntimo de formaciones rocosas erosionadas y estratos minerales con vetas cristalinas, revelando la porosidad natural y el polvo fino depositado en las cavidades. Luz solar rasante cálida que resalta cada fisura geométrica del relieve. Fondo desenfocado con gradientes de color tierra. Fotografía casual tomada con la cámara de un celular real a zoom 2x, perspectiva limpia y natural. Composición vertical 9:16.\n\nDebe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]`;
            p.negative = `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, extremidades, manos, pies, multitudes, transeúntes, reflejos humanos, marcas comerciales registradas, logotipos visibles, tipografía, texto legible, render 3D, CGI, filtros de IA, postes eléctricos, cables aéreos, basura plástica.`;
          } else {
            p.purpose = 'For a mineral textures and geological strata shot';
            p.cameraZoom = '2x';
            p.positive = `Intimate close-up of weathered rock strata and mineral veins revealing natural porosity and fine dust settled in cavities. Warm raking sunlight accentuating every geometric fissure. Soft out-of-focus background with earth tone gradients. Casual photograph taken with a real smartphone camera at 2x zoom, clean natural perspective. Vertical 9:16 composition.\n\nIt must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]`;
            p.negative = `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, limbs, hands, feet, crowds, bystanders, human reflections, registered trademarks, visible logos, typography, legible text, 3D render, CGI, AI filters, utility poles, overhead powerlines, plastic trash.`;
          }
        }
      }
    }

    // If fewer than 5 were parsed, ensure 5 diverse, non-generic proposals
    while (sanitizedProposals.length < 5) {
      const idx = sanitizedProposals.length;
      const zoom = zoomOptions[idx % zoomOptions.length];

      const diverseFallbacksEs = [
        {
          purpose: 'Para una publicación sobre fauna y hábitat natural',
          cameraZoom: '2x' as const,
          positive: `Primer plano íntimo de un pequeño reptil de tonalidades pardas y textura escamosa seca, posado sobre una formación de roca granítica caliente con sutiles líquenes. Luz solar lateral rasante que revela el relieve mineral y la aspereza del terreno. Fondo desenfocado suave con tonos tierra y vegetación baja silvestre. Fotografía casual tomada con la cámara de un celular real a zoom 2x, perspectiva limpia y natural. Composición vertical 9:16.\n\nDebe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]`,
          negative: `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, extremidades, manos, pies, multitudes, transeúntes, reflejos humanos, marcas comerciales registradas, logotipos visibles, tipografía, texto legible, render 3D, CGI, filtros de IA, jaulas, animales en cautiverio, taxidermia, poses caricaturescas, ojos de plástico, postes eléctricos, basura plástica.`,
        },
        {
          purpose: 'Para una portada de carrusel sobre botánica y resistencia silvestre',
          cameraZoom: '3x' as const,
          positive: `Detalle botánico de vegetación silvestre adaptada al terreno árido, con pequeñas suculentas y matorrales achaparrados emergiendo entre las grietas de la roca. Iluminación natural directa de media tarde con sombras definidas en la piedra. Texturas minerales y vegetales táctiles. Fotografía casual tomada con la cámara de un celular real a zoom 3x, perspectiva limpia y natural. Composición vertical 9:16.\n\nDebe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]`,
          negative: `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, extremidades, manos, pies, multitudes, transeúntes, reflejos humanos, marcas comerciales registradas, logotipos visibles, tipografía, texto legible, macetas de plástico, flores artificiales, césped sintético, render 3D, CGI, filtros de IA.`,
        },
        {
          purpose: 'Para un post de expedición y rutas panorámicas',
          cameraZoom: '1x' as const,
          positive: `Un vehículo todoterreno 4x4 con una fina pátina de polvo seco en los paneles laterales, detenido al borde de una pista de tierra con la ladera rocosa y el horizonte de fondo. Luz cálida de atardecer rasante. Ninguna persona visible ni en el interior ni alrededor. Fotografía casual tomada con la cámara de un celular real a zoom 1x, perspectiva limpia y natural. Composición vertical 9:16.\n\nDebe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]`,
          negative: `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, conductores, peatones, reflejos humanos en ventanillas o carrocería, alerones tuning exagerados, luces de neón, marcas registradas, logotipos visibles, sala de concesionario, render 3D, CGI, filtros de IA.`,
        },
        {
          purpose: 'Para una publicación de arquitectura integrada en el terreno',
          cameraZoom: '1x' as const,
          positive: `Estructura arquitectónica vernácula de piedra seca y madera envejecida construida al borde del relieve rocoso, dialogando con la topografía natural. Sombras proyectadas limpias bajo cielo despejado. Atmósfera serena y silenciosa. Fotografía casual tomada con la cámara de un celular real a zoom 1x, perspectiva limpia y natural. Composición vertical 9:16.\n\nDebe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]`,
          negative: `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, extremidades, manos, multitudes, transeúntes, reflejos humanos, marcas comerciales, logotipos, texto legible, rascacielos fuera de contexto, elementos futuristas de ciencia ficción, cables aéreos, render 3D, CGI, filtros de IA.`,
        },
        {
          purpose: 'Para una historia de paisajes geológicos y horizontes',
          cameraZoom: '0.5x' as const,
          positive: `Amplia perspectiva panorámica de formaciones geológicas y estratos rocosos bajo el cielo abierto, capturando la escala masiva del terreno y la atmósfera límpida. Luz natural cenital con sutiles sombras en las quebradas. Fotografía casual tomada con la cámara de un celular real a zoom 0.5x, perspectiva limpia y natural. Composición vertical 9:16.\n\nDebe sentirse como una fotografía auténtica tomada por una persona real con un celular, no generada por IA. [ENFOCARSE EN EL ENTORNO, OBJETOS, MATERIALES, ILUMINACIÓN Y COMPOSICIÓN]`,
          negative: `[PROMPT NEGATIVO]\n\nPersonas, figuras humanas, rostros, siluetas, multitudes, turistas, vehículos, postes eléctricos, cables aéreos, basura plástica, marcas comerciales, logotipos, texto legible, render 3D, CGI, filtros de IA, look de postal turística sobresaturada.`,
        },
      ];

      const diverseFallbacksEn = [
        {
          purpose: 'For a wildlife and natural habitat post',
          cameraZoom: '2x' as const,
          positive: `Intimate close-up of a small brown-toned reptile with dry scaly skin basking on a warm granite rock face with subtle lichens. Raking low-angle sunlight emphasizing mineral relief and rugged terrain textures. Soft out-of-focus background with earth tones. Casual photograph taken with a real smartphone camera at 2x zoom, clean natural perspective. Vertical 9:16 composition.\n\nIt must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]`,
          negative: `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, limbs, hands, feet, crowds, bystanders, human reflections, registered trademarks, visible logos, typography, legible text, 3D render, CGI, AI filters, cages, captive animals, taxidermy, plastic eyes, cartoon poses, utility poles, plastic litter.`,
        },
        {
          purpose: 'For a carousel cover on native flora and resilience',
          cameraZoom: '3x' as const,
          positive: `Botanical detail of native wild vegetation adapted to arid terrain, with small hardy succulents and low shrubs emerging between rock fissures. Direct afternoon natural light with crisp shadows across the stone. Tactical mineral and plant textures. Casual photograph taken with a real smartphone camera at 3x zoom, clean natural perspective. Vertical 9:16 composition.\n\nIt must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]`,
          negative: `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, limbs, hands, feet, crowds, bystanders, human reflections, registered trademarks, visible logos, typography, legible text, plastic pots, artificial store flowers, synthetic turf lawn, 3D render, CGI, AI filters.`,
        },
        {
          purpose: 'For an expedition and scenic route post',
          cameraZoom: '1x' as const,
          positive: `A 4x4 overland vehicle with a fine patina of dry road dust along its side panels, parked by the edge of an unpaved trail with the rocky slope and horizon in the backdrop. Low raking golden late-afternoon light. No people visible inside or around. Casual photograph taken with a real smartphone camera at 1x zoom, clean natural perspective. Vertical 9:16 composition.\n\nIt must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]`,
          negative: `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, drivers, pedestrians, human reflections in windows or body paint, exaggerated race spoilers, tuning neon lights, trademarks, visible logos, showroom floor, 3D render, CGI, AI filters.`,
        },
        {
          purpose: 'For a post on terrain-integrated vernacular architecture',
          cameraZoom: '1x' as const,
          positive: `Vernacular architectural dry-stone and weathered wood structure built against the rocky slope, organically dialoguing with the natural topography. Clean projected shadows under open sky. Quiet serene atmosphere. Casual photograph taken with a real smartphone camera at 1x zoom, clean natural perspective. Vertical 9:16 composition.\n\nIt must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]`,
          negative: `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, limbs, hands, crowds, bystanders, human reflections, trademarks, logos, legible text, out-of-context skyscrapers, futuristic sci-fi elements, overhead powerlines, 3D render, CGI, AI filters.`,
        },
        {
          purpose: 'For a geological landscape and open horizon story',
          cameraZoom: '0.5x' as const,
          positive: `Expansive wide-angle panorama of geological rock strata under an open sky, capturing the massive scale of the terrain and pristine atmosphere. Overhead daylight with subtle ravine shadows. Casual photograph taken with a real smartphone camera at 0.5x zoom, clean natural perspective. Vertical 9:16 composition.\n\nIt must not look AI-generated, but rather like an authentic photograph taken by a real person with a smartphone. [FOCUS ON ENVIRONMENT, OBJECTS, MATERIALS, LIGHTING, AND COMPOSITION]`,
          negative: `[NEGATIVE PROMPT]\n\nPeople, human figures, faces, silhouettes, crowds, tourists, vehicles, utility poles, powerlines, plastic garbage, trademarks, logos, legible text, 3D render, CGI, AI filters, oversaturated tourist postcard style.`,
        },
      ];

      const fallback = isEs ? diverseFallbacksEs[idx % 5] : diverseFallbacksEn[idx % 5];
      sanitizedProposals.push({
        id: `lifestyle_${Date.now()}_${idx}`,
        purpose: fallback.purpose,
        cameraZoom: fallback.cameraZoom,
        positive: fallback.positive,
        negative: fallback.negative,
      });
    }

    return {
      aestheticSummary,
      colorPalette,
      proposals: sanitizedProposals,
    };
  } catch (error: any) {
    console.error('Error generating lifestyle prompts:', error);
    throw new Error(error.message || (isEs ? 'Error al generar propuestas lifestyle.' : 'Failed to generate lifestyle proposals.'));
  }
};


