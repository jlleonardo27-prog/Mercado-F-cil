import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  X,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getReferralStats, getReferralUrl } from '../services/referralService';

interface ReferralModalProps {
  onClose?: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
  const { currentAccount, setSubView, showToast, t } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = currentAccount?.referralCode || 'MF-NOVO';
  const referralUrl = getReferralUrl(referralCode);
  const stats = getReferralStats(referralCode);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setSubView('none');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      showToast(t('copied'));
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      showToast('Código: ' + referralCode);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      showToast(t('copied'));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast('Link: ' + referralUrl);
    }
  };

  const handleShare = () => {
    const shareText = `${t('welcome_title')} - ${t('welcome_subtitle')} ${t('reg_referral_label')}: ${referralCode}\n${referralUrl}`;
    if (navigator.share) {
      navigator
        .share({
          title: t('referral_modal_title'),
          text: shareText,
          url: referralUrl
        })
        .catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display">
                {t('referral_modal_title')}
              </h2>
              <p className="text-xs text-amber-400 font-bold">
                {t('referral_modal_subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            {t('invite_friends_desc')}
          </p>

          {/* Referral Code Box */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 text-center space-y-3 shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              {t('referral_code_title')}
            </span>
            <div className="text-2xl font-black text-amber-400 tracking-wider font-mono bg-slate-900/90 py-2.5 px-4 rounded-xl border border-slate-800 inline-block">
              {referralCode}
            </div>
            <div className="flex items-center justify-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? t('copied') : t('referral_copy_btn')}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? t('copied') : t('copy')} Link</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t('referral_share_btn')}</span>
              </button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 font-bold block">{t('referral_invited_count')}</span>
              <span className="text-xl font-black text-white font-display mt-0.5 block">
                {stats.totalInvited}
              </span>
            </div>
            <div className="bg-slate-950/70 border border-amber-500/20 bg-amber-500/5 rounded-2xl p-3">
              <span className="text-[10px] text-amber-300 font-bold block">{t('referral_days_earned')}</span>
              <span className="text-xl font-black text-amber-400 font-display mt-0.5 block">
                +{stats.daysEarned} {t('days_plural')}
              </span>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 text-[11px] text-slate-400 space-y-2">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('referral_modal_title')}</span>
            </span>
            <p className="text-slate-400">
              {t('referral_modal_subtitle')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
