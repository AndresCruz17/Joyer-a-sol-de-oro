'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const CONFIG = {
    logoUrl: '/logo.png',
    storeHeroBgUrl: '/local.png',
    phoneWhatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '573126249176',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61582655280439',
    tiktokUrl: 'https://www.tiktok.com/@compraventa_soldeoro',
    address: 'Barrio Fatima',
    city: 'El Remolino, Taminango, Nariño',
    googleMapsUrl: 'https://maps.app.goo.gl/AHRoJkCtHsAfeBwz6',
};

const TYPEWRITER_PHRASES = [
    'Compramos tu Oro 18K al Mejor Precio del Mercado',
    'Oro de 18 Kilates Certificado Ley 750',
    'Diseños Exclusivos & Orfebrería a Medida',
    'Avalúos Transparentes y Pago de Inmediato',
];

const FAQS = [
    {
        q: '¿Cómo funciona el proceso de venta de mi oro a la compraventa?',
        a: 'Traes tu pieza a nuestro local o nos envías fotos y gramaje por WhatsApp. Realizamos la prueba de pureza y pesaje de precisión frente a ti y te pagamos de inmediato al mejor valor por gramo de la ciudad.',
    },
    {
        q: '¿Cómo garantizan que las joyas son realmente Oro de 18 Kilates?',
        a: 'Todas nuestras piezas son elaboradas e inspeccionadas con estándares de Ley 750 (75% oro puro y 25% aleación noble). Entregamos un certificado físico con validez permanente que respalda la pureza.',
    },
    {
        q: '¿Realizan envíos a todo el país y qué tan seguros son?',
        a: 'Realizamos envíos 100% asegurados a nivel nacional. La joya viaja custodiada por transportadora especializada y asegurada por el valor comercial total hasta la puerta de tu domicilio.',
    },
    {
        q: '¿Puedo llevar una foto o diseño propio para que lo fabriquen?',
        a: '¡Por supuesto! Nuestro servicio de taller orfebre nos permite plasmar cualquier diseño en Oro 18K. Te asesoramos en el peso, tipo de acabado e incrustaciones según tu presupuesto.',
    },
];

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    weight_grams: number | null;
    image_url: string | null;
    categories: { name: string } | null;
}

