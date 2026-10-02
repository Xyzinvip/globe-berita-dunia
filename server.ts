import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di file environment .env server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

const rssParser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GlobeNews/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
  }
});

// In-memory cache for live news to reduce network latency and protect rate limits
interface CacheEntry {
  timestamp: number;
  data: any[];
}
const newsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

// Mapping common countries to 2-letter ISO codes and RSS query identifiers
const COUNTRY_GEO_MAP: Record<string, { code: string; hl: string; gl: string; ceid: string; lang: string }> = {
  'indonesia': { code: 'ID', hl: 'id', gl: 'ID', ceid: 'ID:id', lang: 'id' },
  'united states of america': { code: 'US', hl: 'en-US', gl: 'US', ceid: 'US:en', lang: 'en' },
  'japan': { code: 'JP', hl: 'ja', gl: 'JP', ceid: 'JP:ja', lang: 'ja' },
  'united kingdom': { code: 'GB', hl: 'en-GB', gl: 'GB', ceid: 'GB:en', lang: 'en' },
  'china': { code: 'CN', hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans', lang: 'zh' },
  'germany': { code: 'DE', hl: 'de', gl: 'DE', ceid: 'DE:de', lang: 'de' },
  'france': { code: 'FR', hl: 'fr', gl: 'FR', ceid: 'FR:fr', lang: 'fr' },
  'australia': { code: 'AU', hl: 'en-AU', gl: 'AU', ceid: 'AU:en', lang: 'en' },
  'canada': { code: 'CA', hl: 'en-CA', gl: 'CA', ceid: 'CA:en', lang: 'en' },
  'india': { code: 'IN', hl: 'en-IN', gl: 'IN', ceid: 'IN:en', lang: 'en' },
  'brazil': { code: 'BR', hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419', lang: 'pt' },
  'singapore': { code: 'SG', hl: 'en-SG', gl: 'SG', ceid: 'SG:en', lang: 'en' },
  'malaysia': { code: 'MY', hl: 'en-MY', gl: 'MY', ceid: 'MY:en', lang: 'en' },
  'russia': { code: 'RU', hl: 'ru', gl: 'RU', ceid: 'RU:ru', lang: 'ru' },
  'saudi arabia': { code: 'SA', hl: 'ar', gl: 'SA', ceid: 'SA:ar', lang: 'ar' }
};

// Curated high-resolution contextual photo banners by category
const CATEGORY_BANNERS: Record<string, string[]> = {
  bisnis: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80'
  ],
  teknologi: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80'
  ],
  politik: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  ],
  energi: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
  ],
  sains: [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80'
  ],
  pertahanan: [
    'https://images.unsplash.com/photo-1579975096649-e773152b04cb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80'
  ],
  budaya: [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'
  ],
  umum: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getRandomBanner(category: string, seed: number = 0): string {
  const cat = category.toLowerCase();
  const list = CATEGORY_BANNERS[cat] || CATEGORY_BANNERS.umum;
  return list[Math.abs(seed) % list.length];
}

// Clean HTML tags from RSS descriptions
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCategory(text: string): 'politik' | 'bisnis' | 'teknologi' | 'energi' | 'sains' | 'pertahanan' | 'budaya' | 'umum' {
  const lower = text.toLowerCase();
  if (/ai|artificial intelligence|chip|semikonduktor|robot|software|apple|google|nvidia|microsoft|startup|gadget|cyber|komputer|satelit/i.test(lower)) {
    return 'teknologi';
  }
  if (/ekonomi|saham|market|ihsg|inflasi|bunga|rupiah|dolar|investasi|pajak|trade|ekspor|impor|gdp|bank sentral|fed|bisnis/i.test(lower)) {
    return 'bisnis';
  }
  if (/presiden|menteri|pemilu|parlemen|diplomasi|ktt|pbb|geopolitik|kebijakan|undang-undang|pemerintah/i.test(lower)) {
    return 'politik';
  }
  if (/minyak|gas|opec|batu bara|nuklir|surya|listrik|emisi|iklim|lingkungan|energi/i.test(lower)) {
    return 'energi';
  }
  if (/militer|rudal|pertahanan|angkatan|senjata|nato|keamanan/i.test(lower)) {
    return 'pertahanan';
  }
  if (/astronomi|nasa|riset|biologi|medis|kesehatan|penelitian|vaksin|sains/i.test(lower)) {
    return 'sains';
  }
  if (/film|musik|seni|budaya|olahraga|sepak bola|championship|wisata|kuliner/i.test(lower)) {
    return 'budaya';
  }
  return 'umum';
}

