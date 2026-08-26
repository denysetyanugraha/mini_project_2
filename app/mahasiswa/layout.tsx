import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';

export default async function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama, role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (profile.role === 'admin') redirect('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="mahasiswa" nama={profile.nama} />
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
