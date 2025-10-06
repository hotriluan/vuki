import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_PATH = /^\/admin(\/|$)/;

export async function middleware(req: NextRequest) {
  if (ADMIN_PATH.test(req.nextUrl.pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'ADMIN') {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
