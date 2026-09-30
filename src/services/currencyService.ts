// Currency & Exchange Rate Service
// Manages real-time exchange rates (Base MZN), caching, fallbacks, and commercial plan price conversions

import { formatMoney } from './i18n';

export interface ExchangeRatesData {
  base: string; // "MZN"
  rates: Record<string, number>;
  lastUpdated: string; // ISO string or human-readable
  timestamp: number;
  isFallback: boolean;
  source: string;
}

export interface ConvertedPlanPrice {
  baseMzn: number;
  targetCurrency: string;
  isMzn: boolean;
  rate: number;
  rawConverted: number;
  roundedValue: number;
  displayPrice: string; // e.g. "49 MT" or "≈ R$ 4,30" or "≈ € 0,70"
  displayRateInfo: string; // e.g. "1 MZN ≈ 0,088 BRL"
  lastUpdatedText: string;
  isFallback: boolean;
}

const STORAGE_KEY_RATES = 'mf_exchange_rates_cache';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours cache

// Fallback rates if offline or API is momentarily unreachable
// Rates relative to 1 MZN (e.g. 1 MZN = ~0.088 BRL, ~0.0142 EUR, ~0.0156 USD, ~14.6 AOA, ~1.56 CVE, ~0.275 ZAR)
const INITIAL_FALLBACK_RATES: Record<string, number> = {
  MZN: 1,
  MT: 1,
  BRL: 0.0885,
  EUR: 0.0143,
  USD: 0.0156,
  AOA: 14.65,
  CVE: 1.57,
  ZAR: 0.278
};

let memoryRatesCache: ExchangeRatesData | null = null;
let isFetchingPromise: Promise<ExchangeRatesData> | null = null;

function loadStoredRates(): ExchangeRatesData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATES);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.rates && typeof parsed.rates === 'object') {
      return parsed as ExchangeRatesData;
    }
  } catch {
    // Ignore error
  }
  return null;
}

function saveStoredRates(data: ExchangeRatesData): void {
  try {
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(data));
  } catch {
    // Ignore error
  }
}

/**
 * Commercial rounding rule based on target currency
 */
export function roundCommercialPrice(value: number, currency: string): number {
  const curr = currency.toUpperCase().trim();

  // For high-denomination currencies (AOA, CVE), round to nearest whole number or 5/10 units
  if (curr === 'AOA' || curr === 'Kz') {
    return Math.round(value / 10) * 10 || Math.round(value);
  }
  if (curr === 'CVE') {
    return Math.round(value);
  }

  // For BRL, EUR, USD, ZAR: round to 2 decimals or attractive commercial increments
  if (value < 10) {
    // e.g. 4.32 -> 4.30 or 4.35
    return Math.round(value * 20) / 20;
  } else if (value < 100) {
    // e.g. 13.18 -> 13.20
    return Math.round(value * 10) / 10;
  } else {
    // e.g. 105.4 -> 105
    return Math.round(value);
  }
}

