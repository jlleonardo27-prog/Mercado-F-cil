import React, { useState } from 'react';
import {
  Store,
  Users,
  Clock,
  Receipt,
  Moon,
  Sun,
  Download,
  LogOut,
  ChevronRight,
  Copy,
  Gift,
  Lock,
  CreditCard,
  User,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPlanName } from '../services/plansService';
import { AccountInfoModal } from './AccountInfoModal';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../services/i18n';

export const MoreMenuScreen: React.FC = () => {
  const {
    currentAccount,
    business,
    theme,
    toggleTheme,
    setSubView,
    logout,
    updateBusiness,
    showToast,
    accessStatus,
    daysRemaining,
    planType,
    expiryDateDisplay,
    openBuyPlanModal,
    openReferralModal,
    openAdminModal,
    language,
    setLanguage,
    t
  } = useApp();

  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [bizName, setBizName] = useState(business?.name || '');
  const [bizPhone, setBizPhone] = useState(business?.phone || '');
  const [bizCurrency, setBizCurrency] = useState(business?.currency || 'MT');

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !bizName.trim()) return;

    updateBusiness({
      ...business,
      name: bizName.trim(),
      phone: bizPhone.trim(),
      currency: bizCurrency.trim() || 'MT'
    });
    setIsEditingBusiness(false);
  };

  const copyCode = () => {
    if (business?.code) {
      navigator.clipboard?.writeText(business.code);
      showToast(`${t('team_code_label')} ${business.code} ${t('copied')}`);
    }
  };

  // Export data as JSON
  const handleExportBackup = () => {
    if (!business) return;
    const backupData = {
      business,
      exportedAt: new Date().toISOString(),
      localStorageDump: { ...localStorage }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MercadoFacil_${business.name.replace(/\s+/g, '_')}_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t('saved'));
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white font-display">
          {t('menu_title')}
        </h2>
        <p className="text-xs text-slate-400">
          {t('menu_subtitle')}
        </p>
      </div>

      {/* License Status Pill */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-500/40 shadow-lg bg-slate-950 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo Mercado Fácil"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black text-white">{t('app_name')}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  accessStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : accessStatus === 'TRIAL'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {accessStatus === 'TRIAL' ? t('plan_status_trial') : accessStatus === 'ACTIVE' ? t('plan_status_active') : t('plan_status_expired')}
              </span>
            </div>
            <p className="text-[11px] text-amber-400 font-bold mt-0.5">
              {getPlanName(planType)} • {daysRemaining > 0 ? `${daysRemaining} ${t('days_plural')}` : t('plan_status_expired')}
            </p>
            <p className="text-[10px] text-slate-400">
              {t('expires_in')}: {expiryDateDisplay}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openBuyPlanModal}
          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
        >
          {t('menu_plans')}
        </button>
      </div>

      {/* Business Details Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('market_details_card')}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingBusiness(!isEditingBusiness)}
            className="text-xs text-emerald-400 hover:underline font-bold cursor-pointer"
          >
            {isEditingBusiness ? t('btn_close_edit') : t('btn_edit')}
          </button>
        </div>

        {isEditingBusiness ? (
          <form onSubmit={handleSaveBusiness} className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block font-bold">{t('market_name')}</label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block font-bold">{t('market_phone')}</label>
                <input
                  type="text"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block font-bold">{t('market_currency')}</label>
                <input
                  type="text"
                  value={bizCurrency}
                  onChange={(e) => setBizCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              {t('save')}
            </button>
          </form>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">{t('market_name')}:</span>
              <span className="font-bold text-white">{business?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">{t('owner_name_label')}:</span>
              <span className="font-bold text-white">{business?.ownerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">{t('team_code_label')}:</span>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-black text-cyan-400">{business?.code}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">{t('market_currency')}:</span>
              <span className="font-bold text-emerald-400">{business?.currency}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Sub-pages */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3 space-y-1">
        {/* MINHA CONTA & ID ÚNICO */}
        <button
          type="button"
          id="btn-more-account-info"
          onClick={() => setShowAccountInfoModal(true)}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{t('menu_my_account')}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {currentAccount?.accountCode || 'MF-CONTA'}
                </span>
              </p>
              <p className="text-[10px] text-slate-400">{t('menu_my_account_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* MEU ACESSO E PLANOS */}
        <button
          type="button"
          id="btn-more-plans"
          onClick={openBuyPlanModal}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_plans')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_plans_desc')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {daysRemaining > 0 ? `${daysRemaining}d` : t('plan_status_expired')}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </button>

        {/* CONVIDAR AMIGOS */}
        <button
          type="button"
          id="btn-more-referral"
          onClick={openReferralModal}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_referral')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_referral_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* VENDEDORES */}
        <button
          type="button"
          onClick={() => setSubView('vendedores')}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_sellers')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_sellers_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* DESPESAS */}
        <button
          type="button"
          onClick={() => setSubView('despesas')}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_expenses')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_expenses_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* HISTÓRICO */}
        <button
          type="button"
          onClick={() => setSubView('historico')}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_history')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_history_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* System Preferences */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3 space-y-1">
        {/* BAIXAR APLICATIVO */}
        <button
          type="button"
          id="btn-more-download-app"
          onClick={() => setSubView('baixar_app')}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_download_app')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_download_app_desc')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* IDIOMA DO APLICATIVO (Reactive selection) */}
        <div className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between transition">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_app_language')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_app_language_desc')}</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-bold cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* THEME TOGGLE */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {theme === 'dark' ? t('menu_theme_dark') : t('menu_theme_light')}
              </p>
              <p className="text-[10px] text-slate-400">
                {t('menu_theme_change')}
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold">{t('btn_edit')}</span>
        </button>

        {/* EXPORT BACKUP */}
        <button
          type="button"
          onClick={handleExportBackup}
          className="w-full p-3 rounded-2xl hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Download className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t('menu_backup')}</p>
              <p className="text-[10px] text-slate-400">{t('menu_backup_desc')}</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold">{t('menu_backup_btn')}</span>
        </button>

        {/* PAINEL DE ADMINISTRAÇÃO */}
        <button
          type="button"
          id="btn-more-admin-panel"
          onClick={openAdminModal}
          className="w-full p-3 rounded-2xl hover:bg-slate-800/80 flex items-center justify-between text-left transition cursor-pointer opacity-70 hover:opacity-100"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">{t('menu_admin_panel')}</p>
              <p className="text-[10px] text-slate-500">{t('menu_admin_panel_desc')}</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{t('menu_admin_badge')}</span>
        </button>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-black text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>{t('btn_logout')}</span>
      </button>

      <footer className="text-center pt-2 text-slate-600 text-[11px] space-y-0.5">
        <p>{t('app_name')} • {business?.name || 'Mercado'}</p>
        <p className="text-[10px] text-slate-500">{t('support_phone')}</p>
      </footer>

      {/* Modal Minha Conta / Informações da Conta */}
      <AccountInfoModal
        isOpen={showAccountInfoModal}
        onClose={() => setShowAccountInfoModal(false)}
      />
    </div>
  );
};
