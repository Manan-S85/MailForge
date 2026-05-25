"use client";

import { useState } from "react";
import { toast } from "sonner";
import { performAiAction } from "@/server/actions/ai";
import type { AiAction, AiTone } from "@/types";

interface AiResult {
  content: string;
  subject?: string;
}

export function useAiAssistant() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);

  const execute = (params: {
    action: AiAction;
    tone?: AiTone;
    currentContent?: string;
    currentSubject?: string;
    prompt?: string;
    templateId?: string;
  }) => {
    setIsPending(true);

    performAiAction(params)
      .then((res) => {
        if (res.ok) {
          setResult(res.data);
          toast.success("AI action complete");
        } else {
          toast.error(res.message);
        }
      })
      .catch(() => {
        toast.error("AI assistant unavailable");
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const clearResult = () => setResult(null);

  return { execute, result, isPending, clearResult };
}
