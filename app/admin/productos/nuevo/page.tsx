'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
}

export default function NuevoProductoPage() {
    const router = useRouter();
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        weight_grams: '',
        category_id: '',
        is_featured: false,
    });

    // Cargar categorías existentes
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('id, name').order('name');
            if (data) setCategories(data);
        }
        fetchCategories();
    }, []);

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
            let imageUrl = null;

            // 1. Subir imagen a Supabase Storage si se seleccionó un archivo
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `items/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                // Obtener la URL pública de la imagen subida
                const { data: publicUrlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;
            }

            // 2. Generar slug único a partir del nombre
            const slug = formData.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            // 3. Insertar producto en la tabla 'products'
            const { error: insertError } = await supabase.from('products').insert([
                {
                    name: formData.name,
                    slug,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null,
                    category_id: formData.category_id || null,
                    image_url: imageUrl,
                    is_featured: formData.is_featured,
                },
            ]);

            if (insertError) throw insertError;

            router.push('/admin/dashboard');
            router.refresh();
        } catch (err: any) {
            alert(`Error al guardar el producto: ${err.message || 'Inténtalo de nuevo'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-12">
            <div className="max-w-3xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-800">
                    <div>
                        <Link href="/admin/dashboard" className="text-xs text-amber-400 font-mono hover:underline mb-2 block">
                            ← Volver al Dashboard
                        </Link>
                        <h1 className="font-serif text-3xl font-light">
                            Registrar <span className="italic text-amber-400">Nueva Joya</span>
                        </h1>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6 bg-stone-900/50 border border-stone-800 p-8 rounded-2xl backdrop-blur-md">

                    <div>
                        <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Nombre de la Joya *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej. Anillo Solitario Oro 18K Diamante"
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
                                placeholder="Ej. 1250000"
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Peso en Gramos (Oro 18K)</label>
                            <input
                                type="number"
                                name="weight_grams"
                                step="0.01"
                                value={formData.weight_grams}
                                onChange={handleChange}
                                placeholder="Ej. 4.5"
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-stone-400 mb-2">Imagen de la Joya</label>
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
                            placeholder="Detalles sobre el acabado, engaste, pureza o piedras preciosas..."
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        ></textarea>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                        <input
                            type="checkbox"
                            id="is_featured"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleChange}
                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <label htmlFor="is_featured" className="text-xs text-stone-300 cursor-pointer">
                            Destacar esta pieza en la página principal
                        </label>
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
                            {loading ? 'Guardando en Inventario...' : 'Publicar Producto'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}