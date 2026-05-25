"use client";

import { AlertTriangleIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="flex size-12 items-center justify-center rounded-xl border bg-card">
        <AlertTriangleIcon className="size-6 text-destructive" />
      </div>
      <div className="space-y-1 text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        <RefreshCcwIcon className="mr-1.5 size-3.5" />
        Try again
      </Button>
    </div>
  );
}
