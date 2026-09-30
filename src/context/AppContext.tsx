import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ThemeMode,
  UserRole,
  OwnerAccount,
  Business,
  Seller,
  Product,
  Sale,
  StockMovement,
  AppNotification,
  Expense,
  ActiveTab,
  SellerTab,
  SubView,
  UserSession,
  ProductUnit,
  StockWithdrawalReason,
  PaymentMethod,
  ExpenseCategory,
  CashDelivery,
  ShiftClosure,
  DeliveryStatus,
  AccountAccessStatus,
  PlanType
} from '../types';
import {
  storageService,
  generateId,
  generateMarketCode,
  generateAccountCode,
  formatDate,
  formatTime
} from '../services/storage';
import {
  calculateDaysRemaining,
  calculateNewExpiry,
  formatExpiryDateDisplay
} from '../services/plansService';
import {
  generateReferralCode,
  checkAndRewardReferrer
} from '../services/referralService';
import {
  SupportedLanguage,
  formatMoney,
  translate,
  formatLocalDate,
  formatLocalDateTime
} from '../services/i18n';

interface AppContextType {
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;

  // Internationalization & Currency
  language: SupportedLanguage;
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, options?: { showPlus?: boolean }) => string;
  formatDateLocal: (isoOrDate?: string | Date | number) => string;
  formatDateTimeLocal: (isoOrDate?: string | Date | number) => string;

  // Session & Auth
  session: UserSession | null;
  isOwner: boolean;
  isSeller: boolean;
  registerOwner: (
    name: string,
    email: string,
    pass: string,
    referralCode?: string,
    extra?: {
      businessName?: string;
      phone?: string;
      country?: string;
      currency?: string;
      language?: SupportedLanguage;
    }
  ) => { success: boolean; error?: string };
  loginOwner: (identifier: string, pass: string) => { success: boolean; error?: string };
  recoverAccountWithCode: (identifier: string, recoveryCode: string, newPass: string) => { success: boolean; error?: string };
  updateOwnerAccount: (updated: Partial<OwnerAccount>) => void;
  createBusiness: (data: { name: string; ownerName: string; phone: string; currency: string }) => { success: boolean; error?: string };
  loginSeller: (marketCode: string, sellerId: string, pin: string) => { success: boolean; error?: string };
  logout: () => void;

  // Plan & Access Control
  currentAccount: OwnerAccount | null;
  accessStatus: AccountAccessStatus;
  daysRemaining: number;
  expiryDateDisplay: string;
  planType: PlanType;
  expirationWarning: string | null;
  isAccessBlockedOrExpired: boolean;
  openBuyPlanModal: () => void;
  openReferralModal: () => void;
  openAccountInfoModal: () => void;
  openAdminModal: () => void;
  refreshAccountState: () => void;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sellerTab: SellerTab;
  setSellerTab: (tab: SellerTab) => void;
  subView: SubView;
  setSubView: (view: SubView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedSellerId: string | null;
  setSelectedSellerId: (id: string | null) => void;

  // Multi-tenant dataset
  business: Business | null;
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  sellers: Seller[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  expenses: Expense[];
  deliveries: CashDelivery[];
  closures: ShiftClosure[];

  // Actions
  addProduct: (data: {
    nome: string;
    unidade: ProductUnit;
    precoCompra: number;
    precoVendaSugerido: number;
    quantidadeInicial: number;
    estoqueMinimo: number;
    foto?: string;
  }) => { success: boolean; product?: Product };
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addStock: (productId: string, quantity: number, precoCompraUnitario: number) => void;
  withdrawStock: (productId: string, quantity: number, motivo: StockWithdrawalReason) => void;
  recordSale: (
    items: { product: Product; quantity: number; precoVendaReal: number }[],
    paymentMethod: PaymentMethod,
    observacao?: string
  ) => { success: boolean; sale?: Sale; error?: string };

  // Cash Delivery & Shift Closure
  recordCashDelivery: (
    sellerId: string,
    valorEntregue: number,
    observacao?: string,
    isNotDeliveredYet?: boolean
  ) => { success: boolean; delivery?: CashDelivery };
  closeShift: (sellerId: string) => { success: boolean; closure?: ShiftClosure };
  confirmDeliveryByOwner: (deliveryId: string) => void;

  // Sellers
  addSeller: (name: string, pin: string, phone?: string) => { success: boolean; seller?: Seller; error?: string };
  updateSeller: (seller: Seller) => void;
  deleteSeller: (sellerId: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Expenses
  addExpense: (descricao: string, valor: number, categoria?: string) => { success: boolean };
  deleteExpense: (id: string) => void;

  // Business
  updateBusiness: (updated: Business) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  reloadBusinessData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Theme state (default dark)
  const [theme, setThemeState] = useState<ThemeMode>(() => storageService.getTheme());

  useEffect(() => {
    storageService.setTheme(theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Initialize demo data once if storage is brand new
  useEffect(() => {
    storageService.initializeDemoDataIfEmpty();
  }, []);

  // 3. User Session
  const [session, setSession] = useState<UserSession | null>(() => storageService.getActiveSession());

  // 4. Navigation tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [sellerTab, setSellerTab] = useState<SellerTab>('inicio');
  const [subView, setSubView] = useState<SubView>('none');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // 5. Active Business and Isolated Datasets
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deliveries, setDeliveries] = useState<CashDelivery[]>([]);
  const [closures, setClosures] = useState<ShiftClosure[]>([]);

  // 6. Toast Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Load isolated datasets for currently active session
  const reloadBusinessData = useCallback(() => {
    if (!session?.businessId) {
      setBusiness(null);
      setProducts([]);
      setSales([]);
      setStockMovements([]);
      setSellers([]);
      setNotifications([]);
      setExpenses([]);
      setDeliveries([]);
      setClosures([]);
      return;
    }

    const b = storageService.getBusinessById(session.businessId);
    setBusiness(b);

    if (b) {
      setProducts(storageService.getProducts(b.id));
      setSales(storageService.getSales(b.id));
      setStockMovements(storageService.getStockMovements(b.id));
      setSellers(storageService.getSellers(b.id));
      setNotifications(storageService.getNotifications(b.id));
      setExpenses(storageService.getExpenses(b.id));
      setDeliveries(storageService.getCashDeliveries(b.id));
      setClosures(storageService.getShiftClosures(b.id));
    }
  }, [session]);

  useEffect(() => {
    reloadBusinessData();
  }, [reloadBusinessData]);

  const [accountRefreshKey, setAccountRefreshKey] = useState(0);

  const refreshAccountState = useCallback(() => {
    setAccountRefreshKey((k) => k + 1);
  }, []);

  // Current Account resolution for Owner or Seller's Market
  const currentAccount = useMemo(() => {
    if (!session) return null;
    const accounts = storageService.getOwnerAccounts();
    if (session.accountId) {
      return accounts.find((a) => a.id === session.accountId) || null;
    }
    if (session.businessId) {
      const biz = storageService.getBusinessById(session.businessId);
      if (biz) {
        return accounts.find((a) => a.id === biz.ownerAccountId) || null;
      }
    }
    return null;
  }, [session, accountRefreshKey, business]);

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    return calculateDaysRemaining(currentAccount?.accessExpiresAt);
  }, [currentAccount]);

  // Account access status
  const accessStatus: AccountAccessStatus = useMemo(() => {
    if (!currentAccount) return 'ACTIVE';
    if (currentAccount.accessStatus === 'BLOCKED') return 'BLOCKED';
    if (daysRemaining <= 0) return 'EXPIRED';
    if (currentAccount.planType === 'TRIAL') return 'TRIAL';
    return 'ACTIVE';
  }, [currentAccount, daysRemaining]);

  const isAccessBlockedOrExpired = accessStatus === 'EXPIRED' || accessStatus === 'BLOCKED';
  const planType: PlanType = currentAccount?.planType || 'TRIAL';
  const expiryDateDisplay = formatExpiryDateDisplay(currentAccount?.accessExpiresAt);

  // Expiration warnings: 3 days, 1 day, or expired
  const expirationWarning = useMemo(() => {
    if (!currentAccount) return null;
    if (accessStatus === 'BLOCKED') return null;
    if (accessStatus === 'EXPIRED' || daysRemaining <= 0) {
      return 'Seu acesso terminou. Seus dados continuam guardados. Escolha um plano para voltar a utilizar o Mercado Fácil.';
    }
    if (daysRemaining === 1) {
      return 'Seu acesso termina amanhã. Escolha um plano para continuar utilizando o Mercado Fácil.';
    }
    if (daysRemaining === 3) {
      if (accessStatus === 'TRIAL') {
        return 'Seu período gratuito termina em 3 dias. Escolha um plano para continuar utilizando o Mercado Fácil.';
      }
      return 'Seu plano termina em 3 dias. Escolha um plano para continuar utilizando o Mercado Fácil.';
    }
    return null;
  }, [currentAccount, accessStatus, daysRemaining]);

  const openBuyPlanModal = useCallback(() => setSubView('planos'), []);
  const openReferralModal = useCallback(() => setSubView('convite'), []);
  const openAccountInfoModal = useCallback(() => setSubView('minha_conta'), []);
  const openAdminModal = useCallback(() => setSubView('admin'), []);

  // Language & i18n
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('mf_user_lang') as SupportedLanguage) || 'pt';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('mf_user_lang', lang);

    // If an owner account is currently active, persist the language into their account profile
    if (currentAccount) {
      const accounts = storageService.getOwnerAccounts();
      const idx = accounts.findIndex((a) => a.id === currentAccount.id);
      if (idx >= 0) {
        const merged = { ...accounts[idx], language: lang };
        storageService.saveOwnerAccount(merged);
        setAccountRefreshKey((k) => k + 1);
      }
    }
  }, [currentAccount]);

  // Synchronize language when switching accounts or logging in
  useEffect(() => {
    if (currentAccount?.language && currentAccount.language !== language) {
      setLanguageState(currentAccount.language as SupportedLanguage);
      localStorage.setItem('mf_user_lang', currentAccount.language);
    }
  }, [currentAccount?.id, currentAccount?.language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(language, key, params);
    },
    [language]
  );

  const formatCurrency = useCallback(
    (amount: number, options?: { showPlus?: boolean }) => {
      const curr = business?.currency || currentAccount?.currency || 'MT';
      return formatMoney(amount, curr, options, language);
    },
    [business?.currency, currentAccount?.currency, language]
  );

  const formatDateLocal = useCallback(
    (isoOrDate?: string | Date | number) => {
      return formatLocalDate(isoOrDate, language);
    },
    [language]
  );

  const formatDateTimeLocal = useCallback(
    (isoOrDate?: string | Date | number) => {
      return formatLocalDateTime(isoOrDate, language);
    },
    [language]
  );

  const updateOwnerAccount = useCallback(
    (updated: Partial<OwnerAccount>) => {
      if (!currentAccount) return;
      const accounts = storageService.getOwnerAccounts();
      const idx = accounts.findIndex((a) => a.id === currentAccount.id);
      if (idx >= 0) {
        const merged = { ...accounts[idx], ...updated };
        storageService.saveOwnerAccount(merged);
        setAccountRefreshKey((k) => k + 1);
        showToast('Dados da conta atualizados.');
      }
    },
    [currentAccount, showToast]
  );

  // Auth: Register Owner with 7 Days Free Trial
  const registerOwner = (
    name: string,
    email: string,
    pass: string,
    referralCode?: string,
    extra?: {
      businessName?: string;
      phone?: string;
      country?: string;
      currency?: string;
      language?: SupportedLanguage;
    }
  ) => {
    if (!name.trim() || !email.trim() || !pass.trim()) {
      return { success: false, error: 'Preencha todos os campos.' };
    }

    const accounts = storageService.getOwnerAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return {
        success: false,
        error: 'Este email já está associado a uma conta. Entre na sua conta.'
      };
    }

    const now = new Date();
    const trialDays = 7;
    const trialExpires = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    const chosenLang = extra?.language || 'pt';
    const chosenCountry = extra?.country || 'MZ';
    const chosenCurrency = extra?.currency || 'MT';
    const chosenPhone = extra?.phone?.trim() || '';

    const newAcc: OwnerAccount = {
      id: generateId('owner'),
      accountCode: generateAccountCode(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: chosenPhone,
      country: chosenCountry,
      currency: chosenCurrency,
      language: chosenLang,
      password: pass.trim(),
      createdAt: formatDate(),
      accessStatus: 'TRIAL',
      planType: 'TRIAL',
      trialStartedAt: now.toISOString(),
      trialExpiresAt: trialExpires,
      trialUsed: true,
      accessStartedAt: now.toISOString(),
      accessExpiresAt: trialExpires,
      lastLoginAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      activeDaysInLastWeek: 1,
      referralCode: generateReferralCode(),
      referredBy: referralCode ? referralCode.trim().toUpperCase() : undefined,
      referralRewardGranted: false,
      isRealAccount: true
    };
    storageService.saveOwnerAccount(newAcc);

    // Auto-create initial market for owner (empty products, empty sales!)
    const businessTitle = extra?.businessName?.trim() || `${name.trim().split(' ')[0]} Comércio`;
    const newBiz: Business = {
      id: generateId('biz'),
      ownerAccountId: newAcc.id,
      name: businessTitle,
      ownerName: newAcc.name,
      phone: chosenPhone,
      currency: chosenCurrency,
      code: generateMarketCode(),
      createdAt: formatDate()
    };
    storageService.saveBusiness(newBiz);

    setLanguageState(chosenLang);
    localStorage.setItem('mf_user_lang', chosenLang);

    const newSession: UserSession = {
      role: 'PROPRIETARIO',
      accountId: newAcc.id,
      businessId: newBiz.id,
      userName: newAcc.name
    };
    storageService.setActiveSession(newSession);
    setSession(newSession);
    setAccountRefreshKey((k) => k + 1);
    showToast(`Bem-vindo, ${newAcc.name}! Seu teste grátis de 7 dias começou.`);
    return { success: true };
  };

  // Auth: Login Owner by Email or Account ID (MF-XXXXX)
  const loginOwner = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanUpper = identifier.trim().toUpperCase().replace(/\s+/g, '');
    const accounts = storageService.getOwnerAccounts();
    const acc = accounts.find(
      (a) =>
        (a.email.toLowerCase() === cleanId ||
          (a.accountCode && a.accountCode.toUpperCase() === cleanUpper) ||
          (a.phone && a.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))) &&
        a.password === pass.trim()
    );

    if (!acc) {
      return { success: false, error: 'E-mail, ID ou senha incorretos.' };
    }

    if (acc.accessStatus === 'BLOCKED') {
      return {
        success: false,
        error: 'Esta conta está suspensa ou bloqueada. Entre em contato com o suporte.'
      };
    }

    // Update last login
    acc.lastLoginAt = new Date().toISOString();
    acc.lastActivityAt = new Date().toISOString();
    storageService.saveOwnerAccount(acc);

    if (acc.language) {
      setLanguageState(acc.language as SupportedLanguage);
      localStorage.setItem('mf_user_lang', acc.language);
    }

    // Find businesses owned by this account
    const businesses = storageService.getBusinesses().filter((b) => b.ownerAccountId === acc.id);
    let targetBiz = businesses[0];

    if (!targetBiz) {
      targetBiz = {
        id: generateId('biz'),
        ownerAccountId: acc.id,
        name: `Mercado de ${acc.name}`,
        ownerName: acc.name,
        phone: acc.phone || '',
        currency: acc.currency || 'MT',
        code: generateMarketCode(),
        createdAt: formatDate()
      };
      storageService.saveBusiness(targetBiz);
    }

    const newSession: UserSession = {
      role: 'PROPRIETARIO',
      accountId: acc.id,
      businessId: targetBiz.id,
      userName: acc.name
    };
    storageService.setActiveSession(newSession);
    setSession(newSession);
    setAccountRefreshKey((k) => k + 1);
    showToast(`Olá novamente, ${acc.name}!`);
    return { success: true };
  };

  // Auth: Recover Account with Administrator Recovery Code
  const recoverAccountWithCode = (
    identifier: string,
    recoveryCode: string,
    newPass: string
  ) => {
    if (!identifier.trim() || !recoveryCode.trim() || !newPass.trim()) {
      return { success: false, error: 'Preencha todos os campos.' };
    }
    const accounts = storageService.getOwnerAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const cleanUpper = identifier.trim().toUpperCase().replace(/\s+/g, '');
    const cleanCode = recoveryCode.trim().toUpperCase().replace(/\s+/g, '');
    const now = new Date().toISOString();

    const acc = accounts.find((a) => {
      const matchId =
        a.email.toLowerCase() === cleanId ||
        (a.accountCode && a.accountCode.toUpperCase() === cleanUpper);
      if (!matchId) return false;
      if (!a.recoveryCode) return false;
      if (a.recoveryCode.used) return false;
      if (a.recoveryCode.expiresAt && a.recoveryCode.expiresAt < now) return false;
      return a.recoveryCode.code.toUpperCase().replace(/\s+/g, '') === cleanCode;
    });

    if (!acc) {
      return {
        success: false,
        error: 'Código de recuperação inválido ou expirado. Peça um novo código ao administrador.'
      };
    }

    acc.password = newPass.trim();
    acc.recoveryCode.used = true;
    if (!acc.adminAuditLogs) acc.adminAuditLogs = [];
    acc.adminAuditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'RESET_PIN',
      description: 'Senha redefinida pelo usuário com código de recuperação',
      timestamp: Date.now(),
      adminName: 'Sistema/Cliente'
    });
    storageService.saveOwnerAccount(acc);

    return loginOwner(acc.email, newPass.trim());
  };

  // Auth: Create Business
  const createBusiness = (data: { name: string; ownerName: string; phone: string; currency: string }) => {
    if (!session?.accountId) {
      return { success: false, error: 'Sessão de proprietário inválida.' };
    }

    const newBiz: Business = {
      id: generateId('biz'),
      ownerAccountId: session.accountId,
      name: data.name.trim(),
      ownerName: data.ownerName.trim(),
      phone: data.phone.trim(),
      currency: data.currency.trim() || 'MT',
      code: generateMarketCode(),
      createdAt: formatDate()
    };
    storageService.saveBusiness(newBiz);

    const updatedSession: UserSession = {
      ...session,
      businessId: newBiz.id
    };
    storageService.setActiveSession(updatedSession);
    setSession(updatedSession);
    showToast(`Mercado "${newBiz.name}" criado! Código: ${newBiz.code}`);
    return { success: true };
  };

  // Auth: Login Seller
  const loginSeller = (marketCode: string, sellerId: string, pin: string) => {
    const biz = storageService.getBusinessByCode(marketCode);
    if (!biz) {
      return { success: false, error: 'Código de mercado não encontrado. Verifique com o proprietário.' };
    }

    const bizSellers = storageService.getSellers(biz.id);
    const seller = bizSellers.find((s) => s.id === sellerId && s.active);

    if (!seller) {
      return { success: false, error: 'Vendedor não encontrado ou inativo.' };
    }

    if (seller.pin !== pin.trim()) {
      return { success: false, error: 'PIN incorreto. Digite o PIN de 4 dígitos criado pelo dono.' };
    }

    const newSession: UserSession = {
      role: 'VENDEDOR',
      businessId: biz.id,
      sellerId: seller.id,
      userName: seller.name
    };
    storageService.setActiveSession(newSession);
    setSession(newSession);
    showToast(`Bem-vindo, ${seller.name}! Caixa aberto.`);
    return { success: true };
  };

  // Auth: Logout
  const logout = () => {
    storageService.setActiveSession(null);
    setSession(null);
    setActiveTab('inicio');
    setSellerTab('inicio');
    setSubView('none');
    showToast('Sessão finalizada.');
  };

  // Product Actions
  const addProduct = (data: {
    nome: string;
    unidade: ProductUnit;
    precoCompra: number;
    precoVendaSugerido: number;
    quantidadeInicial: number;
    estoqueMinimo: number;
    foto?: string;
  }) => {
    if (!business) return { success: false };

    const newProduct: Product = {
      id: generateId('prod'),
      businessId: business.id,
      nome: data.nome.trim(),
      unidade: data.unidade,
      precoCompra: Number(data.precoCompra),
      precoVendaSugerido: Number(data.precoVendaSugerido),
      estoqueAtual: Number(data.quantidadeInicial),
      estoqueMinimo: Number(data.estoqueMinimo) || 5,
      ativo: true,
      foto: data.foto,
      criadoEm: formatDate()
    };

    const newProducts = [newProduct, ...products];
    setProducts(newProducts);
    storageService.saveProducts(business.id, newProducts);

    // Initial stock movement
    if (data.quantidadeInicial > 0) {
      const movement: StockMovement = {
        id: generateId('mov'),
        businessId: business.id,
        produtoId: newProduct.id,
        produtoNome: newProduct.nome,
        unidade: newProduct.unidade,
        tipo: 'ENTRADA',
        quantidade: Number(data.quantidadeInicial),
        estoqueAnterior: 0,
        novoEstoque: Number(data.quantidadeInicial),
        precoCompraUnitario: Number(data.precoCompra),
        motivo: 'Estoque inicial',
        data: formatDate(),
        hora: formatTime(),
        timestamp: Date.now(),
        usuarioNome: session?.userName || 'Proprietário'
      };
      const newMovements = [movement, ...stockMovements];
      setStockMovements(newMovements);
      storageService.saveStockMovements(business.id, newMovements);
    }

    showToast(`Produto "${newProduct.nome}" cadastrado com sucesso.`);

    if (currentAccount) {
      currentAccount.lastActivityAt = new Date().toISOString();
      storageService.saveOwnerAccount(currentAccount);
      if (currentAccount.referredBy && !currentAccount.referralRewardGranted) {
        checkAndRewardReferrer(currentAccount);
      }
    }

    return { success: true, product: newProduct };
  };

  const updateProduct = (updated: Product) => {
    if (!business) return;
    const list = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(list);
    storageService.saveProducts(business.id, list);
    showToast(`Produto "${updated.nome}" atualizado.`);
  };

  const deleteProduct = (productId: string) => {
    if (!business) return;
    const list = products.filter((p) => p.id !== productId);
    setProducts(list);
    storageService.saveProducts(business.id, list);
    showToast('Produto removido.');
  };

  // Add stock (Entrada de mercadoria)
  const addStock = (productId: string, quantity: number, precoCompraUnitario: number) => {
    if (!business || quantity <= 0) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const estoqueAnterior = prod.estoqueAtual;
    const novoEstoque = estoqueAnterior + quantity;

    const updatedProd: Product = {
      ...prod,
      estoqueAtual: novoEstoque,
      precoCompra: precoCompraUnitario > 0 ? precoCompraUnitario : prod.precoCompra
    };
    updateProduct(updatedProd);

    const movement: StockMovement = {
      id: generateId('mov'),
      businessId: business.id,
      produtoId: prod.id,
      produtoNome: prod.nome,
      unidade: prod.unidade,
      tipo: 'ENTRADA',
      quantidade: quantity,
      estoqueAnterior,
      novoEstoque,
      precoCompraUnitario: precoCompraUnitario > 0 ? precoCompraUnitario : prod.precoCompra,
      motivo: 'Compra / Reposição de estoque',
      data: formatDate(),
      hora: formatTime(),
      timestamp: Date.now(),
      usuarioNome: session?.userName || 'Proprietário'
    };
    const newMovements = [movement, ...stockMovements];
    setStockMovements(newMovements);
    storageService.saveStockMovements(business.id, newMovements);

    showToast(`Entrada de +${quantity} ${prod.unidade}(s) registrada.`);
  };

  // Withdraw stock (Retirada por consumo ou perda)
  const withdrawStock = (productId: string, quantity: number, motivo: StockWithdrawalReason) => {
    if (!business || quantity <= 0) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const estoqueAnterior = prod.estoqueAtual;
    const novoEstoque = Math.max(0, estoqueAnterior - quantity);

    const updatedProd: Product = {
      ...prod,
      estoqueAtual: novoEstoque
    };
    updateProduct(updatedProd);

    const movement: StockMovement = {
      id: generateId('mov'),
      businessId: business.id,
      produtoId: prod.id,
      produtoNome: prod.nome,
      unidade: prod.unidade,
      tipo: 'RETIRADA',
      quantidade: -quantity,
      estoqueAnterior,
      novoEstoque,
      motivo,
      data: formatDate(),
      hora: formatTime(),
      timestamp: Date.now(),
      usuarioNome: session?.userName || 'Proprietário'
    };
    const newMovements = [movement, ...stockMovements];
    setStockMovements(newMovements);
    storageService.saveStockMovements(business.id, newMovements);

    showToast(`Retirada de ${quantity} ${prod.unidade}(s) registrada (${motivo}).`);
  };

  // Record a Sale
  const recordSale = (
    items: { product: Product; quantity: number; precoVendaReal: number }[],
    paymentMethod: PaymentMethod,
    observacao?: string
  ) => {
    if (!business) return { success: false, error: 'Mercado não selecionado.' };
    if (items.length === 0) return { success: false, error: 'Nenhum item selecionado para venda.' };

    const saleDate = formatDate();
    const saleTime = formatTime();
    const nowTimestamp = Date.now();

    let saleTotal = 0;
    let saleCustoTotal = 0;
    const saleItems = [];
    const newStockMovements: StockMovement[] = [];
    const updatedProductsMap = new Map<string, Product>();

    for (const item of items) {
      const p = products.find((prod) => prod.id === item.product.id) || item.product;
      const subtotal = item.precoVendaReal * item.quantity;
      const custoTotal = p.precoCompra * item.quantity;
      const lucro = subtotal - custoTotal;

      saleTotal += subtotal;
      saleCustoTotal += custoTotal;

      saleItems.push({
        produtoId: p.id,
        nome: p.nome,
        unidade: p.unidade,
        quantidade: item.quantity,
        precoCompra: p.precoCompra,
        precoVendaReal: item.precoVendaReal,
        subtotal,
        custoTotal,
        lucro
      });

      const anterior = p.estoqueAtual;
      const novo = Math.max(0, anterior - item.quantity);
      updatedProductsMap.set(p.id, { ...p, estoqueAtual: novo });

      newStockMovements.push({
        id: generateId('mov_sale'),
        businessId: business.id,
        produtoId: p.id,
        produtoNome: p.nome,
        unidade: p.unidade,
        tipo: 'SAIDA_VENDA',
        quantidade: -item.quantity,
        estoqueAnterior: anterior,
        novoEstoque: novo,
        motivo: `Venda #${saleItems.length}`,
        data: saleDate,
        hora: saleTime,
        timestamp: nowTimestamp,
        usuarioNome: session?.userName || 'Vendedor'
      });
    }

    const saleProfit = saleTotal - saleCustoTotal;

    const newSale: Sale = {
      id: generateId('sale'),
      businessId: business.id,
      data: saleDate,
      hora: saleTime,
      timestamp: nowTimestamp,
      itens: saleItems,
      subtotal: saleTotal,
      total: saleTotal,
      formaPagamento: paymentMethod,
      vendedorNome: session?.userName || 'Atendente',
      vendedorId: session?.sellerId,
      custoTotal: saleCustoTotal,
      lucro: saleProfit,
      observacao
    };

    // Save sales
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    storageService.saveSales(business.id, updatedSales);

    // Save movements
    const updatedMovements = [...newStockMovements, ...stockMovements];
    setStockMovements(updatedMovements);
    storageService.saveStockMovements(business.id, updatedMovements);

    // Save updated products
    const updatedProductsList = products.map((p) => updatedProductsMap.get(p.id) || p);
    setProducts(updatedProductsList);
    storageService.saveProducts(business.id, updatedProductsList);

    // If sale was made by a seller, create notification for owner
    if (session?.role === 'VENDEDOR') {
      const firstItem = saleItems[0];
      const prodInMap = updatedProductsMap.get(firstItem.produtoId);
      const remainingStock = prodInMap ? prodInMap.estoqueAtual : 0;

      const itemLines = saleItems
        .map((it) => `${it.nome}\n${it.quantidade} ${it.unidade}\n${it.subtotal.toLocaleString()} ${business.currency}`)
        .join('\n\n');

      const notif: AppNotification = {
        id: generateId('notif'),
        businessId: business.id,
        titulo: 'NOVA VENDA',
        mensagem: `${session.userName} realizou uma venda.\n\n${itemLines}\n\nLucro:\n${saleProfit.toLocaleString()} ${business.currency}\n\nEstoque restante:\n${remainingStock}`,
        data: saleDate,
        hora: saleTime,
        timestamp: nowTimestamp,
        lida: false,
        tipo: 'VENDA'
      };
      const updatedNotifs = [notif, ...notifications];
      setNotifications(updatedNotifs);
      storageService.saveNotifications(business.id, updatedNotifs);
    }

    showToast(`Venda de ${saleTotal.toLocaleString()} ${business.currency} concluída!`);

    if (currentAccount) {
      currentAccount.lastActivityAt = new Date().toISOString();
      storageService.saveOwnerAccount(currentAccount);
      if (currentAccount.referredBy && !currentAccount.referralRewardGranted) {
        checkAndRewardReferrer(currentAccount);
      }
    }

    return { success: true, sale: newSale };
  };

  // Cash Delivery Management
  const recordCashDelivery = (
    sellerId: string,
    valorEntregue: number,
    observacao?: string,
    isNotDeliveredYet: boolean = false
  ) => {
    if (!business) return { success: false };
    const seller = sellers.find((s) => s.id === sellerId);
    if (!seller) return { success: false };

    // Calculate total sales for this seller (expected value)
    const sellerSales = sales.filter((s) => s.vendedorId === seller.id);
    const valorEsperado = sellerSales.reduce((sum, s) => sum + s.total, 0);

    // Prior deliveries for this seller
    const prevDeliveries = deliveries.filter((d) => d.vendedorId === seller.id);
    const prevTotalEntregue = prevDeliveries.reduce((sum, d) => sum + d.valorEntregue, 0);

    const novoTotalEntregue = isNotDeliveredYet ? 0 : prevTotalEntregue + valorEntregue;
    const diferenca = Math.max(0, valorEsperado - novoTotalEntregue);

    let status: DeliveryStatus = 'NAO_ENTREGUE';
    if (isNotDeliveredYet || (novoTotalEntregue === 0 && valorEsperado > 0)) {
      status = 'NAO_ENTREGUE';
    } else if (novoTotalEntregue >= valorEsperado && valorEsperado > 0) {
      status = 'CONFERIDO';
    } else if (novoTotalEntregue > 0) {
      status = 'PARCIAL';
    }

    const newDelivery: CashDelivery = {
      id: generateId('deliv'),
      businessId: business.id,
      vendedorId: seller.id,
      vendedorNome: seller.name,
      valorEsperado,
      valorEntregue: isNotDeliveredYet ? 0 : valorEntregue,
      diferenca,
      status,
      data: formatDate(),
      hora: formatTime(),
      timestamp: Date.now(),
      observacao
    };

    const updatedDeliveries = [newDelivery, ...deliveries];
    setDeliveries(updatedDeliveries);
    storageService.saveCashDeliveries(business.id, updatedDeliveries);

    // Create notification for owner
    const statusIcon =
      status === 'CONFERIDO'
        ? '✅ Tudo conferido'
        : status === 'PARCIAL'
        ? '⚠️ Entrega parcial'
        : '⏳ Dinheiro não entregue';

    const notifMsg = isNotDeliveredYet
      ? `${seller.name} informou: "Não entreguei ainda".\n\nValor a entregar:\n${valorEsperado.toLocaleString()} ${business.currency}\n\nValor entregue:\n0 ${business.currency}\n\nFalta entregar:\n${valorEsperado.toLocaleString()} ${business.currency}\n\nStatus:\n⏳ Dinheiro não entregue`
      : `${seller.name} entregou:\n${valorEntregue.toLocaleString()} ${business.currency}\n\nValor esperado:\n${valorEsperado.toLocaleString()} ${business.currency}\n\nFalta:\n${diferenca.toLocaleString()} ${business.currency}\n\nStatus:\n${statusIcon}`;

    const notif: AppNotification = {
      id: generateId('notif'),
      businessId: business.id,
      titulo: 'ENTREGA REGISTRADA',
      mensagem: notifMsg,
      data: formatDate(),
      hora: formatTime(),
      timestamp: Date.now(),
      lida: false,
      tipo: 'SISTEMA'
    };

    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(business.id, updatedNotifs);

    showToast(
      isNotDeliveredYet
        ? 'Status atualizado: Dinheiro não entregue ainda.'
        : `Entrega de ${valorEntregue.toLocaleString()} ${business.currency} registrada!`
    );

    return { success: true, delivery: newDelivery };
  };

  // Shift Closure (Fechar Minhas Vendas)
  const closeShift = (sellerId: string) => {
    if (!business) return { success: false };
    const seller = sellers.find((s) => s.id === sellerId);
    if (!seller) return { success: false };

    const sellerSales = sales.filter((s) => s.vendedorId === seller.id);
    const totalVendasQtd = sellerSales.length;
    const totalVendido = sellerSales.reduce((sum, s) => sum + s.total, 0);
    const lucroGerado = sellerSales.reduce((sum, s) => sum + s.lucro, 0);

    const prevDeliveries = deliveries.filter((d) => d.vendedorId === seller.id);
    const totalEntregue = prevDeliveries.reduce((sum, d) => sum + d.valorEntregue, 0);
    const diferenca = Math.max(0, totalVendido - totalEntregue);

    let status: DeliveryStatus = 'NAO_ENTREGUE';
    if (totalEntregue >= totalVendido && totalVendido > 0) {
      status = 'CONFERIDO';
    } else if (totalEntregue > 0) {
      status = 'PARCIAL';
    }

    const closure: ShiftClosure = {
      id: generateId('closure'),
      businessId: business.id,
      vendedorId: seller.id,
      vendedorNome: seller.name,
      data: formatDate(),
      hora: formatTime(),
      timestamp: Date.now(),
      totalVendasQtd,
      totalVendido,
      lucroGerado,
      valorEsperado: totalVendido,
      valorEntregue: totalEntregue,
      diferenca,
      status
    };

    const updatedClosures = [closure, ...closures];
    setClosures(updatedClosures);
    storageService.saveShiftClosures(business.id, updatedClosures);

    // Notification for owner
    const notif: AppNotification = {
      id: generateId('notif'),
      businessId: business.id,
      titulo: 'TURNO FECHADO',
      mensagem: `${seller.name} fechou suas vendas.\n\nVendas: ${totalVendasQtd}\nTotal vendido: ${totalVendido.toLocaleString()} ${business.currency}\nLucro gerado: ${lucroGerado.toLocaleString()} ${business.currency}\nA entregar: ${totalVendido.toLocaleString()} ${business.currency}\nEntregue: ${totalEntregue.toLocaleString()} ${business.currency}\nDiferença: ${diferenca.toLocaleString()} ${business.currency}`,
      data: formatDate(),
      hora: formatTime(),
      timestamp: Date.now(),
      lida: false,
      tipo: 'SISTEMA'
    };

    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    storageService.saveNotifications(business.id, updatedNotifs);

    showToast('Turno fechado com sucesso ✓');
    return { success: true, closure };
  };

  // Owner Confirms Cash Delivery
  const confirmDeliveryByOwner = (deliveryId: string) => {
    if (!business) return;
    const updated = deliveries.map((d) =>
      d.id === deliveryId ? { ...d, status: 'CONFERIDO' as DeliveryStatus, conferidoPeloDono: true } : d
    );
    setDeliveries(updated);
    storageService.saveCashDeliveries(business.id, updated);
    showToast('Entrega conferida e confirmada!');
  };

  // Sellers Management
  const addSeller = (name: string, pin: string, phone?: string) => {
    if (!business) return { success: false, error: 'Mercado não selecionado.' };
    if (!name.trim()) return { success: false, error: 'Informe o nome do vendedor.' };
    if (!pin || pin.length < 4) return { success: false, error: 'O PIN deve conter pelo menos 4 dígitos.' };

    const newSeller: Seller = {
      id: generateId('seller'),
      businessId: business.id,
      name: name.trim(),
      pin: pin.trim(),
      active: true,
      phone: phone?.trim(),
      createdAt: formatDate()
    };

    const list = [newSeller, ...sellers];
    setSellers(list);
    storageService.saveSellers(business.id, list);
    showToast(`Vendedor "${newSeller.name}" cadastrado.`);
    return { success: true, seller: newSeller };
  };

  const updateSeller = (updated: Seller) => {
    if (!business) return;
    const list = sellers.map((s) => (s.id === updated.id ? updated : s));
    setSellers(list);
    storageService.saveSellers(business.id, list);
    showToast('Vendedor atualizado.');
  };

  const deleteSeller = (sellerId: string) => {
    if (!business) return;
    const list = sellers.filter((s) => s.id !== sellerId);
    setSellers(list);
    storageService.saveSellers(business.id, list);
    showToast('Vendedor removido.');
  };

  // Notifications
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.lida).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    if (!business) return;
    const list = notifications.map((n) => (n.id === id ? { ...n, lida: true } : n));
    setNotifications(list);
    storageService.saveNotifications(business.id, list);
  };

  const markAllNotificationsRead = () => {
    if (!business) return;
    const list = notifications.map((n) => ({ ...n, lida: true }));
    setNotifications(list);
    storageService.saveNotifications(business.id, list);
    showToast('Todas as notificações marcadas como lidas.');
  };

  // Expenses
  const addExpense = (descricao: string, valor: number, categoria?: string) => {
    if (!business || valor <= 0) return { success: false };
    const newExp: Expense = {
      id: generateId('exp'),
      businessId: business.id,
      descricao: descricao.trim() || 'Despesa operacional',
      categoria: (categoria as ExpenseCategory) || 'Outro',
      valor: Number(valor),
      data: formatDate(),
      hora: formatTime(),
      criadoPor: session?.userName || 'Proprietário',
      timestamp: Date.now()
    };
    const list = [newExp, ...expenses];
    setExpenses(list);
    storageService.saveExpenses(business.id, list);
    showToast('Despesa registrada.');
    return { success: true };
  };

  const deleteExpense = (id: string) => {
    if (!business) return;
    const list = expenses.filter((e) => e.id !== id);
    setExpenses(list);
    storageService.saveExpenses(business.id, list);
    showToast('Despesa excluída.');
  };

  const updateBusiness = (updated: Business) => {
    setBusiness(updated);
    storageService.saveBusiness(updated);
    showToast('Dados do mercado atualizados.');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        currentLanguage: language,
        setLanguage,
        t,
        formatCurrency,
        formatDateLocal,
        formatDateTimeLocal,
        session,
        isOwner: session?.role === 'PROPRIETARIO',
        isSeller: session?.role === 'VENDEDOR',
        registerOwner,
        loginOwner,
        recoverAccountWithCode,
        updateOwnerAccount,
        createBusiness,
        loginSeller,
        logout,
        currentAccount,
        accessStatus,
        daysRemaining,
        expiryDateDisplay,
        planType,
        expirationWarning,
        isAccessBlockedOrExpired,
        openBuyPlanModal,
        openReferralModal,
        openAccountInfoModal,
        openAdminModal,
        refreshAccountState,
        activeTab,
        setActiveTab,
        sellerTab,
        setSellerTab,
        subView,
        setSubView,
        selectedProductId,
        setSelectedProductId,
        selectedSellerId,
        setSelectedSellerId,
        business,
        products,
        sales,
        stockMovements,
        sellers,
        notifications,
        unreadNotificationCount,
        expenses,
        deliveries,
        closures,
        addProduct,
        updateProduct,
        deleteProduct,
        addStock,
        withdrawStock,
        recordSale,
        recordCashDelivery,
        closeShift,
        confirmDeliveryByOwner,
        addSeller,
        updateSeller,
        deleteSeller,
        markNotificationRead,
        markAllNotificationsRead,
        addExpense,
        deleteExpense,
        updateBusiness,
        toastMessage,
        showToast,
        reloadBusinessData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
