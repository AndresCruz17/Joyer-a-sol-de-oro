import { createPublicClient } from './public';

export async function getCategories() {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return [];
  return data || [];
}

export async function getFeaturedProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('is_featured', true);
  if (error) return [];
  return data || [];
}