import React from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Zap,
  Globe2,
  WifiOff,
  ShieldCheck,
  Share,
  PlusSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface APKInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKInstallModal: React.FC<APKInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#090f24] border border-cyan-500/30 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Instalasi Mobile APK / WebAPK
              </h3>
              <p className="text-[11px] text-cyan-400 font-medium">Globe Berita Dunia Standalone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 leading-relaxed">
            <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Keunggulan Versi APK Mobile:
            </p>
            <p className="text-[11px] text-cyan-200/90">
              Menampilkan berita lengkap <strong>langsung di dalam aplikasi</strong> tanpa membuka tab browser eksternal. Berjalan mandiri layaknya aplikasi Android / iOS native.
            </p>
          </div>

          {/* Benefits list */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-none" />
              <div>
                <p className="font-bold text-white text-xs">In-App Native Reader</p>
                <p className="text-[11px] text-slate-400">
                  Baca artikel berita, dengarkan narasi audio (TTS), dan ubah ukuran teks langsung di aplikasi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <WifiOff className="w-4 h-4 text-cyan-400 mt-0.5 flex-none" />
              <div>
                <p className="font-bold text-white text-xs">Dukungan Baca Offline</p>
                <p className="text-[11px] text-slate-400">
                  Semua artikel yang disimpan dapat dibaca kapan saja tanpa memerlukan koneksi internet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <Globe2 className="w-4 h-4 text-orange-400 mt-0.5 flex-none" />
              <div>
                <p className="font-bold text-white text-xs">Akselerasi 3D Globe Ringan</p>
                <p className="text-[11px] text-slate-400">
                  Visualisasi bola dunia 3D dioptimalkan untuk perangkat mobile dengan konsumsi memori rendah.
                </p>
              </div>
            </div>
          </div>

          {/* Install Action Area */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
              <p className="font-bold text-white text-sm">Aplikasi Sudah Terpasang!</p>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                Anda sudah menjalankan versi APK / Standalone dari Globe Berita Dunia.
              </p>
            </div>
          ) : isInstallable ? (
            <div className="pt-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Pasang Aplikasi Sekarang (WebAPK)</span>
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-2">
                Otomatis mengunduh & memasang icon di layar beranda Android/Desktop Anda.
              </p>
            </div>
          ) : isIOS ? (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="font-bold text-white text-xs">Cara Pasang di iPhone / iPad (Safari):</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-cyan-400 inline" />
                  <span>
                    Tekan tombol <strong>Bagikan (Share)</strong> di bar bawah Safari.
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  <PlusSquare className="w-3.5 h-3.5 text-orange-400 inline" />
                  <span>
                    Pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                  </span>
                </li>
                <li>Buka aplikasi langsung dari icon di layar utama!</li>
              </ol>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="font-bold text-white text-xs">Pemasangan Android / Chrome:</p>
              <p className="text-[11px] text-slate-300 leading-normal">
                Buka menu titik tiga (⋮) di peramban Chrome Anda pada perangkat Android, lalu ketuk{' '}
                <span className="font-bold text-cyan-300">"Pasang aplikasi"</span> atau{' '}
                <span className="font-bold text-cyan-300">"Tambahkan ke layar utama"</span>.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
