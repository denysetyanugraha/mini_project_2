'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Alert from '@/components/Alert';
import type { PengajuanWithRelations, StatusPengajuan } from '@/lib/supabase/types';

const STATUS_OPTIONS: { value: StatusPengajuan; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'ditolak', label: 'Ditolak' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

export default function PengajuanDetailForm({
  pengajuan,
}: {
  pengajuan: PengajuanWithRelations;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<StatusPengajuan>(pengajuan.status);
  const [catatan, setCatatan] = useState(pengajuan.catatan_admin ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState(pengajuan.file_surat_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleFileUpload(): Promise<string | null> {
    if (!file) return fileUrl || null;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan PDF, PNG, atau JPG/JPEG.');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file terlalu besar. Maksimal 10 MB.');
      return null;
    }

    setUploading(true);
    const filePath = `${pengajuan.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('surat-files')
      .upload(filePath, file, { upsert: true, contentType: file.type });

    setUploading(false);

    if (uploadError) {
      setError(`Gagal mengunggah file surat: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from('surat-files').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSave() {
    setError('');
    setSuccess(false);
    setSaving(true);

    let uploadedUrl = fileUrl;
    if (file) {
      const result = await handleFileUpload();
      if (result === null) {
        setSaving(false);
        return;
      }
      uploadedUrl = result;
    }

    try {
      const res = await fetch(`/api/pengajuan/${pengajuan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          catatan_admin: catatan,
          file_surat_url: uploadedUrl,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Gagal menyimpan perubahan. Silakan coba lagi.');
        setSaving(false);
        return;
      }

      setFileUrl(uploadedUrl);
      setSuccess(true);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploading;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
      <h2 className="font-semibold text-gray-900">Proses Pengajuan</h2>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message="Perubahan berhasil disimpan." />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusPengajuan)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan Admin (opsional)
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Contoh: Surat sudah siap diambil di ruang TU, atau alasan penolakan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Surat Jadi (opsional, untuk status diterima)
        </label>
        <input
          type="file"
            accept="application/pdf,image/png,image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        {fileUrl && !file && (
          <p className="text-sm text-gray-500 mt-1">
            File saat ini:{' '}
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              Lihat file
            </a>
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={busy}
        className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
      >
        {uploading ? 'Mengunggah file...' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  );
}
