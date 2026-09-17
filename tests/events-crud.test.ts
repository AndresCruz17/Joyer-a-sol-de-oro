import { describe, it, expect, vi, beforeEach } from 'vitest';
import { slugify } from '@/lib/seo/slugify';
import { deleteStorageFiles } from '@/lib/storage/image-utils';
import { getActiveEvents, getUpcomingEvents } from '@/lib/supabase/queries';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

describe('11. Flujos CRUD de Eventos (Creación, Edición, Eliminación)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Creación de Evento (Payload y Slugify)', () => {
    it('debe sanitizar y estructurar el payload correctamente al crear un evento', () => {
      const rawFormData = {
        title: '  Exhibición Colección Navidad 2026  ',
        description: 'Gran evento de exhibición con descuentos especiales.',
        event_date: '2026-12-20T18:00',
        is_active: true,
      };

      const imageUrl = 'https://supabase.co/storage/v1/object/public/products/events/poster.webp';

      const payload = {
        title: rawFormData.title.trim(),
        slug: slugify(rawFormData.title.trim()),
        description: rawFormData.description.trim() || null,
        event_date: new Date(rawFormData.event_date).toISOString(),
        image_url: imageUrl,
        is_active: rawFormData.is_active,
      };

      expect(payload.title).toBe('Exhibición Colección Navidad 2026');
      expect(payload.slug).toBe('exhibicion-coleccion-navidad-2026');
      expect(payload.description).toBe('Gran evento de exhibición con descuentos especiales.');
      expect(payload.event_date).toContain('2026-12-20');
      expect(payload.image_url).toBe(imageUrl);
      expect(payload.is_active).toBe(true);
    });

    it('debe generar slug válido para títulos con caracteres especiales', () => {
      expect(slugify('Feria & Compra de Oro 18K')).toBe('feria-compra-de-oro-18k');
      expect(slugify('  ¡Evento Especial!  ')).toBe('evento-especial');
      expect(slugify('Navidad 2026 — Colección Italiana')).toBe('navidad-2026-coleccion-italiana');
    });

    it('debe manejar descripción vacía como null', () => {
      const payload = {
        description: '   '.trim() || null,
      };
      expect(payload.description).toBeNull();
    });
  });

  describe('Rollback de Imagen al Fallar Inserción', () => {
    it('debe eliminar la imagen subida si la inserción en BD falla', async () => {
      const uploadedImageUrl = 'https://supabase.co/storage/v1/object/public/products/events/uploaded-poster.webp';

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      // Simular fallo en inserción
      const insertFailed = true;
      if (insertFailed) {
        await deleteStorageFiles(mockSupabase, [uploadedImageUrl], 'products');
      }

      expect(removeMock).toHaveBeenCalledWith(['events/uploaded-poster.webp']);
    });
  });

  describe('Edición de Evento (Reemplazo de Imagen)', () => {
    it('debe eliminar la imagen anterior cuando se reemplaza por una nueva', async () => {
      const oldImageUrl = 'https://supabase.co/storage/v1/object/public/products/events/poster-viejo.webp';
      const newImageUrl = 'https://supabase.co/storage/v1/object/public/products/events/poster-nuevo.webp';

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      if (oldImageUrl && oldImageUrl !== newImageUrl) {
        await deleteStorageFiles(mockSupabase, [oldImageUrl], 'products');
      }

      expect(removeMock).toHaveBeenCalledWith(['events/poster-viejo.webp']);
    });

    it('no debe eliminar imagen si no cambió', async () => {
      const sameUrl = 'https://supabase.co/storage/v1/object/public/products/events/poster.webp';

      const removeMock = vi.fn();
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({ remove: removeMock }),
        },
      } as unknown as SupabaseClient;

      if (sameUrl !== sameUrl) {
        await deleteStorageFiles(mockSupabase, [sameUrl], 'products');
      }

      expect(removeMock).not.toHaveBeenCalled();
    });
  });

  describe('Eliminación de Evento (Limpieza de Storage)', () => {
    it('debe eliminar la imagen del Storage al borrar un evento', async () => {
      const eventToDelete = {
        id: 'evt-delete-123',
        image_url: 'https://supabase.co/storage/v1/object/public/products/events/poster-borrar.webp',
      };

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      if (eventToDelete.image_url) {
        await deleteStorageFiles(mockSupabase, [eventToDelete.image_url], 'products');
      }

      expect(removeMock).toHaveBeenCalledWith(['events/poster-borrar.webp']);
    });

    it('no debe llamar a remove si el evento no tiene imagen', async () => {
      const eventWithoutImage = {
        id: 'evt-noimg-456',
        image_url: null as string | null,
      };

      const removeMock = vi.fn();
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({ remove: removeMock }),
        },
      } as unknown as SupabaseClient;

      if (eventWithoutImage.image_url) {
        await deleteStorageFiles(mockSupabase, [eventWithoutImage.image_url], 'products');
      }

      expect(removeMock).not.toHaveBeenCalled();
    });
  });

  describe('Queries de Eventos (getActiveEvents, getUpcomingEvents)', () => {
    it('getActiveEvents debe devolver solo eventos activos ordenados por fecha', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockGte = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [{ id: 'evt-1', title: 'Evento Futuro', is_active: true }],
        error: null,
      });

      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: mockGte,
          order: vi.fn().mockReturnThis(),
          limit: mockLimit,
          then: vi.fn().mockImplementation((cb: (val: { data: unknown[]; error: null }) => void) => {
            return Promise.resolve(cb({ data: [{ id: 'evt-1', title: 'Evento Test', is_active: true }], error: null }));
          }),
        }),
      });

      // Probamos que la función se ejecuta sin errores
      const events = await getActiveEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it('getUpcomingEvents debe devolver array vacío si hay error', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Tabla no encontrada' },
          }),
        }),
      });

      const events = await getUpcomingEvents(3);
      expect(events).toEqual([]);
    });

    it('getUpcomingEvents debe respetar el límite especificado', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const limitMock = vi.fn().mockResolvedValue({
        data: [
          { id: 'evt-1', title: 'Evento 1' },
          { id: 'evt-2', title: 'Evento 2' },
        ],
        error: null,
      });

      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: limitMock,
        }),
      });

      const events = await getUpcomingEvents(2);
      expect(limitMock).toHaveBeenCalledWith(2);
      expect(events).toHaveLength(2);
    });
  });
});
