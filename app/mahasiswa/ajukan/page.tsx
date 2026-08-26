import { createClient } from '@/lib/supabase/server';
import AjukanForm from './AjukanForm';

export default async function AjukanPage() {
  const supabase = await createClient();
  const { data: kategoriList, error } = await supabase
    .from('kategori_surat')
    .select('id, nama_kategori, deskripsi')
    .order('nama_kategori');

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Ajukan Surat</h1>
      <p className="text-gray-600 mb-6">
        Isi form berikut untuk mengajukan permohonan surat administrasi.
      </p>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          Gagal memuat daftar kategori surat. Silakan muat ulang halaman.
        </div>
      ) : (
        <AjukanForm kategoriList={kategoriList ?? []} />
      )}
    </div>
  );
}
