import Link from "next/link";
import { FileTextIcon, LayersIcon, SendIcon, SparklesIcon, ActivityIcon, ArrowRightIcon } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_TEMPLATES, DEFAULT_CATEGORIES } from "@/lib/seed";
import { SavePrebuiltButton } from "@/components/templates/save-prebuilt-button";

async function getDashboardData(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const [
    { count: newCount, error: countError },
    { data: recent, error: recentError },
    { data: categories, error: catError },
    { data: recentEmailLogs, error: emailError },
    { data: recentAiLogs, error: aiError },
  ] = await Promise.all([
    supabase.from("templates").select("id", { count: "exact", head: true }),
    supabase
      .from("templates")
      .select("id,name,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("categories").select("id,name").order("name"),
    supabase
      .from("email_logs")
      .select("id,recipient_email,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("ai_logs")
      .select("id,action,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    totalTemplates: newCount ?? 0,
    recentTemplates: recent ?? [],
    categories: categories ?? [],
    recentEmailLogs: recentEmailLogs ?? [],
    recentAiLogs: recentAiLogs ?? [],
    warnings: [countError?.message, recentError?.message, catError?.message, emailError?.message, aiError?.message].filter(Boolean),
  };
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("templates")
    .select("id", { count: "exact", head: true });

  let data: Awaited<ReturnType<typeof getDashboardData>> | null = null;
  let hasData = false;

  if ((count ?? 0) > 0) {
    data = await getDashboardData(supabase);
    hasData = true;
  }

  const staticTemplateList = SAMPLE_TEMPLATES;
  const staticCategoryList = DEFAULT_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of templates and recent activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/dashboard/templates">
              <FileTextIcon className="mr-1 size-4" />
              View all templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/templates/new">
              <LayersIcon className="mr-1 size-4" />
              New template
            </Link>
          </Button>
        </div>
      </div>

      {!hasData && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">
              Sample templates are ready to use. Save them to your account to edit and send.
            </p>
            <SavePrebuiltButton />
          </CardContent>
        </Card>
      )}

      {data?.warnings.length ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Setup notice</div>
            <div>
              Some tables may not exist yet. Apply the Supabase schema and refresh.
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileTextIcon className="size-4" />
              Total templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {hasData ? data!.totalTemplates : staticTemplateList.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LayersIcon className="size-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {hasData ? data!.categories.length : staticCategoryList.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <SendIcon className="size-4" />
              Test emails sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {data?.recentEmailLogs.length ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <SparklesIcon className="size-4" />
              AI actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">
              {data?.recentAiLogs.length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{hasData ? "Recent templates" : "Prebuilt templates"}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && data!.recentTemplates.length ? (
              <div className="space-y-2">
                {data!.recentTemplates.map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/templates/${t.id}`}
                    className="group flex items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block size-1.5 rounded-full ${
                          t.status === "active"
                            ? "bg-emerald-500"
                            : t.status === "draft"
                              ? "bg-amber-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {new Date(t.updated_at).toLocaleDateString()}
                      <ArrowRightIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : !hasData ? (
              <div className="space-y-2">
                {staticTemplateList.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border px-3 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {t.category_name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileTextIcon className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                <div className="text-sm text-muted-foreground">
                  No templates yet
                </div>
                <div className="mt-3">
                  <Button asChild size="sm">
                    <Link href="/dashboard/templates/new">
                      Create your first template
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && data!.categories.length ? (
              <div className="space-y-2">
                {data!.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/templates?category=${c.id}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <span>{c.name}</span>
                    <ArrowRightIcon className="size-3 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : !hasData ? (
              <div className="space-y-2">
                {staticCategoryList.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                  >
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <LayersIcon className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                No categories yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SendIcon className="size-4" />
              Recent test sends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentEmailLogs.length ? (
              <div className="space-y-2">
                {data!.recentEmailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={log.status === "sent" ? "outline" : "destructive"}
                        className="text-[10px]"
                      >
                        {log.status}
                      </Badge>
                      <span className="text-muted-foreground">
                        {log.recipient_email}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No test emails sent yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ActivityIcon className="size-4" />
              AI activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentAiLogs.length ? (
              <div className="space-y-2">
                {data!.recentAiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium capitalize">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <SparklesIcon className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                No AI activity yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
