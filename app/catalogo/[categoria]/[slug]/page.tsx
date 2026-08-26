import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/supabase/queries';
import ProductSchema from '@/components/seo/ProductSchema';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

interface Props {
  params: Promise<{ categoria: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: 'Producto no encontrado' };

  return {
    title: product.meta_title || `${product.name} en Oro 18K`,
    description: product.meta_description || product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, categoria } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const currentUrl = `https://tujoyeria.com/catalogo/${categoria}/${product.slug}`;

  return (
    <>
      <ProductSchema
        name={product.name}
        description={product.description || ''}
        image={product.images?.[0]}
        price={product.price}
        url={currentUrl}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* VISUALIZADOR DE IMÁGENES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[350px]">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="rounded-lg max-h-[400px] object-contain"
              />
            ) : (
              <span className="text-slate-500 font-medium">Foto del producto</span>
            )}
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                {product.categories?.name}
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-1">{product.name}</h1>
            </div>

            {product.price && (
              <div className="text-3xl font-bold text-amber-300">
                ${Number(product.price).toLocaleString('es-CO')} <span className="text-sm text-slate-400">COP</span>
              </div>
            )}

            <div className="border-t border-b border-slate-800 py-4 text-slate-300 text-sm leading-relaxed">
              <p>{product.description || 'Sin descripción disponible.'}</p>
            </div>

            {/* BOTÓN DE COTIZACIÓN */}
            <div className="pt-2">
              <WhatsAppButton
                productName={product.name}
                productPrice={product.price}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}