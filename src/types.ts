export type ThemeMode = 'dark' | 'light';

export type UserRole = 'PROPRIETARIO' | 'VENDEDOR';

export type ProductUnit = 
  | 'unidade' 
  | 'kg' 
  | 'saco' 
  | 'caixa' 
  | 'pacote' 
  | 'garrafa' 
  | 'litro' 
  | 'outro';

export type StockWithdrawalReason = 
  | 'Consumo próprio'
  | 'Produto danificado'
  | 'Perda'
  | 'Produto vencido'
  | 'Outro';

export type PaymentMethod = 'Dinheiro' | 'M-Pesa' | 'e-Mola' | 'Outro';

export type AccountAccessStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'BLOCKED';

export type PlanType = 'TRIAL' | 'SEMANAL' | 'MENSAL' | 'SEMESTRAL' | 'ANUAL' | 'PERSONALIZADO';

export interface PlanConfig {
  id: PlanType;
  nome: string;
  duracaoDias: number;
  precoMt: number;
  destaque?: boolean;
}

export interface AccountRecoveryCode {
  code: string; // Ex: REC-9482-MF
  createdAt: string;
  expiresAt: string; // Validade de 24h a 48h
  used?: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: 'ADD_DAYS' | 'REMOVE_DAYS' | 'BLOCK' | 'RESTORE' | 'GENERATE_RECOVERY' | 'RESET_PIN' | 'NOTE';
  description: string;
  timestamp: number;
  adminName: string;
}

export interface PlanPurchaseHistoryRecord {
  id: string;
  planId: PlanType;
  planName: string;
  duracaoDias: number;
  basePriceMzn: number;
  currency: string;
  convertedPriceDisplay: string;
  exchangeRate?: number;
  timestamp: number;
  date: string;
  activationStatus: 'ATIVO' | 'CONCLUIDO';
  activatedBy: string;
}

export interface OwnerAccount {
  id: string;
  accountCode: string; // Ex: "MF-7X29K" - Identificador único da conta
  name: string;
  email: string;
  phone?: string; // Telefone com DDI internacional (Ex: +258 84 123 4567)
  country?: string; // Código do país (MZ, BR, PT, AO, CV, ZA, US)
  language?: string; // Idioma da conta (pt, pt-BR, en, es, fr)
  currency?: string; // Moeda da conta (MZN, BRL, EUR, AOA, CVE, ZAR, USD)
  password: string;
  createdAt: string;
  // Campos de controle de planos e acesso
  accessStatus: AccountAccessStatus;
  planType: PlanType;
  trialStartedAt: string;
  trialExpiresAt: string;
  trialUsed: boolean;
  accessStartedAt: string;
  accessExpiresAt: string; // Data ISO ou YYYY-MM-DD
  lastLoginAt: string;
  lastActivityAt: string;
  activeDaysInLastWeek?: number;
  referralCode: string; // Ex: MF-782910
  referredBy?: string; // Código de quem convidou
  referralRewardGranted?: boolean; // Se gerou +3 dias ao convidador
  isRealAccount?: boolean; // Identifica se é conta real criada por usuário
  recoveryCode?: AccountRecoveryCode; // Código de recuperação gerado pelo administrador
  adminAuditLogs?: AdminAuditLog[]; // Histórico administrativo seguro
  planHistory?: PlanPurchaseHistoryRecord[]; // Histórico de planos e câmbio registrado
  lastExchangeRateUsed?: { rate: number; currency: string; updatedAt: string; isFallback?: boolean };
}

export interface Business {
  id: string;
  ownerAccountId: string;
  name: string;
  ownerName: string;
  phone: string;
  currency: string; // Padrão: 'MT'
  code: string; // Código de 6 caracteres (Ex: MF-4821)
  createdAt: string;
}

