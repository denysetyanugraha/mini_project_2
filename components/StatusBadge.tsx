import type { StatusPengajuan } from '@/lib/supabase/types';

const STATUS_CONFIG: Record<StatusPengajuan, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  diproses: { label: 'Diproses', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  diterima: { label: 'Diterima', className: 'bg-green-100 text-green-800 border-green-300' },
  ditolak: { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-300' },
};

export default function StatusBadge({ status }: { status: StatusPengajuan }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
