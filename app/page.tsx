import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  const categoryList = categories || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 overflow-hidden">
      
      {/* 1. HEADER / NAVEGACIÓN */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-stone-950/75 border-b border-amber-500/15 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform duration-300">
              <span className="text-stone-950 font-serif font-bold text-lg">SO</span>
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 group-hover:opacity-90 transition-opacity">
              SOL DE ORO
            </span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-stone-300">
            <a href="#coleccion" className="hover:text-amber-400 transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-400 hover:after:w-full after:transition-all">Colecciones</a>
            <a href="#garantia" className="hover:text-amber-400 transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-400 hover:after:w-full after:transition-all">Garantía 18K</a>
            <a href="#personalizado" className="hover:text-amber-400 transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-amber-400 hover:after:w-full after:transition-all">Personalizados</a>
          </nav>

          <a
            href="https://wa.me/?text=Hola,%20me%20gustaria%20recibir%20asesoria%20sobre%20sus%20joyas%20en%20Oro%2018K"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium hover:bg-amber-500 hover:text-stone-950 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-95"
          >
            <span>Asesoría WhatsApp</span>
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION CON LUZ AMBIENTAL */}
      <section className="relative pt-24 pb-28 md:pt-36 md:pb-44 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
        
        {/* Destellos de luz en el fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none animate-gold-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/30 mb-8 uppercase backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-float-slow">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Joyería Fina & Exclusiva
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.15] mb-8">
            Elegancia inmortal en <br className="hidden sm:inline" />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
              Oro de 18 Kilates
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-stone-400 text-base sm:text-lg mb-12 leading-relaxed font-light">
            Piezas forjadas con precisión artesanal para inmortalizar tus momentos más especiales con la máxima pureza y sofisticación.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="#coleccion"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-bold text-sm hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
            >
              Explorar Colección
            </a>
            <a
              href="#personalizado"
              className="w-full sm:w-auto px-9 py-4 rounded-full border border-stone-700/80 bg-stone-900/40 text-stone-300 font-medium text-sm hover:border-amber-500/50 hover:text-amber-300 hover:bg-stone-900/80 transition-all duration-300 backdrop-blur-md"
            >
              Piezas a la Medida
            </a>
          </div>
        </div>
      </section>

      {/* 3. PROPUESTAS DE VALOR CON GLASSMORPHISM */}
      <section id="garantia" className="border-y border-amber-500/10 bg-stone-900/30 backdrop-blur-md py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 text-center">
            <div className="text-amber-400 text-2xl font-serif mb-3">✨ Oro 18K Certificado</div>
            <p className="text-stone-400 text-sm leading-relaxed">Garantía de pureza de por vida y certificado de autenticidad respaldado en cada joya.</p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 text-center">
            <div className="text-amber-400 text-2xl font-serif mb-3">📦 Envíos Asegurados</div>
            <p className="text-stone-400 text-sm leading-relaxed">Entregas protegidas a nivel nacional con empaque de lujo de máxima seguridad.</p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 text-center">
            <div className="text-amber-400 text-2xl font-serif mb-3">🎨 Orfebrería Exclusiva</div>
            <p className="text-stone-400 text-sm leading-relaxed">Materializamos tus bocetos e ideas en piezas únicas hechas a la medida.</p>
          </div>

        </div>
      </section>

      {/* 4. GRID DE CATEGORÍAS (TARJETAS INTERACTIVAS) */}
      <section id="coleccion" className="max-w-7xl mx-auto px-4 py-28 relative">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 mb-4 tracking-wide">
            Nuestras <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Colecciones</span>
          </h2>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto font-light">
            Selecciona una categoría para explorar piezas creadas con los más altos estándares de la joyería fina.
          </p>
        </div>

        {error ? (
          <div className="text-center p-8 rounded-2xl bg-red-950/30 border border-red-800/50 text-red-300">
            Error al conectar con la base de datos de categorías.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryList.map((cat) => (
              <div
                key={cat.id}
                className="group relative rounded-2xl bg-gradient-to-b from-stone-900/90 to-stone-950 border border-stone-800/90 p-8 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Resplandor superior en hover */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400/90 border border-amber-500/20 px-2.5 py-1 rounded-full bg-amber-500/5 uppercase">
                      Oro 18K
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-400/40 group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_rgba(245,158,11,1)] transition-all duration-300"></span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-stone-100 mb-3 group-hover:text-amber-300 transition-colors duration-200">
                    {cat.name}
                  </h3>

                  <p className="text-stone-400 text-sm leading-relaxed mb-8 font-light">
                    {cat.description || 'Diseños exclusivos fabricados en oro de 18K con acabados impecables.'}
                  </p>
                </div>

                <Link
                  href={`/categoria/${cat.slug}`}
                  className="inline-flex items-center justify-between text-xs font-semibold tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors uppercase pt-5 border-t border-stone-800/80"
                >
                  <span>Explorar categoría</span>
                  <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. CALL TO ACTION CON RESPLANDOR */}
      <section id="personalizado" className="max-w-7xl mx-auto px-4 pb-28">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/80 to-stone-900 border border-amber-500/30 p-8 sm:p-16 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-4 font-light">
              ¿Deseas una joya <span className="text-amber-400 italic">a la medida</span>?
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mb-10 font-light leading-relaxed">
              Trabajamos con presupuestos personalizados para fabricar argollas de matrimonio, anillos de compromiso y piezas únicas con tus especificaciones exactas.
            </p>
            <a
              href="https://wa.me/?text=Hola,%20tengo%20una%20idea%20para%20una%20joya%20personalizada%20en%20Oro%2018K"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-9 py-4 rounded-full bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
            >
              Cotizar con un Orfebre
            </a>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-stone-900 bg-stone-950 py-12 text-stone-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-serif text-sm text-amber-200/80 tracking-widest mb-2 uppercase">SOL DE ORO</p>
          <p className="mb-6 text-stone-400">Alta Joyería & Orfebrería en Oro de 18 Kilates</p>
          <p className="text-stone-600">© {new Date().getFullYear()} Sol de Oro. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}