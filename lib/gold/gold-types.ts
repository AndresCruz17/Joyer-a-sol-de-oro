export interface GoldPriceResponse {
  metal: string;
  currency: string;
  exchange: string;
  symbol: string;
  timestamp: number;
  open_time?: number;
  ask?: number;
  bid?: number;
  price: number;
  ch?: number;
  chp?: number;
  price_gram_24k: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_20k?: number;
  price_gram_18k: number;
  price_gram_16k?: number;
  price_gram_14k?: number;
  price_gram_10k?: number;
}

export interface GoldPriceData {
  metal: string;
  currency: string;
  price_ounce: number;
  price_gram_24k: number;
  price_gram_18k: number;
  price_gram_14k: number;
  ch: number;
  formatted_18k: string;
  formatted_24k: string;
  formatted_ounce: string;
  updatedAt: string;
  lastUpdatedLabel: string;
  isLive: boolean;
  source: 'goldapi' | 'cache' | 'fallback';
}

/**
 * Formateador de moneda oficial en Pesos Colombianos (COP)
 */
export function formatCOP(amount: number): string {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return formatted.includes('COP') ? formatted : `${formatted} COP`;
}

/**
 * Tasa de respaldo orfebre calibrada (si la API externa no responde o se agota la cuota)
 */
export const FALLBACK_GOLD_PRICE: GoldPriceData = {
  metal: 'XAU',
  currency: 'COP',
  price_ounce: 12593684,
  price_gram_24k: 404896,
  price_gram_18k: 303672,
  price_gram_14k: 236190,
  ch: 0,
  formatted_18k: '$303.672 COP',
  formatted_24k: '$404.896 COP',
  formatted_ounce: '$12.593.684 COP',
  updatedAt: new Date().toISOString(),
  lastUpdatedLabel: 'Tasa Oficial del Día',
  isLive: false,
  source: 'fallback',
};

// CACHÉ ESTRICTO: 4 Horas (14.400.000 ms)
// Con 4 horas: 6 peticiones al día x 30 días = 180 peticiones/mes
// Respeta holgadamente el límite de 300 peticiones/mes de GoldAPI.io con 40% de margen de seguridad
export const CACHE_TTL_MS = 4 * 60 * 60 * 1000;

/**
 * Calcula el avalúo orfebre estimado según el gramaje, servicio y origen del oro
 */
export function calculateGoldValuation(
  grams: number,
  service: 'vender_mi_oro' | 'fabricar_joya' | 'comprar_joya',
  origin: 'nacional' | 'italiano',
  rate18k: number
): {
  estimatedTotal: number;
  formattedTotal: string;
  ratePerGramUsed: number;
  ratePerGramFormatted: string;
  notes: string;
} {
  let ratePerGram = rate18k;
  let notes = '';

  if (service === 'vender_mi_oro') {
    ratePerGram = rate18k;
    notes = 'Pago inmediato en efectivo o transferencia bancaria según pesaje analítico.';
  } else if (service === 'fabricar_joya') {
    const hechuraFactor = origin === 'italiano' ? 1.35 : 1.25;
    ratePerGram = rate18k * hechuraFactor;
    notes = `Incluye forja orfebre en Oro ${origin === 'italiano' ? 'Italiano' : 'Nacional'} 18K y certificado Ley 750.`;
  } else {
    const retailFactor = origin === 'italiano' ? 1.40 : 1.30;
    ratePerGram = rate18k * retailFactor;
    notes = 'Pieza lista para entrega con estuche de lujo y garantía de por vida.';
  }

  const estimatedTotal = Math.round(grams * ratePerGram);

  return {
    estimatedTotal,
    formattedTotal: formatCOP(estimatedTotal),
    ratePerGramUsed: Math.round(ratePerGram),
    ratePerGramFormatted: formatCOP(ratePerGram),
    notes,
  };
}
