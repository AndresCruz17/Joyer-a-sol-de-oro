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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 text-stone-100 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
            Catálogo // Sol de Oro
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-stone-100 font-light">
            Agregar Nueva <span className="italic text-amber-400">Joya</span>
          </h1>
        </div>
        <button
          onClick={() => router.back()}
          className="text-xs text-stone-400 hover:text-amber-300 font-mono cursor-pointer transition-colors px-3 py-1.5 rounded-lg border border-stone-800 hover:border-amber-500/40"
        >
          ← Volver
        </button>
      </div>

      {message && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono backdrop-blur-md">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-stone-900/60 border border-stone-800/80 p-6 sm:p-8 rounded-2xl space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Luz ambiental dorada sutil */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider flex items-center justify-between">
              <span>Nombre de la Joya *</span>
              <span className="text-[10px] text-stone-500 lowercase font-sans">obligatorio</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Anillo Esmeralda Oro 18K"
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider flex items-center justify-between">
              <span>Categoría *</span>
              <span className="text-[10px] text-stone-500 lowercase font-sans">obligatorio</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="glass-input cursor-pointer"
            >
              <option value="">Selecciona categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider">
              Precio Estimado (COP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-mono text-sm pointer-events-none">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 2500000"
                className="glass-input pl-8 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider">
              Peso en Gramos (g)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                placeholder="Ej: 5.2"
                className="glass-input pr-8 font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 font-mono text-xs pointer-events-none">g</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider">
            Descripción
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Especificaciones de la pieza, tipo de oro, grabado, acabado..."
            className="glass-input resize-none"
          />
        </div>

        {/* Cargar Múltiples Imágenes */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase text-stone-300 tracking-wider flex items-center justify-between">
            <span>Galería de Fotos (Máx. 5MB cada una)</span>
            <span className="text-[10px] text-amber-400 font-mono">Hasta {MAX_PRODUCT_IMAGES} fotos</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileChange}
            className="glass-file-input"
          />

          {imageFiles.length > 0 && (
            <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-2 backdrop-blur-md">
              <p className="text-[11px] font-mono text-amber-400">Fotos seleccionadas ({imageFiles.length}/{MAX_PRODUCT_IMAGES}):</p>
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/50 shadow-md">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-0 right-0 bg-red-600/90 hover:bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <label className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-950/50 border border-stone-800/80 hover:border-amber-500/30 transition-all cursor-pointer backdrop-blur-md">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-stone-200 block">Destacar en Inicio</span>
            <span className="text-[11px] text-stone-400">Mostrará esta joya en la vitrina de piezas exclusivas de la página principal</span>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Subiendo y Guardando...' : 'Guardar y Publicar Joya'}
        </button>
      </form>
    </div>
  );
}