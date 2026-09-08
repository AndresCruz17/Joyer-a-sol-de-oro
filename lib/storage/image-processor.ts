import sharp, { type Metadata } from 'sharp';
import { randomUUID } from 'node:crypto';

export const MAX_IMAGE_DIMENSION_PX = 1600;
export const WEBP_OUTPUT_QUALITY = 82;
export const ALLOWED_RASTER_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];

export interface ProcessedImageResult {
  optimizedBuffer: Buffer;
  storagePath: string;
  contentType: 'image/webp';
  width?: number;
  height?: number;
  originalFormat: string;
}

/**
 * Valida un búfer de imagen, rechaza SVG o archivos corruptos, redimensiona
 * hasta un máximo de 1600px y convierte/optimiza a formato WebP (calidad 82).
 */
export async function processAndOptimizeImage(
  buffer: Buffer,
  originalFilename: string,
  folder: 'products' | 'categories' = 'products'
): Promise<ProcessedImageResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('El archivo de imagen está vacío o no es válido.');
  }

  // 1. Detección temprana de SVG por contenido de texto/cabecera XML
  const bufferHeader = buffer.subarray(0, 512).toString('utf-8').toLowerCase();
  if (
    bufferHeader.includes('<svg') ||
    bufferHeader.includes('xmlns="http://www.w3.org/2000/svg"') ||
    originalFilename.toLowerCase().endsWith('.svg')
  ) {
    throw new Error(
      'Formato no permitido: los archivos vectoriales SVG no son admitidos. Por favor sube una imagen rasterizada (JPG, PNG o WebP).'
    );
  }

  // 2. Inspeccionar metadata con Sharp para validar integridad del archivo
  let metadata: Metadata;
  try {
    const sharpInstance = sharp(buffer);
    metadata = await sharpInstance.metadata();
  } catch (err) {
    throw new Error(
      'El archivo está corrupto o no corresponde a una imagen válida soportada.'
    );
  }

  const format = metadata.format?.toLowerCase() || '';

  if (format === 'svg') {
    throw new Error(
      'Formato no permitido: los archivos SVG no son admitidos. Solo se permiten imágenes rasterizadas (JPG, PNG o WebP).'
    );
  }

  if (!ALLOWED_RASTER_FORMATS.includes(format)) {
    throw new Error(
      `Formato no admitido (${format || 'desconocido'}). Solo se aceptan formatos JPG, PNG y WebP.`
    );
  }

  if (!metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
    throw new Error('Dimensiones de imagen inválidas o corruptas.');
  }

  // 3. Redimensionar (máx 1600px manteniendo proporción) y convertir a WebP calidad 82
  const sharpPipeline = sharp(buffer)
    .rotate() // Auto-rotación según orientación EXIF
    .resize({
      width: MAX_IMAGE_DIMENSION_PX,
      height: MAX_IMAGE_DIMENSION_PX,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_OUTPUT_QUALITY,
      effort: 4,
    });

  const { data: optimizedBuffer, info } = await sharpPipeline.toBuffer({ resolveWithObject: true });

  // 4. Generar nombre de archivo único y seguro garantizando extensión .webp
  const timestamp = Date.now();
  const uuid = randomUUID ? randomUUID() : Math.random().toString(36).substring(2, 15);
  const storagePath = `${folder}/${timestamp}-${uuid}.webp`;

  return {
    optimizedBuffer,
    storagePath,
    contentType: 'image/webp',
    width: info.width,
    height: info.height,
    originalFormat: format,
  };
}
