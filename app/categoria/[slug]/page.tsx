import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWhatsAppUrl } from '@/lib/config';

// REVALIDACIÓN INCREMENTAL (ISR) CADA 60 SEGUNDOS
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const supabase = await createClient();

  // 1. Obtener la categoría actual por su slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, description')
    .ilike('slug', slug)
    .maybeSingle();

  if (categoryError || !category) {
    notFound();
  }

  // 2. Obtener TODAS las categorías para el selector rápido
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const categoriesList = allCategories || [];

  // 3. Obtener los productos asociados a esta categoría (solo activos)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, price, weight_grams, image_url, category_id, created_at')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const productList = products || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">

      {/* Navegación */}
      <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-8 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-display tracking-wider text-amber-400 hover:text-amber-300 transition-colors uppercase"
          >
            <span>←</span> Volver al Inicio
          </Link>

          <Link href="/" className="font-serif italic text-xl sm:text-2xl tracking-widest text-amber-300">
            Sol de Oro
          </Link>

          <a
            href={getWhatsAppUrl(`Hola, deseo consultar sobre la categoría de ${category.name} en Oro 18K`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-display tracking-wider text-stone-400 hover:text-amber-300 transition-colors hidden sm:block uppercase"
          >
            Contacto Directo
          </a>
        </div>
      </nav>

      {/* Header Banner */}
      <header className="relative py-12 sm:py-16 px-6 border-b border-stone-800/80 overflow-hidden">
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
          <span className="text-xs font-display text-amber-400 uppercase tracking-widest block mb-2">
            Colección Exclusiva // Oro 18K
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 tracking-widest mb-3 capitalize">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-stone-400 font-sans font-light leading-relaxed mb-4">
              {category.description}
            </p>
          )}
          <div className="inline-block px-3.5 py-1 rounded-full border border-stone-800 bg-stone-900/60 text-[11px] font-display text-stone-400 tracking-wider uppercase">
            {productList.length} {productList.length === 1 ? 'pieza disponible' : 'piezas disponibles'}
          </div>
        </div>
      </header>

      {/* Selector Rápido de Categorías */}
      <div className="border-b border-stone-800/80 bg-stone-900/40 sticky top-[57px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-display text-stone-500 uppercase tracking-widest mr-2 shrink-0 hidden sm:inline-block">
            Explorar:
          </span>
          {categoriesList.map((cat) => {
            const isActive = cat.id === category.id;
            return (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-xs font-display uppercase tracking-wider transition-all shrink-0 border ${isActive
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200 hover:bg-stone-900'
                  }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {productList.length === 0 ? (
          <div className="text-center py-20 border border-stone-800/60 rounded-3xl bg-stone-900/20 max-w-xl mx-auto">
            <p className="font-serif text-xl text-stone-400 tracking-wide mb-2">
              Aún no hay joyas en la categoría "{category.name}"
            </p>
            <p className="text-xs text-stone-500 font-sans mb-6">
              El administrador agregará nuevos diseños a esta colección próximamente.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/catalogo"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-display font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
              >
                Ver Todo el Catálogo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productList.map((item) => {
              const itemWeight = item.weight_grams ? `${item.weight_grams}g` : 'A consultar';
              const itemPrice = item.price ? `$${item.price.toLocaleString('es-CO')} COP` : 'A consultar';
              const itemImage = item.image_url || '';

              const whatsappText =
                `✨ *COTIZACIÓN RÁPIDA // SOL DE ORO* ✨\n\n` +
                `📌 *Joya:* ${item.name}\n` +
                `🏷️ *Colección:* ${category.name}\n` +
                `⚖️ *Peso aprox:* ${itemWeight}\n` +
                `💰 *Precio:* ${itemPrice}\n` +
                `👑 *Material:* Oro 18K\n` +
                (itemImage ? `\n🖼️ *Ver Foto:* ${itemImage}\n\n` : '\n') +
                `Hola, me interesa recibir más información sobre esta joya.`;

              const whatsappUrl = getWhatsAppUrl(whatsappText);

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Foto con enlace a Detalle */}
                  <Link href={`/producto/${item.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-950 block">
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
                    <span className="absolute top-3 left-3 text-[10px] font-display bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Oro 18K
                    </span>
                  </Link>

                  {/* Detalles del Producto */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/producto/${item.id}`}>
                        <h3 className="font-serif text-xl text-stone-100 group-hover:text-amber-300 transition-colors tracking-wide mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      {item.description && (
                        <p className="text-xs text-stone-400 font-sans font-light line-clamp-2 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-stone-800/60 flex items-center justify-between">
                      <div>
                        {item.weight_grams && (
                          <span className="text-[10px] font-display text-stone-500 block uppercase tracking-wider">
                            Peso: {item.weight_grams}g
                          </span>
                        )}
                        <span className="text-amber-400 font-bold">
                          {item.price ? (
                            <>
                              <span className="font-sans text-xs text-amber-500/80 mr-0.5">$</span>
                              <span className="font-serif text-lg tracking-wide">{item.price.toLocaleString('es-CO')}</span>
                              <span className="font-sans text-[10px] text-stone-400 ml-1">COP</span>
                            </>
                          ) : (
                            <span className="font-sans text-xs text-amber-400">A consultar</span>
                          )}
                        </span>
                      </div>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-stone-950 text-xs font-display font-semibold uppercase tracking-wider transition-all"
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