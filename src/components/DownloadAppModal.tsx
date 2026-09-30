import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Globe,
  Download,
  CheckCircle2,
  Share2,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DownloadAppModal: React.FC = () => {
  const { setSubView, showToast, t } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Read configurable APK download URL if set by administrator / cloud host
  const apkUrl = (import.meta as any).env?.VITE_ANDROID_APK_URL;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast(t('saved'));
        setDeferredPrompt(null);
      }
    } else {
      showToast(t('pwa_manual_prompt'));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-display">
              {t('download_app_title')}
            </h2>
            <p className="text-[11px] text-slate-400">
              {t('download_app_subtitle')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSubView('none')}
          className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Official App Logo Showcase */}
      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/25 text-center shadow-xl">
        <div className="relative w-28 h-28 mb-3 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-2xl shadow-amber-500/25">
          <img
            src="/logo.png"
            alt="Logo Oficial Mercado Fácil"
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h3 className="text-lg font-black text-white font-display tracking-tight">
          {t('app_name')}
        </h3>
        <p className="text-xs text-amber-400 font-bold">
          {t('app_tagline')}
        </p>
        <span className="mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {t('official_app_icon')}
        </span>
      </div>

      {/* Comparison: Usar no Navegador vs Baixar Aplicativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Usar no Navegador */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-sky-400">
            <Globe className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              {t('use_in_browser_title')}
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            {t('use_in_browser_desc')}
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1">
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('browser_no_storage')}</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('browser_auto_update')}</span>
            </li>
          </ul>
        </div>

        {/* Baixar Aplicativo Android */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Smartphone className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              {t('app_on_phone_title')}
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            {t('app_on_phone_desc')}
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1">
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('app_fullscreen_native')}</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('app_sync_data')}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Direct PWA Install */}
        <button
          type="button"
          onClick={handleInstallPWA}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t('btn_install_app_phone')}</span>
        </button>

        {/* Real APK Download (if link configured or explanation) */}
        {apkUrl ? (
          <a
            href={apkUrl}
            download="MercadoFacil.apk"
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{t('download_apk_file')}</span>
          </a>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('native_apk_info_title')}</span>
            </div>
            <p>
              {t('native_apk_info_desc')}
            </p>
          </div>
        )}
      </div>

      {/* How to add to home screen manually */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        <p className="font-bold text-slate-300">{t('how_to_install_manually')}:</p>
        <p>• <strong>Android (Chrome):</strong> {t('install_step_android')}</p>
        <p>• <strong>iPhone (Safari):</strong> {t('install_step_ios')}</p>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setSubView('none')}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};
