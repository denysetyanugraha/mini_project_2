import ImportMahasiswaForm from './ImportMahasiswaForm';

export default function ImportMahasiswaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Import Data Mahasiswa</h1>
      <p className="text-gray-600 mb-6">
        Unggah file CSV berisi kolom <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">nim, nama</code> untuk membuat akun mahasiswa.
      </p>
      <ImportMahasiswaForm />
    </div>
  );
}
