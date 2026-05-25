"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SendIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon, ChevronDownIcon, HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { sendTestEmail } from "@/server/actions/email";
import type { EmailLog } from "@/types";

const schema = z.object({
  recipientEmail: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

interface SendTestEmailProps {
  templateId: string;
  subject: string;
  bodyHtml: string;
  mockData: Record<string, unknown>;
  sendHistory: Array<Pick<EmailLog, "id" | "recipient_email" | "status" | "error" | "created_at">>;
}

export function SendTestEmail({
  templateId,
  subject,
  bodyHtml,
  mockData,
  sendHistory,
}: SendTestEmailProps) {
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState(sendHistory);
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { recipientEmail: "" },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await sendTestEmail({
        templateId,
        recipientEmail: values.recipientEmail,
        subject,
        bodyHtml,
        data: mockData,
      });

      if (!res.ok) {
        toast.error(res.message);
      } else {
        toast.success("Test email sent");
        form.reset();
      }

      if (res.ok && res.log) {
        setLogs((prev) => [res.log as any, ...prev].slice(0, 20));
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Send test email</span>
      </div>
      <div className="space-y-3 p-3">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="recipient" className="text-xs">Recipient</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="you@company.com"
              className="h-8 text-sm"
              {...form.register("recipientEmail")}
            />
          </div>
          <Button type="submit" disabled={isPending} size="sm">
            {isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <SendIcon className="size-3.5" />
            )}
            Send
          </Button>
        </form>

        {form.formState.errors.recipientEmail && (
          <div className="text-xs text-destructive">
            {form.formState.errors.recipientEmail.message}
          </div>
        )}

        {logs.length > 0 && (
          <>
            <Separator />
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <HistoryIcon className="size-3.5" />
                Send history ({logs.length})
                <ChevronDownIcon className={`size-3 transition-transform ${showHistory ? "rotate-180" : ""}`} />
              </button>
              {showHistory && (
                <div className="mt-2 max-h-36 space-y-1 overflow-y-auto scrollbar-thin">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between rounded-md px-2 py-1 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        {log.status === "sent" ? (
                          <CheckCircle2Icon className="size-3 text-emerald-500" />
                        ) : (
                          <XCircleIcon className="size-3 text-destructive" />
                        )}
                        <span className="text-muted-foreground">
                          {log.recipient_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={log.status === "sent" ? "default" : "destructive"}
                          className="text-[9px] px-1 py-0 h-4"
                        >
                          {log.status}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
