'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Hook de alto rendimiento para interpolar el progreso de scroll [0, 1] de un contenedor.
 * Utiliza requestAnimationFrame y un listener pasivo, sin forzar reflows continuos en el hilo principal.
 * Diseñado bajo directrices de Emil Kowalski y High-End UI para transiciones tipo "Fullscreen Grow".
 */
export function useScrollProgress() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let animationFrameId: number;

        const updateScroll = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight || 800;

            // Progreso de 0 a 1 mientras el contenedor se desplaza por el viewport
            // 0 = elemento arriba de la pantalla; 1 = scroll completado hacia abajo
            const totalScrollable = rect.height * 0.75;
            const currentOffset = Math.max(0, -rect.top);
            const rawProgress = Math.min(1, Math.max(0, currentOffset / totalScrollable));

            setProgress((prev) => {
                // Pequeño damping para evitar micro-saltos
                if (Math.abs(prev - rawProgress) < 0.001) return prev;
                return rawProgress;
            });
        };

        const onScroll = () => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(updateScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return { ref, progress };
}

/**
 * Hook para animaciones de entrada progresiva (Scroll Reveal) al entrar en viewport
 */
export function useInView(options: IntersectionObserverInit = { threshold: 0.15 }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(el); // Solo activa una vez para evitar rebotes
            }
        }, options);

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return { ref, isInView };
}
