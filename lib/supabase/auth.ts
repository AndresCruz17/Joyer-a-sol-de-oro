import { createClient } from './server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export interface AdminAuthResult {
  user: User | null;
  isAdmin: boolean;
}

/**
 * Obtiene el usuario actual y verifica si tiene rol de administrador en la base de datos.
 */
export async function getAuthAdminUser(): Promise<AdminAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, isAdmin: false };
  }

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError || !adminRecord) {
    return { user, isAdmin: false };
  }

  return { user, isAdmin: true };
}

/**
 * Exige que la petición provenga de un administrador autenticado.
 * Si no está autenticado o no es administrador, redirige al login.
 */
export async function requireAdminUser(): Promise<User> {
  const { user, isAdmin } = await getAuthAdminUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (!isAdmin) {
    redirect('/admin/login?error=unauthorized');
  }

  return user;
}
