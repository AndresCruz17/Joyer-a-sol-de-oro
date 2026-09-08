import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllActiveProducts,
  getFeaturedProducts,
  getProductsByCategorySlug,
  getProductBySlug,
  getProductById,
  getRelatedActiveProducts,
  getCategories,
} from '@/lib/supabase/queries';

// Mock de createClient
vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

describe('4. Visibilidad Correcta del Catálogo Público (is_active = true)', () => {
  let queryBuilderMock: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    neq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryBuilderMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };
  });

  it('getAllActiveProducts() debe filtrar obligatoriamente por is_active = true y usar select explícito', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    queryBuilderMock.order.mockResolvedValueOnce({
      data: [{ id: 'prod-1', name: 'Cadena de Oro', is_active: true }],
      error: null,
    });

    const products = await getAllActiveProducts();

    expect(queryBuilderMock.select).toHaveBeenCalledWith(
      'id, name, slug, description, price, weight_grams, image_url, category_id, created_at, categories(name, slug)'
    );
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_active', true);
    expect(products).toHaveLength(1);
  });

  it('getFeaturedProducts() debe filtrar por is_active = true y is_featured = true', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    queryBuilderMock.limit.mockResolvedValueOnce({
      data: [{ id: 'prod-feat-1', name: 'Anillo Diamante', is_active: true, is_featured: true }],
      error: null,
    });

    const featured = await getFeaturedProducts(4);

    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_active', true);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_featured', true);
    expect(queryBuilderMock.limit).toHaveBeenCalledWith(4);
    expect(featured).toHaveLength(1);
  });

  it('getProductsByCategorySlug() debe filtrar por is_active = true y slug de categoría', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    queryBuilderMock.order.mockResolvedValueOnce({
      data: [{ id: 'prod-cat-1', name: 'Pulsera Cubana', is_active: true }],
      error: null,
    });

    const products = await getProductsByCategorySlug('pulseras');

    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_active', true);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('categories.slug', 'pulseras');
    expect(products).toHaveLength(1);
  });

  it('getProductBySlug() debe filtrar por is_active = true y devolver null ante producto inactivo o inexistente', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    // Simulando que el producto inactivo no es devuelto por la consulta filtrada
    queryBuilderMock.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const product = await getProductBySlug('anillo-retirado');

    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_active', true);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('slug', 'anillo-retirado');
    expect(product).toBeNull();
  });

  it('getProductById() debe filtrar por is_active = true', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    queryBuilderMock.maybeSingle.mockResolvedValueOnce({
      data: { id: 'uuid-123', name: 'Dije Cruz', is_active: true },
      error: null,
    });

    const product = await getProductById('uuid-123');

    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_active', true);
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('id', 'uuid-123');
    expect(product?.name).toBe('Dije Cruz');
  });

  it('getRelatedActiveProducts() debe excluir el producto actual y filtrar is_active = true', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    queryBuilderMock.limit.mockResolvedValueOnce({
      data: [{ id: 'prod-related-2', name: 'Aretes Perla', is_active: true }],
      error: null,
    });

    const related = await getRelatedActiveProducts('cat-1', 'prod-1', 3);

    expect(queryBuilderMock.eq).toHaveBeenCalledWith('category_id', 'cat-1');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('is_active', true);
    expect(queryBuilderMock.neq).toHaveBeenCalledWith('id', 'prod-1');
    expect(queryBuilderMock.limit).toHaveBeenCalledWith(3);
    expect(related).toHaveLength(1);
  });

  it('getCategories() debe ordenar alfabéticamente y seleccionar columnas explícitas', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      from: vi.fn().mockReturnValue(queryBuilderMock),
    });

    queryBuilderMock.order.mockResolvedValueOnce({
      data: [
        { id: 'cat-1', name: 'Anillos', slug: 'anillos' },
        { id: 'cat-2', name: 'Cadenas', slug: 'cadenas' },
      ],
      error: null,
    });

    const categories = await getCategories();

    expect(queryBuilderMock.select).toHaveBeenCalledWith('id, name, slug, image_url, description');
    expect(queryBuilderMock.order).toHaveBeenCalledWith('name', { ascending: true });
    expect(categories).toHaveLength(2);
  });
});
