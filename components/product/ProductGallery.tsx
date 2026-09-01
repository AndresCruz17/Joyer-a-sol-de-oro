'use client';

import { useState } from 'react';

interface ProductGalleryProps {
    mainImageUrl: string | null;
    images: string[] | null;
    productName: string;
}

export default function ProductGallery({
    mainImageUrl,
    images = [],
    productName,
}: ProductGalleryProps) {
    // Consolidar todas las fotos disponibles (sin duplicados)
    const allImages = Array.from(
        new Set([mainImageUrl, ...(images || [])].filter(Boolean) as string[])
    );

    const [activeImage, setActiveImage] = useState<string>(
        allImages[0] || ''
    );

    if (allImages.length === 0) {
        return (
            <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-900/40 aspect-square flex items-center justify-center text-stone-700 font-serif text-lg">
                Fotografía no disponible
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Imagen Principal Activa */}
            <div className="relative rounded-3xl overflow-hidden border border-stone-800 bg-stone-900/40 aspect-square shadow-2xl group">
                <img
                    src={activeImage}
                    alt={productName}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />

                <span className="absolute top-4 left-4 text-xs font-mono bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full uppercase">
                    Oro Nacional 18K
                </span>
            </div>

            {/* Miniaturas (Solo se muestran si hay más de 1 imagen) */}
            {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {allImages.map((imgUrl, index) => {
                        const isSelected = imgUrl === activeImage;
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveImage(imgUrl)}
                                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-300 ${isSelected
                                        ? 'border-amber-400 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                        : 'border-stone-800/80 opacity-60 hover:opacity-100 hover:border-stone-700'
                                    }`}
                            >
                                <img
                                    src={imgUrl}
                                    alt={`${productName} - Vista ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}