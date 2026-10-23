import {
  GoldPriceResponse,
  GoldPriceData,
  FALLBACK_GOLD_PRICE,
  CACHE_TTL_MS,
  formatCOP,
} from './gold-types';

export * from './gold-types';

// Usar globalThis para persistir la caché en memoria durante desarrollo y recargas en caliente
const globalForGold = globalThis as unknown as {
  goldPriceCache?: { data: GoldPriceData; timestamp: number };
};

function formatLastUpdatedLabel(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `Actualizado hoy · ${hours}:${minutes}`;
}

/**
 * Consulta la cotización del oro en tiempo real respetando la cuota de 300 peticiones/mes
 */
export async function getLiveGoldPrice(): Promise<GoldPriceData> {
  const now = Date.now();

  // 1. Revisar caché en memoria global (4 horas TTL)
  if (globalForGold.goldPriceCache && now - globalForGold.goldPriceCache.timestamp < CACHE_TTL_MS) {
    return {
      ...globalForGold.goldPriceCache.data,
      source: 'cache',
    };
  }

  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    console.warn('⚠️ [GoldAPI]: GOLDAPI_KEY no configurada. Utilizando tasa de respaldo.');
    return globalForGold.goldPriceCache?.data || FALLBACK_GOLD_PRICE;
  }

  // 2. Realizar consulta a GoldAPI.io para XAU en Pesos Colombianos (COP)
  try {
    const response = await fetch('https://www.goldapi.io/api/XAU/COP', {
      method: 'GET',
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json',
      },
      // Revalidación nativa de Next.js (4 horas = 14400 segundos)
      next: { revalidate: 14400 },
    });

    if (!response.ok) {
      console.warn(`⚠️ [GoldAPI]: Error HTTP ${response.status} al consultar cotización. Usando caché/respaldo.`);
      return globalForGold.goldPriceCache?.data || FALLBACK_GOLD_PRICE;
    }

    const json: GoldPriceResponse = await response.json();

    if (!json.price_gram_18k || !json.price) {
      console.warn('⚠️ [GoldAPI]: Respuesta incompleta recibida de GoldAPI. Usando respaldo.');
      return globalForGold.goldPriceCache?.data || FALLBACK_GOLD_PRICE;
    }

    const updatedAtDate = new Date();
    const liveData: GoldPriceData = {
      metal: json.metal || 'XAU',
      currency: json.currency || 'COP',
      price_ounce: json.price,
      price_gram_24k: json.price_gram_24k,
      price_gram_18k: json.price_gram_18k,
      price_gram_14k: json.price_gram_14k || Math.round(json.price_gram_24k * (14 / 24)),
      ch: json.ch || 0,
      formatted_18k: formatCOP(json.price_gram_18k),
      formatted_24k: formatCOP(json.price_gram_24k),
      formatted_ounce: formatCOP(json.price),
      updatedAt: updatedAtDate.toISOString(),
      lastUpdatedLabel: formatLastUpdatedLabel(updatedAtDate),
      isLive: true,
      source: 'goldapi',
    };

    // Actualizar caché global
    globalForGold.goldPriceCache = { data: liveData, timestamp: now };

    return liveData;
  } catch (error) {
    console.error('❌ [GoldAPI Error]: Falló la petición a GoldAPI.io:', error);
    return globalForGold.goldPriceCache?.data || FALLBACK_GOLD_PRICE;
  }
}
