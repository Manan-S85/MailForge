"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { seedDefaults } from "@/server/actions/seed";

export function SavePrebuiltButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const res = await seedDefaults();
      if (res.ok) {
        router.refresh();
      }
    });
  };

  return (
    <Button onClick={handleSave} disabled={isPending} size="sm">
      {isPending ? (
        <Loader2Icon className="mr-1.5 size-4 animate-spin" />
      ) : (
        <DownloadIcon className="mr-1.5 size-4" />
      )}
      {isPending ? "Saving..." : "Save to my account"}
    </Button>
  );
}
