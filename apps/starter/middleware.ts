import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  const isDev = process.env.NODE_ENV !== 'production';
  const csp = isDev
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' ws: http: https:",
        "font-src 'self' https:",
        "worker-src 'self' blob:",
        "frame-ancestors 'self'",
        "object-src 'none'"
      ].join('; ')
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "font-src 'self' https:",
        "frame-ancestors 'self'",
        "object-src 'none'"
      ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return res;
}

export const config = {
  matcher: ['/:path*']
};
