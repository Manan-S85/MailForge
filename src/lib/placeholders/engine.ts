import sanitizeHtml from "sanitize-html";
import { placeholderRegex } from "@/lib/placeholders/extract";

const PLACEHOLDER_RE = placeholderRegex();

export function renderTemplateString(
  template: string,
  values: Record<string, unknown>,
): string {
  return template.replace(PLACEHOLDER_RE, (_full, rawKey: string) => {
    const key = String(rawKey ?? "").trim();
    const value = values[key];
    if (value === undefined || value === null) return "";
    // Replace into plain text context; escape any HTML.
    return sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} });
  });
}
