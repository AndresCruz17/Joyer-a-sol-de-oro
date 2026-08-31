import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function CategoryPage({ params }: PageProps) {
  // Soporte de compatibilidad para Next.js 14 y 15
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const slug = decodeURIComponent(rawSlug);

  const supabase = await createClient();

  // 1. Intentar buscar la categoría
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .ilike('slug', slug)
    .maybeSingle();

  // 2. MODO DIAGNÓSTICO: Si no se encuentra la categoría, mostramos la causa exacta en pantalla
  if (!category) {
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, slug');

    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-12 font-mono text-xs">
        <div className="max-w-2xl mx-auto border border-amber-500/40 bg-stone-900/90 p-6 rounded-2xl space-y-4 shadow-2xl">
          <h1 className="text-amber-400 font-bold text-base flex items-center gap-2">
            ⚠️ Modo Diagnóstico // Categoría no encontrada
          </h1>
          
          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block mb-1">Slug recibido en la URL:</span>
            <p className="text-amber-300 font-bold text-sm">"{slug}"</p>
          </div>

          {categoryError && (
            <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl">
              <span className="text-red-400 block mb-1">Error de Supabase:</span>
              <p className="text-red-200">{categoryError.message}</p>
            </div>
          )}

          <div>
            <span className="text-stone-400 block mb-2">Slugs guardados actualmente en la base de datos:</span>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2 max-h-60 overflow-y-auto">
              {allCategories && allCategories.length > 0 ? (
                allCategories.map((c) => (
                  <div key={c.id} className="border-b border-stone-800/80 pb-1.5 flex justify-between items-center">
                    <span className="text-stone-300">Nombre: <strong>{c.name}</strong></span>
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      slug: "{c.slug || 'NULL'}"
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 italic">No se encontraron registros en la tabla 'categories' o la seguridad RLS bloquea la lectura.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800">
            <Link href="/" className="text-amber-400 underline hover:text-amber-300">← Volver al Inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Si se encuentra la categoría, cargar los productos asociados
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

      {/* Grid de Productos */}
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