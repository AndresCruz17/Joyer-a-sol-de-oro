'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

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

  const fetchCategories = async () => {
    setFetching(true);
    const { data } = await supabase.from('categories').select('*').order('name');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = editingCategory ? editingCategory.image_url : null;

      // 1. Si se seleccionó una nueva imagen, subirla a Supabase Storage
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      // 2. Generar slug a partir del nombre
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

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
    } catch (err: any) {
      alert(`Error al guardar la categoría: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      
      if (editingCategory?.id === id) {
        handleCancelEdit();
      }
      
      fetchCategories();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-800">
          <div>
            <Link href="/admin/dashboard" className="text-xs text-amber-400 font-mono hover:underline mb-2 block">
              ← Volver al Dashboard
            </Link>
            <h1 className="font-serif text-3xl font-light">
              Gestión de <span className="italic text-amber-400">Categorías</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario (Crear / Editar) */}
          <form onSubmit={handleSubmit} className="bg-stone-900/50 border border-stone-800 p-6 rounded-2xl space-y-4 h-fit backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg text-amber-300">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[10px] font-mono text-stone-400 hover:text-stone-200 underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Anillos de Compromiso"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">
                {editingCategory ? 'Cambiar Imagen (Opcional)' : 'Imagen de Portada'}
              </label>
              
              {editingCategory?.image_url && !imageFile && (
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={editingCategory.image_url}
                    alt="Vista previa actual"
                    className="w-12 h-12 object-cover rounded-lg border border-stone-800"
                  />
                  <span className="text-xs text-stone-500">Imagen actual</span>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-stone-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 border border-stone-800 rounded-xl p-2 bg-stone-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-400 mb-1">Descripción</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve reseña de la colección..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading
                  ? 'Guardando...'
                  : editingCategory
                  ? 'Actualizar Categoría'
                  : 'Guardar Categoría'}
              </button>
            </div>
          </form>

          {/* Lista de Categorías */}
          <div className="lg:col-span-2 bg-stone-900/40 border border-stone-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <h2 className="font-serif text-lg">Categorías Registradas</h2>
            </div>

            {fetching ? (
              <div className="p-8 text-center text-xs font-mono text-stone-500">Cargando categorías...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">No hay categorías registradas.</div>
            ) : (
              <div className="divide-y divide-stone-800/60">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      editingCategory?.id === cat.id ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'hover:bg-stone-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-xl border border-stone-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-[10px] text-stone-600">
                          Sin Foto
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-stone-200 text-sm">{cat.name}</h3>
                        <span className="text-[10px] font-mono text-amber-400 block">/{cat.slug}</span>
                        {cat.description && (
                          <p className="text-xs text-stone-400 font-light line-clamp-1 mt-0.5">{cat.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="px-3 py-1 rounded border border-stone-700 hover:border-amber-500 hover:text-amber-300 text-xs transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="px-3 py-1 rounded border border-red-900/60 bg-red-950/20 text-red-400 hover:bg-red-900/40 text-xs transition-colors"
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
  );
}