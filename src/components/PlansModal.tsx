import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANS, openPlanWhatsApp, PAYMENT_DETAILS } from '../services/plansService';
import { PlanType } from '../types';
import { currencyService } from '../services/currencyService';

interface PlansModalProps {
  onClose?: () => void;
  initialMarketName?: string;
  initialEmail?: string;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  onClose,
  initialMarketName,
  initialEmail
}) => {
  const { business, currentAccount, setSubView, t } = useApp();
  const [, setRatesTick] = useState(0);

  // Determine current active account currency
  const targetCurrency = business?.currency || currentAccount?.currency || 'MT';

  useEffect(() => {
    currencyService.refreshRates().then(() => {
      setRatesTick((t) => t + 1);
    });
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setSubView('none');
    }
  };

  const marketName = business?.name || initialMarketName || currentAccount?.name || '';
  const email = currentAccount?.email || initialEmail || '';

  const handleSelectPlan = (planId: PlanType) => {
    openPlanWhatsApp(planId, marketName, email, targetCurrency);
  };

  const sampleConverted = currencyService.convertPlanPrice(149, targetCurrency);

  const getLocalizedPlanTitle = (id: PlanType) => {
    switch (id) {
      case 'SEMANAL': return t('plan_weekly_name');
      case 'MENSAL': return t('plan_monthly_name');
      case 'SEMESTRAL': return t('plan_semiannual_name');
      case 'ANUAL': return t('plan_annual_name');
      default: return t('choose_plan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-display">
                {t('choose_your_plan')}
              </h2>
              <p className="text-xs text-slate-400">
                {sampleConverted.isMzn
                  ? `${t('app_name')} (MZN)`
                  : `${t('exchange_rate_notice')} (${targetCurrency})`}
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

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Slogan Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-amber-500/20 rounded-2xl p-3.5 flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="text-amber-400 font-bold block">{t('plan_single_account_notice')}</span>
              {t('plan_single_account_desc')}
            </div>
          </div>

          {/* Exchange Rate Transparency Notice */}
          {!sampleConverted.isMzn && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-start space-x-2.5 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-white">
                  {t('exchange_rate_notice')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {sampleConverted.lastUpdatedText} • {t('exchange_rate_official_base')}
                </p>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANS.map((plan) => {
              const isHighlight = plan.destaque;
              const converted = currencyService.convertPlanPrice(plan.precoMt, targetCurrency);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-4 border transition flex flex-col justify-between ${
                    isHighlight
                      ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                      {t('most_chosen')}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>{getLocalizedPlanTitle(plan.id)}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {plan.duracaoDias} {t('days_plural')}
                      </span>
                    </div>

                    <div className="mt-3 mb-4">
                      {/* Prominent Local Currency Price */}
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-white font-display tracking-tight">
                          {converted.displayPrice}
                        </span>
                      </div>

                      {/* Base Price Reference in MZN if converted */}
                      {!converted.isMzn ? (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {t('exchange_rate_official_base')}: <strong className="text-slate-300">{plan.precoMt} MT</strong>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {plan.duracaoDias} {t('days_plural')}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-1.5 text-[11px] text-slate-300 mb-4">
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{t('app_tagline')}</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{t('sellers_title')}</span>
                      </li>
                      <li className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{t('profit_report_title')}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md ${
                      isHighlight
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('buy_access')}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payment Info Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('my_access')} • WhatsApp & M-Pesa</span>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  WhatsApp & M-Pesa
                </span>
                <span className="text-base font-black text-emerald-400 tracking-wider">
                  {PAYMENT_DETAILS.numero}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('owner_section')}</span>
                <span className="text-xs font-bold text-slate-200">
                  {PAYMENT_DETAILS.titular}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {t('app_name')}
          </span>
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
