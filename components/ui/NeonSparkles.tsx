'use client';

import React from 'react';

interface Sparkle {
    id: number;
    top: string;
    left: string;
    size: number;
    delay: string;
    duration: string;
    symbol: string;
}

const SPARKLES: Sparkle[] = [
    { id: 1, top: '15%', left: '10%', size: 14, delay: '0s', duration: '2.8s', symbol: '✦' },
    { id: 2, top: '25%', left: '85%', size: 18, delay: '1.2s', duration: '3.4s', symbol: '✦' },
    { id: 3, top: '45%', left: '18%', size: 10, delay: '2s', duration: '3s', symbol: '✧' },
    { id: 4, top: '60%', left: '80%', size: 16, delay: '0.6s', duration: '2.6s', symbol: '✦' },
    { id: 5, top: '75%', left: '12%', size: 12, delay: '1.8s', duration: '3.8s', symbol: '✧' },
    { id: 6, top: '80%', left: '90%', size: 15, delay: '2.4s', duration: '3.2s', symbol: '✦' },
    { id: 7, top: '35%', left: '48%', size: 12, delay: '1.5s', duration: '4s', symbol: '✦' },
    { id: 8, top: '10%', left: '70%', size: 10, delay: '0.8s', duration: '3s', symbol: '✧' },
];

export default function NeonSparkles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
            {SPARKLES.map((s) => (
                <div
                    key={s.id}
                    className="absolute text-amber-300 animate-sparkle select-none"
                    style={{
                        top: s.top,
                        left: s.left,
                        fontSize: `${s.size}px`,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                    }}
                >
                    {s.symbol}
                </div>
            ))}
        </div>
    );
}
