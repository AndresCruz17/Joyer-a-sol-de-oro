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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden">
      {/* Luz ambiental */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-500/10 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-md w-full p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
        <div className="rounded-2xl p-8 sm:p-10 bg-stone-950/70 border border-white/5 space-y-6">

          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <span className="font-serif italic text-2xl text-red-400">!</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] uppercase tracking-[0.2em] font-medium">
              <span>Interrupción de señal</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 tracking-tight">
              Inconveniente <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-amber-300 to-amber-500">Temporal</span>
            </h1>

            <p className="text-xs text-stone-400 font-sans font-light leading-relaxed">
              No hemos podido sincronizar con la bóveda en este instante. Puedes reintentar la acción o volver al inicio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>Reintentar</span>
              <span>↻</span>
            </button>
            <Link
              href="/"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-stone-900/60 border border-white/10 text-stone-300 hover:text-amber-300 hover:border-amber-400/40 text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center"
            >
              Volver al Inicio
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
