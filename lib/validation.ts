import { z } from 'zod';

export const registerSchema = z
  .object({
    nama: z.string().min(3, 'Nama minimal 3 karakter'),
    nim: z
      .string()
      .min(5, 'NIM minimal 5 karakter')
      .regex(/^[0-9A-Za-z]+$/, 'NIM hanya boleh berisi huruf dan angka'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const pengajuanSchema = z.object({
  kategori_id: z.string().uuid('Pilih kategori surat terlebih dahulu'),
  keperluan: z
    .string()
    .min(10, 'Keperluan minimal 10 karakter, jelaskan secara singkat dan jelas')
    .max(1000, 'Keperluan maksimal 1000 karakter'),
});

export type PengajuanInput = z.infer<typeof pengajuanSchema>;

export const kategoriSchema = z.object({
  nama_kategori: z.string().min(3, 'Nama kategori minimal 3 karakter'),
  deskripsi: z.string().optional(),
});

export type KategoriInput = z.infer<typeof kategoriSchema>;

export const updatePengajuanSchema = z.object({
  status: z.enum(['pending', 'diproses', 'diterima', 'ditolak']),
  catatan_admin: z.string().optional(),
  file_surat_url: z.string().optional(),
});

export type UpdatePengajuanInput = z.infer<typeof updatePengajuanSchema>;
