// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic route handling
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Get the actual host and protocol
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${forwardedProto}://${forwardedHost}`;
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback initial state:', {
    timestamp: new Date().toISOString(),
    headers: {
      forwardedHost,
      forwardedProto,
      originalUrl: request.url
    },
    request: {
      baseUrl,
      hasCode: !!code,
      codeLength: code?.length,
      next,
    }
  });

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
      }

      return NextResponse.redirect(`${baseUrl}${next}`);
    } catch (err) {
      console.error('Unexpected error in auth callback:', err);
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=unexpected`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=no-code`);
}
