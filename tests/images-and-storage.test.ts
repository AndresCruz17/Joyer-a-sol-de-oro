import { describe, it, expect, vi } from 'vitest';
import {
  validateImageFile,
  validateImageFiles,
  generateSafeStoragePath,
  extractStoragePath,
  deleteStorageFiles,
  MAX_IMAGE_SIZE_BYTES,
  MAX_PRODUCT_IMAGES,
  ALLOWED_IMAGE_MIME_TYPES,
} from '@/lib/storage/image-utils';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper para crear objetos File simulados
function createMockFile(name: string, size: number, mimeType: string): File {
  const blob = new Blob(['x'.repeat(Math.min(size, 1024))], { type: mimeType });
  const file = new File([blob], name, { type: mimeType });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('3. Validación y Procesamiento Seguro de Imágenes', () => {
  describe('validateImageFile()', () => {
    it('debe rechazar archivos nulos o indefinidos', () => {
      // @ts-expect-error probando valor inválido
      const result = validateImageFile(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No se ha seleccionado ningún archivo');
    });

    it('debe aceptar formatos válidos (JPG, PNG, WEBP, AVIF)', () => {
      for (const mime of Object.keys(ALLOWED_IMAGE_MIME_TYPES)) {
        const file = createMockFile(`foto.${ALLOWED_IMAGE_MIME_TYPES[mime]}`, 1024 * 500, mime);
        const result = validateImageFile(file);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('debe rechazar formatos no admitidos (GIF, PDF, EXE, SVG, TXT)', () => {
      const invalidMimes = ['image/gif', 'application/pdf', 'application/x-msdownload', 'image/svg+xml', 'text/plain'];
      for (const mime of invalidMimes) {
        const file = createMockFile('archivo.invalido', 1024 * 100, mime);
        const result = validateImageFile(file);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Formato de archivo no admitido');
      }
    });

    it('debe aceptar archivos dentro del límite de 5MB', () => {
      const file = createMockFile('anillo-5mb.jpg', 5 * 1024 * 1024, 'image/jpeg');
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('debe rechazar archivos que superen 5MB (> 5 * 1024 * 1024 bytes)', () => {
      const file = createMockFile('anillo-gigante.png', MAX_IMAGE_SIZE_BYTES + 1024, 'image/png');
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('supera el tamaño máximo permitido de 5MB');
    });
  });

  describe('validateImageFiles()', () => {
    it('debe rechazar si la cantidad de imágenes supera el límite de 10', () => {
      const files = Array.from({ length: 4 }, (_, i) =>
        createMockFile(`foto-${i}.jpg`, 1024 * 100, 'image/jpeg')
      );
      // Ya tiene 8 imágenes y quiere agregar 4 (total 12 > 10)
      const result = validateImageFiles(files, 8, MAX_PRODUCT_IMAGES);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No puedes agregar más de 10 imágenes en total');
    });

    it('debe validar cada archivo de la lista y fallar ante el primero inválido', () => {
      const files = [
        createMockFile('foto-1.jpg', 1024 * 100, 'image/jpeg'),
        createMockFile('documento.pdf', 1024 * 100, 'application/pdf'),
        createMockFile('foto-3.jpg', 1024 * 100, 'image/jpeg'),
      ];

      const result = validateImageFiles(files, 0, MAX_PRODUCT_IMAGES);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de archivo no admitido');
    });

    it('debe aceptar una lista donde todos los archivos cumplan los requisitos', () => {
      const files = [
        createMockFile('foto-1.jpg', 1024 * 100, 'image/jpeg'),
        createMockFile('foto-2.png', 1024 * 200, 'image/png'),
        createMockFile('foto-3.webp', 1024 * 300, 'image/webp'),
      ];

      const result = validateImageFiles(files, 2, MAX_PRODUCT_IMAGES);
      expect(result.valid).toBe(true);
    });
  });

  describe('generateSafeStoragePath()', () => {
    it('debe generar una ruta sanitizada que no dependa del nombre original inseguro', () => {
      const dangerousFile = createMockFile('../../../etc/passwd.exe.jpg', 1024, 'image/jpeg');
      const path = generateSafeStoragePath('products', dangerousFile);

      expect(path.startsWith('products/')).toBe(true);
      expect(path.endsWith('.jpg')).toBe(true);
      expect(path).not.toContain('..');
      expect(path).not.toContain('passwd');
      expect(path).not.toContain('exe');
    });

    it('debe asignar la carpeta categories correctamente', () => {
      const file = createMockFile('categoria.webp', 1024, 'image/webp');
      const path = generateSafeStoragePath('categories', file);

      expect(path.startsWith('categories/')).toBe(true);
      expect(path.endsWith('.webp')).toBe(true);
    });
  });

  describe('extractStoragePath()', () => {
    it('debe extraer el path relativo desde una URL pública de Supabase Storage', () => {
      const url = 'https://xyz.supabase.co/storage/v1/object/public/products/products/1715000-uuid.jpg';
      const path = extractStoragePath(url, 'products');
      expect(path).toBe('products/1715000-uuid.jpg');
    });

    it('debe limpiar parámetros de query (?v=123) y decodificar URLs', () => {
      const url = 'https://xyz.supabase.co/storage/v1/object/public/products/categories/foto%20anillo.png?t=2026-09-08';
      const path = extractStoragePath(url, 'products');
      expect(path).toBe('categories/foto anillo.png');
    });

    it('debe retornar null para URLs inválidas o que no pertenezcan al bucket', () => {
      expect(extractStoragePath('https://otrodominio.com/imagen.jpg', 'products')).toBeNull();
      expect(extractStoragePath('', 'products')).toBeNull();
    });
  });

  describe('deleteStorageFiles() (Rollback y Limpieza en Lote)', () => {
    it('debe invocar remove en Supabase Storage con los paths resueltos', async () => {
      const removeMock = vi.fn().mockResolvedValueOnce({ data: [], error: null });
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      const items = [
        'https://xyz.supabase.co/storage/v1/object/public/products/products/foto1.jpg',
        'products/foto2.jpg',
        null,
        undefined,
      ];

      await deleteStorageFiles(mockSupabase, items, 'products');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('products');
      expect(removeMock).toHaveBeenCalledWith(['products/foto1.jpg', 'products/foto2.jpg']);
    });

    it('no debe lanzar excepciones si Supabase Storage devuelve error o falla de red', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const removeMock = vi.fn().mockRejectedValueOnce(new Error('Network timeout'));
      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: removeMock,
          }),
        },
      } as unknown as SupabaseClient;

      // No debe arrojar error no capturado
      await expect(
        deleteStorageFiles(mockSupabase, ['products/test.jpg'], 'products')
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
