export interface Template {
  id: string;
  owner_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_json: unknown;
  status: "draft" | "active" | "archived";
  category_id: string | null;
  placeholders: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateListItem {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "active" | "archived";
  updated_at: string;
  category: { name: string } | null;
}

export interface Category {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface Placeholder {
  id: string;
  owner_id: string;
  key: string;
  description: string | null;
  sample_value: string | null;
  created_at: string;
}

export interface EmailLog {
  id: string;
  owner_id: string;
  template_id: string | null;
  recipient_email: string;
  subject: string;
  provider: string;
  provider_message_id: string | null;
  status: "sent" | "failed";
  error: string | null;
  created_at: string;
}

export interface AiLog {
  id: string;
  owner_id: string;
  template_id: string | null;
  action: string;
  model: string | null;
  input: unknown;
  output: unknown;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
}

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

export type AiAction =
  | "generate"
  | "rewrite_tone"
  | "improve_clarity"
  | "shorten"
  | "expand"
  | "generate_cta"
  | "generate_subject"
  | "improve_engagement"
  | "fix_grammar"
  | "convert_tone";

export type AiTone =
  | "professional"
  | "friendly"
  | "persuasive"
  | "concise"
  | "onboarding"
  | "marketing";
