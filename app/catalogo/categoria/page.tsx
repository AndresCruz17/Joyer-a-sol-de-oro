import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductsByCategorySlug, getCategories } from '@/lib/supabase/queries';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

interface Props {
  params: Promise<{ categoria: string }>;
}

// Generación de Metadatos Dinámicos para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categoria);

  if (!category) return { title: 'Categoría no encontrada' };

  return {
    title: `${category.name} en Oro 18K en Colombia`,
    description: `Descubre nuestra colección exclusiva de ${category.name.toLowerCase()} en oro de 18k. Envíos seguros a todo Colombia. Cotiza directalmente por WhatsApp.`,
    openGraph: {
      title: `${category.name} de Oro 18K | Joyería Fina`,
      description: `Explora ${category.name.toLowerCase()} con acabados impecables en oro puro.`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const products = await getProductsByCategorySlug(categoria);
  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === categoria);

  if (!currentCategory) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-amber-400 capitalize">
            {currentCategory.name}
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            {currentCategory.description || `Catálogo de ${currentCategory.name.toLowerCase()} en oro de 18k.`}
          </p>
        </header>

        {products.length === 0 ? (
          <p className="text-center text-slate-500 py-12">
            No hay productos disponibles en esta categoría por el momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 bg-slate-800 flex items-center justify-center text-slate-500 font-mono text-sm">
                    {/* Render visual si tiene imágenes subidas */}
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      'Imagen Joya'
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-white line-clamp-1">{product.name}</h2>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                    {product.price && (
                      <p className="text-amber-400 font-semibold mt-3">
                        ${Number(product.price).toLocaleString('es-CO')} COP
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <Link
                    href={`/catalogo/${categoria}/${product.slug}`}
                    className="block text-center w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                  >
                    Ver Detalle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}