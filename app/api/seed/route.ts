import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedUserData } from "@/lib/seed";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { ok: false, message: authError?.message ?? "Not authenticated" },
      { status: 401 },
    );
  }

  const { count: existingCategories } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const { count: existingTemplates } = await supabase
    .from("templates")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if ((existingCategories ?? 0) > 0 || (existingTemplates ?? 0) > 0) {
    return NextResponse.json({
      ok: true,
      message: `Data already exists (${existingCategories ?? 0} categories, ${existingTemplates ?? 0} templates)`,
      categories: existingCategories,
      templates: existingTemplates,
    });
  }

  try {
    await seedUserData(supabase, user);

    const { count: newCategories } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    const { count: newTemplates } = await supabase
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    const { data: insertedCategories } = await supabase
      .from("categories")
      .select("name")
      .eq("owner_id", user.id);

    const { data: insertedTemplates } = await supabase
      .from("templates")
      .select("name, subject")
      .eq("owner_id", user.id);

    return NextResponse.json({
      ok: true,
      message: `Seeded ${newCategories ?? 0} categories and ${newTemplates ?? 0} templates`,
      categories: newCategories,
      templates: newTemplates,
      categoryNames: insertedCategories?.map((c) => c.name) ?? [],
      templateNames: insertedTemplates?.map((t) => t.name) ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    console.error("Seed error:", err);
    return NextResponse.json(
      { ok: false, message },
      { status: 500 },
    );
  }
}
