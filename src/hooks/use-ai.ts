"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { AiAction, AiTone } from "@/types";

interface AiResult {
  content: string;
  subject?: string;
}

export function useAiAssistant() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);

  const execute = useCallback((params: {
    action: AiAction;
    tone?: AiTone;
    currentContent?: string;
    currentSubject?: string;
    prompt?: string;
    templateId?: string;
  }) => {
    setIsPending(true);

    (async () => {
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
      } finally {
        setIsPending(false);
      }
    })();
  }, []);

  const clearResult = useCallback(() => setResult(null), []);

  return { execute, result, isPending, clearResult };
}
