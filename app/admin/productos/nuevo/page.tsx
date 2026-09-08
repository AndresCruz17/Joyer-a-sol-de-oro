'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/seo/slugify';
import { useRouter } from 'next/navigation';
import {
  validateImageFiles,
  uploadOptimizedImage,
  deleteStorageFiles,
  MAX_PRODUCT_IMAGES,
} from '@/lib/storage/image-utils';

interface CategoryOption {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Liberación de URLs de previsualización para prevenir fugas de memoria
  const previewUrls = useMemo(() => {
    return imageFiles.map((file) => URL.createObjectURL(file));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    }
    loadCategories();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const selected = Array.from(e.target.files);
    const validation = validateImageFiles(selected, imageFiles.length, MAX_PRODUCT_IMAGES);

    if (!validation.valid) {
      setMessage(validation.error || 'Archivos inválidos.');
      e.target.value = '';
      return;
    }

    setImageFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const uploadedPaths: string[] = [];
    const uploadedUrls: string[] = [];

    try {
      // 1. Procesar y subir fotos optimizadas a WebP en el servidor
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const { publicUrl, storagePath } = await uploadOptimizedImage(file, 'products');
          uploadedPaths.push(storagePath);
          uploadedUrls.push(publicUrl);
        }
      }

      const productSlug = slugify(name);

      // 2. Insertar en base de datos
      const { error: insertError } = await supabase.from('products').insert({
        name,
        slug: productSlug,
        category_id: categoryId || null,
        price: price ? parseFloat(price) : null,
        weight_grams: weightGrams ? parseFloat(weightGrams) : null,
        description,
        is_featured: isFeatured,
        image_url: uploadedUrls[0] || null, // Foto principal
        images: uploadedUrls,               // Galería completa
        is_active: true,
      });

      if (insertError) {
        throw insertError;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      console.error('Error al guardar producto:', err);

      // ROLLBACK: Si la inserción en BD falla, eliminar los archivos que ya se subieron a Storage
      if (uploadedPaths.length > 0) {
        await deleteStorageFiles(supabase, uploadedPaths, 'products');
      }

      const errorMsg = err instanceof Error ? err.message : 'No se pudo guardar la joya.';
      setMessage(`Error: ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-400">➕ Agregar Nueva Joya</h1>
        <button
          onClick={() => router.back()}
          className="text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
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
          <label className="block text-xs font-semibold text-slate-400">
            Galería de Fotos (JPG, PNG, WEBP, AVIF - Máx. 5MB cada una, hasta {MAX_PRODUCT_IMAGES} fotos)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-400 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-slate-300 cursor-pointer"
          />

          {imageFiles.length > 0 && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-[11px] font-mono text-amber-400">Fotos seleccionadas ({imageFiles.length}/{MAX_PRODUCT_IMAGES}):</p>
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/50">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold cursor-pointer"
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
          <label htmlFor="isFeatured" className="text-sm text-slate-300 cursor-pointer">Destacar en Inicio</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Subiendo y Guardando...' : 'Guardar y Publicar Joya'}
        </button>
      </form>
    </div>
  );
}