"use client";

import { type ReactNode, useEffect, useMemo, useState, useTransition } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
} from "lucide-react";

import { updateTemplate } from "@/server/actions/templates";
import { renderPreview } from "@/server/actions/preview";
import { extractPlaceholders } from "@/lib/placeholders/extract";
import { PlaceholderHighlight } from "@/components/editor/extensions/placeholder-highlight";
import { PlaceholderSuggestion } from "@/components/editor/extensions/placeholder-suggestion";
import { AiAssistant } from "@/components/templates/ai-assistant";
import { SendTestEmail } from "@/components/templates/send-test-email";

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
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "secondary" : "ghost"}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
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

  const initialMock = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const p of availablePlaceholders) {
      if (p.sample_value) obj[p.key] = p.sample_value;
    }
    return JSON.stringify(obj, null, 2);
  }, [availablePlaceholders]);

  const [mockDataText, setMockDataText] = useState(initialMock || "{}");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewError, setPreviewError] = useState<string | null>(null);

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
          "prose prose-sm max-w-none focus:outline-none dark:prose-invert prose-a:underline",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Edit template</h1>
          <p className="text-sm text-muted-foreground">
            Draft, preview, and test-send with placeholders.
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
              <Loader2Icon className="mr-1 size-4 animate-spin" />
            ) : null}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Template name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
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
              <div className="space-y-2 md:col-span-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Welcome to {{company_name}}"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Category</Label>
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

            <Separator />

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1 rounded-md border bg-card p-1">
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  disabled={!editor}
                  active={editor?.isActive("heading", { level: 1 })}
                >
                  <Heading1Icon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  disabled={!editor}
                  active={editor?.isActive("heading", { level: 2 })}
                >
                  <Heading2Icon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  disabled={!editor}
                  active={editor?.isActive("bold")}
                >
                  <BoldIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  disabled={!editor}
                  active={editor?.isActive("italic")}
                >
                  <ItalicIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  disabled={!editor}
                  active={editor?.isActive("underline")}
                >
                  <UnderlineIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  disabled={!editor}
                  active={editor?.isActive("bulletList")}
                >
                  <ListIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  disabled={!editor}
                  active={editor?.isActive("orderedList")}
                >
                  <ListOrderedIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  disabled={!editor}
                  active={editor?.isActive("blockquote")}
                >
                  <QuoteIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  disabled={!editor}
                  active={editor?.isActive("codeBlock")}
                >
                  <CodeIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                  disabled={!editor}
                >
                  <MinusIcon className="size-4" />
                </ToolbarButton>

                <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

                <ToolbarButton
                  onClick={() => {
                    const href = window.prompt("Link URL");
                    if (!href) return;
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href })
                      .run();
                  }}
                  disabled={!editor}
                  active={editor?.isActive("link")}
                >
                  <LinkIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    const href = window.prompt("Button URL");
                    if (!href) return;
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href, "data-button": "true" } as any)
                      .run();
                  }}
                  disabled={!editor}
                >
                  <span className="text-xs font-semibold">CTA</span>
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    const src = window.prompt("Image URL");
                    if (!src) return;
                    editor?.chain().focus().setImage({ src }).run();
                  }}
                  disabled={!editor}
                >
                  <ImageIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run();
                  }}
                  disabled={!editor}
                >
                  <TableIcon className="size-4" />
                </ToolbarButton>
              </div>

              <div className="rounded-md border p-3">
                {editor ? (
                  <EditorContent editor={editor} />
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Loading editor...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placeholders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm font-medium">Used</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {usedPlaceholders.length ? (
                  usedPlaceholders.map((key) => (
                    <Button
                      key={key}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => editor?.chain().focus().insertContent(`{{${key}}}`).run()}
                    >
                      {`{{${key}}}`}
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">None yet</div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm font-medium">Available</div>
              <div className="mt-2">
                <ScrollArea className="h-64 rounded-md border">
                  <div className="p-2">
                    {availablePlaceholders.length ? (
                      <div className="space-y-2">
                        {availablePlaceholders.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
                            onClick={() =>
                              editor?.chain().focus().insertContent(`{{${p.key}}}`).run()
                            }
                          >
                            <div className="font-medium">{p.key}</div>
                            {p.description ? (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {p.description}
                              </div>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Add placeholders in the database to enable autocomplete.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs defaultValue="desktop">
              <TabsList>
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>
              <TabsContent value="desktop">
                <div className="rounded-md border bg-white">
                  {previewHtml ? (
                    <iframe
                      title="Email preview"
                      className="h-[520px] w-full"
                      srcDoc={previewHtml}
                    />
                  ) : (
                    <div className="flex h-[520px] items-center justify-center text-sm text-muted-foreground">
                      {isPreviewPending ? (
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                      ) : (
                        "Preview will appear here"
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="mobile">
                <div className="mx-auto w-[390px] rounded-[32px] border bg-white p-3">
                  {previewHtml ? (
                    <iframe
                      title="Email preview (mobile)"
                      className="h-[640px] w-full rounded-[20px]"
                      srcDoc={previewHtml}
                    />
                  ) : (
                    <div className="flex h-[640px] items-center justify-center text-sm text-muted-foreground">
                      {isPreviewPending ? (
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                      ) : (
                        "Preview will appear here"
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {isPreviewPending ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2Icon className="size-3 animate-spin" />
                Updating preview...
              </div>
            ) : null}
            {previewError ? (
              <div className="text-xs text-destructive">{previewError}</div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mock data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={mockDataText}
                onChange={(e) => setMockDataText(e.target.value)}
                className="min-h-[320px] font-mono text-xs"
              />
              <div className="text-xs text-muted-foreground">
                Edit JSON values to preview placeholders.
              </div>
            </CardContent>
          </Card>

          <SendTestEmail
            templateId={template.id}
            subject={subject}
            bodyHtml={bodyHtml}
            mockData={mockDataParsed}
            sendHistory={sendHistory ?? []}
          />
        </div>
      </div>
    </div>
  );
}
