'use client';

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
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <div className="w-full">

            {/* Título de la Sección */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                        01 // Colecciones
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-light text-stone-100">
                        Explora por <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">Categoría</span>
                    </h2>
                </div>
            </div>

            {/* Grid de Tarjetas de Categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                    <a
                        key={cat.id}
                        href={`#catalogo`}
                        className="group relative h-80 rounded-2xl overflow-hidden border border-stone-800/80 hover:border-amber-500/60 transition-all duration-500 flex flex-col justify-end p-6 shadow-lg hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
                    >
                        {/* Imagen de fondo cargada desde Supabase */}
                        {cat.image_url ? (
                            <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-90"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center">
                                <span className="text-amber-500/20 font-serif font-bold text-6xl">SO</span>
                            </div>
                        )}

                        {/* Capa de degradado oscuro para legibilidad de texto */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                        {/* Contenido sobre la imagen */}
                        <div className="relative z-10">
                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                                Oro 18K
                            </span>
                            <h3 className="font-serif text-2xl text-stone-100 group-hover:text-amber-300 transition-colors">
                                {cat.name}
                            </h3>
                            {cat.description && (
                                <p className="text-xs text-stone-400 line-clamp-2 mt-1.5 font-light leading-relaxed">
                                    {cat.description}
                                </p>
                            )}
                        </div>
                    </a>
                ))}
            </div>

        </div>
    );
}