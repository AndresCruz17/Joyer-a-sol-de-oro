import { createClient } from './server';

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }

  return data;
}

export async function getFeaturedProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(6);

  if (error) {
    console.error('Error al obtener productos destacados:', error);
    return [];
  }

  return data;
}

// Obtener productos por slug de categoría
export async function getProductsByCategorySlug(categorySlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories!inner(name, slug)')
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener productos por categoría:', error);
    return [];
  }

  return data;
}

// Obtener detalle de un solo producto por su slug
export async function getProductBySlug(productSlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .eq('slug', productSlug)
    .single();

  if (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }

  return data;
}