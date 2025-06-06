import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from './lib/auth';

const PUBLIC_PATHS = ['/auth', '/api/auth', '/api/health'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and public paths
  if (pathname.startsWith('/_next/') || pathname.includes('.') || 
      PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);
  
  if (!session) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};