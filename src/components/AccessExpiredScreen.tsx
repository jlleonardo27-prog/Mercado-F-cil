import React, { useState } from 'react';
import {
  Lock,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  LogOut,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlansModal } from './PlansModal';
import { openGeneralWhatsApp } from '../services/plansService';
import { LanguageSelector } from './LanguageSelector';

export const AccessExpiredScreen: React.FC = () => {
  const { currentAccount, business, logout, accessStatus, isOwner, t } = useApp();
  const [showPlansModal, setShowPlansModal] = useState(false);

  const isBlocked = accessStatus === 'BLOCKED';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100 p-4 max-w-md mx-auto animate-in fade-in">
      <div className="w-full flex justify-end mb-3">
        <LanguageSelector compact={true} />
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl space-y-6">
        {/* Icon Badge */}
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-2xl ${
          isBlocked
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/10'
        }`}>
          {isBlocked ? <ShieldAlert className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
        </div>

        {/* Title & Description */}
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            {business?.name || t('app_name')}
          </span>
          <h1 className="text-2xl font-black text-white font-display">
            {isBlocked ? t('plan_status_blocked') : t('plan_status_expired')}
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {isBlocked
              ? t('account_blocked_msg')
              : t('account_expired_msg')}
          </p>
        </div>

        {/* Safe Data Guarantee Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-left flex items-start space-x-3">
          <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-snug">
            <strong className="text-slate-200 block font-bold">{t('data_safe_title')}</strong>
            {t('data_safe_desc')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {isOwner ? (
            <button
              type="button"
              onClick={() => setShowPlansModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('buy_access')}</span>
            </button>
          ) : (
            <div className="p-3 bg-slate-950 rounded-xl text-xs text-amber-300/90 font-medium">
              {t('seller_expired_notice')}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              openGeneralWhatsApp(
                `Reativação de Acesso - ${business?.name || currentAccount?.name || 'Mercado'}`
              )
            }
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 border border-slate-700"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>{t('support_whatsapp')}</span>
          </button>
        </div>

        {/* Logout */}
        <div className="pt-2 border-t border-slate-800/60">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('btn_logout')}</span>
          </button>
        </div>
      </div>

      {showPlansModal && <PlansModal onClose={() => setShowPlansModal(false)} />}
    </div>
  );
};
