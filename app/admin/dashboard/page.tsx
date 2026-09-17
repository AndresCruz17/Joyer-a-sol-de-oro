import { createClient } from '@/lib/supabase/server';
import { requireAdminUser } from '@/lib/supabase/auth';
import Link from 'next/link';
import AdminProductTable, { DashboardProductItem } from '@/components/admin/AdminProductTable';


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

    // Cargar total de eventos
    const { count: eventsCount } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true });

    const productList: DashboardProductItem[] = (products as unknown as DashboardProductItem[]) || [];

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-6 md:p-10">

            {/* Encabezado */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-stone-800 gap-4">
                <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                        Panel de Control // Sol de Oro
                    </span>
                    <h1 className="font-serif text-3xl font-light">
                        Gestión de <span className="italic text-amber-400">Inventario</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/eventos"
                        className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-amber-300 text-xs hover:border-amber-500 transition-colors"
                    >
                        Gestión Eventos
                    </Link>
                    <Link
                        href="/admin/categorias"
                        className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-amber-300 text-xs hover:border-amber-500 transition-colors"
                    >
                        Gestión Categorías
                    </Link>
                    <form action="/api/auth/signout" method="post">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 text-xs hover:border-red-500/50 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </header>

            {/* Indicadores */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 my-8">
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Total Productos</div>
                    <div className="text-3xl font-serif text-amber-400">{productList.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Categorías Activas</div>
                    <div className="text-3xl font-serif text-amber-400">{categoriesCount || 0}</div>
                </div>
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Total Eventos</div>
                    <div className="text-3xl font-serif text-amber-400">{eventsCount || 0}</div>
                </div>
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col justify-between">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Acciones Rápidas</div>
                    <div className="flex gap-2 flex-wrap">
                        <Link
                            href="/admin/productos/nuevo"
                            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all"
                        >
                            + Producto
                        </Link>
                        <Link
                            href="/admin/eventos"
                            className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs hover:bg-amber-500/30 transition-all border border-amber-500/30"
                        >
                            + Evento
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabla de Productos con Buscador Interactivo */}
            <AdminProductTable initialProducts={productList} />

        </div>
    );
}