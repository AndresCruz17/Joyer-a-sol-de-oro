'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
}

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = resolvedParams.id;
    const router = useRouter();
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        weight_grams: '',
        category_id: '',
        image_url: '',
        is_featured: false,
    });

    useEffect(() => {
        async function loadData() {
            // 1. Cargar categorías
            const { data: catData } = await supabase.from('categories').select('id, name').order('name');
            if (catData) setCategories(catData);

            // 2. Cargar datos del producto a editar
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error || !product) {
                alert('No se encontró el producto solicitado.');
                router.push('/admin/dashboard');
                return;
            }

            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price ? product.price.toString() : '',
                weight_grams: product.weight_grams ? product.weight_grams.toString() : '',
                category_id: product.category_id || '',
                image_url: product.image_url || '',
                is_featured: product.is_featured || false,
            });

            setFetching(false);
        }

        loadData();
    }, [productId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = formData.image_url;

            // Si subió una nueva imagen
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `items/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrlData.publicUrl;
            }

            // Actualizar producto en Supabase
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
                    category_id: formData.category_id || null,
                    image_url: finalImageUrl,
                    is_featured: formData.is_featured,
                })
                .eq('id', productId);

            if (updateError) throw updateError;

            router.push('/admin/dashboard');
            router.refresh();
        } catch (err: any) {
            alert(`Error al actualizar: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center text-sm font-mono text-amber-400">
                Cargando datos del producto...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-800">
                    <div>
                        <Link href="/admin/dashboard" className="text-xs text-amber-400 font-mono hover:underline mb-2 block">
                            ← Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-3xl font-light">
                            Editar <span className="italic text-amber-400">Joya</span>
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-stone-900/50 border border-stone-800 p-8 rounded-2xl backdrop-blur-md">
                    <div>
                        <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Nombre de la Joya *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Categoría *</label>
                            <select
                                name="category_id"
                                required
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                            >
                                <option value="">Selecciona una...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Precio (COP) *</label>
                            <input
                                type="number"
                                name="price"
                                required
                                step="1000"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Peso en Gramos (18K)</label>
                            <input
                                type="number"
                                name="weight_grams"
                                step="0.01"
                                value={formData.weight_grams}
                                onChange={handleChange}
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Cambiar Imagen (Opcional)</label>
                        {formData.image_url && (
                            <div className="mb-3 flex items-center gap-3">
                                <img src={formData.image_url} alt="Vista previa" className="w-12 h-12 object-cover rounded-lg border border-stone-800" />
                                <span className="text-xs text-stone-500">Imagen actual guardada</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-stone-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 file:cursor-pointer cursor-pointer border border-stone-800 rounded-xl p-2 bg-stone-950"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Descripción</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t border-stone-800 flex justify-end gap-4">
                        <Link
                            href="/admin/dashboard"
                            className="px-6 py-3 rounded-xl border border-stone-800 text-stone-400 text-xs font-medium hover:bg-stone-900 transition-all"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                            {loading ? 'Guardando Cambios...' : 'Actualizar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}