-- =========================================================
-- Sistem Pengajuan Surat Kampus - Initial Migration
-- =========================================================

-- Pastikan extension untuk gen_random_uuid() aktif
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. TABEL profiles
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  nim text unique,
  role text not null default 'mahasiswa' check (role in ('mahasiswa', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------
-- 2. TABEL kategori_surat
-- ---------------------------------------------------------
create table if not exists public.kategori_surat (
  id uuid primary key default gen_random_uuid(),
  nama_kategori text not null,
  deskripsi text,
  created_at timestamptz not null default now()
);

alter table public.kategori_surat enable row level security;

-- ---------------------------------------------------------
-- 3. TABEL pengajuan_surat
-- ---------------------------------------------------------
create table if not exists public.pengajuan_surat (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.profiles(id) on delete cascade,
  kategori_id uuid not null references public.kategori_surat(id),
  keperluan text,
  status text not null default 'pending' check (status in ('pending', 'diproses', 'diterima', 'ditolak')),
  catatan_admin text,
  file_surat_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pengajuan_surat enable row level security;

create index if not exists idx_pengajuan_mahasiswa_id on public.pengajuan_surat(mahasiswa_id);
create index if not exists idx_pengajuan_status on public.pengajuan_surat(status);

-- ---------------------------------------------------------
-- 4. TABEL data_mahasiswa (referensi hasil import admin)
-- ---------------------------------------------------------
create table if not exists public.data_mahasiswa (
  id uuid primary key default gen_random_uuid(),
  nim text unique not null,
  nama text not null,
  prodi text,
  angkatan text,
  created_at timestamptz not null default now()
);

alter table public.data_mahasiswa enable row level security;

-- =========================================================
-- FUNCTION: helper untuk cek role admin dari auth.uid()
-- (dipakai berulang kali di policy agar tidak recursive)
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- TRIGGER: updated_at otomatis untuk pengajuan_surat
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pengajuan_updated_at on public.pengajuan_surat;
create trigger trg_pengajuan_updated_at
  before update on public.pengajuan_surat
  for each row execute function public.set_updated_at();

-- =========================================================
-- TRIGGER: auto-insert profiles saat user baru signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama, nim, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama', 'Tanpa Nama'),
    new.raw_user_meta_data->>'nim',
    coalesce(new.raw_user_meta_data->>'role', 'mahasiswa')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- RLS POLICIES: profiles
-- =========================================================
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Catatan: insert ke profiles dilakukan lewat trigger handle_new_user
-- (security definer), jadi tidak perlu policy insert untuk user biasa.

-- =========================================================
-- RLS POLICIES: kategori_surat
-- =========================================================
drop policy if exists "kategori_select_all_authenticated" on public.kategori_surat;
create policy "kategori_select_all_authenticated"
  on public.kategori_surat for select
  to authenticated
  using (true);

drop policy if exists "kategori_insert_admin" on public.kategori_surat;
create policy "kategori_insert_admin"
  on public.kategori_surat for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "kategori_update_admin" on public.kategori_surat;
create policy "kategori_update_admin"
  on public.kategori_surat for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "kategori_delete_admin" on public.kategori_surat;
create policy "kategori_delete_admin"
  on public.kategori_surat for delete
  to authenticated
  using (public.is_admin());

-- =========================================================
-- RLS POLICIES: pengajuan_surat
-- =========================================================
-- Mahasiswa: select hanya miliknya sendiri, admin: select semua
drop policy if exists "pengajuan_select_own_or_admin" on public.pengajuan_surat;
create policy "pengajuan_select_own_or_admin"
  on public.pengajuan_surat for select
  to authenticated
  using (mahasiswa_id = auth.uid() or public.is_admin());

-- Mahasiswa: insert hanya untuk dirinya sendiri
drop policy if exists "pengajuan_insert_own" on public.pengajuan_surat;
create policy "pengajuan_insert_own"
  on public.pengajuan_surat for insert
  to authenticated
  with check (mahasiswa_id = auth.uid());

-- Hanya admin yang boleh update (mahasiswa tidak boleh ubah status sendiri)
drop policy if exists "pengajuan_update_admin_only" on public.pengajuan_surat;
create policy "pengajuan_update_admin_only"
  on public.pengajuan_surat for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- RLS POLICIES: data_mahasiswa (hanya admin)
-- =========================================================
drop policy if exists "data_mahasiswa_select_admin" on public.data_mahasiswa;
create policy "data_mahasiswa_select_admin"
  on public.data_mahasiswa for select
  to authenticated
  using (public.is_admin());

drop policy if exists "data_mahasiswa_insert_admin" on public.data_mahasiswa;
create policy "data_mahasiswa_insert_admin"
  on public.data_mahasiswa for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "data_mahasiswa_update_admin" on public.data_mahasiswa;
create policy "data_mahasiswa_update_admin"
  on public.data_mahasiswa for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "data_mahasiswa_delete_admin" on public.data_mahasiswa;
create policy "data_mahasiswa_delete_admin"
  on public.data_mahasiswa for delete
  to authenticated
  using (public.is_admin());

-- =========================================================
-- STORAGE: bucket untuk file surat hasil jadi
-- =========================================================
insert into storage.buckets (id, name, public)
values ('surat-files', 'surat-files', true)
on conflict (id) do nothing;

drop policy if exists "surat_files_admin_write" on storage.objects;
create policy "surat_files_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'surat-files' and public.is_admin());

drop policy if exists "surat_files_admin_update" on storage.objects;
create policy "surat_files_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'surat-files' and public.is_admin());

drop policy if exists "surat_files_public_read" on storage.objects;
create policy "surat_files_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'surat-files');
