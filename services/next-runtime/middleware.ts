import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CSP headers
  response.headers.set(
    'Content-Security-Policy',
    `frame-ancestors 'self' https://pagen.dustland.ai https://*.dustland.ai http://localhost:* http://127.0.0.1:*`
  )

  // Add X-Frame-Options header
  response.headers.set('X-Frame-Options', 'ALLOW-FROM https://pagen.dustland.ai http://localhost:3001')

  return response
}

export const config = {
  matcher: '/:path*',
}
