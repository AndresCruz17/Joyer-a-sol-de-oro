import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();

  // Consulta dinámica de categorías desde Supabase
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  const categoryList = categories || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* 1. HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-stone-950/80 border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-stone-950 font-serif font-bold text-lg">SO</span>
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              SOL DE ORO
            </span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-stone-300">
            <a href="#coleccion" className="hover:text-amber-400 transition-colors">Colecciones</a>
            <a href="#garantia" className="hover:text-amber-400 transition-colors">Garantía 18K</a>
            <a href="#personalizado" className="hover:text-amber-400 transition-colors">Personalizados</a>
          </nav>

          <a
            href="https://wa.me/?text=Hola,%20me%20gustaria%20recibir%20asesoria%20sobre%20sus%20joyas%20en%20Oro%2018K"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium hover:bg-amber-500 hover:text-stone-950 transition-all duration-300 shadow-sm"
          >
            <span>Asesoría WhatsApp</span>
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION (IMPACTO VISUAL) */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 mb-6 uppercase">
            Joyería Fina & Exclusiva
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-tight mb-6">
            Elegancia inmortal en <br className="hidden sm:inline" />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              Oro de 18 Kilates
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-stone-400 text-base sm:text-lg mb-10 leading-relaxed font-light">
            Diseños hechos para perdurar por generaciones. Encuentra la pieza perfecta para sellar momentos inolvidables con la máxima pureza y distinción.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#coleccion"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
            >
              Explorar Categorías
            </a>
            <a
              href="#personalizado"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-stone-700 text-stone-300 font-medium text-sm hover:border-amber-500/50 hover:text-amber-300 transition-all"
            >
              Diseño Personalizado
            </a>
          </div>
        </div>
      </section>

      {/* 3. PROPUETAS DE VALOR / CONFIANZA */}
      <section id="garantia" className="border-y border-stone-800 bg-stone-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <div className="text-amber-400 text-2xl font-serif mb-2">✨ Oro 18K Garantizado</div>
            <p className="text-stone-400 text-sm">Todas nuestras piezas cuentan con certificado de pureza y autenticidad de por vida.</p>
          </div>
          <div className="p-4 border-y md:border-y-0 md:border-x border-stone-800">
            <div className="text-amber-400 text-2xl font-serif mb-2">📦 Envíos Seguros</div>
            <p className="text-stone-400 text-sm">Entregas aseguradas a todo el país con empaque de lujo de alta protección.</p>
          </div>
          <div className="p-4">
            <div className="text-amber-400 text-2xl font-serif mb-2">🎨 Alta Joyería a la Medida</div>
            <p className="text-stone-400 text-sm">Materializamos tus ideas en piezas exclusivas hechas por maestros orfebres.</p>
          </div>
        </div>
      </section>

      {/* 4. GRID DE CATEGORÍAS (DESDE SUPABASE) */}
      <section id="coleccion" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-100 mb-4">
            Nuestras <span className="italic text-amber-400">Colecciones</span>
          </h2>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto">
            Explora nuestro catálogo por categoría y descubre el arte de la orfebrería en cada detalle.
          </p>
        </div>

        {error ? (
          <div className="text-center p-8 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-300">
            Ocurrió un error al cargar las categorías desde Supabase.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryList.map((cat) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 p-8 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono tracking-widest text-amber-500 uppercase">
                      Oro 18K
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"></span>
                  </div>
                  <h3 className="font-serif text-2xl text-stone-100 mb-3 group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-stone-400 text-sm leading-relaxed mb-6 font-light">
                    {cat.description || 'Joyas exclusivas en oro de 18K diseñadas con precisión.'}
                  </p>
                </div>
                <Link
                  href={`/categoria/${cat.slug}`}
                  className="inline-flex items-center text-xs font-semibold tracking-wider text-amber-400 hover:text-amber-300 transition-colors uppercase pt-4 border-t border-stone-800/80"
                >
                  Explorar catálogo →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SECCIÓN PERSONALIZADOS / CALL TO ACTION */}
      <section id="personalizado" className="max-w-7xl mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-amber-950/20 to-stone-900 border border-amber-500/30 p-8 sm:p-14 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-4">
              ¿Tienes un diseño único en mente?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mb-8 font-light leading-relaxed">
              Trabajamos sobre pedido para fabricar anillos de compromiso, argollas de matrimonio o piezas personalizadas según tu presupuesto y estilo.
            </p>
            <a
              href="https://wa.me/?text=Hola,%20tengo%20una%20idea%20para%20una%20joya%20personalizada%20en%20Oro%2018K"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 rounded-full bg-amber-500 text-stone-950 font-semibold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              Cotizar mi Diseño
            </a>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-stone-900 bg-stone-950 py-12 text-stone-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-serif text-sm text-stone-300 mb-2">SOL DE ORO — Joyería Fina</p>
          <p className="mb-6">Especialistas en piezas en Oro de 18 Kilates</p>
          <p>© {new Date().getFullYear()} Sol de Oro. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}