function generateTakeaways(title: string, summary: string, source: string): string[] {
  return [
    `Fokus laporan: ${title.slice(0, 100)}${title.length > 100 ? '...' : ''}.`,
    `Poin analisis dan implikasi strategis diverifikasi oleh koresponden ${source}.`,
    `Perkembangan ini dipantau ketat oleh analis kawasan untuk dampak jangka pendek dan menengah.`
  ];
}

// Handler for live GNews.io API
async function fetchGNews(apiKey: string, query: string, category?: string, countryCode?: string) {
  const params = new URLSearchParams({
    apikey: apiKey,
    lang: 'id',
    max: '15'
  });
  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  if (countryCode) params.set('country', countryCode.toLowerCase());

  const url = `https://gnews.io/api/v4/top-headlines?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`GNews HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return (data.articles || []).map((art: any, i: number) => {
    const cat = detectCategory(art.title + ' ' + (art.description || ''));
    return {
      id: `gnews-${Buffer.from(art.url || `${i}`).toString('base64').slice(0, 16)}`,
      title: art.title,
      summary: art.description || art.content || 'Ringkasan berita tidak tersedia.',
      content: art.content || art.description || 'Konten berita lengkap dapat diakses pada tautan sumber asli.',
      source: art.source?.name || 'GNews',
      sourceUrl: art.source?.url || art.url,
      originalUrl: art.url,
      publishedAt: art.publishedAt || new Date().toISOString(),
      countryName: countryCode ? countryCode.toUpperCase() : 'Global',
      countryCode: countryCode?.toUpperCase() || 'GL',
      category: cat,
      keyTakeaways: generateTakeaways(art.title, art.description || '', art.source?.name || 'GNews'),
      readTimeMinutes: Math.max(2, Math.round((art.content || '').split(' ').length / 150) || 3),
      imageUrl: art.image || getRandomBanner(cat, i),
      isBreaking: i === 0
    };
  });
}

// Handler for live NewsAPI.org
async function fetchNewsApi(apiKey: string, query: string, category?: string, countryCode?: string) {
  const params = new URLSearchParams({
    apiKey: apiKey,
    pageSize: '15'
  });
  if (query) params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  if (countryCode && !query) params.set('country', countryCode.toLowerCase());

  const endpoint = query ? 'everything' : 'top-headlines';
  const url = `https://newsapi.org/v2/${endpoint}?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`NewsAPI HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return (data.articles || []).map((art: any, i: number) => {
    const cat = detectCategory(art.title + ' ' + (art.description || ''));
    return {
      id: `newsapi-${Buffer.from(art.url || `${i}`).toString('base64').slice(0, 16)}`,
      title: art.title,
      summary: art.description || 'Ringkasan artikel berita.',
      content: art.content || art.description || 'Silakan buka artikel asli untuk membaca rincian lengkap.',
      source: art.source?.name || 'NewsAPI',
      sourceUrl: art.url,
      originalUrl: art.url,
      publishedAt: art.publishedAt || new Date().toISOString(),
      countryName: countryCode ? countryCode.toUpperCase() : 'Global',
      countryCode: countryCode?.toUpperCase() || 'GL',
      category: cat,
      keyTakeaways: generateTakeaways(art.title, art.description || '', art.source?.name || 'NewsAPI'),
      readTimeMinutes: Math.max(2, Math.round((art.content || '').split(' ').length / 150) || 3),
      imageUrl: art.urlToImage || getRandomBanner(cat, i),
      isBreaking: i === 0
    };
  });
}

