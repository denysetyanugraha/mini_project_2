import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PengajuanDetailForm from './PengajuanDetailForm';
import type { PengajuanWithRelations } from '@/lib/supabase/types';

export default async function PengajuanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: pengajuan, error } = await supabase
    .from('pengajuan_surat')
    .select('*, kategori_surat(nama_kategori), profiles(nama, nim)')
    .eq('id', id)
    .single<PengajuanWithRelations>();

  if (error || !pengajuan) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/pengajuan"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Kembali ke daftar pengajuan
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Detail Pengajuan Surat</h1>

      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6 space-y-3">
        <DetailRow label="Nama Mahasiswa" value={pengajuan.profiles?.nama ?? '-'} />
        <DetailRow label="NIM" value={pengajuan.profiles?.nim ?? '-'} />
        <DetailRow
          label="Kategori Surat"
          value={pengajuan.kategori_surat?.nama_kategori ?? '-'}
        />
        <DetailRow
          label="Tanggal Pengajuan"
          value={new Date(pengajuan.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        <DetailRow label="Keperluan" value={pengajuan.keperluan ?? '-'} multiline />
      </div>

      <PengajuanDetailForm pengajuan={pengajuan} />
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`col-span-2 text-gray-900 ${multiline ? 'whitespace-pre-wrap' : ''}`}>
        {value}
      </span>
    </div>
  );
}
