'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import GoldDustParticles from '@/components/ui/GoldDustParticles';

interface HeroLuxuryShowcaseProps {
    storeHeroBgUrl?: string;
    whatsappHeroUrl: string;
    phrases?: string[];
}

const DEFAULT_PHRASES = [
    'Oro Nacional 18K & Oro Italiano 18K Ley 750',
    'Compramos tu Oro 18K al Mejor Precio del Mercado',
    'Cotización y Avalúos de Oro en Vivo al Instante',
    'Diseños Exclusivos, Tejidos Italianos y Taller Orfebre',
    'Pago Inmediato en Efectivo y Transferencia',
];

export default function HeroLuxuryShowcase({
    storeHeroBgUrl = '/local.webp',
    whatsappHeroUrl,
    phrases = DEFAULT_PHRASES,
}: HeroLuxuryShowcaseProps) {
    const [mounted, setMounted] = useState(false);

    // Frase activa con transición suave de desenfoque (Blur-Fade)
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isPhraseFading, setIsPhraseFading] = useState(false);

    // Parallax y haz de luz reactivo al mouse con física elástica
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Ciclo de frases con Blur-Fade suave
    useEffect(() => {
        const interval = setInterval(() => {
            setIsPhraseFading(true);
            setTimeout(() => {
                setPhraseIndex((prev) => (prev + 1) % phrases.length);
                setIsPhraseFading(false);
            }, 300);
        }, 4200);

        return () => clearInterval(interval);
    }, [phrases]);

    // Seguimiento del mouse suave para paralaje y luz volumétrica
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth < 1024) return;
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMouseOffset({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <section
            ref={heroRef}
            className="relative w-full min-h-[100dvh] bg-stone-950 text-stone-100 overflow-hidden flex flex-col justify-between pt-28 sm:pt-36 pb-8 sm:pb-12 px-6 sm:px-12 lg:px-16 select-none"
        >
            {/* 1. FONDO REAL DEL TALLER ILUMINADO (CALIDO, LUMINOSO, NO OSCURO) */}
            <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out pointer-events-none ${
                    mounted ? 'opacity-65 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{
                    backgroundImage: `url(${storeHeroBgUrl})`,
                    transform: `translate3d(${mouseOffset.x * 12}px, ${mouseOffset.y * 12}px, 0)`,
                }}
            />

            {/* Gradientes transparentes y viñeta cálida que mantienen visible el local */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/65 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-stone-950/30 to-stone-950/80 pointer-events-none" />

            {/* Haz de Luz Cálida y Volumétrica Dorada (Resalta los detalles del taller) */}
            <div
                className="absolute w-[750px] h-[500px] rounded-full bg-gradient-to-b from-amber-400/25 via-yellow-500/15 to-transparent blur-[130px] pointer-events-none -z-10 transition-transform duration-1000 ease-out"
                style={{
                    left: '50%',
                    top: '35%',
                    transform: `translate(-50%, -50%) translate3d(${mouseOffset.x * 40}px, ${mouseOffset.y * 40}px, 0)`,
                }}
            />
            <div className="absolute bottom-1/4 left-10 w-[550px] h-[400px] rounded-full bg-amber-500/15 blur-[140px] pointer-events-none -z-10" />
            <div className="absolute top-1/4 right-10 w-[500px] h-[400px] rounded-full bg-yellow-500/15 blur-[140px] pointer-events-none -z-10" />

            {/* Micro-partículas de Polvo de Oro 18K Flotante */}
            <GoldDustParticles count={30} />

            {/* 2. COMPOSICIÓN EDITORIAL MONUMENTAL CENTRADA (MINIMALISTA & MODERNA) */}
            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto py-6 sm:py-10">

                {/* Eyebrow Técnico Minimalista */}
                <div
                    className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-stone-900/70 border border-white/20 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-6 transition-all duration-700 ease-spring ${
                        mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.25em] uppercase text-amber-300">
                        Joyería & Compraventa // Oro 18K Ley 750
                    </span>
                </div>

                {/* Titular Monumental Esculpido en Bodoni Moda con Sello de Pureza */}
                <div
                    className={`flex flex-col items-center transition-all duration-700 delay-150 ease-spring ${
                        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                >
                    <h1 className="font-serif text-6xl sm:text-8xl md:text-9xl lg:text-[115px] font-light tracking-tight text-stone-100 leading-[0.92] drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
                        <span>Sol de </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-light">
                            Oro
                        </span>
                        {/* Micro-Sello Oficial Orfebre Ley 750 */}
                        <span className="inline-flex items-center ml-3 sm:ml-4 px-2.5 sm:px-3 py-1 rounded-md bg-stone-900/80 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] align-middle">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400">
                                LEY 750
                            </span>
                        </span>
                    </h1>

                    {/* Párrafo Editorial de Prestigio (Respiro y Claridad) */}
                    <p className="mt-6 sm:mt-7 text-stone-200 text-sm sm:text-base md:text-lg font-light font-sans max-w-2xl leading-relaxed text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                        Compramos tu oro con pesaje de precisión y pago inmediato al precio más competitivo del mercado. Joyas exclusivas en Oro Nacional forjado a mano e importación italiana Ley 750.
                    </p>

                    {/* Cápsula Minimalista de Frases Dinámicas con Blur-Fade */}
                    <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-stone-900/65 border border-white/15 backdrop-blur-xl shadow-lg hover:border-amber-400/40 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
                        <span
                            className={`text-xs sm:text-sm font-sans tracking-wide font-medium text-amber-200 transition-all duration-300 ease-out-expo ${
                                isPhraseFading ? 'opacity-0 translate-y-1 blur-xs' : 'opacity-100 translate-y-0 blur-0'
                            }`}
                        >
                            {phrases[phraseIndex]}
                        </span>
                    </div>

                    {/* Acciones Hápticas Principales (Píldoras Elegantes y Livianas) */}
                    <div className="mt-8 sm:mt-9 flex flex-wrap items-center justify-center gap-4">
                        {/* Botón Primario con Destello Líquido */}
                        <a
                            href="#cotizador"
                            className="relative overflow-hidden group inline-flex items-center justify-between gap-4 pl-7 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-bold text-xs font-sans tracking-wider uppercase shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)] hover:brightness-105 active:scale-[0.98] transition-all duration-200 ease-spring"
                        >
                            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-liquid-sweep" />
                            <span className="relative z-10 font-bold">Cotizar / Vender Oro</span>
                            <span className="w-8 h-8 rounded-full bg-stone-950/15 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:bg-stone-950/25">
                                <svg
                                    className="w-3.5 h-3.5 text-stone-950"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                </svg>
                            </span>
                        </a>

                        {/* Botón Secundario en Cristal Ahumado Pulido */}
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-stone-900/60 hover:bg-stone-900/90 border border-white/20 hover:border-amber-400/40 text-stone-100 hover:text-amber-300 font-sans text-xs tracking-wider uppercase font-medium backdrop-blur-xl active:scale-[0.98] transition-all duration-200 shadow-md text-center"
                        >
                            <span>Explorar Joyería</span>
                        </Link>
                    </div>

                    {/* Fila Minimalista de Pilares de Confianza */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-sans text-stone-300">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400">✦</span>
                            <span className="tracking-wide">Oro 18K Ley 750 Certificado</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-amber-400">✦</span>
                            <span className="tracking-wide">Pesaje de Precisión a la Vista</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400">✦</span>
                            <span className="tracking-wide">Pago Inmediato en Efectivo o Banco</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. BASE DEL HERO: MICRO-TICKER HAIRLINE & INDICADOR DE SCROLL */}
            <div
                className={`relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-3 pt-4 border-t border-white/10 transition-all duration-700 delay-300 ease-out ${
                    mounted ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Ticker Hairline Continuo y Sutil */}
                <div className="w-full overflow-hidden flex items-center gap-4 py-1">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                            EN VIVO
                        </span>
                    </div>

                    <div className="overflow-hidden whitespace-nowrap flex-1">
                        <div className="animate-marquee flex items-center gap-10 text-[10px] sm:text-[11px] font-sans tracking-widest uppercase text-stone-300">
                            <span className="text-amber-300 font-semibold">TASA ORO 18K: MÁXIMA COTIZACIÓN GARANTIZADA</span>
                            <span className="text-amber-500">✦</span>
                            <span>COMPRAVENTA CON PAGO INMEDIATO EN EFECTIVO Y BANCO</span>
                            <span className="text-amber-500">✦</span>
                            <span>TALLER ORFEBRE A MEDIDA & AVALÚOS AL INSTANTE</span>
                            <span className="text-amber-500">✦</span>
                            <span>ORO NACIONAL Y TEJIDOS ITALIANOS LEY 750</span>
                            <span className="text-amber-500">✦</span>
                            <span>ENVÍOS 100% ASEGURADOS A TODO COLOMBIA</span>
                            <span className="text-amber-500">✦</span>

                            {/* Duplicado para ciclo continuo infinito */}
                            <span className="text-amber-300 font-semibold">TASA ORO 18K: MÁXIMA COTIZACIÓN GARANTIZADA</span>
                            <span className="text-amber-500">✦</span>
                            <span>COMPRAVENTA CON PAGO INMEDIATO EN EFECTIVO Y BANCO</span>
                            <span className="text-amber-500">✦</span>
                            <span>TALLER ORFEBRE A MEDIDA & AVALÚOS AL INSTANTE</span>
                            <span className="text-amber-500">✦</span>
                            <span>ORO NACIONAL Y TEJIDOS ITALIANOS LEY 750</span>
                            <span className="text-amber-500">✦</span>
                            <span>ENVÍOS 100% ASEGURADOS A TODO COLOMBIA</span>
                            <span className="text-amber-500">✦</span>
                        </div>
                    </div>

                    {/* Indicador de Scroll Vertical con Perla de Oro Descendente */}
                    <a
                        href="#colecciones"
                        className="group inline-flex items-center gap-2 text-[10px] font-sans tracking-widest uppercase text-stone-400 hover:text-amber-300 transition-colors shrink-0 ml-4"
                        title="Deslizar a colecciones"
                    >
                        <span className="hidden sm:inline">Colecciones</span>
                        <div className="w-3.5 h-6 rounded-full border border-white/20 flex items-start justify-center p-0.5 group-hover:border-amber-400 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-amber-400 animate-scroll-bead shadow-[0_0_6px_#fbbf24]" />
                        </div>
                    </a>
                </div>
            </div>

        </section>
    );
}