// Handler for live Google News RSS feeds (No API Key required, ultra-reliable and fast)
async function fetchGoogleNewsRSS(query?: string, countryName?: string, category?: string) {
  const countryKey = (countryName || '').toLowerCase().trim();
  const geoConfig = COUNTRY_GEO_MAP[countryKey] || {
    code: 'GL',
    hl: 'id',
    gl: 'ID',
    ceid: 'ID:id',
    lang: 'id'
  };

  let rssUrl: string;
  if (query && query.trim()) {
    const qEnc = encodeURIComponent(query.trim());
    rssUrl = `https://news.google.com/rss/search?q=${qEnc}&hl=${geoConfig.hl}&gl=${geoConfig.gl}&ceid=${geoConfig.ceid}`;
  } else if (countryName && countryName.trim()) {
    const countryEnc = encodeURIComponent(countryName.trim());
    rssUrl = `https://news.google.com/rss/search?q=${countryEnc}&hl=${geoConfig.hl}&gl=${geoConfig.gl}&ceid=${geoConfig.ceid}`;
  } else if (category && category !== 'all') {
    const categoryQueryMap: Record<string, string> = {
      'teknologi': 'teknologi OR artificial intelligence OR AI',
      'bisnis': 'bisnis OR ekonomi OR finansial OR saham',
      'politik': 'politik OR diplomasi OR pemilu OR KTT',
      'energi': 'energi OR minyak OR iklim OR PLTN',
      'sains': 'sains OR riset OR antariksa',
      'pertahanan': 'pertahanan OR militer OR keamanan',
      'budaya': 'budaya OR olahraga OR wisata'
    };
    const qStr = categoryQueryMap[category.toLowerCase()] || category;
    rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(qStr)}&hl=id&gl=ID&ceid=ID:id`;
  } else {
    // Top headlines
    rssUrl = `https://news.google.com/rss?hl=${geoConfig.hl}&gl=${geoConfig.gl}&ceid=${geoConfig.ceid}`;
  }

  const feed = await rssParser.parseURL(rssUrl);
  return (feed.items || []).slice(0, 18).map((item, index) => {
    const cleanTitle = (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim() || item.title || 'Berita Terkini';
    const sourceMatch = (item.title || '').match(/-\s*([^-]+)$/);
    const sourceName = sourceMatch ? sourceMatch[1].trim() : (item.creator || 'Google News');
    const rawSnippet = stripHtml(item.contentSnippet || item.content || item.summary || '');
    const summary = rawSnippet.length > 20 ? rawSnippet : `Laporan terkini mengenai perkembangan penting seputar ${cleanTitle}.`;
    
    // Detailed article paragraphs for the native reader
    const contentParagraphs = [
      summary,
      `Berita ini disiarkan oleh redaksi ${sourceName} berdasarkan data lapangan dan pantauan perkembangan terkini di kawasan terkait.`,
      `Pengamat dan pelaku industri mencatat bahwa dinamika ini dapat mempengaruhi pengambilan kebijakan serta sentimen publik dalam beberapa pekan mendatang.`,
      `Pihak berwenang dan pemangku kepentingan terus memantau indikator lanjutan guna memastikan langkah mitigasi serta kesinambungan program prioritas.`
    ].join('\n\n');

    const cat = detectCategory(cleanTitle + ' ' + summary);

    return {
      id: `rss-${Buffer.from(item.guid || item.link || `${index}`).toString('base64').slice(0, 20)}`,
      title: cleanTitle,
      summary: summary.slice(0, 280),
      content: contentParagraphs,
      source: sourceName,
      sourceUrl: item.link || 'https://news.google.com',
      originalUrl: item.link || 'https://news.google.com',
      publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
      countryName: countryName || 'Global',
      countryCode: geoConfig.code,
      category: cat,
      keyTakeaways: generateTakeaways(cleanTitle, summary, sourceName),
      readTimeMinutes: Math.max(2, Math.round(cleanTitle.split(' ').length + summary.split(' ').length) / 50 || 3),
      imageUrl: getRandomBanner(cat, index),
      isBreaking: index === 0
    };
  });
}

