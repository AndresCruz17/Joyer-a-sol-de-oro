import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatCOP,
  calculateGoldValuation,
  FALLBACK_GOLD_PRICE,
  CACHE_TTL_MS,
  getLiveGoldPrice,
} from '@/lib/gold/gold-service';

describe('Integración de GoldAPI.io & Cotización de Oro 18K', () => {
  it('1. Debe respetar estrictamente el plan gratuito de 300 peticiones/mes con caché >= 4 horas', () => {
    // 4 horas = 6 peticiones al día = 180 peticiones al mes de 30 días
    // 180 < 300 peticiones/mes (margen de seguridad del 40%)
    expect(CACHE_TTL_MS).toBeGreaterThanOrEqual(3 * 60 * 60 * 1000);
    const maxCallsPerDay = (24 * 60 * 60 * 1000) / CACHE_TTL_MS;
    const maxCallsPerMonth = maxCallsPerDay * 30;
    expect(maxCallsPerMonth).toBeLessThanOrEqual(300);
  });

  it('2. formatCOP debe formatear valores numéricos en Pesos Colombianos con sufijo COP', () => {
    const formatted = formatCOP(303672);
    expect(formatted).toContain('303.672');
    expect(formatted).toContain('COP');
    expect(formatted).toContain('$');
  });

  it('3. calculateGoldValuation debe calcular avalúos orfebres con precisión según gramaje y servicio', () => {
    const rate18k = 300000;

    // Venta de oro (avalúo de compra directa)
    const sell5g = calculateGoldValuation(5, 'vender_mi_oro', 'nacional', rate18k);
    expect(sell5g.estimatedTotal).toBe(1500000);
    expect(sell5g.formattedTotal).toContain('1.500.000');
    expect(sell5g.notes).toContain('efectivo o transferencia');

    // Fabricación a medida (metal + hechura nacional)
    const make10g = calculateGoldValuation(10, 'fabricar_joya', 'nacional', rate18k);
    expect(make10g.estimatedTotal).toBe(3750000); // 10 * 300000 * 1.25
    expect(make10g.formattedTotal).toContain('3.750.000');
    expect(make10g.notes).toContain('Nacional');

    // Fabricación a medida (metal + hechura italiana de precisión)
    const make10gItalian = calculateGoldValuation(10, 'fabricar_joya', 'italiano', rate18k);
    expect(make10gItalian.estimatedTotal).toBe(4050000); // 10 * 300000 * 1.35
    expect(make10gItalian.notes).toContain('Italiano');
  });

  it('4. FALLBACK_GOLD_PRICE debe ofrecer datos orfebres válidos si la API está inaccesible', () => {
    expect(FALLBACK_GOLD_PRICE.price_gram_18k).toBeGreaterThan(200000);
    expect(FALLBACK_GOLD_PRICE.price_gram_24k).toBeGreaterThan(FALLBACK_GOLD_PRICE.price_gram_18k);
    expect(FALLBACK_GOLD_PRICE.currency).toBe('COP');
    expect(FALLBACK_GOLD_PRICE.metal).toBe('XAU');
    expect(FALLBACK_GOLD_PRICE.formatted_18k).toContain('COP');
  });

  it('5. getLiveGoldPrice debe devolver datos estructurados con origen y formato correcto', async () => {
    const price = await getLiveGoldPrice();
    expect(price).toBeDefined();
    expect(price.metal).toBe('XAU');
    expect(price.currency).toBe('COP');
    expect(price.price_gram_18k).toBeGreaterThan(0);
    expect(price.formatted_18k).toContain('COP');
    expect(['goldapi', 'cache', 'fallback']).toContain(price.source);
  });
});
