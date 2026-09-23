import { createClient } from '@/lib/supabase/server';
import { requireAdminUser } from '@/lib/supabase/auth';
import Link from 'next/link';
import AdminInventoryTable, { DashboardProductItem } from '@/components/admin/AdminInventoryTable';

export default async function AdminDashboardPage() {
    // 1. Exigir autenticación y rol de administrador en base de datos
    await requireAdminUser();

    const supabase = await createClient();

    // Cargar lista completa de productos (activos e inactivos para gestión de admin)
    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, weight_grams, image_url, images, is_active, is_featured, created_at, categories(name)')
        .order('created_at', { ascending: false });

    // Cargar total de categorías
    const { count: categoriesCount } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true });

    const productList: DashboardProductItem[] = (products as unknown as DashboardProductItem[]) || [];

    // Métricas calculadas
    const totalFeatured = productList.filter((p) => p.is_featured).length;
    const totalActive = productList.filter((p) => p.is_active).length;

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-5 sm:p-8 lg:p-12 relative overflow-hidden">
            {/* LUZ AMBIENTAL DE FONDO */}
            <div className="absolute top-0 left-1/3 w-[600px] h-[350px] bg-amber-500/5 blur-[150px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto space-y-10">

                {/* CABECERA DE MANDO ORFEBRE (ATELIER CONSOLE HEADER) */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between pb-8 border-b border-white/10 gap-6">
                    <div className="space-y-2">
                        {/* Eyebrow Hallmark con baliza de estado */}
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono uppercase tracking-widest backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                            <span>Sesión Autenticada // Sol de Oro Ley 750</span>
                        </div>

                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-100 tracking-tight">
                            Consola de <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">Inventario</span>
                        </h1>

                        <p className="text-stone-400 text-xs sm:text-sm font-sans font-light">
                            Gestión central de joyas, avalúos, escaparate destacado y colecciones de la casa.
                        </p>
                    </div>

                    {/* Toolbar de Navegación Rápida */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/40 bg-stone-900/60 text-stone-300 hover:text-amber-300 text-xs font-sans tracking-wider uppercase transition-all backdrop-blur-xl flex items-center gap-2 active:scale-[0.98]"
                        >
                            <span>Ver Tienda</span>
                            <span className="text-[10px]">↗</span>
                        </Link>

                        <Link
                            href="/admin/categorias"
                            className="px-4 py-2 rounded-full border border-amber-500/30 hover:border-amber-400 bg-amber-500/10 text-amber-300 text-xs font-sans tracking-wider uppercase transition-all backdrop-blur-xl flex items-center gap-2 active:scale-[0.98]"
                        >
                            <span>Gestión de Categorías</span>
                        </Link>

                        <form action="/api/auth/signout" method="post">
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-full border border-white/10 hover:border-red-500/50 bg-stone-900/60 text-stone-400 hover:text-red-400 text-xs font-sans tracking-wider uppercase transition-all backdrop-blur-xl cursor-pointer active:scale-[0.98]"
                            >
                                Salir
                            </button>
                        </form>
                    </div>
                </header>

                {/* TARJETAS DE MÉTRICAS KPI (GLASS CONSOLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* KPI 1: Total Piezas */}
                    <div className="p-6 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-amber-400/30 transition-colors">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-400">
                            <span>Piezas Totales</span>
                            <span className="text-amber-400">💎</span>
                        </div>
                        <div className="font-serif text-3xl sm:text-4xl text-stone-100 font-light">
                            {productList.length}
                        </div>
                        <div className="text-[11px] font-sans text-stone-400">
                            <span className="text-emerald-400 font-medium">{totalActive}</span> joyas activas en catálogo
                        </div>
                    </div>

                    {/* KPI 2: Joyas Destacadas */}
                    <div className="p-6 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-amber-400/30 transition-colors">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-400">
                            <span>Destacadas en Home</span>
                            <span className="text-amber-400">✦</span>
                        </div>
                        <div className="font-serif text-3xl sm:text-4xl text-amber-300 font-light">
                            {totalFeatured}
                        </div>
                        <div className="text-[11px] font-sans text-stone-400">
                            Exhibidas en escaparate principal
                        </div>
                    </div>

                    {/* KPI 3: Categorías Activas */}
                    <div className="p-6 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-amber-400/30 transition-colors">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-400">
                            <span>Colecciones</span>
                            <span className="text-amber-400">◈</span>
                        </div>
                        <div className="font-serif text-3xl sm:text-4xl text-stone-100 font-light">
                            {categoriesCount || 0}
                        </div>
                        <div className="text-[11px] font-sans text-stone-400">
                            Líneas orfebres registradas
                        </div>
                    </div>

                    {/* KPI 4 / CTA Rápido: Agregar Nueva Joya */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-stone-900/40 border border-amber-500/30 backdrop-blur-xl flex flex-col justify-between space-y-4">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-medium">
                            Acción de Taller
                        </div>
                        <div className="text-xs text-stone-300 font-sans leading-relaxed">
                            Carga una nueva pieza con optimización automática a WebP.
                        </div>
                        <Link
                            href="/admin/productos/nuevo"
                            className="relative overflow-hidden w-full py-3 px-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-[0.98] text-center"
                        >
                            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-liquid-sweep" />
                            <span className="relative z-10">+ Nueva Joya</span>
                            <span className="relative z-10">→</span>
                        </Link>
                    </div>

                </div>

                {/* TABLA INTERACTIVA DE INVENTARIO */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-serif text-2xl font-light text-stone-100">
                                Catálogo Registrado
                            </h2>
                            <p className="text-xs text-stone-400 font-sans">
                                Modifica precios, imágenes, peso en gramos o visibilidad en tiempo real.
                            </p>
                        </div>
                    </div>

                    <AdminInventoryTable products={productList} />
                </section>

            </div>
        </div>
    );
}