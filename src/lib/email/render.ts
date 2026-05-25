import { renderTemplateString } from "@/lib/placeholders/engine";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";

function withButtonStyles(html: string) {
  return html
    .replace(
      /<a([^>]*?)data-button="true"([^>]*?)>/g,
      (_m, a1, a2) =>
        `<a${a1}data-button="true"${a2} style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600;">`,
    )
    .replace(
      /<a([^>]*?)class="tiptap-cta-button"([^>]*?)>/g,
      (_m, a1, a2) =>
        `<a${a1}class="tiptap-cta-button"${a2} style="display:inline-block;padding:12px 24px;border-radius:8px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:16px;font-weight:500;">`,
    );
}

export function renderEmailHtml({
  subject,
  bodyHtml,
  data,
}: {
  subject: string;
  bodyHtml: string;
  data: Record<string, unknown>;
}) {
  const renderedSubject = renderTemplateString(subject, data);
  const safeBody = sanitizeEmailHtml(bodyHtml);
  const renderedBody = renderTemplateString(withButtonStyles(safeBody), data);

  const fullHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      img {
        max-width: 100% !important;
        height: auto !important;
        display: block;
        border-radius: 6px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
      }
      td, th {
        border: 1px solid #d1d5db;
        padding: 8px 12px;
        vertical-align: top;
      }
      th {
        background: #f3f4f6;
        font-weight: 600;
        text-align: left;
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f7f7f8;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
        ${renderedBody}
      </div>
      <div style="padding:16px 0;color:#6b7280;font-size:12px;">
        Sent via Email Template Admin
      </div>
    </div>
  </body>
</html>`;

  return { subject: renderedSubject, html: fullHtml };
}
