import { PlanConfig, PlanType } from '../types';
import { currencyService } from './currencyService';

export const OFFICIAL_PHONE = '846762812';
export const WHATSAPP_NUMBER = '258846762812';
export const PAYMENT_DETAILS = {
  metodo: 'M-Pesa',
  numero: '846762812',
  titular: 'Leonardo Odete'
};

export const PLANS: PlanConfig[] = [
  {
    id: 'SEMANAL',
    nome: 'Plano 7 Dias',
    duracaoDias: 7,
    precoMt: 49
  },
  {
    id: 'MENSAL',
    nome: 'Plano 1 Mês (30 dias)',
    duracaoDias: 30,
    precoMt: 149,
    destaque: true
  },
  {
    id: 'SEMESTRAL',
    nome: 'Plano 6 Meses (180 dias)',
    duracaoDias: 180,
    precoMt: 699
  },
  {
    id: 'ANUAL',
    nome: 'Plano 1 Ano (365 dias)',
    duracaoDias: 365,
    precoMt: 1199
  }
];

export function getPlanWhatsAppMessage(
  planId: PlanType,
  marketName: string = '',
  email: string = '',
  currency: string = 'MT'
): string {
  const mName = marketName.trim() || '[Ainda não cadastrado]';
  const mEmail = email.trim() || '[Ainda não cadastrado]';

  const plan = PLANS.find((p) => p.id === planId) || PLANS[1];
  const converted = currencyService.convertPlanPrice(plan.precoMt, currency);

  let priceText = '';
  if (converted.isMzn) {
    priceText = `no valor de ${plan.precoMt} MT`;
  } else {
    priceText = `(Valor: ${converted.displayPrice} | Preço-base: ${plan.precoMt} MT)`;
  }

  const durationName =
    planId === 'SEMANAL'
      ? '7 dias'
      : planId === 'MENSAL'
      ? '1 mês (30 dias)'
      : planId === 'SEMESTRAL'
      ? '6 meses'
      : '1 ano';

  return (
    `Olá! Quero adquirir o plano de ${durationName} do Mercado Fácil ${priceText}.\n\n` +
    `Nome do negócio: ${mName}\n` +
    `Email da conta: ${mEmail}`
  );
}

export function openPlanWhatsApp(
  planId: PlanType,
  marketName?: string,
  email?: string,
  currency?: string
): void {
  const message = getPlanWhatsAppMessage(planId, marketName, email, currency);
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  window.open(url, '_blank');
}

export function openGeneralWhatsApp(subject: string = 'Suporte / Dúvidas'): void {
  const message = `Olá Mercado Fácil! Gostaria de falar sobre: ${subject}`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function calculateDaysRemaining(expiresAt: string | undefined): number {
  if (!expiresAt) return 0;
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  if (isNaN(expiryTime) || expiryTime <= now) return 0;
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
}

export function calculateNewExpiry(currentExpiresAt: string | undefined, daysToAdd: number): string {
  const now = Date.now();
  let baseTime = now;
  if (currentExpiresAt) {
    const parsed = new Date(currentExpiresAt).getTime();
    if (!isNaN(parsed) && parsed > now) {
      baseTime = parsed;
    }
  }
  const newTime = baseTime + daysToAdd * 24 * 60 * 60 * 1000;
  return new Date(newTime).toISOString();
}

export function formatExpiryDateDisplay(isoString?: string): string {
  if (!isoString) return 'Não definida';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Não definida';
  return d.toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function getPlanName(planId?: PlanType | string): string {
  switch (planId) {
    case 'SEMANAL':
      return '7 Dias';
    case 'MENSAL':
      return '1 Mês (30 dias)';
    case 'SEMESTRAL':
      return '6 Meses (180 dias)';
    case 'ANUAL':
      return '1 Ano (365 dias)';
    case 'TRIAL':
      return 'Teste Grátis (7 dias)';
    default:
      return planId || 'Teste Grátis';
  }
}
