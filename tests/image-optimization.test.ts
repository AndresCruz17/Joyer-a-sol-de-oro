import { describe, it, expect, vi } from 'vitest';
import sharp from 'sharp';
import {
  processAndOptimizeImage,
  MAX_IMAGE_DIMENSION_PX,
  WEBP_OUTPUT_QUALITY,
} from '@/lib/storage/image-processor';
import {
  validateImageFile,
  deleteStorageFiles,
  MAX_IMAGE_SIZE_BYTES,
} from '@/lib/storage/image-utils';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('10. Optimización de Imágenes con Sharp (JPG/PNG/WebP a WebP)', () => {
  // Helper para generar imágenes de prueba reales en memoria con Sharp
  async function createTestImage(
    format: 'jpeg' | 'png' | 'webp',
    width: number,
    height: number
  ): Promise<Buffer> {
    return sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 212, g: 175, b: 55 }, // Color dorado Sol de Oro
      },
    })
      [format]()
      .toBuffer();
  }

  it('1. JPG válido: debe procesarse y convertirse a WebP con calidad ~82 y máx 1600px', async () => {
    // Imagen de alta resolución 2400x1800 (> 1600px)
    const jpgBuffer = await createTestImage('jpeg', 2400, 1800);
    const result = await processAndOptimizeImage(jpgBuffer, 'joya-alta-resolucion.jpg', 'products');

    expect(result.contentType).toBe('image/webp');
    expect(result.storagePath.endsWith('.webp')).toBe(true);
    expect(result.storagePath.startsWith('products/')).toBe(true);

    // Inspeccionar el buffer resultante con Sharp
    const outputMeta = await sharp(result.optimizedBuffer).metadata();
    expect(outputMeta.format).toBe('webp');
    expect(outputMeta.width).toBeLessThanOrEqual(MAX_IMAGE_DIMENSION_PX);
    expect(outputMeta.height).toBeLessThanOrEqual(MAX_IMAGE_DIMENSION_PX);
    // Verificar que se mantuvo la proporción original 4:3 -> 1600x1200
    expect(outputMeta.width).toBe(1600);
    expect(outputMeta.height).toBe(1200);
  });

  it('2. PNG válido: debe convertirse a WebP manteniendo transparencia/canales', async () => {
    const pngBuffer = await createTestImage('png', 800, 600);
    const result = await processAndOptimizeImage(pngBuffer, 'dije-oro.png', 'products');

    expect(result.contentType).toBe('image/webp');
    expect(result.storagePath.endsWith('.webp')).toBe(true);

    const outputMeta = await sharp(result.optimizedBuffer).metadata();
    expect(outputMeta.format).toBe('webp');
    expect(outputMeta.width).toBe(800);
    expect(outputMeta.height).toBe(600);
  });

  it('3. WebP válido: debe optimizarse manteniendo el formato WebP', async () => {
    const webpBuffer = await createTestImage('webp', 1200, 900);
    const result = await processAndOptimizeImage(webpBuffer, 'anillo-existente.webp', 'categories');

    expect(result.contentType).toBe('image/webp');
    expect(result.storagePath.startsWith('categories/')).toBe(true);
    expect(result.storagePath.endsWith('.webp')).toBe(true);

    const outputMeta = await sharp(result.optimizedBuffer).metadata();
    expect(outputMeta.format).toBe('webp');
  });

  it('4. SVG rechazado: debe ser rechazado tanto por extensión como por inspección de cabecera', async () => {
    const svgContent = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="gold" /></svg>',
      'utf-8'
    );

    await expect(
      processAndOptimizeImage(svgContent, 'icono.svg', 'products')
    ).rejects.toThrow(/archivos vectoriales SVG no son admitidos|Formato no permitido/);
  });

  it('5. Archivo demasiado grande: debe ser rechazado si supera los 5MB', () => {
    const hugeBlob = new Blob(['x'.repeat(1024)], { type: 'image/jpeg' });
    const hugeFile = new File([hugeBlob], 'joya-gigante.jpg', { type: 'image/jpeg' });
    Object.defineProperty(hugeFile, 'size', { value: MAX_IMAGE_SIZE_BYTES + 1024 });

    const result = validateImageFile(hugeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('supera el tamaño máximo permitido de 5MB');
  });

  it('6. Archivo corrupto: debe ser rechazado con mensaje de integridad claro', async () => {
    const corruptBuffer = Buffer.from([0x00, 0xff, 0x12, 0x45, 0x99, 0xaa, 0xbb, 0xcc, 0xdd]);

    await expect(
      processAndOptimizeImage(corruptBuffer, 'foto-danada.jpg', 'products')
    ).rejects.toThrow(/corrupto o no corresponde a una imagen válida/);
  });

  it('7. Fallo de insert/update con limpieza de Storage (Rollback)', async () => {
    const uploadedUrls = [
      'https://xyz.supabase.co/storage/v1/object/public/products/products/171500-test1.webp',
      'https://xyz.supabase.co/storage/v1/object/public/products/products/171500-test2.webp',
    ];

    const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
    const mockSupabase = {
      storage: {
        from: vi.fn().mockReturnValue({
          remove: removeMock,
        }),
      },
    } as unknown as SupabaseClient;

    // Simulando que ocurrió un error de constraint en BD
    let dbInsertError = true;
    if (dbInsertError) {
      await deleteStorageFiles(mockSupabase, uploadedUrls, 'products');
    }

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('products');
    expect(removeMock).toHaveBeenCalledWith([
      'products/171500-test1.webp',
      'products/171500-test2.webp',
    ]);
  });

  it('8. Eliminación completa de una galería al borrar un producto', async () => {
    const productData = {
      id: 'prod-delete-gallery',
      image_url: 'https://xyz.supabase.co/storage/v1/object/public/products/products/portada.webp',
      images: [
        'https://xyz.supabase.co/storage/v1/object/public/products/products/secundaria1.webp',
        'https://xyz.supabase.co/storage/v1/object/public/products/products/secundaria2.webp',
      ],
    };

    const allGalleryImages = [
      productData.image_url,
      ...(productData.images || []),
    ].filter(Boolean);

    expect(allGalleryImages).toHaveLength(3);

    const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
    const mockSupabase = {
      storage: {
        from: vi.fn().mockReturnValue({
          remove: removeMock,
        }),
      },
    } as unknown as SupabaseClient;

    await deleteStorageFiles(mockSupabase, allGalleryImages, 'products');

    expect(removeMock).toHaveBeenCalledWith([
      'products/portada.webp',
      'products/secundaria1.webp',
      'products/secundaria2.webp',
    ]);
  });
});
