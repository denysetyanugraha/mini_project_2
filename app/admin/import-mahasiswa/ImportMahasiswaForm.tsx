'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import Alert from '@/components/Alert';

interface CsvRow {
  nim: string;
  nama: string;
}

export default function ImportMahasiswaForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<CsvRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<number[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number } | null>(null);
  const [serverError, setServerError] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError('');
    setResult(null);
    setServerError('');

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const data = results.data.map((r) => ({
          nim: (r.nim || '').toString().trim(),
          nama: (r.nama || '').toString().trim(),
        }));

        if (data.length === 0) {
          setParseError('File CSV kosong atau format tidak sesuai.');
          return;
        }

        const invalid: number[] = [];
        data.forEach((row, i) => {
          if (!row.nim || !row.nama) invalid.push(i);
        });

        setRows(data);
        setInvalidRows(invalid);
      },
      error: () => {
        setParseError('Gagal membaca file CSV. Pastikan format file benar.');
      },
    });
  }

  async function handleImport() {
    setImporting(true);
    setServerError('');

    const validRows = rows.filter((_, i) => !invalidRows.includes(i));

    const response = await fetch('/api/admin/import-mahasiswa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: validRows }),
    });
    const resultBody = await response.json().catch(() => ({}));

    setImporting(false);

    if (!response.ok) {
      setServerError(resultBody.error || 'Gagal mengimpor akun mahasiswa.');
      return;
    }

    setResult({ success: resultBody.success });
    if (resultBody.failed?.length) {
      setServerError(`Sebagian data gagal diimpor: ${resultBody.failed.join('; ')}`);
    }
    setRows([]);
    setInvalidRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih File CSV
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="text-xs text-gray-500 mt-2">
          Format kolom: nim, nama (baris pertama adalah header). Password awal mahasiswa adalah NIM.
        </p>
      </div>

      {parseError && <Alert type="error" message={parseError} />}
      {serverError && <Alert type="error" message={serverError} />}
      {result && (
        <Alert type="success" message={`Berhasil mengimpor ${result.success} data mahasiswa.`} />
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              Preview: {rows.length} baris
              {invalidRows.length > 0 && (
                <span className="text-red-600"> ({invalidRows.length} baris tidak valid akan dilewati)</span>
              )}
            </span>
            <button
              onClick={handleImport}
              disabled={importing || rows.length === invalidRows.length}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {importing ? 'Mengimpor...' : 'Konfirmasi Import'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">NIM</th>
                  <th className="text-left px-4 py-2 font-medium">Nama</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, i) => (
                  <tr key={i} className={invalidRows.includes(i) ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2">{row.nim || '-'}</td>
                    <td className="px-4 py-2">{row.nama || '-'}</td>
                    <td className="px-4 py-2">
                      {invalidRows.includes(i) ? (
                        <span className="text-red-600 text-xs font-medium">NIM/Nama kosong</span>
                      ) : (
                        <span className="text-green-600 text-xs font-medium">Valid</span>
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
