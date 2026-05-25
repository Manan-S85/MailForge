"use client";

import { useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, RotateCcwIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TemplatesFilters({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const category = searchParams.get("category") ?? "all";

  const categoryOptions = useMemo(
    () => [{ id: "all", name: "All categories" }, ...categories],
    [categories],
  );

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);

    startTransition(() => {
      router.replace(`/dashboard/templates?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={q}
          placeholder="Search templates..."
          className="pl-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.currentTarget.value ?? "").trim();
              setParam("q", value);
            }
          }}
        />
      </div>

      <div className="flex gap-2">
        <Select value={status} onValueChange={(v) => setParam("status", v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => setParam("category", v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => {
            startTransition(() => router.replace("/dashboard/templates"));
          }}
        >
          <RotateCcwIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
