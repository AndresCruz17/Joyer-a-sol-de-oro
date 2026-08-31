'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
}

export default function CategoryCarousel({ categories }: { categories: Category[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tilt, setTilt] = useState<{ [key: number]: { x: number; y: number } }>({});

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.75;
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt((prev) => ({ ...prev, [index]: { x: x * 15, y: -y * 15 } }));
    };

    const handleMouseLeave = (index: number) => {
        setHoveredIndex(null);
        setTilt((prev) => ({ ...prev, [index]: { x: 0, y: 0 } }));
    };

    return (
        <div className="relative group/carousel">
            {/* Botones de Navegación del Carrusel */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                        01 // Colecciones
                    </span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100">
                        Explora por <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Categoría</span>
                    </h2>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => scroll('left')}
                        className="w-12 h-12 rounded-full border border-stone-800 bg-stone-900/80 text-stone-300 flex items-center justify-center hover:border-amber-500 hover:text-amber-400 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
                        aria-label="Anterior"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="w-12 h-12 rounded-full border border-stone-800 bg-stone-900/80 text-stone-300 flex items-center justify-center hover:border-amber-500 hover:text-amber-400 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
                        aria-label="Siguiente"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Track Deslizable */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-8 pt-4 px-2 -mx-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((cat, index) => {
                    const cardTilt = tilt[index] || { x: 0, y: 0 };
                    return (
                        <div
                            key={cat.id}
                            data-interactive="true"
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                            className="min-w-[280px] sm:min-w-[340px] md:min-w-[380px] snap-start flex-shrink-0 perspective-1000"
                        >
                            <div
                                className="h-full rounded-2xl bg-gradient-to-b from-stone-900/90 via-stone-900/50 to-stone-950 border border-stone-800/80 p-8 flex flex-col justify-between transition-all duration-200 ease-out hover:border-amber-500/60 hover:shadow-[0_20px_50px_rgba(245,158,11,0.2)] group relative overflow-hidden"
                                style={{
                                    transform: `rotateY(${cardTilt.x}deg) rotateX(${cardTilt.y}deg)`,
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                {/* Reflejo dinámico estilo espejo/cristal */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(400px circle at ${cardTilt.x * 10 + 50}% ${-cardTilt.y * 10 + 50}%, rgba(245, 158, 11, 0.15), transparent 80%)`,
                                    }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-mono tracking-widest text-amber-400/90 border border-amber-500/30 px-3 py-1 rounded-full bg-amber-500/10 uppercase">
                                            Edición 18K
                                        </span>
                                        <span className="text-stone-600 font-mono text-xs">0{index + 1}</span>
                                    </div>

                                    <h3 className="font-serif text-3xl text-stone-100 mb-4 group-hover:text-amber-300 transition-colors duration-300">
                                        {cat.name}
                                    </h3>

                                    <p className="text-stone-400 text-sm leading-relaxed font-light mb-8">
                                        {cat.description || 'Joyas exclusivas en oro de 18 kilates diseñadas con orfebrería de alta precisión.'}
                                    </p>
                                </div>

                                <Link
                                    href={`/categoria/${cat.slug}`}
                                    className="relative z-10 inline-flex items-center justify-between text-xs font-semibold tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors uppercase pt-6 border-t border-stone-800/80"
                                >
                                    <span>Ver piezas</span>
                                    <span className="transform group-hover:translate-x-3 transition-transform duration-300">→</span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}