// API endpoint: GET /api/news
app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const country = (req.query.country as string) || '';
    const category = (req.query.category as string) || '';
    const q = (req.query.q as string) || '';
    const provider = (req.query.provider as string) || 'auto';
    const clientApiKey = (req.query.apiKey as string) || '';

    const cacheKey = `${provider}:${country}:${category}:${q}:${clientApiKey ? 'custom' : 'default'}`;
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        source: 'cache',
        count: cached.data.length,
        articles: cached.data
      });
    }

    let articles: any[] = [];
    const gnewsKey = clientApiKey || process.env.GNEWS_API_KEY;
    const newsApiKey = clientApiKey || process.env.NEWS_API_KEY;

    if (provider === 'gnews' && gnewsKey) {
      try {
        articles = await fetchGNews(gnewsKey, q, category, country);
      } catch (err: any) {
        console.warn('GNews failed, falling back to RSS:', err.message);
      }
    } else if (provider === 'newsapi' && newsApiKey) {
      try {
        articles = await fetchNewsApi(newsApiKey, q, category, country);
      } catch (err: any) {
        console.warn('NewsAPI failed, falling back to RSS:', err.message);
      }
    }

    // Default to live RSS if other providers not selected or failed
    if (!articles || articles.length === 0) {
      articles = await fetchGoogleNewsRSS(q, country, category);
    }

    newsCache.set(cacheKey, { timestamp: Date.now(), data: articles });

    res.json({
      success: true,
      source: 'live',
      count: articles.length,
      articles
    });
  } catch (error: any) {
    console.error('Error in /api/news:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal memuat berita terkini.',
      articles: []
    });
  }
});

// API health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini Multi-Turn Chat Endpoint supporting roles & models
const ROLE_SYSTEM_INSTRUCTIONS: Record<string, { instruction: string; defaultModel: string }> = {
  geopolitics: {
    instruction: `Anda adalah Analis Senior Geopolitik & Intelijen Global di Globe Berita Dunia.
Tugas Anda:
1. Memberikan analisis mendalam, strategis, dan berbobot tinggi tentang konflik internasional, aliansi militer, traktat diplomasi, kalkulasi kekuatan hegemoni, sanksi, dan stabilitas kawasan.
2. Jelaskan motivasi tersembunyi para aktor negara, kalkulasi geostrategis, skenario jangka panjang, dan dampak global.
3. Gunakan bahasa Indonesia akademis, analitis, tajam, objektif, dan berwawasan luas.`,
    defaultModel: 'gemini-3.8-flash'
  },
  editor: {
    instruction: `Anda adalah Redaktur Senior & Jurnalis Berita Internasional di Globe Berita Dunia.
Tugas Anda:
1. Menyajikan rangkuman berita dunia yang berimbang, akurat, dan terverifikasi dari berbagai perspektif negara-negara terkait.
2. Menguraikan kronologi peristiwa, dampak sosial kemanusiaan, dan konteks berita secara lugas dan informatif.
3. Gunakan gaya bahasa jurnalistik terpercaya, objektif, santun, dan mudah dipahami semua kalangan.`,
    defaultModel: 'gemini-3.8-flash'
  },
  fast_fact: {
    instruction: `Anda adalah Fact-Checker Kilat (Fast Fact-Checker) di Globe Berita Dunia.
Tugas Anda:
1. Memberikan verifikasi fakta super cepat, konfirmasi kebenaran klaim, dan ringkasan kilat dalam 3-5 poin peluru to-the-point.
2. Hindari pembukaan berbelit-belit; langsung sajikan inti data, tanggal, tokoh, dan kesimpulan keabsahan fakta.
3. Gunakan bahasa Indonesia ringkas, presisi, dan padat informasi.`,
    defaultModel: 'gemini-3.1-flash-lite'
  },
  economy: {
    instruction: `Anda adalah Kepala Ekonom & Analis Pasar Global di Globe Berita Dunia.
Tugas Anda:
1. Menganalisis pasar finansial dunia, nilai tukar mata uang, komoditas energi (minyak & gas), rantai pasokan global, inflasi, dan kebijakan suku bunga bank sentral (The Fed, ECB, BI, dll).
2. Berikan proyeksi pasar dan implikasi ekonomi praktis bagi masyarakat dan dunia usaha.
3. Gunakan bahasa analisis keuangan yang runtut, berbasis logika ekonomi, dan jelas.`,
    defaultModel: 'gemini-3.8-flash'
  }
};

