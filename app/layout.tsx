import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistem Pengajuan Surat Kampus',
  description: 'Ajukan dan kelola surat administrasi kampus secara online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
