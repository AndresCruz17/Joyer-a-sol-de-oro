'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { slugify } from '@/lib/seo/slugify';
import {
  validateImageFile,
  deleteStorageFiles,
  uploadOptimizedImage,
} from '@/lib/storage/image-utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  description?: string | null;
}

export default function AdminCategoriasPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Estado de edición (null = creando nueva categoría)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Previsualización de imagen seleccionada con ciclo de vida controlado
  const previewUrl = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null;
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchCategories = async () => {
    setFetching(true);
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, image_url, description')
      .order('name');
    if (data) setCategories(data);
    setFetching(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Iniciar modo de edición
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
    });
    setImageFile(null);
  };

  // Cancelar edición y volver a modo "Nueva Categoría"
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error || 'Archivo de imagen no válido.');
      e.target.value = '';
      setImageFile(null);
      return;
    }

    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let newlyUploadedPath: string | null = null;

    try {
      let finalImageUrl = editingCategory ? editingCategory.image_url : null;
      const previousImageUrl = editingCategory?.image_url || null;

      // 1. Si se seleccionó una nueva imagen, procesarla, optimizarla a WebP y subirla
      if (imageFile) {
        const { publicUrl, storagePath } = await uploadOptimizedImage(imageFile, 'categories');
        newlyUploadedPath = storagePath;
        finalImageUrl = publicUrl;
      }

      // 2. Estrategia de slugs: Preservar el slug existente al editar para evitar enlaces rotos,
      // o generarlo a partir del nombre con slugify() si es una categoría nueva.
      const slug = editingCategory?.slug
        ? editingCategory.slug
        : slugify(formData.name);

      if (editingCategory) {
        // ACTUALIZAR CATEGORÍA EXISTENTE
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            slug,
            description: formData.description || null,
            image_url: finalImageUrl,
          })
          .eq('id', editingCategory.id);

        if (updateError) throw updateError;

        // Si se subió una nueva imagen y existía una anterior, borrar la anterior de Storage
        if (imageFile && previousImageUrl && previousImageUrl !== finalImageUrl) {
          await deleteStorageFiles(supabase, [previousImageUrl], 'products');
        }
      } else {
        // CREAR NUEVA CATEGORÍA
        const { error: insertError } = await supabase
          .from('categories')
          .insert([
            {
              name: formData.name,
              slug,
              description: formData.description || null,
              image_url: finalImageUrl,
            },
          ]);

        if (insertError) throw insertError;
      }

      // Limpiar formulario y refrescar lista
      handleCancelEdit();
      fetchCategories();
    } catch (err: unknown) {
      console.error('Error al guardar categoría:', err);

      // ROLLBACK: Si falló la BD, borrar la imagen que se acaba de subir
      if (newlyUploadedPath) {
        await deleteStorageFiles(supabase, [newlyUploadedPath], 'products');
      }

      const errorMsg = err instanceof Error ? err.message : 'Error inesperado al guardar la categoría.';
      alert(`Error al guardar la categoría: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`¿Estás seguro de eliminar la colección "${cat.name}"? Esta acción no se puede deshacer.`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', cat.id);
      if (error) throw error;

      // Si la categoría tenía imagen, borrarla de Storage
      if (cat.image_url) {
        await deleteStorageFiles(supabase, [cat.image_url], 'products');
      }

      if (editingCategory?.id === cat.id) {
        handleCancelEdit();
      }

      fetchCategories();
    } catch (err: unknown) {
      console.error('Error al eliminar categoría:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error inesperado al eliminar.';
      alert(`Error al eliminar: ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 sm:p-10 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Luces volumétricas ambientales */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Barra Superior con Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400">
            <Link href="/admin/dashboard" className="hover:text-amber-300 transition-colors">
              Dashboard
            </Link>
            <span className="text-stone-700">/</span>
            <span className="text-stone-400">Catálogo</span>
            <span className="text-stone-700">/</span>
            <span className="text-amber-300 font-medium">Gestión de Colecciones</span>
          </nav>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-sans tracking-widest text-stone-400 hover:text-amber-300 transition-colors uppercase group self-start sm:self-auto"
          >
            <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 group-hover:border-amber-400/40 flex items-center justify-center text-[10px] group-hover:-translate-x-0.5 transition-all">←</span>
            <span>Volver a la Consola</span>
          </Link>
        </div>

        {/* Encabezado Editorial */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              <span>Consola de Gestión // Líneas Orfebres</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-100 tracking-tight">
              Colecciones & <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">Categorías</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-400 font-sans font-light leading-relaxed max-w-2xl">
              Crea, edita y organiza las líneas oficiales de joyas expuestas en el escaparate y menú de navegación de Sol de Oro.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900/60 border border-white/10 backdrop-blur-md shrink-0">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
              Total Colecciones:
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {categories.length}
            </span>
          </div>
        </div>

        {/* Layout en 2 Columnas: Formulario (Izquierda) + Listado (Derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* COLUMNA 1: Formulario en Doble Bisel de Cristal */}
          <div className="lg:col-span-5 p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-7 bg-stone-950/70 border border-white/5 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">✦</span>
                  <h2 className="font-serif text-lg text-stone-100">
                    {editingCategory ? 'Modificar Colección' : 'Nueva Colección'}
                  </h2>
                </div>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-[10px] font-sans text-amber-400 hover:text-amber-300 underline cursor-pointer uppercase tracking-wider"
                  >
                    ✕ Cancelar
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Nombre de la Colección *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Cadenas de Oro Italiano"
                  className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl"
                />
              </div>

              {editingCategory && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                    Ruta Permanente (Slug)
                  </label>
                  <div className="text-xs font-mono text-amber-300 bg-stone-900/80 px-4 py-2.5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span>/categoria/{editingCategory.slug}</span>
                    <Link
                      href={`/categoria/${editingCategory.slug}`}
                      target="_blank"
                      className="text-[10px] font-sans text-stone-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
                    >
                      Ver ↗
                    </Link>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  {editingCategory ? 'Renovar Portada de Colección' : 'Portada de Colección (Opcional)'}
                </label>

                {/* Previsualización */}
                {(previewUrl || editingCategory?.image_url) && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-900/60 border border-white/10">
                    <img
                      src={previewUrl || editingCategory?.image_url || ''}
                      alt="Vista previa"
                      className="w-14 h-14 object-cover rounded-xl border border-white/15"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-sans text-stone-200 font-medium">
                        {previewUrl ? 'Nueva portada seleccionada' : 'Portada actual en vitrina'}
                      </p>
                      <p className="text-[10px] font-mono text-amber-400/80">
                        {previewUrl ? 'Se optimizará a WebP al guardar' : 'Visible en catálogo y menú'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="relative rounded-2xl border border-dashed border-white/20 hover:border-amber-400/50 bg-stone-900/30 p-4 text-center transition-all group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1 pointer-events-none">
                    <p className="text-xs text-stone-200 font-sans font-medium">
                      Seleccionar imagen (JPG, PNG, WEBP, AVIF)
                    </p>
                    <p className="text-[10px] font-mono text-stone-500">
                      Máx. 5MB · Optimización orfebre a WebP
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  Descripción Editorial (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve reseña del estilo y acabados de esta colección..."
                  className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                    <span>Guardando en la bóveda...</span>
                  </>
                ) : (
                  <>
                    <span>{editingCategory ? 'Guardar Cambios de Colección' : 'Publicar Nueva Colección'}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* COLUMNA 2: Lista de Colecciones en Doble Bisel */}
          <div className="lg:col-span-7 p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl">
            <div className="rounded-2xl p-6 sm:p-7 bg-stone-950/70 border border-white/5 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-serif text-lg text-stone-100">
                  Líneas Registradas en Catálogo
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sincronizado en Vivo
                </span>
              </div>

              {fetching ? (
                <div className="p-12 text-center text-xs font-mono text-stone-500 animate-pulse">
                  Cargando líneas orfebres...
                </div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center text-xs text-stone-500 font-sans">
                  No hay colecciones registradas en este momento.
                </div>
              ) : (
                <div className="divide-y divide-white/5 space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        editingCategory?.id === cat.id
                          ? 'bg-amber-500/10 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {cat.image_url ? (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="w-13 h-13 object-cover rounded-xl border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-13 h-13 rounded-xl bg-stone-900 border border-white/10 flex items-center justify-center text-[10px] font-mono text-stone-500 shrink-0">
                            Sin Foto
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base text-stone-100">{cat.name}</h3>
                            <Link
                              href={`/categoria/${cat.slug}`}
                              target="_blank"
                              className="text-stone-500 hover:text-amber-300 text-[11px] transition-colors"
                              title="Ver en la web oficial"
                            >
                              ↗
                            </Link>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400/80 block">
                            /categoria/{cat.slug}
                          </span>
                          {cat.description && (
                            <p className="text-xs text-stone-400 font-light line-clamp-1 mt-0.5 font-sans">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClick(cat)}
                          className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-amber-400/40 text-stone-300 hover:text-amber-300 bg-stone-900/60 text-xs font-sans transition-all cursor-pointer active:scale-[0.97]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="px-3.5 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-sans transition-all cursor-pointer active:scale-[0.97]"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}