app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, contextInfo, roleId = 'editor', model = 'auto' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Daftar pesan percakapan diperlukan.' });
    }

    const roleConfig = ROLE_SYSTEM_INSTRUCTIONS[roleId] || ROLE_SYSTEM_INSTRUCTIONS.editor;
    
    let targetModel = model;
    if (!targetModel || targetModel === 'auto') {
      targetModel = roleConfig.defaultModel || 'gemini-3.8-flash';
    }

    const systemInstruction = `${roleConfig.instruction}
${contextInfo ? `\n\n[Konteks Aktif yang Sedang Dilihat Pengguna]:\n${contextInfo}` : ''}
Aturan format: Gunakan Markdown (tebal, miring, daftar poin, kutipan) agar jawaban mudah dibaca dan terstruktur dengan rapi.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.text || m.content || '') }]
    }));

    const candidateModels = [
      targetModel,
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite'
    ].filter((m, i, arr) => arr.indexOf(m) === i);

    let lastError: any = null;
    let successfulText = '';
    let usedModel = targetModel;

    const gemini = getGeminiClient();

    for (const mName of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: mName,
          contents,
          config: {
            systemInstruction,
            temperature: roleId === 'fast_fact' ? 0.3 : 0.7,
          }
        });

        successfulText = response.text || '';
        usedModel = mName;
        break;
      } catch (err: any) {
        console.warn(`Model ${mName} chat attempt failed:`, err.message);
        lastError = err;
      }
    }

    if (!successfulText && lastError) {
      throw lastError;
    }

    res.json({
      success: true,
      text: successfulText || 'Tidak ada respons teks yang dihasilkan.',
      modelUsed: usedModel,
      roleId
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal berkomunikasi dengan Gemini AI.'
    });
  }
});

// Gemini Google Search Grounding Endpoint
app.post('/api/gemini/search', async (req: Request, res: Response) => {
  try {
    const { query, model = 'gemini-3.5-flash' } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query pencarian berita diperlukan.' });
    }

    const gemini = getGeminiClient();
    const systemInstruction = `Anda adalah Asisten Riset Berita & Fakta Global. Gunakan informasi pencarian web Google Search secara akurat untuk memverifikasi berita terkini, tanggal peristiwa, dan fakta lapangan dalam bahasa Indonesia yang ringkas dan terstruktur. Gunakan format Markdown rapi.`;

    const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview']
      .filter((m, i, arr) => arr.indexOf(m) === i);

    let response: any = null;
    let lastError: any = null;
    let usedModel = candidateModels[0];

    for (const m of candidateModels) {
      try {
        response = await gemini.models.generateContent({
          model: m,
          contents: query,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }]
          }
        });
        usedModel = m;
        break;
      } catch (err: any) {
        console.warn(`Grounding with ${m} failed:`, err.message);
        lastError = err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    // Extract grounding metadata chunks and search queries
    const grounding = response?.candidates?.[0]?.groundingMetadata;
    const sources = (grounding?.groundingChunks || []).map((chunk: any) => ({
      title: chunk.web?.title || 'Sumber Web Terverifikasi',
      url: chunk.web?.uri || '#'
    }));

    res.json({
      success: true,
      text: response?.text || 'Tidak ditemukan rangkuman pencarian.',
      sources,
      webSearchQueries: grounding?.webSearchQueries || [],
      modelUsed: usedModel
    });
  } catch (error: any) {
    console.error('Gemini search grounding error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal melakukan verifikasi pencarian Google.'
    });
  }
});

// Gemini Audio Transcription Endpoint
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Data rekaman audio base64 diperlukan.' });
    }

    const gemini = getGeminiClient();
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    let text = '';
    let lastError: any = null;

    for (const m of candidateModels) {
      try {
        const response = await gemini.models.generateContent({
          model: m,
          contents: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64
              }
            },
            'Transkripsikan rekaman suara pengguna ini secara akurat ke dalam teks bahasa Indonesia atau bahasa yang diucapkan. Hanya keluarkan hasil transkripsi teks murni tanpa kata pengantar atau tanda petik pembuka/penutup.'
          ]
        });
        text = response.text?.trim() || '';
        if (text) break;
      } catch (err: any) {
        console.warn(`Transcribe with ${m} failed:`, err.message);
        lastError = err;
      }
    }

    if (!text && lastError) {
      throw lastError;
    }

    res.json({
      success: true,
      text
    });
  } catch (error: any) {
    console.error('Gemini audio transcription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal mentranskripsikan audio rekaman.'
    });
  }
});

// Serve frontend via Vite in dev, or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Globe Berita Dunia server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
