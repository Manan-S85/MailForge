import sanitizeHtml from "sanitize-html";

export const EMAIL_HTML_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "a",
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "img",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "data-button", "style", "class"],
    img: ["src", "alt", "title", "style"],
    span: ["style"],
    div: ["style"],
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    td: ["colspan", "rowspan", "style"],
    th: ["colspan", "rowspan", "style"],
    table: ["style"],
    tr: ["style"],
  },
  allowedSchemes: ["http", "https", "mailto", "data"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: true,
  // Prevent JS URLs
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

export function sanitizeEmailHtml(html: string) {
  return sanitizeHtml(html, EMAIL_HTML_SANITIZE_OPTIONS);
}
