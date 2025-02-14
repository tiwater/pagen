import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the host from various possible headers
      const forwardedHost = request.headers.get("x-forwarded-host");
      const host = request.headers.get("host");
      const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
      
      // Determine the base URL
      let baseUrl: string;
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        // Use configured site URL if available (recommended for production)
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      } else if (forwardedHost) {
        // Use forwarded host if available (for proxy setups)
        baseUrl = `${protocol}://${forwardedHost}`;
      } else if (host) {
        // Fallback to direct host
        baseUrl = `${protocol}://${host}`;
      } else {
        // Final fallback
        baseUrl = process.env.NODE_ENV === "development" 
          ? "http://localhost:1578"
          : "https://pages.dustland.ai";
      }

      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:1578"}/auth/auth-code-error`);
}
