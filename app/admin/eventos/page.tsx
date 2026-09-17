'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/seo/slugify';
import Link from 'next/link';
import {
  validateImageFile,
  deleteStorageFiles,
  uploadOptimizedImage,
} from '@/lib/storage/image-utils';

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminEventosPage() {
  const supabase = createClient();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Estado de edición (null = creando nuevo evento)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    is_active: true,
  });

  // Previsualización de imagen seleccionada
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

  const fetchEvents = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('events')
      .select('id, title, slug, description, event_date, image_url, is_active, created_at')
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error al cargar eventos:', error);
      setMessage({ text: `Error al cargar eventos: ${error.message}`, type: 'error' });
    } else if (data) {
      setEvents(data);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', event_date: '', is_active: true });
    setImageFile(null);
    setEditingEvent(null);
    setShowForm(false);
    setMessage(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      is_active: event.is_active,
    });
    setImageFile(null);
    setShowForm(true);
    setMessage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const validation = validateImageFile(file);

    if (!validation.valid) {
      setMessage({ text: validation.error || 'Archivo inválido.', type: 'error' });
      e.target.value = '';
      return;
    }

    setImageFile(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let imageUrl = editingEvent?.image_url || null;

      // Si hay nueva imagen, subirla
      if (imageFile) {
        const { publicUrl } = await uploadOptimizedImage(imageFile, 'products');
        
        // Si estamos editando y había imagen anterior, eliminarla
        if (editingEvent?.image_url) {
          await deleteStorageFiles(supabase, [editingEvent.image_url], 'products');
        }
        
        imageUrl = publicUrl;
      }

      const eventSlug = slugify(formData.title);

      const payload = {
        title: formData.title.trim(),
        slug: eventSlug,
        description: formData.description.trim() || null,
        event_date: new Date(formData.event_date).toISOString(),
        image_url: imageUrl,
        is_active: formData.is_active,
      };

      if (editingEvent) {
        // Actualizar evento existente
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingEvent.id);

        if (error) throw error;
        setMessage({ text: '✓ Evento actualizado correctamente', type: 'success' });
      } else {
        // Crear nuevo evento
        const { error } = await supabase
          .from('events')
          .insert(payload);

        if (error) throw error;
        setMessage({ text: '✓ Evento creado correctamente', type: 'success' });
      }

      await fetchEvents();
      resetForm();
    } catch (err: unknown) {
      console.error('Error al guardar evento:', err);
      const errorMsg = err instanceof Error ? err.message : 'No se pudo guardar el evento.';
      setMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!confirm(`¿Eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`)) return;

    try {
      // Eliminar imagen del storage si existe
      if (event.image_url) {
        await deleteStorageFiles(supabase, [event.image_url], 'products');
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      setMessage({ text: '✓ Evento eliminado', type: 'success' });
      await fetchEvents();
    } catch (err: unknown) {
      console.error('Error al eliminar evento:', err);
      const errorMsg = err instanceof Error ? err.message : 'No se pudo eliminar el evento.';
      setMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    }
  };

  const toggleActive = async (event: EventItem) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !event.is_active })
        .eq('id', event.id);

      if (error) throw error;
      await fetchEvents();
    } catch (err: unknown) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPastEvent = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-6 md:p-10">

      {/* Encabezado */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-stone-800 gap-4">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
            Panel de Control // Sol de Oro
          </span>
          <h1 className="font-serif text-3xl font-light">
            Gestión de <span className="italic text-amber-400">Eventos</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl border border-stone-800 bg-stone-900 text-stone-300 text-xs hover:border-amber-500/40 hover:text-amber-300 transition-colors"
          >
            ← Dashboard
          </Link>
          <button
            onClick={openCreateForm}
            className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer"
          >
            + Nuevo Evento
          </button>
        </div>
      </header>

      {/* Mensaje de feedback */}
      {message && (
        <div className={`p-4 mt-6 rounded-xl text-xs font-mono backdrop-blur-md border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulario de Crear/Editar */}
      {showForm && (
        <div className="mt-8 bg-stone-900/60 border border-stone-800/80 p-6 sm:p-8 rounded-2xl space-y-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl text-stone-100">
              {editingEvent ? 'Editar' : 'Nuevo'} <span className="italic text-amber-400">Evento</span>
            </h2>
            <button
              onClick={resetForm}
              className="text-xs text-stone-400 hover:text-amber-300 font-mono cursor-pointer transition-colors px-3 py-1.5 rounded-lg border border-stone-800 hover:border-amber-500/40"
            >
              ✕ Cerrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Exhibición de Colección Navidad 2026"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider">
                  Fecha y Hora del Evento *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-stone-300 mb-1.5 tracking-wider">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalles del evento, qué se va a presentar, promociones especiales..."
                className="glass-input resize-none"
              />
            </div>

            {/* Imagen del evento */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase text-stone-300 tracking-wider">
                Imagen del Evento (Máx. 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="glass-file-input"
              />

              {/* Preview de imagen nueva o existente */}
              {(previewUrl || editingEvent?.image_url) && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-amber-500/50 shadow-md">
                  <img
                    src={previewUrl || editingEvent?.image_url || ''}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {previewUrl && (
                    <span className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-stone-950 text-[9px] text-center font-mono py-0.5">
                      Nueva
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Toggle activo */}
            <label className="flex items-center gap-3.5 p-4 rounded-xl bg-stone-950/50 border border-stone-800/80 hover:border-amber-500/30 transition-all cursor-pointer backdrop-blur-md">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-stone-200 block">Evento Activo</span>
                <span className="text-[11px] text-stone-400">Si está activo, será visible para los visitantes del sitio</span>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Guardando...'
                : editingEvent
                  ? 'Actualizar Evento'
                  : 'Crear Evento'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-stone-300">
            Todos los Eventos <span className="text-amber-400/70">({events.length})</span>
          </h2>
        </div>

        {fetching ? (
          <div className="text-center py-12 text-stone-500 font-mono text-sm">Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 border border-stone-800/50 rounded-2xl bg-stone-900/30">
            <p className="text-stone-500 font-mono text-sm mb-3">No hay eventos registrados aún</p>
            <button
              onClick={openCreateForm}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-mono hover:bg-amber-500/30 transition-all cursor-pointer border border-amber-500/30"
            >
              + Crear el primer evento
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`group relative p-5 rounded-2xl border backdrop-blur-md transition-all ${
                  event.is_active
                    ? 'bg-stone-900/60 border-stone-800/80 hover:border-amber-500/30'
                    : 'bg-stone-950/40 border-stone-800/40 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Imagen miniatura */}
                  {event.image_url && (
                    <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-stone-700/50">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-serif text-lg text-stone-100 truncate">{event.title}</h3>
                      {!event.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono uppercase">
                          Inactivo
                        </span>
                      )}
                      {isPastEvent(event.event_date) && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-700/50 text-stone-400 text-[10px] font-mono uppercase">
                          Pasado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-amber-400/80 font-mono mt-1">
                      📅 {formatDate(event.event_date)}
                    </p>

                    {event.description && (
                      <p className="text-xs text-stone-400 mt-1.5 line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(event)}
                      title={event.is_active ? 'Desactivar' : 'Activar'}
                      className={`p-2 rounded-lg text-xs font-mono cursor-pointer transition-all border ${
                        event.is_active
                          ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          : 'border-stone-700 text-stone-500 hover:bg-stone-800'
                      }`}
                    >
                      {event.is_active ? '●' : '○'}
                    </button>
                    <button
                      onClick={() => openEditForm(event)}
                      className="px-3 py-2 rounded-lg border border-stone-700 text-stone-300 text-xs font-mono hover:border-amber-500/40 hover:text-amber-300 cursor-pointer transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="px-3 py-2 rounded-lg border border-stone-700 text-stone-400 text-xs font-mono hover:border-red-500/40 hover:text-red-400 cursor-pointer transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
