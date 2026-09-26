import { NewsArticle, AppNotification } from '../types';
import { saveNotification } from '../utils/storage';

type NotificationTapHandler = (articleId: string) => void;

class NotificationService {
  private tapHandlers: Set<NotificationTapHandler> = new Set();
  private inAppAlertListeners: Set<(notif: AppNotification) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen for message from service worker if tapped
      navigator.serviceWorker?.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK' && event.data?.articleId) {
          this.emitTap(event.data.articleId);
        }
      });
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return 'denied';
    }
  }

  public onNotificationTap(handler: NotificationTapHandler): () => void {
    this.tapHandlers.add(handler);
    return () => {
      this.tapHandlers.delete(handler);
    };
  }

  public onInAppAlert(listener: (notif: AppNotification) => void): () => void {
    this.inAppAlertListeners.add(listener);
    return () => {
      this.inAppAlertListeners.delete(listener);
    };
  }

  public emitTap(articleId: string): void {
    this.tapHandlers.forEach((handler) => {
      try {
        handler(articleId);
      } catch (err) {
        console.error('Error in notification tap handler:', err);
      }
    });
  }

  // Play subtle chime sound using Web Audio API
  private playChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio autoplay restrictions
    }
  }

  // Send a breaking news notification
  public sendArticleNotification(article: NewsArticle, urgency: 'breaking' | 'high' | 'normal' = 'breaking'): AppNotification {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: urgency === 'breaking' ? `🚨 BREAKING: ${article.countryName}` : `📢 ${article.countryName}`,
      summary: article.title,
      timestamp: 'Baru saja',
      category: article.category,
      countryName: article.countryName,
      countryCode: article.countryCode,
      articleId: article.id,
      isRead: false,
      urgency
    };

    // Save to persistent storage
    saveNotification(notif);

    // Audio chime & haptic vibration
    this.playChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // Ignore
      }
    }

    // Trigger In-App visual banner
    this.inAppAlertListeners.forEach((listener) => {
      try {
        listener(notif);
      } catch (err) {
        console.error('Error invoking in-app notification listener:', err);
      }
    });

    // If browser permission is granted, display OS-level push notification
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const sysNotif = new Notification(notif.title, {
          body: notif.summary,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: notif.id
        });

        sysNotif.onclick = () => {
          window.focus();
          this.emitTap(notif.articleId);
          sysNotif.close();
        };
      } catch (err) {
        console.warn('System notification error:', err);
      }
    }

    return notif;
  }
}

export const notificationService = new NotificationService();
