'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/seo/slugify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 p-6 sm:p-10 relative overflow-hidden">
      {/* Luces volumétricas ambientales */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">

        {/* Barra Superior con Navegación y Volver */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400">
            <Link href="/admin/dashboard" className="hover:text-amber-300 transition-colors">
              Dashboard
            </Link>
            <span className="text-stone-700">/</span>
            <span className="text-stone-400">Inventario</span>
            <span className="text-stone-700">/</span>
            <span className="text-amber-300 font-medium">Nueva Joya</span>
          </nav>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-sans tracking-widest text-stone-400 hover:text-amber-300 transition-colors uppercase group self-start sm:self-auto"
          >
            <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 group-hover:border-amber-400/40 flex items-center justify-center text-[10px] group-hover:-translate-x-0.5 transition-all">←</span>
            <span>Volver al Dashboard</span>
          </Link>
        </div>

        {/* Encabezado Editorial */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span>Atelier Orfebre // Alta Joyería</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-100 tracking-tight">
            Registrar Nueva <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">Joya</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-400 font-sans font-light leading-relaxed max-w-2xl">
            Añade una pieza al inventario oficial de Sol de Oro con pesaje exacto en gramos, especificación orfebre y fotografía de alta resolución.
          </p>
        </div>

        {/* Mensaje de Error */}
        {message && (
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-3">
            <span className="text-base">⚠️</span>
            <span>{message}</span>
          </div>
        )}

        {/* Formulario en Doble Bisel de Cristal */}
        <form onSubmit={handleSubmit} className="p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 bg-stone-950/70 border border-white/5 space-y-8">

            {/* SECCIÓN 1: Identificación Básica */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
                <span>01</span>
                <span className="text-stone-700">/</span>
                <span>Identificación & Colección</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                    Nombre de la Joya *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Anillo Esmeralda Oro 18K"
                    className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                    Colección / Categoría *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-stone-200 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl cursor-pointer"
                  >
                    <option value="" className="bg-stone-900 text-stone-400">Seleccionar colección...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-stone-900 text-stone-100">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Tasación & Pesaje */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
                <span>02</span>
                <span className="text-stone-700">/</span>
                <span>Tasación & Pesaje Analítico</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                    Precio Estimado de Catálogo (COP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-500/80">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="2500000"
                      className="w-full bg-stone-900/60 border border-white/10 rounded-2xl pl-8 pr-12 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-500">COP</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                    Peso en Gramos (g)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(e.target.value)}
                      placeholder="5.20"
                      className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-500">gramos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Descripción & Hechura */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
                <span>03</span>
                <span className="text-stone-700">/</span>
                <span>Detalle Orfebre & Acabado</span>
              </h3>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Descripción de la Pieza
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla el tipo de tejido, hechura maciza o hueca, incrustaciones de esmeraldas o piedras preciosas, etc."
                  className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl leading-relaxed"
                />
              </div>
            </div>

            {/* SECCIÓN 4: Galería de Fotos */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-widest text-amber-400/90 flex items-center gap-2">
                  <span>04</span>
                  <span className="text-stone-700">/</span>
                  <span>Bóveda de Fotografía</span>
                </h3>
                <span className="text-[10px] font-mono text-stone-400">
                  {imageFiles.length} / {MAX_PRODUCT_IMAGES} fotos
                </span>
              </div>

              {/* Zona de Selección de Archivos */}
              <div className="relative rounded-2xl border border-dashed border-white/20 hover:border-amber-400/50 bg-stone-900/30 p-6 text-center transition-all group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 text-base mx-auto group-hover:scale-110 transition-transform">
                    📸
                  </div>
                  <p className="text-xs text-stone-200 font-sans font-medium">
                    Haz clic o arrastra fotografías de la joya
                  </p>
                  <p className="text-[10px] font-mono text-stone-500">
                    JPG, PNG, WEBP o AVIF · Máx. 5MB cada una · Optimización automática a WebP
                  </p>
                </div>
              </div>

              {/* Muestra de Fotos Seleccionadas */}
              {imageFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 block">
                    Fotos listas para subir (La primera será la foto de portada):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {previewUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-stone-900/80 group shadow-md"
                      >
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-sans bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Portada
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="absolute top-1.5 right-1.5 bg-stone-950/80 hover:bg-red-600 text-stone-300 hover:text-white text-xs w-6 h-6 rounded-full flex items-center justify-center transition-colors border border-white/20 cursor-pointer"
                          title="Eliminar foto"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 5: Escaparate Destacado */}
            <div className="pt-4 border-t border-white/10">
              <label
                htmlFor="isFeatured"
                className="p-4 rounded-2xl bg-stone-900/50 border border-white/10 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-400/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">✦</span>
                    <span className="text-xs font-sans font-medium text-stone-200">
                      Destacar en Escaparate Principal
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-stone-400">
                    La joya aparecerá con máxima prioridad visual en la sección de Joyas Destacadas del Home.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
                />
              </label>
            </div>

            {/* Botón de Publicación */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                    <span>Optimizando fotografías y guardando...</span>
                  </>
                ) : (
                  <>
                    <span>Guardar y Publicar Joya</span>
                    <span>→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-stone-400 hover:text-stone-200 text-xs font-sans uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}