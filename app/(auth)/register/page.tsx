'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema, type RegisterInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import Alert from '@/components/Alert';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setServerError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nama: data.nama,
            nim: data.nim,
            role: 'mahasiswa',
          },
        },
      });

      console.log('Supabase Sign Up Data:', signUpData);
      console.log('Supabase Sign Up Error:', error);

      if (error) {
        console.error('Supabase Register Error:', error);

        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists')
        ) {
          setServerError(
            'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun tersebut.'
          );
        } else {
          setServerError(`Gagal mendaftar: ${error.message}`);
        }

        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err) {
      console.error('Unexpected Register Error:', err);

      setServerError(
        'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Daftar Akun
          </h1>

          <p className="text-sm text-gray-600 mt-1">
            Buat akun mahasiswa untuk mengajukan surat
          </p>
        </div>

        {serverError && (
          <Alert
            type="error"
            message={serverError}
          />
        )}

        {success && (
          <Alert
            type="success"
            message="Pendaftaran berhasil! Mengarahkan ke halaman login..."
          />
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>

            <input
              type="text"
              {...register('nama')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nama sesuai KTM"
              disabled={loading}
            />

            {errors.nama && (
              <p className="text-sm text-red-600 mt-1">
                {errors.nama.message}
              </p>
            )}
          </div>

          {/* NIM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIM
            </label>

            <input
              type="text"
              {...register('nim')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nomor Induk Mahasiswa"
              disabled={loading}
            />

            {errors.nim && (
              <p className="text-sm text-red-600 mt-1">
                {errors.nim.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="nama@kampus.ac.id"
              disabled={loading}
            />

            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Minimal 6 karakter"
              disabled={loading}
            />

            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>

            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ulangi password"
              disabled={loading}
            />

            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Tombol */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}