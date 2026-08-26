import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updatePengajuanSchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Belum login.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Hanya admin yang boleh mengubah status pengajuan.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updatePengajuanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data yang dikirim tidak valid.', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status, catatan_admin, file_surat_url } = parsed.data;

  const { data, error } = await supabase
    .from('pengajuan_surat')
    .update({
      status,
      catatan_admin: catatan_admin || null,
      file_surat_url: file_surat_url || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Gagal memperbarui status pengajuan.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