export default function HomePageClient() {
    const supabase = createClient();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const [isDesktop, setIsDesktop] = useState(false);

    const [calcGrams, setCalcGrams] = useState<number>(5);
    const [calcService, setCalcService] = useState<'vender_mi_oro' | 'fabricar_joya' | 'comprar_joya'>('vender_mi_oro');

    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const [isHoveredCarousel, setIsHoveredCarousel] = useState(false);

    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentText, setCurrentText] = useState('');

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };

        if (window.innerWidth >= 1024) {
            setIsDesktop(true);
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: catData } = await supabase.from('categories').select('*').order('name');
            const { data: prodData } = await supabase.from('products').select('*, categories(name)').limit(6);

            if (catData) setCategories(catData);
            if (prodData) setFeaturedProducts(prodData as Product[]);
            setLoading(false);
        }
        loadData();
    }, [supabase]);

    useEffect(() => {
        const targetPhrase = TYPEWRITER_PHRASES[textIndex];
        const typingSpeed = isDeleting ? 30 : 70;

        const timeout = setTimeout(() => {
            if (!isDeleting && charIndex < targetPhrase.length) {
                setCurrentText(targetPhrase.substring(0, charIndex + 1));
                setCharIndex((prev) => prev + 1);
            } else if (!isDeleting && charIndex === targetPhrase.length) {
                setTimeout(() => setIsDeleting(true), 2500);
            } else if (isDeleting && charIndex > 0) {
                setCurrentText(targetPhrase.substring(0, charIndex - 1));
                setCharIndex((prev) => prev - 1);
            } else if (isDeleting && charIndex === 0) {
                setIsDeleting(false);
                setTextIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textIndex]);

    // CARROUSEL INFINITO SIN SALTOS (INFINITE CONTINUOUS SCROLL)
    useEffect(() => {
        const container = carouselRef.current;
        if (!container || isHoveredCarousel || categories.length === 0) return;

        let animationId: number;
        let currentScroll = container.scrollLeft;
        const speed = 0.4; // Ajusta la velocidad si lo prefieres más rápido o más lento

        const animate = () => {
            // Calculamos la mitad exacta del ancho deslizable
            const halfWidth = container.scrollWidth / 2;

            // Si el scroll supera o iguala la mitad, restamos la mitad para volver al inicio invisiblemente
            if (currentScroll >= halfWidth) {
                currentScroll -= halfWidth;
                container.scrollLeft = currentScroll;
            } else {
                currentScroll += speed;
                container.scrollLeft = currentScroll;
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [isHoveredCarousel, categories]);

    const whatsappHeroUrl = `https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent('Hola Sol de Oro, me gustaría recibir atención personalizada sobre joyas o venta de oro.')}`;

    const getCalcWhatsappUrl = () => {
        let headerText = '';
        if (calcService === 'vender_mi_oro') {
            headerText = `*SOLICITUD DE AVALÚO // VENTA DE ORO*\n` +
                `• Peso estimado: ${calcGrams} Gramos\n` +
                `Hola, me interesa agendar una cita o consultar la tasa de compra por gramo para vender mi oro.`;
        } else if (calcService === 'fabricar_joya') {
            headerText = `*COTIZACIÓN DE FABRICACIÓN A MEDIDA*\n` +
                `• Peso aproximado: ${calcGrams} Gramos (Oro 18K Ley 750)\n` +
                `Hola, deseo cotizar la elaboración personalizada de una pieza con estas características.`;
        } else {
            headerText = `*CONSULTA DE DISPONIBILIDAD DE JOYA*\n` +
                `• Rango de peso: ${calcGrams} Gramos (Oro 18K)\n` +
                `Hola, me gustaría conocer qué diseños tienen disponibles en inventario en este peso.`;
        }
        return `https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent(headerText)}`;
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 scroll-smooth relative overflow-hidden">

            {/* MOUSE CURSOR GLOW */}
            {isDesktop && (
                <div
                    className="pointer-events-none fixed z-30 transition-transform duration-100 ease-out -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-400/5 to-transparent blur-3xl"
                    style={{
                        left: `${cursorPos.x}px`,
                        top: `${cursorPos.y}px`,
                    }}
                />
            )}

            {/* ENHANCED SCHEMA JSON-LD FOR LOCAL SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
                            '@context': 'https://schema.org',
                            '@type': 'JewelryStore',
                            name: 'Sol de Oro Joyería & Compraventa',
                            description: 'Alta joyería en Oro Nacional 18 Kilates. Compra de oro al mejor precio del mercado, avalúos inmediatos y taller orfebre a medida.',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: CONFIG.address,
                                addressLocality: CONFIG.city,
                                addressCountry: 'CO',
                            },
                            telephone: CONFIG.phoneWhatsapp,
                            priceRange: '$$$',
                            url: 'https://soldeoro.com',
                            geo: {
                                '@type': 'GeoCoordinates',
                                latitude: 6.2442, // Ajustar según las coordenadas de Medellín
                                longitude: -75.5812,
                            },
                        },
                        {
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: FAQS.map((faq) => ({
                                '@type': 'Question',
                                name: faq.q,
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: faq.a,
                                },
                            })),
                        },
                    ]),
                }}
            />

            {/* CINTA SUPERIOR INFORMATIVA CON ANIMACIÓN CONTINUA */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-stone-950 text-[11px] font-mono font-semibold py-2 overflow-hidden relative z-50 shadow-md">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
                    <div className="flex items-center gap-12">
                        <span>COMPRAMOS TU ORO AL MEJOR PRECIO DEL MERCADO</span>
                        <span>✦</span>
                        <span>ORO NACIONAL 18K LEY 750 CERTIFICADO</span>
                        <span>✦</span>
                        <span>FABRICACIÓN DE JOYAS A MEDIDA</span>
                        <span>✦</span>
                        <span>GARANTÍA DE POR VIDA EN PUREZA</span>
                        <span>✦</span>
                    </div>
                    {/* Duplicado para ciclo continuo sin saltos */}
                    <div className="flex items-center gap-12" aria-hidden="true">
                        <span>COMPRAMOS TU ORO AL MEJOR PRECIO DEL MERCADO</span>
                        <span>✦</span>
                        <span>ORO NACIONAL 18K LEY 750 CERTIFICADO</span>
                        <span>✦</span>
                        <span>FABRICACIÓN DE JOYAS A MEDIDA</span>
                        <span>✦</span>
                        <span>GARANTÍA DE POR VIDA EN PUREZA</span>
                        <span>✦</span>
                    </div>
                </div>
            </div>

            {/* NAVBAR */}
            <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    <Link href="/" className="flex items-center gap-3 group">
                        {CONFIG.logoUrl && (
                            <img
                                src={CONFIG.logoUrl}
                                alt="Sol de Oro Joyería Logo"
                                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                        )}

                        <div className="flex flex-col">
                            <span className="font-serif italic text-xl sm:text-2xl font-light tracking-wide text-amber-300 leading-tight">
                                Sol de Oro
                            </span>
                            <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase">
                                Joyería & Compraventa
                            </span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-wider text-stone-300 uppercase">
                        <a href="#colecciones" className="hover:text-amber-400 transition-colors">Colecciones</a>
                        <a href="#destacados" className="hover:text-amber-400 transition-colors">Joyería Fina</a>
                        <a href="#cotizador" className="hover:text-amber-400 transition-colors">Comprar/Vender Oro</a>
                        <a href="#faqs" className="hover:text-amber-400 transition-colors">Preguntas</a>
                        <a href="#ubicacion" className="hover:text-amber-400 transition-colors">Ubicación</a>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                        <Link
                            href="/catalogo"
                            className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-500 hover:text-stone-950 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold"
                        >
                            Ver Catálogo Completo
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-stone-400 hover:text-amber-400 transition-colors text-xl"
                        aria-label="Abrir menú"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden pt-4 pb-2 border-t border-stone-800/80 mt-3 flex flex-col gap-3 text-xs font-mono uppercase text-stone-300">
                        <a href="#colecciones" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Colecciones</a>
                        <a href="#destacados" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Joyería Fina</a>
                        <a href="#cotizador" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Comprar/Vender Oro</a>
                        <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Preguntas Frecuentes</a>
                        <a href="#ubicacion" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Ubicación & Contacto</a>
                        <Link href="/catalogo" className="mt-2 text-center py-3 rounded-xl bg-amber-500 text-stone-950 font-semibold">
                            Ir al Catálogo Completo
                        </Link>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <div className="relative border-b border-stone-800/60 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 scale-105 transition-transform duration-1000"
                    style={{ backgroundImage: `url(${CONFIG.storeHeroBgUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/90 to-stone-950" />

                <section className="relative z-10 py-24 sm:py-36 px-6 text-center max-w-5xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Joyería Fina & Compraventa de Oro 18K
                    </div>

                    <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-stone-100 leading-tight mb-6">
                        Compramos tu Oro & Creamos <br />
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                            Piezas Exclusivas en 18K
                        </span>
                    </h1>

                    <div className="h-10 flex items-center justify-center mb-8">
                        <p className="text-amber-300/90 font-mono text-sm sm:text-lg border-r-2 border-amber-400 pr-1 animate-pulse tracking-wide">
                            {currentText}
                        </p>
                    </div>

                    <p className="text-stone-300 text-sm sm:text-base font-light max-w-2xl leading-relaxed mb-10">
                        Tasación profesional de oro al instante con pago inmediato en nuestro local físico. Elaboramos joyas únicas en Oro puro Ley 750 con garantía permanente.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <a
                            href="#cotizador"
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-stone-950 font-semibold text-xs font-mono tracking-wider hover:brightness-110 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 text-center uppercase"
                        >
                            Cotizar / Vender mi Oro
                        </a>
                        <Link
                            href="/catalogo"
                            className="px-8 py-4 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-200 hover:border-amber-500/60 hover:text-amber-300 font-mono text-xs tracking-wider transition-all duration-300 text-center uppercase backdrop-blur-sm"
                        >
                            Explorar Catálogo de Joyas
                        </Link>
                    </div>
                </section>
            </div>

            {/* CARRUSEL DE COLECCIONES */}
            <section id="colecciones" className="py-20 px-6 border-t border-stone-800/60 bg-stone-900/20 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                        <div>
                            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Galería Oficial</span>
                            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100">Nuestras Colecciones</h2>
                        </div>
                    </div>

                    {/* CONTENEDOR CON SCROLL INFINITO Y SEO LIMPIO */}
                    <div
                        ref={carouselRef}
                        onMouseEnter={() => setIsHoveredCarousel(true)}
                        onMouseLeave={() => setIsHoveredCarousel(false)}
                        onTouchStart={() => setIsHoveredCarousel(true)}
                        onTouchEnd={() => setIsHoveredCarousel(false)}
                        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-4 select-none flex-nowrap snap-x snap-mandatory scroll-smooth"
                    >
                        {loading ? (
                            [1, 2, 3, 4].map((n) => (
                                <div key={n} className="w-[260px] xs:w-[280px] sm:w-[340px] h-[390px] sm:h-[450px] aspect-[3/4] rounded-3xl bg-stone-900 animate-pulse border border-stone-800 shrink-0 snap-start" />
                            ))
                        ) : categories.length > 0 ? (
                            <>
                                {/* 1. LISTA ORIGINAL (Googlebot la indexa y los lectores de pantalla la leen) */}
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/catalogo?categoria=${cat.id}`}
                                        className="group relative w-[260px] xs:w-[280px] sm:w-[340px] h-[390px] sm:h-[450px] aspect-[3/4] rounded-3xl overflow-hidden border border-stone-800/80 hover:border-amber-500/80 transition-all duration-500 shrink-0 shadow-lg bg-stone-900 snap-start"
                                    >
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt={`Colección ${cat.name} - Sol de Oro`}
                                                fill
                                                sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 340px"
                                                quality={85}
                                                className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-600">
                                                <span className="text-xs font-mono">Sin imagen asignada</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

                                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
                                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1 block">
                                                Colección Oro 18K
                                            </span>
                                            <h3 className="font-serif text-xl sm:text-2xl text-stone-100 group-hover:text-amber-300 transition-colors mb-3 sm:mb-4">
                                                {cat.name}
                                            </h3>

                                            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 group-hover:translate-x-2 transition-transform">
                                                <span>Ver Catálogo</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {/* 2. LISTA CLONADA (Oculta para Google y lectores de pantalla con aria-hidden) */}
                                {categories.map((cat) => (
                                    <Link
                                        key={`clone-${cat.id}`}
                                        href={`/catalogo?categoria=${cat.id}`}
                                        aria-hidden="true"
                                        tabIndex={-1}
                                        className="group relative w-[260px] xs:w-[280px] sm:w-[340px] h-[390px] sm:h-[450px] aspect-[3/4] rounded-3xl overflow-hidden border border-stone-800/80 hover:border-amber-500/80 transition-all duration-500 shrink-0 shadow-lg bg-stone-900 snap-start"
                                    >
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt=""
                                                fill
                                                sizes="(max-width: 640px) 260px, (max-width: 1024px) 340px, 340px"
                                                quality={85}
                                                className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-600">
                                                <span className="text-xs font-mono">Sin imagen asignada</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

                                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
                                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1 block">
                                                Colección Oro 18K
                                            </span>
                                            <span className="font-serif text-xl sm:text-2xl text-stone-100 group-hover:text-amber-300 transition-colors mb-3 sm:mb-4 block">
                                                {cat.name}
                                            </span>

                                            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 group-hover:translate-x-2 transition-transform">
                                                <span>Ver Catálogo</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <div className="p-8 text-xs font-mono text-stone-500">
                                Carga tus categorías en el panel de administración.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CALCULADORA LUXURY */}
            <section id="cotizador" className="py-20 px-6 border-t border-stone-800/60 bg-gradient-to-b from-stone-900/60 to-stone-950">
                <div className="max-w-4xl mx-auto rounded-3xl bg-stone-900/80 border border-stone-800 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
                    <div className="text-center mb-10">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Servicios de Compraventa & Joyería</span>
                        <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-3">Calculadora & Avalúos Expres</h2>
                        <p className="text-stone-400 text-xs sm:text-sm font-light">
                            Selecciona el tipo de consulta e ingresa el peso aproximado en gramos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono uppercase text-stone-300 mb-3">
                                    1. Tipo de Servicio:
                                </label>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {[
                                        { id: 'vender_mi_oro', label: 'Vender mi Oro / Avalúo de Piezas', icon: '✦' },
                                        { id: 'fabricar_joya', label: 'Fabricar Joya Personalizada 18K', icon: '◇' },
                                        { id: 'comprar_joya', label: 'Comprar Joya del Catálogo', icon: '◈' },
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setCalcService(s.id as any)}
                                            className={`py-3.5 px-4 rounded-xl text-xs font-mono text-left border transition-all flex items-center justify-between ${calcService === s.id
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                                                }`}
                                        >
                                            <span>{s.label}</span>
                                            <span className="text-amber-400">{s.icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-mono uppercase text-stone-300">
                                        2. Gramaje Estimado:
                                    </label>
                                    <span className="text-amber-400 font-mono text-sm font-bold">
                                        {calcGrams} Gramos
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={calcGrams}
                                    onChange={(e) => setCalcGrams(Number(e.target.value))}
                                    className="w-full accent-amber-500 bg-stone-950 h-2 rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] font-mono text-stone-500 mt-1">
                                    <span>1g (Dije/Anillo)</span>
                                    <span>15g (Cadena)</span>
                                    <span>50g+ (Lote / Alta Joyería)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800/80 text-center flex flex-col justify-between h-full">
                            <div>
                                <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                                    {calcService === 'vender_mi_oro' ? 'Tasación Compraventa' : 'Presupuesto Joyería'}
                                </span>
                                <h3 className="font-serif text-3xl text-stone-100 mb-2">
                                    {calcGrams} Gramos
                                </h3>
                                <p className="text-xs text-stone-400 font-light mb-6 leading-relaxed">
                                    {calcService === 'vender_mi_oro' && 'Evaluamos tu oro en 18K/14K/24K con pesaje calibrado y pago inmediato en efectivo o transferencia.'}
                                    {calcService === 'fabricar_joya' && 'Diseño y fundición personalizada con Oro Ley 750 y garantía de pureza de por vida.'}
                                    {calcService === 'comprar_joya' && 'Consulta inventario listo para entrega inmediata de piezas en este peso.'}
                                </p>
                            </div>

                            <a
                                href={getCalcWhatsappUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-mono text-xs font-semibold hover:brightness-110 transition-all uppercase shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            >
                                {calcService === 'vender_mi_oro' ? 'Solicitar Avalúo por WhatsApp →' : 'Enviar Cotización a WhatsApp →'}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCTOS DESTACADOS */}
            <section id="destacados" className="py-20 px-6 border-t border-stone-800/60">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Selección Exclusiva</span>
                        <h2 className="font-serif text-3xl sm:text-5xl text-stone-100 mb-4">Piezas Destacadas</h2>
                        <p className="text-stone-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
                            Joyas elaboradas minuciosamente con altos estándares de pureza y acabado pulido espejo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 rounded-2xl bg-stone-900/40 border border-stone-800 animate-pulse" />
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProducts.map((item) => {
                                const categoryName = item.categories?.name || 'Oro 18K';
                                const itemWeight = item.weight_grams ? `${item.weight_grams}g` : 'A consultar';
                                const itemPrice = item.price ? `$${item.price.toLocaleString('es-CO')} COP` : 'A consultar';
                                const itemImage = item.image_url || '';

                                const whatsappText =
                                    `*COTIZACIÓN DE JOYA DESTACADA // SOL DE ORO*\n\n` +
                                    `• Joya: ${item.name}\n` +
                                    `• Categoría: ${categoryName}\n` +
                                    `• Peso: ${itemWeight}\n` +
                                    `• Precio: ${itemPrice}\n\n` +
                                    `Hola, me interesa obtener más detalles sobre esta pieza.`;

                                return (
                                    <div
                                        key={item.id}
                                        className="group rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                                    >
                                        <Link href={`/producto/${item.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-950 block">
                                            {itemImage ? (
                                                <img
                                                    src={itemImage}
                                                    alt={`${item.name} - Sol de Oro Joyería`}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-700 font-serif">
                                                    Sin Foto
                                                </div>
                                            )}
                                            <span className="absolute top-3 left-3 text-[10px] font-mono bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase">
                                                {categoryName}
                                            </span>
                                        </Link>

                                        <div className="p-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link href={`/producto/${item.id}`}>
                                                    <h3 className="font-serif text-xl text-stone-100 group-hover:text-amber-300 transition-colors mb-2">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                {item.description && (
                                                    <p className="text-xs text-stone-400 font-light line-clamp-2 mb-4">
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
                                                    <span className="font-mono text-base text-amber-400 font-semibold">
                                                        {item.price ? `$${item.price.toLocaleString('es-CO')}` : 'A consultar'}
                                                    </span>
                                                </div>

                                                <a
                                                    href={`https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent(whatsappText)}`}
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
                    ) : (
                        <div className="text-center py-12 border border-stone-800/60 rounded-3xl bg-stone-900/20 max-w-md mx-auto">
                            <p className="font-serif text-stone-400 mb-2">No hay joyas destacadas aún</p>
                            <p className="text-xs font-mono text-stone-500 mb-4">Sube productos desde tu panel de administración.</p>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-300 hover:border-amber-500 hover:bg-stone-800 text-xs font-mono transition-all font-semibold"
                        >
                            <span>Ver todas las piezas del catálogo</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQS */}
            <section id="faqs" className="py-20 px-6 border-t border-stone-800/60 bg-stone-900/20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Dudas Frecuentes</span>
                        <h2 className="font-serif text-3xl sm:text-4xl text-stone-100">Transparencia Garantizada</h2>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-stone-900/60 border border-stone-800 overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full p-6 text-left font-serif text-stone-200 hover:text-amber-300 flex items-center justify-between gap-4 text-base sm:text-lg"
                                >
                                    <span>{faq.q}</span>
                                    <span className="text-amber-400 font-mono text-xl">{openFaq === idx ? '−' : '+'}</span>
                                </button>
                                {openFaq === idx && (
                                    <div className="px-6 pb-6 text-xs sm:text-sm text-stone-400 font-light leading-relaxed border-t border-stone-800/40 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* UBICACIÓN Y CONTACTO CON SVGS ELEGANTES */}
            <section id="ubicacion" className="py-20 px-6 border-t border-stone-800/60">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="p-8 rounded-3xl bg-stone-900/60 border border-stone-800">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Visítanos en Persona</span>
                        <h2 className="font-serif text-3xl text-stone-100 mb-4">Nuestro Local Físico</h2>
                        <p className="text-stone-400 text-xs sm:text-sm font-light mb-6">
                            Te invitamos a conocer nuestras piezas en vivo, realizar avalúos presenciales de tu oro y recibir asesoría directa.
                        </p>

                        <div className="space-y-5 text-xs font-mono text-stone-300 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                    {/* SVG Ubicación */}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="block text-stone-100">Dirección:</strong>
                                    <span>{CONFIG.address}</span>
                                    <span className="block text-stone-500">{CONFIG.city}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                    {/* SVG Teléfono */}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <strong className="block text-stone-100">Atención WhatsApp:</strong>
                                    <span>+{CONFIG.phoneWhatsapp}</span>
                                </div>
                            </div>
                        </div>

                        <a
                            href={CONFIG.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-xs hover:bg-amber-500 hover:text-stone-950 transition-all font-semibold"
                        >
                            <span>Abrir en Google Maps (Cómo llegar) →</span>
                        </a>
                    </div>

                    <div className="flex flex-col justify-center">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Comunidad</span>
                        <h2 className="font-serif text-3xl text-stone-100 mb-4">Síguenos en Redes</h2>
                        <p className="text-stone-400 text-xs sm:text-sm font-light mb-8">
                            Conoce nuestros vídeos en vivo, nuevos ingresos de joyas y testimonios de clientes.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <a
                                href={whatsappHeroUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/60 hover:text-emerald-400 text-center transition-all group flex flex-col items-center"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.305-1.129z" />
                                    </svg>
                                </div>
                                <div className="font-mono text-xs font-semibold">WhatsApp</div>
                                <div className="text-[10px] text-stone-500 font-mono">Chat Directo</div>
                            </a>

                            <a
                                href={CONFIG.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-blue-500/60 hover:text-blue-400 text-center transition-all group flex flex-col items-center"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <div className="font-mono text-xs font-semibold">Facebook</div>
                                <div className="text-[10px] text-stone-500 font-mono">Página Oficial</div>
                            </a>

                            <a
                                href={CONFIG.tiktokUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-pink-500/60 hover:text-pink-400 text-center transition-all group flex flex-col items-center"
                            >
                                <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.56-1.24 2.55.03.8.44 1.58 1.09 2.05.77.58 1.8.76 2.73.53.95-.21 1.76-.9 2.1-1.8.18-.54.21-1.12.2-1.69.01-4.99 0-9.97.01-14.96z" />
                                    </svg>
                                </div>
                                <div className="font-mono text-xs font-semibold">TikTok</div>
                                <div className="text-[10px] text-stone-500 font-mono">Vídeos & Joyas</div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-stone-900 bg-stone-950 py-12 text-stone-500 text-xs text-center relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link href="/" className="font-serif text-lg text-amber-300">
                        Sol de Oro
                    </Link>
                    <p>© {new Date().getFullYear()} Sol de Oro Joyería & Compraventa. Todos los derechos reservados.</p>
                    <a href={whatsappHeroUrl} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-amber-400 font-mono">
                        Contacto WhatsApp
                    </a>
                </div>
            </footer>
        </div>
    );
}