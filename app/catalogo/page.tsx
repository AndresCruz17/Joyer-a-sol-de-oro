import { Metadata } from 'next';
import CatalogoClient, { Category, Product } from '@/components/catalogo/CatalogoClient';
import { getCategories, getAllActiveProducts } from '@/lib/supabase/queries';
import { SITE_CONFIG } from '@/lib/config';

// REVALIDACIÓN INCREMENTAL (ISR) CADA 60 SEGUNDOS
export const revalidate = 60;

export const metadata: Metadata = {
  title: `Catálogo de Joyas en Oro 18K | ${SITE_CONFIG.name}`,
  description: 'Explora nuestra colección completa de anillos, cadenas, pulseras y dijes en Oro 18K Ley 750 garantizados de por vida.',
  openGraph: {
    title: `Catálogo de Joyería Fina 18K | ${SITE_CONFIG.name}`,
    description: 'Catálogo oficial de piezas exclusivas en Oro de 18 Kilates con certificado de autenticidad.',
    url: `${SITE_CONFIG.url}/catalogo`,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Catálogo Sol de Oro',
      },
    ],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/catalogo`,
  },
};

export default async function CatalogoPage() {
  const [categoriesData, productsData] = await Promise.all([
    getCategories(),
    getAllActiveProducts(),
  ]);

  const initialCategories: Category[] = (categoriesData || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  const initialProducts: Product[] = (productsData || []).map((prod) => ({
    id: prod.id,
    name: prod.name,
    description: prod.description,
    price: prod.price,
    weight_grams: prod.weight_grams,
    image_url: prod.image_url,
    category_id: prod.category_id,
    created_at: prod.created_at,
    categories: prod.categories,
  }));

  return (
    <CatalogoClient
      initialCategories={initialCategories}
      initialProducts={initialProducts}
    />
  );
}