export interface Seller {
  id: string;
  businessId: string;
  name: string;
  pin: string; // PIN de 4 dígitos criado pelo proprietário
  active: boolean;
  phone?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  nome: string;
  unidade: ProductUnit;
  precoCompra: number; // Custo unitário
  precoVendaSugerido: number; // Preço sugerido de tabela (editável na venda)
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  foto?: string; // Foto opcional do produto (Base64 ou URL)
  criadoEm: string;
  atualizadoEm?: string;
}

export interface SaleItem {
  produtoId: string;
  nome: string;
  unidade: ProductUnit;
  quantidade: number;
  precoCompra: number; // Custo unitário de compra
  precoVendaReal: number; // Preço negociado cobrado na venda
  subtotal: number; // precoVendaReal * quantidade
  custoTotal: number; // precoCompra * quantidade
  lucro: number; // subtotal - custoTotal
}

export interface Sale {
  id: string;
  businessId: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  timestamp: number;
  itens: SaleItem[];
  subtotal: number;
  total: number;
  formaPagamento: PaymentMethod;
  vendedorNome: string;
  vendedorId?: string;
  custoTotal: number;
  lucro: number;
  observacao?: string;
}

export type StockMovementType = 'ENTRADA' | 'SAIDA_VENDA' | 'RETIRADA' | 'AJUSTE';

export interface StockMovement {
  id: string;
  businessId: string;
  produtoId: string;
  produtoNome: string;
  unidade: ProductUnit;
  tipo: StockMovementType;
  quantidade: number; // positivo para entrada, negativo para saída
  estoqueAnterior: number;
  novoEstoque: number;
  precoCompraUnitario?: number;
  motivo?: string;
  data: string;
  hora: string;
  timestamp: number;
  usuarioNome: string;
}

export interface AppNotification {
  id: string;
  businessId: string;
  titulo: string;
  mensagem: string;
  data: string;
  hora: string;
  timestamp: number;
  lida: boolean;
  tipo: 'VENDA' | 'ESTOQUE_BAIXO' | 'SISTEMA';
  produtoId?: string;
}

export type ExpenseCategory =
  | 'Transporte'
  | 'Energia / Água'
  | 'Aluguel'
  | 'Salários / Ajudante'
  | 'Embalagens / Sacolas'
  | 'Manutenção'
  | 'Outro'
  | string;

export interface Expense {
  id: string;
  businessId: string;
  descricao: string;
  categoria: ExpenseCategory;
  valor: number;
  data: string;
  hora?: string;
  criadoPor: string;
  timestamp: number;
}

export type DeliveryStatus = 'NAO_ENTREGUE' | 'PARCIAL' | 'ENTREGUE' | 'CONFERIDO';

export interface CashDelivery {
  id: string;
  businessId: string;
  vendedorId: string;
  vendedorNome: string;
  valorEsperado: number;
  valorEntregue: number;
  diferenca: number;
  status: DeliveryStatus;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  timestamp: number;
  turnoFechado?: boolean;
  conferidoPeloDono?: boolean;
  observacao?: string;
}

export interface ShiftClosure {
  id: string;
  businessId: string;
  vendedorId: string;
  vendedorNome: string;
  data: string;
  hora: string;
  timestamp: number;
  totalVendasQtd: number;
  totalVendido: number;
  lucroGerado: number;
  valorEsperado: number;
  valorEntregue: number;
  diferenca: number;
  status: DeliveryStatus;
}

export type ActiveTab = 'inicio' | 'estoque' | 'vender' | 'lucro' | 'mais';

export type SellerTab = 'vender' | 'minhas_vendas' | 'produtos' | 'inicio';

export type SubView = 
  | 'none'
  | 'detalhe_produto'
  | 'novo_produto'
  | 'entrada_estoque'
  | 'retirada_estoque'
  | 'vendedores'
  | 'notificacoes'
  | 'historico'
  | 'despesas'
  | 'configuracoes'
  | 'baixar_app'
  | 'planos'
  | 'convite'
  | 'minha_conta'
  | 'admin';

export interface UserSession {
  role: UserRole;
  accountId?: string;
  businessId: string;
  userName: string;
  sellerId?: string;
}
