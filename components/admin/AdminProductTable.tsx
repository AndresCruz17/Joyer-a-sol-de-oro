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

interface Props {
    initialProducts: DashboardProductItem[];
}

export default function AdminProductTable({ initialProducts }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return initialProducts;
        const query = searchQuery.toLowerCase().trim();
        return initialProducts.filter((item) => {
            const categoryName = (Array.isArray(item.categories)
                ? item.categories[0]?.name
                : item.categories?.name) || '';
            return (
                item.name.toLowerCase().includes(query) ||
                categoryName.toLowerCase().includes(query)
            );
        });
    }, [initialProducts, searchQuery]);

    return (
        <section className="rounded-2xl bg-stone-900/40 border border-stone-800/80 overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Cabecera con Buscador de Vidrio Líquido */}
            <div className="p-5 sm:p-6 border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-xl text-stone-100 flex items-center gap-2">
                        <span>Catálogo Registrado</span>
                        <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'joya' : 'joyas'}
                        </span>
                    </h2>
                    <p className="text-xs text-stone-400 font-sans mt-0.5">
                        Administra, edita o retira piezas de la vitrina digital
                    </p>
                </div>

                {/* Caja de Búsqueda Glass */}
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Buscar joya o categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input pl-9 pr-9 text-xs"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs pointer-events-none">
                        🔍
                    </span>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300 text-xs cursor-pointer transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {initialProducts.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-sm">
                    No hay productos registrados en la base de datos.
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-stone-400 text-sm">
                    No se encontraron joyas que coincidan con &quot;<span className="text-amber-400 font-mono">{searchQuery}</span>&quot;.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-900/80 text-stone-400 uppercase font-mono tracking-wider border-b border-stone-800">
                            <tr>
                                <th className="p-4">Imagen</th>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4">Peso</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/60 text-stone-300">
                            {filteredProducts.map((item) => {
                                const categoryName = (Array.isArray(item.categories)
                                    ? item.categories[0]?.name
                                    : item.categories?.name) || 'Sin categoría';

                                return (
                                    <tr key={item.id} className="hover:bg-stone-900/60 transition-colors">
                                        <td className="p-4">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-11 h-11 object-cover rounded-xl border border-stone-800 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-center text-[9px] text-stone-600">
                                                    N/A
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold text-stone-100 block text-sm">{item.name}</span>
                                            {item.is_featured && (
                                                <span className="inline-block mt-0.5 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    ★ Destacado
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-stone-400">{categoryName}</td>
                                        <td className="p-4 text-amber-400 font-mono font-medium">
                                            {item.price != null ? `$${item.price.toLocaleString('es-CO')}` : 'Consultar'}
                                        </td>
                                        <td className="p-4 font-mono text-stone-400">
                                            {item.weight_grams ? `${item.weight_grams}g` : '—'}
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <Link
                                                href={`/admin/productos/editar/${item.id}`}
                                                className="inline-block px-3 py-1.5 rounded-lg border border-stone-700 hover:border-amber-500 hover:text-amber-300 text-xs transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <DeleteProductButton
                                                id={item.id}
                                                name={item.name}
                                                imageUrl={item.image_url}
                                                images={item.images}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
