import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getServerClient } from "@/lib/supabase/server";

/** Handles both the PKCE (?code=) and email OTP (?token_hash=&type=) flows.
 *  On failure it surfaces the real Supabase reason (query param + server log)
 *  instead of a generic error, so auth problems are diagnosable. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const providerError = searchParams.get("error_description") || searchParams.get("error");

  const fail = (reason: string) => {
    console.error("[auth] callback failed:", reason);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
  };

  if (providerError) return fail(providerError);

  try {
    const supabase = await getServerClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return fail(error.message);
      return NextResponse.redirect(`${origin}${next}`);
    }
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (error) return fail(error.message);
      return NextResponse.redirect(`${origin}${next}`);
    }
    return fail("missing_code_or_token");
  } catch (e) {
    return fail(e instanceof Error ? e.message : "callback_exception");
  }
}
