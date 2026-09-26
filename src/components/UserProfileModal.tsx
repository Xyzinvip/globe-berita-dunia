import React, { useState } from 'react';
import { UserProfile, NewsCategory } from '../types';
import {
  ALL_CATEGORIES,
  POPULAR_SOURCES,
  AVATAR_OPTIONS,
  DEFAULT_TOPICS,
  saveUserProfile
} from '../utils/storage';
import {
  User,
  X,
  Check,
  Plus,
  SlidersHorizontal,
  Flame,
  Bookmark,
  BookOpen,
  Bell,
  Key,
  Globe2,
  Sparkles,
  Info
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [newTopicInput, setNewTopicInput] = useState('');
  const [activeTab, setActiveTab] = useState<'preferences' | 'topics' | 'sources' | 'api'>('preferences');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleCategory = (cat: NewsCategory) => {
    setFormData((prev) => {
      const exists = prev.selectedCategories.includes(cat);
      const next = exists
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      // Ensure at least one category is selected
      return { ...prev, selectedCategories: next.length > 0 ? next : [cat] };
    });
  };

  const handleToggleSource = (source: string) => {
    setFormData((prev) => {
      const exists = prev.preferredSources.includes(source);
      const next = exists
        ? prev.preferredSources.filter((s) => s !== source)
        : [...prev.preferredSources, source];
      return { ...prev, preferredSources: next.length > 0 ? next : [source] };
    });
  };

  const handleAddTopic = () => {
    const trimmed = newTopicInput.trim();
    if (!trimmed) return;
    if (!formData.followedTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        followedTopics: [...prev.followedTopics, trimmed]
      }));
    }
    setNewTopicInput('');
  };

  const handleRemoveTopic = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      followedTopics: prev.followedTopics.filter((t) => t !== topic)
    }));
  };

  const applyPreset = (preset: 'investor' | 'geopolitik' | 'tech' | 'all') => {
    if (preset === 'investor') {
      setFormData((prev) => ({
        ...prev,
        selectedCategories: ['Ekonomi', 'Teknologi', 'Energi'],
        followedTopics: ['Suku Bunga & Inflasi', 'IHSG & Wall Street', 'Transisi Energi Bersih'],
        preferredSources: ['Bloomberg', 'Reuters', 'Financial Times', 'CNBC']
      }));
    } else if (preset === 'geopolitik') {
      setFormData((prev) => ({
        ...prev,
        selectedCategories: ['Politik', 'Pertahanan', 'Dunia'],
        followedTopics: ['KTT Internasional', 'Diplomasi Asia-Pasifik', 'Perdagangan Bebas'],
        preferredSources: ['Reuters', 'BBC News', 'Antara', 'Al Jazeera']
      }));
    } else if (preset === 'tech') {
      setFormData((prev) => ({
        ...prev,
        selectedCategories: ['Teknologi', 'Sains', 'Ekonomi'],
        followedTopics: ['Semikonduktor & AI', 'Mobil Listrik & Baterai', 'Eksplorasi Antariksa'],
        preferredSources: ['The Verge', 'Bloomberg', 'Reuters', 'Nikkei Asia']
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedCategories: [...ALL_CATEGORIES],
        followedTopics: [...DEFAULT_TOPICS],
        preferredSources: [...POPULAR_SOURCES.slice(0, 6)]
      }));
    }
  };

  const handleSave = () => {
    saveUserProfile(formData);
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl">
              {formData.avatar || '🌐'}
            </div>
            <div>
              <h3 id="profile-modal-title" className="text-base font-bold text-white">
                Profil & Personalisasi Berita
              </h3>
              <p className="text-xs text-slate-400">Atur kategori, topik favorit, dan sumber berita pilihan</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Stats Card */}
        <div className="px-5 py-3.5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>
                <strong className="text-white">{formData.readArticlesCount || 0}</strong> Dibaca
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Bookmark className="w-4 h-4 text-orange-400" />
              <span>
                <strong className="text-white">{formData.savedArticlesCount || 0}</strong> Tersimpan
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>
                <strong className="text-white">Aktif</strong> Pembaca
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, avatar: av.emoji }))}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                  formData.avatar === av.emoji
                    ? 'bg-cyan-500/30 border border-cyan-400 scale-110'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
                title={av.label}
              >
                {av.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'preferences'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Kategori ({formData.selectedCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'topics'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Topik Spesifik ({formData.followedTopics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sources'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Sumber Berita ({formData.preferredSources.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'api'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>News API</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: KATEGORI & PRESET */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nama Panggilan</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama pembaca"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">Preset Profil Cepat</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('investor')}
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-cyan-400">📈 Investor</div>
                    <div className="text-[11px] text-slate-400">Ekonomi & Finansial</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('geopolitik')}
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-orange-400">🏛️ Geopolitik</div>
                    <div className="text-[11px] text-slate-400">Diplomasi & Dunia</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('tech')}
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-emerald-400">⚡ Tech Specialist</div>
                    <div className="text-[11px] text-slate-400">AI & Semikonduktor</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
                  >
                    <div className="text-sm font-bold text-purple-400">🌐 Seluruh Berita</div>
                    <div className="text-[11px] text-slate-400">Semua Kategori</div>
                  </button>
                </div>
              </div>

              {/* Category Toggles */}
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-2">
                  Pilih Kategori Berita Utama
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const isSelected = formData.selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className={`px-3 py-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-200'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification & Display Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Notifikasi Berita Breaking</div>
                      <div className="text-[11px] text-slate-400">Terima peringatan saat ada perkembangan darurat</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notificationsEnabled}
                    onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOPIK SPESIFIK */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Tambahkan Kata Kunci / Topik yang Ingin Anda Pantau
                </span>
                <p className="text-xs text-slate-400 mb-2">
                  Berita yang mengandung topik ini akan otomatis diprioritaskan di tab "Untuk Anda".
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    placeholder="Contoh: Semikonduktor, KTT G20, Mobil Listrik..."
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Active Topics */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Topik yang Sedang Diikuti ({formData.followedTopics.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.followedTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-cyan-500/40 text-cyan-200 text-xs font-medium"
                    >
                      <span>{topic}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
                        aria-label={`Hapus ${topic}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Saran Topik Populer:</span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_TOPICS.filter((t) => !formData.followedTopics.includes(t)).map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          followedTopics: [...prev.followedTopics, topic]
                        }))
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-cyan-400" />
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUMBER BERITA */}
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1">
                  Pilih Saluran & Kantor Berita Terpercaya
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  Artikel dari sumber terpilih akan didahulukan di linimasa Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POPULAR_SOURCES.map((source) => {
                    const isSelected = formData.preferredSources.includes(source);
                    return (
                      <button
                        key={source}
                        type="button"
                        onClick={() => handleToggleSource(source)}
                        className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-200'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{source}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API CONFIG */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Penyedia Berita Terintegrasi:</strong> Secara default, aplikasi menggunakan agregasi langsung RSS Google News global tanpa memerlukan API Key tambahan. Anda juga dapat menghubungkan kunci resmi <strong>GNews.io</strong> atau <strong>NewsAPI.org</strong> jika memiliki akun pengembang.
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Penyedia Berita (Provider)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', 'gnews', 'newsapi'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setFormData({ ...formData, apiProvider: prov })}
                      className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                        formData.apiProvider === prov
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {prov === 'auto' ? 'Auto (RSS)' : prov === 'gnews' ? 'GNews.io' : 'NewsAPI.org'}
                    </button>
                  ))}
                </div>
              </div>

              {formData.apiProvider !== 'auto' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Kunci API Kustom ({formData.apiProvider === 'gnews' ? 'GNews' : 'NewsAPI'})
                  </label>
                  <input
                    type="password"
                    value={formData.customApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, customApiKey: e.target.value })}
                    placeholder={`Masukkan API key ${formData.apiProvider}...`}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Kunci disimpan secara aman di penyimpanan lokal peramban Anda.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Preferensi berhasil disimpan!
              </span>
            ) : (
              <span>Preferensi langsung diterapkan ke linimasa Anda</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Preferensi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
