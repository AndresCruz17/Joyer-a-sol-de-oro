'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  id?: string;
}

/**
 * Componente de Scroll Reveal Reutilizable de Alta Eficiencia (FadeIn)
 * Aplica una transición suave de entrada (opacity 0 -> 1, y 20 -> 0)
 * activada una única vez al entrar en el viewport (viewport: { once: true }).
 * Soporta de forma nativa la preferencia 'prefers-reduced-motion'.
 */
export default function FadeIn({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  y = 20,
  id,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y }
      }
      whileInView={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay,
        ease: [0.23, 1, 0.32, 1], // Curva de aceleración orfebre de lujo
      }}
    >
      {children}
    </motion.div>
  );
}
