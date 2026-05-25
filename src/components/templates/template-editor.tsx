"use client";

import { type ReactNode, useEffect, useMemo, useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  CodeIcon,
  QuoteIcon,
  MinusIcon,
  LinkIcon,
  ImageIcon,
  TableIcon,
  Loader2Icon,
  SaveIcon,
  MonitorIcon,
  SmartphoneIcon,
  ChevronDownIcon,
  HashIcon,
  SparklesIcon,
  CheckIcon,
  UploadIcon,
} from "lucide-react";

import { updateTemplate } from "@/server/actions/templates";
import { renderPreview } from "@/server/actions/preview";
import { extractPlaceholders } from "@/lib/placeholders/extract";
import { PlaceholderHighlight } from "@/components/editor/extensions/placeholder-highlight";
import { PlaceholderSuggestion } from "@/components/editor/extensions/placeholder-suggestion";
import { AiAssistant } from "@/components/templates/ai-assistant";
import { SendTestEmail } from "@/components/templates/send-test-email";
import { useAiAssistant } from "@/hooks/use-ai";

import type { EmailLog } from "@/types";

const lowlight = createLowlight(common);

const updateSchema = z.object({
  name: z.string().min(1),
  subject: z.string(),
});

const ButtonLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-button": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-button"),
        renderHTML: (attributes) => {
          if (!attributes["data-button"]) return {};
          return { "data-button": attributes["data-button"] };
        },
      },
    };
  },
});

function safeJsonParse(input: string):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; message: string } {
  try {
    const value = JSON.parse(input || "{}");
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, message: "Mock data must be a JSON object" };
    }
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false, message: "Invalid JSON" };
  }
}

