import {
  OwnerAccount,
  Business,
  Seller,
  Product,
  Sale,
  StockMovement,
  AppNotification,
  Expense,
  UserSession,
  ThemeMode,
  CashDelivery,
  ShiftClosure
} from '../types';

export const GLOBAL_KEYS = {
  THEME: 'mf_theme',
  OWNER_ACCOUNTS: 'mf_owner_accounts',
  BUSINESSES: 'mf_businesses',
  ACTIVE_SESSION: 'mf_active_session'
};

export function getBusinessKeys(businessId: string) {
  return {
    PRODUCTS: `mf_products_${businessId}`,
    SALES: `mf_sales_${businessId}`,
    MOVEMENTS: `mf_movements_${businessId}`,
    SELLERS: `mf_sellers_${businessId}`,
    NOTIFICATIONS: `mf_notifications_${businessId}`,
    EXPENSES: `mf_expenses_${businessId}`,
    DELIVERIES: `mf_deliveries_${businessId}`,
    CLOSURES: `mf_closures_${businessId}`
  };
}

export function formatDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTime(date: Date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function generateMarketCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MF-${num}`;
}

export function generateAccountCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'MF-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key "${key}" to localStorage:`, err);
  }
}

export const storageService = {
  getTheme(): ThemeMode {
    return (localStorage.getItem(GLOBAL_KEYS.THEME) as ThemeMode) || 'dark';
  },

  setTheme(mode: ThemeMode): void {
    localStorage.setItem(GLOBAL_KEYS.THEME, mode);
  },

  getOwnerAccounts(): OwnerAccount[] {
    const list = getItem<OwnerAccount[]>(GLOBAL_KEYS.OWNER_ACCOUNTS, []);
    let modified = false;
    const normalized = list.map((acc) => {
      let changed = false;
      const updated = { ...acc };
      if (!updated.accountCode) {
        updated.accountCode = generateAccountCode();
        changed = true;
      }
      if (!updated.country) {
        updated.country = 'MZ';
        changed = true;
      }
      if (!updated.currency) {
        updated.currency = 'MZN';
        changed = true;
      }
      if (!updated.language) {
        updated.language = 'pt';
        changed = true;
      }
      if (changed) modified = true;
      return updated;
    });

    if (modified) {
      setItem(GLOBAL_KEYS.OWNER_ACCOUNTS, normalized);
    }
    return normalized;
  },

  getOwnerAccountById(idOrCode: string): OwnerAccount | null {
    const clean = idOrCode.trim().toUpperCase();
    const accounts = this.getOwnerAccounts();
    return (
      accounts.find(
        (a) =>
          a.id.toUpperCase() === clean ||
          (a.accountCode && a.accountCode.toUpperCase() === clean)
      ) || null
    );
  },

  getOwnerAccountByRecoveryCode(code: string): OwnerAccount | null {
    const clean = code.trim().toUpperCase().replace(/\s+/g, '');
    const accounts = this.getOwnerAccounts();
    const now = new Date().toISOString();
    return (
      accounts.find((a) => {
        if (!a.recoveryCode) return false;
        if (a.recoveryCode.used) return false;
        if (a.recoveryCode.expiresAt && a.recoveryCode.expiresAt < now) return false;
        return a.recoveryCode.code.toUpperCase().replace(/\s+/g, '') === clean;
      }) || null
    );
  },

  saveOwnerAccount(account: OwnerAccount): void {
    const list = this.getOwnerAccounts();
    const existingIndex = list.findIndex((a) => a.id === account.id);
    if (existingIndex >= 0) {
      list[existingIndex] = account;
    } else {
      list.push(account);
    }
    setItem(GLOBAL_KEYS.OWNER_ACCOUNTS, list);
  },

  getBusinesses(): Business[] {
    return getItem<Business[]>(GLOBAL_KEYS.BUSINESSES, []);
  },

  getBusinessById(id: string): Business | null {
    const list = this.getBusinesses();
    return list.find((b) => b.id === id) || null;
  },

  getBusinessByCode(code: string): Business | null {
    const list = this.getBusinesses();
    return list.find((b) => b.code.toUpperCase() === code.trim().toUpperCase()) || null;
  },

  saveBusiness(business: Business): void {
    const list = this.getBusinesses();
    const index = list.findIndex((b) => b.id === business.id);
    if (index >= 0) {
      list[index] = business;
    } else {
      list.push(business);
    }
    setItem(GLOBAL_KEYS.BUSINESSES, list);
  },

  getActiveSession(): UserSession | null {
    return getItem<UserSession | null>(GLOBAL_KEYS.ACTIVE_SESSION, null);
  },

  setActiveSession(session: UserSession | null): void {
    if (session) {
      setItem(GLOBAL_KEYS.ACTIVE_SESSION, session);
    } else {
      localStorage.removeItem(GLOBAL_KEYS.ACTIVE_SESSION);
    }
  },

  // Isolated data methods
  getProducts(businessId: string): Product[] {
    const keys = getBusinessKeys(businessId);
    return getItem<Product[]>(keys.PRODUCTS, []);
  },

  saveProducts(businessId: string, products: Product[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.PRODUCTS, products);
  },

  getSales(businessId: string): Sale[] {
    const keys = getBusinessKeys(businessId);
    return getItem<Sale[]>(keys.SALES, []);
  },

  saveSales(businessId: string, sales: Sale[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.SALES, sales);
  },

  getStockMovements(businessId: string): StockMovement[] {
    const keys = getBusinessKeys(businessId);
    return getItem<StockMovement[]>(keys.MOVEMENTS, []);
  },

  saveStockMovements(businessId: string, movements: StockMovement[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.MOVEMENTS, movements);
  },

  getSellers(businessId: string): Seller[] {
    const keys = getBusinessKeys(businessId);
    return getItem<Seller[]>(keys.SELLERS, []);
  },

  saveSellers(businessId: string, sellers: Seller[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.SELLERS, sellers);
  },

  getNotifications(businessId: string): AppNotification[] {
    const keys = getBusinessKeys(businessId);
    return getItem<AppNotification[]>(keys.NOTIFICATIONS, []);
  },

  saveNotifications(businessId: string, notifications: AppNotification[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.NOTIFICATIONS, notifications);
  },

  getExpenses(businessId: string): Expense[] {
    const keys = getBusinessKeys(businessId);
    return getItem<Expense[]>(keys.EXPENSES, []);
  },

  saveExpenses(businessId: string, expenses: Expense[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.EXPENSES, expenses);
  },

  getCashDeliveries(businessId: string): CashDelivery[] {
    const keys = getBusinessKeys(businessId);
    return getItem<CashDelivery[]>(keys.DELIVERIES, []);
  },

  saveCashDeliveries(businessId: string, deliveries: CashDelivery[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.DELIVERIES, deliveries);
  },

  getShiftClosures(businessId: string): ShiftClosure[] {
    const keys = getBusinessKeys(businessId);
    return getItem<ShiftClosure[]>(keys.CLOSURES, []);
  },

  saveShiftClosures(businessId: string, closures: ShiftClosure[]): void {
    const keys = getBusinessKeys(businessId);
    setItem(keys.CLOSURES, closures);
  },

  initializeDemoDataIfEmpty(): void {
    const accounts = this.getOwnerAccounts();
    if (accounts.length > 0) return;

    const demoOwner: OwnerAccount = {
      id: 'owner_demo_1',
      accountCode: 'MF-DEMO1',
      name: 'Manuel Silva',
      email: 'demo@mercadofacil.mz',
      phone: '+258 84 123 4567',
      country: 'MZ',
      currency: 'MZN',
      language: 'pt',
      password: '123',
      createdAt: formatDate(),
      accessStatus: 'ACTIVE',
      planType: 'ANUAL',
      trialStartedAt: formatDate(),
      trialExpiresAt: formatDate(),
      trialUsed: true,
      accessStartedAt: formatDate(),
      accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      referralCode: 'MF-DEMO01',
      referralRewardGranted: true,
      isRealAccount: false
    };
    this.saveOwnerAccount(demoOwner);

    const demoBusiness: Business = {
      id: 'biz_demo_1',
      ownerAccountId: demoOwner.id,
      name: 'Mercado Central',
      ownerName: demoOwner.name,
      phone: '+258 84 123 4567',
      currency: 'MT',
      code: 'MF-4821',
      createdAt: formatDate()
    };
    this.saveBusiness(demoBusiness);

    const demoSeller: Seller = {
      id: 'seller_demo_1',
      businessId: demoBusiness.id,
      name: 'João Vendedor',
      pin: '1234',
      active: true,
      phone: '+258 82 987 6543',
      createdAt: formatDate()
    };
    this.saveSellers(demoBusiness.id, [demoSeller]);

    const demoProducts: Product[] = [
      {
        id: 'prod_arroz_25kg',
        businessId: demoBusiness.id,
        nome: 'Arroz 25kg',
        unidade: 'saco',
        precoCompra: 1200,
        precoVendaSugerido: 1500,
        estoqueAtual: 4,
        estoqueMinimo: 5,
        ativo: true,
        criadoEm: formatDate()
      },
      {
        id: 'prod_oleo_5l',
        businessId: demoBusiness.id,
        nome: 'Óleo de Cozinha 5L',
        unidade: 'garrafa',
        precoCompra: 550,
        precoVendaSugerido: 700,
        estoqueAtual: 18,
        estoqueMinimo: 6,
        ativo: true,
        criadoEm: formatDate()
      },
      {
        id: 'prod_farinha_10kg',
        businessId: demoBusiness.id,
        nome: 'Farinha de Milho 10kg',
        unidade: 'saco',
        precoCompra: 400,
        precoVendaSugerido: 520,
        estoqueAtual: 12,
        estoqueMinimo: 4,
        ativo: true,
        criadoEm: formatDate()
      },
      {
        id: 'prod_acucar_1kg',
        businessId: demoBusiness.id,
        nome: 'Açúcar Moreno 1kg',
        unidade: 'pacote',
        precoCompra: 65,
        precoVendaSugerido: 85,
        estoqueAtual: 3,
        estoqueMinimo: 10,
        ativo: true,
        criadoEm: formatDate()
      }
    ];
    this.saveProducts(demoBusiness.id, demoProducts);

    const demoMovements: StockMovement[] = demoProducts.map((p) => ({
      id: generateId('mov_init'),
      businessId: demoBusiness.id,
      produtoId: p.id,
      produtoNome: p.nome,
      unidade: p.unidade,
      tipo: 'ENTRADA',
      quantidade: p.estoqueAtual + 1,
      estoqueAnterior: 0,
      novoEstoque: p.estoqueAtual + 1,
      precoCompraUnitario: p.precoCompra,
      motivo: 'Estoque inicial',
      data: formatDate(),
      hora: '08:00',
      timestamp: Date.now() - 3600 * 1000 * 5,
      usuarioNome: demoOwner.name
    }));
    this.saveStockMovements(demoBusiness.id, demoMovements);

    const demoSale: Sale = {
      id: generateId('sale'),
      businessId: demoBusiness.id,
      data: formatDate(),
      hora: '10:32',
      timestamp: Date.now() - 3600 * 1000 * 2,
      itens: [
        {
          produtoId: 'prod_arroz_25kg',
          nome: 'Arroz 25kg',
          unidade: 'saco',
          quantidade: 1,
          precoCompra: 1200,
          precoVendaReal: 1500,
          subtotal: 1500,
          custoTotal: 1200,
          lucro: 300
        }
      ],
      subtotal: 1500,
      total: 1500,
      formaPagamento: 'Dinheiro',
      vendedorNome: demoSeller.name,
      vendedorId: demoSeller.id,
      custoTotal: 1200,
      lucro: 300,
      observacao: 'Venda de balcão'
    };
    this.saveSales(demoBusiness.id, [demoSale]);

    const demoNotification: AppNotification = {
      id: generateId('notif'),
      businessId: demoBusiness.id,
      titulo: '🔔 Nova Venda Registrada',
      mensagem: `${demoSeller.name} vendeu Arroz 25kg × 1 por 1.500 MT às 10:32. Estoque restante: 4 sacos.`,
      data: formatDate(),
      hora: '10:32',
      timestamp: Date.now() - 3600 * 1000 * 2,
      lida: false,
      tipo: 'VENDA',
      produtoId: 'prod_arroz_25kg'
    };
    this.saveNotifications(demoBusiness.id, [demoNotification]);
  }
};
