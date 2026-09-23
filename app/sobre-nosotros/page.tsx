import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/config';
import LuxuryNavbar from '@/components/ui/LuxuryNavbar';

export const metadata: Metadata = {
    title: 'Sobre Nosotros | Sol de Oro Joyería & Compraventa',
    description:
        'Conoce la tradición orfebre, compromiso y maestría de Sol de Oro en El Remolino, Nariño. Joyas en Oro Nacional e Italiano de 18K Ley 750 con garantía de por vida y avalúos de confianza.',
};

export default function SobreNosotrosPage() {
    const whatsappUrl = getWhatsAppUrl(
        'Hola *Sol de Oro*, deseo conocer más sobre su historia, taller orfebre y solicitar asesoría personalizada.'
    );

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 pt-20 sm:pt-24 relative overflow-hidden">
            {/* NAVEGACIÓN GLOBAL UNIFICADA */}
            <LuxuryNavbar />

            {/* LUCES VOLUMÉTRICAS AMBIENTALES */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />
            <div className="absolute top-[600px] right-10 w-[450px] h-[450px] bg-yellow-500/5 blur-[150px] pointer-events-none -z-10" />

            {/* HERO HEADER MONUMENTAL (HAUTE JOAILLERIE) */}
            <header className="relative py-20 sm:py-28 px-6 text-center border-b border-white/10">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Sello Técnico Eyebrow */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
                        <span>Tradición & Maestría Orfebre // Oro 18K Ley 750</span>
                    </div>

                    {/* Titular Monumental */}
                    <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-stone-100 tracking-tight leading-[1.08]">
                        El Arte de la <br />
                        <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                            Joyería Eterna
                        </span>
                    </h1>

                    {/* Párrafo Editorial */}
                    <p className="text-stone-300 text-sm sm:text-base lg:text-lg font-sans font-light max-w-2xl mx-auto leading-relaxed">
                        En <strong className="text-amber-200 font-medium">Sol de Oro Joyería & Compraventa</strong>, transformamos el metal más noble en símbolos de elegancia permanente, forja artesanal y valor auténtico con garantía perpetua de pureza.
                    </p>

                    {/* Punzón Orfebre */}
                    <div className="pt-2">
                        <span className="inline-block text-[11px] font-mono tracking-[0.3em] text-amber-400/80 uppercase px-4 py-1 border border-white/10 rounded-full bg-stone-900/60 backdrop-blur-sm">
                            [ LEY 750 // GARANTÍA PERMANENTE ]
                        </span>
                    </div>
                </div>
            </header>

            {/* CUERPO PRINCIPAL EDITORIAL */}
            <main className="max-w-6xl mx-auto px-6 py-20 sm:py-28 space-y-28 sm:space-y-36">

                {/* CAPÍTULO 1: LA CASA & NUESTRO ORIGEN */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Texto Narrativo */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
                            <span>01</span>
                            <span className="w-8 h-[1px] bg-amber-400/40" />
                            <span>La Casa & Nuestro Origen</span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 tracking-tight font-light leading-snug">
                            Arraigo, honestidad y devoción por la <span className="italic text-amber-300">alta orfebrería</span>
                        </h2>

                        <p className="text-stone-300 text-sm font-sans font-light leading-relaxed">
                            Fundada y consolidada en el corazón de <strong className="text-stone-100 font-medium">El Remolino, Taminango, Nariño</strong>, nuestra casa orfebre nació con un propósito firme: brindar a nuestra comunidad y a todo el país una experiencia de joyería de máxima pureza, transparente y de confianza absoluta.
                        </p>

                        <p className="text-stone-400 text-sm font-sans font-light leading-relaxed">
                            Nos dedicamos tanto a la elaboración y comercialización de piezas exclusivas como al servicio especializado de avalúos y compra de oro, ofreciendo siempre pruebas a la vista, pesaje en balanza analítica calibrada y el respaldo inquebrantable de la Ley 750.
                        </p>

                        {/* Pull Quote Editorial */}
                        <div className="p-6 rounded-2xl bg-stone-900/40 border-l-2 border-amber-400 space-y-2 backdrop-blur-sm">
                            <p className="font-serif italic text-base sm:text-lg text-amber-200/90 leading-relaxed">
                                &ldquo;El oro no es solo una joya; es un resguardo de valor patrimonial, un legado familiar y una obra de arte forjada para resistir el tiempo.&rdquo;
                            </p>
                            <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase block">
                                Sol de Oro // Filosofía de Taller
                            </span>
                        </div>
                    </div>

                    {/* Fotografía de la Boutique Real (Double-Bezel Glass Card) */}
                    <div className="lg:col-span-6">
                        <div className="p-2 sm:p-2.5 rounded-[2.5rem] bg-white/[0.03] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
                            <div className="relative aspect-[4/3] rounded-[calc(2.5rem-0.625rem)] overflow-hidden border border-white/10 bg-stone-900 group">
                                <Image
                                    src={SITE_CONFIG.storeHeroBgUrl}
                                    alt="Sede Boutique Sol de Oro en El Remolino, Nariño"
                                    fill
                                    quality={90}
                                    sizes="(max-width: 1024px) 100vw, 550px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80" />

                                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between z-10">
                                    <div>
                                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 block mb-0.5">
                                            Sede Principal & Vitrinas
                                        </span>
                                        <span className="font-serif text-lg text-stone-100">
                                            {SITE_CONFIG.city}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-sans px-3 py-1 rounded-full bg-stone-950/80 border border-white/20 text-stone-300 backdrop-blur-md">
                                        Atención Presencial
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CAPÍTULO 2: LAS DOS EXPRESIONES DEL ORO 18K */}
                <section className="space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
                            <span>02</span>
                            <span className="w-8 h-[1px] bg-amber-400/40" />
                            <span>Dualidad del Metal Noble</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 tracking-tight">
                            Oro Nacional vs. Oro Italiano
                        </h2>
                        <p className="text-stone-300 text-xs sm:text-sm font-sans font-light leading-relaxed">
                            Ambas opciones contienen exactamente 750 milésimas de oro puro por cada mil. La diferencia radica en su arquitectura y técnica de confección.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Tarjeta Oro Nacional */}
                        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900/50 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-8 backdrop-blur-xl group shadow-xl">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <span className="font-serif text-xl sm:text-2xl text-amber-300 font-normal">
                                        🇨🇴 Oro Nacional 18K
                                    </span>
                                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                                        Hechura Maciza
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-stone-300 font-sans font-light leading-relaxed">
                                    Elaborado manualmente en taller tradicional orfebre. Se caracteriza por su densidad sólida, máxima resistencia mecánica y la posibilidad de forjar piezas personalizadas únicas con el gramaje exacto deseado.
                                </p>

                                <ul className="space-y-2.5 text-xs text-stone-400 font-sans pt-2">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>Ideal para cadenas, anillos y dijes de uso diario sin desgaste.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>Maleabilidad total para grabar, engastar piedras y personalizar.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>Piezas sólidas concebidas como patrimonio para toda la vida.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider block">
                                    Pureza Certificada: 75% Oro Puro Garantizado
                                </span>
                            </div>
                        </div>

                        {/* Tarjeta Oro Italiano */}
                        <div className="p-8 sm:p-10 rounded-3xl bg-stone-900/50 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between space-y-8 backdrop-blur-xl group shadow-xl">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <span className="font-serif text-xl sm:text-2xl text-amber-300 font-normal">
                                        🇮🇹 Oro Italiano 18K
                                    </span>
                                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                                        Tejidos de Precisión
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-stone-300 font-sans font-light leading-relaxed">
                                    Importado directamente de centros orfebres europeos. Destaca por sus tejidos geométricos de precisión matemática (como Mónaco, Cartier, Gucci y Bismark), pulido espejo ultrabrillante y broches de caja reforzados.
                                </p>

                                <ul className="space-y-2.5 text-xs text-stone-400 font-sans pt-2">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>Acabado pulido espejo de brillo incomparable y caída perfecta.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>Broches de alta seguridad con doble pestillo europeo.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>Diseño sofisticado reconocido a nivel internacional.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-wider block">
                                    Pureza Certificada: 75% Oro Puro Garantizado
                                </span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* CAPÍTULO 3: LOS 3 PILARES DEL ESTÁNDAR SOL DE ORO */}
                <section className="space-y-12">
                    <div className="text-center max-w-xl mx-auto space-y-3">
                        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
                            <span>03</span>
                            <span className="w-8 h-[1px] bg-amber-400/40" />
                            <span>Compromiso Innegociable</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 tracking-tight">
                            El Estándar de la Casa
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                        {/* Pilar 1 */}
                        <div className="p-8 rounded-3xl bg-stone-900/40 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between space-y-6 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-100">Certificación Perpetua</h3>
                                <p className="text-xs text-stone-400 font-sans leading-relaxed font-light">
                                    Cada gramo entregado cuenta con respaldo y certificación física de pureza en Oro 18K Ley 750 para toda la vida.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 2 */}
                        <div className="p-8 rounded-3xl bg-stone-900/40 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between space-y-6 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-100">Avalúos a la Vista</h3>
                                <p className="text-xs text-stone-400 font-sans leading-relaxed font-light">
                                    Pruebas químicas de toque y balanzas analíticas calibradas frente a ti, con la tasa de compra más justa del mercado.
                                </p>
                            </div>
                        </div>

                        {/* Pilar 3 */}
                        <div className="p-8 rounded-3xl bg-stone-900/40 border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between space-y-6 backdrop-blur-md">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl text-stone-100">Envíos Asegurados</h3>
                                <p className="text-xs text-stone-400 font-sans leading-relaxed font-light">
                                    Empaque de alta seguridad y custodia especializada para envíos directos y confiables a cualquier municipio de Colombia.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* CAPÍTULO 4: UBICACIÓN DE LA BOUTIQUE FÍSICA */}
                <section className="p-8 sm:p-12 rounded-3xl bg-stone-900/60 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3">
                        <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">
                            Atención Personalizada en Boutique
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-stone-100 font-light">
                            Visítanos en El Remolino, Nariño
                        </h3>
                        <p className="text-stone-300 text-xs sm:text-sm font-sans font-light max-w-lg leading-relaxed">
                            Conoce de cerca nuestras vitrinas, realiza el avalúo de tus prendas de oro y recibe orientación personalizada de nuestros orfebres.
                        </p>
                        <div className="pt-2 text-xs text-stone-400 font-mono">
                            📍 {SITE_CONFIG.address}, {SITE_CONFIG.city}
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <a
                            href={SITE_CONFIG.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3.5 rounded-full bg-stone-900 border border-amber-500/40 text-amber-300 hover:bg-amber-400 hover:text-stone-950 font-sans text-xs font-semibold uppercase tracking-wider transition-all text-center active:scale-[0.98]"
                        >
                            Cómo llegar (Maps) →
                        </a>
                    </div>
                </section>

                {/* CAPÍTULO 5: CONCIERGE CTA */}
                <section className="text-center py-16 px-6 sm:px-12 rounded-[2.5rem] bg-gradient-to-b from-stone-900/60 via-stone-900/30 to-stone-950 border border-white/10 max-w-4xl mx-auto space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/10 blur-[120px] pointer-events-none -z-10" />

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] uppercase tracking-[0.25em] font-medium backdrop-blur-sm">
                        <span>Contacto Directo con el Taller</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 tracking-tight">
                        ¿Deseas cotizar una pieza o vender tu oro?
                    </h2>

                    <p className="text-stone-300 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
                        Nuestros asesores orfebres responderán tus preguntas de inmediato con la tasa oficial del día y opciones personalizadas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-sans text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-[0.98] text-center"
                        >
                            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-liquid-sweep" />
                            <span className="relative z-10">Asesoría Directa por WhatsApp →</span>
                        </a>

                        <Link
                            href="/catalogo"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900/80 border border-white/15 hover:border-amber-400/40 text-stone-200 hover:text-amber-300 font-sans text-xs font-semibold uppercase tracking-wider transition-all backdrop-blur-xl active:scale-[0.98] text-center"
                        >
                            Explorar Catálogo de Joyas
                        </Link>
                    </div>
                </section>
            </main>

            {/* FOOTER MINIMALISTA DE ALTA COSTURA (UNIFICADO) */}
            <footer className="border-t border-white/10 bg-stone-950 py-14 text-stone-400 text-xs text-center relative z-10 mt-20">
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
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                            WhatsApp
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}