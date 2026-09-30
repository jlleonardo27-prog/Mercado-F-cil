import React, { useState, useEffect } from 'react';
import {
  Lock,
  X,
  Search,
  Users,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sparkles,
  Store,
  Mail,
  UserCheck,
  Copy,
  MessageCircle,
  KeyRound,
  FileText,
  Phone,
  Globe
} from 'lucide-react';
import { adminService, AdminAccountDetail } from '../services/adminService';
import { PlanType } from '../types';
import { formatExpiryDateDisplay } from '../services/plansService';
import { SUPPORTED_COUNTRIES } from '../services/i18n';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdated?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onAccountUpdated
}) => {
  const { t } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => adminService.isLoggedIn());

  // Login form state
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Action modals/inputs
  const [customDays, setCustomDays] = useState<string>('');
  const [exactDaysInput, setExactDaysInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [generatedRecoveryMsg, setGeneratedRecoveryMsg] = useState<{
    code: string;
    expiresAt: string;
    whatsappMessage: string;
  } | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setIsAuthenticated(adminService.isLoggedIn());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = adminService.login(adminName, adminPass, adminCode);
    if (success) {
      setIsAuthenticated(true);
      setAdminPass('');
      setAdminCode('');
    } else {
      setLoginError('Credenciais incorretas. Verifique seu nome, senha e código.');
    }
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
  };

  const summary = adminService.getAccountsSummary(searchTerm);
  const selectedAccount = summary.accounts.find((a) => a.account.id === selectedAccountId) || null;

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setRefreshTrigger((prev) => prev + 1);
    if (onAccountUpdated) onAccountUpdated();
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleAddDays = (accountId: string, days: number, planType?: PlanType) => {
    const updated = adminService.addDaysToAccount(accountId, days, planType);
    if (updated) {
      showNotification(`+${days} dias adicionados! Dias somados ao período existente.`);
    }
  };

  const handleSetExactDays = (accountId: string) => {
    const days = parseInt(exactDaysInput, 10);
    if (isNaN(days) || days < 0) return;
    const updated = adminService.setExactDays(accountId, days);
    if (updated) {
      showNotification(`Acesso ajustado para ${days} dias restantes.`);
      setExactDaysInput('');
    }
  };

  const handleBlock = (accountId: string) => {
    const updated = adminService.blockAccount(accountId);
    if (updated) {
      showNotification('Conta suspensa/bloqueada. Dados preservados com segurança.');
    }
  };

  const handleRestore = (accountId: string) => {
    const updated = adminService.restoreAccount(accountId);
    if (updated) {
      showNotification('Conta reativada com sucesso!');
    }
  };

  const handleGenerateRecoveryCode = (accountId: string) => {
    const res = adminService.generateRecoveryCode(accountId, 48);
    if (res) {
      setGeneratedRecoveryMsg(res);
      showNotification(`Código ${res.code} gerado com validade de 48h!`);
    }
  };

  const handleResetPassword = (accountId: string) => {
    if (!newPasswordInput.trim()) return;
    const success = adminService.resetPassword(accountId, newPasswordInput.trim());
    if (success) {
      showNotification('Senha/PIN do proprietário redefinida com sucesso.');
      setNewPasswordInput('');
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showNotification(`${label} copiado!`);
  };

  const handleSendWhatsAppRecovery = (phone: string | undefined, message: string) => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white font-display">
                {t('admin_dashboard_title')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('admin_login_subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector compact={true} />
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                title={t('admin_logout')}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-300 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!isAuthenticated ? (
            /* ADMIN LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="max-w-sm mx-auto py-6 space-y-4">
              <div className="text-center space-y-1.5 mb-6">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-white font-display">
                  Autenticação Administrativa
                </h3>
                <p className="text-xs text-slate-400">
                  Insira as credenciais para gerenciar contas de clientes.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Nome do administrador
                </label>
                <input
                  type="text"
                  required
                  id="admin-username-input"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Nome do administrador"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  id="admin-password-input"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Senha do administrador"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Código de confirmação
                </label>
                <input
                  type="text"
                  required
                  id="admin-code-input"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Código de confirmação"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                id="btn-admin-login-submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Acessar Painel
              </button>
            </form>
          ) : (
            /* ADMIN DASHBOARD */
            <div className="space-y-4">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('admin_stat_total')}</span>
                  <span className="text-lg font-black text-white">{summary.total}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-semibold block uppercase">{t('admin_stat_active')}</span>
                  <span className="text-lg font-black text-emerald-400">{summary.active}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-semibold block uppercase">{t('admin_stat_trial')}</span>
                  <span className="text-lg font-black text-amber-400">{summary.trial}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-semibold block uppercase">{t('admin_stat_expired')}</span>
                  <span className="text-lg font-black text-rose-400">{summary.expired}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('admin_stat_blocked')}</span>
                  <span className="text-lg font-black text-rose-500">{summary.blocked}</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin_search_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* NON-FINANCIAL GUARANTEE NOTICE */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Privacidade garantida:</strong> O painel administrativo gerencia apenas planos, acessos e auditoria. Dados financeiros, faturamento, lucros e produtos permanecem isolados e inacessíveis.
                </span>
              </div>

              {/* SELECTED ACCOUNT DETAIL MODAL / DRAWER */}
              {selectedAccount && (
                <div className="bg-slate-950 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl animate-in fade-in">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-black text-white font-display">
                          {selectedAccount.marketName}
                        </span>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {selectedAccount.account.accountCode || 'MF-CONTA'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span>Proprietário: <strong className="text-slate-200">{selectedAccount.account.name}</strong></span>
                        <span>•</span>
                        <span>E-mail: <strong className="text-slate-200">{selectedAccount.account.email}</strong></span>
                        {selectedAccount.account.phone && (
                          <>
                            <span>•</span>
                            <span>Tel: <strong className="text-slate-200">{selectedAccount.account.phone}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span>País/Moeda: <strong className="text-emerald-400">{selectedAccount.account.country || 'MZ'} ({selectedAccount.account.currency || 'MT'})</strong></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAccountId(null);
                        setGeneratedRecoveryMsg(null);
                      }}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg"
                    >
                      Fechar
                    </button>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Status</span>
                      <span className={`font-black text-xs uppercase ${
                        selectedAccount.account.accessStatus === 'ACTIVE'
                          ? 'text-emerald-400'
                          : selectedAccount.account.accessStatus === 'TRIAL'
                          ? 'text-amber-400'
                          : selectedAccount.account.accessStatus === 'BLOCKED'
                          ? 'text-rose-500'
                          : 'text-rose-400'
                      }`}>
                        {selectedAccount.account.accessStatus}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Plano Atual</span>
                      <span className="font-bold text-white text-xs">{selectedAccount.account.planType}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Dias Restantes</span>
                      <span className="font-black text-white text-xs">{selectedAccount.daysRemaining} dias</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Válido Até</span>
                      <span className="font-bold text-slate-300 text-xs">
                        {formatExpiryDateDisplay(selectedAccount.account.accessExpiresAt)}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Vendedores</span>
                      <span className="font-black text-white text-xs">{selectedAccount.sellerCount} vendedores</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Código Convite</span>
                      <span className="font-mono font-bold text-amber-400 text-xs">{selectedAccount.account.referralCode}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Última Atividade</span>
                      <span className="font-medium text-slate-300 text-xs">{selectedAccount.usageFrequency.lastActivity}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Data Cadastro</span>
                      <span className="font-medium text-slate-300 text-xs">{selectedAccount.account.createdAt}</span>
                    </div>
                  </div>

                  {/* ACTION 1: ADD DAYS (SUM TO EXISTING DAYS) */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                      1. Adicionar Dias de Acesso (Soma aos dias restantes)
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => handleAddDays(selectedAccount.account.id, 7, 'SEMANAL')}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        +7 Dias (49 MT)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddDays(selectedAccount.account.id, 30, 'MENSAL')}
                        className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        +30 Dias (149 MT)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddDays(selectedAccount.account.id, 180, 'SEMESTRAL')}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        +180 Dias (699 MT)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddDays(selectedAccount.account.id, 365, 'ANUAL')}
                        className="py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        +365 Dias (1.199 MT)
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qtd para somar (ex: 15)"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        className="w-40 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const num = parseInt(customDays, 10);
                          if (num > 0) {
                            handleAddDays(selectedAccount.account.id, num);
                            setCustomDays('');
                          }
                        }}
                        disabled={!customDays || parseInt(customDays, 10) <= 0}
                        className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                      >
                        Somar Dias
                      </button>

                      {/* Set exact remaining days */}
                      <input
                        type="number"
                        min="0"
                        placeholder="Definir dias exatos (ex: 20)"
                        value={exactDaysInput}
                        onChange={(e) => setExactDaysInput(e.target.value)}
                        className="w-44 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSetExactDays(selectedAccount.account.id)}
                        disabled={!exactDaysInput}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        Ajustar Dias
                      </button>
                    </div>
                  </div>

                  {/* ACTION 2: GENERATE RECOVERY CODE */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                      2. Código de Recuperação da Conta
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Gera um código temporário de 48h para o cliente recuperar acesso sem expor dados.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateRecoveryCode(selectedAccount.account.id)}
                        className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center space-x-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Gerar Novo Código de Recuperação</span>
                      </button>

                      {selectedAccount.account.recoveryCode && !selectedAccount.account.recoveryCode.used && (
                        <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400">Código Ativo:</span>
                          <span className="font-mono font-black text-amber-400 text-xs">
                            {selectedAccount.account.recoveryCode.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedAccount.account.recoveryCode!.code, 'Código')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {generatedRecoveryMsg && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            Código Gerado: <strong className="font-mono text-white text-sm">{generatedRecoveryMsg.code}</strong>
                          </span>
                          <span className="text-[10px] text-amber-400">Válido por 48 horas</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(generatedRecoveryMsg.whatsappMessage, 'Mensagem')}
                            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Mensagem Pronta</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppRecovery(selectedAccount.account.phone, generatedRecoveryMsg.whatsappMessage)}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Enviar por WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION 3: RESET PASSWORD / PIN */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                      3. Redefinir Senha do Proprietário
                    </span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Nova senha ou PIN"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-48 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(selectedAccount.account.id)}
                        disabled={!newPasswordInput.trim()}
                        className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                      >
                        Salvar Nova Senha
                      </button>
                    </div>
                  </div>

                  {/* ACTION 4: BLOCK / RESTORE */}
                  <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                    {selectedAccount.account.accessStatus === 'BLOCKED' ? (
                      <button
                        type="button"
                        onClick={() => handleRestore(selectedAccount.account.id)}
                        className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>RESTAURAR ACESSO DA CONTA</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBlock(selectedAccount.account.id)}
                        className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold cursor-pointer flex items-center space-x-1.5"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>BLOQUEAR / SUSPENDER CONTA</span>
                      </button>
                    )}
                  </div>

                  {/* AUDIT LOG HISTORY */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Histórico Administrativo desta Conta
                    </span>
                    {selectedAccount.account.adminAuditLogs && selectedAccount.account.adminAuditLogs.length > 0 ? (
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {selectedAccount.account.adminAuditLogs.map((log) => (
                          <div
                            key={log.id}
                            className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 text-[11px] flex items-center justify-between"
                          >
                            <span className="text-slate-300">{log.description}</span>
                            <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                              {new Date(log.timestamp).toLocaleDateString('pt-MZ')} {new Date(log.timestamp).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Nenhuma ação administrativa registrada ainda nesta conta.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Accounts List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Contas Cadastradas ({summary.accounts.length})
                  </h4>
                </div>

                {summary.accounts.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
                    <Store className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">
                      Nenhuma conta localizada com os filtros informados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {summary.accounts.map((item) => {
                      const isExpired = item.account.accessStatus === 'EXPIRED';
                      const isBlocked = item.account.accessStatus === 'BLOCKED';
                      const isTrial = item.account.accessStatus === 'TRIAL';
                      const isActive = item.account.accessStatus === 'ACTIVE';

                      return (
                        <div
                          key={item.account.id}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-white">
                                {item.marketName}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {item.account.accountCode || 'MF-CONTA'}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  isActive
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : isTrial
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : isBlocked
                                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {item.account.accessStatus}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                              <span>Dono: <strong className="text-slate-200">{item.account.name}</strong></span>
                              <span>•</span>
                              <span>Email: <strong className="text-slate-200">{item.account.email}</strong></span>
                              <span>•</span>
                              <span>Plano: <strong className="text-slate-200">{item.account.planType}</strong></span>
                              <span>•</span>
                              <span>
                                {item.daysRemaining > 0 ? (
                                  <span className="text-emerald-400 font-bold">{item.daysRemaining} dias</span>
                                ) : (
                                  <span className="text-rose-400 font-bold">Expirado</span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAccountId(item.account.id);
                                setGeneratedRecoveryMsg(null);
                              }}
                              className="py-1.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold cursor-pointer transition flex items-center space-x-1"
                            >
                              <span>Gerenciar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            {isAuthenticated ? 'Painel Administrativo • Mercado Fácil' : 'Acesso Restrito'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
