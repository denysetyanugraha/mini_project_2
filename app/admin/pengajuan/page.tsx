import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import type { PengajuanWithRelations, StatusPengajuan } from '@/lib/supabase/types';

const FILTERS: { value: StatusPengajuan | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'ditolak', label: 'Ditolak' },
];

export default async function AdminPengajuanPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { status } = await searchParams;
  const activeFilter: StatusPengajuan | 'semua' =
    (status as StatusPengajuan | undefined) || 'semua';

  let query = supabase
    .from('pengajuan_surat')
    .select('*, kategori_surat(nama_kategori), profiles(nama, nim)')
    .order('created_at', { ascending: false });

  if (activeFilter !== 'semua') {
    query = query.eq('status', activeFilter);
  }

  const { data: pengajuanList, error } = await query.returns<PengajuanWithRelations[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengajuan Surat</h1>
      <p className="text-gray-600 mb-6">
        Tinjau dan proses seluruh pengajuan surat dari mahasiswa.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'semua' ? '/admin/pengajuan' : `/admin/pengajuan?status=${f.value}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              activeFilter === f.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          Gagal memuat data pengajuan.
        </div>
      ) : !pengajuanList || pengajuanList.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          Tidak ada pengajuan surat pada kategori ini.
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Mahasiswa</th>
                  <th className="text-left px-4 py-3 font-medium">NIM</th>
                  <th className="text-left px-4 py-3 font-medium">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pengajuanList.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{p.profiles?.nama ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.profiles?.nim ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.kategori_surat?.nama_kategori ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(p.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/pengajuan/${p.id}`}
                        className="text-primary-600 font-medium hover:underline"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
