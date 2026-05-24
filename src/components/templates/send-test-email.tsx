"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SendIcon, Loader2Icon, HistoryIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SendIcon className="size-4" />
          Send test email
        </CardTitle>
        <CardDescription>
          Send a preview to your inbox via Resend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-end gap-2"
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="recipient">Recipient email</Label>
            <Input
              id="recipient"
              type="email"
              placeholder="you@company.com"
              {...form.register("recipientEmail")}
            />
          </div>
          <Button type="submit" disabled={isPending} className="shrink-0">
            {isPending ? (
              <Loader2Icon className="mr-1 size-4 animate-spin" />
            ) : (
              <SendIcon className="mr-1 size-4" />
            )}
            Send
          </Button>
        </form>

        {form.formState.errors.recipientEmail && (
          <div className="text-xs text-destructive">
            {form.formState.errors.recipientEmail.message}
          </div>
        )}

        <Separator />

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <HistoryIcon className="size-3.5" />
            Send history
          </div>
          {logs.length > 0 ? (
            <ScrollArea className="h-44 rounded-md border">
              <div className="space-y-1 p-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {log.status === "sent" ? (
                        <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                      ) : (
                        <XCircleIcon className="size-3.5 text-destructive" />
                      )}
                      <span className="text-muted-foreground">
                        {log.recipient_email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={log.status === "sent" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="rounded-md border px-3 py-4 text-center text-sm text-muted-foreground">
              No test emails sent yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
