'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/seo/slugify';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Formulario de Producto
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Cargar categorías disponibles para el selector
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    }
    loadCategories();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let imageUrl = '';

      // 1. Subir imagen a Supabase Storage si se seleccionó una
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Obtener URL pública de la foto
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Insertar producto en la base de datos con Slug SEO
      const productSlug = slugify(name);

      const { error: insertError } = await supabase.from('products').insert({
        name,
        slug: productSlug,
        category_id: categoryId,
        price: price ? parseFloat(price) : null,
        description,
        is_featured: isFeatured,
        images: imageUrl ? [imageUrl] : [],
        is_active: true,
      });

      if (insertError) throw insertError;

      setMessage('¡Joya registrada exitosamente con URL optimizada para SEO!');
      // Resetear formulario
      setName('');
      setPrice('');
      setDescription('');
      setIsFeatured(false);
      setImageFile(null);
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.message || 'No se pudo guardar la joya.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* CABECERA ADMIN */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400">Panel de Control</h1>
            <p className="text-slate-400 text-sm">Gestiona tus piezas de joyería y catálogo.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* NOTIFICACIÓN */}
        {message && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-sm">
            {message}
          </div>
        )}

        {/* FORMULARIO DE AGREGAR PRODUCTO */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Agregar Nueva Joya</h2>

          <form onSubmit={handleCreateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Nombre de la Joya *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Cadena Tejido Chino 18K 50cm"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
                {name && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    URL Slug: <span className="text-amber-400/80">/catalogo/.../{slugify(name)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Categoría *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Precio estimado en COP
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 1500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Foto de la Joya
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-400 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-slate-300"
                />
              </div>

            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Descripción / Especificaciones
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles sobre los gramos, tipo de oro (18k), medidas, piedras, etc."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <label htmlFor="isFeatured" className="text-sm text-slate-300">
                Destacar esta joya en la pantalla de inicio principal
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors duration-200"
            >
              {loading ? 'Subiendo e Indexando Joya...' : 'Guardar y Publicar Joya'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}