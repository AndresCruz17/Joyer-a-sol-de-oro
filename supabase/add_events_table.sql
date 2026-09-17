-- ==============================================================================
-- TABLA DE EVENTOS Y STORAGE COMPLETO (180 VIP & JOYERÍA SOL DE ORO)
-- Copia y pega TODO este contenido en Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Eliminar tabla events anterior (para asegurar que se cree con todas las columnas necesarias)
drop table if exists public.events cascade;

-- 2. Crear tabla events con todas las columnas requeridas por el panel admin y la web
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  tag         text not null default 'EVENTO ESPECIAL',
  slug        text default '',
  event_date  date not null,
  time        text not null default '10:00 PM',
  artist      text,
  description text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 3. Habilitar Seguridad por Filas (RLS)
alter table public.events enable row level security;

-- 4. Índices para consultas rápidas
create index if not exists events_event_date_idx on public.events (event_date);
create index if not exists events_is_active_idx on public.events (is_active);

-- 5. Políticas RLS de la tabla events
-- Lectura: los visitantes públicos ven eventos activos; administradores ven todos
drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events for select
  to public
  using (
    is_active = true
    or auth.role() = 'authenticated'
    or exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- Escritura: usuarios administradores autenticados pueden crear, editar y borrar
drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all"
  on public.events for all
  to authenticated
  using (true)
  with check (true);

-- 6. Configurar Bucket de Storage 'events'
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do update set public = true;

-- Políticas de Storage para imágenes de eventos
drop policy if exists "events_storage_public_read" on storage.objects;
create policy "events_storage_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'events');

drop policy if exists "events_storage_auth_insert" on storage.objects;
create policy "events_storage_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'events');

drop policy if exists "events_storage_auth_update" on storage.objects;
create policy "events_storage_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'events')
  with check (bucket_id = 'events');

drop policy if exists "events_storage_auth_delete" on storage.objects;
create policy "events_storage_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'events');

-- 7. Insertar evento inicial de prueba
insert into public.events (title, tag, event_date, time, artist, description, is_active)
values (
  'Noche VIP & Live DJ Set',
  'EVENTO ESPECIAL',
  (current_date + interval '2 days')::date,
  '10:00 PM',
  'DJ Invitado Especial',
  'Vive la mejor fiesta con show de luces, pirotecnia fría, servicio de botellas y coctelería premium.',
  true
);

-- 8. Forzar recarga inmediata de la caché de PostgREST
notify pgrst, 'reload schema';
