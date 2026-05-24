import "server-only";

import { requireUser } from "@/server/auth";

function getWindowStartIso(minutes: number) {
  const ms = minutes * 60_000;
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / ms) * ms);
  return windowStart.toISOString();
}

export async function enforceRateLimit({
  action,
  maxPerMinute,
  increment = 1,
}: {
  action: string;
  maxPerMinute: number;
  increment?: number;
}) {
  const { supabase, user } = await requireUser();

  const key = `${user.id}:${action}`;
  const windowStart = getWindowStartIso(1);

  const { data, error } = await supabase.rpc("rate_limit_increment", {
    p_key: key,
    p_window_start: windowStart,
    p_increment: increment,
  });

  if (error) {
    // Fail closed for safety.
    return {
      ok: false as const,
      message: "Rate limiting unavailable",
    };
  }

  const count = typeof data === "number" ? data : Number(data);
  if (!Number.isFinite(count)) {
    return { ok: false as const, message: "Rate limiting unavailable" };
  }

  if (count > maxPerMinute) {
    return {
      ok: false as const,
      message: `Rate limit exceeded. Try again later.`,
    };
  }

  return { ok: true as const, remaining: Math.max(0, maxPerMinute - count) };
}
