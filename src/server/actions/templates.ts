"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/server/auth";
import { extractPlaceholders, validatePlaceholders } from "@/lib/placeholders/extract";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  categoryId: z.string().uuid().optional().nullable(),
});

export async function createTemplate(input: z.infer<typeof createSchema>) {
  const values = createSchema.parse(input);
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("templates")
    .insert({
      owner_id: user.id,
      name: values.name,
      subject: "",
      body_html: "",
      body_json: null,
      category_id: values.categoryId ?? null,
      status: "draft",
      placeholders: [],
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/dashboard/templates");
  redirect(`/dashboard/templates/${data.id}`);
}

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  subject: z.string().min(0).max(200),
  bodyHtml: z.string(),
  bodyJson: z.unknown().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "active", "archived"]),
});

export async function updateTemplate(input: z.infer<typeof updateSchema>) {
  const values = updateSchema.parse(input);
  const { supabase, user } = await requireUser();

  const safeHtml = sanitizeEmailHtml(values.bodyHtml);
  const placeholders = extractPlaceholders(`${values.subject}\n${safeHtml}`);
  const validation = validatePlaceholders(placeholders);
  if (!validation.ok) {
    return { ok: false as const, message: validation.message };
  }

  const { error } = await supabase
    .from("templates")
    .update({
      name: values.name,
      subject: values.subject,
      body_html: safeHtml,
      body_json: values.bodyJson ?? null,
      category_id: values.categoryId ?? null,
      status: values.status,
      placeholders,
    })
    .eq("id", values.id)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/templates");
  revalidatePath(`/dashboard/templates/${values.id}`);

  return { ok: true as const };
}

export async function deleteTemplate(id: string) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/templates");
  return { ok: true as const };
}

export async function duplicateTemplate(id: string) {
  const { supabase, user } = await requireUser();

  const { data: template, error: fetchError } = await supabase
    .from("templates")
    .select(
      "name,subject,body_html,body_json,category_id,status,placeholders",
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (fetchError || !template) {
    return { ok: false as const, message: fetchError?.message ?? "Not found" };
  }

  const { data: created, error: insertError } = await supabase
    .from("templates")
    .insert({
      owner_id: user.id,
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body_html: template.body_html,
      body_json: template.body_json,
      category_id: template.category_id,
      status: "draft",
      placeholders: template.placeholders ?? [],
    })
    .select("id")
    .single();

  if (insertError || !created) {
    return { ok: false as const, message: insertError?.message ?? "Failed" };
  }

  revalidatePath("/dashboard/templates");
  redirect(`/dashboard/templates/${created.id}`);
}
