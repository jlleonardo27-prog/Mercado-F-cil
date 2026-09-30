import React, { useState, useEffect } from 'react';
import {
  Store,
  UserCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  Lock,
  Mail,
  User,
  CreditCard,
  Gift,
  CheckCircle2,
  ChevronLeft,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storage';
import { PlansModal } from './PlansModal';
import { AdminPanelModal } from './AdminPanelModal';
import { LanguageSelector } from './LanguageSelector';
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_LANGUAGES,
  CountryInfo,
  SupportedLanguage
} from '../services/i18n';
import { WHATSAPP_NUMBER } from '../services/plansService';

type AuthViewMode = 'landing' | 'login' | 'register' | 'recover';
type AuthRoleMode = 'PROPRIETARIO' | 'VENDEDOR';

export const AuthScreen: React.FC = () => {
  const {
    registerOwner,
    loginOwner,
    loginSeller,
    recoverAccountWithCode,
    language,
    setLanguage,
    t
  } = useApp();

  // Screen flow: landing (first screen) or auth forms
  const [viewMode, setViewMode] = useState<AuthViewMode>('landing');
  const [roleMode, setRoleMode] = useState<AuthRoleMode>('PROPRIETARIO');

  // Modals
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Country, Currency, and Language Configuration
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(SUPPORTED_COUNTRIES[0]); // Default MZ
  const [currencyCode, setCurrencyCode] = useState<string>(SUPPORTED_COUNTRIES[0].currencyCode);
  const [accountLanguage, setAccountLanguage] = useState<SupportedLanguage>(language);

  // Keep accountLanguage in sync with global language
  useEffect(() => {
    setAccountLanguage(language);
  }, [language]);

  // Owner registration state
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPass, setOwnerPass] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Login state (accepts Email or Account ID MF-XXXXX)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Recovery state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPass, setRecoveryNewPass] = useState('');

  // Seller state
  const [marketCode, setMarketCode] = useState('MF-4821');
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [sellerPin, setSellerPin] = useState('');
  const [sellerList, setSellerList] = useState<{ id: string; name: string }[]>([]);
  const [sellerSearchDone, setSellerSearchDone] = useState(false);

  // Common feedback error/success state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Read ?ref= code from URL on load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setReferralCodeInput(ref.toUpperCase());
        setViewMode('register');
        setRoleMode('PROPRIETARIO');
      }
    } catch {
      // Ignored in non-browser context
    }
  }, []);

  // When country changes, auto-suggest currency and default language
  const handleCountryChange = (cCode: string) => {
    const found = SUPPORTED_COUNTRIES.find((c) => c.code === cCode) || SUPPORTED_COUNTRIES[0];
    setSelectedCountry(found);
    setCurrencyCode(found.currencyCode);
    setAccountLanguage(found.defaultLanguage);
    setLanguage(found.defaultLanguage);
  };

  // Search market sellers when market code is entered
  const handleFetchSellers = () => {
    setErrorMsg(null);
    if (!marketCode.trim()) {
      setErrorMsg(`${t('field_market_code')} (Ex: MF-4821)`);
      return;
    }

    const biz = storageService.getBusinessByCode(marketCode);
    if (!biz) {
      setErrorMsg(t('no_products_found'));
      setSellerList([]);
      setSellerSearchDone(false);
      return;
    }

    const sList = storageService.getSellers(biz.id).filter((s) => s.active);
    if (sList.length === 0) {
      setErrorMsg(`${biz.name}: ${t('sellers_subtitle')}`);
      setSellerList([]);
      setSellerSearchDone(true);
      return;
    }

    setSellerList(sList.map((s) => ({ id: s.id, name: s.name })));
    setSelectedSellerId(sList[0].id);
    setSellerSearchDone(true);
  };

  // Owner Form Submit
  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (viewMode === 'register') {
      const digitsOnly = ownerPhone.replace(/\D/g, '');
      if (digitsOnly.length > 0 && digitsOnly.length < selectedCountry.minPhoneDigits) {
        setErrorMsg(`${t('reg_phone_label')}: ${selectedCountry.name} (${selectedCountry.minPhoneDigits} min)`);
        return;
      }

      const fullPhone = ownerPhone.trim() ? `${selectedCountry.dialCode} ${ownerPhone.trim()}` : '';

      const res = registerOwner(ownerName, ownerEmail, ownerPass, referralCodeInput, {
        businessName: businessName.trim() || `${ownerName.trim().split(' ')[0]} Store`,
        phone: fullPhone,
        country: selectedCountry.code,
        currency: currencyCode,
        language: accountLanguage
      });

      if (!res.success) {
        setErrorMsg(res.error || t('error'));
      }
    } else if (viewMode === 'login') {
      const res = loginOwner(loginIdentifier, loginPass);
      if (!res.success) {
        setErrorMsg(res.error || t('error'));
      }
    }
  };

  // Account Recovery Submit
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recoveryIdentifier.trim() || !recoveryCode.trim() || !recoveryNewPass.trim()) {
      setErrorMsg(t('required_field'));
      return;
    }

    const res = recoverAccountWithCode(recoveryIdentifier, recoveryCode, recoveryNewPass);
    if (!res.success) {
      setErrorMsg(res.error || t('error'));
    } else {
      setSuccessMsg(t('saved'));
    }
  };

  // Seller Form Submit
  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedSellerId) {
      setErrorMsg(t('required_field'));
      return;
    }

    if (!sellerPin || sellerPin.length < 4) {
      setErrorMsg(t('seller_pin'));
      return;
    }

    const res = loginSeller(marketCode, selectedSellerId, sellerPin);
    if (!res.success) {
      setErrorMsg(res.error || t('error'));
    }
  };

  const handleSupportWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Preciso de ajuda para acessar o Mercado Fácil.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 px-4 py-6 max-w-md mx-auto relative animate-in fade-in">
      {/* Top Header with Back button, Language Selector & Discrete Admin Padlock */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-8">
            {viewMode !== 'landing' && (
              <button
                type="button"
                onClick={() => {
                  setViewMode('landing');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
                title={t('back')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Real-time Language Switcher Dropdown */}
            <LanguageSelector compact={true} />

            {/* Discrete Admin Padlock Icon */}
            <button
              type="button"
              id="admin-padlock-trigger"
              onClick={() => setShowAdminModal(true)}
              title={t('admin_panel_title')}
              className="w-8 h-8 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700 flex items-center justify-center cursor-pointer transition"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Brand Logo & Name */}
        <div className="text-center space-y-3">
          <div className="relative w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-amber-600/40 shadow-2xl shadow-amber-500/20">
            <img
              src="/logo.png"
              alt="Logo Mercado Fácil"
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
              {t('welcome_title')}
            </h1>
            <p className="text-xs text-amber-400 font-bold mt-0.5">
              {t('welcome_tagline')}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              {t('welcome_subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* VIEW 1: LANDING SCREEN */}
      {viewMode === 'landing' && (
        <div className="my-6 space-y-5">
          {/* Key Value Propositions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4.5 space-y-2.5 shadow-xl">
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('app_tagline')}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('plan_single_account_notice')}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('plan_single_account_desc')}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('stock_control_subtitle')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            {/* 1. TESTAR GRÁTIS POR 7 DIAS */}
            <button
              type="button"
              id="btn-test-trial-7d"
              onClick={() => {
                setViewMode('register');
                setRoleMode('PROPRIETARIO');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full py-4 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 transition cursor-pointer flex flex-col items-center justify-center space-y-0.5"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>{t('welcome_trial_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-900/80">
                {t('welcome_trial_badge')}
              </span>
            </button>

            {/* 2. COMPRAR ACESSO */}
            <button
              type="button"
              id="btn-open-plans"
              onClick={() => setShowPlansModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-700 active:scale-[0.99] text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>{t('welcome_buy_btn')}</span>
            </button>

            {/* 3. JÁ TENHO UMA CONTA / ENTRAR */}
            <button
              type="button"
              id="btn-login-existing"
              onClick={() => {
                setViewMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{t('welcome_have_account')} • {t('login_owner_title')}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: LOGIN / REGISTER / RECOVERY FORMS */}
      {viewMode !== 'landing' && (
        <div className="my-4 space-y-4">
          {viewMode !== 'recover' && (
            <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex">
              <button
                type="button"
                onClick={() => {
                  setRoleMode('PROPRIETARIO');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  roleMode === 'PROPRIETARIO'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('owner_section')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleMode('VENDEDOR');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  roleMode === 'VENDEDOR'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t('login_seller_title')}</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium animate-in fade-in flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OWNER AUTH CARD */}
          {roleMode === 'PROPRIETARIO' && viewMode !== 'recover' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex border-b border-slate-800 pb-3 justify-around text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMsg(null);
                  }}
                  className={`pb-2 font-black transition cursor-pointer border-b-2 ${
                    viewMode === 'login'
                      ? 'text-amber-400 border-amber-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {t('login_owner_title')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('register');
                    setErrorMsg(null);
                  }}
                  className={`pb-2 font-black transition cursor-pointer border-b-2 ${
                    viewMode === 'register'
                      ? 'text-amber-400 border-amber-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {t('register_owner_title')}
                </button>
              </div>

              {viewMode === 'register' && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center space-x-2 text-xs text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>7 {t('days_plural')} {t('plan_status_trial')}</strong> - {t('welcome_trial_badge')}!
                  </span>
                </div>
              )}

              <form onSubmit={handleOwnerSubmit} className="space-y-3.5">
                {viewMode === 'register' ? (
                  <>
                    {/* Country, Currency and Language Selector */}
                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 space-y-2.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {t('business_country_label')} & {t('business_currency_label')}
                      </label>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold mb-1">{t('reg_country_label')}</span>
                        <select
                          value={selectedCountry.code}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {SUPPORTED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name} ({c.dialCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold mb-1">{t('business_currency_label')}</span>
                          <input
                            type="text"
                            value={currencyCode}
                            onChange={(e) => setCurrencyCode(e.target.value)}
                            placeholder="MZN, BRL, EUR, USD"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold mb-1">{t('business_language_label')}</span>
                          <select
                            value={accountLanguage}
                            onChange={(e) => {
                              const newLang = e.target.value as SupportedLanguage;
                              setAccountLanguage(newLang);
                              setLanguage(newLang);
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {SUPPORTED_LANGUAGES.map((l) => (
                              <option key={l.code} value={l.code}>
                                {l.flag} {l.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Business Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('reg_biz_name_label')}
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder={t('reg_biz_name_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Owner Name */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('reg_owner_name_label')}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder={t('reg_owner_name_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('reg_phone_label')}
                      </label>
                      <div className="flex space-x-2">
                        <div className="px-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs flex items-center space-x-1 shrink-0">
                          <span>{selectedCountry.flag}</span>
                          <span className="font-bold">{selectedCountry.dialCode}</span>
                        </div>
                        <input
                          type="tel"
                          value={ownerPhone}
                          onChange={(e) => setOwnerPhone(e.target.value)}
                          placeholder={selectedCountry.phonePlaceholder}
                          className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('reg_email_label')}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={ownerEmail}
                          onChange={(e) => setOwnerEmail(e.target.value)}
                          placeholder={t('reg_email_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('reg_password_label')}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={ownerPass}
                          onChange={(e) => setOwnerPass(e.target.value)}
                          placeholder={t('reg_password_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('reg_referral_label')}
                      </label>
                      <div className="relative">
                        <Gift className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={referralCodeInput}
                          onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                          placeholder={t('reg_referral_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* LOGIN: Identifier (Email, Account ID) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {t('login_id_or_email')}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder={t('login_id_or_email_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('login_password')}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode('recover');
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                        >
                          {t('btn_forgot_password')}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          placeholder={t('login_password_placeholder')}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  id="btn-submit-owner-auth"
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <span>
                    {viewMode === 'login' ? t('btn_login_owner') : t('btn_finish_registration')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPlansModal(true)}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  {t('menu_plans')}
                </button>
                <span>WhatsApp: 846762812</span>
              </div>
            </div>
          )}

          {/* VIEW: ACCOUNT RECOVERY CARD */}
          {viewMode === 'recover' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white font-display flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>{t('recovery_title')}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t('recovery_subtitle')}
                </p>
              </div>

              <form onSubmit={handleRecoverySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('login_id_or_email')}
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder={t('login_id_or_email_placeholder')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('recovery_code_label')}
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    placeholder={t('recovery_code_placeholder')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('recovery_new_pass_label')}
                  </label>
                  <input
                    type="password"
                    required
                    value={recoveryNewPass}
                    onChange={(e) => setRecoveryNewPass(e.target.value)}
                    placeholder={t('recovery_new_pass_placeholder')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition cursor-pointer"
                >
                  {t('btn_submit_recovery')}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('back')}
                </button>
                <button
                  type="button"
                  onClick={handleSupportWhatsApp}
                  className="text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t('btn_ask_admin_recovery')}</span>
                </button>
              </div>
            </div>
          )}

          {/* SELLER AUTH CARD */}
          {roleMode === 'VENDEDOR' && viewMode !== 'recover' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white font-display">
                  {t('login_seller_title')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('login_seller_subtitle')}
                </p>
              </div>

              <form onSubmit={handleSellerSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('seller_market_code_label')}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={marketCode}
                      onChange={(e) => {
                        setMarketCode(e.target.value.toUpperCase());
                        setSellerSearchDone(false);
                      }}
                      placeholder={t('seller_market_code_placeholder')}
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleFetchSellers}
                      className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      {t('search')}
                    </button>
                  </div>
                </div>

                {sellerSearchDone && sellerList.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {t('seller_name')}
                    </label>
                    <select
                      value={selectedSellerId}
                      onChange={(e) => setSelectedSellerId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {sellerList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('seller_pin_label')}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={sellerPin}
                      onChange={(e) => setSellerPin(e.target.value)}
                      placeholder={t('seller_pin_placeholder')}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-seller-auth"
                  className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <span>{t('btn_login_seller')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pt-3 text-slate-600 text-[11px] space-y-1">
        <p>{t('app_name')} • {t('app_tagline')}</p>
        <p className="text-[10px] text-slate-500">
          {t('support_phone')}
        </p>
      </footer>

      {/* Plan Purchase Modal */}
      {showPlansModal && (
        <PlansModal onClose={() => setShowPlansModal(false)} />
      )}

      {/* Discrete Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanelModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
};
