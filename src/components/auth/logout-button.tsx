"use client";

import { useTransition } from "react";
import { LogOutIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/server/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      {isPending ? (
        <Loader2Icon className="size-3.5 animate-spin" />
      ) : (
        <LogOutIcon className="size-3.5" />
      )}
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
