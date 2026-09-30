import { OwnerAccount } from '../types';
import { storageService } from './storage';
import { calculateNewExpiry } from './plansService';

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MF-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getReferralUrl(code: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?ref=${encodeURIComponent(code)}`;
}

export function getReferralStats(referralCode: string): {
  totalInvited: number;
  activeConverted: number;
  daysEarned: number;
} {
  if (!referralCode) {
    return { totalInvited: 0, activeConverted: 0, daysEarned: 0 };
  }

  const allAccounts = storageService.getOwnerAccounts();
  const invitedAccounts = allAccounts.filter(
    (acc) => acc.referredBy && acc.referredBy.toUpperCase() === referralCode.toUpperCase()
  );

  const totalInvited = invitedAccounts.length;
  const activeConverted = invitedAccounts.filter((acc) => acc.referralRewardGranted).length;
  const daysEarned = activeConverted * 3;

  return {
    totalInvited,
    activeConverted,
    daysEarned
  };
}

/**
 * Checks and triggers referral reward for the referrer if this account is active
 * and hasn't granted the reward yet.
 */
export function checkAndRewardReferrer(account: OwnerAccount): boolean {
  if (!account.referredBy || account.referralRewardGranted) {
    return false;
  }

  const allAccounts = storageService.getOwnerAccounts();
  const referrer = allAccounts.find(
    (a) => a.referralCode && a.referralCode.toUpperCase() === account.referredBy?.toUpperCase()
  );

  if (!referrer) {
    return false;
  }

  // Grant +3 days to referrer
  const newExpiry = calculateNewExpiry(referrer.accessExpiresAt, 3);
  referrer.accessExpiresAt = newExpiry;
  if (referrer.accessStatus === 'EXPIRED') {
    referrer.accessStatus = 'ACTIVE';
  }
  storageService.saveOwnerAccount(referrer);

  // Mark this account as having granted the reward
  account.referralRewardGranted = true;
  storageService.saveOwnerAccount(account);

  // Also send an in-app notification to the referrer's business if it exists
  const businesses = storageService.getBusinesses().filter((b) => b.ownerAccountId === referrer.id);
  if (businesses.length > 0) {
    const biz = businesses[0];
    const notifs = storageService.getNotifications(biz.id);
    notifs.unshift({
      id: `notif_ref_${Date.now()}`,
      businessId: biz.id,
      titulo: '🎉 Convite confirmado!',
      mensagem: `Um mercado que você convidou começou a utilizar o Mercado Fácil! Você ganhou +3 dias grátis somados ao seu acesso.`,
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      timestamp: Date.now(),
      lida: false,
      tipo: 'SISTEMA'
    });
    storageService.saveNotifications(biz.id, notifs);
  }

  return true;
}
