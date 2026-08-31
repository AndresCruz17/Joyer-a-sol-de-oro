import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Verificar sesión activa
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/admin/login');
    }

    // Cargar lista de productos actuales
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

    const productList = products || [];

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-6 md:p-10">

            {/* Encabezado del Dashboard */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-stone-800 gap-4">
                <div>
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                        Panel de Control // Sol de Oro
                    </span>
                    <h1 className="font-serif text-3xl font-light">
                        Gestión de <span className="italic text-amber-400">Inventario</span>
                    </h1>
                </div>

                <form action="/api/auth/signout" method="post">
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 text-xs hover:border-red-500/50 hover:text-red-400 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </form>
            </header>

            {/* Resumen e Indicadores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Total Productos</div>
                    <div className="text-3xl font-serif text-amber-400">{productList.length}</div>
                </div>
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Estado Oro</div>
                    <div className="text-3xl font-serif text-emerald-400">18K Certificado</div>
                </div>
                <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="text-xs font-mono text-stone-400 uppercase mb-2">Acción Rápida</div>
                    <a
                        href="/admin/productos/nuevo"
                        className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all"
                    >
                        + Nuevo Producto
                    </a>
                </div>
            </div>

            {/* Tabla de Productos */}
            <section className="rounded-2xl bg-stone-900/40 border border-stone-800 overflow-hidden">
                <div className="p-6 border-b border-stone-800">
                    <h2 className="font-serif text-xl">Catálogo Actual</h2>
                </div>

                {productList.length === 0 ? (
                    <div className="p-12 text-center text-stone-500 text-sm">
                        No hay productos registrados en la base de datos.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-900/80 text-stone-400 uppercase font-mono tracking-wider">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4">Precio</th>
                                    <th className="p-4">Peso (g)</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800/60 text-stone-300">
                                {productList.map((item) => (
                                    <tr key={item.id} className="hover:bg-stone-900/50 transition-colors">
                                        <td className="p-4 font-semibold text-stone-100">{item.name}</td>
                                        <td className="p-4">{item.categories?.name || 'Sin categoría'}</td>
                                        <td className="p-4 text-amber-400 font-mono">${item.price?.toLocaleString('es-CO')}</td>
                                        <td className="p-4 font-mono">{item.weight_grams ? `${item.weight_grams}g` : 'N/A'}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button className="px-3 py-1 rounded border border-stone-700 hover:border-amber-500 hover:text-amber-300 transition-colors">
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </div>
    );
}