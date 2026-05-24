import { createBrowserClient } from "@supabase/ssr";
import { getRequiredPublicEnv } from "@/lib/env/public";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
