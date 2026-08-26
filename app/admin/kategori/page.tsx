import { createClient } from '@/lib/supabase/server';
import KategoriManager from './KategoriManager';

export default async function KategoriPage() {
  const supabase = await createClient();
  const { data: kategoriList } = await supabase
    .from('kategori_surat')
    .select('*')
    .order('nama_kategori');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Kategori Surat</h1>
      <p className="text-gray-600 mb-6">
        Kelola jenis-jenis surat yang bisa diajukan mahasiswa.
      </p>
      <KategoriManager initialData={kategoriList ?? []} />
    </div>
  );
}
