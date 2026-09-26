import React, { useState, useEffect } from 'react';
import { AppNotification, NewsArticle } from '../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications
} from '../utils/storage';
import { notificationService } from '../services/notificationService';
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArticle: (articleId: string) => void;
  availableArticles: NewsArticle[];
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenArticle,
  availableArticles
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isOpen) {
      setNotifications(getNotifications());
      setPermission(notificationService.getPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
  };

  const handleTestNotification = () => {
    const target =
      availableArticles[Math.floor(Math.random() * availableArticles.length)] || availableArticles[0];
    if (target) {
      notificationService.sendArticleNotification(target, 'breaking');
      setTimeout(() => {
        setNotifications(getNotifications());
      }, 100);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    setNotifications(getNotifications());
  };

  const handleClear = () => {
    clearNotifications();
    setNotifications([]);
  };

  const handleItemClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setNotifications(getNotifications());
    onOpenArticle(notif.articleId);
    onClose();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-center-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notif-center-title" className="text-base font-bold text-white flex items-center gap-2">
                Pusat Pemberitahuan
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-slate-950 font-bold">
                    {unreadCount} baru
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Peringatan berita breaking dan topik pilihan Anda</p>
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

        {/* System Permission Bar */}
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Notifikasi perangkat aktif</span>
              </>
            ) : permission === 'denied' ? (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-slate-300">Izin dinonaktifkan di browser</span>
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-300">Aktifkan push alert untuk HP / APK</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {permission !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
              >
                Izinkan
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                title="Kirim contoh notifikasi langsung"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tes Notifikasi</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="px-5 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Riwayat ({notifications.length})</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai dibaca</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            </div>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-800/50">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">Belum ada notifikasi baru</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Anda akan menerima peringatan otomatis saat berita breaking dunia terbit atau topik favorit Anda diperbarui.
              </p>
              <button
                type="button"
                onClick={handleTestNotification}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kirim Notifikasi Uji Coba Sekarang</span>
              </button>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`pt-2.5 first:pt-0 p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-800/70 border ${
                  notif.isRead
                    ? 'border-transparent text-slate-400'
                    : 'bg-slate-800/40 border-cyan-500/20 text-slate-200'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    notif.isRead ? 'bg-slate-700' : 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]'
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="font-semibold text-cyan-400 truncate">{notif.title}</span>
                    <span className="text-slate-500 text-[11px] shrink-0">{notif.timestamp}</span>
                  </div>

                  <p className="text-xs font-medium leading-relaxed line-clamp-2 text-slate-200">
                    {notif.summary}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span>{notif.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{notif.countryName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-cyan-400 font-medium inline-flex items-center gap-0.5 hover:underline">
                      Buka berita <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Notifikasi dikirim langsung ke perangkat Anda</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
