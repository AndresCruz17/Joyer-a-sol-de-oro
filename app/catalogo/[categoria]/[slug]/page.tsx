import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = await createClient();

  // 1. Obtener la categoría por su slug (insensible a mayúsculas y acentos en la URL)
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .ilike('slug', decodedSlug)
    .maybeSingle();

  // Si hay error o no se encuentra la categoría, mostrar 404
  if (categoryError || !category) {
    notFound();
  }

  // 2. Obtener los productos asociados a esta categoría
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  const productList = products || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Navegación Superior */}
      <nav className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>←</span> Volver al Inicio
          </Link>

          <span className="font-serif italic text-lg tracking-wide text-amber-300">
            Sol de Oro
          </span>

          <Link
            href="/#catalogo"
            className="text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors hidden sm:block"
          >
            Todo el Catálogo
          </Link>
        </div>
      </nav>

      {/* Header Banner de la Categoría */}
      <header className="relative py-16 sm:py-24 px-6 border-b border-stone-800/80 overflow-hidden">
        {category.image_url && (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img
              src={category.image_url}
              alt=""
              className="w-full h-full object-cover blur-2xl scale-110"
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto relative z-10 text-center max-w-2xl">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-3">
            Colección Exclusiva // Oro 18K
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-stone-100 mb-4 capitalize">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-stone-400 font-light leading-relaxed mb-6">
              {category.description}
            </p>
          )}
          <div className="inline-block px-4 py-1.5 rounded-full border border-stone-800 bg-stone-900/60 text-xs font-mono text-stone-400">
            {productList.length} {productList.length === 1 ? 'pieza disponible' : 'piezas disponibles'}
          </div>
        </div>
      </header>

      {/* Grid de Productos Filtrados */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {productList.length === 0 ? (
          <div className="text-center py-20 border border-stone-800/60 rounded-3xl bg-stone-900/20">
            <p className="font-serif text-xl text-stone-400 mb-2">
              Aún no hay joyas registradas en esta colección.
            </p>
            <p className="text-xs text-stone-500 font-mono mb-6">
              El administrador agregará nuevos diseños próximamente.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              Explorar otras colecciones
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productList.map((item) => {
              const whatsappMessage = encodeURIComponent(
                `Hola Sol de Oro, estoy interesado en cotizar la joya "${item.name}" de la categoría ${category.name}.`
              );
              const whatsappUrl = `https://wa.me/573000000000?text=${whatsappMessage}`;

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-stone-950">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-700 font-serif">
                        Sin Foto
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-mono bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase">
                      Oro 18K
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-stone-100 group-hover:text-amber-300 transition-colors mb-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-stone-400 font-light line-clamp-2 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-800/60 flex items-center justify-between">
                      <div>
                        {item.weight_grams && (
                          <span className="text-[10px] font-mono text-stone-500 block uppercase">
                            Peso: {item.weight_grams}g
                          </span>
                        )}
                        <span className="font-mono text-lg text-amber-400 font-semibold">
                          ${item.price?.toLocaleString('es-CO')} <span className="text-[10px] text-stone-400">COP</span>
                        </span>
                      </div>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold transition-all"
                      >
                        Cotizar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}