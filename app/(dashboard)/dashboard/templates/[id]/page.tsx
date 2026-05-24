import { notFound } from "next/navigation";

import { requireUser } from "@/server/auth";
import { TemplateEditor } from "@/components/templates/template-editor";

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { supabase } = await requireUser();

  const [{ data: template }, { data: categories }, { data: placeholders }, { data: emailLogs }] =
    await Promise.all([
      supabase
        .from("templates")
        .select(
          "id,name,subject,body_html,body_json,status,category_id,placeholders,updated_at",
        )
        .eq("id", id)
        .single(),
      supabase.from("categories").select("id,name").order("name"),
      supabase
        .from("placeholders")
        .select("id,key,description,sample_value")
        .order("key"),
      supabase
        .from("email_logs")
        .select("id,recipient_email,status,error,created_at")
        .eq("template_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (!template) notFound();

  return (
    <TemplateEditor
      template={template as any}
      categories={(categories ?? []) as any}
      availablePlaceholders={(placeholders ?? []) as any}
      sendHistory={(emailLogs ?? []) as any}
    />
  );
}
