import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getRequiredPublicEnv } from "@/lib/env/public";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient(
      getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        cookies: {
          getAll() {
            return request.headers.get("cookie")?.split("; ").map((c) => {
              const [name, value] = c.split("=");
              return { name, value };
            }) ?? [];
          },
          setAll() {},
        },
      },
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
