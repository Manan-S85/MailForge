"use server";

import "server-only";

import { requireUser } from "@/server/auth";
import { seedUserData } from "@/lib/seed";

export async function seedDefaults() {
  try {
    const { supabase, user } = await requireUser();
    await seedUserData(supabase, user);

    const { count: cats } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    const { count: tpls } = await supabase
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    return { ok: true as const, categories: cats ?? 0, templates: tpls ?? 0 };
  } catch (err) {
    return {
      ok: false as const,
      message: err instanceof Error ? err.message : "Seed failed",
    };
  }
}
