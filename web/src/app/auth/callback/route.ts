// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Get the host from headers
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const baseUrl = `${protocol}://${host}`;

  // Debug logging for initial request
  console.log('Auth callback initial state:', {
    timestamp: new Date().toISOString(),
    headers: {
      protocol: request.headers.get('x-forwarded-proto'),
      host: request.headers.get('x-forwarded-host'),
      originalHost: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    request: {
      url: request.url,
      baseUrl,
      hasCode: !!code,
      codeLength: code?.length,
      next,
    }
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=configuration`);
  }

  if (code) {
    try {
      console.log('Creating Supabase client...');
      const supabase = await createClient();
      console.log('Supabase client created successfully');

      console.log('Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Exchange response:', {
        hasError: !!error,
        errorMessage: error?.message,
        errorStatus: error?.status,
        hasData: !!data,
        hasSession: !!data?.session,
        user: data?.session ? {
          id: data.session.user.id,
          email: data.session.user.email,
          lastSignIn: data.session.user.last_sign_in_at,
        } : null
      });
      
      if (error) {
        console.error('Error exchanging code for session:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
      }

      console.log('Successfully exchanged code for session, redirecting to:', `${baseUrl}${next}`);
      return NextResponse.redirect(`${baseUrl}${next}`);
    } catch (err) {
      console.error('Unexpected error in auth callback:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=unexpected`);
    }
  }

  // No code provided
  console.error('No code provided in callback');
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=no-code`);
}
