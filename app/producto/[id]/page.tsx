import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }> | { id: string };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const supabase = await createClient();

    // 1. Obtener la información completa del producto junto con su categoría
    const { data: product, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('id', productId)
        .maybeSingle();

    if (error || !product) {
        notFound();
    }

    // 2. Obtener productos relacionados de la misma categoría (máximo 3)
    const { data: relatedProducts } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .limit(3);

    const categoryName = product.categories?.name || 'Joyería';
    const categorySlug = product.categories?.slug;

    // Variables para la cotización
    const imageUrl = product.image_url || '';
    const weightText = product.weight_grams ? `${product.weight_grams}g` : 'A consultar';
    const priceText = product.price ? `$${product.price.toLocaleString('es-CO')} COP` : 'A consultar';

    // Mensaje estructurado profesional para WhatsApp
    const whatsappText =
        `✨ *SOLICITUD DE COTIZACIÓN // SOL DE ORO* ✨\n\n` +
        `📌 *Joya:* ${product.name}\n` +
        `🏷️ *Colección:* ${categoryName}\n` +
        `⚖️ *Peso aprox:* ${weightText}\n` +
        `💰 *Precio catálogo:* ${priceText}\n` +
        `👑 *Material:* Oro Nacional 18K\n` +
        (imageUrl ? `\n🖼️ *Ver Foto:* ${imageUrl}\n\n` : '\n') +
        `Hola, quisiera confirmar disponibilidad, tiempo de entrega y métodos de pago para esta pieza. ¡Muchas gracias!`;

    const whatsappUrl = `https://wa.me/573000000000?text=${encodeURIComponent(whatsappText)}`; // Reemplazar con el número real de WhatsApp

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">

            {/* Navegación Superior */}
            <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href={categorySlug ? `/categoria/${categorySlug}` : '/catalogo'}
                        className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        <span>←</span> Volver a {categoryName}
                    </Link>

                    <Link href="/" className="font-serif italic text-lg tracking-wide text-amber-300">
                        Sol de Oro
                    </Link>

                    <Link
                        href="/catalogo"
                        className="text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors hidden sm:block"
                    >
                        Catálogo Completo
                    </Link>
                </div>
            </nav>

            {/* Contenido Principal del Producto */}
            <main className="max-w-7xl mx-auto px-6 py-10 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

                    {/* Foto Principal */}
                    <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-900/40 aspect-square shadow-2xl">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-700 font-serif text-2xl">
                                Fotografía no disponible
                            </div>
                        )}

                        <span className="absolute top-4 left-4 text-xs font-mono bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase">
                            Oro Nacional 18K
                        </span>
                    </div>

                    {/* Ficha Técnica y Cotización */}
                    <div className="flex flex-col justify-between space-y-8">
                        <div>
                            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">
                                Colección // {categoryName}
                            </span>
                            <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 mb-4">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="font-mono text-3xl sm:text-4xl text-amber-400 font-bold">
                                    ${product.price?.toLocaleString('es-CO')}
                                </span>
                                <span className="text-xs font-mono text-stone-400">COP</span>
                            </div>

                            {product.description && (
                                <p className="text-stone-300 font-light leading-relaxed text-sm sm:text-base mb-8 border-b border-stone-800/80 pb-6">
                                    {product.description}
                                </p>
                            )}

                            {/* Especificaciones de la Joya */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Material</span>
                                    <p className="text-sm font-semibold text-stone-200">Oro 18K Garante</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Peso Aproximado</span>
                                    <p className="text-sm font-semibold text-stone-200">
                                        {product.weight_grams ? `${product.weight_grams} gramos` : 'Consultar'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Garantía</span>
                                    <p className="text-sm font-semibold text-stone-200">De por vida en el metal</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">Disponibilidad</span>
                                    <p className="text-sm font-semibold text-amber-400">Entrega Inmediata / Pedido</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Cotizar por WhatsApp */}
                        <div className="space-y-3 pt-4 border-t border-stone-800/80">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-center text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
                            >
                                <span>Cotizar esta joya por WhatsApp</span>
                                <span>→</span>
                            </a>

                            <p className="text-center text-[11px] font-mono text-stone-400">
                                Respuesta inmediata por nuestros asesores de Sol de Oro.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Productos Relacionados */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mt-24 pt-12 border-t border-stone-800/80">
                        <h2 className="font-serif text-2xl font-light text-stone-100 mb-8">
                            Otras piezas de la colección <span className="italic text-amber-300">{categoryName}</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {relatedProducts.map((rel) => (
                                <Link
                                    key={rel.id}
                                    href={`/producto/${rel.id}`}
                                    className="group rounded-2xl bg-stone-900/40 border border-stone-800 p-4 hover:border-amber-500/50 transition-all duration-300 flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 shrink-0">
                                        {rel.image_url ? (
                                            <img src={rel.image_url} alt={rel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-600">Sin foto</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-sm text-stone-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                                            {rel.name}
                                        </h3>
                                        <p className="text-xs font-mono text-amber-400 mt-1">
                                            ${rel.price?.toLocaleString('es-CO')} COP
                                        </p>
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