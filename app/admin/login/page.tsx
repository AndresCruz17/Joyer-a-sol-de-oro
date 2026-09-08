'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Acceso denegado: Tu cuenta no tiene permisos de administrador.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      const msg = authError?.message || '';
      if (msg.includes('rate limit') || msg.includes('Too many requests') || msg.includes('over_email_send_rate_limit')) {
        setError('Demasiados intentos fallidos. Por seguridad, espera unos minutos antes de reintentar.');
      } else if (msg === 'Invalid login credentials') {
        setError('Credenciales incorrectas. Verifica correo y contraseña.');
      } else {
        setError('No fue posible iniciar sesión. Verifica tus datos de acceso.');
      }
      setLoading(false);
      return;
    }

    // Comprobar si el usuario realmente es administrador en la base de datos
    const { data: adminRecord, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      // Cerrar sesión inmediatamente si no tiene rol administrativo
      await supabase.auth.signOut();
      setError('Acceso denegado: Esta cuenta no está registrada como administradora.');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
      {/* Luz ambiental */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-stone-900/80 border border-stone-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <span className="text-stone-950 font-serif font-bold text-xl">SO</span>
          </div>
          <h1 className="font-serif text-2xl text-stone-100 font-light">
            Panel <span className="text-amber-400 italic">Administrativo</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">Ingresa tus credenciales autorizadas</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@soldeoro.com"
              className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-400 mb-1 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verificando autorización...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-xs font-mono text-stone-500">
        Cargando acceso...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}