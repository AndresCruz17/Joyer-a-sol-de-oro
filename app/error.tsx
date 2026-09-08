'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registro interno seguro del error sin exponer detalles sensibles en producción
    console.error('Application Error Boundary caught error:', error.digest || error.message);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-amber-500 selection:text-stone-950">
      <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
        <span className="font-serif italic text-2xl text-red-400">!</span>
      </div>

      <span className="text-xs font-mono text-red-400 uppercase tracking-widest block mb-2">
        Error de conexión o servidor
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 font-light mb-4">
        Ocurrió un inconveniente temporal
      </h1>

      <p className="text-sm text-stone-400 max-w-md mb-8 font-light leading-relaxed">
        No hemos podido completar la solicitud. Por favor intenta recargar la sección.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/50 font-mono text-xs transition-all"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
