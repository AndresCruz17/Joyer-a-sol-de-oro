import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-amber-500 selection:text-stone-950">
      <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        <span className="font-serif italic text-2xl text-amber-400">404</span>
      </div>

      <span className="text-xs font-display text-amber-400 uppercase tracking-widest block mb-2">
        Página no encontrada
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl text-stone-100 font-light tracking-widest mb-4">
        Pieza o sección no disponible
      </h1>

      <p className="text-sm text-stone-400 font-sans max-w-md mb-8 font-light leading-relaxed">
        La joya o dirección que buscas ha sido trasladada o no forma parte de nuestra colección actual.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          Volver al Inicio
        </Link>
        <Link
          href="/catalogo"
          className="px-6 py-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-500/50 font-display text-xs uppercase tracking-wider transition-all"
        >
          Explorar Catálogo
        </Link>
      </div>
    </div>
  );
}
