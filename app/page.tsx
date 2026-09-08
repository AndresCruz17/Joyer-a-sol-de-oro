import { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { SITE_CONFIG } from '@/lib/config';

// METADATA OFICIAL PARA MOTOR DE BÚSQUEDA Y REDES SOCIALES
export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | Oro 18K Ley 750 Nariño`,
  description: SITE_CONFIG.description,
  keywords: [
    'compra de oro Nariño',
    'compra de oro Colombia',
    'joyeria oro 18k',
    'oro ley 750',
    'vender oro Nariño',
    'vender oro Colombia',
    'avaluo de oro',
    'joyas personalizadas colombia',
    'Sol de Oro',
  ],
  openGraph: {
    title: `${SITE_CONFIG.name} | Oro 18K Certificado`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

// REVALIDACIÓN INCREMENTAL (ISR) CADA 60 SEGUNDOS
export const revalidate = 60;

import { getCategories, getFeaturedProducts } from '@/lib/supabase/queries';

export default async function Page() {
  const [categoriesData, featuredProductsData] = await Promise.all([
    getCategories(),
    getFeaturedProducts(6),
  ]);

  const initialCategories = (categoriesData || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image_url: cat.image_url,
  }));

  const initialFeaturedProducts = (featuredProductsData || []).map((prod) => ({
    id: prod.id,
    name: prod.name,
    description: prod.description,
    price: prod.price,
    weight_grams: prod.weight_grams,
    image_url: prod.image_url,
    category_id: prod.category_id,
    categories: prod.categories,
  }));

  return (
    <HomePageClient
      initialCategories={initialCategories}
      initialFeaturedProducts={initialFeaturedProducts}
    />
  );
}