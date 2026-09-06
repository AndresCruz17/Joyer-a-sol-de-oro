import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Sol de Oro Joyería & Compraventa',
  description:
    'Conoce la tradición, compromiso y maestría orfebre de Sol de Oro. Joyas exclusivas en Oro de 18K y avalúos de confianza en El Remolino, Nariño.',
};

export default function SobreNosotrosPage() {
  const whatsappUrl = getWhatsAppUrl(
    'Hola *Sol de Oro*, deseo conocer más sobre su historia y solicitar asesoría personalizada.'
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Navegación Superior */}
      <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>←</span> Volver al Inicio
          </Link>

          <Link href="/" className="font-serif italic text-lg tracking-wide text-amber-300">
            {SITE_CONFIG.shortName}
          </Link>

          <Link
            href="/catalogo"
            className="text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors hidden sm:block"
          >
            Explorar Catálogo
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative py-16 sm:py-24 px-6 border-b border-stone-800/80 overflow-hidden text-center">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-gradient-to-b from-amber-500/10 via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-3">
            Tradición & Excelencia // Oro Nacional 18K
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-light text-stone-100 mb-6">
            Nuestra <span className="italic text-amber-400">Historia</span>
          </h1>
          <p className="text-stone-300 font-light leading-relaxed text-base sm:text-lg">
            En <strong className="text-amber-300 font-normal">Sol de Oro Joyería & Compraventa</strong>, transformamos el metal más noble en símbolos de elegancia permanente, confianza y valor auténtico para nuestros clientes.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {/* Sección Quienes Somos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block">
              Quienes Somos
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light">
              Pasión por la orfebrería de alta pureza
            </h2>
            <p className="text-sm text-stone-300 font-light leading-relaxed">
              Ubicados en el corazón de <strong className="text-stone-100 font-medium">El Remolino, Taminango, Nariño</strong>, nos consolidamos como un referente regional en el comercio y elaboración de piezas exclusivas en <strong className="text-amber-300 font-medium">Oro de 18 Kilates Ley 750</strong>.
            </p>
            <p className="text-sm text-stone-400 font-light leading-relaxed">
              Nuestra misión es ofrecer una experiencia transparente, tanto para quienes buscan perpetuar momentos inolvidables a través de una joya fina, como para quienes desean valorar y vender su oro con avalúos justos y pago inmediato.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-stone-900/60 border border-stone-800 space-y-6">
            <div className="border-l-2 border-amber-500 pl-4">
              <h3 className="font-serif text-lg text-amber-300 mb-1">Garantía de Por Vida</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Cada gramo entregado en nuestras piezas cuenta con certificación perpetua de pureza en Oro 18K Ley 750.
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-4">
              <h3 className="font-serif text-lg text-amber-300 mb-1">Avalúos Precisos</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Pruebas de ácido y pesaje de precisión a la vista del cliente con los mejores precios por gramo del mercado.
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-4">
              <h3 className="font-serif text-lg text-amber-300 mb-1">Envíos 100% Asegurados</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Custodia integral y transporte especializado para entrega segura en cualquier ciudad de Colombia.
              </p>
            </div>
          </div>
        </section>

        {/* Pilares de Valor */}
        <section className="border-t border-stone-800/80 pt-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider block mb-2">
              Nuestros Pilares
            </span>
            <h2 className="font-serif text-3xl font-light text-stone-100">
              El Estándar <span className="italic text-amber-400">Sol de Oro</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-4 block">👑</span>
                <h3 className="font-serif text-lg text-stone-100 mb-2">Orfebrería a Medida</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Creamos piezas personalizadas a partir de tus ideas o fotografías con acabados y engastes de precisión.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-4 block">⚖️</span>
                <h3 className="font-serif text-lg text-stone-100 mb-2">Transparencia Total</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Sin intermediarios ni comisiones ocultas. Cotizaciones claras con precios actualizados según la cotización del metal.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-4 block">📍</span>
                <h3 className="font-serif text-lg text-stone-100 mb-2">Sede Física</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Atención presencial en {SITE_CONFIG.address}, {SITE_CONFIG.city}. Abrimos las puertas para brindarte total respaldo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Llamado a la Acción */}
        <section className="text-center py-12 px-6 rounded-3xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-stone-800 max-w-3xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl font-light">
            ¿Deseas una pieza especial o una cotización?
          </h2>
          <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
            Nuestros orfebres y asesores están listos para responder tus dudas y orientarte sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Contactar por WhatsApp
            </a>
            <Link
              href="/catalogo"
              className="px-6 py-3.5 rounded-xl border border-stone-700 hover:border-amber-500 hover:text-amber-300 text-xs font-semibold transition-all"
            >
              Ver Catálogo Disponible
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}