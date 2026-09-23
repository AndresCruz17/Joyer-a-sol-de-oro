'use client';

import React, { useMemo } from 'react';

interface Particle {
    id: number;
    left: number;
    top: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
    blur: number;
    color: string;
}

export default function GoldDustParticles({ count = 35 }: { count?: number }) {
    // Generar posiciones estables usando useMemo
    const particles = useMemo<Particle[]>(() => {
        const colors = [
            '#fbbf24', // Amber 400 (Oro 18K)
            '#fde047', // Yellow 300 (Oro Brillante)
            '#f59e0b', // Amber 500 (Oro Cálido)
            '#fef08a', // Yellow 200 (Reflejo Blanco-Oro)
        ];

        return Array.from({ length: count }, (_, i) => {
            // Generador pseudo-aleatorio determinista para evitar desajustes de hidratación
            const seed = (i * 9301 + 49297) % 233280;
            const seed2 = (seed * 9301 + 49297) % 233280;
            const seed3 = (seed2 * 9301 + 49297) % 233280;

            const left = (seed / 233280) * 100;
            const top = (seed2 / 233280) * 100;
            const size = 1 + (seed3 % 2.5); // 1px a 3.5px
            const opacity = 0.25 + ((seed % 50) / 100); // 0.25 a 0.75
            const duration = 6 + (seed % 8); // 6s a 14s
            const delay = (seed2 % 7); // 0s a 7s
            const blur = size > 2.5 ? 0.8 : 0; // Efecto bokeh de profundidad
            const color = colors[i % colors.length];

            return {
                id: i,
                left,
                top,
                size,
                opacity,
                duration,
                delay,
                blur,
                color,
            };
        });
    }, [count]);

    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        >
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full animate-gold-dust"
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        opacity: p.opacity,
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        filter: p.blur > 0 ? `blur(${p.blur}px)` : 'none',
                        animationDuration: `${p.duration}s`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
