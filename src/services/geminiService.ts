// Gemini AI Client Service

export type GeminiModelId = 'gemini-3.8-flash' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'auto';

export type ChatRoleId = 'geopolitics' | 'editor' | 'fast_fact' | 'economy';

export interface ChatRole {
  id: ChatRoleId;
  name: string;
  tagline: string;
  icon: string;
  badge: string;
  defaultModel: GeminiModelId;
  description: string;
  samplePrompt: string;
}

export const CHAT_ROLES: ChatRole[] = [
  {
    id: 'geopolitics',
    name: 'Analis Geopolitik',
    tagline: 'Analisis Strategis & Konflik Global',
    icon: 'ShieldAlert',
    badge: 'Analisis Mendalam',
    defaultModel: 'gemini-3.8-flash',
    description: 'Menganalisis dampak geostrategis, pergeseran hegemoni, aliansi pertahanan, dan dinamika perbatasan internasional.',
    samplePrompt: 'Analisis pergeseran kekuatan militer dan aliansi strategis di kawasan Indo-Pasifik.'
  },
  {
    id: 'editor',
    name: 'Editor Berita Dunia',
    tagline: 'Jurnalisme Objektif & Berimbang',
    icon: 'Newspaper',
    badge: 'Redaksi Berita',
    defaultModel: 'gemini-3.8-flash',
    description: 'Menyajikan verifikasi berita internasional dari berbagai sudut pandang media terkemuka dunia dengan gaya redaksi kredibel.',
    samplePrompt: 'Rangkum perkembangan diplomasi damai dan bantuan kemanusiaan terkini.'
  },
  {
    id: 'fast_fact',
    name: 'Fact-Checker Kilat',
    tagline: 'Verifikasi Fakta & Kilas Cepat',
    icon: 'Zap',
    badge: 'Respons Kilat',
    defaultModel: 'gemini-3.1-flash-lite',
    description: 'Klarifikasi fakta, keabsahan klaim berita, dan rangkuman poin-poin penting dalam tempo kilat to-the-point.',
    samplePrompt: 'Verifikasi 3 fakta terpenting dari peristiwa yang sedang viral hari ini.'
  },
  {
    id: 'economy',
    name: 'Ekonom Pasar Global',
    tagline: 'Makroekonomi, Saham & Mata Uang',
    icon: 'TrendingUp',
    badge: 'Analisis Finansial',
    defaultModel: 'gemini-3.8-flash',
    description: 'Kajian dampak suku bunga acuan bank sentral, komoditas energi (minyak/gas), rantai pasok chip, dan inflasi.',
    samplePrompt: 'Bagaimana tren suku bunga global mempengaruhi nilai tukar mata uang berkembang?'
  }
];

export const MODEL_OPTIONS: { id: GeminiModelId; label: string; tag: string; description: string }[] = [
  {
    id: 'auto',
    label: 'Otomatis (Optimal)',
    tag: 'Rekomendasi',
    description: 'Memilih otomatis model paling tepat berdasarkan peran dan topik'
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    tag: 'Generasi Terbaru',
    description: 'Model tercanggih dan tercepat untuk penalaran berita dunia'
  },
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    tag: 'Standar Stabil',
    description: 'Keseimbangan prima antara wawasan jurnalistik dan responsivitas'
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash-Lite',
    tag: 'Paling Cepat',
    description: 'Respons instan dengan latensi ultra-rendah untuk verifikasi fakta kilat'
  }
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleId?: ChatRoleId;
  sources?: { title: string; url: string }[];
  searchQueries?: string[];
  isGrounding?: boolean;
}

export interface SendChatOptions {
  contextInfo?: string;
  roleId?: ChatRoleId;
  model?: GeminiModelId;
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'model'; text: string }>,
  options?: SendChatOptions | string
): Promise<{ text: string; modelUsed: string; roleId: string }> {
  const opts: SendChatOptions =
    typeof options === 'string'
      ? { contextInfo: options }
      : options || {};

  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      contextInfo: opts.contextInfo,
      roleId: opts.roleId || 'editor',
      model: opts.model || 'auto'
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal berkomunikasi dengan Gemini AI.');
  }

  return {
    text: data.text,
    modelUsed: data.modelUsed || 'Gemini',
    roleId: data.roleId || 'editor'
  };
}

export async function searchWithGrounding(
  query: string,
  model: GeminiModelId = 'gemini-3.5-flash'
): Promise<{
  text: string;
  sources: { title: string; url: string }[];
  webSearchQueries: string[];
  modelUsed?: string;
}> {
  const res = await fetch('/api/gemini/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, model })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Gagal melakukan verifikasi pencarian Google.');
  }

  return {
    text: data.text,
    sources: data.sources || [],
    webSearchQueries: data.webSearchQueries || [],
    modelUsed: data.modelUsed
  };
}

// Alias for backwards compatibility
export const searchGrounding = searchWithGrounding;

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: audioBlob.type || 'audio/webm'
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Gagal mentranskripsikan audio.');
        }
        resolve(data.text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

// Conversation Storage Helpers
const CHAT_STORAGE_KEY = 'globe_news_gemini_chat_history_v2';

export function loadSavedChatMessages(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const sanitized: ChatMessage[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const m = parsed[i];
      if (!m || typeof m !== 'object') continue;

      let textStr = '';
      if (typeof m.text === 'string') {
        textStr = m.text;
      } else if (m.text && typeof m.text === 'object' && typeof m.text.text === 'string') {
        textStr = m.text.text;
      } else if (m.content && typeof m.content === 'string') {
        textStr = m.content;
      } else if (m.text) {
        try {
          textStr = JSON.stringify(m.text);
        } catch {
          textStr = String(m.text || '');
        }
      }

      if (!textStr.trim()) continue;

      sanitized.push({
        id: String(m.id || `saved-${Date.now()}-${i}`),
        role: m.role === 'user' ? 'user' : 'model',
        text: textStr,
        timestamp: String(m.timestamp || 'Baru saja'),
        modelUsed: m.modelUsed ? String(m.modelUsed) : undefined,
        roleId: m.roleId,
        sources: Array.isArray(m.sources) ? m.sources : undefined,
        searchQueries: Array.isArray(m.searchQueries) ? m.searchQueries : undefined,
        isGrounding: Boolean(m.isGrounding)
      });
    }

    return sanitized.length > 0 ? sanitized : null;
  } catch (e) {
    console.warn('Failed to parse saved chat messages:', e);
    return null;
  }
}

export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    // Keep up to 50 recent messages to avoid quota limits on local storage
    const trimmed = messages.slice(-50);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save chat messages:', e);
  }
}

export function clearSavedChatMessages(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear saved chat messages:', e);
  }
}
