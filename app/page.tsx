import Link from 'next/link';
import { getCategories, getFeaturedProducts } from '@/lib/supabase/queries';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Manejo de errores seguro con fallbacks vacíos ([])
  let categories: any[] = [];
  let featuredProducts: any[] = [];

  try {
    const [catData, prodData] = await Promise.all([
      getCategories(),
      getFeaturedProducts(),
    ]);
    categories = catData || [];
    featuredProducts = prodData || [];
  } catch (error) {
    console.error('Error al cargar datos en HomePage:', error);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO SECTION DINÁMICO */}
      <section className="relative h-[85vh] flex items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-amber-950/20 to-slate-950">
        <div className="max-w-4xl text-center space-y-6 z-10">
          <span className="text-amber-400 font-semibold tracking-widest text-xs uppercase">
            Joyería Fina en Colombia • Oro 18K
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Elegancia atemporal esculpida en <span className="text-amber-400">oro puro</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explora piezas exclusivas hechas a mano y joyas personalizadas con envío asegurado a todo el país.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/catalogo"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-3 rounded-full transition-all duration-300"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-amber-400 mb-8">Categorías Principales</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo/${cat.slug}`}
                className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-all text-center group"
              >
                <h3 className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JOYAS DESTACADAS */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-8">Diseños Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6">
                  <span className="text-xs text-amber-400 font-medium">{product.categories?.name}</span>
                  <h3 className="text-xl font-bold mt-1 text-white">{product.name}</h3>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">{product.description}</p>
                  {product.price && (
                    <p className="text-lg font-semibold text-amber-300 mt-4">
                      ${Number(product.price).toLocaleString('es-CO')} COP
                    </p>
                  )}
                </div>
                <div className="p-6 pt-0">
                  <WhatsAppButton
                    productName={product.name}
                    productPrice={product.price}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}