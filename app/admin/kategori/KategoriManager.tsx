'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kategoriSchema, type KategoriInput } from '@/lib/validation';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import Alert from '@/components/Alert';
import type { KategoriSurat } from '@/lib/supabase/types';

export default function KategoriManager({
  initialData,
}: {
  initialData: KategoriSurat[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KategoriSurat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KategoriSurat | null>(null);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KategoriInput>({ resolver: zodResolver(kategoriSchema) });

  function openAdd() {
    setEditing(null);
    reset({ nama_kategori: '', deskripsi: '' });
    setServerError('');
    setModalOpen(true);
  }

  function openEdit(item: KategoriSurat) {
    setEditing(item);
    reset({ nama_kategori: item.nama_kategori, deskripsi: item.deskripsi ?? '' });
    setServerError('');
    setModalOpen(true);
  }

  async function onSubmit(data: KategoriInput) {
    setLoading(true);
    setServerError('');

    const query = editing
      ? supabase.from('kategori_surat').update(data).eq('id', editing.id)
      : supabase.from('kategori_surat').insert(data);

    const { error } = await query;
    setLoading(false);

    if (error) {
      setServerError('Gagal menyimpan kategori. Silakan coba lagi.');
      return;
    }

    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    const { error } = await supabase
      .from('kategori_surat')
      .delete()
      .eq('id', deleteTarget.id);

    setDeleting(false);

    if (error) {
      // Kemungkinan ada pengajuan yang masih mereferensikan kategori ini
      setDeleteTarget(null);
      return;
    }

    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
        >
          + Tambah Kategori
        </button>
      </div>

      {initialData.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          Belum ada kategori surat. Tambahkan kategori pertama.
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nama Kategori</th>
                <th className="text-left px-4 py-3 font-medium">Deskripsi</th>
                <th className="text-right px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {initialData.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {item.nama_kategori}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.deskripsi || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Kategori Surat' : 'Tambah Kategori Surat'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <Alert type="error" message={serverError} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              {...register('nama_kategori')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Contoh: Surat Keterangan Aktif Kuliah"
            />
            {errors.nama_kategori && (
              <p className="text-sm text-red-600 mt-1">{errors.nama_kategori.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi (opsional)
            </label>
            <textarea
              {...register('deskripsi')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Penjelasan singkat tentang kategori surat ini"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Kategori Surat"
        message={`Apakah kamu yakin ingin menghapus kategori "${deleteTarget?.nama_kategori}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
