import { NextResponse, type NextRequest } from 'next/server';
import { getAuthAdminUser } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { processAndOptimizeImage } from '@/lib/storage/image-processor';
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/storage/image-utils';

export async function POST(request: NextRequest) {
  // 1. Verificación de autorización de administrador
  const { user, isAdmin } = await getAuthAdminUser();

  if (!user || !isAdmin) {
    return NextResponse.json(
      { error: 'No autorizado. Se requieren permisos de administrador para subir imágenes.' },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = formData.get('folder') as string | null;
    const folder: 'products' | 'categories' = rawFolder === 'categories' ? 'categories' : 'products';

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No se ha adjuntado ningún archivo para procesar.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `El archivo supera el tamaño máximo permitido de 5MB (peso actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB).` },
        { status: 400 }
      );
    }

    // 2. Procesamiento, validación y optimización server-side a WebP con Sharp
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { optimizedBuffer, storagePath, contentType } = await processAndOptimizeImage(
      buffer,
      file.name,
      folder
    );

    // 3. Subida a Supabase Storage con contentType image/webp
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(storagePath, optimizedBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir imagen optimizada a Storage:', uploadError);
      return NextResponse.json(
        { error: `Error al almacenar la imagen optimizada: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      publicUrl: publicUrlData.publicUrl,
      storagePath,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar y optimizar la imagen.';
    console.error('Excepción en /api/admin/upload-image:', err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
