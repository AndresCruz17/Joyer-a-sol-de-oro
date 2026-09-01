'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/seo/slugify';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const supabase = createClient();
    const router = useRouter();

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Campos
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [weightGrams, setWeightGrams] = useState('');
    const [description, setDescription] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);

    // Galería de fotos (Múltiples)
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    useEffect(() => {
        async function loadCategories() {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setCategories(data);
        }
        loadCategories();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            setImageFiles((prev) => [...prev, ...selected]);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const uploadedUrls: string[] = [];

            // Subir cada foto seleccionada
            if (imageFiles.length > 0) {
                for (const file of imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `products/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: publicUrlData } = supabase.storage
                        .from('products')
                        .getPublicUrl(filePath);

                    if (publicUrlData?.publicUrl) {
                        uploadedUrls.push(publicUrlData.publicUrl);
                    }
                }
            }

            const productSlug = slugify(name);

            const { error: insertError } = await supabase.from('products').insert({
                name,
                slug: productSlug,
                category_id: categoryId || null,
                price: price ? parseFloat(price) : null,
                weight_grams: weightGrams ? parseFloat(weightGrams) : null,
                description,
                is_featured: isFeatured,
                image_url: uploadedUrls[0] || null, // Foto principal / Portada
                images: uploadedUrls,               // Galería completa
                is_active: true,
            });

            if (insertError) throw insertError;

            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setMessage(`Error: ${err.message || 'No se pudo guardar la joya.'}`);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 text-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-amber-400">➕ Agregar Nueva Joya</h1>
                <button
                    onClick={() => router.back()}
                    className="text-xs text-slate-400 hover:text-white font-mono"
                >
                    ← Volver
                </button>
            </div>

            {message && (
                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Nombre de la Joya *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Anillo Esmeralda Oro 18K"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Categoría *</label>
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"
                        >
                            <option value="">Selecciona categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Precio Estimado (COP)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Ej: 2500000"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2">Peso en Gramos (g)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={weightGrams}
                            onChange={(e) => setWeightGrams(e.target.value)}
                            placeholder="Ej: 5.2"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Descripción</label>
                    <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Especificaciones, tipo de oro, acabado..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"
                    />
                </div>

                {/* Cargar Múltiples Imágenes */}
                <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-400">Galería de Fotos (Selección Múltiple)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-400 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-slate-300"
                    />

                    {imageFiles.length > 0 && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                            <p className="text-[11px] font-mono text-amber-400">Fotos seleccionadas ({imageFiles.length}):</p>
                            <div className="flex flex-wrap gap-3">
                                {imageFiles.map((file, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/50">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(idx)}
                                            className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isFeatured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <label htmlFor="isFeatured" className="text-sm text-slate-300">Destacar en Inicio</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors text-sm"
                >
                    {loading ? 'Subiendo e Guardando...' : 'Guardar y Publicar Joya'}
                </button>
            </form>
        </div>
    );
}