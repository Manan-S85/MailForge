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
  PanelRightOpenIcon,
  XIcon,
  PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <Button variant="outline" className="gap-2">
          <SparklesIcon className="size-4" />
          AI assistant
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5" />
            AI assistant
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden py-4">
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              <div>
                <div className="mb-2 text-sm font-medium">Quick actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((qa) => (
                    <Button
                      key={qa.action}
                      variant="outline"
                      size="sm"
                      className="h-auto justify-start gap-2 py-2 text-xs"
                      disabled={isPending}
                      onClick={() => handleAction(qa.action)}
                    >
                      <qa.icon className="size-3.5 shrink-0" />
                      <span className="truncate">{qa.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Tone</div>
                  <Select
                    value={selectedTone}
                    onValueChange={(v) => setSelectedTone(v as AiTone)}
                  >
                    <SelectTrigger>
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

                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    Custom instructions{" "}
                    <span className="text-xs text-muted-foreground">
                      (optional)
                    </span>
                  </div>
                  <Textarea
                    placeholder="e.g. Focus on the value proposition..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </div>

              <Separator />

              {isPending ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Loader2Icon className="size-6 animate-spin" />
                      AI is working...
                    </div>
                  </CardContent>
                </Card>
              ) : result ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-sm font-medium">
                      Result
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={handleApply}
                        className="gap-1"
                      >
                        <PlusIcon className="size-3.5" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearResult}
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result.subject ? (
                      <div className="mb-3 rounded-md bg-muted p-3 text-sm">
                        <div className="text-xs font-medium text-muted-foreground">
                          Subject
                        </div>
                        <div className="mt-1 font-medium">
                          {result.subject}
                        </div>
                      </div>
                    ) : null}
                    <div
                      className="prose prose-sm max-w-none rounded-md border bg-card p-3 dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: result.content,
                      }}
                    />
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
