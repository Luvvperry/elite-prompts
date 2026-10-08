import { GoogleGenAI, Type } from '@google/genai';

const getAI = () => {
  const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured on the server.');
  return new GoogleGenAI({ apiKey: key });
};

const text = (value: unknown) => typeof value === 'string' ? value : '';
const imagePart = (data: string, mimeType: string) => ({ inlineData: { mimeType, data: data.includes(',') ? data.split(',')[1] : data } });
const realism = `Write extremely detailed, physically coherent smartphone photography prompts. Preserve the requested output structure. Avoid beauty bias, cinematic language, CGI, plastic skin, perfect symmetry, artificial bokeh, excessive HDR and staged perfection. Describe concrete camera height, distance, crop, body mechanics, clothing folds, contact shadows, material response, exposure and ordinary phone imperfections. Do not describe or copy the reference person's facial or physical appearance in the text; reserve identity for the user's separate face image. Output only the requested JSON.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const route = new URL(req.url || '/', 'https://local').pathname;
  try {
    const body = req.body || {};
    const ai = getAI();

    if (route.endsWith('/analyze-image')) {
      if (!body.base64Image || !body.mimeType) return res.status(400).json({ error: 'base64Image and mimeType are required' });
      const language = body.language === 'en' ? 'English' : body.language === 'pt' ? 'Brazilian Portuguese' : 'Spanish';
      const prompt = `${realism}\nAnalyze the supplied scene reference as a director of a real casual phone photo. Generate one positive prompt and one negative prompt in ${language}. Start the positive prompt directly with the subject/environment description. Include concrete wardrobe, environment, action, composition, camera, light, imperfections, skin/material physics, and 9:16. Never copy the reference person's face. Return JSON with keys positive, negative, detectedSummary, analysis, detectedTargets.`;
      const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart(text(body.base64Image), text(body.mimeType)), { text: prompt }] }, config: { responseMimeType: 'application/json' } });
      return res.status(200).json(JSON.parse(r.text || '{}'));
    }

    if (route.endsWith('/generate-idea-prompt')) {
      if (!body.ideaText) return res.status(400).json({ error: 'ideaText is required' });
      const language = body.language === 'en' ? 'English' : body.language === 'pt' ? 'Brazilian Portuguese' : 'Spanish';
      const prompt = `${realism}\nTurn this idea into one long, specific smartphone photography prompt in ${language}: ${text(body.ideaText)}. Add a concrete scene, action, wardrobe, camera position, light behavior, material/contact physics and imperfect phone capture. Return JSON with keys positive, negative, detectedSummary.`;
      const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
      return res.status(200).json(JSON.parse(r.text || '{}'));
    }

    if (route.endsWith('/generate-prompt-batch')) {
      if (!body.idea) return res.status(400).json({ error: 'idea is required' });
      const count = Math.max(1, Math.min(12, Number(body.count) || 1));
      const language = body.language === 'en' ? 'English' : body.language === 'pt' ? 'Brazilian Portuguese' : 'Spanish';
      const prompt = `${realism}\nCreate exactly ${count} distinct prompt objects in ${language} from this idea: ${text(body.idea)}. Vary location, action, framing and ordinary imperfections while keeping the subject identity external. Return JSON array under key items; each item must have id, positive, negative, title.`;
      const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
      const parsed = JSON.parse(r.text || '{}');
      return res.status(200).json({ items: Array.isArray(parsed.items) ? parsed.items : [] });
    }

    if (route.endsWith('/generate-lifestyle-prompts')) {
      if (!body.base64Image || !body.mimeType) return res.status(400).json({ error: 'base64Image and mimeType are required' });
      const language = body.language === 'en' ? 'English' : 'Spanish';
      const prompt = `${realism}\nStudy this reference only for palette, place and atmosphere, never copy its composition or person. Generate exactly five different lifestyle prompt proposals in ${language}, with no people, readable text or commercial logos. Return JSON with aestheticSummary, colorPalette array and proposals array containing id, purpose, cameraZoom, positive and negative.`;
      const r = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart(text(body.base64Image), text(body.mimeType)), { text: prompt }] }, config: { responseMimeType: 'application/json' } });
      return res.status(200).json(JSON.parse(r.text || '{}'));
    }

    return res.status(404).json({ error: 'Unknown API route' });
  } catch (error: any) {
    console.error('API error', error);
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
}
