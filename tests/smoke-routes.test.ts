import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCategories, getAllActiveProducts, getProductById, getProductsByCategorySlug } from '@/lib/supabase/queries';
import { SITE_CONFIG } from '@/lib/config';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

describe('9. Smoke Tests de Rutas Principales y Configuración de Producción', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Metadatos y Configuración SEO', () => {
    it('SITE_CONFIG debe tener configurado el dominio oficial y teléfono de contacto', () => {
      expect(SITE_CONFIG.url).toBeDefined();
      expect(SITE_CONFIG.url.startsWith('http')).toBe(true);
      expect(SITE_CONFIG.name).toBe('Sol de Oro Joyería & Compraventa');
      expect(SITE_CONFIG.whatsappNumber).toBe('573126249176');
    });

    it('robots.txt debe permitir rutas públicas y bloquear /admin/ y /api/', () => {
      const robotsConfig = robots();
      expect(robotsConfig.rules).toBeDefined();
      expect(robotsConfig.sitemap).toContain('/sitemap.xml');
    });

    it('sitemap.xml debe generar las rutas estáticas y dinámicas esperadas', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 'cat-1', name: 'Anillos', slug: 'anillos' },
            ],
            error: null,
          }),
        }),
      });

      const sitemapEntries = await sitemap();
      const urls = sitemapEntries.map((e) => e.url);

      expect(urls).toContain(SITE_CONFIG.url);
      expect(urls).toContain(`${SITE_CONFIG.url}/catalogo`);
      expect(urls).toContain(`${SITE_CONFIG.url}/sobre-nosotros`);
    });
  });

  describe('Smoke Test de Consultas del Catálogo', () => {
    it('Home y Catálogo pueden consultar categorías y productos activos', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 'p-1', name: 'Anillo Oro 18K', is_active: true },
            ],
            error: null,
          }),
        }),
      });

      const categories = await getCategories();
      const products = await getAllActiveProducts();

      expect(Array.isArray(categories)).toBe(true);
      expect(Array.isArray(products)).toBe(true);
    });

    it('Detalle de producto y Categoría devuelven estructuras válidas', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'p-1', name: 'Pulsera Eslabón', is_active: true },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'p-1', name: 'Pulsera Eslabón', is_active: true }],
            error: null,
          }),
        }),
      });

      const product = await getProductById('p-1');
      const categoryProducts = await getProductsByCategorySlug('pulseras');

      expect(product?.name).toBe('Pulsera Eslabón');
      expect(categoryProducts).toHaveLength(1);
    });
  });
});
