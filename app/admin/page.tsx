import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  diproses: 'Diproses',
  diterima: 'Diterima',
  ditolak: 'Ditolak',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  diproses: 'bg-blue-50 text-blue-700 border-blue-200',
  diterima: 'bg-green-50 text-green-700 border-green-200',
  ditolak: 'bg-red-50 text-red-700 border-red-200',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase.from('pengajuan_surat').select('status');
  const pengajuanList = (data ?? []) as Array<{ status?: string | null }>;

  const counts = { pending: 0, diproses: 0, diterima: 0, ditolak: 0 };
  pengajuanList.forEach((p) => {
    const status = (p.status ?? 'pending') as keyof typeof counts;
    if (status in counts) {
      counts[status] += 1;
    }
  });

  const total = pengajuanList?.length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Admin</h1>
      <p className="text-gray-600 mb-6">Ringkasan pengajuan surat kampus.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Pengajuan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className={`rounded-xl border p-5 ${STATUS_COLORS[key]}`}>
            <p className="text-sm opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-1">
              {counts[key as keyof typeof counts]}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/pengajuan"
          className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
        >
          Kelola Pengajuan Surat
        </Link>
        <Link
          href="/admin/kategori"
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Kelola Kategori Surat
        </Link>
        <Link
          href="/admin/import-mahasiswa"
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Import Data Mahasiswa
        </Link>
      </div>
    </div>
  );
}
