'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Luces volumétricas ambientales */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[150px] pointer-events-none -z-10" />

      {/* Enlace sutil para volver a la tienda */}
      <div className="w-full max-w-md mb-4 text-left relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-sans tracking-widest text-stone-400 hover:text-amber-300 transition-colors uppercase group"
        >
          <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 group-hover:border-amber-400/40 flex items-center justify-center text-[10px] group-hover:-translate-x-0.5 transition-all">←</span>
          <span>Volver a la Tienda</span>
        </Link>
      </div>

      {/* Tarjeta de Cristal Concéntrico de Alta Seguridad */}
      <div className="w-full max-w-md p-2 sm:p-2.5 rounded-3xl bg-stone-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] relative z-10">
        <div className="rounded-2xl p-7 sm:p-9 bg-stone-950/70 border border-white/5 space-y-6">

          {/* Encabezado */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] uppercase tracking-[0.2em] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
              <span>Bóveda & Atelier // Acceso Restringido</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 tracking-tight">
              Consola <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">Administrativa</span>
            </h1>

            <p className="text-xs text-stone-400 font-sans font-light leading-relaxed">
              Ingresa tus credenciales oficiales para gestionar inventario, tasas y colecciones.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs text-center flex items-center justify-center gap-2 shadow-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@soldeoro.com"
                className="w-full bg-stone-900/60 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-900/60 border border-white/10 rounded-2xl pl-4 pr-11 py-3.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all backdrop-blur-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs transition-colors p-1"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-sans font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                  <span>Verificando autorización...</span>
                </>
              ) : (
                <>
                  <span>Acceder a la Consola</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Sello de Seguridad */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] font-sans text-stone-500 text-center">
            <span>🛡️</span>
            <span>Cifrado TLS 1.3 · Verificación de rol administrativo en Supabase RLS</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-xs font-mono text-stone-500">
        Cargando acceso a la bóveda...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}