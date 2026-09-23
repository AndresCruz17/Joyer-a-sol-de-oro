'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { SITE_CONFIG } from '@/lib/config';
import HeroLuxuryShowcase from '@/components/home/HeroLuxuryShowcase';
import LuxuryNavbar from '@/components/ui/LuxuryNavbar';

const CONFIG = {
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    logoUrl: SITE_CONFIG.logoUrl,
    storeHeroBgUrl: SITE_CONFIG.storeHeroBgUrl,
    phoneWhatsapp: SITE_CONFIG.whatsappNumber,
    facebookUrl: SITE_CONFIG.facebookUrl,
    instagramUrl: SITE_CONFIG.instagramUrl,
    tiktokUrl: SITE_CONFIG.tiktokUrl,
    address: SITE_CONFIG.address,
    city: SITE_CONFIG.city,
    googleMapsUrl: SITE_CONFIG.googleMapsUrl,
};

const TYPEWRITER_PHRASES = [
    'Oro Nacional 18K & Oro Italiano 18K Ley 750',
    'Compramos tu Oro 18K al Mejor Precio del Mercado',
    'Cotización y Avalúos de Oro en Vivo al Instante',
    'Diseños Exclusivos, Tejidos Italianos y Taller Orfebre',
    'Pago Inmediato en Efectivo y Transferencia',
];

