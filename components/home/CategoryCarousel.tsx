'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url?: string | null;
    description?: string | null;
}

interface Props {
    categories: Category[];
}

export default function CategoryCarousel({ categories }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!categories || categories.length === 0) {
        return null;
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -340 : 340;
            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="w-full relative">

            {/* Encabezado con Controles de Desplazamiento */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                        01 // Colecciones
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-100">
                        Explora por <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Categoría</span>
                    </h2>
                </div>

                {/* Botones de Navegación Flechas */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        aria-label="Anterior"
                        className="w-10 h-10 rounded-full border border-stone-800 bg-stone-900/80 text-stone-300 flex items-center justify-center hover:border-amber-500 hover:text-amber-300 hover:bg-stone-800 transition-all active:scale-95"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        aria-label="Siguiente"
                        className="w-10 h-10 rounded-full border border-stone-800 bg-stone-900/80 text-stone-300 flex items-center justify-center hover:border-amber-500 hover:text-amber-300 hover:bg-stone-800 transition-all active:scale-95"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Carrusel Deslizable */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/categoria/${cat.slug}`}
                        className="group relative flex-shrink-0 w-72 sm:w-80 h-96 rounded-2xl overflow-hidden border border-stone-800/80 hover:border-amber-500/60 transition-all duration-500 flex flex-col justify-end p-6 shadow-xl snap-start hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(245,158,11,0.2)]"
                    >
                        {/* Imagen de fondo de la Categoría */}
                        {cat.image_url ? (
                            <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-90"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center">
                                <span className="text-amber-500/20 font-serif font-bold text-7xl">SO</span>
                            </div>
                        )}

                        {/* Sombra/Degradado para legibilidad del texto */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                        {/* Contenido sobre la tarjeta */}
                        <div className="relative z-10">
                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                                Joyería Exclusiva
                            </span>
                            <h3 className="font-serif text-2xl text-stone-100 group-hover:text-amber-300 transition-colors">
                                {cat.name}
                            </h3>
                            {cat.description && (
                                <p className="text-xs text-stone-400 line-clamp-2 mt-2 font-light leading-relaxed">
                                    {cat.description}
                                </p>
                            )}

                            <div className="mt-4 flex items-center text-xs font-medium text-amber-300/80 group-hover:text-amber-300 transition-colors">
                                <span>Ver Colección</span>
                                <span className="ml-1 group-hover:translate-x-1.5 transition-transform">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );
}