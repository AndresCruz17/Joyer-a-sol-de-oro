import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cache } from 'react';
import { getWhatsAppUrl, SITE_CONFIG } from '@/lib/config';
import LuxuryNavbar from '@/components/ui/LuxuryNavbar';

// REVALIDACIÓN INCREMENTAL (ISR) CADA 60 SEGUNDOS
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

// 💡 OPTIMIZACIÓN: Función cacheada para compartir consulta entre Metadata y Page
const getCategory = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, description')
    .ilike('slug', slug)
    .maybeSingle();

  if (error || !category) return null;
  return category;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Colección no encontrada | Sol de Oro',
      description: 'La categoría seleccionada no existe en nuestro catálogo.',
    };
  }

  const title = `Colección ${category.name} en Oro 18K | Sol de Oro`;
  const description =
    category.description ||
    `Explora nuestra exclusiva colección de ${category.name} en Oro 18K Ley 750 con garantía de por vida. Sol de Oro Joyería & Compraventa.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Sol de Oro — Joyería Fina 18K',
      images: category.image_url ? [{ url: category.image_url }] : [],
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Obtener TODAS las categorías para el selector de navegación rápida
  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const categoriesList = allCategories || [];

  // 2. Obtener los productos asociados a esta categoría (solo activos)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, price, weight_grams, image_url, category_id, created_at')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const productList = products || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 pt-20 sm:pt-24 relative overflow-hidden">

      {/* NAVEGACIÓN GLOBAL UNIFICADA */}
      <LuxuryNavbar />

      {/* LUCES VOLUMÉTRICAS AMBIENTALES */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

      {/* BREADCRUMB EDITORIAL EN CRISTAL */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs font-sans text-stone-400">
          <Link href="/" className="hover:text-amber-300 transition-colors">
            Inicio
          </Link>
          <span className="text-stone-700">/</span>
          <Link href="/catalogo" className="hover:text-amber-300 transition-colors">
            Catálogo
          </Link>
          <span className="text-stone-700">/</span>
          <span className="text-amber-300 font-medium capitalize">
            {category.name}
          </span>
        </nav>
      </div>

      {/* BANNER EDITORIAL DE LA COLECCIÓN */}
      <header className="relative py-12 sm:py-18 px-6 text-center border-b border-white/10 overflow-hidden">
        {category.image_url && (
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
            <img
              src={category.image_url}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110"
            />
          </div>
        )}

        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
            <span>Colección Oficial // Oro 18K Ley 750</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-stone-100 tracking-tight capitalize">
            Colección <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">{category.name}</span>
          </h1>

          {category.description && (
            <p className="text-sm text-stone-300 font-sans font-light leading-relaxed max-w-xl mx-auto">
              {category.description}
            </p>
          )}

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900/60 border border-white/10 text-[11px] font-mono text-stone-400 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{productList.length} {productList.length === 1 ? 'joya disponible' : 'joyas disponibles'}</span>
          </div>
        </div>
      </header>

      {/* SELECTOR RÁPIDO DE COLECCIONES (STICKY CON OFFSET COORDINADO AL NAVBAR) */}
      <section className="sticky top-[68px] sm:top-[76px] z-30 bg-stone-950/85 backdrop-blur-2xl border-b border-white/10 py-3.5 px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          <Link
            href="/catalogo"
            className="px-4 py-1.5 rounded-full text-[11px] font-sans tracking-wider uppercase transition-all shrink-0 border border-white/10 bg-stone-900/60 text-stone-400 hover:border-amber-400/40 hover:text-stone-200"
          >
            ← Todo el Catálogo
          </Link>

          <span className="w-px h-4 bg-white/10 shrink-0 mx-1" />

          {categoriesList.map((cat) => {
            const isActive = cat.id === category.id;
            return (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-[11px] font-sans tracking-wider uppercase transition-all shrink-0 border active:scale-[0.98] ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 font-medium shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-stone-900/60 border-white/10 text-stone-400 hover:border-amber-400/30 hover:text-stone-200'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* GRID DE PRODUCTOS (HAUTE JOAILLERIE CARDS) */}
      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        {productList.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-3xl bg-stone-900/30 max-w-md mx-auto p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-500 text-lg mx-auto">
              💎
            </div>
            <h3 className="font-serif text-xl text-stone-200 font-light">Colección en Preparación</h3>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Actualmente nuestros orfebres están forjando nuevas piezas para la colección de {category.name}.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link
                href="/catalogo"
                className="px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-sans uppercase tracking-wider hover:bg-amber-400 hover:text-stone-950 transition-all font-semibold active:scale-[0.98]"
              >
                Ver Todo el Catálogo
              </Link>
              <a
                href={getWhatsAppUrl(`Hola Sol de Oro, me gustaría encargar una pieza personalizada para la colección de ${category.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-stone-300 text-xs font-sans uppercase tracking-wider hover:text-amber-300 hover:border-white/20 transition-all"
              >
                Diseñar por Encargo →
              </a>
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
                `💰 *Precio catálogo:* ${itemPrice}\n` +
                `👑 *Material:* Oro 18K Ley 750\n` +
                (itemImage ? `\n🖼️ *Ver Foto:* ${itemImage}\n\n` : '\n') +
                `Hola, me interesa recibir más información sobre esta pieza de su colección.`;

              const whatsappUrl = getWhatsAppUrl(whatsappText);

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-stone-900/40 border border-white/10 hover:border-amber-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)] backdrop-blur-xl"
                >
                  {/* Foto con enlace a Detalle */}
                  <Link href={`/producto/${item.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-950 block">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-95"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600 font-serif">
                        Sin Foto
                      </div>
                    )}
                    <span className="absolute top-3.5 left-3.5 text-[10px] font-sans bg-stone-950/80 backdrop-blur-md text-amber-300 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                      Oro 18K Ley 750
                    </span>
                  </Link>

                  {/* Detalles del Producto */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/producto/${item.id}`}>
                        <h3 className="font-serif text-xl sm:text-2xl text-stone-100 group-hover:text-amber-300 transition-colors tracking-wide mb-2">
                          {item.name}
                        </h3>
                      </Link>
                      {item.description && (
                        <p className="text-xs text-stone-400 font-sans font-light line-clamp-2 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        {item.weight_grams && (
                          <span className="text-[10px] font-mono text-stone-400 block uppercase tracking-wider">
                            Peso: {item.weight_grams}g
                          </span>
                        )}
                        <span className="text-amber-400 font-bold">
                          {item.price ? (
                            <>
                              <span className="font-sans text-xs text-amber-500/80 mr-0.5">$</span>
                              <span className="font-serif text-lg tracking-wide text-amber-300">{item.price.toLocaleString('es-CO')}</span>
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
                        className="px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-400 hover:text-stone-950 text-xs font-sans font-semibold uppercase tracking-wider transition-all active:scale-[0.97]"
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

        {/* Sellos de Respaldo Orfebre */}
        <section className="mt-20 pt-12 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex items-start gap-4">
              <span className="text-2xl text-amber-400">🛡️</span>
              <div>
                <h4 className="font-serif text-base text-stone-100 mb-1">Garantía Perpetua</h4>
                <p className="text-xs text-stone-400 leading-relaxed font-sans">
                  Certificado de autenticidad de por vida en pureza Oro 18K Ley 750 (Nacional e Italiano).
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex items-start gap-4">
              <span className="text-2xl text-amber-400">⚖️</span>
              <div>
                <h4 className="font-serif text-base text-stone-100 mb-1">Balanza de Precisión</h4>
                <p className="text-xs text-stone-400 leading-relaxed font-sans">
                  Avalúos y pesajes calibrados en vivo para total transparencia con cada gramo.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex items-start gap-4">
              <span className="text-2xl text-amber-400">📦</span>
              <div>
                <h4 className="font-serif text-base text-stone-100 mb-1">Envíos Asegurados</h4>
                <p className="text-xs text-stone-400 leading-relaxed font-sans">
                  Despachos discretos con transportadoras de valores con seguro total a toda Colombia.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER GLOBAL DE ALTA JOYERÍA (UNIFICADO) */}
      <footer className="border-t border-white/10 bg-stone-950 py-14 text-stone-400 text-xs text-center relative z-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-xl tracking-widest text-amber-300">
              {SITE_CONFIG.shortName}
            </Link>
            <span className="text-stone-600">|</span>
            <span className="text-[10px] font-mono tracking-widest text-amber-400/80 uppercase">
              Oro 18K Ley 750
            </span>
          </div>

          <p className="font-sans text-stone-400 text-[11px]">
            © {new Date().getFullYear()} Sol de Oro Joyería & Compraventa. Taller orfebre & avalúos de precisión.
          </p>

          <div className="flex items-center gap-6 text-stone-300 font-sans text-xs tracking-wider">
            <Link href="/catalogo" className="hover:text-amber-300 transition-colors">
              Catálogo
            </Link>
            <span className="text-stone-700">•</span>
            <Link href="/sobre-nosotros" className="hover:text-amber-300 transition-colors">
              Sobre Nosotros
            </Link>
            <span className="text-stone-700">•</span>
            <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}