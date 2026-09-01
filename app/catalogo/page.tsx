'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const PHONE_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '573000000000';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  weight_grams: number | null;
  image_url: string | null;
  category_id: string | null;
  categories: { name: string } | null;
  created_at: string;
}

function CatalogoContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros con soporte de inicialización por URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('categoria') || 'all'
  );
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch Categorías
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Fetch Productos con su categoría
      const { data: prodData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData as Product[]);

      setLoading(false);
    }

    fetchData();
  }, []);

  // Synchronize category if query param changes dynamically
  useEffect(() => {
    const catParam = searchParams.get('categoria');
    const qParam = searchParams.get('q');
    if (catParam) setSelectedCategory(catParam);
    if (qParam) setSearchQuery(qParam);
  }, [searchParams]);

  // Filtrado y Ordenamiento dinámico
  const filteredProducts = products
    .filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category_id === selectedCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.categories?.name && item.categories.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (a.price || 0) - (b.price || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">

      {/* HEADER / NAV */}
      <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors">
            <span>←</span> Volver al Inicio
          </Link>

          <Link href="/" className="font-serif italic text-lg tracking-wide text-amber-300">
            Sol de Oro
          </Link>

          <a
            href={`https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent('Hola, quisiera asesoría sobre joyas en Oro de 18K')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-stone-300 hover:text-amber-400 transition-colors hidden sm:block"
          >
            Contacto WhatsApp
          </a>
        </div>
      </nav>

      {/* BANNER PRINCIPAL */}
      <header className="py-12 sm:py-16 px-6 text-center border-b border-stone-800/80 bg-gradient-to-b from-stone-900/40 to-stone-950">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-3">
            Colección Completa // Oro Nacional e Italiano 18K
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 mb-4">
            Catálogo de <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Alta Joyería</span>
          </h1>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            Explora todas nuestras piezas garantizadas de por vida en pureza de metal.
          </p>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <section className="max-w-7xl mx-auto px-6 py-6 border-b border-stone-800/80 sticky top-[57px] z-40 bg-stone-950/90 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Buscador */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar por anillo, cadena, peso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-full px-5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-500 hover:text-stone-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de Orden */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-[11px] font-mono text-stone-500 uppercase shrink-0">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-900 border border-stone-800 text-xs font-mono text-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/60"
            >
              <option value="newest">Más Recientes</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Categorías (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-4 mt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 border ${selectedCategory === 'all'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
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
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 border ${isActive
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* GRID DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          /* SKELETON LOADER ANIMADO */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-stone-900/30 border border-stone-800/60 overflow-hidden animate-pulse">
                <div className="aspect-square bg-stone-900" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-stone-900 rounded w-3/4" />
                  <div className="h-3 bg-stone-900 rounded w-1/2" />
                  <div className="pt-4 border-t border-stone-800/60 flex justify-between items-center">
                    <div className="h-6 bg-stone-900 rounded w-1/3" />
                    <div className="h-8 bg-stone-900 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-stone-800/60 rounded-3xl bg-stone-900/20 max-w-md mx-auto">
            <p className="font-serif text-lg text-stone-400 mb-2">No se encontraron joyas</p>
            <p className="text-xs font-mono text-stone-500 mb-6">
              Prueba cambiando la búsqueda o seleccionando otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-500 hover:text-stone-950 transition-all"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item) => {
              const categoryName = item.categories?.name || 'Joyería';
              const itemWeight = item.weight_grams ? `${item.weight_grams}g` : 'A consultar';
              const itemPrice = item.price ? `$${item.price.toLocaleString('es-CO')} COP` : 'A consultar';
              const itemImage = item.image_url || '';

              const whatsappText =
                `✨ *COTIZACIÓN RÁPIDA // SOL DE ORO* ✨\n\n` +
                `📌 *Joya:* ${item.name}\n` +
                `🏷️ *Colección:* ${categoryName}\n` +
                `⚖️ *Peso aprox:* ${itemWeight}\n` +
                `💰 *Precio:* ${itemPrice}\n` +
                `👑 *Material:* Oro 18K\n` +
                (itemImage ? `\n🖼️ *Ver Foto:* ${itemImage}\n\n` : '\n') +
                `Hola, me interesa recibir más información sobre esta joya.`;

              const whatsappUrl = `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(whatsappText)}`;

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Foto Clickeable */}
                  <Link href={`/producto/${item.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-950 block">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-700 font-serif">
                        Sin Foto
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-mono bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase">
                      {categoryName}
                    </span>
                  </Link>

                  {/* Ficha e Información */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
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
                        {/* Renderizado seguro del precio */}
                        <span className="font-mono text-lg text-amber-400 font-semibold">
                          {item.price ? (
                            <>
                              ${item.price.toLocaleString('es-CO')}{' '}
                              <span className="text-[10px] text-stone-400">COP</span>
                            </>
                          ) : (
                            <span className="text-xs text-stone-400 font-normal">A consultar</span>
                          )}
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

      {/* FOOTER */}
      <footer className="border-t border-stone-900 bg-stone-950 py-12 text-stone-500 text-xs text-center">
        <p className="font-serif text-sm text-amber-200/80 tracking-widest mb-2 uppercase">SOL DE ORO</p>
        <p>© {new Date().getFullYear()} Sol de Oro. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 text-stone-500 flex items-center justify-center font-mono text-xs">
        Cargando catálogo...
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  );
}