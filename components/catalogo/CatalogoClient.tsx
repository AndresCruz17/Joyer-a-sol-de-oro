'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/config';
import LuxuryNavbar from '@/components/ui/LuxuryNavbar';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  weight_grams: number | null;
  image_url: string | null;
  category_id: string | null;
  categories: { name: string; slug?: string } | { name: string; slug?: string }[] | null;
  created_at: string;
}

export interface CatalogoClientProps {
  initialCategories?: Category[];
  initialProducts?: Product[];
}

function CatalogoContent({ initialCategories, initialProducts }: CatalogoClientProps) {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialCategories && !initialProducts);

  // Estados para filtros con soporte de inicialización por URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('categoria') || 'all'
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    // Si los datos ya vienen precargados desde el servidor (SSR / ISR), no ejecutamos fetch cliente
    if (initialCategories && initialProducts) {
      return;
    }

    async function fetchData() {
      setLoading(true);

      // Fetch Categorías
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      // Fetch Productos con su categoría (solo productos activos)
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, description, price, weight_grams, image_url, category_id, created_at, categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData as unknown as Product[]);

      setLoading(false);
    }

    fetchData();
  }, [supabase, initialCategories, initialProducts]);

  // Synchronize category if query param changes dynamically
  useEffect(() => {
    const catParam = searchParams.get('categoria');
    const qParam = searchParams.get('q');
    if (catParam) setSelectedCategory(catParam);
    if (qParam) setSearchQuery(qParam);
  }, [searchParams]);

  // Filtrado y Ordenamiento dinámico
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'all' || item.category_id === selectedCategory;

        const catName = (Array.isArray(item.categories) ? item.categories[0]?.name : item.categories?.name) || '';
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (catName && catName.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 pt-20 sm:pt-24 relative overflow-hidden">

      {/* HEADER / NAV UNIFICADO */}
      <LuxuryNavbar />

      {/* LUCES VOLUMÉTRICAS AMBIENTALES */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

      {/* BANNER PRINCIPAL EDITORIAL */}
      <header className="relative py-14 sm:py-20 px-6 text-center border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
            <span>Galería Oficial // Oro Nacional & Italiano 18K</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-stone-100 tracking-tight">
            Catálogo de <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">Alta Joyería</span>
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Explora piezas exclusivas forjadas con precisión orfebre y certificación perpetua de pureza en Oro 18K Ley 750.
          </p>
        </div>
      </header>

      {/* BARRA FLOTANTE DE BÚSQUEDA Y FILTROS EN CRISTAL (COORDINADA CON EL NAVBAR) */}
      <section className="sticky top-[68px] sm:top-[76px] z-30 bg-stone-950/85 backdrop-blur-2xl border-b border-white/10 py-4 px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between">

            {/* Buscador */}
            <div className="relative w-full md:w-96">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por anillo, cadena, peso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900/70 border border-white/10 rounded-full pl-10 pr-9 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 transition-colors backdrop-blur-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-300"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de Orden & Contador */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest shrink-0">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Joya' : 'Joyas'}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider hidden sm:inline">
                  Ordenar:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
                  className="bg-stone-900/70 border border-white/10 text-xs font-sans text-stone-300 rounded-full px-3.5 py-2 focus:outline-none focus:border-amber-400/60 cursor-pointer backdrop-blur-xl"
                >
                  <option value="newest">Más Recientes</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Carrusel de Categorías (Glass Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-sans tracking-wider uppercase transition-all shrink-0 border active:scale-[0.98] ${
                selectedCategory === 'all'
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 font-medium shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-900/60 border-white/10 text-stone-400 hover:border-amber-400/30 hover:text-stone-200'
              }`}
            >
              Todas ({products.length})
            </button>

            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-sans tracking-wider uppercase transition-all shrink-0 border active:scale-[0.98] ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 font-medium shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-stone-900/60 border-white/10 text-stone-400 hover:border-amber-400/30 hover:text-stone-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRID DE PRODUCTOS (HAUTE JOAILLERIE CARDS) */}
      <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        {loading ? (
          /* SKELETON LOADER ANIMADO EN CRISTAL */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-3xl bg-stone-900/40 border border-white/10 overflow-hidden animate-pulse">
                <div className="aspect-square bg-stone-900" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-stone-900 rounded-full w-3/4" />
                  <div className="h-3 bg-stone-900 rounded-full w-1/2" />
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="h-6 bg-stone-900 rounded-full w-1/3" />
                    <div className="h-8 bg-stone-900 rounded-full w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-3xl bg-stone-900/30 max-w-md mx-auto p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-500 text-lg mx-auto">
              💎
            </div>
            <h3 className="font-serif text-xl text-stone-200 font-light">No se encontraron joyas</h3>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Prueba cambiando los términos de búsqueda o seleccionando otra colección.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-sans uppercase tracking-wider hover:bg-amber-400 hover:text-stone-950 transition-all font-semibold active:scale-[0.98]"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item) => {
              const categoryName = (Array.isArray(item.categories) ? item.categories[0]?.name : item.categories?.name) || 'Joyería';
              const itemWeight = item.weight_grams ? `${item.weight_grams}g` : 'A consultar';
              const itemPrice = item.price ? `$${item.price.toLocaleString('es-CO')} COP` : 'A consultar';
              const itemImage = item.image_url || '';

              const whatsappText =
                `✨ *COTIZACIÓN DE JOYA // SOL DE ORO* ✨\n\n` +
                `📌 *Joya:* ${item.name}\n` +
                `🏷️ *Colección:* ${categoryName}\n` +
                `⚖️ *Peso aprox:* ${itemWeight}\n` +
                `💰 *Precio catálogo:* ${itemPrice}\n` +
                `👑 *Material:* Oro 18K Ley 750\n` +
                (itemImage ? `\n🖼️ *Ver Foto:* ${itemImage}\n\n` : '\n') +
                `Hola, me interesa conocer disponibilidad y métodos de pago para esta pieza.`;

              const whatsappUrl = getWhatsAppUrl(whatsappText);

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-stone-900/40 border border-white/10 hover:border-amber-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)] backdrop-blur-xl"
                >
                  {/* Foto Clickeable */}
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
                      {categoryName}
                    </span>
                  </Link>

                  {/* Ficha e Información */}
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
                        {/* Renderizado de precio */}
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

export default function CatalogoClient(props: CatalogoClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 text-stone-500 flex items-center justify-center font-mono text-xs">
        Cargando catálogo...
      </div>
    }>
      <CatalogoContent {...props} />
    </Suspense>
  );
}
