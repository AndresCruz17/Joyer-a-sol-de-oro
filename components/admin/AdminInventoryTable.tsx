'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export interface DashboardProductItem {
    id: string;
    name: string;
    price: number | null;
    weight_grams: number | null;
    image_url: string | null;
    images: string[] | null;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    categories: { name: string } | { name: string }[] | null;
}

interface AdminInventoryTableProps {
    products: DashboardProductItem[];
}

export default function AdminInventoryTable({ products }: AdminInventoryTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'featured' | 'active'>('all');

    // Extraer lista única de categorías para el selector
    const categoryOptions = useMemo(() => {
        const set = new Set<string>();
        products.forEach((p) => {
            const catName = Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name;
            if (catName) set.add(catName);
        });
        return Array.from(set).sort();
    }, [products]);

    // Filtrado en tiempo real
    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            const catName = (Array.isArray(item.categories) ? item.categories[0]?.name : item.categories?.name) || 'Sin categoría';

            // Filtro de búsqueda
            const q = searchQuery.toLowerCase().trim();
            const matchesQuery = !q || item.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q);

            // Filtro de categoría
            const matchesCategory = filterCategory === 'all' || catName === filterCategory;

            // Filtro de estado
            let matchesStatus = true;
            if (filterStatus === 'featured') matchesStatus = item.is_featured === true;
            if (filterStatus === 'active') matchesStatus = item.is_active === true;

            return matchesQuery && matchesCategory && matchesStatus;
        });
    }, [products, searchQuery, filterCategory, filterStatus]);

    return (
        <div className="space-y-6">
            {/* BARRA DE HERRAMIENTAS Y BÚSQUEDA EN TIEMPO REAL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/50 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Buscador */}
                <div className="relative w-full md:w-96">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-xs">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar joya por nombre o categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-stone-950/80 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filtros de Estado & Categoría */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">

                    {/* Selector de Categoría */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-stone-950/80 border border-white/10 rounded-full px-4 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-400/60 transition-colors cursor-pointer"
                    >
                        <option value="all">Todas las Categorías</option>
                        {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Filtro Rápido: Todos */}
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all active:scale-[0.98] ${
                            filterStatus === 'all'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                                : 'bg-stone-950/60 text-stone-400 border border-white/5 hover:border-white/15'
                        }`}
                    >
                        Todos ({products.length})
                    </button>

                    {/* Filtro Rápido: Solo Destacados */}
                    <button
                        onClick={() => setFilterStatus('featured')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex items-center gap-1.5 active:scale-[0.98] ${
                            filterStatus === 'featured'
                                ? 'bg-amber-400 text-stone-950 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                : 'bg-stone-950/60 text-stone-400 border border-white/5 hover:border-amber-400/30'
                        }`}
                    >
                        <span>✦</span>
                        <span>Destacados</span>
                    </button>

                    {/* Contador de resultados */}
                    <span className="text-[11px] font-mono text-stone-500 ml-1 hidden lg:inline-block">
                        {filteredProducts.length} de {products.length} joyas
                    </span>
                </div>
            </div>

            {/* TABLA DE INVENTARIO CON ESTILO ATELIER */}
            <div className="rounded-3xl bg-stone-900/40 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
                {filteredProducts.length === 0 ? (
                    <div className="p-16 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-stone-500 text-lg mx-auto">
                            💎
                        </div>
                        <h3 className="font-serif text-lg text-stone-200">No se encontraron piezas</h3>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                            No hay joyas registradas que coincidan con los criterios de búsqueda o filtros seleccionados.
                        </p>
                        {(searchQuery || filterCategory !== 'all' || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterCategory('all');
                                    setFilterStatus('all');
                                }}
                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs hover:bg-white/10 transition-colors"
                            >
                                Restablecer Filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-950/80 text-stone-400 uppercase font-mono tracking-widest border-b border-white/10 text-[10px]">
                                <tr>
                                    <th className="p-4 pl-6">Pieza</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4">Peso (g)</th>
                                    <th className="p-4">Precio (COP)</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4 pr-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-stone-300">
                                {filteredProducts.map((item) => {
                                    const categoryName = (Array.isArray(item.categories)
                                        ? item.categories[0]?.name
                                        : item.categories?.name) || 'Sin categoría';

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* Imagen y Nombre */}
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-950 border border-white/10 shrink-0">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-stone-600">
                                                                Sin foto
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-serif text-sm text-stone-100 group-hover:text-amber-300 transition-colors block">
                                                            {item.name}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-stone-500">
                                                            ID: {item.id.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Categoría */}
                                            <td className="p-4">
                                                <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-stone-300 font-sans">
                                                    {categoryName}
                                                </span>
                                            </td>

                                            {/* Peso */}
                                            <td className="p-4 font-mono text-stone-300">
                                                {item.weight_grams ? (
                                                    <span className="text-amber-300/90 font-medium">
                                                        {item.weight_grams}g
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-600">—</span>
                                                )}
                                            </td>

                                            {/* Precio */}
                                            <td className="p-4 font-mono font-medium">
                                                {item.price ? (
                                                    <span className="text-stone-100">
                                                        ${item.price.toLocaleString('es-CO')}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-600">A consultar</span>
                                                )}
                                            </td>

                                            {/* Estado (Destacada / Activa) */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {item.is_featured && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                                                            <span>✦</span> Destacada
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                                            item.is_active
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-stone-800 text-stone-500 border border-white/5'
                                                        }`}
                                                    >
                                                        <span className={`w-1 h-1 rounded-full ${item.is_active ? 'bg-emerald-400' : 'bg-stone-500'}`} />
                                                        {item.is_active ? 'Activa' : 'Oculta'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Acciones */}
                                            <td className="p-4 pr-6 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/productos/editar/${item.id}`}
                                                        className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-amber-300 bg-stone-900/60 transition-all active:scale-[0.97]"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <DeleteProductButton
                                                        id={item.id}
                                                        name={item.name}
                                                        imageUrl={item.image_url}
                                                        images={item.images}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
