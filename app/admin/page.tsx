'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/seo/slugify';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price: number | null;
  weight_grams: number | null;
  description: string | null;
  is_featured: boolean;
  image_url: string | null;
  images: string[] | null;
  categories?: { name: string } | null;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  // Datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Modo Edición / Creación
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Formulario Producto
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [weightGrams, setWeightGrams] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Manejo de Imágenes (Existentes en Supabase + Nuevos Archivos)
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  // Formulario Categoría
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: catData } = await supabase.from('categories').select('*').order('name');
    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (catData) setCategories(catData);
    if (prodData) setProducts(prodData as Product[]);

    setLoading(false);
  }

  // Cargar datos de producto en el formulario para EDITAR
  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name || '');
    setCategoryId(product.category_id || '');
    setPrice(product.price ? product.price.toString() : '');
    setWeightGrams(product.weight_grams ? product.weight_grams.toString() : '');
    setDescription(product.description || '');
    setIsFeatured(product.is_featured || false);

    // Consolidar imágenes existentes en la base de datos
    const imgs = Array.from(
      new Set([product.image_url, ...(product.images || [])].filter(Boolean) as string[])
    );
    setExistingImages(imgs);
    setNewImageFiles([]);
    setMessage(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar Edición
  const handleCancelEdit = () => {
    setEditingProductId(null);
    resetProductForm();
  };

  // Limpiar Formulario de Producto
  const resetProductForm = () => {
    setName('');
    setCategoryId('');
    setPrice('');
    setWeightGrams('');
    setDescription('');
    setIsFeatured(false);
    setExistingImages([]);
    setNewImageFiles([]);
  };

  // Remover foto existente de la lista
  const handleRemoveExistingImage = (urlToRemove: string) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // Remover nuevo archivo seleccionado de la lista
  const handleRemoveNewFile = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Seleccionar nuevas imágenes (acumulativo)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...selected]);
    }
  };

  // GUARDAR O ACTUALIZAR PRODUCTO
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const newlyUploadedUrls: string[] = [];

      // 1. Subir nuevos archivos a Supabase Storage
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
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
            newlyUploadedUrls.push(publicUrlData.publicUrl);
          }
        }
      }

      // 2. Combinar imágenes que se conservaron + imágenes recién subidas
      const finalImages = [...existingImages, ...newlyUploadedUrls];
      const primaryImageUrl = finalImages[0] || null;
      const productSlug = slugify(name);

      const productPayload = {
        name,
        slug: productSlug,
        category_id: categoryId || null,
        price: price ? parseFloat(price) : null,
        weight_grams: weightGrams ? parseFloat(weightGrams) : null,
        description,
        is_featured: isFeatured,
        image_url: primaryImageUrl,
        images: finalImages,
        is_active: true,
      };

      if (editingProductId) {
        // ACTUALIZAR PRODUCTO EXISTENTE
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProductId);

        if (updateError) throw updateError;
        setMessage('¡Joya actualizada correctamente!');
      } else {
        // CREAR NUEVO PRODUCTO
        const { error: insertError } = await supabase
          .from('products')
          .insert(productPayload);

        if (insertError) throw insertError;
        setMessage('¡Joya registrada exitosamente con su galería!');
      }

      setEditingProductId(null);
      resetProductForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.message || 'No se pudo guardar la joya.'}`);
    } finally {
      setLoading(false);
    }
  };

  // ELIMINAR PRODUCTO
  const handleDeleteProduct = async (id: string, productName: string) => {
    if (!confirm(`¿Seguro que deseas eliminar "${productName}"?`)) return;

    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      setMessage(`Error al eliminar: ${error.message}`);
    } else {
      setMessage('Joya eliminada correctamente.');
      fetchData();
    }
    setLoading(false);
  };

  // CREAR CATEGORÍA
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCategoryLoading(true);
    const catSlug = slugify(newCategoryName);

    const { error } = await supabase.from('categories').insert({
      name: newCategoryName.trim(),
      slug: catSlug,
    });

    if (error) {
      setMessage(`Error al crear categoría: ${error.message}`);
    } else {
      setMessage(`Categoría "${newCategoryName}" creada con éxito.`);
      setNewCategoryName('');
      fetchData();
    }
    setCategoryLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* CABECERA ADMIN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400">Panel de Control</h1>
            <p className="text-slate-400 text-sm">Gestiona piezas de joyería, imágenes y categorías.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors self-start sm:self-auto"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* NOTIFICACIÓN */}
        {message && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-sm font-mono flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-xs text-stone-400 hover:text-white">✕</button>
          </div>
        )}

        {/* GRID SUPERIOR: SECCIÓN CREAR/EDITAR PRODUCTO + CREAR CATEGORÍA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULARIO PRODUCTO (2 Columnas) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingProductId ? '✏️ Editar Joya' : '➕ Agregar Nueva Joya'}
              </h2>
              {editingProductId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-mono text-amber-400 hover:underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Nombre de la Joya *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Anillo Solitario Oro 18K"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
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
                    Precio Estimado (COP)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej: 1800000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Peso en Gramos (g)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="Ej: 4.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Descripción / Especificaciones
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre tipo de oro (18k), quilates, acabado..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              {/* SECTOR CARGA Y PREVISUALIZACIÓN DE FOTOS MULTIPLES */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <label className="block text-xs font-semibold text-slate-400">
                  Galería de Fotos (Selecciona varias fotos para esta joya)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-400 text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-slate-300"
                />

                {/* PREVISUALIZADOR DE FOTOS (EXISTENTES + NUEVAS) */}
                {(existingImages.length > 0 || newImageFiles.length > 0) && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <p className="text-[11px] font-mono text-amber-400">
                      Imágenes asociadas ({existingImages.length + newImageFiles.length}):
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {/* Fotos ya guardadas en Supabase */}
                      {existingImages.map((url, idx) => (
                        <div key={`exist-${idx}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 group">
                          <img src={url} alt="Existente" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(url)}
                            className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                            title="Eliminar foto guardada"
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-slate-950/80 text-[8px] text-center text-slate-400">Guardada</span>
                        </div>
                      ))}

                      {/* Nuevas fotos locales seleccionadas */}
                      {newImageFiles.map((file, idx) => {
                        const previewUrl = URL.createObjectURL(file);
                        return (
                          <div key={`new-${idx}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-500/50 group">
                            <img src={previewUrl} alt="Nueva" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewFile(idx)}
                              className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                              title="Remover selección"
                            >
                              ✕
                            </button>
                            <span className="absolute bottom-0 left-0 right-0 bg-amber-500 text-[8px] text-center text-slate-950 font-bold">Por Subir</span>
                          </div>
                        );
                      })}
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
                <label htmlFor="isFeatured" className="text-sm text-slate-300">
                  Destacar esta joya en la página principal
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors duration-200 text-sm"
                >
                  {loading
                    ? 'Procesando e Indexando...'
                    : editingProductId
                      ? 'Guardar Cambios en la Joya'
                      : 'Publicar Nueva Joya'}
                </button>
              </div>

            </form>
          </div>

          {/* GESTIÓN DE CATEGORÍAS (1 Columna) */}
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white">🏷️ Categorías</h2>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Nueva Categoría
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Pulseras, Dijes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={categoryLoading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-semibold py-2.5 rounded-xl transition-colors text-xs font-mono"
              >
                {categoryLoading ? 'Creando...' : '+ Crear Categoría'}
              </button>
            </form>

            <div className="border-t border-slate-800 pt-4">
              <span className="text-xs font-mono text-slate-400 block mb-3">Categorías existentes ({categories.length}):</span>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-mono text-slate-300"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* LISTADO DE PRODUCTOS REGISTRADOS CON EDICIÓN Y ELIMINACIÓN */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">💎 Inventario de Joyas ({products.length})</h2>
            <button
              onClick={fetchData}
              className="text-xs font-mono text-stone-400 hover:text-amber-400 transition-colors"
            >
              🔄 Actualizar lista
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No hay joyas registradas en el catálogo.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase">
                    <th className="py-3 px-2">Foto</th>
                    <th className="py-3 px-2">Nombre</th>
                    <th className="py-3 px-2">Categoría</th>
                    <th className="py-3 px-2">Precio</th>
                    <th className="py-3 px-2">Fotos</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((prod) => {
                    const totalImgs = Array.from(
                      new Set([prod.image_url, ...(prod.images || [])].filter(Boolean))
                    ).length;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 px-2">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden border border-slate-800">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-600">N/A</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-sans font-semibold text-white">{prod.name}</td>
                        <td className="py-3 px-2 text-slate-400">{prod.categories?.name || 'Sin cat.'}</td>
                        <td className="py-3 px-2 text-amber-400">
                          {prod.price ? `$${prod.price.toLocaleString('es-CO')}` : 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-slate-400">{totalImgs} foto(s)</td>
                        <td className="py-3 px-2 text-right space-x-2">
                          <button
                            onClick={() => handleStartEdit(prod)}
                            className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 rounded hover:bg-amber-500 hover:text-slate-950 transition-all"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="px-3 py-1 bg-red-500/10 border border-red-500/40 text-red-400 rounded hover:bg-red-500 hover:text-white transition-all"
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}