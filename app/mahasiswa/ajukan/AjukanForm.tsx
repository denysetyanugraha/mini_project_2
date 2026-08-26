'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pengajuanSchema, type PengajuanInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import Alert from '@/components/Alert';
import type { KategoriSurat } from '@/lib/supabase/types';

export default function AjukanForm({
  kategoriList,
}: {
  kategoriList: Pick<KategoriSurat, 'id' | 'nama_kategori' | 'deskripsi'>[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PengajuanInput>({ resolver: zodResolver(pengajuanSchema) });

  async function onSubmit(data: PengajuanInput) {
    setServerError('');
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setServerError('Sesi login tidak ditemukan. Silakan masuk kembali.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('pengajuan_surat').insert({
      mahasiswa_id: user.id,
      kategori_id: data.kategori_id,
      keperluan: data.keperluan,
      status: 'pending',
    });

    setLoading(false);

    if (error) {
      setServerError('Gagal mengirim pengajuan. Silakan coba lagi beberapa saat lagi.');
      return;
    }

    router.push('/mahasiswa/status?submitted=1');
    router.refresh();
  }

  if (kategoriList.length === 0) {
    return (
      <Alert
        type="info"
        message="Belum ada kategori surat yang tersedia. Silakan hubungi admin kampus."
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl border shadow-sm p-6 space-y-5"
    >
      {serverError && <Alert type="error" message={serverError} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori Surat
        </label>
        <select
          {...register('kategori_id')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          defaultValue=""
        >
          <option value="" disabled>
            -- Pilih kategori surat --
          </option>
          {kategoriList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama_kategori}
            </option>
          ))}
        </select>
        {errors.kategori_id && (
          <p className="text-sm text-red-600 mt-1">{errors.kategori_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keperluan
        </label>
        <textarea
          {...register('keperluan')}
          rows={5}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Jelaskan keperluan pengajuan surat ini secara singkat dan jelas..."
        />
        {errors.keperluan && (
          <p className="text-sm text-red-600 mt-1">{errors.keperluan.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition disabled:opacity-50"
      >
        {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
      </button>
    </form>
  );
}
