import { createClient } from './server';

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
    console.error('Error al obtener categorías:', error);
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
    console.error('Error al obtener productos destacados:', error);
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
    console.error('Error al obtener productos del catálogo:', error);
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
    console.error('Error al obtener productos por categoría:', error);
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
    console.error('Error al obtener producto por slug:', error);
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
    console.error('Error al obtener producto por ID:', error);
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
    console.error('Error al obtener productos relacionados:', error);
    return [];
  }

  return data;
}

/**
 * Obtiene todos los eventos activos ordenados por fecha del evento (más próximos primero)
 */
export async function getActiveEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('id, title, slug, description, event_date, image_url, is_active, created_at')
    .eq('is_active', true)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error al obtener eventos activos:', error);
    return [];
  }

  return data;
}

/**
 * Obtiene los próximos eventos activos (fecha futura) con límite opcional
 */
export async function getUpcomingEvents(limit = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('id, title, slug, description, event_date, image_url')
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error al obtener próximos eventos:', error);
    return [];
  }

  return data;
}