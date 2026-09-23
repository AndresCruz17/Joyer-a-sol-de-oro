import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-amber-500 selection:text-stone-950 relative overflow-hidden">
      {/* Luz ambiental */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-md w-full p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
        <div className="rounded-2xl p-8 sm:p-10 bg-stone-950/70 border border-white/5 space-y-6">
          
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <span className="font-serif italic text-2xl text-amber-300">404</span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-medium">
              <span>Pieza no localizada</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 tracking-tight">
              Joya o Sección <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">No Disponible</span>
            </h1>

            <p className="text-xs text-stone-400 font-sans font-light leading-relaxed">
              La pieza o dirección consultada ha sido trasladada a una nueva colección o no forma parte de nuestra vitrina actual.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Volver al Inicio</span>
              <span>→</span>
            </Link>
            <Link
              href="/catalogo"
              className="flex-1 py-3.5 px-5 rounded-2xl bg-stone-900/60 border border-white/10 text-stone-300 hover:text-amber-300 hover:border-amber-400/40 text-xs font-sans uppercase tracking-wider transition-all flex items-center justify-center"
            >
              Explorar Catálogo
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
