import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = (profile as { role?: string } | null)?.role;

    redirect(role === 'admin' ? '/admin' : '/mahasiswa');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sistem Pengajuan Surat Kampus
          </h1>

          <p className="mt-2 text-gray-600">
            Ajukan surat administrasi kampus secara online, pantau statusnya kapan saja.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="px-6 py-2.5 rounded-lg border border-primary-600 text-primary-600 font-medium hover:bg-primary-50 transition"
          >
            Daftar Akun
          </Link>
        </div>
      </div>
    </main>
  );
}