function ToolbarButton({
  onClick,
  disabled,
  active,
  children,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-7 items-center justify-center rounded-md text-sm transition-colors ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      } disabled:pointer-events-none disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

export function TemplateEditor({
  template,
  categories,
  availablePlaceholders,
  sendHistory,
}: {
  template: {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    body_json: unknown;
    status: "draft" | "active" | "archived";
    category_id: string | null;
    placeholders: string[];
    updated_at: string;
  };
  categories: Array<{ id: string; name: string }>;
  availablePlaceholders: Array<{
    id: string;
    key: string;
    description?: string | null;
    sample_value?: string | null;
  }>;
  sendHistory?: Array<Pick<EmailLog, "id" | "recipient_email" | "status" | "error" | "created_at">>;
}) {
  const [isSaving, startSaving] = useTransition();
  const [isPreviewPending, startPreview] = useTransition();

  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.body_html || "<p></p>");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    template.status,
  );
  const [categoryId, setCategoryId] = useState<string>(template.category_id ?? "");

  const [mockDataText, setMockDataText] = useState("{}");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const { execute: executeAi, isPending: isAiPending, result: aiResult, clearResult: clearAiResult } = useAiAssistant();

  const [activeDialog, setActiveDialog] = useState<'link' | 'cta' | 'image' | null>(null);
  const [dialogUrl, setDialogUrl] = useState('');
  const [dialogText, setDialogText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aiResult?.subject) {
      const lines = aiResult.subject
        .split("\n")
        .map((l) => l.replace(/^\d+[\).]\s*/, "").trim())
        .filter(Boolean);
      setSubjectSuggestions(lines);
      clearAiResult();
    }
  }, [aiResult, clearAiResult]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      TextStyle,
      Color,
      ButtonLink.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      PlaceholderHighlight,
      PlaceholderSuggestion.configure({
        placeholders: availablePlaceholders.map((p) => ({
          key: p.key,
          description: p.description,
        })),
      }),
    ],
    content: template.body_html || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "tiptap-editor prose prose-sm max-w-none focus:outline-none dark:prose-invert prose-a:underline min-h-[300px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      setBodyHtml(editor.getHTML());
    },
  });

  const usedPlaceholders = useMemo(() => {
    return extractPlaceholders(`${subject}\n${bodyHtml}`);
  }, [subject, bodyHtml]);

  useEffect(() => {
    setMockDataText((prev) => {
      const parsed = safeJsonParse(prev);
      const current = parsed.ok ? parsed.value : {};
      const next: Record<string, unknown> = {};
      let changed = false;
      for (const key of usedPlaceholders) {
        if (key in current) {
          next[key] = current[key];
        } else {
          const found = availablePlaceholders.find((p) => p.key === key);
          next[key] = found?.sample_value ?? `[${key}]`;
          changed = true;
        }
      }
      const prevKeys = Object.keys(current);
      if (prevKeys.length !== usedPlaceholders.length || changed) {
        return JSON.stringify(next, null, 2);
      }
      for (const key of prevKeys) {
        if (!usedPlaceholders.includes(key)) {
          return JSON.stringify(next, null, 2);
        }
      }
      return prev;
    });
  }, [usedPlaceholders, availablePlaceholders]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const parsed = safeJsonParse(mockDataText);
      if (!parsed.ok) {
        setPreviewError(parsed.message);
        return;
      }

      setPreviewError(null);

      startPreview(async () => {
        const res = await renderPreview({
          subject,
          bodyHtml,
          data: parsed.value,
        });
        if (!res.ok) {
          setPreviewHtml("");
          setPreviewError("Preview failed");
          return;
        }
        setPreviewHtml(res.html);
      });
    }, 350);

    return () => clearTimeout(handle);
  }, [subject, bodyHtml, mockDataText, startPreview]);

  const handleSave = () => {
    const basic = updateSchema.safeParse({ name, subject });
    if (!basic.success) {
      toast.error("Name and subject are required");
      return;
    }

    startSaving(async () => {
      const res = await updateTemplate({
        id: template.id,
        name,
        subject,
        bodyHtml,
        bodyJson: editor?.getJSON() ?? null,
        categoryId: categoryId || null,
        status,
      });

      if (!res.ok) toast.error(res.message);
      else toast.success("Saved");
    });
  };

  const mockDataParsed = useMemo(() => {
    const parsed = safeJsonParse(mockDataText);
    return parsed.ok ? parsed.value : {};
  }, [mockDataText]);

  const editorContent = editor?.getHTML() || bodyHtml;

  function handleInsertConfirm() {
    if (!editor) return;
    if (activeDialog === "link") {
      if (!dialogUrl) return;
      const text = dialogText || dialogUrl;
      editor.chain().focus().insertContent(`<a href="${dialogUrl}">${text}</a>`).run();
      setActiveDialog(null);
      setDialogUrl("");
      setDialogText("");
    } else if (activeDialog === "cta") {
      if (!dialogUrl || !dialogText) return;
      const html = `<a href="${dialogUrl}" data-button="true" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#ffffff;border-radius:6px;text-decoration:none;font-size:16px;font-weight:500;">${dialogText}</a>`;
      editor.chain().focus().insertContent(html).run();
      setActiveDialog(null);
      setDialogUrl("");
      setDialogText("");
    } else if (activeDialog === "image") {
      if (!dialogUrl) return;
      editor.chain().focus().setImage({ src: dialogUrl }).run();
      setActiveDialog(null);
      setDialogUrl("");
    }
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
      setActiveDialog(null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{name || "Untitled template"}</h1>
          <p className="text-sm text-muted-foreground">
            Draft, preview, and test-send with placeholders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AiAssistant
            templateId={template.id}
            currentContent={editorContent}
            currentSubject={subject}
            onApplyContent={(html) => {
              editor?.chain().focus().setContent(html, { emitUpdate: true }).run();
              setBodyHtml(html);
            }}
            onApplySubject={(s) => {
              setSubject(s);
            }}
          />
          <Button
            disabled={isSaving || !editor}
            onClick={handleSave}
          >
            {isSaving ? (
              <Loader2Icon className="mr-1.5 size-4 animate-spin" />
            ) : (
              <SaveIcon className="mr-1.5 size-4" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Template name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={categoryId || "__none"} onValueChange={(v) => setCategoryId(v === "__none" ? "" : v)}>
            <SelectTrigger>
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
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Subject line</Label>
          <button
            type="button"
            disabled={isAiPending}
            onClick={() => {
              setSubjectSuggestions([]);
              executeAi({
                action: "generate_subject",
                currentContent: bodyHtml,
                currentSubject: subject,
              });
            }}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {isAiPending ? (
              <Loader2Icon className="size-3 animate-spin" />
            ) : (
              <SparklesIcon className="size-3" />
            )}
            Generate with AI
          </button>
        </div>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Welcome to {{company_name}}"
        />
        {subjectSuggestions.length > 0 && (
          <div className="rounded-lg border bg-card p-2">
            <div className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Select a subject line
            </div>
            <div className="space-y-0.5">
              {subjectSuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSubject(s);
                    setSubjectSuggestions([]);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                >
                  <CheckIcon className="size-3 shrink-0 text-muted-foreground" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Editor - full width */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-card p-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={!editor}
            active={editor?.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1Icon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={!editor}
            active={editor?.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2Icon className="size-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor}
            active={editor?.isActive("bold")}
            title="Bold"
          >
            <BoldIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor}
            active={editor?.isActive("italic")}
            title="Italic"
          >
            <ItalicIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            disabled={!editor}
            active={editor?.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor}
            active={editor?.isActive("bulletList")}
            title="Bullet list"
          >
            <ListIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor}
            active={editor?.isActive("orderedList")}
            title="Ordered list"
          >
            <ListOrderedIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            disabled={!editor}
            active={editor?.isActive("blockquote")}
            title="Blockquote"
          >
            <QuoteIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            disabled={!editor}
            active={editor?.isActive("codeBlock")}
            title="Code block"
          >
            <CodeIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={!editor}
            title="Horizontal rule"
          >
            <MinusIcon className="size-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            onClick={() => {
              if (!editor) return;
              const { empty } = editor.state.selection;
              if (!empty) {
                const href = window.prompt("Link URL:", "https://");
                if (!href) return;
                editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
              } else {
                setDialogUrl("");
                setDialogText("");
                setActiveDialog("link");
              }
            }}
            disabled={!editor}
            active={editor?.isActive("link")}
            title="Insert link"
          >
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              setDialogUrl("");
              setDialogText("");
              setActiveDialog("cta");
            }}
            disabled={!editor}
            title="Insert CTA button"
          >
            <span className="text-[10px] font-bold">CTA</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              setDialogUrl("");
              setActiveDialog("image");
            }}
            disabled={!editor}
            title="Insert image"
          >
            <ImageIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              if (!editor) return;
              const cols = parseInt(window.prompt("Columns:", "3") || "3", 10);
              if (isNaN(cols) || cols < 1) return;
              const rows = parseInt(window.prompt("Rows:", "3") || "3", 10);
              if (isNaN(rows) || rows < 1) return;
              editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            }}
            disabled={!editor}
            title="Insert table"
          >
            <TableIcon className="size-4" />
          </ToolbarButton>
        </div>

        <div className="min-h-[400px] rounded-lg border bg-card">
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              Loading editor...
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Preview - full width below editor */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
          <div className="flex items-center gap-0.5 rounded-lg border bg-card p-0.5">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                previewMode === "desktop"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MonitorIcon className="size-3.5" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                previewMode === "mobile"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SmartphoneIcon className="size-3.5" />
              Mobile
            </button>
          </div>
          {isPreviewPending && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2Icon className="size-3 animate-spin" />
              Updating...
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          {previewHtml ? (
            <div className={previewMode === "mobile" ? "mx-auto w-[420px]" : "w-full"}>
              <iframe
                title="Email preview"
                className="h-[520px] w-full"
                srcDoc={previewHtml}
              />
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              {isPreviewPending ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="size-4 animate-spin" />
                  Updating preview...
                </div>
              ) : (
                "Preview will appear here"
              )}
            </div>
          )}
        </div>

        {previewError && (
          <div className="mt-1 text-xs text-destructive">{previewError}</div>
        )}
      </div>

      <Separator />

      {/* Bottom section: Placeholder values + Send test + Placeholders */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Placeholder values */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Placeholder values</span>
          </div>
          <div className="p-3">
            <Textarea
              value={mockDataText}
              onChange={(e) => setMockDataText(e.target.value)}
              className="min-h-[160px] font-mono text-xs"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Set values for placeholders used in this template
            </p>
          </div>
        </div>

        {/* Send test */}
        <SendTestEmail
          templateId={template.id}
          subject={subject}
          bodyHtml={bodyHtml}
          mockData={mockDataParsed}
          sendHistory={sendHistory ?? []}
        />

        {/* Placeholder library */}
        <div className="rounded-lg border bg-card">
          <button
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <HashIcon className="size-3.5" />
              Placeholder library
            </div>
            <ChevronDownIcon className={`size-3.5 transition-transform ${showPlaceholders ? "rotate-180" : ""}`} />
          </button>
          {showPlaceholders && (
            <div className="space-y-3 border-t p-3">
              <div>
                <div className="mb-1.5 text-xs font-medium text-foreground">Used in template</div>
                <div className="flex flex-wrap gap-1.5">
                  {usedPlaceholders.length ? (
                    usedPlaceholders.map((key) => (
                      <button
                        key={key}
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 text-xs font-mono text-secondary-foreground hover:bg-accent"
                        onClick={() => editor?.chain().focus().insertContent(`{{${key}}}`).run()}
                      >
                        {`{{${key}}}`}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None yet</span>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <div className="mb-1.5 text-xs font-medium text-foreground">Available</div>
                <div className="max-h-48 space-y-1 overflow-y-auto scrollbar-thin">
                  {availablePlaceholders.length ? (
                    availablePlaceholders.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                        onClick={() =>
                          editor?.chain().focus().insertContent(`{{${p.key}}}`).run()
                        }
                      >
                        <span className="font-mono font-medium">{p.key}</span>
                        {p.description ? (
                          <span className="ml-2 text-muted-foreground">{p.description}</span>
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Add placeholders in the database to enable autocomplete
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-lg border bg-card p-4 shadow-lg">
            <div className="mb-3 text-sm font-medium">
              {activeDialog === "link" && "Insert Link"}
              {activeDialog === "cta" && "Insert CTA Button"}
              {activeDialog === "image" && "Insert Image"}
            </div>
            {activeDialog === "link" && (
              <div className="space-y-2">
                <Input
                  placeholder="URL"
                  value={dialogUrl}
                  onChange={(e) => setDialogUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsertConfirm()}
                />
                <Input
                  placeholder="Display text (optional)"
                  value={dialogText}
                  onChange={(e) => setDialogText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsertConfirm()}
                />
              </div>
            )}
            {activeDialog === "cta" && (
              <div className="space-y-2">
                <Input
                  placeholder="Button URL"
                  value={dialogUrl}
                  onChange={(e) => setDialogUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsertConfirm()}
                />
                <Input
                  placeholder="Button text"
                  value={dialogText}
                  onChange={(e) => setDialogText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsertConfirm()}
                />
              </div>
            )}
            {activeDialog === "image" && (
              <div className="space-y-2">
                <Input
                  placeholder="Image URL"
                  value={dialogUrl}
                  onChange={(e) => setDialogUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInsertConfirm()}
                />
                <div className="relative my-2.5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon className="mr-1.5 size-4" />
                  Upload from device
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
              </div>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleInsertConfirm}>
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
