import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isMahasiswaRoute = pathname.startsWith('/mahasiswa');
  const isAdminRoute = pathname.startsWith('/admin');

  // Belum login tapi akses route terproteksi -> redirect ke login
  if ((isMahasiswaRoute || isAdminRoute) && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Sudah login, cek role untuk mencegah akses silang mahasiswa <-> admin
  if (user && (isMahasiswaRoute || isAdminRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: 'mahasiswa' | 'admin' }>();

    const role = profile?.role ?? 'mahasiswa';

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/mahasiswa', request.url));
    }
    if (isMahasiswaRoute && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/mahasiswa/:path*',
    '/admin/:path*',
  ],
};
