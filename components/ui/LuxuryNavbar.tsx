'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/config';

interface NavItem {
    label: string;
    href: string;
    sectionId?: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Colecciones', href: '/#colecciones', sectionId: 'colecciones' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Cotizador 18K', href: '/#cotizador', sectionId: 'cotizador' },
    { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { label: 'Ubicación', href: '/#ubicacion', sectionId: 'ubicacion' },
];

export default function LuxuryNavbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Bloquear scroll al abrir menú móvil
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Cerrar menú con tecla ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isHome = pathname === '/';

    const getLinkHref = (item: NavItem) => {
        if (item.sectionId && isHome) {
            return `#${item.sectionId}`;
        }
        return item.href;
    };

    const isLinkActive = (item: NavItem) => {
        if (item.href === '/catalogo' && pathname.startsWith('/catalogo')) return true;
        if (item.href === '/sobre-nosotros' && pathname === '/sobre-nosotros') return true;
        return false;
    };

    const whatsappNavUrl = getWhatsAppUrl(
        'Hola *Sol de Oro*, deseo consultar la tasa del día de Oro 18K y recibir asesoría personalizada.'
    );

    return (
        <>
            {/* UNIFIED SLIM FLOATING GLASS NAVBAR */}
            <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none transition-all duration-300">
                <div
                    className={`max-w-5xl mx-auto pointer-events-auto h-12 sm:h-14 px-4 sm:px-6 rounded-full border transition-all duration-300 flex items-center justify-between ${
                        scrolled
                            ? 'bg-stone-950/80 border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-2xl'
                            : 'bg-stone-900/50 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl'
                    }`}
                >
                    {/* MARCA / LOGO MINIMALISTA */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group shrink-0"
                    >
                        {SITE_CONFIG.logoUrl && (
                            <img
                                src={SITE_CONFIG.logoUrl}
                                alt="Sol de Oro"
                                className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                        )}
                        <span className="font-serif italic text-base sm:text-lg font-normal tracking-wider text-amber-200 group-hover:text-amber-100 transition-colors">
                            {SITE_CONFIG.shortName}
                        </span>
                    </Link>

                    {/* ENLACES CENTRALES ESBELTOS & ESPACIOSOS (INCLUYE UBICACIÓN) */}
                    <nav
                        aria-label="Navegación Principal"
                        className="hidden md:flex items-center gap-6 lg:gap-8 text-[11px] font-sans tracking-[0.2em] uppercase font-light text-stone-300"
                    >
                        {NAV_ITEMS.map((item) => {
                            const active = isLinkActive(item);
                            return (
                                <Link
                                    key={item.label}
                                    href={getLinkHref(item)}
                                    className={`relative py-1 transition-colors hover:text-amber-200 ${
                                        active ? 'text-amber-300 font-medium' : 'text-stone-300'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    {active && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ACCIÓN DERECHA LIGERA & TOGGLE MÓVIL */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <Link
                            href={isHome ? '#cotizador' : '/#cotizador'}
                            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-sans tracking-widest uppercase transition-all active:scale-[0.97]"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Tasa 18K</span>
                        </Link>

                        {/* Botón Móvil Minimalista */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-stone-300 hover:text-amber-300 transition-colors active:scale-95 focus:outline-none"
                            aria-label="Abrir menú de navegación"
                        >
                            <div className="w-5 h-3.5 flex flex-col justify-between items-end">
                                <span className="h-[1.5px] w-5 bg-current rounded-full" />
                                <span className="h-[1.5px] w-3.5 bg-current rounded-full" />
                                <span className="h-[1.5px] w-4.5 bg-current rounded-full" />
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* MENÚ MÓVIL MODERNO & REFINADO (GLASS MODAL OVERLAY) */}
            {mobileMenuOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú de Navegación"
                    className="fixed inset-0 z-50 md:hidden flex flex-col justify-between bg-stone-950/95 backdrop-blur-3xl p-6 sm:p-8 animate-fadeIn overflow-y-auto"
                >
                    {/* Luz ambiental sutil */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 blur-[130px] pointer-events-none -z-10" />

                    {/* 1. Header del Menú Móvil */}
                    <div>
                        <div className="flex items-center justify-between pb-6 border-b border-white/10">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5"
                            >
                                {SITE_CONFIG.logoUrl && (
                                    <img
                                        src={SITE_CONFIG.logoUrl}
                                        alt="Sol de Oro"
                                        className="h-7 w-auto object-contain"
                                    />
                                )}
                                <span className="font-serif italic text-lg text-amber-200 tracking-wider">
                                    {SITE_CONFIG.shortName}
                                </span>
                            </Link>

                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/40 flex items-center justify-center text-stone-300 hover:text-amber-300 text-sm active:scale-95 transition-all"
                                aria-label="Cerrar menú"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 2. Tarjeta Tasa del Día en Vivo */}
                        <div className="my-5">
                            <Link
                                href={isHome ? '#cotizador' : '/#cotizador'}
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 flex items-center justify-between transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                                    <div>
                                        <span className="text-[11px] font-sans font-medium text-stone-100 block">
                                            Oro 18K Ley 750
                                        </span>
                                        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                                            Tasa de Cotización en Vivo
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-amber-300 group-hover:translate-x-1 transition-transform">
                                    Cotizar →
                                </span>
                            </Link>
                        </div>

                        {/* 3. Lista Limpia de Enlaces (Sin números gigantes ni estética vikinga) */}
                        <nav className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.label}
                                    href={getLinkHref(item)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="py-3 px-3.5 rounded-xl hover:bg-white/[0.04] transition-all flex items-center justify-between text-stone-200 hover:text-amber-300 group"
                                >
                                    <span className="text-base font-sans font-light tracking-wide">
                                        {item.label}
                                    </span>
                                    <span className="text-stone-600 group-hover:text-amber-300 text-xs transition-colors">
                                        →
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 4. Footer del Menú: Ubicación, Redes & WhatsApp Concierge */}
                    <div className="pt-6 border-t border-white/10 space-y-4 mt-6">
                        <div className="flex items-start gap-2.5 text-xs text-stone-400 font-sans font-light">
                            <span className="text-amber-400 text-sm">📍</span>
                            <div>
                                <span className="text-stone-200 font-medium block">{SITE_CONFIG.address}</span>
                                <span>{SITE_CONFIG.city}</span>
                            </div>
                        </div>

                        <a
                            href={whatsappNavUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-sans text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-center shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        >
                            <span>Atención Directa por WhatsApp</span>
                            <span>→</span>
                        </a>

                        {/* Micro Redes Sociales */}
                        <div className="flex items-center justify-center gap-6 pt-1 text-[11px] text-stone-400 font-sans">
                            <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                                Instagram
                            </a>
                            <span className="text-stone-700">•</span>
                            <a href={SITE_CONFIG.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                                Facebook
                            </a>
                            <span className="text-stone-700">•</span>
                            <a href={SITE_CONFIG.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                                TikTok
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
