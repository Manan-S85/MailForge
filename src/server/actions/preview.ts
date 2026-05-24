"use server";

import { z } from "zod";

import { requireUser } from "@/server/auth";
import { renderEmailHtml } from "@/lib/email/render";

const schema = z.object({
  subject: z.string().max(500),
  bodyHtml: z.string().max(500_000),
  data: z.record(z.string(), z.unknown()),
});

export async function renderPreview(input: z.infer<typeof schema>) {
  schema.parse(input);
  await requireUser();

  const { subject, html } = renderEmailHtml({
    subject: input.subject,
    bodyHtml: input.bodyHtml,
    data: input.data,
  });

  return { ok: true as const, subject, html };
}
