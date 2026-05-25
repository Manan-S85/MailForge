import Link from "next/link";
import { FileTextIcon, LayersIcon, SendIcon, SparklesIcon, ActivityIcon, ArrowRightIcon, PlusIcon } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your templates and recent activity
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/templates/new">
            <PlusIcon className="size-4" />
            New template
          </Link>
        </Button>
      </div>

      {!hasData && (
        <Card size="sm">
          <CardContent className="flex items-center justify-between py-3">
            <p className="text-sm text-muted-foreground">
              Sample templates are ready to use. Save them to your account to edit and send.
            </p>
            <SavePrebuiltButton />
          </CardContent>
        </Card>
      )}

      {data?.warnings.length ? (
        <Card size="sm">
          <CardContent className="py-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Setup notice</div>
            <div>
              Some tables may not exist yet. Apply the Supabase schema and refresh.
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-sky-500/20 bg-gradient-to-br from-sky-500/20 to-sky-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileTextIcon className="size-4 text-sky-600 dark:text-sky-400" />
            Total templates
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {hasData ? data!.totalTemplates : staticTemplateList.length}
          </div>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-violet-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayersIcon className="size-4 text-violet-600 dark:text-violet-400" />
            Categories
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {hasData ? data!.categories.length : staticCategoryList.length}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SendIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
            Test emails sent
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.recentEmailLogs.length ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SparklesIcon className="size-4 text-amber-600 dark:text-amber-400" />
            AI actions
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">
            {data?.recentAiLogs.length ?? 0}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{hasData ? "Recent templates" : "Prebuilt templates"}</CardTitle>
              {hasData && (
                <CardDescription>Your most recently updated templates</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {hasData && data!.recentTemplates.length ? (
                <div className="space-y-1">
                  {data!.recentTemplates.map((t) => (
                    <Link
                      key={t.id}
                      href={`/dashboard/templates/${t.id}`}
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
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
                        <Badge variant="secondary" className="text-[10px]">
                          {t.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {new Date(t.updated_at).toLocaleDateString()}
                        <ArrowRightIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !hasData ? (
                <div className="space-y-1">
                  {staticTemplateList.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                        <span className="font-medium">{t.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {t.category_name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <FileTextIcon className="mb-2 size-8 text-muted-foreground/30" />
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
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Filter templates by category</CardDescription>
            </CardHeader>
            <CardContent>
              {hasData && data!.categories.length ? (
                <div className="space-y-1">
                  {data!.categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/templates?category=${c.id}`}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <span>{c.name}</span>
                      <ArrowRightIcon className="size-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : !hasData ? (
                <div className="space-y-1">
                  {staticCategoryList.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm"
                    >
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                  <LayersIcon className="mb-2 size-8 text-muted-foreground/30" />
                  No categories yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10">
                <SendIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Recent test sends
            </CardTitle>
            <CardDescription>Emails sent via the preview panel</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentEmailLogs.length ? (
              <div className="space-y-1">
                {data!.recentEmailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
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
              <div className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                <SendIcon className="mb-2 size-8 text-muted-foreground/30" />
                No test emails sent yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-amber-500/10">
                <ActivityIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              AI activity
            </CardTitle>
            <CardDescription>Recent AI-powered actions</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentAiLogs.length ? (
              <div className="space-y-1">
                {data!.recentAiLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm"
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
              <div className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                <SparklesIcon className="mb-2 size-8 text-muted-foreground/30" />
                No AI activity yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
