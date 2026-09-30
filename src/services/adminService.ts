import { OwnerAccount, AccountAccessStatus, PlanType, AdminAuditLog } from '../types';
import { storageService } from './storage';
import { calculateDaysRemaining, calculateNewExpiry } from './plansService';
import { getReferralStats } from './referralService';
import { SupportedLanguage } from './i18n';
import { currencyService } from './currencyService';

export interface AdminAccountDetail {
  account: OwnerAccount;
  marketName: string;
  marketCode: string;
  sellerCount: number;
  daysRemaining: number;
  totalInvited: number;
  convertedInvited: number;
  usageFrequency: {
    lastAccess: string;
    lastActivity: string;
    activeDays: number;
    statusSummary: string;
  };
}

const ADMIN_STORAGE_KEY = 'mf_admin_session';

export const adminService = {
  /**
   * Validates admin credentials securely without displaying them in the UI.
   */
  login(name: string, pass: string, code: string): boolean {
    const cleanName = name.trim().toLowerCase();
    const cleanPass = pass.trim().toLowerCase();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');

    // Official Administrator Credentials configured by Leonardo Odete
    const validNames = ['leonardo odete', 'leonardo', 'admin', 'administrador'];
    const validPasswords = ['mabanana', 'admin8467', 'mercadofacil8467', '846762812'];
    const validCodes = ['846762812', '8467', 'MF-8467'];

    const isNameValid = validNames.includes(cleanName);
    const isPassValid = validPasswords.includes(cleanPass);
    const isCodeValid = validCodes.includes(cleanCode);

    if (isNameValid && isPassValid && isCodeValid) {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ loggedIn: true, time: Date.now() }));
      return true;
    }
    return false;
  },

  isLoggedIn(): boolean {
    try {
      const data = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return parsed && parsed.loggedIn === true;
    } catch {
      return false;
    }
  },

  logout(): void {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  },

  /**
   * Returns ONLY real accounts created by users.
   */
  getRealAccounts(): OwnerAccount[] {
    const all = storageService.getOwnerAccounts();
    return all.filter((a) => a.isRealAccount === true || (a.id !== 'owner_demo_1' && a.email !== 'demo@mercadofacil.mz'));
  },

  /**
   * Adds an audit log to an account
   */
  addAuditLog(
    accountId: string,
    action: AdminAuditLog['action'],
    description: string,
    adminName: string = 'Leonardo Odete'
  ): void {
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return;

    const acc = accounts[index];
    if (!acc.adminAuditLogs) {
      acc.adminAuditLogs = [];
    }

    acc.adminAuditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      description,
      timestamp: Date.now(),
      adminName
    });

    storageService.saveOwnerAccount(acc);
  },

  /**
   * Returns complete non-financial metadata for the admin panel.
   * STRICT GUARANTEE: Does NOT access or expose products, individual sales,
   * business revenue, profits, or delivered cash amounts.
   */
  getAccountsSummary(searchTerm: string = ''): {
    total: number;
    active: number;
    trial: number;
    expired: number;
    blocked: number;
    accounts: AdminAccountDetail[];
  } {
    const realAccounts = this.getRealAccounts();
    const businesses = storageService.getBusinesses();

    const searchLower = searchTerm.trim().toLowerCase();
    const searchClean = searchTerm.trim().toUpperCase().replace(/\s+/g, '');

    const details: AdminAccountDetail[] = [];
    let active = 0;
    let trial = 0;
    let expired = 0;
    let blocked = 0;

    for (const acc of realAccounts) {
      const biz = businesses.find((b) => b.ownerAccountId === acc.id);
      const marketName = biz?.name || 'Mercado sem nome';
      const marketCode = biz?.code || '---';

      // Sellers count for this market (count only, no financial data)
      const sellers = biz ? storageService.getSellers(biz.id) : [];
      const sellerCount = sellers.length;

      // Days remaining
      const daysRemaining = calculateDaysRemaining(acc.accessExpiresAt);

      // Determine real-time access status
      let currentStatus: AccountAccessStatus = acc.accessStatus || 'TRIAL';
      if (acc.accessStatus === 'BLOCKED') {
        currentStatus = 'BLOCKED';
      } else if (daysRemaining <= 0) {
        currentStatus = 'EXPIRED';
      }

      if (currentStatus === 'ACTIVE') active++;
      else if (currentStatus === 'TRIAL') trial++;
      else if (currentStatus === 'EXPIRED') expired++;
      else if (currentStatus === 'BLOCKED') blocked++;

      // Referrals
      const refStats = getReferralStats(acc.referralCode);

      // Usage stats (strictly non-financial)
      const lastAccessStr = acc.lastLoginAt ? new Date(acc.lastLoginAt).toLocaleDateString('pt-MZ') : 'Hoje';
      const lastActivityStr = acc.lastActivityAt ? new Date(acc.lastActivityAt).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) : 'Recente';

      const detail: AdminAccountDetail = {
        account: {
          ...acc,
          accessStatus: currentStatus
        },
        marketName,
        marketCode,
        sellerCount,
        daysRemaining,
        totalInvited: refStats.totalInvited,
        convertedInvited: refStats.activeConverted,
        usageFrequency: {
          lastAccess: lastAccessStr,
          lastActivity: lastActivityStr,
          activeDays: acc.activeDaysInLastWeek || 1,
          statusSummary: currentStatus === 'ACTIVE' || currentStatus === 'TRIAL' ? 'Ativo' : 'Inativo'
        }
      };

      // Search filters: Business Name, Owner Name, Email, Account ID (MF-XXXXX), Recovery Code, Phone
      const matchesSearch =
        !searchLower ||
        marketName.toLowerCase().includes(searchLower) ||
        acc.email.toLowerCase().includes(searchLower) ||
        acc.name.toLowerCase().includes(searchLower) ||
        (acc.accountCode && acc.accountCode.toUpperCase().includes(searchClean)) ||
        (acc.phone && acc.phone.includes(searchLower)) ||
        (acc.recoveryCode && acc.recoveryCode.code.toUpperCase().includes(searchClean)) ||
        (acc.referralCode && acc.referralCode.toUpperCase().includes(searchClean));

      if (matchesSearch) {
        details.push(detail);
      }
    }

    return {
      total: realAccounts.length,
      active,
      trial,
      expired,
      blocked,
      accounts: details
    };
  },

  /**
   * Adds days to an account, SUMMING to existing days.
   */
  addDaysToAccount(
    accountId: string,
    daysToAdd: number,
    newPlanType?: PlanType,
    adminName: string = 'Leonardo Odete'
  ): OwnerAccount | null {
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return null;

    const acc = accounts[index];
    const newExpiry = calculateNewExpiry(acc.accessExpiresAt, daysToAdd);

    acc.accessExpiresAt = newExpiry;
    acc.accessStatus = 'ACTIVE';
    if (newPlanType) {
      acc.planType = newPlanType;
    }

    // Calculate base MZN price and converted price
    let basePriceMzn = 149;
    if (daysToAdd <= 7) basePriceMzn = 49;
    else if (daysToAdd <= 30) basePriceMzn = 149;
    else if (daysToAdd <= 180) basePriceMzn = 699;
    else if (daysToAdd <= 365) basePriceMzn = 1199;
    else basePriceMzn = Math.round((daysToAdd / 30) * 149);

    const converted = currencyService.convertPlanPrice(basePriceMzn, acc.currency || 'MT');

    if (!acc.planHistory) {
      acc.planHistory = [];
    }

    acc.planHistory.unshift({
      id: `plan_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      planId: acc.planType,
      planName: `${daysToAdd} dias (${acc.planType})`,
      duracaoDias: daysToAdd,
      basePriceMzn,
      currency: acc.currency || 'MT',
      convertedPriceDisplay: converted.displayPrice,
      exchangeRate: converted.rate,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      activationStatus: 'ATIVO',
      activatedBy: adminName
    });

    acc.lastExchangeRateUsed = {
      rate: converted.rate,
      currency: acc.currency || 'MT',
      updatedAt: new Date().toISOString(),
      isFallback: converted.isFallback
    };

    this.addAuditLog(
      accountId,
      'ADD_DAYS',
      `Adicionados +${daysToAdd} dias (Plano: ${acc.planType} | Valor cliente: ${converted.displayPrice} | Base: ${basePriceMzn} MT)`,
      adminName
    );

    storageService.saveOwnerAccount(acc);
    return acc;
  },

  /**
   * Sets exact remaining days on an account.
   */
  setExactDays(
    accountId: string,
    days: number,
    adminName: string = 'Leonardo Odete'
  ): OwnerAccount | null {
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return null;

    const acc = accounts[index];
    const targetMs = Date.now() + Math.max(0, days) * 24 * 60 * 60 * 1000;
    acc.accessExpiresAt = new Date(targetMs).toISOString();
    acc.accessStatus = days > 0 ? (acc.planType === 'TRIAL' ? 'TRIAL' : 'ACTIVE') : 'EXPIRED';

    this.addAuditLog(
      accountId,
      'REMOVE_DAYS',
      `Dias ajustados manualmente para ${days} dias`,
      adminName
    );

    storageService.saveOwnerAccount(acc);
    return acc;
  },

  /**
   * Blocks an account manually without deleting any data.
   */
  blockAccount(accountId: string, adminName: string = 'Leonardo Odete'): OwnerAccount | null {
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return null;

    const acc = accounts[index];
    acc.accessStatus = 'BLOCKED';

    this.addAuditLog(
      accountId,
      'BLOCK',
      'Conta suspensa/bloqueada administrativamente. Dados preservados.',
      adminName
    );

    storageService.saveOwnerAccount(acc);
    return acc;
  },

  /**
   * Restores an account from blocked status.
   */
  restoreAccount(accountId: string, adminName: string = 'Leonardo Odete'): OwnerAccount | null {
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return null;

    const acc = accounts[index];
    const remaining = calculateDaysRemaining(acc.accessExpiresAt);
    if (remaining > 0) {
      acc.accessStatus = acc.planType === 'TRIAL' ? 'TRIAL' : 'ACTIVE';
    } else {
      acc.accessStatus = 'EXPIRED';
    }

    this.addAuditLog(
      accountId,
      'RESTORE',
      'Conta reativada/desbloqueada pelo administrador',
      adminName
    );

    storageService.saveOwnerAccount(acc);
    return acc;
  },

  /**
   * Generates a secure Account Recovery Code valid for 24-48 hours.
   */
  generateRecoveryCode(
    accountId: string,
    validHours: number = 48,
    adminName: string = 'Leonardo Odete'
  ): { code: string; expiresAt: string; whatsappMessage: string } | null {
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return null;

    const acc = accounts[index];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `REC-${randomNum}-MF`;
    const expiresAt = new Date(Date.now() + validHours * 60 * 60 * 1000).toISOString();

    acc.recoveryCode = {
      code,
      createdAt: new Date().toISOString(),
      expiresAt,
      used: false
    };

    this.addAuditLog(
      accountId,
      'GENERATE_RECOVERY',
      `Código de recuperação gerado: ${code} (Válido por ${validHours}h)`,
      adminName
    );

    storageService.saveOwnerAccount(acc);

    // Prepare WhatsApp message customized by language
    const lang = (acc.language || 'pt') as SupportedLanguage;
    let whatsappMessage = '';

    if (lang === 'en') {
      whatsappMessage = `Hello ${acc.name}! Here is your official Mercado Fácil recovery code: *${code}* (valid for ${validHours}h).\n\nOpen the app, select "Recover Account", enter this code, and set your new password.`;
    } else if (lang === 'es') {
      whatsappMessage = `¡Hola ${acc.name}! Aquí tienes tu código oficial de recuperación de Mercado Fácil: *${code}* (válido por ${validHours}h).\n\nAbre la aplicación, selecciona "Recuperar Cuenta", introduce este código y crea tu nueva contraseña.`;
    } else if (lang === 'fr') {
      whatsappMessage = `Bonjour ${acc.name} ! Voici votre code officiel de récupération Mercado Fácil : *${code}* (valable ${validHours}h).\n\nOuvrez l'application, sélectionnez "Récupérer le Compte", entrez ce code et définissez votre nouveau mot de passe.`;
    } else {
      whatsappMessage = `Olá ${acc.name}! Aqui está o seu código oficial de recuperação do Mercado Fácil: *${code}* (válido por ${validHours} horas).\n\nAbra o aplicativo, clique em "Já tenho uma conta" -> "Recuperar Conta", digite este código e crie sua nova senha de acesso.`;
    }

    return {
      code,
      expiresAt,
      whatsappMessage
    };
  },

  /**
   * Resets the owner's password/PIN directly from the admin panel.
   */
  resetPassword(
    accountId: string,
    newPass: string,
    adminName: string = 'Leonardo Odete'
  ): boolean {
    if (!newPass.trim()) return false;
    const accounts = storageService.getOwnerAccounts();
    const index = accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return false;

    const acc = accounts[index];
    acc.password = newPass.trim();

    this.addAuditLog(
      accountId,
      'RESET_PIN',
      'Senha/PIN do proprietário redefinida manualmente',
      adminName
    );

    storageService.saveOwnerAccount(acc);
    return true;
  }
};
