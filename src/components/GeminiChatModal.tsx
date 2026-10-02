import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Globe2,
  ExternalLink,
  Bot,
  User,
  Loader2,
  Trash2,
  ShieldAlert,
  Newspaper,
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  ChatMessage,
  ChatRoleId,
  CHAT_ROLES,
  sendChatMessage,
  clearSavedChatMessages,
} from '../services/geminiService';
import { NewsSpeechReader } from '../utils/speech';
import { CountryInfo, NewsArticle } from '../types';

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCountry?: CountryInfo | null;
  activeArticle?: NewsArticle | null;
}

// Markdown parser helper for rich chat responses
function renderMarkdown(rawText: any) {
  if (rawText === null || rawText === undefined) return null;
  const text =
    typeof rawText === 'string'
      ? rawText
      : typeof rawText === 'object' && rawText.text
      ? String(rawText.text)
      : String(rawText);

  if (!text.trim()) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    if (!line || !line.trim()) {
      return <div key={idx} className="h-2" />;
    }

    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-bold text-sm text-cyan-200 mt-2 mb-1">
          {formatInline(line.replace('### ', ''))}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="font-extrabold text-base text-cyan-300 mt-3 mb-1">
          {formatInline(line.replace('## ', ''))}
        </h3>
      );
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const content = line.trim().replace(/^[-*]\s+/, '');
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-none" />
          <div className="flex-1">{formatInline(content)}</div>
        </div>
      );
    }

    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 my-1 pl-1">
          <span className="text-cyan-400 font-bold text-xs mt-0.5 flex-none w-4">
            {numMatch[1]}.
          </span>
          <div className="flex-1">{formatInline(numMatch[2])}</div>
        </div>
      );
    }

    if (line.startsWith('> ')) {
      return (
        <div key={idx} className="border-l-2 border-cyan-500/60 pl-3 py-1 my-1.5 italic text-slate-300 bg-cyan-950/20 rounded-r">
          {formatInline(line.replace('> ', ''))}
        </div>
      );
    }

    return (
      <p key={idx} className="my-1 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(rawStr: any): React.ReactNode {
  if (rawStr === null || rawStr === undefined) return null;
  const str = typeof rawStr === 'string' ? rawStr : String(rawStr);
  if (!str) return null;

  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'model',
  text: `Halo! Saya **Analis Berita Global AI** didukung Google Gemini.\nPilih peran analisis di atas, lalu ajukan pertanyaan apa pun seputar berita dan isu dunia!\n\n* **Analis Geopolitik** — Analisis strategis & konflik kawasan\n* **Editor Berita** — Rangkuman objektif & berimbang\n* **Fact-Checker** — Verifikasi fakta instan\n* **Ekonom Pasar** — Makroekonomi & komoditas`,
  timestamp: 'Baru saja',
  modelUsed: 'gemini-3.8-flash',
};

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  activeCountry,
  activeArticle,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRoleId>('geopolitics');
  const [includeContext, setIncludeContext] = useState<boolean>(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Always start fresh — no localStorage loading to prevent crashes
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      NewsSpeechReader.stop();
      setSpeakingMessageId(null);
    }
  }, [isOpen, messages]);

  // Reset to welcome on open (fresh session each time modal opens)
  useEffect(() => {
    if (isOpen) {
      // Clear any potentially corrupt localStorage entries
      try {
        clearSavedChatMessages();
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  const currentRole = CHAT_ROLES.find((r) => r.id === selectedRole) || CHAT_ROLES[0];

  const contextDescription = useMemo(() => {
    if (!includeContext) return '';
    const parts: string[] = [];
    if (activeCountry) {
      parts.push(
        `Negara yang sedang diamati: ${activeCountry.nameId || activeCountry.name || ''} (${activeCountry.name || ''}), Ibu Kota: ${activeCountry.capital || '-'}, Benua: ${activeCountry.continent || '-'}.`
      );
    }
    if (activeArticle) {
      parts.push(
        `Artikel yang sedang dibuka: "${activeArticle.title || ''}" (Sumber: ${activeArticle.source || ''}, Kategori: ${activeArticle.category || ''}). Ringkasan: ${activeArticle.summary || ''}`
      );
    }
    return parts.join('\n');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeContext, activeCountry, activeArticle]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      roleId: selectedRole,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.role,
        text: typeof m.text === 'string' ? m.text : String(m.text),
      }));

      const response = await sendChatMessage(history, {
        contextInfo: contextDescription,
        roleId: selectedRole,
        model: 'auto',
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: response.text,
        modelUsed: response.modelUsed,
        roleId: selectedRole,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Maaf, terjadi kendala: **${err.message || 'Koneksi terganggu'}**. Silakan coba tanyakan kembali.`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      NewsSpeechReader.stop();
      setSpeakingMessageId(null);
    } else {
      NewsSpeechReader.stop();
      const raw = typeof msg.text === 'string' ? msg.text : String(msg.text);
      const cleanAudioText = raw.replace(/[*#`_>]/g, '');
      NewsSpeechReader.speak(
        cleanAudioText,
        'id-ID',
        () => setSpeakingMessageId(msg.id),
        () => setSpeakingMessageId(null),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const handleCopy = (msg: ChatMessage) => {
    const raw = typeof msg.text === 'string' ? msg.text : String(msg.text);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(raw).catch(() => {});
    }
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (confirm('Bersihkan riwayat percakapan ini?')) {
      NewsSpeechReader.stop();
      setSpeakingMessageId(null);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          text: 'Riwayat dibersihkan. Apa yang ingin Anda diskusikan sekarang?',
          timestamp: 'Baru saja',
          modelUsed: currentRole.defaultModel,
        },
      ]);
    }
  };

  const renderRoleIcon = (roleId?: ChatRoleId) => {
    switch (roleId) {
      case 'geopolitics':
        return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
      case 'editor':
        return <Newspaper className="w-4 h-4 text-amber-400" />;
      case 'fast_fact':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'economy':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      default:
        return <Bot className="w-4 h-4 text-cyan-400" />;
    }
  };

  const quickQuestions = [
    'Ringkas berita hari ini',
    'Apa dampak keputusan The Fed terhadap Rupiah?',
    activeCountry
      ? `Jelaskan situasi ekonomi & politik di ${activeCountry.nameId || activeCountry.name}`
      : 'Analisis konflik geopolitik & ketahanan energi',
    activeArticle
      ? `Apa dampak berita "${activeArticle.title.slice(0, 40)}..." terhadap pasar global?`
      : 'Fakta apa yang terkonfirmasi mengenai inovasi AI global?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-slate-900/95 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[860px] animate-in zoom-in-95 duration-200 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gemini-chat-title"
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-none">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="gemini-chat-title" className="text-sm sm:text-base font-bold text-white">
                  Analis AI Berita Dunia
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih peran AI lalu tanyakan isu dunia apa pun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
              title="Bersihkan riwayat percakapan"
              aria-label="Bersihkan riwayat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles Selection Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 flex-none">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Peran:
          </span>
          {CHAT_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all flex-none border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {renderRoleIcon(role.id)}
                <span>{role.name}</span>
              </button>
            );
          })}

          {/* Active Context indicator */}
          {(activeCountry || activeArticle) && (
            <button
              type="button"
              onClick={() => setIncludeContext(!includeContext)}
              className={`ml-auto text-[11px] px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition flex-none ${
                includeContext
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Sertakan konteks artikel/negara aktif"
            >
              <span>{includeContext ? '✓ Konteks' : '✕ Konteks'}</span>
              {activeCountry && <span>{activeCountry.flag}</span>}
            </button>
          )}
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-tl-none shadow-md'
                }`}
              >
                {/* Role/Model badge in model messages */}
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-700/60 text-[10px] text-slate-400 flex-wrap">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Gemini Analyst
                    </span>
                    {msg.modelUsed && (
                      <span className="px-1.5 rounded bg-slate-900/80 text-cyan-300 font-mono text-[9px] border border-cyan-500/20">
                        {msg.modelUsed}
                      </span>
                    )}
                    {msg.roleId && renderRoleIcon(msg.roleId)}
                  </div>
                )}

                {/* Content with rich markdown */}
                <div className="space-y-1">{renderMarkdown(msg.text)}</div>

                {/* Grounding web sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-cyan-400" /> Sumber Web:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-700 text-cyan-300 text-[11px] border border-cyan-500/20 transition-colors"
                        >
                          <span className="truncate max-w-[180px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-none text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message footer actions */}
                <div
                  className={`flex items-center justify-between gap-3 mt-2.5 pt-1.5 text-[10px] ${
                    msg.role === 'user'
                      ? 'text-slate-900/70 border-t border-orange-600/20'
                      : 'text-slate-400 border-t border-slate-700/40'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {msg.role === 'model' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSpeak(msg)}
                        className="hover:text-cyan-300 transition-colors p-1 rounded-lg hover:bg-slate-700/50 flex items-center gap-1"
                        title={speakingMessageId === msg.id ? 'Hentikan Audio' : 'Dengarkan (TTS)'}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            <span className="text-rose-400">Berhenti</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Dengarkan</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg)}
                        className="hover:text-cyan-300 transition-colors p-1 rounded-lg hover:bg-slate-700/50 flex items-center gap-1"
                        title="Salin jawaban"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-cyan-400 pl-2 py-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Gemini ({currentRole.defaultModel}) sedang memproses...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex-none">
            Cepat:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors flex-none disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Tanyakan ke ${currentRole.name}...`}
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-md shadow-cyan-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Kirim pesan"
              aria-label="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
