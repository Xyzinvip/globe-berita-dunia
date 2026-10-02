import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Share2,
  Languages,
  Clock,
  Sparkles,
  ChevronLeft,
  Check,
  Type,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NewsArticle } from '../types';
import { NewsSpeechReader } from '../utils/speech';
import { isBookmarked, saveBookmark, removeBookmark, incrementReadCount } from '../utils/storage';

interface InAppArticleReaderProps {
  article: NewsArticle | null;
  onClose: () => void;
  onSelectRelatedArticle?: (article: NewsArticle) => void;
  relatedArticles?: NewsArticle[];
  onOpenAIChat?: () => void;
}

export const InAppArticleReader: React.FC<InAppArticleReaderProps> = ({
  article,
  onClose,
  onSelectRelatedArticle,
  relatedArticles = [],
  onOpenAIChat,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'base' | 'lg'>('base');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [bookmarked, setBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (article) {
      setBookmarked(isBookmarked(article.id));
      setIsPlayingAudio(false);
      NewsSpeechReader.stop();
      incrementReadCount();
    }
    return () => {
      NewsSpeechReader.stop();
    };
  }, [article]);

  if (!article) return null;

  const currentTitle = language === 'en' && article.titleEn ? article.titleEn : article.title;
  const currentSummary = language === 'en' && article.summaryEn ? article.summaryEn : article.summary;
  const currentContent = language === 'en' && article.fullContentEn ? article.fullContentEn : article.fullContent;

  const toggleSpeech = () => {
    if (isPlayingAudio) {
      NewsSpeechReader.stop();
      setIsPlayingAudio(false);
    } else {
      const fullTextToRead = `${currentTitle}. ${currentSummary}. ${currentContent.join('. ')}`;
      NewsSpeechReader.speak(
        fullTextToRead,
        language === 'en' ? 'en-US' : 'id-ID',
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(article.id);
      setBookmarked(false);
    } else {
      saveBookmark(article);
      setBookmarked(true);
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTitle,
          text: currentSummary,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(`${currentTitle} - Baca di Globe Berita Mobile`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSizeLevel) {
      case 'sm':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-lg leading-loose';
      case 'base':
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050814] text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Top Mobile App Bar */}
      <header className="flex-none px-4 py-3 bg-[#0a1026]/90 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between gap-3 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-semibold active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4 text-cyan-400" />
          <span>Kembali</span>
        </button>

        {/* Reader action toolbar */}
        <div className="flex items-center gap-1.5">
          {/* AI Discuss Button */}
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              title="Diskusikan Berita Ini dengan Analis Gemini AI"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-500/30 active:scale-95 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Tanya Gemini</span>
              <span className="sm:hidden text-[10px]">AI</span>
            </button>
          )}

          {/* Audio reader button */}
          <button
            onClick={toggleSpeech}
            title={isPlayingAudio ? 'Hentikan Audio' : 'Dengarkan Berita (TTS)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
              isPlayingAudio
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Jeda Audio' : 'Dengar'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage((l) => (l === 'id' ? 'en' : 'id'))}
            title="Ganti Bahasa (ID / EN)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-xs font-bold active:scale-95 transition"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Font Size Adjuster */}
          <button
            onClick={() => {
              setFontSizeLevel((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'));
            }}
            title="Ubah Ukuran Teks"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 active:scale-95 transition"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            title={bookmarked ? 'Hapus Simpanan' : 'Simpan Berita'}
            className={`p-2 rounded-xl border transition active:scale-95 ${
              bookmarked
                ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
            }`}
          >
            {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            title="Bagikan Berita"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 active:scale-95 transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 active:scale-95 transition ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Article Content (Native In-App View) */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full pb-[calc(env(safe-area-inset-bottom,0px)+32px)]">
        {/* Category & Metadata Header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
            {article.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-slate-500" />
            {article.publishedAt}
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs font-semibold text-cyan-400">{article.source}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400">{article.readTimeMinutes} mnt baca</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4 leading-snug">
          {currentTitle}
        </h1>

        {/* In-App Direct Reader Badge */}
        <div className="mb-5 flex items-center justify-between p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="font-semibold">Mode Pembaca Berita Lengkap</span>
          </div>
          <span className="text-[11px] text-cyan-400/80">Dibaca langsung di dalam portal</span>
        </div>

        {/* Hero Image */}
        {article.imageUrl && (
          <div className="relative mb-6 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
            <img
              src={article.imageUrl}
              alt={currentTitle}
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
            {article.author && (
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] text-slate-300">
                Oleh: {article.author}
              </div>
            )}
          </div>
        )}

        {/* Key Takeaways Card */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-md">
            <div className="flex items-center gap-2 mb-2.5 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Poin Kunci Berita</span>
            </div>
            <ul className="space-y-2">
              {article.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-none" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lead summary */}
        <p className="text-base sm:text-lg font-medium text-slate-200 mb-6 italic border-l-2 border-orange-500 pl-3 py-0.5">
          {currentSummary}
        </p>

        {/* Full Article Body Paragraphs */}
        <div className={`space-y-4 text-slate-300 ${getFontSizeClass()}`}>
          {currentContent.map((paragraph, index) => (
            <p key={index} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Audio Reading Bottom Strip */}
        <div className="mt-8 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Audio Narasi Berita</p>
              <p className="text-[11px] text-slate-400">
                {isPlayingAudio ? 'Sedang memutar audio...' : 'Dengarkan teks berita ini dibacakan'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSpeech}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              isPlayingAudio
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
          >
            {isPlayingAudio ? 'Berhenti' : 'Putar Audio'}
          </button>
        </div>

        {/* Link to Original Article */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Sumber Berita Resmi:</span>
              <span className="text-cyan-400 font-bold">{article.source}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Aplikasi menampilkan berita langsung di sini. Anda juga dapat membuka halaman publikasi asli.
            </p>
          </div>
          {article.originalUrl && (
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold shrink-0 transition-colors"
            >
              <span>Buka Sumber Asli</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-800/80">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span>Berita Terkait {article.countryName}</span>
            </h3>
            <div className="grid gap-3">
              {relatedArticles
                .filter((r) => r.id !== article.id)
                .slice(0, 3)
                .map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (onSelectRelatedArticle) onSelectRelatedArticle(rel);
                    }}
                    className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer active:scale-98 transition flex gap-3 items-center"
                  >
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="w-16 h-16 rounded-xl object-cover flex-none bg-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 line-clamp-2">{rel.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="text-cyan-400 font-medium">{rel.source}</span>
                        <span>•</span>
                        <span>{rel.publishedAt}</span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
