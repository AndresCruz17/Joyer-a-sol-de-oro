import { describe, it, expect, vi } from 'vitest';
import { slugify } from '@/lib/seo/slugify';
import { deleteStorageFiles } from '@/lib/storage/image-utils';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('6. Flujos Administrativos de Creación, Edición y Eliminación', () => {
  describe('Creación de Producto (Payload y Rollback)', () => {
    it('debe sanitizar los datos numéricos y estructurar el payload correctamente', () => {
      const rawFormData = {
        name: '  Cadena Eslabón Fino 18K  ',
        category_id: 'cat-uuid-1',
        price: '1500.50',
        weight_grams: '12.4',
        description: 'Hermosa cadena tejida a mano.',
        is_featured: true,
        is_active: true,
      };

      const mainImageUrl = 'https://supabase.co/storage/v1/object/public/products/products/main.jpg';
      const secondaryImages = [
        'https://supabase.co/storage/v1/object/public/products/products/sec1.jpg',
        'https://supabase.co/storage/v1/object/public/products/products/sec2.jpg',
      ];

      const payload = {
        name: rawFormData.name.trim(),
        slug: slugify(rawFormData.name.trim()),
        category_id: rawFormData.category_id || null,
        price: rawFormData.price ? parseFloat(rawFormData.price) : null,
        weight_grams: rawFormData.weight_grams ? parseFloat(rawFormData.weight_grams) : null,
        description: rawFormData.description.trim() || null,
        is_featured: rawFormData.is_featured,
        is_active: rawFormData.is_active,
        image_url: mainImageUrl,
        images: secondaryImages,
      };

      expect(payload.name).toBe('Cadena Eslabón Fino 18K');
      expect(payload.slug).toBe('cadena-eslabon-fino-18k');
      expect(payload.price).toBe(1500.5);
      expect(payload.weight_grams).toBe(12.4);
      expect(payload.images).toHaveLength(2);
    });

    it('debe ejecutar rollback de todas las imágenes subidas si falla la inserción en BD', async () => {
      const uploadedImageUrls = [
        'https://supabase.co/storage/v1/object/public/products/products/uploaded-main.jpg',
        'https://supabase.co/storage/v1/object/public/products/products/uploaded-sec1.jpg',
      ];

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      // Simulación del bloque catch al fallar el insert en BD
      const insertFailed = true;
      if (insertFailed) {
        await deleteStorageFiles(mockSupabase, uploadedImageUrls, 'products');
      }

      expect(removeMock).toHaveBeenCalledWith([
        'products/uploaded-main.jpg',
        'products/uploaded-sec1.jpg',
      ]);
    });
  });

  describe('Edición de Producto (Detección de Huérfanas y Reemplazos)', () => {
    it('debe detectar fotos eliminadas de la galería secundaria para limpiarlas de Storage', async () => {
      const originalGallery = [
        'https://supabase.co/storage/v1/object/public/products/products/foto-antigua-1.jpg',
        'https://supabase.co/storage/v1/object/public/products/products/foto-antigua-2.jpg',
        'https://supabase.co/storage/v1/object/public/products/products/foto-conservada.jpg',
      ];

      // El usuario borró las fotos 1 y 2 en la UI de edición y mantuvo solo la 3
      const remainingExistingImages = [
        'https://supabase.co/storage/v1/object/public/products/products/foto-conservada.jpg',
      ];

      const removedImages = originalGallery.filter(
        (url) => !remainingExistingImages.includes(url)
      );

      expect(removedImages).toEqual([
        'https://supabase.co/storage/v1/object/public/products/products/foto-antigua-1.jpg',
        'https://supabase.co/storage/v1/object/public/products/products/foto-antigua-2.jpg',
      ]);

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      await deleteStorageFiles(mockSupabase, removedImages, 'products');

      expect(removeMock).toHaveBeenCalledWith([
        'products/foto-antigua-1.jpg',
        'products/foto-antigua-2.jpg',
      ]);
    });

    it('debe eliminar la foto principal anterior si fue reemplazada por una nueva', async () => {
      const oldMainUrl: string = 'https://supabase.co/storage/v1/object/public/products/products/portada-antigua.jpg';
      const newMainUrl: string = 'https://supabase.co/storage/v1/object/public/products/products/portada-nueva.jpg';

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      if (oldMainUrl && oldMainUrl !== newMainUrl) {
        await deleteStorageFiles(mockSupabase, [oldMainUrl], 'products');
      }

      expect(removeMock).toHaveBeenCalledWith(['products/portada-antigua.jpg']);
    });
  });

  describe('Eliminación Completa de Producto (Cascada de Galería)', () => {
    it('debe recolectar y eliminar de Storage la portada y todas las fotos secundarias', async () => {
      const productToDelete = {
        id: 'prod-delete-123',
        image_url: 'https://supabase.co/storage/v1/object/public/products/products/portada.jpg',
        images: [
          'https://supabase.co/storage/v1/object/public/products/products/galeria-1.jpg',
          'https://supabase.co/storage/v1/object/public/products/products/galeria-2.jpg',
        ],
      };

      // Recolección como en DeleteProductButton.tsx
      const allImagesToDelete = [
        productToDelete.image_url,
        ...(productToDelete.images || []),
      ].filter(Boolean);

      expect(allImagesToDelete).toHaveLength(3);

      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      await deleteStorageFiles(mockSupabase, allImagesToDelete, 'products');

      expect(removeMock).toHaveBeenCalledWith([
        'products/portada.jpg',
        'products/galeria-1.jpg',
        'products/galeria-2.jpg',
      ]);
    });
  });
});
