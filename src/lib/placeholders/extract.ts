const PLACEHOLDER_RE = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;

export function extractPlaceholders(input: string): string[] {
  const keys = new Set<string>();
  for (const match of input.matchAll(PLACEHOLDER_RE)) {
    const key = match[1]?.trim();
    if (key) keys.add(key);
  }
  return [...keys].sort();
}

export function validatePlaceholders(keys: string[]):
  | { ok: true }
  | { ok: false; message: string } {
  for (const key of keys) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(key)) {
      return { ok: false, message: `Invalid placeholder key: ${key}` };
    }
  }
  return { ok: true };
}

export function placeholderRegex() {
  return PLACEHOLDER_RE;
}
