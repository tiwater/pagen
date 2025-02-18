import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for the root path when coming from auth callback
  const referer = request.headers.get('referer') || '';
  if (referer.includes('/auth/callback')) {
    return NextResponse.next();
  }
  
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication endpoints)
     * - api/usage (usage endpoint)
     * - status (status page)
     * - api/status (status endpoint)
     */
    '/((?!_next/static|_next/image|api|favicon.ico|auth|api/status|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)',
  ],
};
