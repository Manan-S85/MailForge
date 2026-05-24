"use server";

import { z } from "zod";
import { Resend } from "resend";

import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-limit";
import { getRequiredServerEnv } from "@/lib/env/server";
import { renderEmailHtml } from "@/lib/email/render";

const schema = z.object({
  templateId: z.string().uuid(),
  recipientEmail: z.string().trim().email().max(320),
  subject: z.string().max(500),
  bodyHtml: z.string().max(500_000),
  data: z.record(z.string(), z.unknown()),
});

export async function sendTestEmail(input: z.infer<typeof schema>) {
  const values = schema.parse(input);
  const { supabase, user } = await requireUser();

  const limited = await enforceRateLimit({
    action: "send_test_email",
    maxPerMinute: 10,
  });
  if (!limited.ok) {
    return { ok: false as const, message: limited.message };
  }

  const resend = new Resend(getRequiredServerEnv("RESEND_API_KEY"));
  const from = getRequiredServerEnv("RESEND_FROM");

  const { subject, html } = renderEmailHtml({
    subject: values.subject,
    bodyHtml: values.bodyHtml,
    data: values.data,
  });

  let status: "sent" | "failed" = "sent";
  let providerMessageId: string | null = null;
  let errorMessage: string | null = null;

  try {
    const result = await resend.emails.send({
      from,
      to: values.recipientEmail,
      subject,
      html,
    });

    providerMessageId = (result as any)?.data?.id ?? (result as any)?.id ?? null;

    if ((result as any)?.error) {
      status = "failed";
      errorMessage = String((result as any).error?.message ?? "Send failed");
    }
  } catch (err) {
    status = "failed";
    errorMessage = err instanceof Error ? err.message : "Send failed";
  }

  const { data: created, error: insertError } = await supabase
    .from("email_logs")
    .insert({
      owner_id: user.id,
      template_id: values.templateId,
      recipient_email: values.recipientEmail,
      subject,
      provider: "resend",
      provider_message_id: providerMessageId,
      status,
      error: errorMessage,
    })
    .select(
      "id,recipient_email,subject,provider,provider_message_id,status,error,created_at",
    )
    .single();

  if (insertError) {
    return {
      ok: false as const,
      message: errorMessage ?? insertError.message,
    };
  }

  if (status === "failed") {
    return {
      ok: false as const,
      message: errorMessage ?? "Send failed",
      log: created,
    };
  }

  return { ok: true as const, log: created };
}
