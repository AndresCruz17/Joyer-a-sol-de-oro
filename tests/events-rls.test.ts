import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Tests que validan la estructura de las políticas RLS para la tabla events
 * en el archivo schema.sql, siguiendo el mismo patrón usado para products y categories.
 */
describe('12. Políticas RLS para Tabla events (Análisis del Schema SQL)', () => {
  const schemaPath = path.resolve(__dirname, '..', 'supabase', 'schema.sql');
  let schemaSql: string;

  // Cargar el schema una vez
  try {
    schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  } catch {
    schemaSql = '';
  }

  describe('Definición de Tabla events', () => {
    it('el schema debe definir la tabla public.events con las columnas requeridas', () => {
      expect(schemaSql).toContain('create table if not exists public.events');
      expect(schemaSql).toContain('id uuid primary key default gen_random_uuid()');
      expect(schemaSql).toContain('title text not null');
      expect(schemaSql).toContain('slug text not null');
      expect(schemaSql).toContain('event_date timestamptz not null');
      expect(schemaSql).toContain('image_url text');
      expect(schemaSql).toContain('is_active boolean not null default true');
    });

    it('debe tener índices de rendimiento para slug y eventos activos por fecha', () => {
      expect(schemaSql).toContain('events_slug_idx');
      expect(schemaSql).toContain('events_active_date_idx');
    });
  });

  describe('RLS Habilitado para events', () => {
    it('debe habilitar Row Level Security en la tabla events', () => {
      expect(schemaSql).toContain('alter table public.events enable row level security');
    });
  });

  describe('Políticas de Lectura (SELECT) para events', () => {
    it('debe permitir lectura pública de eventos activos (is_active = true)', () => {
      expect(schemaSql).toContain('Active events are viewable by everyone');
      // Verificar que la política usa is_active = true OR is_admin()
      const selectPolicyRegex = /create policy "Active events are viewable by everyone"[\s\S]*?using\s*\(is_active\s*=\s*true\s+or\s+\(select\s+public\.is_admin\(\)\)\)/;
      expect(schemaSql).toMatch(selectPolicyRegex);
    });
  });

  describe('Políticas de Escritura (INSERT, UPDATE, DELETE) para events', () => {
    it('INSERT debe requerir public.is_admin()', () => {
      expect(schemaSql).toContain('Admins can insert events');
      const insertPolicyRegex = /create policy "Admins can insert events"[\s\S]*?with check\s*\(\(select\s+public\.is_admin\(\)\)\)/;
      expect(schemaSql).toMatch(insertPolicyRegex);
    });

    it('UPDATE debe requerir public.is_admin() en USING y WITH CHECK', () => {
      expect(schemaSql).toContain('Admins can update events');
      const updatePolicyRegex = /create policy "Admins can update events"[\s\S]*?using\s*\(\(select\s+public\.is_admin\(\)\)\)[\s\S]*?with check\s*\(\(select\s+public\.is_admin\(\)\)\)/;
      expect(schemaSql).toMatch(updatePolicyRegex);
    });

    it('DELETE debe requerir public.is_admin()', () => {
      expect(schemaSql).toContain('Admins can delete events');
      const deletePolicyRegex = /create policy "Admins can delete events"[\s\S]*?using\s*\(\(select\s+public\.is_admin\(\)\)\)/;
      expect(schemaSql).toMatch(deletePolicyRegex);
    });
  });

  describe('Storage Bucket events', () => {
    it('debe definir el bucket de storage "events" como público', () => {
      expect(schemaSql).toContain("values ('events', 'events', true)");
    });

    it('debe tener política de lectura pública para el bucket events', () => {
      expect(schemaSql).toContain('Public Access Events Bucket');
      expect(schemaSql).toContain("bucket_id = 'events'");
    });

    it('debe restringir subida/update/delete del bucket events a administradores', () => {
      expect(schemaSql).toContain('Admins can upload to events bucket');
      expect(schemaSql).toContain('Admins can update events bucket');
      expect(schemaSql).toContain('Admins can delete from events bucket');
    });
  });

  describe('Consistencia con Patrón de Productos', () => {
    it('las políticas de events deben seguir el mismo patrón que products', () => {
      // Verificar que events usa el mismo is_admin() que products
      const productSelectPolicy = schemaSql.includes('Active products are viewable by everyone');
      const eventSelectPolicy = schemaSql.includes('Active events are viewable by everyone');
      expect(productSelectPolicy).toBe(true);
      expect(eventSelectPolicy).toBe(true);

      // Ambas tablas usan `to authenticated` para escritura
      const productInsertAuth = /create policy "Admins can insert products"[\s\S]*?to authenticated/;
      const eventInsertAuth = /create policy "Admins can insert events"[\s\S]*?to authenticated/;
      expect(schemaSql).toMatch(productInsertAuth);
      expect(schemaSql).toMatch(eventInsertAuth);
    });
  });
});
