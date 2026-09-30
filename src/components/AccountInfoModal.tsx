import React, { useState } from 'react';
import {
  X,
  User,
  Store,
  ShieldCheck,
  Calendar,
  Globe,
  Phone,
  Mail,
  Copy,
  CheckCircle2,
  Users,
  Clock,
  Gift,
  CreditCard,
  Edit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPlanName } from '../services/plansService';
import { SUPPORTED_COUNTRIES, SUPPORTED_LANGUAGES, SupportedLanguage } from '../services/i18n';

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountInfoModal: React.FC<AccountInfoModalProps> = ({ isOpen, onClose }) => {
  const {
    currentAccount,
    business,
    sellers,
    daysRemaining,
    accessStatus,
    planType,
    expiryDateDisplay,
    updateOwnerAccount,
    updateBusiness,
    openBuyPlanModal,
    showToast,
    language,
    setLanguage,
    t
  } = useApp();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editBusinessName, setEditBusinessName] = useState(business?.name || '');
  const [editOwnerName, setEditOwnerName] = useState(currentAccount?.name || '');
  const [editPhone, setEditPhone] = useState(currentAccount?.phone || business?.phone || '');
  const [editCurrency, setEditCurrency] = useState(business?.currency || currentAccount?.currency || 'MT');
  const [editLanguage, setEditLanguage] = useState<SupportedLanguage>(
    (currentAccount?.language as SupportedLanguage) || language || 'pt'
  );

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    showToast(`${label} ${t('copied')}`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBusinessName.trim() || !editOwnerName.trim()) return;

    if (currentAccount) {
      updateOwnerAccount({
        name: editOwnerName.trim(),
        phone: editPhone.trim(),
        currency: editCurrency.trim(),
        language: editLanguage
      });
    }

    if (business) {
      updateBusiness({
        ...business,
        name: editBusinessName.trim(),
        ownerName: editOwnerName.trim(),
        phone: editPhone.trim(),
        currency: editCurrency.trim()
      });
    }

    setLanguage(editLanguage);
    setIsEditing(false);
  };

  const accountId = currentAccount?.accountCode || `MF-${currentAccount?.id.substring(0, 5).toUpperCase()}`;
  const countryData = SUPPORTED_COUNTRIES.find((c) => c.code === currentAccount?.country) || SUPPORTED_COUNTRIES[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-display uppercase">
                {t('my_account_title')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('account_info_subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* UNIQUE ACCOUNT ID HIGHLIGHT CARD */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                {t('unique_account_id')}
              </span>
              <p className="text-xl sm:text-2xl font-mono font-black text-white tracking-wider">
                {accountId}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('unique_account_id_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(accountId, t('unique_account_id'))}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0"
            >
              {copiedField === t('unique_account_id') ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('copy')}</span>
                </>
              )}
            </button>
          </div>

          {/* Access & Plan Status Summary */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{t('access_section')}</span>
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  accessStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : accessStatus === 'TRIAL'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {accessStatus === 'TRIAL' ? t('plan_status_trial') : accessStatus === 'ACTIVE' ? t('plan_status_active') : t('plan_status_expired')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">{t('plan_type_label')}</span>
                <span className="text-xs font-black text-white block mt-0.5 truncate">
                  {getPlanName(planType)}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">{t('days_remaining')}</span>
                <span className={`text-xs font-black block mt-0.5 ${daysRemaining <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {daysRemaining > 0 ? `${daysRemaining} ${t('days_plural')}` : `0 ${t('days_plural')}`}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">{t('plan_expires_label')}</span>
                <span className="text-xs font-black text-slate-200 block mt-0.5 truncate">
                  {expiryDateDisplay}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">{t('sellers_count_label')}</span>
                <span className="text-xs font-black text-cyan-400 block mt-0.5">
                  {sellers.length}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openBuyPlanModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t('renew_plan')}</span>
              </button>
            </div>
          </div>

          {/* Business & Owner Details */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>{t('business_section')}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-emerald-400 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditing ? t('cancel') : t('edit')}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block font-bold mb-1">
                    {t('business_name_label')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editBusinessName}
                    onChange={(e) => setEditBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block font-bold mb-1">
                    {t('owner_name_label')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block font-bold mb-1">
                      {t('owner_phone_label')}
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block font-bold mb-1">
                      {t('business_currency_label')}
                    </label>
                    <input
                      type="text"
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block font-bold mb-1">
                    {t('business_language_label')}
                  </label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value as SupportedLanguage)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer"
                  >
                    {t('btn_save_account')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('business_name_label')}:</span>
                  <span className="font-bold text-white">{business?.name || '---'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('owner_name_label')}:</span>
                  <span className="font-bold text-white">{currentAccount?.name || '---'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('owner_email_label')}:</span>
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-white">{currentAccount?.email || '---'}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('owner_phone_label')}:</span>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-white">{currentAccount?.phone || business?.phone || '---'}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('business_country_label')}:</span>
                  <span className="font-bold text-white">
                    {countryData.flag} {countryData.name} ({countryData.code})
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('business_currency_label')}:</span>
                  <span className="font-bold text-emerald-400">
                    {business?.currency || currentAccount?.currency || 'MT'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">{t('business_language_label')}:</span>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-bold text-white">
                      {SUPPORTED_LANGUAGES.find((l) => l.code === (currentAccount?.language || language))?.label || 'Português'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Team Code & Referral Code */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{t('team_code_label')} & {t('invite_code')}</span>
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('team_code_label')}</span>
                  <span className="font-mono font-black text-cyan-400 text-sm">{business?.code || '---'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => business?.code && copyToClipboard(business.code, t('team_code_label'))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{t('copy')}</span>
                </button>
              </div>

              {currentAccount?.referralCode && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('invite_code')}</span>
                    <span className="font-mono font-black text-rose-400 text-sm">{currentAccount.referralCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentAccount.referralCode!, t('invite_code'))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Gift className="w-3 h-3 text-rose-400" />
                    <span>{t('copy')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{t('account_created_at')}:</span>
              </span>
              <span className="text-slate-400 font-mono">{currentAccount?.createdAt || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{t('last_activity_label')}:</span>
              </span>
              <span className="text-slate-400 font-mono">
                {currentAccount?.lastLoginAt ? new Date(currentAccount.lastLoginAt).toLocaleString() : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
