-- ==============================================================================
-- PREREQUISITOS: admin_users + is_admin() (si no existen)
-- ==============================================================================

-- Tabla de administradores
create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

-- Función de verificación de administrador
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ==============================================================================
-- MIGRACIÓN: TABLA DE EVENTOS
-- ==============================================================================

-- 1. ELIMINAR TABLA ANTERIOR (si existe de una sesión previa incompleta)
drop table if exists public.events cascade;

-- 2. CREAR TABLA events CON ESQUEMA CORRECTO
create table public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null,
    description text,
    event_date timestamptz not null,
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 2. ÍNDICES DE RENDIMIENTO
create index if not exists events_slug_idx on public.events (slug);
create index if not exists events_active_date_idx on public.events (is_active, event_date desc);

-- 3. HABILITAR RLS
alter table public.events enable row level security;

-- 4. POLÍTICAS RLS
drop policy if exists "Active events are viewable by everyone" on public.events;
create policy "Active events are viewable by everyone"
  on public.events
  for select
  using (is_active = true or (select public.is_admin()));

drop policy if exists "Admins can insert events" on public.events;
create policy "Admins can insert events"
  on public.events
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update events" on public.events;
create policy "Admins can update events"
  on public.events
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events"
  on public.events
  for delete
  to authenticated
  using ((select public.is_admin()));

-- 5. BUCKET DE STORAGE (events)
insert into storage.buckets (id, name, public)
values ('events', 'events', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access Events Bucket" on storage.objects;
create policy "Public Access Events Bucket"
  on storage.objects
  for select
  using (bucket_id = 'events');

drop policy if exists "Admins can upload to events bucket" on storage.objects;
create policy "Admins can upload to events bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'events' and (select public.is_admin()));

drop policy if exists "Admins can update events bucket" on storage.objects;
create policy "Admins can update events bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'events' and (select public.is_admin()))
  with check (bucket_id = 'events' and (select public.is_admin()));

drop policy if exists "Admins can delete from events bucket" on storage.objects;
create policy "Admins can delete from events bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'events' and (select public.is_admin()));