export const currencyService = {
  /**
   * Returns current exchange rates from memory, localStorage cache, or fallbacks.
   */
  getRates(): ExchangeRatesData {
    if (memoryRatesCache) return memoryRatesCache;

    const stored = loadStoredRates();
    if (stored) {
      memoryRatesCache = stored;
      return stored;
    }

    // Default fallback
    const fallbackData: ExchangeRatesData = {
      base: 'MZN',
      rates: INITIAL_FALLBACK_RATES,
      lastUpdated: new Date().toISOString(),
      timestamp: Date.now(),
      isFallback: true,
      source: 'Tabela de Referência Oficial'
    };
    memoryRatesCache = fallbackData;
    return fallbackData;
  },

  /**
   * Refreshes exchange rates from trusted public open API with caching and error fallback.
   */
  async refreshRates(force: boolean = false): Promise<ExchangeRatesData> {
    const current = this.getRates();
    const now = Date.now();

    // Re-use cache if not expired and not forced
    if (!force && !current.isFallback && now - current.timestamp < CACHE_TTL_MS) {
      return current;
    }

    if (isFetchingPromise) {
      return isFetchingPromise;
    }

    isFetchingPromise = (async () => {
      try {
        // ExchangeRate-API open access endpoint for base MZN
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch('https://open.er-api.com/v6/latest/MZN', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data && data.result === 'success' && data.rates) {
          const freshRates: Record<string, number> = {
            ...INITIAL_FALLBACK_RATES,
            ...data.rates,
            MZN: 1,
            MT: 1
          };

          const updated: ExchangeRatesData = {
            base: 'MZN',
            rates: freshRates,
            lastUpdated: data.time_last_update_utc || new Date().toISOString(),
            timestamp: Date.now(),
            isFallback: false,
            source: 'ExchangeRate API'
          };

          memoryRatesCache = updated;
          saveStoredRates(updated);
          return updated;
        }
        throw new Error('Formato inválido de resposta de câmbio');
      } catch (err) {
        console.warn('Câmbio: fonte externa indisponível, usando última taxa válida:', err);

        // Keep last valid stored rate or fallback
        const cached = loadStoredRates();
        if (cached) {
          cached.isFallback = true;
          memoryRatesCache = cached;
          return cached;
        }

        const fallback: ExchangeRatesData = {
          base: 'MZN',
          rates: INITIAL_FALLBACK_RATES,
          lastUpdated: new Date().toISOString(),
          timestamp: Date.now(),
          isFallback: true,
          source: 'Taxa de Referência'
        };
        memoryRatesCache = fallback;
        return fallback;
      } finally {
        isFetchingPromise = null;
      }
    })();

    return isFetchingPromise;
  },

  /**
   * Converts base price in MZN to the account's target currency.
   *
   * Formats cleanly:
   * - Mozambique (MZN / MT): "149 MT"
   * - Brazil (BRL): "≈ R$ 13,20"
   * - Portugal / Europe (EUR): "≈ € 2,10"
   * - Angola (AOA): "≈ 2.180 Kz"
   * - USA (USD): "≈ $ 2.30"
   */
  convertPlanPrice(baseMzn: number, targetCurrency: string = 'MZN'): ConvertedPlanPrice {
    const rawCurr = (targetCurrency || 'MZN').trim();
    const isMzn = ['MZN', 'MT', 'METICAL'].includes(rawCurr.toUpperCase());

    const ratesData = this.getRates();
    const rates = ratesData.rates || INITIAL_FALLBACK_RATES;

    // Normalizing code: 'MT' -> 'MZN', 'R$' -> 'BRL', '€' -> 'EUR', '$' -> 'USD', 'Kz' -> 'AOA'
    let normCurr = rawCurr.toUpperCase();
    if (normCurr === 'MT') normCurr = 'MZN';
    else if (normCurr === 'R$') normCurr = 'BRL';
    else if (normCurr === '€') normCurr = 'EUR';
    else if (normCurr === 'KZ') normCurr = 'AOA';

    if (isMzn) {
      return {
        baseMzn,
        targetCurrency: 'MT',
        isMzn: true,
        rate: 1,
        rawConverted: baseMzn,
        roundedValue: baseMzn,
        displayPrice: `${baseMzn.toLocaleString('pt-MZ')} MT`,
        displayRateInfo: 'Moeda-base oficial (MZN)',
        lastUpdatedText: 'Moeda-base oficial',
        isFallback: false
      };
    }

    const rate = rates[normCurr] || rates[rawCurr] || INITIAL_FALLBACK_RATES[normCurr] || 0.0885;
    const rawConverted = baseMzn * rate;
    const roundedValue = roundCommercialPrice(rawConverted, normCurr);

    const formattedLocal = formatMoney(roundedValue, normCurr);
    const displayPrice = `≈ ${formattedLocal}`;

    // Rate information
    const formattedRate = rate < 1 ? rate.toFixed(4) : rate.toFixed(2);
    const displayRateInfo = `1 MZN ≈ ${formattedRate} ${normCurr}`;

    const updateDate = new Date(ratesData.timestamp);
    const timeStr = updateDate.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    const lastUpdatedText = ratesData.isFallback
      ? `Estimativa baseada na última cotação conhecida (${displayRateInfo})`
      : `Câmbio oficial atualizado hoje às ${timeStr} (${displayRateInfo})`;

    return {
      baseMzn,
      targetCurrency: normCurr,
      isMzn: false,
      rate,
      rawConverted,
      roundedValue,
      displayPrice,
      displayRateInfo,
      lastUpdatedText,
      isFallback: ratesData.isFallback
    };
  }
};
