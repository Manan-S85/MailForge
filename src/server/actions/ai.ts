"use server";

import "server-only";

import { z } from "zod";

import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-limit";
import { getRequiredServerEnv } from "@/lib/env/server";
import type { AiAction, AiTone } from "@/types";

const FALLBACK_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "deepseek/deepseek-chat-v3-0324:free",
  "openrouter/free",
];

const toneLabels: Record<AiTone, string> = {
  professional: "professional and polished",
  friendly: "warm and approachable",
  persuasive: "compelling and action-oriented",
  concise: "short and direct",
  onboarding: "helpful and guiding",
  marketing: "engaging and promotional",
};

const actionPrompts: Record<AiAction, string> = {
  generate:
    "Write a complete email body in HTML. Use semantic tags like <p>, <h1>, <h2>, <strong>, etc.",
  rewrite_tone:
    "Rewrite the following email content to match the requested tone while preserving the core message and placeholder variables like {{variable_name}}.",
  improve_clarity:
    "Rewrite this email content to be clearer and easier to understand. Preserve all {{placeholder}} variables.",
  shorten:
    "Shorten this email content significantly while keeping the key message and all {{placeholder}} variables.",
  expand:
    "Expand this email content with more detail. Preserve all {{placeholder}} variables.",
  generate_cta:
    "Generate a compelling call-to-action button/link for this email. Return just the CTA HTML.",
  generate_subject:
    "Generate 5 short, impactful subject line options for this email. Return only the subject lines, one per line, numbered 1-5. Do NOT wrap in HTML or markdown.",
  improve_engagement:
    "Rewrite this email to improve reader engagement. Preserve all {{placeholder}} variables.",
  fix_grammar:
    "Fix grammar, spelling, and punctuation issues. Preserve all {{placeholder}} variables.",
  convert_tone:
    "Convert the tone of this email content. Preserve all {{placeholder}} variables.",
};

const schema = z.object({
  action: z.enum([
    "generate",
    "rewrite_tone",
    "improve_clarity",
    "shorten",
    "expand",
    "generate_cta",
    "generate_subject",
    "improve_engagement",
    "fix_grammar",
    "convert_tone",
  ]),
  tone: z
    .enum([
      "professional",
      "friendly",
      "persuasive",
      "concise",
      "onboarding",
      "marketing",
    ])
    .optional(),
  currentContent: z.string().optional(),
  currentSubject: z.string().optional(),
  prompt: z.string().optional(),
  templateId: z.string().optional(),
});

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenRouter ${response.status}: ${body}`,
    );
  }

  const json = await response.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";
  const usage = json.usage as
    | { prompt_tokens?: number; completion_tokens?: number }
    | undefined;

  return {
    content: content.trim(),
    tokensIn: usage?.prompt_tokens ?? null,
    tokensOut: usage?.completion_tokens ?? null,
  };
}

export async function performAiAction(
  input: z.infer<typeof schema>,
): Promise<
  | { ok: true; data: { content: string; subject?: string } }
  | { ok: false; message: string }
> {
  const values = schema.parse(input);

  let apiKey: string;
  try {
    apiKey = getRequiredServerEnv("OPENROUTER_API_KEY");
  } catch {
    return { ok: false, message: "OPENROUTER_API_KEY not configured" };
  }

  const limited = await enforceRateLimit({
    action: "ai_action",
    maxPerMinute: 20,
  });
  if (!limited.ok) {
    return { ok: false, message: limited.message };
  }

  const { supabase, user } = await requireUser();

  const tone = values.tone
    ? toneLabels[values.tone]
    : "professional";
  const actionInstruction = actionPrompts[values.action];

  const isSubjectOnly = values.action === "generate_subject";

  const systemPrompt = isSubjectOnly
    ? `You are an expert email copywriter for a SaaS company. Your task is: ${actionInstruction}
${values.tone ? `\nTone: ${tone}` : ""}
IMPORTANT: Do NOT wrap the response in markdown code blocks. Return plain text only, one subject line per line.`
    : `You are an expert email copywriter for a SaaS company. Your task is: ${actionInstruction}
${values.tone ? `\nTone: ${tone}` : ""}
IMPORTANT: Always preserve {{variable_name}} placeholders exactly as they appear.
Output valid HTML that can be rendered inside an email body.
Do not wrap the response in markdown code blocks. Return raw HTML only.`;

  const userMessages: string[] = [];
  if (values.currentSubject) {
    userMessages.push(`Current subject: "${values.currentSubject}"`);
  }
  if (values.currentContent) {
    userMessages.push(`Current email body:\n${values.currentContent}`);
  }
  if (values.prompt) {
    userMessages.push(`Additional instructions: ${values.prompt}`);
  }

  const finalUserMessage =
    userMessages.length > 0
      ? userMessages.join("\n\n")
      : "Generate a professional email template body in HTML.";

  let result: Awaited<ReturnType<typeof callOpenRouter>>;
  let modelUsed = FALLBACK_MODELS[0];
  let success = false;

  for (const model of FALLBACK_MODELS) {
    try {
      result = await callOpenRouter(apiKey, model, systemPrompt, finalUserMessage);
      modelUsed = model;
      success = true;
      break;
    } catch (err) {
      console.warn(`OpenRouter model ${model} failed:`, err);
    }
  }

  if (!success) {
    return { ok: false, message: "All AI models are currently unavailable. Try again later." };
  }

  try {
    const content = result!.content;

    let subject: string | undefined;

    if (values.action === "generate_subject") {
      subject = content;
    }

    if (values.action === "generate") {
      subject = values.currentSubject || "New Email";
    }

    // For generate_subject, return the raw subject lines as content too
    const returnContent = values.action === "generate_subject" ? "" : content;

    await supabase.from("ai_logs").insert({
      owner_id: user.id,
      template_id: values.templateId ?? null,
      action: values.action,
      model: modelUsed,
      input: {
        action: values.action,
        tone: values.tone,
        currentSubject: values.currentSubject,
        contentLength: values.currentContent?.length,
        prompt: values.prompt,
      },
      output: {
        contentLength: content.length,
        hasSubject: !!subject,
      },
      tokens_in: result!.tokensIn,
      tokens_out: result!.tokensOut,
    });

    return { ok: true, data: { content: returnContent, subject } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI request failed";
    return { ok: false, message };
  }
}

export async function fetchAiLogs(limit = 20) {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("ai_logs")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, data };
}
