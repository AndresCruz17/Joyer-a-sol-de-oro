import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cache } from 'react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSchema from '@/components/seo/ProductSchema';
import { getWhatsAppUrl, SITE_CONFIG } from '@/lib/config';

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
        .select('id, name, price, image_url')
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
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
            <ProductSchema
                name={product.name}
                description={product.description || `Joya ${product.name} en Oro 18K`}
                image={product.image_url || undefined}
                price={product.price || undefined}
                url={`${SITE_CONFIG.url}/producto/${product.id}`}
            />

            {/* NAV */}
            <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-8 py-4 sm:py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href={categorySlug ? `/categoria/${categorySlug}` : '/'}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-display tracking-wider text-amber-400 hover:text-amber-300 transition-colors uppercase"
                    >
                        <span>←</span> {categoryName ? `Volver a ${categoryName}` : 'Volver al Inicio'}
                    </Link>

                    <Link href="/" className="font-serif italic text-xl sm:text-2xl tracking-widest text-amber-300">
                        Sol de Oro
                    </Link>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-display tracking-wider text-stone-400 hover:text-amber-300 transition-colors hidden sm:block uppercase"
                    >
                        Atención Personalizada
                    </a>
                </div>
            </nav>

            {/* DETALLE Y GALERÍA */}
            <main className="max-w-7xl mx-auto px-6 py-10 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* Componente Galería Interactivo */}
                    <ProductGallery
                        mainImageUrl={product.image_url}
                        images={product.images}
                        productName={product.name}
                    />

                    {/* Ficha Técnica */}
                    <div className="flex flex-col justify-between space-y-8">
                        <div>
                            <span className="text-xs font-display text-amber-400 uppercase tracking-widest block mb-2">
                                Colección // {categoryName}
                            </span>
                            <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 tracking-wide mb-4">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-3 mb-6">
                                {product.price ? (
                                    <span className="text-amber-400 font-bold flex items-baseline gap-1">
                                        <span className="font-sans text-xl text-amber-500/80">$</span>
                                        <span className="font-serif text-3xl sm:text-4xl tracking-wide">{product.price.toLocaleString('es-CO')}</span>
                                        <span className="font-sans text-sm text-stone-400 ml-1">COP</span>
                                    </span>
                                ) : (
                                    <span className="font-sans text-2xl text-amber-400 font-bold">
                                        A consultar
                                    </span>
                                )}
                            </div>

                            {product.description && (
                                <p className="text-stone-300 font-sans font-light leading-relaxed text-sm sm:text-base mb-8 border-b border-stone-800/80 pb-6">
                                    {product.description}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-display text-stone-400 uppercase tracking-wider block mb-1">Material</span>
                                    <p className="text-sm font-semibold text-stone-200 font-sans">Oro 18K Ley 750</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-display text-stone-400 uppercase tracking-wider block mb-1">Peso Aproximado</span>
                                    <p className="text-sm font-semibold text-stone-200 font-sans">
                                        {product.weight_grams ? `${product.weight_grams} gramos` : 'Consultar'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-display text-stone-400 uppercase tracking-wider block mb-1">Garantía</span>
                                    <p className="text-sm font-semibold text-stone-200 font-sans">De por vida en el metal</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-display text-stone-400 uppercase tracking-wider block mb-1">Disponibilidad</span>
                                    <p className="text-sm font-semibold text-amber-400 font-sans">Entrega Inmediata / Pedido</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-stone-800/80">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold uppercase tracking-wider text-center text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
                            >
                                <span>Cotizar esta joya por WhatsApp</span>
                                <span>→</span>
                            </a>

                            <p className="text-center text-[11px] font-sans text-stone-400">
                                Respuesta inmediata por nuestros asesores de Sol de Oro.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Productos Relacionados */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mt-24 pt-12 border-t border-stone-800/80">
                        <h2 className="font-serif text-2xl font-light text-stone-100 tracking-widest mb-8">
                            Otras piezas de la colección <span className="italic text-amber-300">{categoryName}</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {relatedProducts.map((rel) => (
                                <Link
                                    key={rel.id}
                                    href={`/producto/${rel.id}`}
                                    className="group p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80 hover:border-amber-500/60 transition-all flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 shrink-0">
                                        {rel.image_url ? (
                                            <img
                                                src={rel.image_url}
                                                alt={rel.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-700 text-xs font-serif">
                                                Sin Foto
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-stone-200 group-hover:text-amber-300 transition-colors text-sm font-medium tracking-wide">
                                            {rel.name}
                                        </h4>
                                        <span className="text-amber-400 text-xs font-bold">
                                            {rel.price ? (
                                                <>
                                                    <span className="font-sans text-[10px] text-amber-500/80 mr-0.5">$</span>
                                                    <span className="font-serif text-sm tracking-wide">{rel.price.toLocaleString('es-CO')}</span>
                                                    <span className="font-sans text-[9px] text-stone-400 ml-1">COP</span>
                                                </>
                                            ) : (
                                                <span className="font-sans text-[11px] text-stone-400">A consultar</span>
                                            )}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

        </div>
    );
}