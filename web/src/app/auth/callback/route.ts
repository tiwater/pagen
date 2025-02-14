import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Log important information for debugging
  console.log('Auth Callback Debug:', {
    code: code ? 'present' : 'missing',
    next,
    headers: {
      'x-forwarded-host': request.headers.get("x-forwarded-host"),
      host: request.headers.get("host"),
      referer: request.headers.get("referer"),
    }
  });

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Supabase Auth Error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:1578"}/auth/auth-code-error?error=${error.message}`
      );
    }

    // Get the host from various possible headers
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");
    
    // Determine the base URL - prioritize environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      || (forwardedHost ? `https://${forwardedHost}` 
      : (host ? `https://${host}` 
      : "https://pages.dustland.ai"));

    console.log('Redirecting to:', `${baseUrl}${next}`);
    
    // Set cache control headers to prevent caching
    const response = NextResponse.redirect(`${baseUrl}${next}`);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // If no code is present, redirect to error page
  console.log('No auth code present, redirecting to error page');
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:1578"}/auth/auth-code-error?error=no-code`
  );
}
