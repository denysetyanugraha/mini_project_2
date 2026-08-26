'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Navbar({
  role,
  nama,
}: {
  role: 'mahasiswa' | 'admin';
  nama: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const links =
    role === 'admin'
      ? [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/pengajuan', label: 'Pengajuan Surat' },
          { href: '/admin/kategori', label: 'Kategori Surat' },
          { href: '/admin/import-mahasiswa', label: 'Import Mahasiswa' },
        ]
      : [
          { href: '/mahasiswa/ajukan', label: 'Ajukan Surat' },
          { href: '/mahasiswa/status', label: 'Status Pengajuan' },
        ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="font-bold text-primary-700 whitespace-nowrap">
              Portal Surat Kampus
            </span>
            <div className="hidden md:flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-600">{nama}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition"
            >
              Keluar
            </button>
          </div>
        </div>
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                pathname === link.href
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
