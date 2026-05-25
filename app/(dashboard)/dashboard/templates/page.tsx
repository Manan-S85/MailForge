import Link from "next/link";
import { PlusIcon, FileTextIcon } from "lucide-react";

import { requireUser } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TemplatesFilters } from "@/components/templates/templates-filters";
import { TemplateRowActions } from "@/components/templates/template-row-actions";
import { DEFAULT_CATEGORIES, SAMPLE_TEMPLATES } from "@/lib/seed";
import { SavePrebuiltButton } from "@/components/templates/save-prebuilt-button";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q, status, category } = await searchParams;

  const { supabase } = await requireUser();

  const { count: templateCount } = await supabase
    .from("templates")
    .select("id", { count: "exact", head: true });

  const categoriesResult = await supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });

  const dbCategories = categoriesResult.data ?? [];
  const staticCategories = DEFAULT_CATEGORIES.map((c, i) => ({
    id: `static-${i}`,
    name: c.name,
  }));

  const allCategories = dbCategories.length > 0 ? dbCategories : staticCategories;

  const filteredPrebuilt = (() => {
    let list = SAMPLE_TEMPLATES;
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.subject.toLowerCase().includes(term),
      );
    }
    if (category && category !== "all") {
      const catName = staticCategories.find((c) => c.id === category)?.name;
      if (catName) {
        list = list.filter((t) => t.category_name === catName);
      }
    }
    return list;
  })();

  let dbTemplates: any[] | null = null;
  let dbError: any = null;

  if ((templateCount ?? 0) > 0) {
    let query = supabase
      .from("templates")
      .select("id,name,subject,status,updated_at,category:categories(name)")
      .order("updated_at", { ascending: false })
      .limit(200);

    if (q && q.trim()) {
      const term = q.trim();
      query = query.or(`name.ilike.%${term}%,subject.ilike.%${term}%`);
    }

    if (status && ["draft", "active", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    const result = await query;
    dbTemplates = result.data;
    dbError = result.error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, preview, and test email templates
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <PlusIcon className="size-4" />
            New template
          </Link>
        </Button>
      </div>

      <TemplatesFilters categories={allCategories} />

      {dbTemplates !== null && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-sky-500/10">
                <FileTextIcon className="size-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <CardTitle>All templates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {dbError ? (
              <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                {dbError.message}
              </div>
            ) : dbTemplates && dbTemplates.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dbTemplates.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/templates/${t.id}`}
                          className="font-medium hover:text-foreground/80"
                        >
                          {t.name}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {t.subject || <span className="text-muted-foreground/50">&mdash;</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === "active" ? "default" : "secondary"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.category?.name ?? <span className="text-muted-foreground/50">&mdash;</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(t.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <TemplateRowActions id={t.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="text-sm text-muted-foreground">
                  No templates found. Try adjusting your search or filters.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-violet-500/10">
                <FileTextIcon className="size-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <CardTitle>Prebuilt templates</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Ready-to-use templates to get started quickly
                </p>
              </div>
            </div>
            <SavePrebuiltButton />
          </div>
        </CardHeader>
        <CardContent>
          {filteredPrebuilt.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrebuilt.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {t.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.category_name}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No templates match your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
