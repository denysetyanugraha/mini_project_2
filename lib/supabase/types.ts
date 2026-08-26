export type StatusPengajuan = 'pending' | 'diproses' | 'diterima' | 'ditolak';
export type Role = 'mahasiswa' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          [key: string]: unknown;
          id: string;
          nama: string;
          nim: string | null;
          role: Role;
          created_at: string;
        };
        Insert: {
          [key: string]: unknown;
          id: string;
          nama: string;
          nim?: string | null;
          role?: Role;
          created_at?: string;
        };
        Update: {
          [key: string]: unknown;
          nama?: string;
          nim?: string | null;
          role?: Role;
        };
        Relationships: [];
      };
      kategori_surat: {
        Row: {
          [key: string]: unknown;
          id: string;
          nama_kategori: string;
          deskripsi: string | null;
          created_at: string;
        };
        Insert: {
          [key: string]: unknown;
          id?: string;
          nama_kategori: string;
          deskripsi?: string | null;
          created_at?: string;
        };
        Update: {
          [key: string]: unknown;
          nama_kategori?: string;
          deskripsi?: string | null;
        };
        Relationships: [];
      };
      pengajuan_surat: {
        Row: {
          [key: string]: unknown;
          id: string;
          mahasiswa_id: string;
          kategori_id: string;
          keperluan: string | null;
          status: StatusPengajuan;
          catatan_admin: string | null;
          file_surat_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          [key: string]: unknown;
          id?: string;
          mahasiswa_id: string;
          kategori_id: string;
          keperluan?: string | null;
          status?: StatusPengajuan;
          catatan_admin?: string | null;
          file_surat_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          [key: string]: unknown;
          status?: StatusPengajuan;
          catatan_admin?: string | null;
          file_surat_url?: string | null;
        };
        Relationships: [];
      };
      data_mahasiswa: {
        Row: {
          [key: string]: unknown;
          id: string;
          nim: string;
          nama: string;
          prodi: string | null;
          angkatan: string | null;
          created_at: string;
        };
        Insert: {
          [key: string]: unknown;
          id?: string;
          nim: string;
          nama: string;
          prodi?: string | null;
          angkatan?: string | null;
          created_at?: string;
        };
        Update: {
          [key: string]: unknown;
          nama?: string;
          prodi?: string | null;
          angkatan?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type KategoriSurat = Database['public']['Tables']['kategori_surat']['Row'];
export type PengajuanSurat = Database['public']['Tables']['pengajuan_surat']['Row'];
export type DataMahasiswa = Database['public']['Tables']['data_mahasiswa']['Row'];

export interface PengajuanWithRelations extends PengajuanSurat {
  kategori_surat: { nama_kategori: string } | null;
  profiles: { nama: string; nim: string | null } | null;
}
