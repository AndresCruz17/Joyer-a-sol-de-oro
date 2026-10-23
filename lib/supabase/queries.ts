import { createClient } from './server';

function handleQueryError(context: string, error: unknown) {
  const err = error as { message?: string; details?: string };
  if (err?.message?.includes('fetch failed') || err?.details?.includes('ENOTFOUND')) {
    console.warn(`\n⚠️  [Supabase Conexión]: El servidor no pudo conectarse a Supabase (${context}). Si usas el plan gratuito, el proyecto puede estar pausado por inactividad. Reactívalo en tu dashboard de Supabase (https://supabase.com/dashboard) o verifica las credenciales en .env.local.\n`);
  }
  console.error(`Error al obtener ${context}:`, error);
}

/**
 * Obtiene todas las categorías ordenadas alfabéticamente
 */
export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, description')
    .order('name', { ascending: true });

  if (error) {
    handleQueryError('categorías', error);
    return [];
  }

  return data;
}

/**
 * Obtiene productos activos destacados para la página de inicio
 */
export async function getFeaturedProducts(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, weight_grams, image_url, category_id, categories(name, slug)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    handleQueryError('productos destacados', error);
    return [];
  }

  return data;
}

/**
 * Obtiene todos los productos activos para el catálogo general
 */
export async function getAllActiveProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, weight_grams, image_url, category_id, created_at, categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    handleQueryError('productos del catálogo', error);
    return [];
  }

  return data;
}

/**
 * Obtiene productos activos filtrados por el slug de su categoría
 */
export async function getProductsByCategorySlug(categorySlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, weight_grams, image_url, category_id, created_at, categories!inner(name, slug)')
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false });

  if (error) {
    handleQueryError('productos por categoría', error);
    return [];
  }

  return data;
}

/**
 * Obtiene el detalle de un solo producto activo por su slug
 */
export async function getProductBySlug(productSlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, weight_grams, image_url, images, category_id, is_active, is_featured, created_at, categories(name, slug)')
    .eq('is_active', true)
    .eq('slug', productSlug)
    .maybeSingle();

  if (error) {
    handleQueryError('producto por slug', error);
    return null;
  }

  return data;
}

/**
 * Obtiene el detalle de un solo producto activo por su ID (UUID)
 */
export async function getProductById(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, weight_grams, image_url, images, category_id, is_active, is_featured, created_at, categories(name, slug)')
    .eq('is_active', true)
    .eq('id', productId)
    .maybeSingle();

  if (error) {
    handleQueryError('producto por ID', error);
    return null;
  }

  return data;
}

/**
 * Obtiene productos activos relacionados de la misma categoría
 */
export async function getRelatedActiveProducts(categoryId: string, excludeProductId: string, limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .neq('id', excludeProductId)
    .limit(limit);

  if (error) {
    handleQueryError('productos relacionados', error);
    return [];
  }

  return data;
}