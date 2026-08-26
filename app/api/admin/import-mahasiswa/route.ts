import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface MahasiswaRow {
  nim: string;
  nama: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Belum login.' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Hanya admin yang boleh mengimpor mahasiswa.' }, { status: 403 });
  }

  const body = (await request.json()) as { rows?: MahasiswaRow[] };
  const rows = body.rows ?? [];
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Tidak ada data mahasiswa yang valid.' }, { status: 400 });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY belum diatur di .env.local.' },
      { status: 500 }
    );
  }

  let success = 0;
  const failed: string[] = [];

  for (const row of rows) {
    const email = `${row.nim}@kampus.ac.id`;
    const { error } = await adminClient.auth.admin.createUser({
      email,
      password: row.nim,
      email_confirm: true,
      user_metadata: { nama: row.nama, nim: row.nim, role: 'mahasiswa' },
    });

    if (error) {
      failed.push(`${row.nim}: ${error.message}`);
    } else {
      success += 1;
    }
  }

  return NextResponse.json({ success, failed });
}