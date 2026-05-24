"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AiAction, AiTone } from "@/types";

interface AiResult {
  content: string;
  subject?: string;
}

export function useAiAssistant() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AiResult | null>(null);

  const execute = (params: {
    action: AiAction;
    tone?: AiTone;
    currentContent?: string;
    currentSubject?: string;
    prompt?: string;
    templateId?: string;
  }) => {
    startTransition(async () => {
      try {
        const { performAiAction } = await import("@/server/actions/ai");
        const res = await performAiAction(params);
        if (res.ok) {
          setResult(res.data);
          toast.success("AI action complete");
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error("AI assistant unavailable");
      }
    });
  };

  return { execute, result, isPending, clearResult: () => setResult(null) };
}
