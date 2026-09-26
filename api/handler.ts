// Vercel Serverless Handler — wraps Express app for Vercel deployment
import 'dotenv/config';
import express, { Request, Response } from 'express';
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '25mb' }));

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY belum dikonfigurasi.');
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

const rssParser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 GlobeNews/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
  }
});

const newsCache = new Map<string, { timestamp: number; data: any[] }>();
const CACHE_TTL_MS = 3 * 60 * 1000;

const COUNTRY_GEO_MAP: Record<string, { code: string; hl: string; gl: string; ceid: string }> = {
  'indonesia': { code: 'ID', hl: 'id', gl: 'ID', ceid: 'ID:id' },
  'united states of america': { code: 'US', hl: 'en-US', gl: 'US', ceid: 'US:en' },
  'japan': { code: 'JP', hl: 'ja', gl: 'JP', ceid: 'JP:ja' },
  'united kingdom': { code: 'GB', hl: 'en-GB', gl: 'GB', ceid: 'GB:en' },
  'china': { code: 'CN', hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans' },
  'germany': { code: 'DE', hl: 'de', gl: 'DE', ceid: 'DE:de' },
  'france': { code: 'FR', hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
  'australia': { code: 'AU', hl: 'en-AU', gl: 'AU', ceid: 'AU:en' },
  'india': { code: 'IN', hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  'singapore': { code: 'SG', hl: 'en-SG', gl: 'SG', ceid: 'SG:en' },
  'malaysia': { code: 'MY', hl: 'en-MY', gl: 'MY', ceid: 'MY:en' },
  'russia': { code: 'RU', hl: 'ru', gl: 'RU', ceid: 'RU:ru' },
};

const CATEGORY_BANNERS: Record<string, string[]> = {
  bisnis: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'],
  teknologi: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
  politik: ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80'],
  energi: ['https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80'],
  sains: ['https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80'],
  pertahanan: ['https://images.unsplash.com/photo-1579975096649-e773152b04cb?auto=format&fit=crop&w=1200&q=80'],
  budaya: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80'],
  umum: ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'],
};

function getRandomBanner(category: string, seed = 0): string {
  const list = CATEGORY_BANNERS[category.toLowerCase()] || CATEGORY_BANNERS.umum;
  return list[Math.abs(seed) % list.length];
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/ai|chip|semikonduktor|robot|software|apple|google|nvidia|microsoft|cyber|komputer|satelit/.test(lower)) return 'teknologi';
  if (/ekonomi|saham|inflasi|bunga|rupiah|dolar|investasi|pajak|ekspor|impor|gdp|bank sentral/.test(lower)) return 'bisnis';
  if (/presiden|menteri|pemilu|diplomasi|ktt|pbb|geopolitik|pemerintah/.test(lower)) return 'politik';
  if (/minyak|gas|opec|nuklir|surya|listrik|emisi|iklim|energi/.test(lower)) return 'energi';
  if (/militer|rudal|pertahanan|angkatan|nato|keamanan/.test(lower)) return 'pertahanan';
  if (/astronomi|nasa|riset|medis|kesehatan|vaksin|sains/.test(lower)) return 'sains';
  if (/film|musik|seni|budaya|olahraga|wisata/.test(lower)) return 'budaya';
  return 'umum';
}

function generateTakeaways(title: string, summary: string, source: string): string[] {
  return [
    `Fokus laporan: ${title.slice(0, 100)}${title.length > 100 ? '...' : ''}.`,
    `Diverifikasi oleh koresponden ${source}.`,
    `Perkembangan ini dipantau untuk dampak jangka pendek dan menengah.`
  ];
}

async function fetchGoogleNewsRSS(query?: string, countryName?: string, category?: string) {
  const countryKey = (countryName || '').toLowerCase().trim();
  const geoConfig = COUNTRY_GEO_MAP[countryKey] || { code: 'GL', hl: 'id', gl: 'ID', ceid: 'ID:id' };

  let rssUrl: string;
  if (query && query.trim()) {
    rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query.trim())}&hl=${geoConfig.hl}&gl=${geoConfig.gl}&ceid=${geoConfig.ceid}`;
  } else if (countryName && countryName.trim()) {
    rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(countryName.trim())}&hl=${geoConfig.hl}&gl=${geoConfig.gl}&ceid=${geoConfig.ceid}`;
  } else {
    rssUrl = `https://news.google.com/rss?hl=${geoConfig.hl}&gl=${geoConfig.gl}&ceid=${geoConfig.ceid}`;
  }

  const feed = await rssParser.parseURL(rssUrl);
  return (feed.items || []).slice(0, 18).map((item, index) => {
    const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim() || 'Berita Terkini';
    const sourceMatch = (item.title || '').match(/-\s*([^-]+)$/);
    const sourceName = sourceMatch ? sourceMatch[1].trim() : (item.creator || 'Google News');
    const rawSnippet = stripHtml(item.contentSnippet || item.content || '');
    const summary = rawSnippet.length > 20 ? rawSnippet : `Laporan terkini mengenai ${cleanTitle}.`;
    const cat = detectCategory(cleanTitle + ' ' + summary);

    return {
      id: `rss-${Buffer.from(item.guid || item.link || `${index}`).toString('base64').slice(0, 20)}`,
      title: cleanTitle,
      summary: summary.slice(0, 280),
      content: [summary, `Berita ini disiarkan oleh redaksi ${sourceName}.`, `Perkembangan ini terus dipantau oleh para analis kawasan.`].join('\n\n'),
      source: sourceName,
      sourceUrl: item.link || 'https://news.google.com',
      originalUrl: item.link || 'https://news.google.com',
      publishedAt: item.isoDate || new Date().toISOString(),
      countryName: countryName || 'Global',
      countryCode: geoConfig.code,
      category: cat,
      keyTakeaways: generateTakeaways(cleanTitle, summary, sourceName),
      readTimeMinutes: 3,
      imageUrl: getRandomBanner(cat, index),
      isBreaking: index === 0
    };
  });
}

