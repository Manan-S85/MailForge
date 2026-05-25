"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  SparklesIcon,
  Wand2Icon,
  FileTextIcon,
  ShrinkIcon,
  ExpandIcon,
  TargetIcon,
  TypeIcon,
  ZapIcon,
  LanguagesIcon,
  RotateCcwIcon,
  Loader2Icon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAiAssistant } from "@/hooks/use-ai";
import type { AiAction, AiTone } from "@/types";

interface AiAssistantProps {
  templateId?: string;
  currentContent?: string;
  currentSubject?: string;
  onApplyContent: (html: string) => void;
  onApplySubject?: (subject: string) => void;
}

const quickActions: Array<{
  action: AiAction;
  label: string;
  icon: typeof SparklesIcon;
  description: string;
}> = [
  { action: "generate", label: "Generate draft", icon: FileTextIcon, description: "Create new email content" },
  { action: "rewrite_tone", label: "Rewrite tone", icon: Wand2Icon, description: "Adjust the voice and tone" },
  { action: "improve_clarity", label: "Improve clarity", icon: LanguagesIcon, description: "Make content clearer" },
  { action: "shorten", label: "Shorten", icon: ShrinkIcon, description: "Condense the message" },
  { action: "expand", label: "Expand", icon: ExpandIcon, description: "Add more detail" },
  { action: "generate_cta", label: "Generate CTA", icon: TargetIcon, description: "Create call-to-action" },
  { action: "generate_subject", label: "Subject lines", icon: TypeIcon, description: "Generate subject options" },
  { action: "improve_engagement", label: "Improve engagement", icon: ZapIcon, description: "Boost reader response" },
  { action: "fix_grammar", label: "Fix grammar", icon: RotateCcwIcon, description: "Polish and correct" },
  { action: "convert_tone", label: "Convert tone", icon: LanguagesIcon, description: "Change the tone style" },
];

const tones: Array<{ value: AiTone; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
  { value: "concise", label: "Concise" },
  { value: "onboarding", label: "Onboarding" },
  { value: "marketing", label: "Marketing" },
];

export function AiAssistant({
  templateId,
  currentContent,
  currentSubject,
  onApplyContent,
  onApplySubject,
}: AiAssistantProps) {
  const [open, setOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<AiTone>("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const { execute, result, isPending, clearResult } = useAiAssistant();

  const handleAction = (action: AiAction) => {
    const needsTone =
      action === "rewrite_tone" || action === "convert_tone" || action === "generate";

    if (needsTone) {
      execute({
        action,
        tone: selectedTone,
        currentContent,
        currentSubject,
        prompt: customPrompt || undefined,
        templateId,
      });
    } else {
      execute({
        action,
        currentContent,
        currentSubject,
        prompt: customPrompt || undefined,
        templateId,
      });
    }
  };

  const handleApply = () => {
    if (!result) return;
    if (result.content) {
      onApplyContent(result.content);
    }
    if (result.subject && onApplySubject) {
      onApplySubject(result.subject);
    }
    clearResult();
    setOpen(false);
    toast.success("Applied AI result");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <SparklesIcon className="size-3.5" />
          AI
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <SparklesIcon className="size-4" />
            AI assistant
          </SheetTitle>
        </SheetHeader>

        {/* Fixed top: actions + tone + prompt */}
        <div className="shrink-0 space-y-4 border-b px-4 py-4">
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick actions
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {quickActions.map((qa) => (
                <button
                  key={qa.action}
                  disabled={isPending}
                  onClick={() => handleAction(qa.action)}
                  className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                >
                  <qa.icon className="size-3.5 shrink-0 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{qa.label}</div>
                    <div className="text-muted-foreground">{qa.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tone
              </div>
              <Select
                value={selectedTone}
                onValueChange={(v) => setSelectedTone(v as AiTone)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Custom instructions
              </div>
              <Textarea
                placeholder="e.g. Focus on the value proposition..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[72px] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Scrollable result area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {isPending && (
            <div className="flex items-center justify-center rounded-lg border bg-card py-8">
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-5 animate-spin" />
                AI is working...
              </div>
            </div>
          )}

          {result && !isPending && (
            <div className="m-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-xs font-medium">Result</span>
                <div className="flex gap-1">
                  <Button size="xs" onClick={handleApply}>
                    <PlusIcon className="size-3" />
                    Apply
                  </Button>
                  <Button size="xs" variant="ghost" onClick={clearResult}>
                    <XIcon className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                {result.subject && !result.content && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Subject lines
                    </div>
                    {result.subject.split("\n").map((line, i) => {
                      const cleaned = line.replace(/^\d+[\).]\s*/, "").trim();
                      if (!cleaned) return null;
                      return (
                        <div key={i} className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-medium">
                          {cleaned}
                        </div>
                      );
                    })}
                  </div>
                )}
                {result.subject && result.content && (
                  <div className="mb-2 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Subject
                    </div>
                    <div className="mt-0.5 font-medium">{result.subject}</div>
                  </div>
                )}
                {result.content && (
                  <div
                    className="prose prose-xs max-w-none rounded-md text-sm leading-relaxed dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: result.content,
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
