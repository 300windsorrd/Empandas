import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const url = new URL('/icon.svg', request.url);
  return NextResponse.redirect(url, 307);
}

