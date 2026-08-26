import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import Alert from '@/components/Alert';
import type { PengajuanWithRelations } from '@/lib/supabase/types';

export default async function StatusPage({
  searchParams,
}: {
  searchParams: { submitted?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pengajuanList, error } = await supabase
    .from('pengajuan_surat')
    .select('*, kategori_surat(nama_kategori)')
    .eq('mahasiswa_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .returns<PengajuanWithRelations[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Status Pengajuan</h1>
      <p className="text-gray-600 mb-6">
        Daftar riwayat pengajuan surat yang pernah kamu ajukan.
      </p>

      {searchParams.submitted && (
        <div className="mb-6">
          <Alert type="success" message="Pengajuan berhasil dikirim! Menunggu peninjauan admin." />
        </div>
      )}

      {error ? (
        <Alert type="error" message="Gagal memuat data pengajuan. Silakan muat ulang halaman." />
      ) : !pengajuanList || pengajuanList.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          Belum ada pengajuan surat. Silakan ajukan surat baru.
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Kategori Surat</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal Pengajuan</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Catatan Admin</th>
                  <th className="text-left px-4 py-3 font-medium">File Surat</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pengajuanList.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-900">
                      {p.kategori_surat?.nama_kategori ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(p.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {p.catatan_admin || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'diterima' && p.file_surat_url ? (
                        <a
                          href={p.file_surat_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 font-medium hover:underline"
                        >
                          Unduh
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
