import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Obtener las categorías de la tienda
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // 2. Obtener joyas destacadas/recientes con la información de su categoría
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .order('created_at', { ascending: false })
    .limit(6);

  const categoriesList = categories || [];
  const productsList = featuredProducts || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">

      {/* Navegación Superior */}
      <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif italic text-2xl tracking-wide text-amber-300">
            Sol de Oro
          </Link>

          <div className="flex items-center gap-6 text-xs font-mono">
            <Link href="/catalogo" className="text-stone-300 hover:text-amber-400 transition-colors">
              Catálogo Completo
            </Link>
            <a
              href="https://wa.me/573000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all"
            >
              Contactar
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 md:py-28 px-6 text-center border-b border-stone-800/80 overflow-hidden bg-gradient-to-b from-stone-900/50 to-stone-950">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-4">
            Joyería Fina en Oro Nacional 18K
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-stone-100 mb-6 leading-tight">
            Elegancia atemporal esculpida en <span className="italic text-amber-300">Oro puro</span>
          </h1>
          <p className="text-stone-400 text-sm sm:text-base font-light max-w-xl mx-auto mb-8 leading-relaxed">
            Explora nuestras colecciones exclusivas de anillos, cadenas, dijes y pulseras. Diseños garantizados de por vida.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/catalogo"
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </header>

      {/* Explorar Colecciones (Categorías) */}
      {categoriesList.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16 border-b border-stone-800/80">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                Explorar por
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-100">
                Nuestras Colecciones
              </h2>
            </div>
            <Link href="/catalogo" className="text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors">
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesList.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group p-6 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-900/80 transition-all text-center flex flex-col items-center justify-center min-h-[120px]"
              >
                <h3 className="font-serif text-lg text-stone-200 group-hover:text-amber-300 transition-colors capitalize">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-mono text-stone-500 mt-2 group-hover:text-amber-400/80 transition-colors">
                  Ver piezas →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Joyas Destacadas / Selección Especial */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
              Catálogo Seleccionado
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-100">
              Piezas Destacadas
            </h2>
          </div>
          <Link href="/catalogo" className="text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors">
            Ver catálogo completo →
          </Link>
        </div>

        {productsList.length === 0 ? (
          <div className="text-center py-16 border border-stone-800 rounded-3xl bg-stone-900/20">
            <p className="font-serif text-stone-400">Aún no hay productos en la exhibición principal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsList.map((item) => {
              const categoryName = item.categories?.name || 'Joyería';
              const itemWeight = item.weight_grams ? `${item.weight_grams}g` : 'A consultar';
              const itemPrice = item.price ? `$${item.price.toLocaleString('es-CO')} COP` : 'A consultar';
              const itemImage = item.image_url || '';

              // Mensaje de cotización estructurado para WhatsApp
              const whatsappText =
                `✨ *COTIZACIÓN RÁPIDA // SOL DE ORO* ✨\n\n` +
                `📌 *Joya:* ${item.name}\n` +
                `🏷️ *Colección:* ${categoryName}\n` +
                `⚖️ *Peso aprox:* ${itemWeight}\n` +
                `💰 *Precio:* ${itemPrice}\n` +
                `👑 *Material:* Oro 18K\n` +
                (itemImage ? `\n🖼️ *Ver Foto:* ${itemImage}\n\n` : '\n') +
                `Hola, me interesa recibir más información sobre esta joya.`;

              const whatsappUrl = `https://wa.me/573000000000?text=${encodeURIComponent(whatsappText)}`; // Reemplazar con el número real de WhatsApp

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Imagen del Producto (Clic para ir a /producto/[id]) */}
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
                    <span className="absolute top-3 left-3 text-[10px] font-mono bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase">
                      Oro 18K
                    </span>
                  </Link>

                  {/* Ficha e Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                        {categoryName}
                      </span>

                      {/* Nombre Clickeable */}
                      <Link href={`/producto/${item.id}`}>
                        <h3 className="font-serif text-xl text-stone-100 group-hover:text-amber-300 transition-colors mb-2">
                          {item.name}
                        </h3>
                      </Link>

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

                      {/* Botón de Cotizar Directo por WhatsApp */}
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

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-12 px-6 text-center text-xs font-mono text-stone-500">
        <p className="mb-2">Sol de Oro — Joyería Fina 18K</p>
        <p className="text-stone-600">Garantía de por vida en el metal.</p>
      </footer>

    </div>
  );
}