import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';

export default async function AdminLayout({
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
    .single<{ nama: string; role: string }>();

  if (!profile) redirect('/login');
  if (profile.role !== 'admin') redirect('/mahasiswa');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="admin" nama={profile.nama} />
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
