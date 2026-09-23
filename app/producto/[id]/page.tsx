import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cache } from 'react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSchema from '@/components/seo/ProductSchema';
import { getWhatsAppUrl, SITE_CONFIG } from '@/lib/config';
import LuxuryNavbar from '@/components/ui/LuxuryNavbar';

// REVALIDACIÓN INCREMENTAL (ISR) CADA 60 SEGUNDOS
export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }> | { id: string };
}

// 💡 OPTIMIZACIÓN: Función cacheada para evitar doble llamada a Supabase entre Metadata y Page
const getProduct = cache(async (productId: string) => {
    const supabase = await createClient();
    const { data: product, error } = await supabase
        .from('products')
        .select('id, name, slug, description, price, weight_grams, image_url, images, category_id, is_active, categories(name, slug)')
        .eq('id', productId)
        .eq('is_active', true)
        .maybeSingle();

    if (error || !product) return null;
    return product;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);

    if (!product) {
        return {
            title: 'Joya no encontrada | Sol de Oro',
            description: 'La pieza consultada no está disponible en nuestro catálogo.',
        };
    }

    const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    const categoryName = category?.name ? `Colección ${category.name}` : 'Alta Joyería';
    const priceFormatted = product.price ? `$${product.price.toLocaleString('es-CO')} COP` : '';
    const weightText = product.weight_grams ? `• Peso: ${product.weight_grams}g` : '';

    const title = `${product.name} ${priceFormatted ? `— ${priceFormatted}` : ''} | Sol de Oro`;
    const description = `${categoryName} ${weightText}. Joya exclusiva esculpida en Oro Nacional de 18K. Garantía de por vida.`;

    const allImages = Array.from(
        new Set([product.image_url, ...(product.images || [])].filter(Boolean) as string[])
    );

    const ogImages = allImages.map((url) => ({
        url,
        secureUrl: url,
        width: 800,
        height: 800,
        alt: product.name,
    }));

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            siteName: 'Sol de Oro — Joyería Fina 18K',
            type: 'website',
            images: ogImages,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: allImages,
        },
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);

    if (!product) {
        notFound();
    }

    const supabase = await createClient();

    // Productos relacionados de la misma categoría (solo activos)
    const { data: relatedProducts } = await supabase
        .from('products')
        .select('id, name, price, weight_grams, image_url')
        .eq('category_id', product.category_id)
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(3);

    const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
    const categoryName = category?.name || 'Joyería';
    const categorySlug = category?.slug;

    const imageUrl = product.image_url || '';
    const weightText = product.weight_grams ? `${product.weight_grams}g` : 'A consultar';
    const priceText = product.price ? `$${product.price.toLocaleString('es-CO')} COP` : 'A consultar';

    const whatsappText =
        `✨ *SOLICITUD DE COTIZACIÓN // SOL DE ORO* ✨\n\n` +
        `📌 *Joya:* ${product.name}\n` +
        `🏷️ *Colección:* ${categoryName}\n` +
        `⚖️ *Peso aprox:* ${weightText}\n` +
        `💰 *Precio catálogo:* ${priceText}\n` +
        `👑 *Material:* Oro 18K Ley 750 (Nacional / Italiano)\n` +
        (imageUrl ? `\n🖼️ *Ver Foto:* ${imageUrl}\n\n` : '\n') +
        `Hola, quisiera confirmar disponibilidad, tiempo de entrega y métodos de pago para esta pieza. ¡Muchas gracias!`;

    const whatsappUrl = getWhatsAppUrl(whatsappText);

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 pt-20 sm:pt-24 relative overflow-hidden">
            <ProductSchema
                name={product.name}
                description={product.description || `Joya ${product.name} en Oro 18K`}
                image={product.image_url || undefined}
                price={product.price || undefined}
                url={`${SITE_CONFIG.url}/producto/${product.id}`}
            />

            {/* NAV UNIFICADO */}
            <LuxuryNavbar />

            {/* LUCES VOLUMÉTRICAS AMBIENTALES */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

            {/* BREADCRUMB EDITORIAL EN CRISTAL */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 pb-4">
                <nav className="flex items-center flex-wrap gap-2 text-xs font-sans text-stone-400">
                    <Link href="/" className="hover:text-amber-300 transition-colors">
                        Inicio
                    </Link>
                    <span className="text-stone-700">/</span>
                    <Link href="/catalogo" className="hover:text-amber-300 transition-colors">
                        Catálogo
                    </Link>
                    {categorySlug && (
                        <>
                            <span className="text-stone-700">/</span>
                            <Link href={`/categoria/${categorySlug}`} className="hover:text-amber-300 transition-colors capitalize">
                                {categoryName}
                            </Link>
                        </>
                    )}
                    <span className="text-stone-700">/</span>
                    <span className="text-amber-300 font-medium truncate max-w-[200px] sm:max-w-none">
                        {product.name}
                    </span>
                </nav>
            </div>

            {/* DETALLE Y GALERÍA */}
            <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

                    {/* COLUMNA IZQUIERDA: GALERÍA Y SEDE FÍSICA */}
                    <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-6">
                        <ProductGallery
                            mainImageUrl={product.image_url}
                            images={product.images}
                            productName={product.name}
                        />

                        {/* Banner de Boutique Física en Nariño */}
                        <div className="p-4 sm:p-5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base shrink-0">
                                    📍
                                </div>
                                <div>
                                    <p className="text-xs font-sans font-medium text-stone-200">
                                        Boutique & Taller Sol de Oro
                                    </p>
                                    <p className="text-[11px] font-sans text-stone-400">
                                        {SITE_CONFIG.address}, {SITE_CONFIG.city}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={SITE_CONFIG.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40 text-[11px] font-sans text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap"
                            >
                                Ver Mapa →
                            </a>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FICHA TÉCNICA Y ACCIONES */}
                    <div className="lg:col-span-6 space-y-6">
                        
                        {/* Hallmark & Colección */}
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#fbbf24]" />
                                <span>Colección // {categoryName}</span>
                            </div>

                            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-100 tracking-tight leading-[1.15]">
                                {product.name}
                            </h1>
                        </div>

                        {/* Consola de Precio Oficial */}
                        <div className="p-6 rounded-3xl bg-stone-900/50 border border-white/10 backdrop-blur-xl space-y-2">
                            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                                Cotización de Referencia 18K
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                                {product.price ? (
                                    <div className="flex items-baseline gap-1 text-amber-400 font-bold">
                                        <span className="font-sans text-xl text-amber-500/80">$</span>
                                        <span className="font-serif text-3xl sm:text-4xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                                            {product.price.toLocaleString('es-CO')}
                                        </span>
                                        <span className="font-sans text-xs text-stone-400 ml-1.5 font-normal">COP</span>
                                    </div>
                                ) : (
                                    <span className="font-serif text-2xl sm:text-3xl text-amber-300">
                                        Precio a Consultar
                                    </span>
                                )}

                                <span className="inline-flex items-center gap-1.5 text-[11px] font-sans text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Tasa Oficial Actualizada
                                </span>
                            </div>
                            <p className="text-[11px] font-sans text-stone-500 pt-1">
                                El valor final se calcula con el pesaje exacto en gramos al momento del despacho o compra presencial.
                            </p>
                        </div>

                        {/* Descripción de la Pieza */}
                        {product.description && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400">
                                    Detalle Orfebre
                                </h3>
                                <p className="text-stone-300 font-sans font-light leading-relaxed text-sm sm:text-base border-b border-white/10 pb-6">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Matriz de Especificaciones Técnicas */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400">
                                Especificaciones de la Joya
                            </h3>

                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                                        Pureza & Ley
                                    </span>
                                    <p className="text-sm font-semibold text-stone-200 font-sans">
                                        Oro 18K Ley 750
                                    </p>
                                    <span className="text-[10px] text-amber-400/80 font-mono">75.0% oro puro</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                                        Peso Registrado
                                    </span>
                                    <p className="text-sm font-semibold text-stone-200 font-sans">
                                        {product.weight_grams ? `${product.weight_grams} gramos` : 'Variable / A consultar'}
                                    </p>
                                    <span className="text-[10px] text-stone-400 font-mono">Balanza analítica</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                                        Garantía de Pureza
                                    </span>
                                    <p className="text-sm font-semibold text-stone-200 font-sans">
                                        Perpetua en el Metal
                                    </p>
                                    <span className="text-[10px] text-emerald-400/80 font-mono">Certificado impreso</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
                                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                                        Disponibilidad
                                    </span>
                                    <p className="text-sm font-semibold text-amber-300 font-sans">
                                        Inmediata / A Medida
                                    </p>
                                    <span className="text-[10px] text-stone-400 font-mono">Taller orfebre</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Acción Directa WhatsApp con Liquid Sweep */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-sans font-bold uppercase tracking-wider text-xs sm:text-sm transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_45px_rgba(245,158,11,0.4)] flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <span className="text-base">💬</span>
                                <span>Cotizar esta joya por WhatsApp</span>
                                <span className="text-stone-900 font-bold">→</span>
                            </a>

                            <p className="text-center text-[11px] font-sans text-stone-400">
                                Asesoría orfebre directa · Respuesta inmediata de nuestros tasadores oficiales.
                            </p>
                        </div>

                        {/* Fila de Sellos de Confianza y Respaldo */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div className="p-3 rounded-2xl bg-stone-900/30 border border-white/5 flex items-center gap-3">
                                <span className="text-amber-400 text-base">🛡️</span>
                                <div>
                                    <p className="text-[11px] font-sans font-medium text-stone-200">Garantía Total</p>
                                    <p className="text-[10px] text-stone-400">Ley 750 perpetua</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-stone-900/30 border border-white/5 flex items-center gap-3">
                                <span className="text-amber-400 text-base">⚖️</span>
                                <div>
                                    <p className="text-[11px] font-sans font-medium text-stone-200">Pesaje Exacto</p>
                                    <p className="text-[10px] text-stone-400">Balanza de precisión</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-stone-900/30 border border-white/5 flex items-center gap-3">
                                <span className="text-amber-400 text-base">📦</span>
                                <div>
                                    <p className="text-[11px] font-sans font-medium text-stone-200">Envío Seguro</p>
                                    <p className="text-[10px] text-stone-400">100% asegurado</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* PRODUCTOS RELACIONADOS (HAUTE JOAILLERIE CARDS) */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mt-24 pt-14 border-t border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                            <div>
                                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                                    Otras Creaciones
                                </span>
                                <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 tracking-wide">
                                    Piezas de la colección <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">{categoryName}</span>
                                </h2>
                            </div>

                            {categorySlug && (
                                <Link
                                    href={`/categoria/${categorySlug}`}
                                    className="text-xs font-sans text-amber-300 hover:text-amber-200 uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
                                >
                                    <span>Ver colección completa</span>
                                    <span>→</span>
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {relatedProducts.map((rel) => {
                                const relPrice = rel.price ? `$${rel.price.toLocaleString('es-CO')} COP` : 'A consultar';
                                const relWeight = rel.weight_grams ? `${rel.weight_grams}g` : null;

                                return (
                                    <div
                                        key={rel.id}
                                        className="group rounded-3xl bg-stone-900/40 border border-white/10 hover:border-amber-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)] backdrop-blur-xl"
                                    >
                                        <Link href={`/producto/${rel.id}`} className="relative aspect-square w-full overflow-hidden bg-stone-950 block">
                                            {rel.image_url ? (
                                                <img
                                                    src={rel.image_url}
                                                    alt={rel.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-95"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-600 font-serif">
                                                    Sin Foto
                                                </div>
                                            )}
                                            <span className="absolute top-3.5 left-3.5 text-[10px] font-sans bg-stone-950/80 backdrop-blur-md text-amber-300 border border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                                                Oro 18K
                                            </span>
                                        </Link>

                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link href={`/producto/${rel.id}`}>
                                                    <h4 className="font-serif text-lg text-stone-100 group-hover:text-amber-300 transition-colors tracking-wide mb-2 line-clamp-1">
                                                        {rel.name}
                                                    </h4>
                                                </Link>
                                                {relWeight && (
                                                    <span className="text-[10px] font-mono text-stone-400 block uppercase tracking-wider mb-3">
                                                        Peso aprox: {relWeight}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                                <span className="text-amber-400 font-bold">
                                                    {rel.price ? (
                                                        <>
                                                            <span className="font-sans text-xs text-amber-500/80 mr-0.5">$</span>
                                                            <span className="font-serif text-base tracking-wide text-amber-300">{rel.price.toLocaleString('es-CO')}</span>
                                                            <span className="font-sans text-[10px] text-stone-400 ml-1">COP</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-sans text-xs text-amber-400">A consultar</span>
                                                    )}
                                                </span>

                                                <Link
                                                    href={`/producto/${rel.id}`}
                                                    className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-400 hover:text-stone-950 text-[11px] font-sans font-semibold uppercase tracking-wider transition-all"
                                                >
                                                    Ver Joya
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>

            {/* FOOTER GLOBAL DE ALTA JOYERÍA (UNIFICADO) */}
            <footer className="border-t border-white/10 bg-stone-950 py-14 text-stone-400 text-xs text-center relative z-10 mt-20">
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