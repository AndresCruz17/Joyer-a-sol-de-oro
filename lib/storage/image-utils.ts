import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Utilidades para validación, sanitización y limpieza de imágenes en Supabase Storage
 */

export const ALLOWED_IMAGE_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PRODUCT_IMAGES = 10;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida un archivo individual de imagen (rechaza SVG, ejecutables y no admitidos)
 */
export function validateImageFile(file: File, maxSize = MAX_IMAGE_SIZE_BYTES): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo.' };
  }

  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  // Rechazo explícito de SVG o archivos sin MIME admitido
  if (mime === 'image/svg+xml' || name.endsWith('.svg') || !ALLOWED_IMAGE_MIME_TYPES[mime]) {
    return {
      valid: false,
      error: `Formato de archivo no admitido (${file.type || 'desconocido'}). Formatos permitidos: JPG, PNG, WEBP.`,
    };
  }

  if (file.size > maxSize) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `El archivo "${file.name}" supera el tamaño máximo permitido de ${maxMb}MB (peso actual: ${sizeMb}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Valida una lista de archivos de imagen y el límite total permitido
 */
export function validateImageFiles(
  files: File[],
  currentCount = 0,
  maxCount = MAX_PRODUCT_IMAGES
): ImageValidationResult {
  if (currentCount + files.length > maxCount) {
    return {
      valid: false,
      error: `No puedes agregar más de ${maxCount} imágenes en total (intentas tener ${currentCount + files.length}).`,
    };
  }

  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Genera un nombre de archivo seguro y único para Supabase Storage
 */
export function generateSafeStoragePath(folder: 'products' | 'categories', file: File): string {
  const mime = file.type.toLowerCase();
  const ext = ALLOWED_IMAGE_MIME_TYPES[mime] || 'jpg';
  const timestamp = Date.now();
  const randomStr = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 12);

  return `${folder}/${timestamp}-${randomStr}.${ext}`;
}

/**
 * Extrae la ruta interna del bucket a partir de una URL pública de Supabase Storage
 */
export function extractStoragePath(publicUrl: string, bucket = 'products'): string | null {
  if (!publicUrl || typeof publicUrl !== 'string') return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const parts = publicUrl.split(marker);

  if (parts.length > 1) {
    const rawPath = parts[1].split('?')[0];
    return decodeURIComponent(rawPath);
  }

  return null;
}

/**
 * Elimina una lista de archivos (por URL pública o por ruta relativa) de Supabase Storage
 */
export async function deleteStorageFiles(
  supabase: SupabaseClient,
  urlsOrPaths: (string | null | undefined)[],
  bucket = 'products'
): Promise<void> {
  if (!urlsOrPaths || urlsOrPaths.length === 0) return;

  const pathsToDelete = urlsOrPaths
    .map((item) => {
      if (!item) return null;
      if (item.includes('/storage/v1/object/public/')) {
        return extractStoragePath(item, bucket);
      }
      return item;
    })
    .filter((path): path is string => Boolean(path && typeof path === 'string'));

  if (pathsToDelete.length === 0) return;

  try {
    const { error } = await supabase.storage.from(bucket).remove(pathsToDelete);
    if (error) {
      console.error(`Error al eliminar archivos del bucket "${bucket}":`, error);
    }
  } catch (err) {
    console.error('Excepción al invocar supabase.storage.remove:', err);
  }
}

export interface UploadOptimizedImageResult {
  publicUrl: string;
  storagePath: string;
}

/**
 * Sube una imagen al servidor para ser validada, redimensionada (máx 1600px) y convertida a WebP (calidad 82)
 */
export async function uploadOptimizedImage(
  file: File,
  folder: 'products' | 'categories' = 'products'
): Promise<UploadOptimizedImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Archivo de imagen no válido.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error al procesar y subir la imagen optimizada.');
  }

  return {
    publicUrl: data.publicUrl,
    storagePath: data.storagePath,
  };
}

