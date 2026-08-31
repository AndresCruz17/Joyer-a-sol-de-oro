'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Detectar si el puntero está sobre un elemento con hover interactivo
            const target = e.target as HTMLElement | null;
            if (
                target?.tagName === 'A' ||
                target?.tagName === 'BUTTON' ||
                target?.closest('a') ||
                target?.closest('button') ||
                target?.dataset.interactive
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
            {/* Luz dorada ambiental que sigue al mouse */}
            <div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden lg:block"
                style={{
                    background: `radial-gradient(600px at ${position.x}px ${position.y}px, rgba(245, 158, 11, 0.12), transparent 80%)`,
                }}
            />

            {/* Puntero reactivo personalizado */}
            <div
                className={`pointer-events-none fixed z-50 rounded-full border border-amber-400/80 transition-transform duration-100 ease-out hidden lg:block ${isHovered
                        ? 'w-12 h-12 -translate-x-6 -translate-y-6 bg-amber-400/20 backdrop-blur-[1px]'
                        : 'w-4 h-4 -translate-x-2 -translate-y-2 bg-amber-400/80'
                    }`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    boxShadow: isHovered
                        ? '0 0 20px rgba(245, 158, 11, 0.6)'
                        : '0 0 10px rgba(245, 158, 11, 0.4)',
                }}
            />
        </>
    );
}