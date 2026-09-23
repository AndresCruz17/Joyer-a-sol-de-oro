'use client';

import React from 'react';
import Link from 'next/link';
import NeonSparkles from '@/components/ui/NeonSparkles';
import { useScrollProgress } from '@/lib/hooks/useScrollProgress';

interface HeroProps {
    storeHeroBgUrl?: string;
    currentText: string;
    whatsappHeroUrl: string;
}

export default function HeroFullscreenGrow({
    storeHeroBgUrl = '/local.webp',
    currentText,
    whatsappHeroUrl,
}: HeroProps) {
    const { ref: heroRef, progress } = useScrollProgress();

    // Interpolación suave tipo "Fullscreen Grow":
    // Empieza con escala sutil 0.95 y bordes redondeados majestuosos (Double-Bezel)
    // Conforme el usuario hace scroll, se expande a escala 1.0 y pantalla completa fluida
    const scale = 0.95 + progress * 0.05;
    const borderRadiusRem = Math.max(0, 2.5 - progress * 2.5);
    const outerPaddingRem = Math.max(0, 1.5 - progress * 1.5);
    const borderOpacity = Math.max(0.15, 0.45 - progress * 0.3);

    return (
        <div
            ref={heroRef}
            className="relative w-full overflow-hidden transition-all duration-200"
            style={{
                paddingTop: `${outerPaddingRem}rem`,
                paddingBottom: `${outerPaddingRem * 1.5}rem`,
                paddingLeft: `${outerPaddingRem}rem`,
                paddingRight: `${outerPaddingRem}rem`,
            }}
        >
            {/* LUZ AMBIENTAL DE FONDO PROFUNDA */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] rounded-full bg-gradient-to-tr from-amber-600/15 via-yellow-500/10 to-transparent blur-[120px] pointer-events-none -z-10" />

            {/* MARCO THEATRICAL DOUBLE-BEZEL CON EFECTO GROW */}
            <div
                className="mx-auto w-full max-w-7xl relative transition-transform duration-300 ease-out will-change-transform"
                style={{
                    transform: `scale(${scale})`,
                    borderRadius: `${borderRadiusRem}rem`,
                }}
            >
                {/* 1. OUTER SHELL (Carcasa exterior con sutil bisel y halo de luz dorada) */}
                <div
                    className="p-1 sm:p-2 rounded-[inherit] bg-gradient-to-b from-amber-500/30 via-stone-800/40 to-stone-900/60 shadow-[0_25px_90px_-20px_rgba(245,158,11,0.22)] backdrop-blur-xl transition-all"
                    style={{
                        borderColor: `rgba(245, 158, 11, ${borderOpacity})`,
                    }}
                >
                    {/* 2. INNER CORE (Núcleo escénico con imagen ambiental, gradiente de alta densidad y partículas) */}
                    <div
                        className="relative overflow-hidden bg-stone-950/95 rounded-[calc(inherit-0.5rem)] border border-amber-500/15 min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex flex-col items-center justify-center text-center px-6 sm:px-12 py-16 sm:py-24"
                    >
                        {/* Partículas y destellos de oro */}
                        <NeonSparkles />

                        {/* Foto ambiental del taller / tienda con zoom cinematográfico */}
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105 transition-transform duration-1000 ease-out pointer-events-none"
                            style={{
                                backgroundImage: `url(${storeHeroBgUrl})`,
                                transform: `scale(${1.05 + progress * 0.08})`,
                            }}
                        />

                        {/* Degradados oscuros y viñeta para contraste cinematográfico */}
                        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/90 to-stone-950 pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-stone-950/90 pointer-events-none" />

                        {/* CONTENIDO PRINCIPAL DEL HERO */}
                        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">

                            {/* MICRO EYEBROW BADGE (Double-Nested Pill con pulso esmeralda de pureza) */}
                            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-stone-900/80 border border-amber-500/40 text-amber-300 text-[11px] font-sans font-medium uppercase tracking-[0.22em] mb-7 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                                <span>Oro 18K Ley 750</span>
                                <span className="text-amber-500 font-bold">•</span>
                                <span className="text-stone-300">Nacional Macizo & Tejidos Italianos</span>
                            </div>

                            {/* TITULAR EDITORIAL DE ALTO IMPACTO (Bodoni Moda Italic + High-Contrast Grotesque) */}
                            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-stone-100 leading-[1.12] tracking-tight sm:tracking-normal mb-6 drop-shadow-2xl">
                                Compramos tu Oro & Creamos <br />
                                <span className="italic font-normal font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 animate-shimmer-text drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
                                    Piezas Exclusivas en 18K
                                </span>
                            </h1>

                            {/* CÁPSULA DINÁMICA DE COTIZACIÓN TIPO TERMINAL LUXURY */}
                            <div className="min-h-[56px] flex items-center justify-center mb-8">
                                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-stone-900/70 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] group hover:border-amber-400/60 transition-all">
                                    <span className="text-amber-400 text-xs animate-sparkle">✦</span>
                                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 font-sans text-xs sm:text-base tracking-wide font-medium">
                                        {currentText}
                                    </p>
                                    <span className="w-1.5 h-4 sm:h-5 bg-amber-400 rounded-full animate-cursor-blink inline-block shadow-[0_0_10px_#fbbf24]" />
                                </div>
                            </div>

                            {/* DESCRIPCIÓN REFINADA (Plus Jakarta Sans) */}
                            <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-light font-sans max-w-2xl leading-relaxed mb-10 text-balance">
                                Avalúos de oro en vivo con pesaje certificado, pago inmediato al mejor precio del mercado y forja artesanal de joyas de alta gama con garantía permanente de pureza Ley 750.
                            </p>

                            {/* ACCIONES PRINCIPALES (Button-in-Button Architecture & Smoked Glass) */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
                                {/* Botón Primario Anidado con Icono Autónomo y Aceleración por Resorte */}
                                <a
                                    href="#cotizador"
                                    className="group relative inline-flex items-center justify-between gap-4 pl-7 pr-2.5 py-2.5 w-full sm:w-auto rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-bold text-xs font-sans tracking-wider uppercase shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:shadow-[0_0_55px_rgba(245,158,11,0.65)] hover:brightness-105 active:scale-[0.98] transition-all duration-300 ease-spring"
                                >
                                    <span className="relative z-10 font-bold">Cotizar / Vender mi Oro</span>
                                    {/* Icono anidado en cápsula circular con respuesta física al hover */}
                                    <span className="w-10 h-10 rounded-full bg-stone-950/15 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:bg-stone-950/25">
                                        <svg
                                            className="w-4 h-4 text-stone-950 transition-transform duration-300 group-hover:scale-110"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                        </svg>
                                    </span>
                                </a>

                                {/* Botón Secundario de Cristal Ahumado con Doble Borde */}
                                <Link
                                    href="/catalogo"
                                    className="inline-flex items-center justify-center px-8 py-3.5 w-full sm:w-auto rounded-full bg-stone-900/60 border border-stone-800 text-stone-200 hover:text-amber-300 hover:border-amber-500/50 hover:bg-stone-900/90 font-sans text-xs font-medium tracking-wider uppercase backdrop-blur-md active:scale-[0.98] transition-all duration-300 ease-spring shadow-lg"
                                >
                                    <span>Explorar Catálogo</span>
                                </Link>
                            </div>

                            {/* BENTO DE CONFIANZA EDITORIAL (3 Tarjetas Micro-Bezel con Métricas Clave) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full pt-4 border-t border-amber-500/10">
                                <div className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 backdrop-blur-md flex items-center gap-3 hover:border-amber-500/30 transition-all">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm shrink-0">
                                        ✦
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-stone-100">Garantía Ley 750</div>
                                        <div className="text-[10px] text-stone-400 font-sans">Certificado permanente de pureza</div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 backdrop-blur-md flex items-center gap-3 hover:border-amber-500/30 transition-all">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm shrink-0">
                                        ⚡
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-stone-100">Pago Inmediato</div>
                                        <div className="text-[10px] text-stone-400 font-sans">Efectivo o transferencia al instante</div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-stone-900/40 border border-stone-800/80 backdrop-blur-md flex items-center gap-3 hover:border-amber-500/30 transition-all">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm shrink-0">
                                        ⚒
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-stone-100">Taller Orfebre</div>
                                        <div className="text-[10px] text-stone-400 font-sans">Diseño a medida & importación</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
