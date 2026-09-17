import { NextRequest, NextResponse } from 'next/server';


export function proxy(req: NextRequest) {

  const response = NextResponse.next();
  if (req.nextUrl.searchParams.has('dk')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: '/deals/:path*',
};
