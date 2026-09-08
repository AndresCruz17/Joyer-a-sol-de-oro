import { describe, it, expect } from 'vitest';

/**
 * Simulador determinista del motor de evaluación de políticas RLS de Postgres
 * basado exactamente en las reglas declaradas en supabase/schema.sql.
 */

type UserRole = 'anon' | 'authenticated_non_admin' | 'admin';

interface SecurityContext {
  role: UserRole;
  authUid: string | null;
  isAdmin: boolean;
}

function evaluateCategorySelect(context: SecurityContext): boolean {
  // Política: "Categories are viewable by everyone" USING (true)
  return true;
}

function evaluateCategoryMutation(context: SecurityContext): boolean {
  // Política: WITH CHECK / USING (public.is_admin())
  if (context.role === 'anon') return false;
  return context.isAdmin;
}

function evaluateProductSelect(product: { is_active: boolean }, context: SecurityContext): boolean {
  // Política: "Active products are viewable by everyone" USING (is_active = true or public.is_admin())
  return product.is_active === true || context.isAdmin;
}

function evaluateProductMutation(context: SecurityContext): boolean {
  // Políticas: Admins can insert/update/delete products
  if (context.role === 'anon') return false;
  return context.isAdmin;
}

function evaluateStorageUpload(bucket: string, context: SecurityContext): boolean {
  // Política: "Admins can upload to products bucket" WITH CHECK (bucket_id = 'products' and is_admin())
  if (bucket !== 'products') return false;
  if (context.role === 'anon') return false;
  return context.isAdmin;
}

function evaluateStorageDelete(bucket: string, context: SecurityContext): boolean {
  // Política: "Admins can delete from products bucket" USING (bucket_id = 'products' and is_admin())
  if (bucket !== 'products') return false;
  if (context.role === 'anon') return false;
  return context.isAdmin;
}

describe('7. Matriz de Seguridad y Políticas RLS (Row Level Security)', () => {
  const anonUser: SecurityContext = { role: 'anon', authUid: null, isAdmin: false };
  const regularUser: SecurityContext = { role: 'authenticated_non_admin', authUid: 'user-normal-uuid', isAdmin: false };
  const adminUser: SecurityContext = { role: 'admin', authUid: 'admin-uuid', isAdmin: true };

  describe('Tabla categories', () => {
    it('debe permitir SELECT público a anónimos, usuarios comunes y admins', () => {
      expect(evaluateCategorySelect(anonUser)).toBe(true);
      expect(evaluateCategorySelect(regularUser)).toBe(true);
      expect(evaluateCategorySelect(adminUser)).toBe(true);
    });

    it('debe denegar INSERT/UPDATE/DELETE a visitantes anónimos', () => {
      expect(evaluateCategoryMutation(anonUser)).toBe(false);
    });

    it('debe denegar INSERT/UPDATE/DELETE a usuarios autenticados sin rol admin', () => {
      expect(evaluateCategoryMutation(regularUser)).toBe(false);
    });

    it('debe permitir INSERT/UPDATE/DELETE únicamente al administrador', () => {
      expect(evaluateCategoryMutation(adminUser)).toBe(true);
    });
  });

  describe('Tabla products', () => {
    const activeProduct = { is_active: true };
    const inactiveProduct = { is_active: false };

    it('debe permitir ver productos activos a visitantes anónimos y usuarios comunes', () => {
      expect(evaluateProductSelect(activeProduct, anonUser)).toBe(true);
      expect(evaluateProductSelect(activeProduct, regularUser)).toBe(true);
    });

    it('debe PROHIBIR la visibilidad de productos inactivos a visitantes y usuarios no administradores', () => {
      expect(evaluateProductSelect(inactiveProduct, anonUser)).toBe(false);
      expect(evaluateProductSelect(inactiveProduct, regularUser)).toBe(false);
    });

    it('debe permitir ver productos inactivos al administrador para su gestión en el panel', () => {
      expect(evaluateProductSelect(inactiveProduct, adminUser)).toBe(true);
    });

    it('debe restringir INSERT/UPDATE/DELETE exclusivamente a administradores', () => {
      expect(evaluateProductMutation(anonUser)).toBe(false);
      expect(evaluateProductMutation(regularUser)).toBe(false);
      expect(evaluateProductMutation(adminUser)).toBe(true);
    });
  });

  describe('Storage (Bucket products)', () => {
    it('debe bloquear subidas o borrados de imágenes para anónimos y no admins', () => {
      expect(evaluateStorageUpload('products', anonUser)).toBe(false);
      expect(evaluateStorageUpload('products', regularUser)).toBe(false);
      expect(evaluateStorageDelete('products', anonUser)).toBe(false);
      expect(evaluateStorageDelete('products', regularUser)).toBe(false);
    });

    it('debe autorizar subidas y borrados en el bucket products para administradores', () => {
      expect(evaluateStorageUpload('products', adminUser)).toBe(true);
      expect(evaluateStorageDelete('products', adminUser)).toBe(true);
    });

    it('debe rechazar operaciones en buckets no autorizados incluso para administradores', () => {
      expect(evaluateStorageUpload('system-private', adminUser)).toBe(false);
      expect(evaluateStorageDelete('system-private', adminUser)).toBe(false);
    });
  });
});