const ROLE_SYSTEM_INSTRUCTIONS: Record<string, { instruction: string; defaultModel: string }> = {
  geopolitics: {
    instruction: `Anda adalah Analis Senior Geopolitik & Intelijen Global di Globe Berita Dunia. Berikan analisis mendalam, strategis tentang konflik internasional, aliansi militer, dan dinamika geopolitik. Gunakan bahasa Indonesia akademis dan analitis.`,
    defaultModel: 'gemini-3.1-pro-preview'
  },
  editor: {
    instruction: `Anda adalah Redaktur Senior & Jurnalis Berita Internasional di Globe Berita Dunia. Sajikan berita yang berimbang, akurat, dan terverifikasi. Gunakan gaya jurnalistik terpercaya dalam bahasa Indonesia.`,
    defaultModel: 'gemini-3.5-flash'
  },
  fast_fact: {
    instruction: `Anda adalah Fact-Checker Kilat di Globe Berita Dunia. Berikan verifikasi fakta cepat dalam 3-5 poin to-the-point. Gunakan bahasa Indonesia ringkas dan padat.`,
    defaultModel: 'gemini-3.1-flash-lite'
  },
  economy: {
    instruction: `Anda adalah Kepala Ekonom & Analis Pasar Global di Globe Berita Dunia. Analisis pasar finansial, nilai tukar, komoditas, dan kebijakan bank sentral. Gunakan bahasa analisis keuangan yang runtut.`,
    defaultModel: 'gemini-3.1-pro-preview'
  }
};

// --- Routes ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const country = (req.query.country as string) || '';
    const category = (req.query.category as string) || '';
    const q = (req.query.q as string) || '';

    const cacheKey = `rss:${country}:${category}:${q}`;
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ success: true, source: 'cache', count: cached.data.length, articles: cached.data });
    }

    const articles = await fetchGoogleNewsRSS(q, country, category);
    newsCache.set(cacheKey, { timestamp: Date.now(), data: articles });
    res.json({ success: true, source: 'live', count: articles.length, articles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message, articles: [] });
  }
});

app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, contextInfo, roleId = 'editor', model = 'auto' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Pesan diperlukan.' });
    }

    const roleConfig = ROLE_SYSTEM_INSTRUCTIONS[roleId] || ROLE_SYSTEM_INSTRUCTIONS.editor;
    const targetModel = (!model || model === 'auto') ? roleConfig.defaultModel : model;
    const systemInstruction = `${roleConfig.instruction}${contextInfo ? `\n\n[Konteks]: ${contextInfo}` : ''}\nGunakan format Markdown.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || m.content || '') }]
    }));

    const candidateModels = [targetModel, 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].filter((m, i, a) => a.indexOf(m) === i);
    const gemini = getGeminiClient();
    let successfulText = '';
    let usedModel = targetModel;
    let lastError: any = null;

    for (const mName of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: mName,
          contents,
          config: { systemInstruction, temperature: roleId === 'fast_fact' ? 0.3 : 0.7 }
        });
        successfulText = response.text || '';
        usedModel = mName;
        break;
      } catch (err: any) {
        console.warn(`Model ${mName} failed:`, err.message);
        lastError = err;
      }
    }

    if (!successfulText && lastError) throw lastError;
    res.json({ success: true, text: successfulText || 'Tidak ada respons.', modelUsed: usedModel, roleId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/gemini/search', async (req: Request, res: Response) => {
  try {
    const { query, model = 'gemini-3.5-flash' } = req.body;
    if (!query) return res.status(400).json({ error: 'Query diperlukan.' });

    const gemini = getGeminiClient();
    const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].filter((m, i, a) => a.indexOf(m) === i);
    let response: any = null;
    let usedModel = model;
    let lastError: any = null;

    for (const m of candidateModels) {
      try {
        response = await gemini.models.generateContent({
          model: m,
          contents: query,
          config: { systemInstruction: 'Verifikasi berita dalam bahasa Indonesia. Format Markdown.', tools: [{ googleSearch: {} }] }
        });
        usedModel = m;
        break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!response && lastError) throw lastError;
    const grounding = response?.candidates?.[0]?.groundingMetadata;
    const sources = (grounding?.groundingChunks || []).map((c: any) => ({ title: c.web?.title || 'Sumber', url: c.web?.uri || '#' }));
    res.json({ success: true, text: response?.text || '', sources, webSearchQueries: grounding?.webSearchQueries || [], modelUsed: usedModel });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) return res.status(400).json({ error: 'Audio diperlukan.' });
    const gemini = getGeminiClient();
    let text = '';
    for (const m of ['gemini-3.5-flash', 'gemini-3.1-flash-lite']) {
      try {
        const r = await gemini.models.generateContent({
          model: m,
          contents: [{ inlineData: { mimeType: mimeType || 'audio/webm', data: audioBase64 } }, 'Transkripsikan ke bahasa Indonesia.']
        });
        text = r.text?.trim() || '';
        if (text) break;
      } catch { /* try next */ }
    }
    res.json({ success: true, text });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;
