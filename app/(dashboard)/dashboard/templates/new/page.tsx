import { requireUser } from "@/server/auth";
import { NewTemplateForm } from "@/components/templates/new-template-form";
import { DEFAULT_CATEGORIES } from "@/lib/seed";

export default async function NewTemplatePage() {
  const { supabase } = await requireUser();

  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });

  const categories = (dbCategories ?? []).length > 0
    ? dbCategories!
    : DEFAULT_CATEGORIES.map((c, i) => ({ id: `static-${i}`, name: c.name }));

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Create template</h1>
        <p className="text-sm text-muted-foreground">
          Give your template a name and category to get started
        </p>
      </div>

      <NewTemplateForm categories={categories} />
    </div>
  );
}
