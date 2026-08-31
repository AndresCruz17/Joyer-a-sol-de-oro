import { createClient } from '@/lib/supabase/server';
import CustomCursor from '@/components/ui/CustomCursor';
import CategoryCarousel from '@/components/home/CategoryCarousel';
import Image from 'next/image';

export default async function HomePage() {
  const supabase = await createClient();

  // 1. Obtener categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  // 2. Obtener productos creados con su categoría
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  const categoryList = categories || [];
  const productList = products || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 overflow-x-hidden relative">
      
      <CustomCursor />

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-stone-950/70 border-b border-amber-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:rotate-180 transition-transform duration-700">
              <span className="text-stone-950 font-serif font-bold text-lg">SO</span>
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              SOL DE ORO
            </span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-stone-300">
            <a href="#coleccion" className="hover:text-amber-400 transition-colors py-1">Colecciones</a>
            <a href="#catalogo" className="hover:text-amber-400 transition-colors py-1">Joyería Fina</a>
            <a href="#personalizado" className="hover:text-amber-400 transition-colors py-1">Personalizados</a>
          </nav>

          <a
            href="https://wa.me/?text=Hola,%20quisiera%20asesoria%20sobre%20joyas%20en%20Oro%2018K"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium hover:bg-amber-500 hover:text-stone-950 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300"
          >
            WhatsApp Directo
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-28 md:pt-36 md:pb-40 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/30 mb-8 uppercase backdrop-blur-md">
            Alta Orfebrería Colombiana
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-light tracking-tight leading-[1.08] mb-8">
            Elegancia en <br />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]">
              Oro de 18K
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-400 text-base sm:text-lg mb-12 font-light leading-relaxed">
            Piezas exclusivas diseñadas para capturar momentos inolvidables con la máxima pureza y sofisticación.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="#catalogo"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-bold text-sm hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-105 transition-all duration-300"
            >
              Ver Catálogo
            </a>
            <a
              href="#personalizado"
              className="w-full sm:w-auto px-9 py-4 rounded-full border border-stone-700/80 bg-stone-900/40 text-stone-300 font-medium text-sm hover:border-amber-500/50 hover:text-amber-300 transition-all duration-300"
            >
              Diseños Exclusivos
            </a>
          </div>
        </div>
      </section>

      {/* CARRUSEL DE CATEGORÍAS */}
      <section id="coleccion" className="max-w-7xl mx-auto px-4 py-16 relative">
        <CategoryCarousel categories={categoryList} />
      </section>

      {/* SECCIÓN DE PRODUCTOS PUBLICADOS */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">
            02 // Piezas Disponibles
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100">
            Catálogo de <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Alta Joyería</span>
          </h2>
        </div>

        {productList.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-stone-900/40 border border-stone-800 text-stone-400 text-sm">
            Próximamente nuevas piezas exclusivas. Agrega productos desde el panel administrador.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productList.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-stone-800/80 hover:border-amber-500/50 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(245,158,11,0.15)] flex flex-col justify-between"
              >
                <div>
                  {/* Foto de la Joya */}
                  <div className="relative h-64 w-full bg-stone-950 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600 text-xs font-mono">
                        [ Sin Imagen ]
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-mono px-2.5 py-1 rounded-full uppercase">
                      {item.categories?.name || 'Oro 18K'}
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl text-stone-100 mb-2 group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h3>

                    {item.weight_grams && (
                      <p className="text-xs font-mono text-amber-400/90 mb-3">
                        Peso aproximado: {item.weight_grams}g en Oro 18K
                      </p>
                    )}

                    <p className="text-stone-400 text-sm font-light line-clamp-2 mb-6">
                      {item.description || 'Joya artesanal con certificación de pureza en oro de 18 kilates.'}
                    </p>
                  </div>
                </div>

                {/* Pie con Precio y WhatsApp */}
                <div className="p-6 pt-0 flex items-center justify-between border-t border-stone-800/60 mt-auto">
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Precio COP</span>
                    <span className="font-mono text-xl font-bold text-amber-400">
                      ${item.price?.toLocaleString('es-CO')}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hola, estoy interesado/a en la joya "${item.name}" (COP $${item.price?.toLocaleString('es-CO')}). ¿Tienen disponibilidad?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500 hover:text-stone-950 transition-all"
                  >
                    Cotizar Joya
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA & FOOTER */}
      <section id="personalizado" className="max-w-7xl mx-auto px-4 pb-28">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-900 border border-amber-500/30 p-8 sm:p-16 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <h2 className="font-serif text-3xl sm:text-5xl text-stone-100 mb-4 font-light">
            ¿Buscas una pieza <span className="text-amber-400 italic">a la medida</span>?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base mb-10 font-light max-w-xl mx-auto">
            Fabricamos argollas de matrimonio, anillos de compromiso y dijes con tu diseño personalizado.
          </p>
          <a
            href="https://wa.me/?text=Hola,%20quiero%20cotizar%20un%20diseno%20personalizado"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-9 py-4 rounded-full bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-105 transition-all duration-300"
          >
            Hablar con un Orfebre
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-900 bg-stone-950 py-12 text-stone-500 text-xs text-center">
        <p className="font-serif text-sm text-amber-200/80 tracking-widest mb-2 uppercase">SOL DE ORO</p>
        <p>© {new Date().getFullYear()} Sol de Oro. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}