# Sistem Pengajuan Surat Kampus

Aplikasi web full-stack untuk mengelola pengajuan surat administrasi kampus, dibangun dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, dan Supabase (Postgres + Auth + Storage + RLS).

## Fitur

**Mahasiswa**

**Admin**


## 1. Setup Project Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan seluruh isi file `supabase/migrations/0001_init.sql`. Migration ini akan:
   - Membuat tabel `profiles`, `kategori_surat`, `pengajuan_surat`, `data_mahasiswa`
   - Mengaktifkan Row Level Security dan seluruh policy sesuai aturan bisnis (mahasiswa hanya bisa lihat/insert data sendiri, admin bisa kelola semua, mahasiswa tidak bisa ubah status sendiri)
   - Membuat trigger `on_auth_user_created` agar setiap user baru otomatis punya row di `profiles`
   - Membuat bucket Storage `surat-files` untuk file hasil surat
3. Buka **Authentication > Providers**, pastikan **Email** provider aktif. Untuk kebutuhan testing lokal, Anda bisa menonaktifkan "Confirm email" sementara di **Authentication > Settings** agar tidak perlu verifikasi email dulu.
4. Buka **Project Settings > API**, salin `Project URL` dan `anon public key` — dibutuhkan di langkah 3.
   Salin juga `service_role key` ke `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.
   Key ini hanya boleh digunakan di server dan jangan diberi awalan `NEXT_PUBLIC_`.

### Membuat akun admin pertama

Secara default, user baru yang mendaftar lewat `/register` akan mendapat role `mahasiswa`. Untuk membuat akun admin pertama:

1. Daftar akun biasa lewat halaman `/register`.
2. Buka **Table Editor > profiles** di dashboard Supabase, cari row dengan email/nama yang baru didaftarkan, ubah kolom `role` menjadi `admin`.
3. Login ulang — akun tersebut akan diarahkan ke `/admin`.


## 2. Instalasi & Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Salin file environment variable
cp .env.example .env.local

# 3. Isi .env.local dengan kredensial dari Supabase (langkah 1.4 di atas)
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxx

# 4. Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser.

Contoh file CSV untuk testing fitur import mahasiswa tersedia di `contoh-data-mahasiswa.csv`.


## 3. Deploy ke Vercel

1. Push project ini ke repository GitHub/GitLab/Bitbucket.
2. Buka [vercel.com](https://vercel.com), klik **New Project**, import repository tersebut.
3. Saat konfigurasi project, tambahkan Environment Variables berikut (untuk Production, Preview, dan Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**.
5. Setelah deploy sukses, catat domain Vercel yang diberikan (misalnya `https://sistem-surat-kampus.vercel.app`).

### Konfigurasi Redirect URL di Supabase Auth

Agar link verifikasi email & flow auth berfungsi di production:

1. Buka **Authentication > URL Configuration** di dashboard Supabase.
2. Set **Site URL** ke domain Vercel Anda, misalnya `https://sistem-surat-kampus.vercel.app`.
3. Tambahkan domain yang sama (dan `http://localhost:3000` untuk development) ke **Redirect URLs**.
4. Simpan perubahan.


## Struktur Project

```
app/
  (auth)/login/            -> halaman login
  (auth)/register/         -> halaman registrasi mahasiswa
  mahasiswa/ajukan/        -> form pengajuan surat
  mahasiswa/status/        -> riwayat & status pengajuan
  admin/                   -> dashboard admin
  admin/kategori/          -> CRUD kategori surat
  admin/pengajuan/         -> daftar & detail pengajuan (ubah status)
  admin/import-mahasiswa/  -> import CSV data mahasiswa
  api/pengajuan/[id]/      -> API route PATCH untuk update status oleh admin
lib/
  supabase/client.ts       -> Supabase client untuk Client Component
  supabase/server.ts       -> Supabase client untuk Server Component
  supabase/middleware.ts   -> helper session untuk middleware.ts
  supabase/types.ts        -> tipe TypeScript untuk skema database
  validation.ts            -> skema validasi zod
components/                -> komponen reusable (Navbar, StatusBadge, Modal, dll)
middleware.ts               -> proteksi route berdasarkan login & role
supabase/migrations/        -> file SQL schema, RLS, trigger, storage bucket
```

## Catatan Teknis

