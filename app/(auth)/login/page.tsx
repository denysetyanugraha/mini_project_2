'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import Alert from '@/components/Alert';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError('');
    setLoading(true);

    const loginEmail = data.email.includes('@')
      ? data.email
      : `${data.email}@kampus.ac.id`;

    let { data: authData, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: data.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials') && (data.email === 'admin_tester@test.com' || data.email === 'mahasiswa_tester@test.com')) {
        // Auto register for test accounts
        const role = data.email === 'admin_tester@test.com' ? 'admin' : 'mahasiswa';
        const nama = role === 'admin' ? 'Admin Testing' : 'Mahasiswa Testing';
        const nim = role === 'admin' ? 'admin' : '12345678';
        
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: { nama, nim, role },
          },
        });
        
        // Coba login lagi setelah register
        const retry = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        authData = retry.data;
        error = retry.error;

        if (error) {
          setLoading(false);
          setServerError(
            "Gagal masuk dengan akun testing. Kemungkinan fitur 'Confirm Email' di Supabase kamu MASIH AKTIF. Silakan matikan dulu di menu Authentication > Providers > Email pada dashboard Supabase."
          );
          return;
        }
      }
      
      if (error) {
        setLoading(false);
        if (error.message.includes('Invalid login credentials')) {
          setServerError('Email atau password salah. Silakan coba lagi.');
        } else {
          setServerError('Terjadi kesalahan saat login. Silakan coba lagi.');
        }
        return;
      }
    }

    if (!authData.user) {
      setLoading(false);
      setServerError('Sesi login tidak ditemukan. Silakan coba lagi.');
      return;
    }

    // Ambil role untuk redirect ke dashboard yang tepat
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    const redirectTo = searchParams.get('redirectTo');
    const target = redirectTo || (profile?.role === 'admin' ? '/admin' : '/mahasiswa');

    router.push(target);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Masuk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Masuk ke Sistem Pengajuan Surat Kampus
          </p>
        </div>

        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email atau NIM
            </label>
            <input
              type="text"
              {...register('email')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="nama@kampus.ac.id atau NIM"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600 text-center mb-3">Login Cepat (Testing):</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSubmit({ email: 'admin_tester@test.com', password: 'password123' })}
              type="button"
              disabled={loading}
              className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50"
            >
              Login Admin
            </button>
            <button
              onClick={() => onSubmit({ email: 'mahasiswa_tester@test.com', password: 'password123' })}
              type="button"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              Login Mahasiswa
            </button>
          </div>
        </div>

        <p className="text-sm text-center text-gray-600">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary-600 font-medium hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