const FAQS = [
    {
        q: '¿Qué diferencia hay entre el Oro Nacional y el Oro Italiano 18K?',
        a: 'Ambos son auténtico Oro de 18 Kilates Ley 750 (75% oro puro garantizado). El Oro Nacional se distingue por su fabricación orfebre maciza, robustez y adaptabilidad para diseños personalizados. El Oro Italiano destaca por sus tejidos de precisión tecnológica europea (como Cartier, Mónaco o Gucci), broches de alta gama y acabado pulido espejo ultrabrillante.',
    },
    {
        q: '¿Cómo funciona el proceso de venta de mi oro a la compraventa?',
        a: 'Traes tu pieza a nuestro local o nos envías fotos y gramaje por WhatsApp. Realizamos la prueba de pureza y pesaje de precisión frente a ti y te pagamos de inmediato con la tasa de cotización más competitiva del mercado.',
    },
    {
        q: '¿Cómo garantizan que las joyas son realmente Oro de 18 Kilates?',
        a: 'Todas nuestras piezas (nacionales e italianas) son elaboradas e inspeccionadas con estándares de Ley 750 (750 partes de oro puro por cada mil). Entregamos un certificado físico con garantía permanente de pureza.',
    },
    {
        q: '¿Realizan envíos a todo el país y qué tan seguros son?',
        a: 'Realizamos envíos 100% asegurados a nivel nacional. La joya viaja custodiada por transportadora especializada y asegurada por el valor comercial total hasta la puerta de tu domicilio.',
    },
    {
        q: '¿Puedo llevar una foto o diseño propio para que lo fabriquen?',
        a: '¡Por supuesto! En nuestro taller orfebre podemos forjar cualquier diseño en Oro Nacional 18K a tu medida o conseguir piezas en Oro Italiano según tus preferencias y presupuesto.',
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
    category_id: string | null;
    categories: { name: string } | { name: string }[] | null;
}

export interface HomePageClientProps {
    initialCategories?: Category[];
    initialFeaturedProducts?: Product[];
}

export default function HomePageClient({
    initialCategories,
    initialFeaturedProducts,
}: HomePageClientProps = {}) {
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>(initialCategories || []);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>(initialFeaturedProducts || []);
    const [loading, setLoading] = useState(
        !initialCategories && !initialFeaturedProducts
    );

    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const [isDesktop, setIsDesktop] = useState(false);

    const [calcGrams, setCalcGrams] = useState<number>(5);
    const [goldOrigin, setGoldOrigin] = useState<'nacional' | 'italiano'>('nacional');
    const [calcService, setCalcService] = useState<'vender_mi_oro' | 'fabricar_joya' | 'comprar_joya'>('vender_mi_oro');

    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [scrollProgress, setScrollProgress] = useState(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const [isHoveredCarousel, setIsHoveredCarousel] = useState(false);

    // Barra de progreso de scroll en oro líquido (precisión suiza)
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                const progress = (window.scrollY / totalScroll) * 100;
                setScrollProgress(Math.min(100, Math.max(0, progress)));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Observer para revelación al scroll con física elástica de Emil Kowalski
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-active');
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );

        const elements = document.querySelectorAll('.reveal-init');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [categories, featuredProducts, loading]);

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
        if (initialCategories || initialFeaturedProducts) {
            return;
        }

        async function loadData() {
            setLoading(true);
            const { data: catData } = await supabase
                .from('categories')
                .select('id, name, slug, image_url')
                .order('name');

            const { data: prodData } = await supabase
                .from('products')
                .select('id, name, description, price, weight_grams, image_url, category_id, categories(name)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (catData) setCategories(catData);
            if (prodData) setFeaturedProducts(prodData as unknown as Product[]);
            setLoading(false);
        }
        loadData();
    }, [supabase, initialCategories, initialFeaturedProducts]);

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

    const whatsappHeroUrl = `https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent('Hola Sol de Oro, me gustaría recibir atención personalizada sobre joyas en Oro Nacional/Italiano 18K o cotización de venta de oro.')}`;

    const getCalcWhatsappUrl = () => {
        const goldTypeName = goldOrigin === 'nacional' ? 'Oro Nacional 18K Ley 750 (Orfebre Macizo)' : 'Oro Italiano 18K Ley 750 (Tejido Europeo)';
        let headerText = '';
        if (calcService === 'vender_mi_oro') {
            headerText = `*SOLICITUD DE AVALÚO // VENTA DE ORO*\n` +
                `• Tipo / Ley: ${goldTypeName}\n` +
                `• Peso estimado: ${calcGrams} Gramos\n` +
                `Hola, me interesa agendar una cita o consultar la tasa de compra en vivo por gramo para vender mi oro.`;
        } else if (calcService === 'fabricar_joya') {
            headerText = `*COTIZACIÓN DE FABRICACIÓN A MEDIDA*\n` +
                `• Tipo de Oro: ${goldTypeName}\n` +
                `• Peso aproximado: ${calcGrams} Gramos\n` +
                `Hola, deseo cotizar la elaboración personalizada de una pieza con estas características.`;
        } else {
            headerText = `*CONSULTA DE DISPONIBILIDAD DE JOYA*\n` +
                `• Línea de Oro: ${goldTypeName}\n` +
                `• Rango de peso: ${calcGrams} Gramos\n` +
                `Hola, me gustaría conocer qué diseños tienen disponibles en inventario en este peso.`;
        }
        return `https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent(headerText)}`;
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 scroll-smooth relative overflow-hidden">

            {/* TOP GOLD SCROLL PROGRESS BAR (PRECISIÓN SUIZA) */}
            <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none bg-stone-950/20">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_10px_#fbbf24] transition-all duration-75 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

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
                            name: CONFIG.name,
                            description: 'Alta joyería en Oro Nacional 18 Kilates. Compra de oro al mejor precio del mercado, avalúos inmediatos y taller orfebre a medida.',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: CONFIG.address,
                                addressLocality: CONFIG.city,
                                addressCountry: 'CO',
                            },
                            telephone: CONFIG.phoneWhatsapp,
                            priceRange: '$$$',
                            url: CONFIG.url,
                            geo: {
                                '@type': 'GeoCoordinates',
                                latitude: 1.4583, // Taminango, Nariño
                                longitude: -77.2917,
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

            {/* LUXURY NAVBAR GLOBAL (GLASSMORPHISM DE ALTA GAMA & MENÚ EDITORIAL) */}
            <LuxuryNavbar />

            {/* HERO SECTION REDISEÑADO (Composición Monumental, Sello Ley 750 & Consola Glass Atelier) */}
            <HeroLuxuryShowcase
                storeHeroBgUrl={CONFIG.storeHeroBgUrl}
                phrases={TYPEWRITER_PHRASES}
                whatsappHeroUrl={whatsappHeroUrl}
            />

            {/* CARRUSEL DE COLECCIONES */}
            <section id="colecciones" className="py-28 sm:py-36 px-6 border-t border-white/10 bg-gradient-to-b from-stone-950 via-stone-900/20 to-stone-950 relative overflow-hidden">
                {/* Luz ambiental sutil de fondo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/5 blur-[160px] pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6 reveal-init">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-[0.25em] font-medium mb-3 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
                                <span>Galería Oficial // Oro 18K Ley 750</span>
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-100 tracking-tight">
                                Colecciones de la Casa
                            </h2>
                            <p className="text-stone-300 text-xs sm:text-sm font-sans font-light mt-2 max-w-lg">
                                Piezas exclusivas forjadas a mano en Oro Nacional e importación de tejidos europeos con garantía permanente de pureza.
                            </p>
                        </div>
                        <div className="shrink-0">
                            <Link
                                href="/catalogo"
                                className="group inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-stone-900/70 border border-white/15 hover:border-amber-400/40 text-stone-200 hover:text-amber-300 text-xs font-sans tracking-widest uppercase backdrop-blur-xl transition-all active:scale-[0.98] shadow-md"
                            >
                                <span>Explorar Catálogo Completo</span>
                                <span className="w-6 h-6 rounded-full bg-white/5 group-hover:bg-amber-400/20 flex items-center justify-center transition-colors">
                                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* CONTENEDOR CON SCROLL INFINITO Y REVELACIÓN AL SCROLL */}
                    <div
                        ref={carouselRef}
                        onMouseEnter={() => setIsHoveredCarousel(true)}
                        onMouseLeave={() => setIsHoveredCarousel(false)}
                        onTouchStart={() => setIsHoveredCarousel(true)}
                        onTouchEnd={() => setIsHoveredCarousel(false)}
                        className="flex gap-5 sm:gap-7 overflow-x-auto scrollbar-none py-4 select-none flex-nowrap snap-x snap-mandatory scroll-smooth reveal-init"
                    >
                        {loading ? (
                            [1, 2, 3, 4].map((n) => (
                                <div key={n} className="w-[270px] xs:w-[300px] sm:w-[350px] h-[400px] sm:h-[460px] aspect-[3/4] rounded-3xl bg-stone-900/60 animate-pulse border border-white/10 shrink-0 snap-start" />
                            ))
                        ) : categories.length > 0 ? (
                            <>
                                {/* 1. LISTA ORIGINAL */}
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/catalogo?categoria=${cat.id}`}
                                        className="group relative w-[270px] xs:w-[300px] sm:w-[350px] h-[400px] sm:h-[460px] aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.2)] transition-all duration-500 shrink-0 bg-stone-900 snap-start"
                                    >
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt={`Colección ${cat.name} - Sol de Oro`}
                                                fill
                                                sizes="(max-width: 640px) 270px, (max-width: 1024px) 350px, 350px"
                                                quality={85}
                                                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out brightness-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-500">
                                                <span className="text-xs font-sans">Sin imagen asignada</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

                                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
                                            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-1.5 block">
                                                Oro 18K Ley 750
                                            </span>
                                            <h3 className="font-serif text-2xl sm:text-3xl text-stone-100 group-hover:text-amber-300 transition-colors tracking-wide mb-3">
                                                {cat.name}
                                            </h3>

                                            <div className="inline-flex items-center gap-2 text-xs font-sans text-stone-300 group-hover:text-amber-300 group-hover:translate-x-1.5 transition-all tracking-wider uppercase">
                                                <span>Ver Catálogo</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {/* 2. LISTA CLONADA PARA SCROLL CONTINUO */}
                                {categories.map((cat) => (
                                    <Link
                                        key={`clone-${cat.id}`}
                                        href={`/catalogo?categoria=${cat.id}`}
                                        aria-hidden="true"
                                        tabIndex={-1}
                                        className="group relative w-[270px] xs:w-[300px] sm:w-[350px] h-[400px] sm:h-[460px] aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/60 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.2)] transition-all duration-500 shrink-0 bg-stone-900 snap-start"
                                    >
                                        {cat.image_url ? (
                                            <Image
                                                src={cat.image_url}
                                                alt=""
                                                fill
                                                sizes="(max-width: 640px) 270px, (max-width: 1024px) 350px, 350px"
                                                quality={85}
                                                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out brightness-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-500">
                                                <span className="text-xs font-sans">Sin imagen asignada</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />

                                        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10">
                                            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-1.5 block">
                                                Oro 18K Ley 750
                                            </span>
                                            <span className="font-serif text-2xl sm:text-3xl text-stone-100 group-hover:text-amber-300 transition-colors tracking-wide mb-3 block">
                                                {cat.name}
                                            </span>

                                            <div className="inline-flex items-center gap-2 text-xs font-sans text-stone-300 group-hover:text-amber-300 group-hover:translate-x-1.5 transition-all tracking-wider uppercase">
                                                <span>Ver Catálogo</span>
                                                <span>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <div className="p-8 text-xs font-sans text-stone-500">
                                Carga tus categorías en el panel de administración.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CALCULADORA & COTIZACIÓN LUXURY EN CONSOLA GLASS ATELIER */}
            <section id="cotizador" className="py-28 sm:py-36 px-6 border-t border-white/10 bg-gradient-to-b from-stone-950 via-stone-900/30 to-stone-950 relative overflow-hidden">
                {/* Luces volumétricas secundarias de fondo */}
                <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-amber-500/10 blur-[150px] pointer-events-none -z-10" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-yellow-500/10 blur-[150px] pointer-events-none -z-10" />

                <div className="max-w-5xl mx-auto">
                    {/* Header con Indicador en Vivo */}
                    <div className="text-center mb-12 reveal-init">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                            <span className="font-semibold uppercase tracking-wider">Indicador de Cotización en Vivo // Oro 18K Ley 750</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-5xl text-stone-100 tracking-tight mb-3">Calculadora & Avalúos de Oro</h2>
                        <p className="text-stone-300 text-xs sm:text-sm font-sans font-light max-w-2xl mx-auto">
                            Comercializamos <strong className="text-stone-100 font-medium">Oro Nacional</strong> (macizo orfebre) y <strong className="text-stone-100 font-medium">Oro Italiano</strong> (tejidos europeos de precisión), ambos garantizados en <strong className="text-amber-300 font-medium">18 Kilates Ley 750</strong>.
                        </p>
                    </div>

                    {/* Consola de Cristal Double-Bezel */}
                    <div className="p-2 sm:p-3 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-md reveal-init">
                        <div className="p-7 sm:p-12 rounded-[calc(2.5rem-0.75rem)] bg-stone-950/80 border border-white/10 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                                {/* Controles Interactivos (Columna Izquierda) */}
                                <div className="lg:col-span-7 space-y-7">

                                    {/* 1. SELECCIÓN DE LÍNEA DE ORO (NACIONAL VS ITALIANO) */}
                                    <div>
                                        <label className="block text-xs font-sans uppercase tracking-[0.2em] text-stone-300 mb-3 font-medium">
                                            1. Selección de Línea de Oro 18K:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <button
                                                type="button"
                                                onClick={() => setGoldOrigin('nacional')}
                                                className={`p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between active:scale-[0.98] ${
                                                    goldOrigin === 'nacional'
                                                        ? 'bg-amber-500/15 border-amber-400 text-stone-100 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400'
                                                        : 'bg-stone-900/60 border-white/10 text-stone-400 hover:border-amber-400/40 hover:text-stone-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-serif text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2 tracking-wide">
                                                        🇨🇴 Oro Nacional 18K
                                                    </span>
                                                    {goldOrigin === 'nacional' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />}
                                                </div>
                                                <p className="text-[11px] text-stone-400 font-sans font-light leading-relaxed">
                                                    Hechura orfebre maciza y tradicional. Máxima resistencia y forja a medida.
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setGoldOrigin('italiano')}
                                                className={`p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between active:scale-[0.98] ${
                                                    goldOrigin === 'italiano'
                                                        ? 'bg-amber-500/15 border-amber-400 text-stone-100 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400'
                                                        : 'bg-stone-900/60 border-white/10 text-stone-400 hover:border-amber-400/40 hover:text-stone-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-serif text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2 tracking-wide">
                                                        🇮🇹 Oro Italiano 18K
                                                    </span>
                                                    {goldOrigin === 'italiano' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />}
                                                </div>
                                                <p className="text-[11px] text-stone-400 font-sans font-light leading-relaxed">
                                                    Tejidos europeos de alta precisión, pulido espejo y broches reforzados.
                                                </p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. TIPO DE SERVICIO */}
                                    <div>
                                        <label className="block text-xs font-sans uppercase tracking-[0.2em] text-stone-300 mb-3 font-medium">
                                            2. Tipo de Servicio:
                                        </label>
                                        <div className="grid grid-cols-1 gap-2.5">
                                            {[
                                                { id: 'vender_mi_oro', label: 'Vender mi Oro / Avalúo de Piezas', icon: '✦' },
                                                { id: 'fabricar_joya', label: 'Fabricar Joya Personalizada 18K', icon: '◇' },
                                                { id: 'comprar_joya', label: 'Comprar Joya del Catálogo', icon: '◈' },
                                            ].map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setCalcService(s.id as any)}
                                                    className={`py-3 px-4 rounded-xl text-xs font-sans text-left border transition-all duration-200 flex items-center justify-between active:scale-[0.98] ${
                                                        calcService === s.id
                                                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                                            : 'bg-stone-900/60 border-white/10 text-stone-300 hover:border-amber-400/30'
                                                    }`}
                                                >
                                                    <span className="tracking-wider uppercase">{s.label}</span>
                                                    <span className="text-amber-400">{s.icon}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. GRAMAJE */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-xs font-sans uppercase tracking-[0.2em] text-stone-300 font-medium">
                                                3. Gramaje Estimado:
                                            </label>
                                            <span className="text-amber-300 font-mono text-sm font-bold bg-stone-900/90 px-3.5 py-1 rounded-lg border border-amber-500/40 tracking-wider shadow-sm">
                                                {calcGrams} Gramos
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={calcGrams}
                                            onChange={(e) => setCalcGrams(Number(e.target.value))}
                                            className="w-full accent-amber-400 bg-stone-900 h-2.5 rounded-lg cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] font-sans text-stone-400 mt-2">
                                            <span>1g (Dije / Anillo)</span>
                                            <span>15g (Cadena)</span>
                                            <span>50g+ (Alta Joyería / Lote)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ficha Resumen & Cotización en Vivo (Columna Derecha) */}
                                <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-stone-900/60 border border-white/15 flex flex-col justify-between h-full space-y-6 shadow-xl relative overflow-hidden backdrop-blur-xl">

                                    {/* Brillo sutil de fondo */}
                                    <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                                    <div>
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                            <span className="text-[10px] font-sans uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-semibold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Tasa del Día Activa
                                            </span>
                                            <span className="text-[10px] font-mono text-amber-300 tracking-wider">
                                                Pureza Ley 750 (18K)
                                            </span>
                                        </div>

                                        <div className="space-y-3.5 mb-5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-stone-400 font-sans">Línea Seleccionada:</span>
                                                <span className="text-amber-300 font-serif font-semibold tracking-wide">
                                                    {goldOrigin === 'nacional' ? 'Oro Nacional 18K' : 'Oro Italiano 18K'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-stone-400 font-sans">Peso a Evaluar:</span>
                                                <span className="text-stone-100 font-mono font-bold text-sm tracking-wide">
                                                    {calcGrams}g
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-stone-400 font-sans">Certificación:</span>
                                                <span className="text-amber-300 font-sans font-medium tracking-wide">Garantía Permanente</span>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-stone-950/70 border border-white/10 text-[11px] font-sans text-stone-300 leading-relaxed font-light mb-4">
                                            {calcService === 'vender_mi_oro' && (
                                                <span>💎 <strong>Avalúo en Vivo:</strong> Pesaje exacto con balanza analítica calibrada frente a ti y pago inmediato en efectivo o banco con la mejor tasa del mercado.</span>
                                            )}
                                            {calcService === 'fabricar_joya' && (
                                                <span>👑 <strong>Taller Orfebre:</strong> Fabricamos tu pieza personalizada en Oro {goldOrigin === 'nacional' ? 'Nacional' : 'Italiano'} 18K con acabados de alta costura.</span>
                                            )}
                                            {calcService === 'comprar_joya' && (
                                                <span>✨ <strong>Disponibilidad:</strong> Consulta catálogo físico y entrega inmediata en piezas de {calcGrams} gramos.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <a
                                            href={getCalcWhatsappUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative overflow-hidden w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-sans text-xs font-bold hover:brightness-105 transition-all uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 text-center active:scale-[0.98]"
                                        >
                                            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-liquid-sweep" />
                                            <span className="relative z-10">{calcService === 'vender_mi_oro' ? 'Consultar Tasa en Vivo en WhatsApp' : 'Enviar Consulta a WhatsApp'}</span>
                                            <span className="relative z-10">→</span>
                                        </a>

                                        <p className="text-center text-[10px] font-sans text-stone-400">
                                            Atención directa y respuesta inmediata por WhatsApp.
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* PRODUCTOS DESTACADOS */}
            <section id="destacados" className="py-28 sm:py-36 px-6 border-t border-white/10 bg-gradient-to-b from-stone-950 via-stone-900/15 to-stone-950 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 reveal-init">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-[0.25em] font-medium mb-3 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Selección del Taller // Piezas Maestras</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-5xl text-stone-100 tracking-tight mb-4">Joyas Destacadas</h2>
                        <p className="text-stone-300 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto">
                            Joyas elaboradas minuciosamente con altos estándares de pureza Ley 750 y acabado pulido espejo.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 rounded-3xl bg-stone-900/50 border border-white/10 animate-pulse" />
                            ))}
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProducts.map((item, idx) => {
                                const categoryName = (Array.isArray(item.categories) ? item.categories[0]?.name : item.categories?.name) || 'Oro 18K';
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
                                        className={`group rounded-3xl bg-stone-900/50 border border-white/10 hover:border-amber-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)] reveal-init delay-stagger-${(idx % 3) + 1}`}
                                    >
                                        <Link href={`/producto/${item.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-950 block">
                                            {itemImage ? (
                                                <img
                                                    src={itemImage}
                                                    alt={`${item.name} - Sol de Oro Joyería`}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-600 font-serif">
                                                    Sin Foto
                                                </div>
                                            )}
                                            <span className="absolute top-4 left-4 text-[10px] font-sans bg-stone-950/80 backdrop-blur-md text-amber-300 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                                                {categoryName}
                                            </span>
                                        </Link>

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

                                            <div className="pt-5 border-t border-white/10 flex items-center justify-between">
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
                                                    href={`https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent(whatsappText)}`}
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
                    ) : (
                        <div className="text-center py-12 border border-white/10 rounded-3xl bg-stone-900/30 max-w-md mx-auto">
                            <p className="font-serif text-stone-300 mb-2">No hay joyas destacadas aún</p>
                            <p className="text-xs font-sans text-stone-400 mb-4">Sube productos desde tu panel de administración.</p>
                        </div>
                    )}

                    <div className="mt-14 text-center reveal-init">
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-stone-900/80 border border-white/15 text-stone-200 hover:text-amber-300 hover:border-amber-400/50 text-xs font-sans transition-all font-semibold uppercase tracking-wider backdrop-blur-xl active:scale-[0.98] shadow-md"
                        >
                            <span>Ver todas las piezas del catálogo</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* PREGUNTAS FRECUENTES - ACORDEÓN EDITORIAL MINIMALISTA */}
            <section id="faqs" className="py-28 sm:py-36 px-6 border-t border-white/10 bg-stone-950 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 reveal-init">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-[0.25em] font-medium mb-3 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Transparencia & Seguridad // Preguntas Frecuentes</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-5xl text-stone-100 tracking-tight">Transparencia Garantizada</h2>
                    </div>

                    <div className="divide-y divide-white/10">
                        {FAQS.map((faq, idx) => (
                            <div
                                key={idx}
                                className="py-7 reveal-init"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full text-left font-serif text-stone-100 hover:text-amber-300 flex items-center justify-between gap-6 text-lg sm:text-xl tracking-wide transition-colors group"
                                >
                                    <span>{faq.q}</span>
                                    <span className={`w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-amber-400 text-base transition-transform duration-300 shrink-0 ${
                                        openFaq === idx ? 'rotate-45 bg-amber-400/10 border-amber-500/40' : 'group-hover:border-amber-400/40'
                                    }`}>
                                        +
                                    </span>
                                </button>
                                {openFaq === idx && (
                                    <div className="text-stone-300 text-xs sm:text-sm font-sans font-light leading-relaxed pt-4 max-w-3xl animate-fadeIn">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* UBICACIÓN Y CONTACTO ARQUITECTÓNICO */}
            <section id="ubicacion" className="py-28 sm:py-36 px-6 border-t border-white/10 bg-gradient-to-b from-stone-950 via-stone-900/20 to-stone-950 relative">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                    {/* Tarjeta de Local Físico */}
                    <div className="p-8 sm:p-10 rounded-3xl bg-stone-900/60 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col justify-between reveal-init">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-[0.25em] font-medium mb-3 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Atención Directa // Encuéntranos</span>
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight mb-4">Nuestro Local Físico</h2>
                            <p className="text-stone-300 text-xs sm:text-sm font-sans font-light mb-8 leading-relaxed">
                                Te invitamos a conocer nuestras piezas en vivo, realizar avalúos presenciales de tu oro y recibir asesoría orfebre directa.
                            </p>

                            <div className="space-y-6 text-xs text-stone-300 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="font-sans">
                                        <strong className="block text-stone-100 font-sans uppercase tracking-wider text-[11px] mb-0.5">Dirección:</strong>
                                        <span className="text-stone-300">{CONFIG.address}</span>
                                        <span className="block text-stone-400">{CONFIG.city}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="font-sans">
                                        <strong className="block text-stone-100 font-sans uppercase tracking-wider text-[11px] mb-0.5">Atención WhatsApp:</strong>
                                        <a href={`https://wa.me/${CONFIG.phoneWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">
                                            +{CONFIG.phoneWhatsapp}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a
                            href={CONFIG.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-stone-900 border border-amber-500/40 text-amber-300 font-sans text-xs hover:bg-amber-400 hover:text-stone-950 transition-all font-semibold uppercase tracking-wider active:scale-[0.98] shadow-md text-center"
                        >
                            <span>Abrir en Google Maps (Cómo llegar) →</span>
                        </a>
                    </div>

                    {/* Redes y Comunidad */}
                    <div className="flex flex-col justify-between p-8 sm:p-10 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl reveal-init delay-stagger-2">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-[0.25em] font-medium mb-3 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Comunidad Digital</span>
                            </div>
                            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight mb-4">Síguenos en Redes</h2>
                            <p className="text-stone-300 text-xs sm:text-sm font-sans font-light mb-8 leading-relaxed">
                                Conoce nuestros vídeos en vivo, nuevos ingresos de joyas y testimonios de avalúos de clientes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a
                                href={whatsappHeroUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900/60 border border-white/10 hover:border-emerald-500/60 hover:text-emerald-400 text-center transition-all group flex flex-col items-center active:scale-[0.98]"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.305-1.129z" />
                                    </svg>
                                </div>
                                <div className="font-sans text-xs font-semibold uppercase tracking-wider">WhatsApp</div>
                                <div className="text-[10px] text-stone-400 font-sans mt-0.5">Chat Directo</div>
                            </a>

                            <a
                                href={CONFIG.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900/60 border border-white/10 hover:border-pink-500/60 hover:text-pink-400 text-center transition-all group flex flex-col items-center active:scale-[0.98]"
                            >
                                <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>
                                <div className="font-sans text-xs font-semibold uppercase tracking-wider">Instagram</div>
                                <div className="text-[10px] text-stone-400 font-sans mt-0.5">Cuenta Oficial</div>
                            </a>

                            <a
                                href={CONFIG.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900/60 border border-white/10 hover:border-blue-500/60 hover:text-blue-400 text-center transition-all group flex flex-col items-center active:scale-[0.98]"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <div className="font-sans text-xs font-semibold uppercase tracking-wider">Facebook</div>
                                <div className="text-[10px] text-stone-400 font-sans mt-0.5">Página Oficial</div>
                            </a>

                            <a
                                href={CONFIG.tiktokUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-5 rounded-2xl bg-stone-900/60 border border-white/10 hover:border-white/60 hover:text-white text-center transition-all group flex flex-col items-center active:scale-[0.98]"
                            >
                                <div className="w-10 h-10 rounded-full bg-stone-800 border border-white/20 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.96-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.56-1.24 2.55.03.8.44 1.58 1.09 2.05.77.58 1.8.76 2.73.53.95-.21 1.76-.9 2.1-1.8.18-.54.21-1.12.2-1.69.01-4.99 0-9.97.01-14.96z" />
                                    </svg>
                                </div>
                                <div className="font-sans text-xs font-semibold uppercase tracking-wider">TikTok</div>
                                <div className="text-[10px] text-stone-400 font-sans mt-0.5">Vídeos & Joyas</div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER MINIMALISTA DE ALTA COSTURA */}
            <footer className="border-t border-white/10 bg-stone-950 py-14 text-stone-400 text-xs text-center relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-serif text-xl tracking-widest text-amber-300">
                            Sol de Oro
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
                        <a href={whatsappHeroUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                            WhatsApp
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}