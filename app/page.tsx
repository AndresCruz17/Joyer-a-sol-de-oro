'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ==========================================
// CONFIGURA AQUÍ TUS DATOS Y REDES SOCIALES
// ==========================================
const CONFIG = {
  phoneWhatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '573000000000',
  facebookUrl: 'https://facebook.com/tu-pagina-facebook', // Cambiar por tu URL de Facebook
  tiktokUrl: 'https://tiktok.com/@tu-usuario-tiktok',    // Cambiar por tu URL de TikTok
  instagramUrl: 'https://instagram.com/tu-usuario-instagram', // Opcional
  address: 'Calle Ficticia # 12-34, Local 101, Centro Comercial El Dorado', // Dirección de tu local
  city: 'Medellín, Colombia',
  googleMapsUrl: 'https://maps.google.com/?q=Sol+de+Oro+Joyeria', // Link directo a Google Maps
};

// Frases para la animación de máquina de escribir
const TYPEWRITER_PHRASES = [
  'Oro de 18 Kilates Certificado',
  'Diseños Exclusivos a Medida',
  'Garantía de por Vida en la Pureza',
  'Elegancia que Trasciende el Tiempo',
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // EFECTO MÁQUINA DE ESCRIBIR
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    const targetPhrase = TYPEWRITER_PHRASES[textIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < targetPhrase.length) {
        setCurrentText(targetPhrase.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (!isDeleting && charIndex === targetPhrase.length) {
        setTimeout(() => setIsDeleting(true), 1800); // Pausa antes de borrar
      } else if (isDeleting && charIndex > 0) {
        setCurrentText(targetPhrase.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  const whatsappHeroUrl = `https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent('Hola Sol de Oro, quisiera solicitar asesoría personalizada sobre sus joyas en Oro 18K.')}`;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 scroll-smooth">

      {/* HALOS DORADOS AMBIENTALES DE FONDO */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* NAVBAR NAVEGACIÓN */}
      <nav className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            <span className="font-serif italic text-2xl font-light tracking-wide text-amber-300">
              Sol de Oro
            </span>
          </Link>

          {/* LINKS DE ESCRITORIO */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-mono tracking-wider text-stone-300 uppercase">
            <a href="#colecciones" className="hover:text-amber-400 transition-colors">Colecciones</a>
            <a href="#destacados" className="hover:text-amber-400 transition-colors">Joyas Fina</a>
            <a href="#personalizados" className="hover:text-amber-400 transition-colors">Personalizados</a>
            <a href="#garantias" className="hover:text-amber-400 transition-colors">Garantía</a>
            <a href="#nosotros" className="hover:text-amber-400 transition-colors">Sobre Nosotros</a>
            <a href="#ubicacion" className="hover:text-amber-400 transition-colors">Ubicación</a>
          </div>

          {/* BOTÓN CATÁLOGO PRINCIPAL & WHATSAPP */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/catalogo"
              className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono hover:bg-amber-500 hover:text-stone-950 transition-all duration-300"
            >
              Ver Catálogo
            </Link>
          </div>

          {/* BOTÓN MENÚ MÓVIL */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-400 hover:text-amber-400 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* MENÚ DESPLEGABLE MÓVIL */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-2 border-t border-stone-800/80 mt-3 flex flex-col gap-3 text-xs font-mono uppercase text-stone-300">
            <a href="#colecciones" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Colecciones</a>
            <a href="#destacados" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Joyería Fina</a>
            <a href="#personalizados" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Personalizados</a>
            <a href="#garantias" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Garantía</a>
            <a href="#nosotros" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Sobre Nosotros</a>
            <a href="#ubicacion" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-amber-400">Ubicación & Contacto</a>
            <Link
              href="/catalogo"
              className="mt-2 text-center py-2.5 rounded-xl bg-amber-500 text-stone-950 font-semibold"
            >
              Ir al Catálogo Completo
            </Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 py-20 sm:py-32 px-6 text-center max-w-5xl mx-auto flex flex-col items-center">

        {/* Insignia Superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Joyeros Artesanales // Colombia
        </div>

        {/* Título Principal */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-stone-100 leading-tight mb-6">
          El Arte de la Expresión en <br />
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
            Oro Nacional 18K
          </span>
        </h1>

        {/* MÁQUINA DE ESCRIBIR */}
        <div className="h-8 flex items-center justify-center mb-8">
          <p className="text-stone-300 font-mono text-sm sm:text-base border-r-2 border-amber-400 pr-1 animate-pulse">
            {currentText}
          </p>
        </div>

        <p className="text-stone-400 text-sm sm:text-base font-light max-w-2xl leading-relaxed mb-10">
          Diseñamos y elaboramos piezas de alta joyería con acabados impecables, oro puro certificado y garantía permanente de por vida.
        </p>

        {/* BOTONES PRINCIPALES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/catalogo"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-semibold text-sm font-mono tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all duration-300 text-center"
          >
            EXPLORAR CATÁLOGO COMPLETO
          </Link>
          <a
            href="#destacados"
            className="px-8 py-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:border-amber-500/60 hover:text-amber-300 font-mono text-sm tracking-wider transition-all duration-300 text-center"
          >
            VER PIEZAS DESTACADAS
          </a>
        </div>
      </section>

      {/* SECCIÓN 1: COLECCIONES RÁPIDAS */}
      <section id="colecciones" className="py-16 px-6 border-t border-stone-800/60 bg-stone-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Categorías</span>
              <h2 className="font-serif text-3xl text-stone-100">Explora por Colección</h2>
            </div>
            <Link href="/catalogo" className="text-xs font-mono text-amber-400 hover:text-amber-300 mt-4 md:mt-0 inline-flex items-center gap-1">
              Ver todas las categorías →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Anillos & Argollas', query: 'anillo' },
              { name: 'Cadenas & Tejidos', query: 'cadena' },
              { name: 'Dijes Exclusivos', query: 'dije' },
              { name: 'Pulseras & Manillas', query: 'pulsera' },
              { name: 'Aretes & Topos', query: 'arete' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={`/catalogo?q=${cat.query}`}
                className="group p-6 rounded-2xl bg-stone-900/50 border border-stone-800/80 hover:border-amber-500/60 hover:bg-stone-900 transition-all text-center flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform mb-3 font-serif">
                  ✦
                </div>
                <h3 className="font-serif text-sm text-stone-200 group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: JOYERÍA FINA / DESTACADOS */}
      <section id="destacados" className="py-20 px-6 border-t border-stone-800/60">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Selección Especial</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-4">Piezas Destacadas</h2>
          <p className="text-stone-400 text-xs sm:text-sm font-light max-w-xl mx-auto">
            Cada pieza refleja la maestría de la orfebrería en oro de 18 kilates.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Anillos de Compromiso & Matrimonio',
              desc: 'Diseñados para sellar momentos inolvidables en oro amarillo, blanco o rosado 18K.',
              badge: 'Edición Especial',
            },
            {
              title: 'Cadenas con Tejidos Especiales',
              desc: 'Tejido Chino, Cubano, Carti, 3x1 y más. Solidez y brillo incomparable.',
              badge: 'Alta Demanda',
            },
            {
              title: 'Dijes y Medallas Personalizadas',
              desc: 'Grabados láser de alta precisión y engaste de piedras preciosas.',
              badge: 'Hecho a Mano',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-amber-500/60 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                  {item.badge}
                </span>
                <h3 className="font-serif text-2xl text-stone-100 mt-6 mb-3 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-stone-400 text-xs font-light leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <Link
                href="/catalogo"
                className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-2 pt-4 border-t border-stone-800/60"
              >
                Ver disponibilidad en catálogo →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: DISEÑOS PERSONALIZADOS */}
      <section id="personalizados" className="py-20 px-6 border-t border-stone-800/60 bg-gradient-to-b from-stone-900/40 to-stone-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Servicio Bespoke</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-6">
              ¿Tienes una idea en mente? <br />
              <span className="italic text-amber-400">La fabricamos en Oro 18K</span>
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm font-light leading-relaxed mb-6">
              Si buscas un diseño único que no encuentras en catálogo, nuestros orfebres materializan tu idea. Envíanos una foto, boceto o referencia y te cotizamos de inmediato.
            </p>

            <ul className="space-y-3 text-xs font-mono text-stone-300 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Selección de gramaje y color de oro
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Asesoría personalizada en presupuesto
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">✓</span> Render o muestra antes de fundición
              </li>
            </ul>

            <a
              href={`https://wa.me/${CONFIG.phoneWhatsapp}?text=${encodeURIComponent('Hola, me gustaría cotizar un diseño personalizado en Oro 18K')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs font-mono hover:bg-amber-400 transition-all"
            >
              <span>Diseñar mi Joya por WhatsApp</span>
              <span>→</span>
            </a>
          </div>

          <div className="p-8 rounded-3xl bg-stone-900/80 border border-stone-800 text-center relative overflow-hidden">
            <div className="text-amber-400 text-4xl mb-4">💎</div>
            <h3 className="font-serif text-xl text-stone-200 mb-2">Compromiso & Calidad</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed mb-6">
              Fabricación 100% colombiana respaldada por joyeros con décadas de tradición.
            </p>
            <div className="inline-block bg-stone-950 px-4 py-2 rounded-xl border border-stone-800 text-[11px] font-mono text-amber-300">
              Entrega Segura & Certificado Incluido
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: GARANTÍAS Y RESPALDO */}
      <section id="garantias" className="py-20 px-6 border-t border-stone-800/60">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Tranquilidad Total</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100">Nuestras Garantías</h2>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '📜',
              title: 'Oro 18K Certificado',
              desc: 'Certificamos la pureza exacta del metal (750 milésimas) en cada joya.',
            },
            {
              icon: '♾️',
              title: 'Garantía Permanente',
              desc: 'Garantía de por vida respecto al material y pureza del oro.',
            },
            {
              icon: '🚚',
              title: 'Envíos Asegurados',
              desc: 'Despachos con seguro de transporte a nivel nacional.',
            },
            {
              icon: '✨',
              title: 'Mantenimiento',
              desc: 'Servicio de limpieza y brillado para conservar el esplendor de tus piezas.',
            },
          ].map((g, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-stone-900/30 border border-stone-800 text-center">
              <div className="text-3xl mb-3">{g.icon}</div>
              <h3 className="font-serif text-lg text-stone-200 mb-2">{g.title}</h3>
              <p className="text-xs text-stone-400 font-light leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5: SOBRE NOSOTROS */}
      <section id="nosotros" className="py-20 px-6 border-t border-stone-800/60 bg-stone-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Nuestra Historia</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-100 mb-6">Sobre Sol de Oro</h2>
          <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed mb-6">
            En <span className="text-amber-300 font-normal">Sol de Oro</span> nacimos con la pasión de transformar el metal más preciado del mundo en legados familiares. Creemos que una joya no es solo un accesorio, sino un símbolo de logros, amor y momentos memorables.
          </p>
          <p className="text-stone-400 text-xs sm:text-sm font-light leading-relaxed">
            Trabajamos exclusivamente con Oro Ley 750 (18 Kilates), fusionando técnicas tradicionales de orfebrería con acabados contemporáneos de máxima calidad.
          </p>
        </div>
      </section>

      {/* SECCIÓN 6: UBICACIÓN Y REDES SOCIALES */}
      <section id="ubicacion" className="py-20 px-6 border-t border-stone-800/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Tarjeta de Ubicación */}
          <div className="p-8 rounded-3xl bg-stone-900/60 border border-stone-800">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Visítanos en Persona</span>
            <h2 className="font-serif text-3xl text-stone-100 mb-4">Nuestro Local Fisico</h2>
            <p className="text-stone-400 text-xs sm:text-sm font-light mb-6">
              Te invitamos a conocer nuestras colecciones en vivo, probar el peso de las joyas y recibir atención personalizada.
            </p>

            <div className="space-y-4 text-xs font-mono text-stone-300 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-base">📍</span>
                <div>
                  <strong className="block text-stone-100">Dirección:</strong>
                  <span>{CONFIG.address}</span>
                  <span className="block text-stone-500">{CONFIG.city}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-base">📱</span>
                <div>
                  <strong className="block text-stone-100">Atención WhatsApp:</strong>
                  <span>+{CONFIG.phoneWhatsapp}</span>
                </div>
              </div>
            </div>

            <a
              href={CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-xs hover:bg-amber-500 hover:text-stone-950 transition-all font-semibold"
            >
              <span>🗺️ Abrir en Google Maps (Cómo llegar)</span>
            </a>
          </div>

          {/* Tarjeta de Redes Sociales */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-2">Comunidad</span>
            <h2 className="font-serif text-3xl text-stone-100 mb-4">Síguenos en Redes</h2>
            <p className="text-stone-400 text-xs sm:text-sm font-light mb-8">
              Descubre vídeos en vivo, nuevos ingresos diarios y testimonios de nuestros clientes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* WhatsApp */}
              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-emerald-500/60 hover:text-emerald-400 text-center transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💬</div>
                <div className="font-mono text-xs font-semibold">WhatsApp</div>
                <div className="text-[10px] text-stone-500 font-mono">Chat Directo</div>
              </a>

              {/* Facebook */}
              <a
                href={CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-blue-500/60 hover:text-blue-400 text-center transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📘</div>
                <div className="font-mono text-xs font-semibold">Facebook</div>
                <div className="text-[10px] text-stone-500 font-mono">Página Oficial</div>
              </a>

              {/* TikTok */}
              <a
                href={CONFIG.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-pink-500/60 hover:text-pink-400 text-center transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎵</div>
                <div className="font-mono text-xs font-semibold">TikTok</div>
                <div className="text-[10px] text-stone-500 font-mono">Vídeos & Joyas</div>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-900 bg-stone-950 py-12 text-stone-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-serif text-lg text-amber-300">
            Sol de Oro
          </Link>

          <p>© {new Date().getFullYear()} Sol de Oro Joyería. Todos los derechos reservados.</p>

          <a
            href={whatsappHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-400 hover:text-amber-400 font-mono"
          >
            Contacto WhatsApp
          </a>
        </div>
      </footer>

    </div>
  );
}