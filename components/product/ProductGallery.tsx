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
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-stone-900/40 aspect-square flex flex-col items-center justify-center text-stone-500 font-serif text-base p-8 text-center backdrop-blur-xl">
                <span className="text-3xl mb-2 opacity-40">💎</span>
                Fotografía oficial en proceso de digitalización
            </div>
        );
    }

    const activeIndex = allImages.indexOf(activeImage);

    return (
        <div className="space-y-4">
            {/* Contenedor Principal con marco concéntrico de Alta Joyería */}
            <div className="p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-stone-950 group">
                    <img
                        src={activeImage}
                        alt={productName}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Sello de Autenticidad flotante */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-sans tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Oro 18K Ley 750
                        </span>
                    </div>

                    {/* Indicador de foto actual si hay varias */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-4 right-4 z-10">
                            <span className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-stone-300 border border-white/10 text-[10px] font-mono tracking-wider">
                                {activeIndex + 1} / {allImages.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Miniaturas en carrusel elegante (Solo si hay más de 1 imagen) */}
            {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
                    {allImages.map((imgUrl, index) => {
                        const isSelected = imgUrl === activeImage;
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActiveImage(imgUrl)}
                                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-300 p-0.5 ${
                                    isSelected
                                        ? 'border-amber-400 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-amber-500/10'
                                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30 bg-stone-900/40'
                                }`}
                            >
                                <div className="w-full h-full rounded-xl overflow-hidden">
                                    <img
                                        src={imgUrl}
                                        alt={`${productName} - Vista ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}