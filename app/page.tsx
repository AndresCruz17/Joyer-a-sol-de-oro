import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // 1. Verificar variables
  if (!url || !key) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>❌ Faltan las Variables de Entorno</h1>
        <p>Asegúrate de que el archivo <code>.env.local</code> exista en la raíz y tenga asignadas las claves de Supabase.</p>
      </div>
    );
  }

  // 2. Probar consulta a Supabase
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('categories').select('*').limit(5);

    if (error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
          <h1 style={{ color: 'orange' }}>⚠️ Error de Supabase</h1>
          <p><strong>Mensaje:</strong> {error.message}</p>
          <p><strong>Código:</strong> {error.code}</p>
          <p><strong>Detalles:</strong> {error.details || 'Revisa permisos RLS o nombre de la tabla'}</p>
        </div>
      );
    }

    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'green' }}>✅ ¡Conexión con Supabase Exitosa!</h1>
        <p>Se encontraron <strong>{data ? data.length : 0}</strong> categorías en la tabla.</p>
        <pre style={{ background: '#1e293b', color: '#f8fafc', padding: 15, borderRadius: 8, overflowX: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (err: any) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>❌ Excepción en el Servidor</h1>
        <p>{err.message}</p>
      </div>
    );
  }
}