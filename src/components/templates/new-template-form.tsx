"use client";

import { useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createTemplate } from "@/server/actions/templates";

const schema = z.object({
  name: z.string().min(1, "Template name is required").max(120),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewTemplateForm({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", categoryId: "" },
  });

  const selectedCategory = form.watch("categoryId");

  const resolveCategoryId = (id: string) => {
    if (!id || id.startsWith("static-")) return null;
    return id;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New template</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const res = await createTemplate({
                name: values.name,
                categoryId: resolveCategoryId(values.categoryId ?? ""),
              });
              if (res && !res.ok) toast.error(res.message);
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Template name</Label>
            <Input
              id="name"
              placeholder="e.g. Welcome email"
              {...form.register("name")}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={selectedCategory || "__none"}
              onValueChange={(v) => form.setValue("categoryId", v === "__none" ? "" : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">No category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
