import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthAdminUser, requireAdminUser } from '@/lib/supabase/auth';
import { proxy } from '@/proxy';
import { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';

// Mock de @/lib/supabase/server
vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  };
});

// Mock de next/navigation redirect
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock('next/navigation', () => {
  return {
    redirect: (url: string) => mockRedirect(url),
  };
});

describe('1. Seguridad, Autenticación y Autorización RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthAdminUser()', () => {
    it('debe devolver { user: null, isAdmin: false } si no hay sesión activa', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: null }, error: new Error('No session') }),
        },
      });

      const result = await getAuthAdminUser();
      expect(result).toEqual({ user: null, isAdmin: false });
    });

    it('debe devolver { user, isAdmin: false } si el usuario existe pero no está en admin_users', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const fakeUser: Partial<User> = { id: 'user-123', email: 'cliente@soldeoro.com' };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: fakeUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
            }),
          }),
        }),
      });

      const result = await getAuthAdminUser();
      expect(result.user).toEqual(fakeUser);
      expect(result.isAdmin).toBe(false);
    });

    it('debe devolver { user, isAdmin: true } si el usuario está registrado en admin_users', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const fakeAdminUser: Partial<User> = { id: 'admin-999', email: 'admin@soldeoro.com' };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: fakeAdminUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: { user_id: 'admin-999' }, error: null }),
            }),
          }),
        }),
      });

      const result = await getAuthAdminUser();
      expect(result.user).toEqual(fakeAdminUser);
      expect(result.isAdmin).toBe(true);
    });
  });

  describe('requireAdminUser()', () => {
    it('debe redirigir a /admin/login si el usuario no está autenticado', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: null }, error: null }),
        },
      });

      await expect(requireAdminUser()).rejects.toThrow('REDIRECT:/admin/login');
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login');
    });

    it('debe redirigir a /admin/login?error=unauthorized si el usuario no tiene rol admin', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const fakeUser: Partial<User> = { id: 'user-regular', email: 'regular@soldeoro.com' };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: fakeUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
            }),
          }),
        }),
      });

      await expect(requireAdminUser()).rejects.toThrow('REDIRECT:/admin/login?error=unauthorized');
      expect(mockRedirect).toHaveBeenCalledWith('/admin/login?error=unauthorized');
    });

    it('debe retornar el usuario si está autenticado y tiene rol admin', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const fakeAdmin: Partial<User> = { id: 'admin-1', email: 'admin@soldeoro.com' };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: fakeAdmin }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: { user_id: 'admin-1' }, error: null }),
            }),
          }),
        }),
      });

      const user = await requireAdminUser();
      expect(user).toEqual(fakeAdmin);
    });
  });
});

describe('2. Proxy Middleware (Fail-Closed y Protección de Rutas)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('FAIL-CLOSED: debe devolver status 500 y bloquear /admin/* si faltan variables de Supabase', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const req = new NextRequest('http://localhost:3000/admin/dashboard');
    const res = await proxy(req);

    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain('Variables de autenticación de Supabase no configuradas');
  });

  it('debe permitir rutas públicas incluso si faltan variables de entorno', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const req = new NextRequest('http://localhost:3000/catalogo');
    const res = await proxy(req);

    expect(res.status).toBe(200);
  });
});

describe('8. Endpoint de Cierre de Sesión (/api/auth/signout)', () => {
  it('debe invocar supabase.auth.signOut() y redirigir con código 303 a /admin/login', async () => {
    const { POST } = await import('@/app/api/auth/signout/route');
    const { createClient } = await import('@/lib/supabase/server');

    const signOutMock = vi.fn().mockResolvedValueOnce({ error: null });
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      auth: {
        signOut: signOutMock,
      },
    });

    const req = new Request('http://localhost:3000/api/auth/signout', {
      method: 'POST',
    });

    const res = await POST(req);

    expect(signOutMock).toHaveBeenCalled();
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/login');
  });
});
