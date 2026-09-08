-- ==============================================================================
-- JOYERÍA SOL DE ORO - ESQUEMA DE SEGURIDAD Y ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. TABLA DE CATEGORÍAS (si no existe)
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    image_url text,
    description text,
    created_at timestamptz not null default now()
);

-- 2. TABLA DE PRODUCTOS / JOYAS (si no existe)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null,
    category_id uuid references public.categories(id) on delete set null,
    price numeric(14, 2),
    weight_grams numeric(8, 2),
    description text,
    is_featured boolean not null default false,
    image_url text,
    images text[] default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

-- 3. TABLA DE USUARIOS ADMINISTRADORES (Role-Based Access Control)
create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

-- 4. ÍNDICES DE RENDIMIENTO Y BÚSQUEDA
-- 4.1 Búsqueda rápida de categorías por slug (incluyendo consultas case-insensitive con lower/ilike)
create index if not exists categories_slug_idx on public.categories (slug);
create index if not exists categories_slug_lower_idx on public.categories (lower(slug));
-- 4.2 Ordenamiento alfabético de categorías en menús, filtros y navegación
create index if not exists categories_name_idx on public.categories (name asc);

-- 4.3 Búsqueda de joyas por slug
create index if not exists products_slug_idx on public.products (slug);
-- 4.4 Catálogo general: joyas activas ordenadas por fecha de creación (evita Sort en memoria)
create index if not exists products_active_created_idx on public.products (is_active, created_at desc);
-- 4.5 Colecciones y productos relacionados: filtro por categoría y estado activo ordenado por fecha
create index if not exists products_category_active_idx on public.products (category_id, is_active, created_at desc);
-- 4.6 Destacados de portada: filtro por activo y destacado ordenado por fecha
create index if not exists products_featured_active_idx on public.products (is_active, is_featured, created_at desc);

-- 5. FUNCIÓN DE VERIFICACIÓN DE ADMINISTRADOR (SECURITY DEFINER + search_path SEGURO)
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

-- Revocar ejecución innecesaria y otorgar a roles requeridos
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ==============================================================================
-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- ==============================================================================
-- 7. POLÍTICAS RLS PARA admin_users
-- ==============================================================================
drop policy if exists "Admins can view admin_users" on public.admin_users;
create policy "Admins can view admin_users"
  on public.admin_users
  for select
  to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can manage admin_users" on public.admin_users;
create policy "Admins can manage admin_users"
  on public.admin_users
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ==============================================================================
-- 8. POLÍTICAS RLS PARA categories
-- ==============================================================================
-- Lectura pública para cualquier visitante
drop policy if exists "Categories are viewable by everyone" on public.categories;
create policy "Categories are viewable by everyone"
  on public.categories
  for select
  using (true);

-- Modificación (INSERT, UPDATE, DELETE) EXCLUSIVA para administradores
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories
  for delete
  to authenticated
  using ((select public.is_admin()));

-- ==============================================================================
-- 9. POLÍTICAS RLS PARA products
-- ==============================================================================
-- Lectura: Público solo puede ver productos activos (is_active = true),
-- mientras que los administradores pueden ver todos (activos e inactivos).
drop policy if exists "Active products are viewable by everyone" on public.products;
create policy "Active products are viewable by everyone"
  on public.products
  for select
  using (is_active = true or (select public.is_admin()));

-- Modificación (INSERT, UPDATE, DELETE) EXCLUSIVA para administradores
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using ((select public.is_admin()));

-- ==============================================================================
-- 10. POLÍTICAS RLS PARA STORAGE (Bucket 'products')
-- ==============================================================================
-- Asegurar que el bucket 'products' exista y sea público para lectura
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- Lectura pública de objetos del bucket 'products'
drop policy if exists "Public Access Products Bucket" on storage.objects;
create policy "Public Access Products Bucket"
  on storage.objects
  for select
  using (bucket_id = 'products');

-- Inserción, actualización y borrado de imágenes EXCLUSIVO para administradores
drop policy if exists "Admins can upload to products bucket" on storage.objects;
create policy "Admins can upload to products bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'products' and (select public.is_admin()));

drop policy if exists "Admins can update products bucket" on storage.objects;
create policy "Admins can update products bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()))
  with check (bucket_id = 'products' and (select public.is_admin()));

drop policy if exists "Admins can delete from products bucket" on storage.objects;
create policy "Admins can delete from products bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'products' and (select public.is_admin()));

-- ==============================================================================
-- INSTRUCCIONES PARA ASIGNAR EL PRIMER ADMINISTRADOR:
-- 1. Regístrate o crea el usuario en Supabase Dashboard > Authentication > Users.
-- 2. Copia el 'User UID' (ej: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx').
-- 3. Ejecuta la siguiente consulta en el SQL Editor de Supabase:
--
--    INSERT INTO public.admin_users (user_id)
--    VALUES ('PEGA_AQUI_EL_USER_UID')
--    ON CONFLICT (user_id) DO NOTHING;
-- ==============================================================================
