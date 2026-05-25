"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, RocketIcon, AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { seedDefaults } from "@/server/actions/seed";

export function AutoSeed({ needsSeed }: { needsSeed: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [autoTriggered, setAutoTriggered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (needsSeed && !autoTriggered) {
      setAutoTriggered(true);
      startTransition(async () => {
        const res = await seedDefaults();
        if (res.ok) {
          router.refresh();
        } else {
          setError(res.message ?? "Unknown error");
        }
      });
    }
  }, [needsSeed, autoTriggered, router]);

  if (!needsSeed) return null;

  if (autoTriggered && !error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <Loader2Icon className="size-7 animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold">Setting up your workspace</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Loading sample templates and categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
        <RocketIcon className="size-7" />
      </div>
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Welcome to MailForge</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Load sample templates to see how the app works, or create a blank one.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertTriangleIcon className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button asChild variant="outline">
          <a href="/dashboard/templates/new">Create blank template</a>
        </Button>
        <Button onClick={() => {
          setError("");
          startTransition(async () => {
            const res = await seedDefaults();
            if (res.ok) {
              router.refresh();
            } else {
              setError(res.message ?? "Unknown error");
            }
          });
        }} disabled={isPending}>
          {isPending ? (
            <Loader2Icon className="mr-1.5 size-4 animate-spin" />
          ) : (
            <RocketIcon className="mr-1.5 size-4" />
          )}
          {isPending ? "Loading..." : "Load sample templates"}
        </Button>
      </div>
    </div>
  );
}
